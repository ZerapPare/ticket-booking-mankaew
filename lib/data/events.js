import "server-only";
import { supabasePublic } from "@/lib/supabase/public";
import { formatBaht } from "@/lib/format";

// หน้า browse อ่านเฉพาะข้อมูลสาธารณะ -> ใช้ anon key (RLS จำกัดเฉพาะ published)
const db = supabasePublic;

/*
  ชั้นข้อมูล (DAL) สำหรับหน้า browse ของ buyer
  คืนค่า "รูปแบบเดียวกับ lib/mock-data.js" เพื่อให้ component เดิมใช้ได้เลย
  - แสดงเฉพาะอีเวนต์ status = 'published'
*/

// สี gradient placeholder (DB ไม่มีรูป) — เลือกแบบ deterministic จาก id
const GRADS = [
  "linear-gradient(150deg,#ede9fe,#faf5ff 70%)",
  "linear-gradient(160deg,#e0edff,#f5f9ff)",
  "linear-gradient(160deg,#ffe4ec,#fff5f8)",
  "linear-gradient(160deg,#d8f5ea,#f2fcf8)",
  "linear-gradient(160deg,#fdeccd,#fff9ee)",
];

// สีประจำโซน (เรียงตามราคา มาก→น้อย)
const ZONE_COLORS = ["#7c3aed", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

export function gradientFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADS[h % GRADS.length];
}

export function thaiDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function fromPriceOf(ticketTypes) {
  const prices = (ticketTypes || []).map((t) => Number(t.price));
  return prices.length ? Math.min(...prices) : 0;
}

// แปลง 1 แถว event (พร้อม join venues/ticket_types) -> shape ของ UI
function mapEvent(e) {
  const venue = e.venues?.name ?? "";
  const fromPrice = fromPriceOf(e.ticket_types);
  return {
    id: e.id,
    title: e.title,
    date: thaiDate(e.starts_at),
    venue,
    sub: `${venue} • จาก ${formatBaht(fromPrice)}`,
    fromPrice,
    cat: e.category ?? "อีเวนต์",
    grad: gradientFor(e.id),
    desc: e.description ?? "",
  };
}

const LIST_SELECT =
  "id,title,description,category,starts_at,venues(name),ticket_types(price)";

// หน้าแรก: featured (อีเวนต์ที่ใกล้ที่สุด) + ที่เหลือเป็น upcoming
export async function getFeaturedAndUpcoming() {
  const { data, error } = await db()
    .from("events")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  const all = (data || []).map(mapEvent);
  return { featured: all[0] ?? null, upcoming: all.slice(1) };
}

// หน้ารายการอีเวนต์ทั้งหมด
export async function listPublishedEvents() {
  const { data, error } = await db()
    .from("events")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((e) => ({ ...mapEvent(e), key: e.id }));
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// หน้ารายละเอียดอีเวนต์ (+ โซน/ราคา) — คืน null ถ้าไม่พบ/id ไม่ถูกต้อง (ให้ caller เรียก notFound)
export async function getEventDetail(id) {
  if (!id || !UUID_RE.test(id)) return null;

  const { data: e, error } = await db()
    .from("events")
    .select(
      "id,title,description,category,starts_at,status,venues(name)," +
        "ticket_types(id,name,price,seating_type)"
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !e) return null;

  const zones = (e.ticket_types || [])
    .slice()
    .sort((a, b) => Number(b.price) - Number(a.price))
    .map((t, i) => ({
      id: t.id,
      name: t.name,
      price: Number(t.price),
      color: ZONE_COLORS[i % ZONE_COLORS.length],
      seatingType: t.seating_type,
    }));

  return { ...mapEvent(e), zones };
}

// ผังเก้าอี้ของโซน (ticket_type แบบ 'seated') — คืนรูปแบบเดียวกับ mock buildSeatRows
// [{ letter, seats: [{ id(uuid), num, label, taken }] }]  (taken = ไม่ available)
// hold_seats() ต้องใช้ seat id (uuid) ไม่ใช่ label
export async function getSeatMap(ticketTypeId) {
  if (!ticketTypeId || !UUID_RE.test(ticketTypeId)) return [];

  const { data, error } = await db()
    .from("seats")
    .select("id,seat_label,row_letter,seat_number,status")
    .eq("ticket_type_id", ticketTypeId)
    .order("row_letter", { ascending: true })
    .order("seat_number", { ascending: true });

  if (error) throw error;

  const byRow = new Map();
  for (const s of data || []) {
    if (!byRow.has(s.row_letter)) byRow.set(s.row_letter, []);
    byRow.get(s.row_letter).push({
      id: s.id,
      num: s.seat_number,
      label: s.seat_label,
      taken: s.status !== "available",
    });
  }
  return [...byRow.entries()].map(([letter, seats]) => ({ letter, seats }));
}