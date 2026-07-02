import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader, Panel } from "@/components/dashboard/primitives";
import EventStatusControl from "@/components/organizer/event-status-control";
import { getOrganizerEventReport } from "@/lib/data/organizer";
import { formatBaht } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const report = await getOrganizerEventReport(id, scope);
  return {
    title: report
      ? `รายงานยอดขาย: ${report.event.title} — Organizer | Mankaew`
      : "ไม่พบอีเวนต์ — Mankaew",
  };
}

export default async function OrganizerReport({ params }) {
  const { id } = await params;
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const report = await getOrganizerEventReport(id, scope);
  if (!report) notFound();

  const { event, zones } = report;

  return (
    <div>
      <DashboardHeader
        title="รายงานยอดขาย"
        subtitle={event.title}
        action={
          event.status !== "cancelled" ? (
            <div className="flex gap-[10px]">
              <Link
                href={`/organizer/events/${id}/edit`}
                className="rounded-[9px] bg-accent px-[18px] py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                แก้ไขรายละเอียด
              </Link>
            </div>
          ) : null
        }
      />
      <div className="p-[32px_40px]">
        <EventStatusControl eventId={id} status={event.status} />

        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          <ReportCard label="รายได้รวม" value={formatBaht(event.revenue)} />
          <ReportCard
            label="บัตรที่ขายแล้ว"
            value={
              <>
                {event.sold.toLocaleString("en-US")}{" "}
                <span className="text-[16px] font-normal text-fainter">
                  / {event.cap.toLocaleString("en-US")}
                </span>
              </>
            }
          />
          <ReportCard
            label="รายได้สุทธิ (หลังหักค่าธรรมเนียม)"
            value={formatBaht(event.net)}
            accent
          />
        </div>

        <Panel title="ยอดขายแยกตามโซน">
          {event.revenue > 0 ? (
            <div className="flex flex-col gap-5">
              {zones.map((z) => (
                <div key={z.name}>
                  <div className="mb-2 flex justify-between">
                    <div className="flex items-center gap-[10px]">
                      <div
                        className="h-3 w-3 rounded-[3px]"
                        style={{ background: z.color }}
                      />
                      <span className="text-[14px] font-medium">{z.name}</span>
                      <span className="text-[13px] text-fainter">
                        {z.soldLabel}
                      </span>
                    </div>
                    <span className="text-[14px] font-semibold">
                      {z.revenueLabel}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f1]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${z.pct}%`, background: z.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[14px] text-fainter">
              อีเวนต์นี้ยังไม่มียอดขาย — ยังไม่มีข้อมูลแยกตามโซน
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ReportCard({ label, value, accent }) {
  return (
    <div className="rounded-[14px] border border-[#eee] bg-white p-6">
      <div className="mb-[10px] text-[13px] text-faint">{label}</div>
      <div
        className="text-[30px] font-bold"
        style={accent ? { color: "#7c3aed" } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
