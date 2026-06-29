import { DashboardHeader, Panel } from "@/components/dashboard/primitives";
import { ORG_ZONE_SALES } from "@/lib/organizer-mock";

export const metadata = { title: "รายงานยอดขาย — Organizer | Mankaew" };

export default function OrganizerReport() {
  return (
    <div>
      <DashboardHeader
        title="รายงานยอดขาย"
        subtitle="NEON NIGHTS BANGKOK 2026"
        action={
          <div className="rounded-[9px] border border-line-2 px-[18px] py-[10px] text-[14px] text-muted">
            ส่งออกรายงาน ⬇
          </div>
        }
      />
      <div className="p-[32px_40px]">
        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          <ReportCard label="รายได้รวม" value="฿4,287,500" />
          <ReportCard
            label="บัตรที่ขายแล้ว"
            value={
              <>
                3,142{" "}
                <span className="text-[16px] font-normal text-fainter">
                  / 5,000
                </span>
              </>
            }
          />
          <ReportCard
            label="รายได้สุทธิ (หลังหักค่าธรรมเนียม)"
            value="฿3,980,000"
            accent
          />
        </div>

        <Panel title="ยอดขายแยกตามโซน">
          <div className="flex flex-col gap-5">
            {ORG_ZONE_SALES.map((z) => (
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
                  <span className="text-[14px] font-semibold">{z.revenue}</span>
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
