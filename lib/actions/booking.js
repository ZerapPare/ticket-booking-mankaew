"use server";

import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase/server";

/*
  Server Actions ของ booking flow — เรียก RPC ใน Supabase ด้วย service role
  ผู้ซื้อมาจาก session (auth()) เท่านั้น ไม่รับ buyerId จาก client
  คืน { ok, txnId, holdExpiresAt } หรือ { ok:false, error } (ข้อความไทย)
*/

// แปลง error จาก RPC เป็นข้อความไทยให้ผู้ใช้ + log ตัวจริงไว้ debug เสมอ
// (เช่น 'SEAT_TAKEN: ที่นั่ง A-5 ไม่ว่างแล้ว' หรือ error โครงสร้าง DB อื่น ๆ)
function toThaiError(error) {
  console.error("[booking] rpc error:", error);
  const raw = String(error?.message || error || "");

  const colon = raw.indexOf(":");
  if (colon >= 0) {
    const tail = raw.slice(colon + 1).trim();
    if (tail) return tail; // RPC ใส่ข้อความไทยหลัง ':' มาแล้ว
  }

  const map = {
    NO_SEATS: "ยังไม่ได้เลือกที่นั่ง",
    SEATS_NOT_FOUND: "ไม่พบที่นั่งที่เลือก",
    SEAT_TAKEN: "ที่นั่งบางที่ถูกจองไปแล้ว กรุณาเลือกใหม่",
    SOLD_OUT: "บัตรไม่พอสำหรับจำนวนที่เลือก",
    TICKET_TYPE_NOT_FOUND: "ไม่พบประเภทบัตร",
    EVENT_NOT_AVAILABLE: "อีเวนต์นี้ยังไม่เปิดขาย",
    TXN_NOT_PENDING: "ไม่พบออเดอร์ที่รอชำระเงิน",
  };
  if (map[raw]) return map[raw];

  // dev: โชว์ error ตัวจริงเพื่อ debug; prod: ข้อความรวม
  return process.env.NODE_ENV !== "production" && raw
    ? `ทำรายการไม่สำเร็จ: ${raw}`
    : "ทำรายการไม่สำเร็จ กรุณาลองใหม่";
}

// hold_expires_at ของออเดอร์ -> epoch ms (ให้ฝั่ง client นับถอยหลัง)
async function fetchHoldExpiry(db, txnId) {
  const { data, error } = await db
    .from("transactions")
    .select("hold_expires_at")
    .eq("id", txnId)
    .maybeSingle();

  if (error) console.error("[booking] fetchHoldExpiry error:", error);
  return data?.hold_expires_at ? new Date(data.hold_expires_at).getTime() : null;
}

// ยืนยันว่าออเดอร์เป็นของผู้ใช้คนนี้จริง
async function ownsTxn(db, txnId, buyerId) {
  const { data } = await db
    .from("transactions")
    .select("buyer_id")
    .eq("id", txnId)
    .maybeSingle();
  return data?.buyer_id === buyerId;
}

// จองที่นั่งรายตัว (โซน seated) -> สร้างออเดอร์ pending + hold 10 นาที
export async function holdSeatsAction(seatIds) {
  const session = await auth();
  const buyerId = session?.user?.id;
  if (!buyerId) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };
  if (!Array.isArray(seatIds) || seatIds.length === 0)
    return { ok: false, error: "ยังไม่ได้เลือกที่นั่ง" };

  const db = supabaseServer();
  const { data: txnId, error } = await db.rpc("hold_seats", {
    p_buyer_id: buyerId,
    p_seat_ids: seatIds,
  });
  if (error) return { ok: false, error: toThaiError(error) };

  return { ok: true, txnId, holdExpiresAt: await fetchHoldExpiry(db, txnId) };
}

// จองบัตรตามจำนวน (โซนยืน/ga) -> สร้างออเดอร์ pending + ตั้ง hold 10 นาที
export async function bookGaAction(ticketTypeId, qty) {
  const session = await auth();
  const buyerId = session?.user?.id;
  if (!buyerId) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };
  const quantity = Number(qty);
  if (!ticketTypeId || !Number.isInteger(quantity) || quantity < 1)
    return { ok: false, error: "จำนวนบัตรไม่ถูกต้อง" };

  const db = supabaseServer();
  const { data: txnId, error } = await db.rpc("book_tickets", {
    p_buyer_id: buyerId,
    p_ticket_type_id: ticketTypeId,
    p_quantity: quantity,
  });
  if (error) return { ok: false, error: toThaiError(error) };

  // book_tickets() ไม่ตั้ง hold_expires_at — ตั้งเองให้ flow แสดงเวลาถือบัตรได้
  // (หมดเวลาแล้ว client จะเรียก cancelOrderAction เพื่อคืนโควต้า)
  const holdExpiresAt = Date.now() + 10 * 60 * 1000;
  const { error: updateError } = await db
    .from("transactions")
    .update({ hold_expires_at: new Date(holdExpiresAt).toISOString() })
    .eq("id", txnId);
  if (updateError)
    console.error("[booking] set GA hold_expires_at error:", updateError);

  return { ok: true, txnId, holdExpiresAt };
}

// ยืนยันการชำระเงิน -> paid (ที่นั่ง -> sold)
export async function confirmPaymentAction(txnId, method) {
  const session = await auth();
  const buyerId = session?.user?.id;
  if (!buyerId) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const db = supabaseServer();
  if (!(await ownsTxn(db, txnId, buyerId)))
    return { ok: false, error: "ไม่พบออเดอร์" };

  const { error } = await db.rpc("confirm_payment", {
    p_txn_id: txnId,
    p_payment_ref: method || null,
  });
  if (error) return { ok: false, error: toThaiError(error) };
  return { ok: true, txnId };
}

// ยกเลิกออเดอร์ (กดย้อนกลับ / หมดเวลาถือบัตร) -> คืนที่นั่ง/โควต้า
export async function cancelOrderAction(txnId) {
  const session = await auth();
  const buyerId = session?.user?.id;
  if (!buyerId) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const db = supabaseServer();
  if (!(await ownsTxn(db, txnId, buyerId)))
    return { ok: false, error: "ไม่พบออเดอร์" };

  const { error } = await db.rpc("cancel_transaction", { p_txn_id: txnId });
  if (error) return { ok: false, error: toThaiError(error) };
  return { ok: true };
}