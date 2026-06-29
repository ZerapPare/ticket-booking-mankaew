-- =============================================================
-- Row Level Security (RLS)
-- สถาปัตยกรรม: แอปยืนยันตัวตนด้วย NextAuth (ไม่ใช่ Supabase Auth)
--   - ฝั่ง server ใช้ SERVICE ROLE key  -> bypass RLS โดยอัตโนมัติ
--     (สิทธิ์ตามบทบาทถูกบังคับใน API route + middleware ของ Next.js)
--   - ฝั่ง client ใช้ ANON key  -> ถูก RLS จำกัดให้อ่านได้เฉพาะข้อมูลสาธารณะ
--     (รายการอีเวนต์ที่ published, จำนวนที่นั่งคงเหลือ — สำหรับ Realtime)
-- หลักการ: เปิด RLS ทุกตาราง = ปฏิเสธทั้งหมดโดยปริยาย แล้วค่อยเปิดเฉพาะที่จำเป็น
-- =============================================================

alter table public.profiles      enable row level security;
alter table public.venues        enable row level security;
alter table public.events        enable row level security;
alter table public.ticket_types  enable row level security;
alter table public.transactions  enable row level security;
alter table public.tickets       enable row level security;
alter table public.notifications enable row level security;

-- ---- Public (anon) read: เฉพาะอีเวนต์ที่เผยแพร่แล้ว ----
drop policy if exists "public read published events" on public.events;
create policy "public read published events" on public.events
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public read venues" on public.venues;
create policy "public read venues" on public.venues
  for select to anon, authenticated using (true);

-- ticket_types ของอีเวนต์ที่เผยแพร่แล้ว (ใช้โชว์ราคา + ที่นั่งคงเหลือแบบ realtime)
drop policy if exists "public read ticket_types of published" on public.ticket_types;
create policy "public read ticket_types of published" on public.ticket_types
  for select to anon, authenticated
  using (exists (
    select 1 from public.events e
    where e.id = ticket_types.event_id and e.status = 'published'
  ));

-- ตารางอื่น (profiles, transactions, tickets, notifications):
-- ไม่มี policy สำหรับ anon/authenticated  -> ปฏิเสธทั้งหมด
-- การเข้าถึงทำผ่าน server (service role) + ตรวจสิทธิ์ในโค้ดเท่านั้น

-- =============================================================
-- เปิด Realtime (Postgres Changes) สำหรับตารางที่ต้องการ live update
-- ticket_types  -> จำนวนที่นั่งคงเหลือเปลี่ยนแบบสด
-- =============================================================
do $$ begin
  alter publication supabase_realtime add table public.ticket_types;
exception when duplicate_object then null; end $$;
