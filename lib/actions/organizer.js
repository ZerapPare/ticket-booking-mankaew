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
async function requireOrganizer() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "organizer" && role !== "admin")) return null;
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
const ALLOWED_STATUS = ["draft", "published", "cancelled", "completed"];

export async function setEventStatusAction(eventId, status) {
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!ALLOWED_STATUS.includes(status))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };

  const db = supabaseServer();
  const { data: ev } = await db
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { ok: false, error: "ไม่พบอีเวนต์" };
  if (ctx.scope && ev.organizer_id !== ctx.scope)
    return { ok: false, error: "อีเวนต์นี้ไม่ใช่ของคุณ" };

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

// ---- แก้ไขรายละเอียดอีเวนต์ (ข้อมูลงาน + ราคาต่อโซน) ----
const editSchema = z.object({
  title: z.string().trim().min(1),
  startsAt: z.string().min(1),
  category: z.string().trim().optional(),
  venue: z.string().trim().min(1),
  description: z.string().trim().optional(),
  zonePrices: z
    .array(z.object({ id: z.string().uuid(), price: z.coerce.number().nonnegative() }))
    .optional(),
});

export async function updateEventAction(eventId, payload) {
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };
  const parsed = editSchema.safeParse(payload);
  // if (!parsed.success) return { ok: false, error: "กรอกข้อมูลให้ครบและถูกต้อง2" };
  if (!parsed.success) {
    console.error("Validation errors:");
    console.dir(parsed.error.format(), { depth: null });

    // หรือ
    console.error(parsed.error.issues);
    payload.zonePrices?.forEach((z, i) => {
    console.log(i, z.id);
  });
    return { ok: false, error: "กรอกข้อมูลให้ครบและถูกต้อง2" };
  }
  payload.zonePrices?.forEach((z, i) => {
  console.log(i, z.id);
});
  const p = parsed.data;

  const db = supabaseServer();
  const { data: ev } = await db
    .from("events")
    .select("organizer_id,venue_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { ok: false, error: "ไม่พบอีเวนต์" };
  if (ctx.scope && ev.organizer_id !== ctx.scope)
    return { ok: false, error: "อีเวนต์นี้ไม่ใช่ของคุณ" };

  const { error: eErr } = await db
    .from("events")
    .update({
      title: p.title,
      starts_at: p.startsAt,
      category: p.category || null,
      description: p.description || null,
    })
    .eq("id", eventId);
  if (eErr) {
    console.error("[organizer] updateEvent:", eErr);
    return { ok: false, error: "บันทึกอีเวนต์ไม่สำเร็จ" };
  }

  if (ev.venue_id) {
    await db.from("venues").update({ name: p.venue }).eq("id", ev.venue_id);
  }

  // อัปเดตราคาต่อโซน (เฉพาะ ticket_types ของอีเวนต์นี้)
  for (const zp of p.zonePrices || []) {
    await db
      .from("ticket_types")
      .update({ price: zp.price })
      .eq("id", zp.id)
      .eq("event_id", eventId);
  }

  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/report/${eventId}`);
  revalidatePath(`/organizer/events/${eventId}/edit`);
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
  const ctx = await requireOrganizer();
  if (!ctx) return { ok: false, error: "ไม่มีสิทธิ์" };

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

  // 2) event (เผยแพร่ทันที)
  const { data: ev, error: eErr } = await db
    .from("events")
    .insert({
      organizer_id: ctx.userId,
      venue_id: venue.id,
      title: p.title,
      description: p.description || null,
      category: p.category || null,
      status: "published",
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
  revalidatePath("/events");
  return { ok: true, eventId: ev.id };
}
