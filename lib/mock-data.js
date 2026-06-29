// Mock data for the Ticket Buyer experience.
// NOTE: This is UI/reference data only. In production these come from Supabase
// (events, ticket_types, venues) — see libs/01_schema.sql.

export const FEE_PER_SEAT = 60; // ค่าธรรมเนียมระบบต่อที่นั่ง
export const HOLD_SECONDS = 600; // เวลาถือบัตร 10:00
export const MAX_SEATS = 8; // เลือกได้สูงสุด 8 ที่นั่ง
export const QUEUE_TOTAL = 1247; // ลำดับคิวเริ่มต้น (mock)

export const FEATURED_ID = "neon";

export const EVENTS = [
  {
    id: "neon",
    title: "NEON NIGHTS BANGKOK 2026",
    date: "14 ก.พ. 2026",
    venue: "IMPACT Arena เมืองทอง",
    sub: "IMPACT Arena • จาก ฿1,500",
    fromPrice: 1500,
    cat: "เทศกาล",
    grad: "linear-gradient(150deg,#ede9fe,#faf5ff 70%)",
    featured: true,
    desc: "ค่ำคืนแห่ง T-Pop ครั้งใหญ่ที่สุดของปี รวมศิลปินและวงดนตรีชั้นนำกว่า 12 วง บนเวทีเดียวกัน พร้อมระบบแสง สี เสียงระดับเวิลด์คลาส และเซอร์ไพรส์พิเศษตลอดทั้งคืน ประตูเปิด 17:00 น. การแสดงเริ่ม 19:00 น.",
  },
  {
    id: "midnight",
    title: "MIDNIGHT CITY TOUR",
    date: "15 มี.ค. 2026",
    venue: "Thunder Dome เมืองทอง",
    sub: "Thunder Dome • จาก ฿900",
    fromPrice: 900,
    cat: "คอนเสิร์ต",
    grad: "linear-gradient(160deg,#e0edff,#f5f9ff)",
    desc: "ทัวร์คอนเสิร์ตกลางดึกที่พาคุณท่องเมืองผ่านบทเพลง รวมเพลงฮิตตลอดทศวรรษในค่ำคืนเดียว",
  },
  {
    id: "kwave",
    title: "K-WAVE FESTIVAL",
    date: "22 มี.ค. 2026",
    venue: "ราชมังคลากีฬาสถาน",
    sub: "ราชมังคลาฯ • จาก ฿1,800",
    fromPrice: 1800,
    cat: "เทศกาล",
    grad: "linear-gradient(160deg,#ffe4ec,#fff5f8)",
    desc: "เทศกาล K-Pop ที่ยิ่งใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ พบศิลปินไอดอลตัวจริงบนเวที",
  },
  {
    id: "jazz",
    title: "BANGKOK JAZZ & SOUL",
    date: "05 เม.ย. 2026",
    venue: "UOB Live",
    sub: "UOB Live • จาก ฿1,200",
    fromPrice: 1200,
    cat: "คอนเสิร์ต",
    grad: "linear-gradient(160deg,#d8f5ea,#f2fcf8)",
    desc: "ค่ำคืนแห่งแจ๊สและโซลกับศิลปินระดับตำนาน บรรยากาศอบอุ่นเป็นกันเอง",
  },
  {
    id: "wonder",
    title: "WONDER FIELD FEST",
    date: "19 เม.ย. 2026",
    venue: "เขาใหญ่ นครราชสีมา",
    sub: "เขาใหญ่ • จาก ฿2,500",
    fromPrice: 2500,
    cat: "เทศกาล",
    grad: "linear-gradient(160deg,#fdeccd,#fff9ee)",
    desc: "เทศกาลดนตรีกลางทุ่งท่ามกลางธรรมชาติเขาใหญ่ สองวันเต็มกับศิลปินกว่า 30 ชีวิต",
  },
];

export const FEATURED = EVENTS.find((e) => e.id === FEATURED_ID);

// อีเวนต์ที่กำลังจะมา (ไม่รวม featured) — ใช้ในกริดหน้า Home
export const UPCOMING = EVENTS.filter((e) => !e.featured);

export function getEvent(id) {
  return EVENTS.find((e) => e.id === id) || null;
}

// ----- Zones (ใช้ร่วมกันทุกอีเวนต์ใน mock) -----
export const ZONES = [
  { id: "vip", name: "VIP STANDING", price: 4500, color: "#7c3aed", avail: "ว่างมาก", level: "ok", rows: 4, cols: 12 },
  { id: "a", name: "ZONE A", price: 3500, color: "#3b82f6", avail: "ว่างมาก", level: "ok", rows: 5, cols: 14 },
  { id: "b", name: "ZONE B", price: 2500, color: "#ec4899", avail: "เหลือน้อย", level: "warn", rows: 6, cols: 16 },
  { id: "c", name: "ZONE C", price: 1800, color: "#10b981", avail: "ว่างมาก", level: "ok", rows: 6, cols: 18 },
  { id: "d", name: "ZONE D", price: 1500, color: "#f59e0b", avail: "ใกล้เต็ม", level: "low", rows: 7, cols: 18 },
];

export function getZone(id) {
  return ZONES.find((z) => z.id === id) || null;
}

export function availColor(level) {
  return level === "ok" ? "#22c55e" : level === "warn" ? "#f59e0b" : "#ef4444";
}

const SEAT_LETTERS = "ABCDEFGHIJ";

// Build the per-seat grid for a zone.
// "taken" is deterministic (matches the reference design) so the same seat is
// always shown unavailable. In production this comes from the DB seat lock state.
export function buildSeatRows(zoneId) {
  const zone = getZone(zoneId);
  if (!zone) return [];
  const seed = zoneId.charCodeAt(0);
  const rows = [];
  for (let r = 0; r < zone.rows; r++) {
    const seats = [];
    for (let c = 1; c <= zone.cols; c++) {
      const id = `${SEAT_LETTERS[r]}-${c}`;
      const taken = (r * 7 + c * 13 + seed) % 9 < 2;
      seats.push({ id, num: c, taken });
    }
    rows.push({ letter: SEAT_LETTERS[r], seats });
  }
  return rows;
}

export const LINEUP = [
  "THE WHALES",
  "VELVET RAIN",
  "NOVA SEVEN",
  "MIDNIGHT BUS",
  "PASTEL GHOST",
  "SIAM ELECTRIC",
  "LUNA & THE TIDE",
  "NEON YOUTH",
];

export const EVENT_FILTERS = ["ทั้งหมด", "คอนเสิร์ต", "เทศกาล", "กีฬา", "โชว์", "สัปดาห์นี้"];
