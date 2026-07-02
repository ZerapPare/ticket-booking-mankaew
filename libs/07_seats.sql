-- =============================================================
-- 07_seats.sql — ระบบที่นั่งรายตัว + ล็อกกันแย่งซ้ำ (หัวใจของระบบ)
-- รันต่อจาก 06
--
-- โมเดล:
--   ticket_types.seating_type = 'seated' (มีผังเก้าอี้) | 'ga' (ยืน/จองตามจำนวน)
--   ตาราง seats เก็บเก้าอี้รายตัว: available -> held (จองค้าง 10 นาที) -> sold
--   hold_seats()  จองที่นั่งแบบ atomic (ล็อกแถว FOR UPDATE กันชนกัน)
--   release_expired_seats()  คืนที่นั่งที่ค้างเกินเวลา + ยกเลิกออเดอร์
--   confirm_payment()/cancel_transaction()  อัปเดต seats ตามผลการชำระ/ยกเลิก
-- =============================================================

-- ---- เพิ่มฟิลด์ผังที่นั่งให้ ticket_types ----
alter table public.ticket_types
  add column if not exists seating_type text not null default 'seated'
    check (seating_type in ('seated', 'ga')),
  add column if not exists seat_rows integer,
  add column if not exists seat_cols integer;

-- ---- เวลาถือบัตร (hold) ของออเดอร์ ----
alter table public.transactions
  add column if not exists hold_expires_at timestamptz;

-- =============================================================
-- ตาราง seats — 1 แถว = 1 เก้าอี้
-- =============================================================
create table if not exists public.seats (
  id              uuid primary key default gen_random_uuid(),
  ticket_type_id  uuid not null references public.ticket_types(id) on delete cascade,
  seat_label      text not null,                 -- เช่น 'A-5'
  row_letter      text not null,
  seat_number     integer not null,
  status          text not null default 'available'
                    check (status in ('available', 'held', 'sold')),
  held_by         uuid references public.profiles(id) on delete set null,
  hold_expires_at timestamptz,
  ticket_id       uuid references public.tickets(id) on delete set null,
  created_at      timestamptz not null default now(),
  constraint seats_label_unique unique (ticket_type_id, seat_label)
);
create index if not exists idx_seats_type   on public.seats(ticket_type_id);
create index if not exists idx_seats_status on public.seats(ticket_type_id, status);

-- =============================================================
-- generate_seats() — สร้างเก้าอี้ตาม seat_rows x seat_cols ของ ticket_type
-- เรียกตอนสร้างโซน (seated)
-- =============================================================
create or replace function public.generate_seats(p_ticket_type_id uuid)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_tt    public.ticket_types;
  r       integer;
  c       integer;
  v_letter text;
  v_count  integer := 0;
begin
  select * into v_tt from public.ticket_types where id = p_ticket_type_id;
  if not found then raise exception 'TICKET_TYPE_NOT_FOUND'; end if;
  if v_tt.seating_type <> 'seated' or v_tt.seat_rows is null or v_tt.seat_cols is null then
    return 0; -- โซนยืน (ga) ไม่ต้องมีเก้าอี้
  end if;

  for r in 0 .. v_tt.seat_rows - 1 loop
    v_letter := chr(65 + r);                 -- A, B, C, ...
    for c in 1 .. v_tt.seat_cols loop
      insert into public.seats (ticket_type_id, seat_label, row_letter, seat_number)
      values (p_ticket_type_id, v_letter || '-' || c, v_letter, c)
      on conflict (ticket_type_id, seat_label) do nothing;
      v_count := v_count + 1;
    end loop;
  end loop;
  return v_count;
end; $$;

-- =============================================================
-- release_expired_seats() — คืนที่นั่งของออเดอร์ที่ค้างเกินเวลา hold
-- เรียก lazy ภายใน hold_seats() และ/หรือให้แอปเรียกเป็นระยะ
-- =============================================================
create or replace function public.release_expired_seats()
returns integer
language plpgsql security definer set search_path = public as $$
declare v_count integer := 0;
begin
  -- 1) คืนเก้าอี้ของออเดอร์ pending ที่หมดเวลา
  update public.seats s
  set status = 'available', held_by = null, hold_expires_at = null, ticket_id = null
  from public.tickets tk
  join public.transactions t on t.id = tk.transaction_id
  where s.ticket_id = tk.id
    and t.status = 'pending'
    and t.hold_expires_at is not null
    and t.hold_expires_at < now();

  -- 2) คืนโควต้า quantity_sold
  update public.ticket_types tt
  set quantity_sold = greatest(0, tt.quantity_sold - x.cnt)
  from (
    select tk.ticket_type_id, count(*) as cnt
    from public.tickets tk
    join public.transactions t on t.id = tk.transaction_id
    where t.status = 'pending'
      and t.hold_expires_at is not null
      and t.hold_expires_at < now()
    group by tk.ticket_type_id
  ) x
  where tt.id = x.ticket_type_id;

  -- 3) ยกเลิกตั๋ว + ออเดอร์
  update public.tickets tk
  set status = 'cancelled'
  from public.transactions t
  where tk.transaction_id = t.id
    and t.status = 'pending'
    and t.hold_expires_at is not null
    and t.hold_expires_at < now();

  with cancelled as (
    update public.transactions
    set status = 'cancelled', hold_expires_at = null
    where status = 'pending'
      and hold_expires_at is not null
      and hold_expires_at < now()
    returning 1
  )
  select count(*) into v_count from cancelled;

  return v_count;
end; $$;

-- =============================================================
-- hold_seats() — จองที่นั่งรายตัวแบบ atomic
--   1) ล้างที่นั่งหมดเวลา
--   2) ล็อกแถวเก้าอี้ที่เลือก (FOR UPDATE) -> สอง request พร้อมกันทำทีละคน
--   3) ตรวจว่าทุกตัว 'available' และอยู่อีเวนต์เดียวกัน (published)
--   4) สร้าง transaction (pending, hold 10 นาที) + ออกตั๋วต่อเก้าอี้ + mark held
--   5) เพิ่ม quantity_sold
-- คืนค่า: transaction id
-- =============================================================
create or replace function public.hold_seats(
  p_buyer_id uuid,
  p_seat_ids uuid[]
) returns uuid
-- search_path รวม extensions ด้วย: gen_random_bytes() ของ pgcrypto อยู่สคีมา extensions ใน Supabase
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_event_id uuid;
  v_txn_id   uuid;
  v_total    numeric(10,2) := 0;
  v_prefix   text;
  v_serial   text;
  r          record;
  i          integer := 0;
begin
  if p_seat_ids is null or array_length(p_seat_ids, 1) is null then
    raise exception 'NO_SEATS: ยังไม่ได้เลือกที่นั่ง';
  end if;
  if array_length(p_seat_ids, 1) > 8 then
    raise exception 'EXCEEDS_MAX_PER_ORDER: จองได้สูงสุด 8 ที่นั่งต่อออเดอร์';
  end if;

  perform public.release_expired_seats();

  -- ล็อก + ตรวจสอบเก้าอี้ทั้งหมด
  for r in
    select s.id, s.seat_label, s.status, tt.price, tt.event_id
    from public.seats s
    join public.ticket_types tt on tt.id = s.ticket_type_id
    where s.id = any(p_seat_ids)
    order by s.id
    for update of s
  loop
    if r.status <> 'available' then
      raise exception 'SEAT_TAKEN: ที่นั่ง % ไม่ว่างแล้ว', r.seat_label;
    end if;
    if v_event_id is null then
      v_event_id := r.event_id;
    elsif v_event_id <> r.event_id then
      raise exception 'MIXED_EVENTS: เลือกข้ามอีเวนต์ไม่ได้';
    end if;
    v_total := v_total + r.price;
  end loop;

  if v_event_id is null then
    raise exception 'SEATS_NOT_FOUND';
  end if;
  if not exists (select 1 from public.events where id = v_event_id and status = 'published') then
    raise exception 'EVENT_NOT_AVAILABLE: อีเวนต์นี้ยังไม่เปิดขาย';
  end if;

  -- สร้างออเดอร์ pending + ตั้งเวลา hold 10 นาที
  insert into public.transactions (buyer_id, event_id, status, total_amount, hold_expires_at)
  values (p_buyer_id, v_event_id, 'pending', v_total, now() + interval '10 minutes')
  returning id into v_txn_id;

  v_prefix := upper(substr(replace(v_event_id::text, '-', ''), 1, 6));

  -- ออกตั๋วต่อเก้าอี้ + mark held
  for r in
    select s.id, s.seat_label, s.ticket_type_id
    from public.seats s
    where s.id = any(p_seat_ids)
  loop
    i := i + 1;
    -- serial เป็น UUID (RFC 4122 v4) ไม่ซ้ำโดยธรรมชาติ
    v_serial := gen_random_uuid()::text;

    with ins as (
      insert into public.tickets (
        ticket_type_id, transaction_id, owner_id,
        serial_no, qr_code, seat_label, status
      ) values (
        r.ticket_type_id, v_txn_id, p_buyer_id,
        v_serial, encode(gen_random_bytes(16), 'hex'), r.seat_label, 'reserved'
      )
      returning id
    )
    update public.seats
    set status = 'held',
        held_by = p_buyer_id,
        hold_expires_at = now() + interval '10 minutes',
        ticket_id = (select id from ins)
    where id = r.id;

    update public.ticket_types
    set quantity_sold = quantity_sold + 1
    where id = r.ticket_type_id;
  end loop;

  return v_txn_id;
end; $$;

-- =============================================================
-- redefine confirm_payment() — เพิ่มการตั้งเก้าอี้เป็น 'sold'
-- =============================================================
create or replace function public.confirm_payment(
  p_txn_id text,
  p_payment_ref text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.transactions
  set status = 'paid',
      payment_ref = coalesce(p_payment_ref, payment_ref),
      hold_expires_at = null
  where id = p_txn_id::uuid and status = 'pending';

  if not found then
    raise exception 'TXN_NOT_PENDING: ไม่พบออเดอร์ที่รอชำระเงิน';
  end if;

  update public.tickets set status = 'paid'
  where transaction_id = p_txn_id::uuid and status = 'reserved';

  update public.seats s
  set status = 'sold', hold_expires_at = null
  from public.tickets tk
  where s.ticket_id = tk.id and tk.transaction_id = p_txn_id::uuid;
end; $$;

-- =============================================================
-- redefine cancel_transaction() — เพิ่มการคืนเก้าอี้เป็น 'available'
-- =============================================================
create or replace function public.cancel_transaction(p_txn_id text)
returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in
    select ticket_type_id, count(*) as cnt
    from public.tickets
    where transaction_id = p_txn_id::uuid and status in ('reserved', 'paid')
    group by ticket_type_id
  loop
    update public.ticket_types
    set quantity_sold = greatest(0, quantity_sold - r.cnt)
    where id = r.ticket_type_id;
  end loop;

  update public.seats s
  set status = 'available', held_by = null, hold_expires_at = null, ticket_id = null
  from public.tickets tk
  where s.ticket_id = tk.id and tk.transaction_id = p_txn_id::uuid;

  update public.tickets set status = 'cancelled' where transaction_id = p_txn_id::uuid;
  update public.transactions set status = 'cancelled', hold_expires_at = null where id = p_txn_id::uuid;
end; $$;

-- =============================================================
-- RLS + Realtime สำหรับ seats
-- อ่านสาธารณะเฉพาะเก้าอี้ของอีเวนต์ที่ published (ฝั่ง client โชว์ผังสด)
-- เขียนทำผ่าน RPC/service role เท่านั้น
-- =============================================================
alter table public.seats enable row level security;

drop policy if exists "public read seats of published" on public.seats;
create policy "public read seats of published" on public.seats
  for select to anon, authenticated
  using (exists (
    select 1
    from public.ticket_types tt
    join public.events e on e.id = tt.event_id
    where tt.id = seats.ticket_type_id and e.status = 'published'
  ));

do $$ begin
  alter publication supabase_realtime add table public.seats;
exception when duplicate_object then null; end $$;
