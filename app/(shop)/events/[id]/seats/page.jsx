import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import SeatSelection from "@/components/seat-selection";
import { getEventDetail } from "@/lib/data/events";
import { getZonesAvailability } from "@/lib/data/seats";

export const dynamic = "force-dynamic";
export const metadata = { title: "เลือกที่นั่ง — Mankaew" };

export default async function SeatsPage({ params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/events/${id}/seats`);

  const event = await getEventDetail(id);
  if (!event) notFound();
  const zones = await getZonesAvailability(id);

  const { id: eid, title, date, venue, grad } = event;
  return (
    <SeatSelection event={{ id: eid, title, date, venue, grad }} zones={zones} />
  );
}
