import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { thaiDate, gradientFor } from "@/lib/data/events";

/*
  ชั้นข้อมูล (DAL) สำหรับตั๋วที่ออกแล้ว — อ่านผ่าน SERVICE ROLE (bypass RLS)
  ทุกฟังก์ชันบังคับ ownership (buyer_id = userId) เองในโค้ด
  ใช้กับหน้า e-ticket (/tickets/[id]) และ "ตั๋วของฉัน" (/account)
*/

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 1 ออเดอร์ (transaction) + ตั๋วทุกใบในออเดอร์ — คืน null ถ้าไม่พบ/ไม่ใช่เจ้าของ
export async function getOrder(txnId, userId) {
  if (!txnId || !UUID_RE.test(txnId) || !userId) return null;
  const db = supabaseServer();

  const { data: txn, error } = await db
    .from("transactions")
    .select(
      "id,status,total_amount,event_id,buyer_id," +
        "events(title,starts_at,venues(name))"
    )
    .eq("id", txnId)
    .eq("buyer_id", userId)
    .maybeSingle();

  if (error || !txn) return null;

  const { data: tks } = await db
    .from("tickets")
    .select("serial_no,qr_code,seat_label,ticket_types(name)")
    .eq("transaction_id", txnId)
    .order("seat_label", { ascending: true });

  const tickets = tks || [];
  return {
    id: txn.id,
    status: txn.status,
    total: Number(txn.total_amount),
    event: {
      title: txn.events?.title ?? "",
      date: thaiDate(txn.events?.starts_at),
      venue: txn.events?.venues?.name ?? "",
      grad: gradientFor(txn.event_id),
    },
    zoneName: tickets[0]?.ticket_types?.name ?? "",
    qty: tickets.length,
    seats: tickets.map((t) => t.seat_label).filter(Boolean),
    serials: tickets.map((t) => t.serial_no),
    // QR หน้างานเช็คด้วย qr_code จริง (fallback serial/txn ถ้าไม่มี)
    qr: tickets[0]?.qr_code ?? tickets[0]?.serial_no ?? txn.id,
  };
}

// รายการตั๋วของผู้ใช้ (เฉพาะออเดอร์ที่ชำระแล้ว) แยกกำลังจะมาถึง / ที่ผ่านมา
export async function getMyTickets(userId) {
  if (!userId) return { upcoming: [], past: [] };
  const db = supabaseServer();

  const { data: txns, error } = await db
    .from("transactions")
    .select(
      "id,event_id,events(title,starts_at,venues(name))," +
        "tickets(seat_label,ticket_types(name))"
    )
    .eq("buyer_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = Date.now();
  const upcoming = [];
  const past = [];
  for (const t of txns || []) {
    const startsAt = t.events?.starts_at;
    const tickets = t.tickets || [];
    const item = {
      orderId: t.id,
      title: t.events?.title ?? "",
      date: thaiDate(startsAt),
      venue: t.events?.venues?.name ?? "",
      grad: gradientFor(t.event_id),
      zoneName: tickets[0]?.ticket_types?.name ?? "",
      qty: tickets.length,
    };
    const isUpcoming = startsAt && new Date(startsAt).getTime() >= now;
    (isUpcoming ? upcoming : past).push(item);
  }
  return { upcoming, past };
}