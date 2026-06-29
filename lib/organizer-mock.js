// Mock data for the Organizer dashboard (UI only).
// TODO: replace with real Supabase queries (events, ticket_types, tickets,
// transactions, profiles) + check_in_ticket RPC when wiring the backend.

import { formatBaht } from "@/lib/format";

export const ORG_PROFILE = {
  initial: "N",
  name: "Nimbus Live Co.",
  role: "ผู้จัดงาน",
};

export const ORG_NAV = [
  { href: "/organizer", icon: "▦", label: "แดชบอร์ด" },
  { href: "/organizer/events", icon: "🗓", label: "อีเวนต์ของฉัน" },
  { href: "/organizer/create", icon: "＋", label: "สร้างอีเวนต์" },
  { href: "/organizer/checkin", icon: "✓", label: "เช็คอินหน้างาน" },
  { href: "/organizer/attendees", icon: "👥", label: "ผู้เข้างาน" },
];

// ค่าธรรมเนียมแพลตฟอร์มที่หักจากยอดขายรวม → ได้รายได้สุทธิของผู้จัดงาน
export const PLATFORM_FEE_RATE = 0.07; // 7%

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

// revenue = ยอดขายรวม (gross) ของแต่ละอีเวนต์ (ใช้ทั้งแดชบอร์ดและหน้ารายงานต่ออีเวนต์)
// หน้ารายงานกระจาย revenue นี้ออกเป็นรายโซนผ่าน zoneBreakdownFor()
export const ORG_EVENTS = [
  { id: "neon", title: "NEON NIGHTS BANGKOK 2026", venue: "IMPACT Arena เมืองทอง", date: "14 ก.พ. 2026", status: "กำลังขาย", stColor: "#16a34a", stBg: "#f0fdf4", sold: 3142, cap: 5000, revenue: 8445000, grad: "linear-gradient(150deg,#ede9fe,#faf5ff)" },
  { id: "midnight", title: "MIDNIGHT CITY TOUR", venue: "Thunder Dome", date: "15 มี.ค. 2026", status: "กำลังขาย", stColor: "#16a34a", stBg: "#f0fdf4", sold: 920, cap: 2500, revenue: 1288000, grad: "linear-gradient(160deg,#e0edff,#f5f9ff)" },
  { id: "wonder", title: "WONDER FIELD FEST", venue: "เขาใหญ่", date: "19 เม.ย. 2026", status: "ร่าง", stColor: "#71717a", stBg: "#f4f4f5", sold: 0, cap: 8000, revenue: 0, grad: "linear-gradient(160deg,#fdeccd,#fff9ee)" },
  { id: "lukthung", title: "LUKTHUNG LEGENDS NIGHT", venue: "ธันเดอร์โดม", date: "12 ธ.ค. 2025", status: "จบแล้ว", stColor: "#71717a", stBg: "#f4f4f5", sold: 2400, cap: 2400, revenue: 3600000, grad: "linear-gradient(160deg,#e5e5e5,#f5f5f5)" },
].map((e) => ({
  ...e,
  pct: Math.round((e.sold / e.cap) * 100),
  soldLabel: `${e.sold.toLocaleString("en-US")} / ${e.cap.toLocaleString("en-US")}`,
  revenueLabel: formatBaht(e.revenue),
}));

// ----- ยอดรวมของแดชบอร์ด (คำนวณจาก ORG_EVENTS ให้ตรงกับตาราง/รายงาน) -----
export const ORG_TOTAL_GROSS = ORG_EVENTS.reduce((s, e) => s + e.revenue, 0);
export const ORG_TOTAL_SOLD = ORG_EVENTS.reduce((s, e) => s + e.sold, 0);
export const ORG_TOTAL_CAP = ORG_EVENTS.reduce((s, e) => s + e.cap, 0);
export const ORG_SELLING_COUNT = ORG_EVENTS.filter(
  (e) => e.status === "กำลังขาย"
).length;
export const ORG_TOTAL_NET = Math.round(ORG_TOTAL_GROSS * (1 - PLATFORM_FEE_RATE));

export const ORG_STATS = [
  {
    label: "ยอดขายรวม",
    value: formatBaht(ORG_TOTAL_GROSS),
    delta: "▲ 12.4% จากสัปดาห์ก่อน",
    deltaColor: "#22c55e",
  },
  {
    label: "บัตรที่ขายแล้ว",
    value: ORG_TOTAL_SOLD.toLocaleString("en-US"),
    delta: `${Math.round((ORG_TOTAL_SOLD / ORG_TOTAL_CAP) * 100)}% ของความจุ`,
    deltaColor: "#71717a",
  },
  {
    label: "อีเวนต์ที่กำลังขาย",
    value: String(ORG_SELLING_COUNT),
    delta: "1 รอบพรีเซลกำลังจะปิด",
    deltaColor: "#f59e0b",
  },
  {
    label: "รายได้สุทธิ",
    value: formatBaht(ORG_TOTAL_NET),
    delta: `หลังหักค่าธรรมเนียม ${PLATFORM_FEE_RATE * 100}%`,
    deltaColor: "#71717a",
  },
];

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

// Sales report — find one organizer event by id
export function getOrgEvent(id) {
  return ORG_EVENTS.find((e) => e.id === id) || null;
}

// สัดส่วนยอดขายต่อโซน (รวม = 100%) — ใช้กระจายรายได้ของอีเวนต์ออกเป็นรายโซน
// ตั้งให้ใกล้เคียงสัดส่วนจริงของ NEON (VIP/A/B/C/D)
const ZONE_SPLIT = [
  { name: "VIP STANDING", color: "#7c3aed", price: 4500, share: 0.25 },
  { name: "ZONE A", color: "#3b82f6", price: 3500, share: 0.295 },
  { name: "ZONE B", color: "#ec4899", price: 2500, share: 0.189 },
  { name: "ZONE C", color: "#10b981", price: 1800, share: 0.188 },
  { name: "ZONE D", color: "#f59e0b", price: 1500, share: 0.078 },
];

// ยอดขายแยกตามโซนของอีเวนต์หนึ่ง — รวมแล้วเท่ากับ event.revenue เสมอ
export function zoneBreakdownFor(event) {
  const rows = ZONE_SPLIT.map((z) => {
    const revenue = Math.round(event.revenue * z.share);
    return { name: z.name, color: z.color, revenue, sold: Math.round(revenue / z.price) };
  });
  const maxRev = Math.max(...rows.map((r) => r.revenue), 1);
  return rows.map((r) => ({
    ...r,
    pct: Math.round((r.revenue / maxRev) * 100), // bar = เทียบกับโซนที่ขายดีสุด
    soldLabel: `${r.sold.toLocaleString("en-US")} ใบ`,
    revenueLabel: formatBaht(r.revenue),
  }));
}

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
