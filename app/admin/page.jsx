import Link from "next/link";
import { DashboardHeader, StatCard, BarChart, Panel } from "@/components/dashboard/primitives";
import { getAdminOverview, getAdminBadges } from "@/lib/data/admin";

export default async function AdminDashboard() {
  const [{ stats, chart }, badges] = await Promise.all([
    getAdminOverview(),
    getAdminBadges(),
  ]);

  const todoCards = [
    { icon: "✓", bg: "#f5f3ff", fg: "#7c3aed", label: "อีเวนต์รออนุมัติ", sub: "ตรวจสอบและเผยแพร่", count: badges.pendingApprovals, href: "/admin/approvals" },
  ];

  return (
    <div>
      <DashboardHeader
        title="ภาพรวมแพลตฟอร์ม"
        subtitle="สถิติทั้งระบบ"
      />
      <div className="p-[32px_40px]">
        <div className="mb-7 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            title="มูลค่าธุรกรรมรวม (GMV) — 14 วัน"
            action={
              <span className="font-mono text-[13px] text-fainter">
                ฿ / วัน
              </span>
            }
          >
            <BarChart data={chart} height={170} />
          </Panel>

          <Panel title="ต้องดำเนินการ">
            <div className="mb-[18px] -mt-3 text-[13px] text-faint">
              รายการที่รอคุณตรวจสอบ
            </div>
            <div className="flex flex-col gap-[10px]">
              {todoCards.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="flex items-center gap-[14px] rounded-[11px] border border-[#eee] p-[14px_16px] transition-colors hover:border-accent-border"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[18px]"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold">{t.label}</div>
                    <div className="text-[12px] text-fainter">{t.sub}</div>
                  </div>
                  <span className="text-[18px] font-bold text-accent">
                    {t.count}
                  </span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
