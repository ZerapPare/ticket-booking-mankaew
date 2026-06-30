import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { gradientFor, thaiDate } from "@/lib/data/events";
import { sortSeats, seatLabel } from "@/lib/format";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function groupZones(tickets) {
  const map = new Map();
  for (const tk of tickets || []) {
    const name = tk.ticket_types?.name ?? "บัตร";
    const price = Number(tk.ticket_types?.price ?? 0);
    if (!map.has(name)) map.set(name, { name, price, count: 0, seats: [] });
    const g = map.get(name);
    g.count += 1;
    if (tk.seat_label) g.seats.push(tk.seat_label);
  }
  return [...map.values()].map((z) => ({
    ...z,
    seatLabels: sortSeats(z.seats).map(seatLabel),
  }));
}

// 1 ออเดอร์ (cart/payment/e-ticket) — ตรวจว่าเป็นของ user เอง
export async function getTransaction(txnId, userId) {
  if (!txnId || !UUID_RE.test(txnId)) return null;
  const db = supabaseServer();
  const { data: t, error } = await db
    .from("transactions")
    .select(
      "id,status,total_amount,hold_expires_at,buyer_id," +
        "events(id,title,starts_at,venues(name))," +
        "tickets(id,serial_no,qr_code,seat_label,status,ticket_types(name,price))"
    )
    .eq("id", txnId)
    .maybeSingle();

  if (error || !t || t.buyer_id !== userId) return null;

  const ev = t.events;
  const tickets = (t.tickets || []).slice().sort((a, b) =>
    (a.seat_label || "").localeCompare(b.seat_label || "")
  );

  return {
    id: t.id,
    status: t.status,
    total: Number(t.total_amount),
    holdExpiresAt: t.hold_expires_at,
    qty: tickets.length,
    event: {
      id: ev?.id,
      title: ev?.title ?? "",
      date: thaiDate(ev?.starts_at),
      venue: ev?.venues?.name ?? "",
      grad: ev?.id ? gradientFor(ev.id) : undefined,
    },
    zones: groupZones(tickets),
    tickets: tickets.map((tk) => ({
      id: tk.id,
      serial: tk.serial_no,
      qr: tk.qr_code,
      seatLabel: tk.seat_label,
      zoneName: tk.ticket_types?.name ?? "บัตร",
      status: tk.status,
    })),
  };
}

// ตั๋วของฉัน (account) — เฉพาะออเดอร์ที่จ่ายแล้ว
export async function getMyTickets(userId) {
  const db = supabaseServer();
  const { data, error } = await db
    .from("transactions")
    .select(
      "id,status,created_at," +
        "events(id,title,starts_at,venues(name))," +
        "tickets(id,seat_label,ticket_types(name))"
    )
    .eq("buyer_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const now = Date.now();
  const items = (data || []).map((t) => {
    const ev = t.events;
    const zones = groupZones(t.tickets);
    return {
      txnId: t.id,
      title: ev?.title ?? "",
      date: thaiDate(ev?.starts_at),
      venue: ev?.venues?.name ?? "",
      grad: ev?.id ? gradientFor(ev.id) : undefined,
      startsAt: ev?.starts_at,
      qty: (t.tickets || []).length,
      zoneLabel: zones.map((z) => z.name).join(", "),
      upcoming: ev?.starts_at ? new Date(ev.starts_at).getTime() >= now : true,
    };
  });

  return {
    upcoming: items.filter((i) => i.upcoming),
    past: items.filter((i) => !i.upcoming),
  };
}
