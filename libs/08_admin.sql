-- =============================================================
-- 08_admin.sql — ส่วนเสริมที่ฝั่ง Admin ต้องใช้
--   - สถานะ 'pending' ของ events (รอแอดมินอนุมัติ)
-- รันต่อจาก 07
--
-- ⚠️ หมายเหตุ: 'ALTER TYPE ... ADD VALUE' รันรวมใน transaction กับคำสั่งอื่น
--    ไม่ได้ในบางรุ่น ถ้า SQL Editor ฟ้อง ให้รันบรรทัด alter type แยกก่อน
-- =============================================================

-- เพิ่มสถานะ 'pending' (รออนุมัติ) ให้ enum event_status
do $$ begin
  alter type event_status add value if not exists 'pending';
exception when others then null; end $$;