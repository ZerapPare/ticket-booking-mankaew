"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase/server";

/*
  Server Actions ฝั่งแอดมิน — ต้องเป็น role admin เท่านั้น
  ทุกฟังก์ชันคืน { ok, error? } และ revalidate หน้าที่เกี่ยวข้อง
*/
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return { userId: session.user.id };
}

// ---- อนุมัติ / ปฏิเสธ อีเวนต์ (pending -> published / cancelled) ----
async function setApprovalStatus(eventId, status) {
  if (!(await requireAdmin())) return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!UUID_RE.test(String(eventId || "")))
    return { ok: false, error: "รหัสอีเวนต์ไม่ถูกต้อง" };

  const db = supabaseServer();
  const { data: ev } = await db
    .from("events")
    .select("status")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { ok: false, error: "ไม่พบอีเวนต์" };
  if (ev.status !== "pending")
    return { ok: false, error: "อีเวนต์นี้ถูกดำเนินการไปแล้ว" };

  const { error } = await db.from("events").update({ status }).eq("id", eventId);
  if (error) {
    console.error("[admin] setApprovalStatus:", error);
    return { ok: false, error: "อัปเดตสถานะไม่สำเร็จ" };
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/events");
  return { ok: true };
}

export async function approveEventAction(eventId) {
  return setApprovalStatus(eventId, "published");
}

export async function rejectEventAction(eventId) {
  return setApprovalStatus(eventId, "cancelled");
}
