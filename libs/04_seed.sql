-- =============================================================
-- Seed data (ตัวอย่างสำหรับทดสอบ)
-- =============================================================

-- ---- profiles ----
insert into public.profiles (id, email, full_name, role) values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.com',     'Platform Admin', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'organizer@example.com', 'Live Nation TH', 'organizer'),
  ('33333333-3333-4333-8333-333333333333', 'buyer@example.com',     'Somchai Buyer',  'buyer')
on conflict (id) do nothing;

-- ---- venues ----
insert into public.venues (id, name, capacity, created_by) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Impact Arena', 12000,
   '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Thunder Dome', 5000,
   '22222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

-- ---- events ----
insert into public.events (id, organizer_id, venue_id, title, description, category, status, starts_at) values
  ('bbbbbbbb-0000-4000-8000-000000000001',
   '22222222-2222-4222-8222-222222222222',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'Summer Sonic Bangkok 2026', 'เทศกาลดนตรีกลางแจ้งสุดยิ่งใหญ่', 'Concert', 'published',
   now() + interval '30 days'),
  ('bbbbbbbb-0000-4000-8000-000000000002',
   '22222222-2222-4222-8222-222222222222',
   'aaaaaaaa-0000-4000-8000-000000000002',
   'Tech Conf TH 2026', 'งานสัมมนาเทคโนโลยีประจำปี', 'Conference', 'pending',
   now() + interval '60 days')
on conflict (id) do nothing;

-- ---- ticket_types ----
insert into public.ticket_types (id, event_id, name, price, quantity_total, max_per_order) values
  ('cccccccc-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', 'VIP',     5500.00, 200, 4),
  ('cccccccc-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000001', 'Regular', 2500.00, 2000, 6),
  ('cccccccc-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000001', 'Early Bird', 1800.00, 500, 4)
on conflict (id) do nothing;
