// แมปอีเมล -> บทบาท (role) สำหรับผู้ใช้ใหม่ (เช่น login Google ครั้งแรก)
// ผู้ใช้ที่มี profile ใน DB อยู่แล้วจะใช้ role จาก profiles.role เป็นหลัก
function parseList(s) {
  return (s || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

export function roleForEmail(email) {
  const e = (email || "").toLowerCase();
  if (parseList(process.env.ADMIN_EMAILS).includes(e)) return "admin";
  if (parseList(process.env.ORGANIZER_EMAILS).includes(e)) return "organizer";
  return "buyer";
}
