-- =============================================================
-- 08_admin.sql — ตารางที่ฝั่ง Admin ต้องใช้ (ยังไม่มีใน schema เดิม)
--   - สถานะ 'pending' ของ events (รอแอดมินอนุมัติ)
--   - payouts (การโอนเงินให้ผู้จัดงาน)
--   - refunds (คำขอคืนเงิน)
-- รันต่อจาก 07
--
-- ⚠️ หมายเหตุ: 'ALTER TYPE ... ADD VALUE' รันรวมใน transaction กับคำสั่งอื่น
--    ไม่ได้ในบางรุ่น ถ้า SQL Editor ฟ้อง ให้รันบรรทัด alter type แยกก่อน
-- =============================================================

-- เพิ่มสถานะ 'pending' (รออนุมัติ) ให้ enum event_status
do $$ begin
  alter type event_status add value if not exists 'pending';
exception when others then null; end $$;

-- =============================================================
-- payouts — การโอนเงินรายได้สุทธิให้ผู้จัดงานต่ออีเวนต์
-- =============================================================
create table if not exists public.payouts (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references public.events(id) on delete set null,
  organizer_id  uuid references public.profiles(id) on delete set null,
  net_amount    numeric(12,2) not null default 0 check (net_amount >= 0),
  due_at        date,
  status        text not null default 'pending'
                  check (status in ('pending', 'paid', 'locked')),
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_payouts_status    on public.payouts(status);
create index if not exists idx_payouts_organizer on public.payouts(organizer_id);

-- =============================================================
-- refunds — คำขอคืนเงินของผู้ซื้อ
-- =============================================================
create table if not exists public.refunds (
  id              uuid primary key default gen_random_uuid(),
  transaction_id  uuid references public.transactions(id) on delete set null,
  buyer_id        uuid references public.profiles(id) on delete set null,
  event_id        uuid references public.events(id) on delete set null,
  amount          numeric(10,2) not null default 0 check (amount >= 0),
  reason          text,
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'denied')),
  requested_at    timestamptz not null default now(),
  resolved_at     timestamptz
);
create index if not exists idx_refunds_status on public.refunds(status);
create index if not exists idx_refunds_buyer  on public.refunds(buyer_id);

-- =============================================================
-- RLS — เปิด (ปฏิเสธ anon โดยปริยาย); เข้าถึงผ่าน server/service role เท่านั้น
-- =============================================================
alter table public.payouts enable row level security;
alter table public.refunds enable row level security;

-- updated_at ไม่มีในสองตารางนี้ จึงไม่ต้องผูก trigger set_updated_at
