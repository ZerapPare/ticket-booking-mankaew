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
-- ตาราง profiles/transactions/tickets/payouts ไม่ถูก grant ให้ anon
-- จึงเข้าได้ผ่าน server (service role) เท่านั้น
-- =============================================================

grant usage on schema public to anon, authenticated;

grant select on
  public.events,
  public.venues,
  public.ticket_types,
  public.seats
to anon, authenticated;
