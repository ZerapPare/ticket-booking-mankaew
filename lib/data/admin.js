import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { thaiDate, gradientFor } from "@/lib/data/events";
import { formatBaht } from "@/lib/format";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

/*
  ชั้นข้อมูล (DAL) ฝั่งแอดมิน — อ่านผ่าน SERVICE ROLE (bypass RLS)
  แอดมินเห็นข้อมูลทั้งระบบ (ไม่มี scope) — สิทธิ์ถูกบังคับที่ app/admin/layout.jsx
*/

const ROLE_LABEL = {
  admin: "ผู้ดูแล",
  organizer: "ผู้จัดงาน",
  buyer: "ผู้ซื้อ",
};

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// "เมื่อสักครู่" / "x ชม. ที่แล้ว" / "x วันที่แล้ว"
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "เมื่อสักครู่" : `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชม. ที่แล้ว`;
  return `${Math.floor(hrs / 24)} วันที่แล้ว`;
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

// ---- แดชบอร์ด: สรุปทั้งระบบ + กราฟ GMV 14 วัน ----
export async function getAdminOverview() {
  const db = supabaseServer();

  const { data: paid } = await db
    .from("transactions")
    .select("total_amount,created_at")
    .eq("status", "paid");
  const orders = paid || [];

  // GMV เดือนนี้
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const gmvMonth = orders.reduce((s, t) => {
    const d = new Date(t.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return k === monthKey ? s + Number(t.total_amount) : s;
  }, 0);
  const feeRevenue = Math.round(gmvMonth * PLATFORM_FEE_RATE);

  const { count: userCount } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: activeEvents } = await db
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const { count: pendingApprovals } = await db
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const feePercent = Number((PLATFORM_FEE_RATE * 100).toFixed(2));

  const stats = [
    { label: "มูลค่าธุรกรรมรวม (เดือนนี้)", value: formatBaht(gmvMonth), delta: "ทั้งแพลตฟอร์ม", deltaColor: "#22c55e" },
    { label: "ผู้ใช้ทั้งหมด", value: (userCount || 0).toLocaleString("en-US"), delta: "บัญชีในระบบ", deltaColor: "#22c55e" },
    { label: "อีเวนต์ที่เปิดขาย", value: String(activeEvents || 0), delta: `${pendingApprovals || 0} รออนุมัติ`, deltaColor: "#f59e0b" },
    { label: "รายได้ค่าธรรมเนียม", value: formatBaht(feeRevenue), delta: `หลังหัก ${feePercent}%`, deltaColor: "#71717a" },
  ];

  return { stats, chart: buildChart(orders) };
}

// ---- นับรายการที่รอดำเนินการ (badge ในไซด์บาร์ + การ์ด "ต้องดำเนินการ") ----
export async function getAdminBadges() {
  const db = supabaseServer();
  const { count } = await db
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return {
    pendingApprovals: count || 0,
  };
}

// ---- จัดการผู้ใช้ (ทั้งหมด) ----
export async function listUsers() {
  const db = supabaseServer();
  const { data: profiles } = await db
    .from("profiles")
    .select("id,full_name,email,role,created_at")
    .order("created_at", { ascending: false });
  const rows = profiles || [];

  // นับกิจกรรม: organizer = จำนวนอีเวนต์, buyer = จำนวนออเดอร์ที่ชำระแล้ว
  const [{ data: events }, { data: txns }] = await Promise.all([
    db.from("events").select("organizer_id"),
    db.from("transactions").select("buyer_id").eq("status", "paid"),
  ]);
  const eventsByOrg = new Map();
  for (const e of events || [])
    eventsByOrg.set(e.organizer_id, (eventsByOrg.get(e.organizer_id) || 0) + 1);
  const ordersByBuyer = new Map();
  for (const t of txns || [])
    ordersByBuyer.set(t.buyer_id, (ordersByBuyer.get(t.buyer_id) || 0) + 1);

  return rows.map((u) => {
    const isOrg = u.role === "organizer";
    const name = u.full_name || u.email;
    const activity = isOrg
      ? `${eventsByOrg.get(u.id) || 0} อีเวนต์`
      : `${ordersByBuyer.get(u.id) || 0} คำสั่งซื้อ`;
    return {
      id: u.id,
      initial: (name || "?").charAt(0).toUpperCase(),
      name,
      email: u.email,
      role: ROLE_LABEL[u.role] || u.role,
      joined: thaiDate(u.created_at),
      activity,
      status: isOrg ? "ยืนยันแล้ว" : "ปกติ",
      ok: true,
    };
  });
}

// ---- อีเวนต์รออนุมัติ (status = 'pending') ----
export async function listPendingApprovals() {
  const db = supabaseServer();
  const { data } = await db
    .from("events")
    .select(
      "id,title,category,description,starts_at,created_at," +
        "venues(name,capacity)," +
        "profiles(full_name)," +
        "ticket_types(name,price,seating_type,quantity_total)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data || []).map((e) => {
    const cap =
      e.venues?.capacity ||
      (e.ticket_types || []).reduce((s, t) => s + Number(t.quantity_total), 0);
    const zones = (e.ticket_types || [])
      .slice()
      .sort((a, b) => Number(b.price) - Number(a.price))
      .map((t) => ({
        name: t.name,
        type: t.seating_type === "seated" ? "มีที่นั่ง" : "ยืน",
        price: formatBaht(Number(t.price)),
        cap: Number(t.quantity_total).toLocaleString("en-US"),
      }));
    return {
      id: e.id,
      title: e.title,
      cat: e.category || "อีเวนต์",
      description: e.description || "",
      date: thaiDate(e.starts_at),
      venue: e.venues?.name || "-",
      cap: cap.toLocaleString("en-US"),
      organizer: e.profiles?.full_name || "ผู้จัดงาน",
      submitted: timeAgo(e.created_at),
      grad: gradientFor(e.id),
      zones,
    };
  });
}

// ---- การเงิน: รายได้ค่าธรรมเนียมรวมเดือนนี้ (จากยอดขายที่ชำระแล้ว) ----
export async function getAdminFinance() {
  const db = supabaseServer();

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data: paid } = await db
    .from("transactions")
    .select("total_amount,created_at")
    .eq("status", "paid");
  const feeMonth = (paid || []).reduce((s, t) => {
    const d = new Date(t.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return k === monthKey ? s + Number(t.total_amount) * PLATFORM_FEE_RATE : s;
  }, 0);

  return { totalFees: formatBaht(Math.round(feeMonth)) };
}
