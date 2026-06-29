import {
  DashboardHeader,
  TableShell,
  TableRow,
  StatusPill,
} from "@/components/dashboard/primitives";
import { ORG_ATTENDEES } from "@/lib/organizer-mock";

export const metadata = { title: "ผู้เข้างาน — Organizer | Mankaew" };

const TEMPLATE = "1.6fr 1fr 0.7fr 1fr 1fr";

export default function OrganizerAttendees() {
  return (
    <div>
      <DashboardHeader
        title="ผู้เข้างาน"
        subtitle="3,142 รายการ • NEON NIGHTS BANGKOK 2026"
        action={
          <div className="flex gap-[10px]">
            <div className="w-[220px] rounded-[9px] border border-line-2 px-4 py-[10px] text-[14px] text-fainter">
              ค้นหาชื่อ / รหัสคำสั่งซื้อ
            </div>
            <div className="rounded-[9px] border border-line-2 px-[18px] py-[10px] text-[14px] text-muted">
              กรอง ▾
            </div>
          </div>
        }
      />
      <div className="p-[32px_40px]">
        <TableShell
          template={TEMPLATE}
          headers={["ผู้ถือบัตร", "รหัสคำสั่งซื้อ", "จำนวน", "โซน", "สถานะ"]}
        >
          {ORG_ATTENDEES.map((a) => (
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
      </div>
    </div>
  );
}
