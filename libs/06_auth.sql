-- =============================================================
-- 06_auth.sql — รองรับ login ด้วย Email/Password (NextAuth Credentials)
-- รันต่อจาก 01–05
-- หมายเหตุ: bcrypt hash สร้างด้วย pgcrypto (crypt + gen_salt('bf'))
--          ซึ่ง bcryptjs ฝั่ง Node เทียบรหัสผ่านได้ปกติ ($2a$)
-- =============================================================

-- ช่องเก็บรหัสผ่าน (hash) ในตาราง profiles
alter table public.profiles
  add column if not exists password_hash text;

-- -------------------------------------------------------------
-- ตั้งรหัสผ่านให้บัญชีตัวอย่าง 3 บทบาท (จาก 04_seed.sql)
-- รหัสผ่านเดียวกันทั้ง 3 บัญชี: Mankaew!2026
--   admin@example.com      -> admin
--   organizer@example.com  -> organizer
--   buyer@example.com      -> buyer
-- -------------------------------------------------------------
update public.profiles
set password_hash = crypt('Mankaew!2026', gen_salt('bf', 10))
where email in (
  'admin@example.com',
  'organizer@example.com',
  'buyer@example.com'
);

-- (ออปชัน) ตรวจสอบรหัสผ่านฝั่ง DB ก็ได้ผ่านฟังก์ชันนี้
-- ใช้เป็นทางเลือกแทน bcryptjs.compare ในแอป
create or replace function public.verify_password(p_email text, p_password text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v_profile public.profiles;
begin
  select * into v_profile from public.profiles where email = lower(p_email);
  if not found or v_profile.password_hash is null then
    return null;
  end if;
  if v_profile.password_hash = crypt(p_password, v_profile.password_hash) then
    return v_profile;
  end if;
  return null;
end; $$;
