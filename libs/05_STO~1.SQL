-- =============================================================
-- Supabase Storage — bucket สำหรับรูป (โปสเตอร์/สลิป/โปรไฟล์)
-- รันใน SQL Editor หลังสร้างตารางแล้ว
-- (หรือสร้าง bucket ผ่านหน้า Dashboard -> Storage ก็ได้)
-- =============================================================

-- สร้าง bucket แบบ public อ่านได้ (เขียนผ่าน server/service-role เท่านั้น)
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- อ่านสาธารณะ (โชว์รูปได้)
drop policy if exists "public read event-images" on storage.objects;
create policy "public read event-images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'event-images');

-- การอัปโหลด/ลบทำผ่าน service role (API /api/upload) ซึ่ง bypass RLS อยู่แล้ว
-- จึงไม่ต้องเปิด insert policy ให้ anon
