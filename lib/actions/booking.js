"use server";

import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase/server";

// แปลข้อความ error จาก RPC เป็นภาษาไทยที่ผู้ใช้เข้าใจ
function errMsg(e) {
  const m = e?.message || String(e);
  if (m.includes("SEAT_TAKEN")) return "ที่นั่งบางตัวถูกจองไปแล้ว กรุณาเลือกใหม่";
  if (m.includes("SOLD_OUT")) return "บัตรในโซนนี้เต็มแล้ว";
  if (m.includes("EXCEEDS_MAX")) return "เกินจำนวนสูงสุดต่อออเดอร์ (8 ที่นั่ง)";
  if (m.includes("EVENT_NOT_AVAILABLE")) return "อีเวนต์นี้ยังไม่เปิดขาย";
  if (m.includes("NO_SEATS")) return "ยังไม่ได้เลือกที่นั่ง";
  return "ทำรายการไม่สำเร็จ กรุณาลองใหม่";
}

async function requireUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function ownsTxn(db, txnId, userId) {
  const { data } = await db
    .from("transactions")
    .select("buyer_id")
    .eq("id", txnId)
    .maybeSingle();
  return data && data.buyer_id === userId;
}

// จองที่นั่งรายตัว (seated) -> สร้าง pending transaction + ล็อก 10 นาที
export async function holdSeats(seatIds) {
  const userId = await requireUser();
  if (!userId) return { error: "กรุณาเข้าสู่ระบบก่อนจองบัตร" };
  if (!Array.isArray(seatIds) || seatIds.length === 0)
    return { error: "ยังไม่ได้เลือกที่นั่ง" };

  const { data, error } = await supabaseServer().rpc("hold_seats", {
    p_buyer_id: userId,
    p_seat_ids: seatIds,
  });
  if (error) return { error: errMsg(error) };
  return { txnId: data };
}

// จองโซนยืน (ga) ตามจำนวน
export async function bookGa(ticketTypeId, qty) {
  const userId = await requireUser();
  if (!userId) return { error: "กรุณาเข้าสู่ระบบก่อนจองบัตร" };

  const { data, error } = await supabaseServer().rpc("book_tickets", {
    p_buyer_id: userId,
    p_ticket_type_id: ticketTypeId,
    p_quantity: qty,
  });
  if (error) return { error: errMsg(error) };
  return { txnId: data };
}

// ยืนยันชำระเงิน (จำลอง) -> ตั๋ว paid + ที่นั่ง sold
export async function confirmPayment(txnId) {
  const userId = await requireUser();
  if (!userId) return { error: "กรุณาเข้าสู่ระบบ" };
  const db = supabaseServer();
  if (!(await ownsTxn(db, txnId, userId))) return { error: "ไม่พบออเดอร์นี้" };

  const { error } = await db.rpc("confirm_payment", { p_txn_id: txnId });
  if (error) return { error: errMsg(error) };
  return { ok: true };
}

// ยกเลิก hold -> คืนที่นั่ง/โควต้า
export async function cancelHold(txnId) {
  const userId = await requireUser();
  if (!userId) return { error: "กรุณาเข้าสู่ระบบ" };
  const db = supabaseServer();
  if (!(await ownsTxn(db, txnId, userId))) return { error: "ไม่พบออเดอร์นี้" };

  const { error } = await db.rpc("cancel_transaction", { p_txn_id: txnId });
  if (error) return { error: errMsg(error) };
  return { ok: true };
}
