// Mock data for the Admin console (UI only).
// TODO: payouts / refunds / event-approval have NO tables in the current schema
// (libs/01_schema.sql). These are placeholder datasets — add migrations + wire to
// Supabase later. Users come from `profiles`, approvals could map to event_status.

export const ADMIN_PROFILE = {
  initial: "A",
  name: "Admin",
  role: "ผู้ดูแลแพลตฟอร์ม",
  dark: true,
};

// nav hrefs (badges injected live from AdminProvider)
export const ADMIN_NAV = [
  { href: "/admin", icon: "▦", label: "ภาพรวม", badgeKey: null },
  { href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้", badgeKey: null },
  { href: "/admin/approvals", icon: "✓", label: "อนุมัติอีเวนต์", badgeKey: "approvals" },
  { href: "/admin/finance", icon: "฿", label: "การเงิน", badgeKey: null },
  { href: "/admin/refunds", icon: "↩", label: "คำขอคืนเงิน", badgeKey: "refunds" },
];

const RAW_GMV = [28, 31, 26, 38, 42, 55, 48, 52, 61, 58, 70, 82, 76, 95];
const DAYS = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"];
export const ADMIN_CHART = RAW_GMV.map((value, i) => ({
  value,
  day: DAYS[i],
  fill: i >= 11 ? "#7c3aed" : "#ddd6fe",
}));

export const ADMIN_USER_TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "buyer", label: "ผู้ซื้อ" },
  { id: "organizer", label: "ผู้จัดงาน" },
];

export const ADMIN_USERS = [
  { initial: "พ", name: "พิมพ์ชนก วงศ์ไพศาล", email: "pim.w@email.com", role: "ผู้ซื้อ", joined: "มี.ค. 2024", activity: "24 คำสั่งซื้อ", status: "ปกติ", ok: true },
  { initial: "N", name: "Nimbus Live Co.", email: "contact@nimbuslive.co", role: "ผู้จัดงาน", joined: "ม.ค. 2023", activity: "12 อีเวนต์", status: "ยืนยันแล้ว", ok: true },
  { initial: "ธ", name: "ธนกฤต สุขสมบูรณ์", email: "tng.s@email.com", role: "ผู้ซื้อ", joined: "ก.ค. 2025", activity: "3 คำสั่งซื้อ", status: "ปกติ", ok: true },
  { initial: "W", name: "Wave Entertainment", email: "hello@wave-ent.com", role: "ผู้จัดงาน", joined: "พ.ค. 2024", activity: "5 อีเวนต์", status: "รอตรวจสอบ", ok: false },
  { initial: "อ", name: "อรณิชา การะเกตุ", email: "ora.k@email.com", role: "ผู้ซื้อ", joined: "ก.พ. 2026", activity: "1 คำสั่งซื้อ", status: "ปกติ", ok: true },
  { initial: "S", name: "Somchai T.", email: "somchai.t@email.com", role: "ผู้ซื้อ", joined: "ธ.ค. 2024", activity: "8 คำสั่งซื้อ", status: "ระงับชั่วคราว", ok: null },
  { initial: "B", name: "Blue Note BKK", email: "book@bluenote.th", role: "ผู้จัดงาน", joined: "ก.ย. 2023", activity: "9 อีเวนต์", status: "ยืนยันแล้ว", ok: true },
];

export const ADMIN_APPROVALS = [
  { id: "a1", title: "INDIE SUNSET FEST", cat: "เทศกาล", date: "24 พ.ค. 2026", venue: "หัวหิน ประจวบฯ", cap: "6,000", organizer: "Sunset Collective", submitted: "2 ชม. ที่แล้ว", grad: "linear-gradient(160deg,#fdeccd,#fff9ee)" },
  { id: "a2", title: "BANGKOK METAL STORM", cat: "คอนเสิร์ต", date: "08 มิ.ย. 2026", venue: "Thunder Dome", cap: "2,500", organizer: "Loud House", submitted: "5 ชม. ที่แล้ว", grad: "linear-gradient(160deg,#e5e5e5,#f5f5f5)" },
  { id: "a3", title: "CITY POP REVIVAL", cat: "คอนเสิร์ต", date: "21 มิ.ย. 2026", venue: "UOB Live", cap: "4,000", organizer: "Nimbus Live Co.", submitted: "1 วันที่แล้ว", grad: "linear-gradient(160deg,#e0edff,#f5f9ff)" },
];

export const ADMIN_PAYOUTS = [
  { id: "p1", event: "NEON NIGHTS BANGKOK 2026", org: "Nimbus Live Co.", amount: "฿3,980,000", due: "18 ก.พ. 2026", status: "รอโอน", paid: false },
  { id: "p2", event: "MIDNIGHT CITY TOUR", org: "Nimbus Live Co.", amount: "฿1,640,000", due: "20 มี.ค. 2026", status: "รอโอน", paid: false },
  { id: "p3", event: "K-WAVE FESTIVAL", org: "Wave Entertainment", amount: "฿5,200,000", due: "รอจบงาน", status: "รอจบงาน", paid: false, locked: true },
  { id: "p4", event: "LUKTHUNG LEGENDS NIGHT", org: "Heritage Sound", amount: "฿2,180,000", due: "15 ธ.ค. 2025", status: "โอนแล้ว", paid: true },
  { id: "p5", event: "BANGKOK JAZZ & SOUL", org: "Blue Note BKK", amount: "฿1,420,000", due: "10 ม.ค. 2026", status: "โอนแล้ว", paid: true },
];

export const ADMIN_REFUNDS = [
  { id: "r1", initial: "ส", name: "สิริพร ม.", order: "MKW-2026-4102", event: "NEON NIGHTS", detail: "ZONE B × 2", reason: "ติดธุระกะทันหัน", amount: "฿5,120", requested: "วันนี้", state: "pending" },
  { id: "r2", initial: "J", name: "James W.", order: "MKW-2026-3980", event: "MIDNIGHT CITY TOUR", detail: "ZONE A × 1", reason: "ซื้อซ้ำซ้อน", amount: "฿3,560", requested: "เมื่อวาน", state: "pending" },
  { id: "r3", initial: "ก", name: "กิตติพงษ์ ร.", order: "MKW-2026-3845", event: "NEON NIGHTS", detail: "VIP × 1", reason: "งานเลื่อน", amount: "฿4,560", requested: "2 วันที่แล้ว", state: "pending" },
  { id: "r4", initial: "น", name: "นภัสสร อ.", order: "MKW-2026-3712", event: "WONDER FIELD FEST", detail: "ZONE C × 3", reason: "เดินทางไม่ได้", amount: "฿5,580", requested: "3 วันที่แล้ว", state: "approved" },
];

export function userView(u) {
  const isOrg = u.role === "ผู้จัดงาน";
  return {
    ...u,
    avBg: isOrg ? "#18181b" : "#ede9fe",
    avFg: isOrg ? "#fff" : "#7c3aed",
    roleColor: isOrg ? "#7c3aed" : "#3f3f46",
    roleBg: isOrg ? "#f5f3ff" : "#f4f4f5",
    stColor: u.ok === true ? "#16a34a" : u.ok === false ? "#d97706" : "#dc2626",
    stBg: u.ok === true ? "#f0fdf4" : u.ok === false ? "#fffbeb" : "#fef2f2",
  };
}
