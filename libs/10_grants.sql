-- =============================================================
-- 10_grants.sql — ให้สิทธิ์อ่านระดับตารางแก่ role สาธารณะ
-- รันต่อจาก 09
--
-- ทำไมต้องมี: ไฟล์ 03_rls.sql สร้าง "policy" ให้ anon อ่านได้ก็จริง
-- แต่ PostgreSQL ต้องมี GRANT SELECT ระดับตารางก่อน (policy อย่างเดียวไม่พอ)
-- มิฉะนั้น anon จะโดนปฏิเสธตั้งแต่ระดับ privilege (error 42501 permission denied)
--
-- ความปลอดภัย: RLS ใน 03/07 ยังกรองแถวอยู่ — เปิดให้เห็นเฉพาะข้อมูลสาธารณะ
-- (อีเวนต์ที่ published, venues, ticket_types/seats ของอีเวนต์ที่เปิดขาย)
-- ตาราง profiles/transactions/tickets/payouts/refunds ไม่ถูก grant ให้ anon
-- จึงเข้าได้ผ่าน server (service role) เท่านั้น
-- =============================================================

grant usage on schema public to anon, authenticated;

grant select on
  public.events,
  public.venues,
  public.ticket_types,
  public.seats
to anon, authenticated;

-- =============================================================
-- service_role (กุญแจ server) ต้องมีสิทธิ์เต็มทุกตาราง/sequence/function
-- บาง Supabase project ไม่ได้ grant ให้อัตโนมัติ -> server query โดน 42501 ทุกตาราง
-- (service_role ใช้ฝั่ง server เท่านั้น จึงให้สิทธิ์เต็มได้)
-- =============================================================
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- เผื่อ object ที่สร้างใหม่ภายหลัง
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
