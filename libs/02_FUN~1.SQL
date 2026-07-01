-- =============================================================
-- Functions / RPC
-- หัวใจของระบบ: book_tickets() จองตั๋วแบบ atomic กันการขายเกินจำนวน
-- =============================================================

-- -------------------------------------------------------------
-- helper: handle_new_user()
-- เรียกจากฝั่งแอป (หรือ NextAuth callback) เพื่อ upsert profile
-- ใช้ตอน OAuth sign-in ครั้งแรก
-- -------------------------------------------------------------
create or replace function public.upsert_profile(
  p_id         uuid,
  p_email      text,
  p_full_name  text default null,
  p_avatar_url text default null
) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  result public.profiles;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (p_id, p_email, p_full_name, p_avatar_url)
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now()
  returning * into result;
  return result;
end; $$;

-- -------------------------------------------------------------
-- book_tickets()
-- จองตั๋วแบบปลอดภัยต่อ concurrency:
--   1) ล็อกแถว ticket_type ด้วย FOR UPDATE  -> สอง request พร้อมกันจะถูกบังคับให้ทำทีละคน
--   2) ตรวจที่นั่งคงเหลือ (quantity_total - quantity_sold)
--   3) สร้าง transaction (pending) + ตั๋วรายใบพร้อม serial_no/qr_code
--   4) เพิ่ม quantity_sold (CHECK tt_not_oversold การันตีอีกชั้นว่าจะไม่เกิน)
-- คืนค่า: transaction id
-- ทุกอย่างอยู่ใน 1 transaction -> ถ้า step ไหนล้ม จะ rollback ทั้งหมด (atomic)
-- -------------------------------------------------------------
create or replace function public.book_tickets(
  p_buyer_id       uuid,
  p_ticket_type_id uuid,
  p_quantity       integer,
  p_seat_labels    text[] default null
) returns uuid
-- search_path รวม extensions ด้วย: gen_random_bytes() ของ pgcrypto อยู่สคีมา extensions ใน Supabase
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_tt          public.ticket_types;
  v_event_id    uuid;
  v_remaining   integer;
  v_txn_id      uuid;
  v_serial      text;
  v_prefix      text;
  i             integer;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'INVALID_QUANTITY: จำนวนตั๋วต้องมากกว่า 0';
  end if;

  -- (1) ล็อกแถว ticket_type — กันการจองชนกัน (race condition)
  select * into v_tt
  from public.ticket_types
  where id = p_ticket_type_id
  for update;

  if not found then
    raise exception 'TICKET_TYPE_NOT_FOUND';
  end if;

  if p_quantity > v_tt.max_per_order then
    raise exception 'EXCEEDS_MAX_PER_ORDER: จองได้สูงสุด % ใบต่อออเดอร์', v_tt.max_per_order;
  end if;

  -- (2) ตรวจที่นั่งคงเหลือ
  v_remaining := v_tt.quantity_total - v_tt.quantity_sold;
  if p_quantity > v_remaining then
    raise exception 'SOLD_OUT: เหลือที่นั่ง % ที่ แต่ขอจอง %', v_remaining, p_quantity;
  end if;

  -- event ของ ticket type นี้ (ต้องเผยแพร่แล้ว)
  v_event_id := v_tt.event_id;
  if not exists (select 1 from public.events where id = v_event_id and status = 'published') then
    raise exception 'EVENT_NOT_AVAILABLE: อีเวนต์นี้ยังไม่เปิดขาย';
  end if;

  -- (3) สร้าง transaction
  insert into public.transactions (buyer_id, event_id, status, total_amount)
  values (p_buyer_id, v_event_id, 'pending', v_tt.price * p_quantity)
  returning id into v_txn_id;

  -- prefix ของ serial = 6 ตัวแรกของ event id (ตัด '-')
  v_prefix := upper(substr(replace(v_event_id::text, '-', ''), 1, 6));

  -- (4) ออกตั๋วรายใบ — serial อิง txn id (ไม่ผูกกับ quantity_sold ที่ลดลงได้ตอน cancel
  --      มิฉะนั้นจอง→ยกเลิก→จองใหม่ จะได้ serial ซ้ำ -> ชน unique tickets_serial_no_key)
  for i in 1 .. p_quantity loop
    v_serial := v_prefix || '-' || to_char(now(), 'YYMMDD') || '-'
                || upper(substr(replace(v_txn_id::text, '-', ''), 1, 10))
                || lpad(i::text, 2, '0');

    insert into public.tickets (
      ticket_type_id, transaction_id, owner_id,
      serial_no, qr_code, seat_label, status
    ) values (
      p_ticket_type_id, v_txn_id, p_buyer_id,
      v_serial,
      encode(gen_random_bytes(16), 'hex'),
      case when p_seat_labels is not null and array_length(p_seat_labels,1) >= i
           then p_seat_labels[i] else null end,
      'reserved'
    );
  end loop;

  -- (5) เพิ่มจำนวนที่ขายแล้ว (CHECK tt_not_oversold จะ throw ถ้าเกิน)
  update public.ticket_types
  set quantity_sold = quantity_sold + p_quantity
  where id = p_ticket_type_id;

  return v_txn_id;
end; $$;

-- -------------------------------------------------------------
-- confirm_payment() — เปลี่ยนสถานะเมื่อชำระเงินสำเร็จ
-- ตั๋วทุกใบในออเดอร์เปลี่ยนเป็น 'paid'
-- -------------------------------------------------------------
create or replace function public.confirm_payment(
  p_txn_id text,
  p_payment_ref text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.transactions
  set status = 'paid', payment_ref = coalesce(p_payment_ref, payment_ref)
  where id = p_txn_id::uuid and status = 'pending';

  if not found then
    raise exception 'TXN_NOT_PENDING: ไม่พบออเดอร์ที่รอชำระเงิน';
  end if;

  update public.tickets set status = 'paid'
  where transaction_id = p_txn_id::uuid and status = 'reserved';
end; $$;

-- -------------------------------------------------------------
-- cancel_transaction() — ยกเลิกออเดอร์ + คืนโควต้าที่นั่ง
-- -------------------------------------------------------------
create or replace function public.cancel_transaction(p_txn_id text)
returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  -- คืนโควต้าตามจำนวนตั๋วของแต่ละ ticket_type ในออเดอร์
  for r in
    select ticket_type_id, count(*) as cnt
    from public.tickets
    where transaction_id = p_txn_id::uuid and status in ('reserved','paid')
    group by ticket_type_id
  loop
    update public.ticket_types
    set quantity_sold = greatest(0, quantity_sold - r.cnt)
    where id = r.ticket_type_id;
  end loop;

  update public.tickets set status = 'cancelled'
  where transaction_id = p_txn_id::uuid;

  update public.transactions set status = 'cancelled'
  where id = p_txn_id::uuid;
end; $$;

-- -------------------------------------------------------------
-- check_in_ticket() — สแกน QR หน้างาน (organizer/admin)
-- -------------------------------------------------------------
create or replace function public.check_in_ticket(p_qr text)
returns public.tickets
language plpgsql security definer set search_path = public as $$
declare v_ticket public.tickets;
begin
  select * into v_ticket from public.tickets where qr_code = p_qr for update;
  if not found then raise exception 'TICKET_NOT_FOUND'; end if;
  if v_ticket.status = 'checked_in' then raise exception 'ALREADY_CHECKED_IN'; end if;
  if v_ticket.status <> 'paid' then raise exception 'TICKET_NOT_PAID'; end if;

  update public.tickets
  set status = 'checked_in', checked_in_at = now()
  where id = v_ticket.id
  returning * into v_ticket;
  return v_ticket;
end; $$;
