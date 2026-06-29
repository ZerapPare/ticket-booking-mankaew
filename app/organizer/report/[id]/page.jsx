import { notFound } from "next/navigation";
import { DashboardHeader, Panel } from "@/components/dashboard/primitives";
import {
  ORG_EVENTS,
  getOrgEvent,
  zoneBreakdownFor,
  PLATFORM_FEE_RATE,
} from "@/lib/organizer-mock";
import { formatBaht } from "@/lib/format";

export function generateStaticParams() {
  return ORG_EVENTS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const ev = getOrgEvent(id);
  return {
    title: ev
      ? `รายงานยอดขาย: ${ev.title} — Organizer | Mankaew`
      : "ไม่พบอีเวนต์ — Mankaew",
  };
}

export default async function OrganizerReport({ params }) {
  const { id } = await params;
  const event = getOrgEvent(id);
  if (!event) notFound();

  const net = Math.round(event.revenue * (1 - PLATFORM_FEE_RATE));
  const zones = zoneBreakdownFor(event);

  return (
    <div>
      <DashboardHeader
        title="รายงานยอดขาย"
        subtitle={event.title}
        action={
          <div className="rounded-[9px] border border-line-2 px-[18px] py-[10px] text-[14px] text-muted">
            ส่งออกรายงาน ⬇
          </div>
        }
      />
      <div className="p-[32px_40px]">
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
            value={formatBaht(net)}
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
              อีเวนต์นี้ยังไม่เริ่มขาย — ยังไม่มียอดขายแยกตามโซน
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
