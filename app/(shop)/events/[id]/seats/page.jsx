import { notFound } from "next/navigation";
import SeatSelection from "@/components/seat-selection";
import { EVENTS, getEvent } from "@/lib/mock-data";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

export const metadata = { title: "เลือกที่นั่ง — Mankaew" };

export default async function SeatsPage({ params }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();
  // pass only serializable fields to the client component
  const { id: eid, title, date, venue, grad } = event;
  return <SeatSelection event={{ id: eid, title, date, venue, grad }} />;
}
