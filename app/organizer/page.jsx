import Link from "next/link";
import {
  DashboardHeader,
  StatCard,
  BarChart,
  Panel,
} from "@/components/dashboard/primitives";
import {
  ORG_STATS,
  ORG_CHART,
  ORG_RECENT_ORDERS,
} from "@/lib/organizer-mock";

export const metadata = { title: "แดชบอร์ด — Organizer | Mankaew" };

export default function OrganizerDashboard() {
  return (
    <div>
      <DashboardHeader
        title="แดชบอร์ด"
        subtitle="ภาพรวมยอดขายและอีเวนต์ของคุณ"
        action={<CreateButton />}
      />
      <div className="p-[32px_40px]">
        <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {ORG_STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            title="ยอดขาย 14 วันล่าสุด"
            action={
              <span className="font-mono text-[13px] text-fainter">฿ / วัน</span>
            }
          >
            <BarChart data={ORG_CHART} height={180} />
          </Panel>

          <Panel title="คำสั่งซื้อล่าสุด">
            <div className="flex flex-col">
              {ORG_RECENT_ORDERS.map((o, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-[#f6f6f7] py-[11px] last:border-b-0"
                >
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface text-[13px] text-faint">
                    {o.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{o.name}</div>
                    <div className="text-[12px] text-fainter">{o.detail}</div>
                  </div>
                  <div className="text-[14px] font-semibold">{o.amount}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function CreateButton() {
  return (
    <Link
      href="/organizer/create"
      className="rounded-[9px] bg-accent px-[22px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
    >
      + สร้างอีเวนต์
    </Link>
  );
}
