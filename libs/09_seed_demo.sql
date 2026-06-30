-- =============================================================
-- 09_seed_demo.sql — ข้อมูลตัวอย่างให้เว็บดูมีของ (รันต่อจาก 08)
--   - อีเวนต์ NEON NIGHTS (published) + โซน VIP(ยืน)/A/B/C/D(มีเก้าอี้) + generate_seats
--   - อีเวนต์ INDIE SUNSET (pending) สำหรับหน้าอนุมัติของแอดมิน
--   - ตัวอย่าง payout (รอโอน) + refund (รอพิจารณา)
--   - ปรับ ticket_types ของ Summer Sonic (จาก 04_seed) เป็นโซนยืน 'ga'
-- ปลอดภัยต่อการรันซ้ำ (on conflict do nothing / where not exists)
-- =============================================================

-- โซนของ Summer Sonic (04_seed) ตั้งเป็นยืน เพื่อให้จองตามจำนวนได้เลย
update public.ticket_types
set seating_type = 'ga'
where event_id = 'bbbbbbbb-0000-0000-0000-000000000001';

-- =============================================================
-- อีเวนต์ NEON NIGHTS BANGKOK 2026 (published)
-- =============================================================
insert into public.events (id, organizer_id, venue_id, title, description, category, status, starts_at)
values (
  'dddddddd-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'NEON NIGHTS BANGKOK 2026',
  'ค่ำคืนแห่ง T-Pop ครั้งใหญ่ที่สุดของปี รวมศิลปินและวงดนตรีชั้นนำกว่า 12 วง บนเวทีเดียวกัน ประตูเปิด 17:00 น. การแสดงเริ่ม 19:00 น.',
  'เทศกาล', 'published', now() + interval '45 days'
)
on conflict (id) do nothing;

-- ---- โซน (ticket_types) ----
-- VIP STANDING = ยืน (ga) | ZONE A–D = มีเก้าอี้ (seated, quantity_total = rows*cols)
insert into public.ticket_types
  (id, event_id, name, price, quantity_total, max_per_order, seating_type, seat_rows, seat_cols)
values
  ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'VIP STANDING', 4500, 200, 8, 'ga',      null, null),
  ('eeeeeeee-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000001', 'ZONE A',       3500,  70, 8, 'seated',    5,   14),
  ('eeeeeeee-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000001', 'ZONE B',       2500,  96, 8, 'seated',    6,   16),
  ('eeeeeeee-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000001', 'ZONE C',       1800, 108, 8, 'seated',    6,   18),
  ('eeeeeeee-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0000-000000000001', 'ZONE D',       1500, 126, 8, 'seated',    7,   18)
on conflict (id) do nothing;

-- ---- สร้างเก้าอี้ให้โซนที่นั่ง (idempotent: generate_seats ใช้ on conflict do nothing) ----
select public.generate_seats('eeeeeeee-0000-0000-0000-000000000002');
select public.generate_seats('eeeeeeee-0000-0000-0000-000000000003');
select public.generate_seats('eeeeeeee-0000-0000-0000-000000000004');
select public.generate_seats('eeeeeeee-0000-0000-0000-000000000005');

-- =============================================================
-- อีเวนต์รออนุมัติ (pending) — โผล่ในหน้า "อนุมัติอีเวนต์" ของแอดมิน
-- =============================================================
insert into public.events (id, organizer_id, venue_id, title, description, category, status, starts_at)
values (
  'dddddddd-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-0000-0000-0000-000000000002',
  'INDIE SUNSET FEST', 'เทศกาลดนตรีอินดี้ริมทะเล', 'เทศกาล', 'pending', now() + interval '90 days'
)
on conflict (id) do nothing;

-- =============================================================
-- ตัวอย่าง payout (รอโอนให้ผู้จัดงาน)
-- =============================================================
insert into public.payouts (id, event_id, organizer_id, net_amount, due_at, status)
select
  '99999999-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  3980000, (now() + interval '14 days')::date, 'pending'
where not exists (select 1 from public.payouts where id = '99999999-0000-0000-0000-000000000001');

-- =============================================================
-- ตัวอย่าง refund (รอพิจารณา) จากผู้ซื้อ
-- =============================================================
insert into public.refunds (id, buyer_id, event_id, amount, reason, status)
select
  '88888888-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  'dddddddd-0000-0000-0000-000000000001',
  5120, 'ติดธุระกะทันหัน', 'pending'
where not exists (select 1 from public.refunds where id = '88888888-0000-0000-0000-000000000001');
