import EventList from "@/components/event-list";
import { listPublishedEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "อีเวนต์ทั้งหมด — Mankaew" };

export default async function EventsPage() {
  const events = await listPublishedEvents();
  return <EventList events={events} />;
}