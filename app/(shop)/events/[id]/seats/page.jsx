import { notFound } from "next/navigation";
import SeatSelection from "@/components/seat-selection";
import { getEventDetail, getSeatMap } from "@/lib/data/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "เลือกที่นั่ง — Mankaew" };

export default async function SeatsPage({ params }) {
  const { id } = await params;
  const event = await getEventDetail(id);
  if (!event) notFound();

  // ผังเก้าอี้ของโซน seated ทุกโซน (โหลดตอนเข้าเพจ) — โซนยืน/ga ไม่มีผัง
  const seatMaps = {};
  await Promise.all(
    event.zones
      .filter((z) => z.seatingType === "seated")
      .map(async (z) => {
        seatMaps[z.id] = await getSeatMap(z.id);
      })
  );

  const { id: eid, title, date, venue, grad, zones } = event;
  return (
    <SeatSelection
      event={{ id: eid, title, date, venue, grad }}
      zones={zones}
      seatMaps={seatMaps}
    />
  );
}