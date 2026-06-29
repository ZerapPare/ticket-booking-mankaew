import EventList from "@/components/event-list";
import { EVENTS } from "@/lib/mock-data";

export const metadata = { title: "อีเวนต์ทั้งหมด — Mankaew" };

export default function EventsPage() {
  // Fill the grid a bit (mock). Real data comes from Supabase `events`.
  const list = [...EVENTS, ...EVENTS.slice(1)].map((ev, i) => ({
    ...ev,
    key: `${ev.id}-${i}`,
  }));
  return <EventList events={list} />;
}
