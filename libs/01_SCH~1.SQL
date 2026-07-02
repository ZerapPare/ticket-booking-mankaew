-- =============================================================
-- Event Ticket Booking & Management — Database Schema
-- Target: Supabase (PostgreSQL 15+)
-- Run order: 01_schema.sql -> 02_functions.sql -> 03_rls.sql -> 04_seed.sql
-- =============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- =============================================================
-- ENUMS
-- =============================================================
do $$ begin
  create type user_role as enum ('admin', 'organizer', 'buyer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('reserved', 'paid', 'checked_in', 'cancelled');
exception when duplicate_object then null; end $$;

-- =============================================================
-- profiles  (user table — NOT counted in the "5 custom tables")
-- 1 row per authenticated user. Holds RBAC role.
-- id mirrors the user id created by NextAuth.
-- =============================================================
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  role        user_role not null default 'buyer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- 1) venues  (สถานที่จัดงาน + ความจุที่นั่ง)
-- =============================================================
create table if not exists public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  capacity    integer not null check (capacity > 0),
  map_url     text,
  image_url   text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- 2) events  (ข้อมูลคอนเสิร์ต/กิจกรรม)
--    venue 1 --- M events   |   organizer (profile) 1 --- M events
-- =============================================================
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  venue_id     uuid references public.venues(id) on delete restrict,
  title        text not null,
  description  text,
  poster_url   text,
  category     text,
  status       event_status not null default 'draft',
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint events_time_valid check (ends_at is null or ends_at >= starts_at)
);
create index if not exists idx_events_organizer on public.events(organizer_id);
create index if not exists idx_events_venue     on public.events(venue_id);
create index if not exists idx_events_status     on public.events(status);

-- =============================================================
-- 3) ticket_types  (ประเภทตั๋ว VIP/Regular + ราคา + โควต้า)
--    event 1 --- M ticket_types
--    quantity_total = โควต้าทั้งหมด, quantity_sold = ขายไปแล้ว
--    ที่นั่งคงเหลือ = quantity_total - quantity_sold (บังคับด้วย CHECK)
-- =============================================================
create table if not exists public.ticket_types (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  name            text not null,                      -- เช่น VIP, Regular, Early Bird
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  quantity_total  integer not null check (quantity_total >= 0),
  quantity_sold   integer not null default 0 check (quantity_sold >= 0),
  max_per_order   integer not null default 4 check (max_per_order > 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint tt_not_oversold check (quantity_sold <= quantity_total),
  constraint tt_name_unique_per_event unique (event_id, name)
);
create index if not exists idx_ticket_types_event on public.ticket_types(event_id);

-- =============================================================
-- 4) transactions  (ประวัติการซื้อ + สถานะชำระเงิน)
--    buyer (profile) 1 --- M transactions
--    1 transaction = 1 ออเดอร์ (มีได้หลายใบตั๋ว)
-- =============================================================
create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references public.profiles(id) on delete cascade,
  event_id       uuid not null references public.events(id) on delete restrict,
  status         transaction_status not null default 'pending',
  total_amount   numeric(10,2) not null default 0 check (total_amount >= 0),
  payment_ref    text,                               -- เลขอ้างอิงการชำระเงิน
  payment_slip_url text,                             -- รูปหลักฐานการโอน (Supabase Storage)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_transactions_buyer on public.transactions(buyer_id);
create index if not exists idx_transactions_event on public.transactions(event_id);
create index if not exists idx_transactions_status on public.transactions(status);

-- =============================================================
-- 5) tickets  (ตั๋วรายใบ + Serial Number)
--    ticket_type 1 --- M tickets
--    transaction 1 --- M tickets  (Many tickets per order)
--    serial_no สร้างอัตโนมัติด้วย trigger
-- =============================================================
create table if not exists public.tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_type_id  uuid not null references public.ticket_types(id) on delete restrict,
  transaction_id  uuid not null references public.transactions(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  serial_no       text unique not null,
  seat_label      text,                              -- เช่น A12 (ออปชัน reserved seating)
  qr_code         text unique,                       -- token สำหรับเช็คหน้างาน
  status          ticket_status not null default 'reserved',
  checked_in_at   timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_tickets_type on public.tickets(ticket_type_id);
create index if not exists idx_tickets_txn  on public.tickets(transaction_id);
create index if not exists idx_tickets_owner on public.tickets(owner_id);

-- =============================================================
-- 6) notifications  (สำหรับ Supabase Realtime — bonus)
--    profile 1 --- M notifications
-- =============================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- =============================================================
-- updated_at trigger (ใช้ร่วมหลายตาราง)
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','venues','events','ticket_types','transactions']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;
