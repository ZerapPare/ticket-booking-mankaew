import Link from "next/link";
import { auth } from "@/auth";
import {
  DashboardHeader,
  TableShell,
  TableRow,
  StatusPill,
} from "@/components/dashboard/primitives";
import { CreateButton } from "@/app/organizer/page";
import { listOrganizerEvents } from "@/lib/data/organizer";

export const dynamic = "force-dynamic";
export const metadata = { title: "อีเวนต์ของฉัน — Organizer | Mankaew" };

const TEMPLATE = "2.4fr 1.4fr 1fr 1.2fr 0.6fr";

export default async function OrganizerEvents() {
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const events = await listOrganizerEvents(scope);

  return (
    <div>
      <DashboardHeader
        title="อีเวนต์ของฉัน"
        subtitle="จัดการอีเวนต์ทั้งหมด"
        action={<CreateButton />}
      />
      <div className="p-[32px_40px]">
        {events.length > 0 ? (
          <TableShell
            template={TEMPLATE}
            headers={["อีเวนต์", "วันที่", "สถานะ", "ขายแล้ว", ""]}
          >
            {events.map((e) => (
              <TableRow key={e.id} template={TEMPLATE}>
                <div className="flex items-center gap-[14px]">
                  <div
                    className="h-[42px] w-[42px] flex-shrink-0 rounded-[8px]"
                    style={{ background: e.grad }}
                  />
                  <div>
                    <div className="text-[15px] font-semibold">{e.title}</div>
                    <div className="text-[12px] text-fainter">{e.venue}</div>
                  </div>
                </div>
                <span className="text-[14px] text-muted">{e.date}</span>
                <span>
                  <StatusPill label={e.status} color={e.stColor} bg={e.stBg} />
                </span>
                <div>
                  <div className="mb-[5px] text-[13px] font-semibold">
                    {e.soldLabel}
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-[#f0f0f1]">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${e.pct}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/organizer/report/${e.id}`}
                  className="text-right text-[13px] font-medium text-accent"
                >
                  จัดการ →
                </Link>
              </TableRow>
            ))}
          </TableShell>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#e4e4e7] bg-white p-12 text-center text-[14px] text-fainter">
            ยังไม่มีอีเวนต์ —{" "}
            <Link href="/organizer/create" className="font-medium text-accent">
              สร้างอีเวนต์แรกของคุณ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
