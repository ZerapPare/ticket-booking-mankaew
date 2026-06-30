import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

const ZONE_COLORS = ["#7c3aed", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

// โซน (ticket_types) ของอีเวนต์ + จำนวนที่ว่างจริง
export async function getZonesAvailability(eventId) {
  const db = supabaseServer();
  const { data: tts, error } = await db
    .from("ticket_types")
    .select("id,name,price,seating_type,quantity_total,quantity_sold,max_per_order")
    .eq("event_id", eventId)
    .order("price", { ascending: false });
  if (error) throw error;

  const zones = await Promise.all(
    (tts || []).map(async (t, i) => {
      let available;
      if (t.seating_type === "seated") {
        const { count } = await db
          .from("seats")
          .select("*", { count: "exact", head: true })
          .eq("ticket_type_id", t.id)
          .eq("status", "available");
        available = count ?? 0;
      } else {
        available = Number(t.quantity_total) - Number(t.quantity_sold);
      }
      return {
        id: t.id,
        name: t.name,
        price: Number(t.price),
        color: ZONE_COLORS[i % ZONE_COLORS.length],
        seatingType: t.seating_type,
        maxPerOrder: t.max_per_order,
        total: Number(t.quantity_total),
        available,
      };
    })
  );
  return zones;
}

// ผังที่นั่งของโซน (seated) — จัดเป็นแถว A,B,C...
export async function getSeatMap(ticketTypeId) {
  const db = supabaseServer();
  const { data, error } = await db
    .from("seats")
    .select("id,seat_label,row_letter,seat_number,status")
    .eq("ticket_type_id", ticketTypeId)
    .order("row_letter", { ascending: true })
    .order("seat_number", { ascending: true });
  if (error) throw error;

  const rows = [];
  let current = null;
  for (const s of data || []) {
    if (!current || current.letter !== s.row_letter) {
      current = { letter: s.row_letter, seats: [] };
      rows.push(current);
    }
    current.seats.push({
      id: s.id,
      label: s.seat_label,
      num: s.seat_number,
      status: s.status, // available | held | sold
    });
  }
  return rows;
}
