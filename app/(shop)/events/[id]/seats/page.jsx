import { notFound } from "next/navigation";
import SeatSelection from "@/components/seat-selection";
import { getEventDetail } from "@/lib/data/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "เลือกที่นั่ง — Mankaew" };

export default async function SeatsPage({ params }) {
  const { id } = await params;
<<<<<<< HEAD
<<<<<<< HEAD
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/events/${id}/seats`);

=======
>>>>>>> parent of 18b3827 (ระบบที่นั่ง)
=======
>>>>>>> parent of 18b3827 (ระบบที่นั่ง)
  const event = await getEventDetail(id);
  if (!event) notFound();
  // ผังที่นั่งยังเป็น mock ZONES ในขั้นนี้ — ใช้หัวข้ออีเวนต์จริง
  const { id: eid, title, date, venue, grad } = event;
  return <SeatSelection event={{ id: eid, title, date, venue, grad }} />;
}