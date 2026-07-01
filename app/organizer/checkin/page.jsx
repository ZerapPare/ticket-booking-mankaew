import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/primitives";
import EventPicker from "@/components/organizer/event-picker";
import CheckinPanel from "@/components/organizer/checkin-panel";
import {
  getCheckinData,
  listEventOptions,
  getDefaultEventId,
} from "@/lib/data/organizer";

export const dynamic = "force-dynamic";
export const metadata = { title: "เช็คอินหน้างาน — Organizer | Mankaew" };

export default async function CheckinPage({ searchParams }) {
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const sp = await searchParams;

  const options = await listEventOptions(scope);
  const eventId = sp?.event || (await getDefaultEventId(scope));
  const data = eventId
    ? await getCheckinData(eventId, scope)
    : { checkedIn: 0, total: 0, recent: [] };
  const currentTitle = options.find((o) => o.id === eventId)?.title || "—";

  return (
    <div>
      <DashboardHeader
        title="เช็คอินหน้างาน"
        subtitle={currentTitle}
        action={
          <EventPicker
            options={options}
            value={eventId}
            basePath="/organizer/checkin"
          />
        }
      />
      <CheckinPanel key={eventId} initial={data} />
    </div>
  );
}
