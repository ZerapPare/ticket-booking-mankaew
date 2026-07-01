import { auth } from "@/auth";
import {
  DashboardHeader,
  TableShell,
  TableRow,
  StatusPill,
} from "@/components/dashboard/primitives";
import EventPicker from "@/components/organizer/event-picker";
import {
  listAttendees,
  listEventOptions,
  getDefaultEventId,
} from "@/lib/data/organizer";

export const dynamic = "force-dynamic";
export const metadata = { title: "ผู้เข้างาน — Organizer | Mankaew" };

const TEMPLATE = "1.6fr 1fr 0.7fr 1fr 1fr";

export default async function OrganizerAttendees({ searchParams }) {
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const sp = await searchParams;

  const options = await listEventOptions(scope);
  const eventId = sp?.event || (await getDefaultEventId(scope));
  const attendees = eventId ? await listAttendees(eventId, scope) : [];
  const currentTitle = options.find((o) => o.id === eventId)?.title || "—";

  return (
    <div>
      <DashboardHeader
        title="ผู้เข้างาน"
        subtitle={`${attendees.length.toLocaleString("en-US")} รายการ • ${currentTitle}`}
        action={
          <EventPicker
            options={options}
            value={eventId}
            basePath="/organizer/attendees"
          />
        }
      />
      <div className="p-[32px_40px]">
        {attendees.length > 0 ? (
          <TableShell
            template={TEMPLATE}
            headers={["ผู้ถือบัตร", "รหัสคำสั่งซื้อ", "จำนวน", "โซน", "สถานะ"]}
          >
            {attendees.map((a) => (
              <TableRow key={a.order} template={TEMPLATE}>
                <div className="flex items-center gap-3">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface text-[13px] text-faint">
                    {a.initial}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">{a.name}</div>
                    <div className="text-[12px] text-fainter">{a.email}</div>
                  </div>
                </div>
                <span className="font-mono text-[13px] text-muted">{a.order}</span>
                <span className="text-[14px]">{a.qty}</span>
                <span className="text-[14px] text-muted">{a.zone}</span>
                <span>
                  <StatusPill label={a.status} color={a.stColor} bg={a.stBg} />
                </span>
              </TableRow>
            ))}
          </TableShell>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#e4e4e7] bg-white p-12 text-center text-[14px] text-fainter">
            {options.length === 0
              ? "ยังไม่มีอีเวนต์"
              : "ยังไม่มีผู้เข้างานสำหรับอีเวนต์นี้"}
          </div>
        )}
      </div>
    </div>
  );
}
