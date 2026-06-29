// Mock data for the Organizer dashboard (UI only).
// TODO: replace with real Supabase queries (events, ticket_types, tickets,
// transactions, profiles) + check_in_ticket RPC when wiring the backend.

export const ORG_PROFILE = {
  initial: "N",
  name: "Nimbus Live Co.",
  role: "ผู้จัดงาน",
};

export const ORG_NAV = [
  { href: "/organizer", icon: "▦", label: "แดชบอร์ด" },
  { href: "/organizer/events", icon: "🗓", label: "อีเวนต์ของฉัน" },
  { href: "/organizer/create", icon: "＋", label: "สร้างอีเวนต์" },
  { href: "/organizer/report", icon: "📊", label: "รายงานยอดขาย" },
  { href: "/organizer/checkin", icon: "✓", label: "เช็คอินหน้างาน" },
  { href: "/organizer/attendees", icon: "👥", label: "ผู้เข้างาน" },
];

export const ORG_STATS = [
  { label: "ยอดขายรวม", value: "฿4.29M", delta: "▲ 12.4% จากสัปดาห์ก่อน", deltaColor: "#22c55e" },
  { label: "บัตรที่ขายแล้ว", value: "3,142", delta: "63% ของความจุ", deltaColor: "#71717a" },
  { label: "อีเวนต์ที่กำลังขาย", value: "3", delta: "1 รอบพรีเซลกำลังจะปิด", deltaColor: "#f59e0b" },
  { label: "รายได้สุทธิ", value: "฿3.98M", delta: "หลังหักค่าธรรมเนียม", deltaColor: "#71717a" },
];

const RAW_SALES = [42, 55, 38, 61, 72, 90, 68, 75, 110, 98, 120, 140, 125, 160];
const DAYS = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"];
export const ORG_CHART = RAW_SALES.map((value, i) => ({
  value,
  day: DAYS[i],
  fill: i >= 11 ? "#7c3aed" : "#ddd6fe",
}));

export const ORG_RECENT_ORDERS = [
  { initial: "พ", name: "พิมพ์ชนก ว.", detail: "VIP STANDING × 2", amount: "฿9,120" },
  { initial: "ธ", name: "ธนกฤต ส.", detail: "ZONE A × 1", amount: "฿3,560" },
  { initial: "อ", name: "อรณิชา ก.", detail: "ZONE B × 4", amount: "฿10,240" },
  { initial: "K", name: "Kevin L.", detail: "ZONE C × 2", amount: "฿3,720" },
  { initial: "ม", name: "มนัสนันท์ ป.", detail: "VIP STANDING × 1", amount: "฿4,560" },
];

export const ORG_EVENTS = [
  { title: "NEON NIGHTS BANGKOK 2026", venue: "IMPACT Arena เมืองทอง", date: "14 ก.พ. 2026", status: "กำลังขาย", stColor: "#16a34a", stBg: "#f0fdf4", sold: 3142, cap: 5000, grad: "linear-gradient(150deg,#ede9fe,#faf5ff)" },
  { title: "MIDNIGHT CITY TOUR", venue: "Thunder Dome", date: "15 มี.ค. 2026", status: "กำลังขาย", stColor: "#16a34a", stBg: "#f0fdf4", sold: 920, cap: 2500, grad: "linear-gradient(160deg,#e0edff,#f5f9ff)" },
  { title: "WONDER FIELD FEST", venue: "เขาใหญ่", date: "19 เม.ย. 2026", status: "ร่าง", stColor: "#71717a", stBg: "#f4f4f5", sold: 0, cap: 8000, grad: "linear-gradient(160deg,#fdeccd,#fff9ee)" },
  { title: "LUKTHUNG LEGENDS NIGHT", venue: "ธันเดอร์โดม", date: "12 ธ.ค. 2025", status: "จบแล้ว", stColor: "#71717a", stBg: "#f4f4f5", sold: 2400, cap: 2400, grad: "linear-gradient(160deg,#e5e5e5,#f5f5f5)" },
].map((e) => ({
  ...e,
  pct: Math.round((e.sold / e.cap) * 100),
  soldLabel: `${e.sold.toLocaleString("en-US")} / ${e.cap.toLocaleString("en-US")}`,
}));

// Create-event wizard
export const ORG_WIZARD_ZONES = [
  { name: "VIP STANDING", price: "4,500", cap: "500", color: "#7c3aed" },
  { name: "ZONE A", price: "3,500", cap: "800", color: "#3b82f6" },
  { name: "ZONE B", price: "2,500", cap: "1,000", color: "#ec4899" },
  { name: "ZONE C", price: "1,800", cap: "1,400", color: "#10b981" },
  { name: "ZONE D", price: "1,500", cap: "1,300", color: "#f59e0b" },
];

export const ORG_WIZARD_ROUNDS = [
  { name: "รอบพรีเซล (Pre-sale)", window: "1 ก.พ. 10:00 — 3 ก.พ. 23:59", quota: "1,000 ใบ", on: true, icon: "★", iconBg: "#f5f3ff", iconFg: "#7c3aed" },
  { name: "รอบขายทั่วไป (General)", window: "5 ก.พ. 10:00 เป็นต้นไป", quota: "ไม่จำกัด", on: true, icon: "◉", iconBg: "#f0fdf4", iconFg: "#16a34a" },
];

// Sales report
export const ORG_ZONE_SALES = [
  ["VIP STANDING", "#7c3aed", 468, 500, "฿2,106,000"],
  ["ZONE A", "#3b82f6", 712, 800, "฿2,492,000"],
  ["ZONE B", "#ec4899", 640, 1000, "฿1,600,000"],
  ["ZONE C", "#10b981", 880, 1400, "฿1,584,000"],
  ["ZONE D", "#f59e0b", 442, 1300, "฿663,000"],
].map(([name, color, sold, cap, revenue]) => ({
  name,
  color,
  pct: Math.round((sold / cap) * 100),
  soldLabel: `${sold}/${cap}`,
  revenue,
}));

// Check-in
export const ORG_BASE_CHECKINS = [
  { name: "พิมพ์ชนก วงศ์ไพศาล", zone: "VIP STANDING", id: "MKW-2026-4821", time: "19:42" },
  { name: "Kevin Larsson", zone: "ZONE A", id: "MKW-2026-4820", time: "19:41" },
  { name: "ธนกฤต สุขสมบูรณ์", zone: "ZONE C", id: "MKW-2026-4818", time: "19:40" },
  { name: "อรณิชา การะเกตุ", zone: "ZONE B", id: "MKW-2026-4815", time: "19:39" },
  { name: "มนัสนันท์ ปิ่นทอง", zone: "VIP STANDING", id: "MKW-2026-4811", time: "19:38" },
];

export const ORG_ATTENDEES = [
  { initial: "พ", name: "พิมพ์ชนก วงศ์ไพศาล", email: "pim.w@email.com", order: "MKW-2026-4821", qty: 2, zone: "VIP STANDING", status: "เช็คอินแล้ว", ok: true },
  { initial: "ธ", name: "ธนกฤต สุขสมบูรณ์", email: "tng.s@email.com", order: "MKW-2026-4818", qty: 1, zone: "ZONE C", status: "เช็คอินแล้ว", ok: true },
  { initial: "อ", name: "อรณิชา การะเกตุ", email: "ora.k@email.com", order: "MKW-2026-4815", qty: 4, zone: "ZONE B", status: "ยังไม่เช็คอิน", ok: false },
  { initial: "K", name: "Kevin Larsson", email: "kevin.l@email.com", order: "MKW-2026-4820", qty: 2, zone: "ZONE A", status: "เช็คอินแล้ว", ok: true },
  { initial: "ม", name: "มนัสนันท์ ปิ่นทอง", email: "manas.p@email.com", order: "MKW-2026-4811", qty: 1, zone: "VIP STANDING", status: "เช็คอินแล้ว", ok: true },
  { initial: "ว", name: "วริศรา เจริญสุข", email: "waris.j@email.com", order: "MKW-2026-4805", qty: 3, zone: "ZONE D", status: "ยังไม่เช็คอิน", ok: false },
  { initial: "S", name: "Somchai T.", email: "somchai.t@email.com", order: "MKW-2026-4799", qty: 2, zone: "ZONE C", status: "ยังไม่เช็คอิน", ok: false },
].map((a) => ({
  ...a,
  stColor: a.ok ? "#16a34a" : "#a1a1aa",
  stBg: a.ok ? "#f0fdf4" : "#f4f4f5",
}));
