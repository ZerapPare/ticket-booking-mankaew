import { notFound } from "next/navigation";
import QueueRoom from "@/components/queue-room";
import { getEventDetail } from "@/lib/data/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "ห้องรอคิว — Mankaew" };

export default async function QueuePage({ params }) {
  const { id } = await params;
  const event = await getEventDetail(id);
  if (!event) notFound();
  return <QueueRoom eventId={event.id} eventTitle={event.title} />;
}