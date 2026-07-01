import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { thaiDate, gradientFor } from "@/lib/data/events";
import { formatBaht } from "@/lib/format";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

/*
  ชั้นข้อมูล (DAL) ฝั่งผู้จัดงาน — อ่านผ่าน SERVICE ROLE (bypass RLS)
  scope = organizerId (ดูเฉพาะอีเวนต์ของตัวเอง) หรือ null (แอดมิน = เห็นทั้งหมด)
  ทุกฟังก์ชันบังคับ scope เองในโค้ด (ไม่พึ่ง RLS)
*/

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ZONE_COLORS = ["#7c3aed", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

const STATUS_MAP = {
  published: { label: "กำลังขาย", color: "#16a34a", bg: "#f0fdf4" },
  draft: { label: "ร่าง", color: "#71717a", bg: "#f4f4f5" },
  pending: { label: "รออนุมัติ", color: "#f59e0b", bg: "#fffbeb" },
  completed: { label: "จบแล้ว", color: "#71717a", bg: "#f4f4f5" },
  cancelled: { label: "ยกเลิก", color: "#dc2626", bg: "#fef2f2" },
};

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

// event ids ของ organizer นี้ (null = แอดมิน, ไม่กรอง)
async function scopeEventIds(db, scope) {
  if (!scope) return null;
  const { data } = await db.from("events").select("id").eq("organizer_id", scope);
  return (data || []).map((e) => e.id);
}

// เช็คว่าอีเวนต์อยู่ใน scope ของผู้ใช้ (แอดมินผ่านหมด)
async function ownsEvent(db, eventId, scope) {
  if (!scope) return true;
  const { data } = await db
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  return !!data && data.organizer_id === scope;
}

// ---- แดชบอร์ด: สรุปยอด + กราฟ 14 วัน + ออเดอร์ล่าสุด ----
export async function getOrganizerOverview(scope) {
  const db = supabaseServer();
  const eventIds = await scopeEventIds(db, scope);

  let q = db
    .from("transactions")
    .select(
      "total_amount,created_at,profiles(full_name,email)," +
        "tickets(id,ticket_types(name))"
    )
    .eq("status", "paid")
    .order("created_at", { ascending: false });
  if (eventIds) q = q.in("event_id", eventIds);
  const { data } = await q;
  const orders = data || [];

  const gross = orders.reduce((s, t) => s + Number(t.total_amount), 0);
  const soldTickets = orders.reduce((s, t) => s + (t.tickets?.length || 0), 0);
  const net = Math.round(gross * (1 - PLATFORM_FEE_RATE));

  let eq = db
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  if (scope) eq = eq.eq("organizer_id", scope);
  const { count: activeEvents } = await eq;

  const recentOrders = orders.slice(0, 5).map((t) => {
    const name = t.profiles?.full_name || t.profiles?.email || "ผู้ใช้";
    const zone = t.tickets?.[0]?.ticket_types?.name || "บัตร";
    const qty = t.tickets?.length || 0;
    return {
      initial: name.charAt(0).toUpperCase(),
      name,
      detail: `${zone} × ${qty}`,
      amount: formatBaht(Number(t.total_amount)),
    };
  });

  const stats = [
    { label: "ยอดขายรวม", value: formatBaht(gross), delta: "รวมทุกอีเวนต์", deltaColor: "#22c55e" },
    { label: "บัตรที่ขายแล้ว", value: soldTickets.toLocaleString("en-US"), delta: "บัตรที่ชำระแล้ว", deltaColor: "#71717a" },
    { label: "อีเวนต์ที่กำลังขาย", value: String(activeEvents || 0), delta: "สถานะเผยแพร่", deltaColor: "#f59e0b" },
    { label: "รายได้สุทธิ", value: formatBaht(net), delta: `หลังหักค่าธรรมเนียม ${PLATFORM_FEE_RATE * 100}%`, deltaColor: "#71717a" },
  ];

  return { stats, chart: buildChart(orders), recentOrders };
}

function buildChart(orders) {
  const today = new Date();
  const map = new Map();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    map.set(key, 0);
    days.push({ key, label: String(d.getDate()) });
  }
  for (const t of orders) {
    const key = dayKey(new Date(t.created_at));
    if (map.has(key)) map.set(key, map.get(key) + Number(t.total_amount));
  }
  return days.map((d, i) => ({
    value: map.get(d.key),
    day: d.label,
    fill: i >= 11 ? "#7c3aed" : "#ddd6fe",
  }));
}

// ---- อีเวนต์ของฉัน (ตาราง) ----
export async function listOrganizerEvents(scope) {
  const db = supabaseServer();
  let q = db
    .from("events")
    .select(
      "id,title,status,starts_at,venues(name)," +
        "ticket_types(quantity_total,quantity_sold)"
    )
    .order("starts_at", { ascending: true });
  if (scope) q = q.eq("organizer_id", scope);
  const { data: events } = await q;
  const rows = events || [];

  const ids = rows.map((e) => e.id);
  const revByEvent = new Map();
  if (ids.length) {
    const { data: txns } = await db
      .from("transactions")
      .select("event_id,total_amount")
      .eq("status", "paid")
      .in("event_id", ids);
    for (const t of txns || [])
      revByEvent.set(
        t.event_id,
        (revByEvent.get(t.event_id) || 0) + Number(t.total_amount)
      );
  }

  return rows.map((e) => {
    const tts = e.ticket_types || [];
    const sold = tts.reduce((s, t) => s + Number(t.quantity_sold), 0);
    const cap = tts.reduce((s, t) => s + Number(t.quantity_total), 0);
    const revenue = revByEvent.get(e.id) || 0;
    const st = STATUS_MAP[e.status] || { label: e.status, color: "#71717a", bg: "#f4f4f5" };
    return {
      id: e.id,
      title: e.title,
      venue: e.venues?.name ?? "",
      date: thaiDate(e.starts_at),
      status: st.label,
      stColor: st.color,
      stBg: st.bg,
      sold,
      cap,
      pct: cap ? Math.round((sold / cap) * 100) : 0,
      soldLabel: `${sold.toLocaleString("en-US")} / ${cap.toLocaleString("en-US")}`,
      revenue,
      revenueLabel: formatBaht(revenue),
      grad: gradientFor(e.id),
    };
  });
}

// ---- รายงานต่ออีเวนต์ (ownership-checked) ----
export async function getOrganizerEventReport(eventId, scope) {
  if (!eventId || !UUID_RE.test(eventId)) return null;
  const db = supabaseServer();

  const { data: e } = await db
    .from("events")
    .select("id,title,organizer_id,ticket_types(id,name,price,quantity_total)")
    .eq("id", eventId)
    .maybeSingle();
  if (!e) return null;
  if (scope && e.organizer_id !== scope) return null;

  const tts = (e.ticket_types || [])
    .slice()
    .sort((a, b) => Number(b.price) - Number(a.price));

  // นับบัตรที่ชำระแล้ว (paid/checked_in) ต่อโซน
  const paidByType = new Map();
  if (tts.length) {
    const { data: tickets } = await db
      .from("tickets")
      .select("ticket_type_id")
      .in("status", ["paid", "checked_in"])
      .in(
        "ticket_type_id",
        tts.map((t) => t.id)
      );
    for (const tk of tickets || [])
      paidByType.set(tk.ticket_type_id, (paidByType.get(tk.ticket_type_id) || 0) + 1);
  }

  const zonesRaw = tts.map((t, i) => {
    const sold = paidByType.get(t.id) || 0;
    return {
      name: t.name,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
      sold,
      revenue: sold * Number(t.price),
    };
  });
  const maxRev = Math.max(...zonesRaw.map((z) => z.revenue), 1);
  const revenue = zonesRaw.reduce((s, z) => s + z.revenue, 0);
  const sold = zonesRaw.reduce((s, z) => s + z.sold, 0);
  const cap = tts.reduce((s, t) => s + Number(t.quantity_total), 0);

  return {
    event: {
      title: e.title,
      revenue,
      sold,
      cap,
      net: Math.round(revenue * (1 - PLATFORM_FEE_RATE)),
    },
    zones: zonesRaw.map((z) => ({
      ...z,
      pct: Math.round((z.revenue / maxRev) * 100),
      soldLabel: `${z.sold.toLocaleString("en-US")} ใบ`,
      revenueLabel: formatBaht(z.revenue),
    })),
  };
}

// ---- ตัวเลือกอีเวนต์ (สำหรับ picker) + อีเวนต์เริ่มต้น (ใกล้ที่สุด) ----
export async function listEventOptions(scope) {
  const db = supabaseServer();
  let q = db
    .from("events")
    .select("id,title,starts_at")
    .order("starts_at", { ascending: true });
  if (scope) q = q.eq("organizer_id", scope);
  const { data } = await q;
  return (data || []).map((e) => ({ id: e.id, title: e.title }));
}

export async function getDefaultEventId(scope) {
  const db = supabaseServer();
  const nowIso = new Date().toISOString();
  let q = db
    .from("events")
    .select("id")
    .eq("status", "published")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(1);
  if (scope) q = q.eq("organizer_id", scope);
  const { data } = await q;
  if (data?.[0]) return data[0].id;

  // fallback: อีเวนต์ล่าสุดที่มี
  let q2 = db
    .from("events")
    .select("id")
    .order("starts_at", { ascending: false })
    .limit(1);
  if (scope) q2 = q2.eq("organizer_id", scope);
  const r2 = await q2;
  return r2.data?.[0]?.id ?? null;
}

// ---- ผู้เข้างาน (จัดกลุ่มตามออเดอร์ที่ชำระแล้ว) ----
export async function listAttendees(eventId, scope) {
  if (!eventId || !UUID_RE.test(eventId)) return [];
  const db = supabaseServer();
  if (!(await ownsEvent(db, eventId, scope))) return [];

  const { data: txns } = await db
    .from("transactions")
    .select("id,profiles(full_name,email),tickets(serial_no,status,ticket_types(name))")
    .eq("event_id", eventId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  return (txns || []).map((t) => {
    const name = t.profiles?.full_name || t.profiles?.email || "ผู้ใช้";
    const tickets = t.tickets || [];
    const allIn = tickets.length > 0 && tickets.every((k) => k.status === "checked_in");
    return {
      initial: name.charAt(0).toUpperCase(),
      name,
      email: t.profiles?.email || "",
      order: tickets[0]?.serial_no || t.id.slice(0, 8),
      qty: tickets.length,
      zone: tickets[0]?.ticket_types?.name || "-",
      status: allIn ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน",
      ok: allIn,
      stColor: allIn ? "#16a34a" : "#a1a1aa",
      stBg: allIn ? "#f0fdf4" : "#f4f4f5",
    };
  });
}

// ---- เช็คอิน: จำนวน + รายการล่าสุด ----
export async function getCheckinData(eventId, scope) {
  const empty = { checkedIn: 0, total: 0, recent: [] };
  if (!eventId || !UUID_RE.test(eventId)) return empty;
  const db = supabaseServer();
  if (!(await ownsEvent(db, eventId, scope))) return empty;

  const { data: tickets } = await db
    .from("tickets")
    .select(
      "serial_no,status,checked_in_at,ticket_types!inner(name,event_id),profiles(full_name)"
    )
    .eq("ticket_types.event_id", eventId)
    .in("status", ["paid", "checked_in"]);

  const all = tickets || [];
  const recent = all
    .filter((t) => t.status === "checked_in" && t.checked_in_at)
    .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at))
    .slice(0, 7)
    .map((t) => ({
      name: t.profiles?.full_name || "ผู้เข้างาน",
      zone: t.ticket_types?.name || "-",
      serial: t.serial_no,
      time: fmtTime(t.checked_in_at),
    }));

  return {
    checkedIn: all.filter((t) => t.status === "checked_in").length,
    total: all.length,
    recent,
  };
}
