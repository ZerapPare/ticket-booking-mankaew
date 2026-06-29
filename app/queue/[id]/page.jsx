import { notFound } from "next/navigation";
import QueueRoom from "@/components/queue-room";
import { getEvent } from "@/lib/mock-data";

export const metadata = { title: "ห้องรอคิว — Mankaew" };

export default async function QueuePage({ params }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();
  return <QueueRoom eventId={event.id} eventTitle={event.title} />;
}
