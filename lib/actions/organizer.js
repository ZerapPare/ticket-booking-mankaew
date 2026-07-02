"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { MAX_SEATS } from "@/lib/constants";

/*
  Server Actions ฝั่งผู้จัดงาน — auth() + ต้องเป็น role organizer/admin
  scope = null (แอดมิน) หรือ organizerId (จำกัดเฉพาะอีเวนต์ตัวเอง)
*/
async function requireOrganizer({ organizerOnly = false } = {}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "organizer" && role !== "admin")) return null;
  // บางงาน (เช่น สร้างอีเวนต์) จำกัดเฉพาะ organizer — admin ทำหน้าที่อนุมัติ/จัดการเท่านั้น
  if (organizerOnly && role !== "organizer") return null;
  return {
    userId: session.user.id,
    scope: role === "admin" ? null : session.user.id,
  };
}

function checkInThai(msg) {
  const raw = String(msg || "");
  const map = {
    TICKET_NOT_FOUND: "ไม่พบบัตรนี้",
    ALREADY_CHECKED_IN: "บัตรนี้เช็คอินไปแล้ว",
    TICKET_NOT_PAID: "บัตรนี้ยังไม่ได้ชำระเงิน",
  };
  for (const k of Object.keys(map)) if (raw.includes(k)) return map[k];
  return "เช็คอินไม่สำเร็จ";
}

const TICKET_SELECT =
  "qr_code,serial_no," +
  "ticket_types!inner(name,event_id,events!inner(organizer_id))," +
  "profiles(full_name)";

// เช็คอินด้วยรหัสบัตร (qr_code หรือ serial_no) — เรียก check_in_ticket RPC
export async function checkInAction(code) {
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };
  const c = String(code || "").trim();
  if (!c) return { ok: false, error: "กรุณากรอกรหัสบัตร" };

  const db = supabaseServer();
  // ใช้ .eq (parameterized) ทีละช่อง กันการ inject filter
  let { data: ticket } = await db
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("qr_code", c)
    .maybeSingle();
  if (!ticket) {
    ({ data: ticket } = await db
      .from("tickets")
      .select(TICKET_SELECT)
      .eq("serial_no", c)
      .maybeSingle());
  }
  if (!ticket) return { ok: false, error: "ไม่พบบัตรนี้" };

  const organizerId = ticket.ticket_types?.events?.organizer_id;
  if (ctx.scope && organizerId !== ctx.scope)
    return { ok: false, error: "บัตรนี้ไม่ใช่ของอีเวนต์คุณ" };

  const { error } = await db.rpc("check_in_ticket", { p_qr: ticket.qr_code });
  if (error) {
    console.error("[organizer] check_in error:", error);
    return { ok: false, error: checkInThai(error.message) };
  }

  return {
    ok: true,
    attendee: {
      name: ticket.profiles?.full_name || "ผู้เข้างาน",
      zone: ticket.ticket_types?.name || "-",
      serial: ticket.serial_no,
      time: new Date().toTimeString().slice(0, 5),
    },
  };
}

// ---- เปลี่ยนสถานะอีเวนต์ (organizer เจ้าของ / admin) ----
// organizer จัดการได้เฉพาะ เปิดขาย(published) / ปิดการขาย(completed) / ยกเลิก(cancelled)
// และทำได้ต่อเมื่ออีเวนต์ผ่านการอนุมัติแล้วเท่านั้น (สถานะปัจจุบันเป็น published/completed)
const ALLOWED_STATUS = ["published", "completed", "cancelled"];
const ORGANIZER_MANAGEABLE = ["approved", "published", "completed"];

export async function setEventStatusAction(eventId, status) {
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!ALLOWED_STATUS.includes(status))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };

  const db = supabaseServer();
  const { data: ev } = await db
    .from("events")
    .select("organizer_id,status")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { ok: false, error: "ไม่พบอีเวนต์" };
  if (ctx.scope && ev.organizer_id !== ctx.scope)
    return { ok: false, error: "อีเวนต์นี้ไม่ใช่ของคุณ" };

  // organizer ต้องรอให้อีเวนต์ได้รับการอนุมัติก่อนถึงจะจัดการสถานะได้
  if (ctx.scope && !ORGANIZER_MANAGEABLE.includes(ev.status)) {
    if (ev.status === "pending")
      return { ok: false, error: "ต้องได้รับการอนุมัติจากแอดมินก่อน" };
    return { ok: false, error: "อีเวนต์ถูกยกเลิกแล้ว" };
  }

  const { error } = await db
    .from("events")
    .update({ status })
    .eq("id", eventId);
  if (error) {
    console.error("[organizer] setEventStatus:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ" };
  }

  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/report/${eventId}`);
  revalidatePath("/events");
  return { ok: true };
}

// ---- แก้ไขรายละเอียดอีเวนต์ (ข้อมูลงาน + เพิ่ม/แก้ไข/ลบ โซน) ----
const zoneEditSchema = z
  .object({
    id: z.string().uuid().optional(), // มี id = โซนเดิม, ไม่มี = โซนใหม่
    name: z.string().trim().min(1),
    price: z.coerce.number().nonnegative(),
    type: z.enum(["ga", "seated"]),
    capacity: z.coerce.number().int().positive().optional(),
    rows: z.coerce.number().int().positive().max(26).optional(),
    cols: z.coerce.number().int().positive().optional(),
  })
  .refine((z_) => (z_.type === "seated" ? z_.rows && z_.cols : z_.capacity), {
    message: "zone size required",
  });

const editSchema = z.object({
  title: z.string().trim().min(1),
  startsAt: z.string().min(1),
  category: z.string().trim().optional(),
  venue: z.string().trim().min(1),
  description: z.string().trim().optional(),
  zones: z.array(zoneEditSchema).min(1),
  deletedZoneIds: z.array(z.string().uuid()).optional(),
});

export async function updateEventAction(eventId, payload) {
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };
  const parsed = editSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "กรอกข้อมูลให้ครบและถูกต้อง" };
  const p = parsed.data;

  const db = supabaseServer();
  const { data: ev } = await db
    .from("events")
    .select("organizer_id,venue_id,status")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { ok: false, error: "ไม่พบอีเวนต์" };
  if (ctx.scope && ev.organizer_id !== ctx.scope)
    return { ok: false, error: "อีเวนต์นี้ไม่ใช่ของคุณ" };
  // อีเวนต์ที่ถูกยกเลิกแล้ว แก้ไขไม่ได้ (terminal)
  if (ev.status === "cancelled")
    return { ok: false, error: "อีเวนต์ถูกยกเลิกแล้ว ไม่สามารถแก้ไขได้" };

  // แก้ไขรายละเอียด = ต้องส่งให้แอดมินอนุมัติใหม่ -> สถานะกลับเป็น pending
  const { error: eErr } = await db
    .from("events")
    .update({
      title: p.title,
      starts_at: p.startsAt,
      category: p.category || null,
      description: p.description || null,
      status: "pending",
    })
    .eq("id", eventId);
  if (eErr) {
    console.error("[organizer] updateEvent:", eErr);
    return { ok: false, error: "บันทึกอีเวนต์ไม่สำเร็จ" };
  }

  if (ev.venue_id) {
    await db.from("venues").update({ name: p.venue }).eq("id", ev.venue_id);
  }

  // ---- โซน: เพิ่ม / แก้ไข / ลบ (เฉพาะ ticket_types ของอีเวนต์นี้) ----
  const { data: currentTts } = await db
    .from("ticket_types")
    .select("id,name,seating_type,quantity_total,quantity_sold,seat_rows,seat_cols")
    .eq("event_id", eventId);
  const ttById = new Map((currentTts || []).map((t) => [t.id, t]));

  // ลบโซน — ได้เฉพาะโซนที่ยังไม่มียอดขาย (seats จะถูกลบตาม cascade)
  for (const delId of p.deletedZoneIds || []) {
    const cur = ttById.get(delId);
    if (!cur) continue;
    if (Number(cur.quantity_sold) > 0)
      return { ok: false, error: `ลบโซน "${cur.name}" ที่มียอดขายแล้วไม่ได้` };
    await db.from("ticket_types").delete().eq("id", delId).eq("event_id", eventId);
    ttById.delete(delId);
  }

  for (const zn of p.zones) {
    const seated = zn.type === "seated";
    const cap = zoneCap(zn); // rows*cols (seated) หรือ capacity (ga)

    // ---- โซนใหม่ ----
    if (!zn.id || !ttById.has(zn.id)) {
      const { data: tt, error: insErr } = await db
        .from("ticket_types")
        .insert({
          event_id: eventId,
          name: zn.name,
          price: zn.price,
          quantity_total: cap,
          max_per_order: MAX_SEATS,
          seating_type: zn.type,
          seat_rows: seated ? zn.rows : null,
          seat_cols: seated ? zn.cols : null,
        })
        .select("id")
        .single();
      if (insErr)
        return { ok: false, error: `เพิ่มโซน "${zn.name}" ไม่สำเร็จ (ชื่ออาจซ้ำ)` };
      if (seated) await db.rpc("generate_seats", { p_ticket_type_id: tt.id });
      continue;
    }

    // ---- โซนเดิม ----
    const cur = ttById.get(zn.id);
    const sold = Number(cur.quantity_sold);
    const update = { name: zn.name, price: zn.price }; // ชื่อ+ราคา แก้ได้เสมอ

    if (sold === 0) {
      // ยังไม่มียอดขาย: แก้ได้อิสระ (สร้างผังที่นั่งใหม่ทั้งหมด)
      update.seating_type = zn.type;
      update.quantity_total = cap;
      update.seat_rows = seated ? zn.rows : null;
      update.seat_cols = seated ? zn.cols : null;
      await db.from("seats").delete().eq("ticket_type_id", zn.id);
      const { error: upErr } = await db
        .from("ticket_types").update(update).eq("id", zn.id).eq("event_id", eventId);
      if (upErr) return { ok: false, error: `บันทึกโซน "${zn.name}" ไม่สำเร็จ (ชื่ออาจซ้ำ)` };
      if (seated) await db.rpc("generate_seats", { p_ticket_type_id: zn.id });
    } else {
      // มียอดขาย: ล็อกชนิดที่นั่ง, เพิ่มความจุได้อย่างเดียว
      if (zn.type !== cur.seating_type)
        return { ok: false, error: `เปลี่ยนชนิดโซน "${zn.name}" ที่ขายแล้วไม่ได้` };
      if (cur.seating_type === "ga") {
        if (cap < Number(cur.quantity_total))
          return { ok: false, error: `ลดจำนวนบัตรของโซน "${zn.name}" ที่ขายแล้วไม่ได้` };
        update.quantity_total = cap;
      } else {
        if (zn.rows < Number(cur.seat_rows) || zn.cols < Number(cur.seat_cols))
          return { ok: false, error: `ลดขนาดที่นั่งของโซน "${zn.name}" ที่ขายแล้วไม่ได้` };
        update.seat_rows = zn.rows;
        update.seat_cols = zn.cols;
        update.quantity_total = zn.rows * zn.cols;
      }
      const { error: upErr } = await db
        .from("ticket_types").update(update).eq("id", zn.id).eq("event_id", eventId);
      if (upErr) return { ok: false, error: `บันทึกโซน "${zn.name}" ไม่สำเร็จ (ชื่ออาจซ้ำ)` };
      if (cur.seating_type === "seated")
        await db.rpc("generate_seats", { p_ticket_type_id: zn.id }); // เพิ่มที่นั่งแบบ additive
    }
  }

  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/report/${eventId}`);
  revalidatePath(`/organizer/events/${eventId}/edit`);
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  return { ok: true };
}

// ---- สร้างอีเวนต์ ----
const zoneSchema = z
  .object({
    name: z.string().trim().min(1),
    price: z.number().nonnegative(),
    type: z.enum(["ga", "seated"]),
    capacity: z.number().int().positive().optional(),
    rows: z.number().int().positive().optional(),
    cols: z.number().int().positive().optional(),
  })
  .refine((z_) => (z_.type === "seated" ? z_.rows && z_.cols : z_.capacity), {
    message: "zone size required",
  });

const eventSchema = z.object({
  title: z.string().trim().min(1),
  startsAt: z.string().min(1),
  category: z.string().trim().optional(),
  venue: z.string().trim().min(1),
  description: z.string().trim().optional(),
  zones: z.array(zoneSchema).min(1),
});

const zoneCap = (z_) =>
  z_.type === "seated" ? z_.rows * z_.cols : z_.capacity;

export async function createEventAction(payload) {
  const ctx = await requireOrganizer({ organizerOnly: true });
  if (!ctx) return { ok: false, error: "เฉพาะผู้จัดงานเท่านั้นที่สร้างอีเวนต์ได้" };

  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "กรอกข้อมูลให้ครบและถูกต้อง" };
  const p = parsed.data;

  const db = supabaseServer();
  const totalCap = p.zones.reduce((s, z_) => s + zoneCap(z_), 0);
  if (totalCap <= 0) return { ok: false, error: "ความจุรวมต้องมากกว่า 0" };

  // 1) venue
  const { data: venue, error: vErr } = await db
    .from("venues")
    .insert({ name: p.venue, capacity: totalCap, created_by: ctx.userId })
    .select("id")
    .single();
  if (vErr) {
    console.error("[organizer] venue insert:", vErr);
    return { ok: false, error: "สร้างสถานที่ไม่สำเร็จ" };
  }

  // 2) event (สร้างเป็น pending -> รอแอดมินอนุมัติก่อนเปิดขาย)
  const { data: ev, error: eErr } = await db
    .from("events")
    .insert({
      organizer_id: ctx.userId,
      venue_id: venue.id,
      title: p.title,
      description: p.description || null,
      category: p.category || null,
      status: "pending",
      starts_at: p.startsAt,
    })
    .select("id")
    .single();
  if (eErr) {
    console.error("[organizer] event insert:", eErr);
    return { ok: false, error: "สร้างอีเวนต์ไม่สำเร็จ" };
  }

  // 3) ticket_types (+ generate_seats สำหรับโซน seated)
  for (const z_ of p.zones) {
    const seated = z_.type === "seated";
    const { data: tt, error: tErr } = await db
      .from("ticket_types")
      .insert({
        event_id: ev.id,
        name: z_.name,
        price: z_.price,
        quantity_total: zoneCap(z_),
        max_per_order: MAX_SEATS,
        seating_type: z_.type,
        seat_rows: seated ? z_.rows : null,
        seat_cols: seated ? z_.cols : null,
      })
      .select("id")
      .single();
    if (tErr) {
      console.error("[organizer] ticket_type insert:", tErr);
      return { ok: false, error: `สร้างโซน ${z_.name} ไม่สำเร็จ (ชื่อโซนอาจซ้ำ)` };
    }
    if (seated) {
      const { error: gErr } = await db.rpc("generate_seats", {
        p_ticket_type_id: tt.id,
      });
      if (gErr) {
        console.error("[organizer] generate_seats:", gErr);
        return { ok: false, error: `สร้างที่นั่งโซน ${z_.name} ไม่สำเร็จ` };
      }
    }
  }

  revalidatePath("/organizer/events");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/events");
  return { ok: true, eventId: ev.id };
}
