"use client";

import Link from "next/link";
import { DashboardHeader, StatCard, BarChart, Panel } from "@/components/dashboard/primitives";
import { useAdmin } from "@/components/admin/admin-provider";
import { ADMIN_CHART } from "@/lib/admin-mock";

export default function AdminDashboard() {
  const { pendingApprovals, pendingRefunds } = useAdmin();

  const stats = [
    { label: "มูลค่าธุรกรรมรวม (เดือนนี้)", value: "฿54.3M", delta: "▲ 18.2%", deltaColor: "#22c55e" },
    { label: "ผู้ใช้ทั้งหมด", value: "142.8K", delta: "▲ 2,140 รายใหม่", deltaColor: "#22c55e" },
    { label: "อีเวนต์ที่เปิดขาย", value: "68", delta: `${pendingApprovals} รออนุมัติ`, deltaColor: "#f59e0b" },
    { label: "รายได้ค่าธรรมเนียม", value: "฿8.42M", delta: "หลังหักต้นทุน", deltaColor: "#71717a" },
  ];

  const todoCards = [
    { icon: "✓", bg: "#f5f3ff", fg: "#7c3aed", label: "อีเวนต์รออนุมัติ", sub: "ตรวจสอบและเผยแพร่", count: pendingApprovals, href: "/admin/approvals" },
    { icon: "↩", bg: "#fef2f2", fg: "#dc2626", label: "คำขอคืนเงิน", sub: "รอการพิจารณา", count: pendingRefunds, href: "/admin/refunds" },
    { icon: "฿", bg: "#fffbeb", fg: "#d97706", label: "รายการรอโอนเงิน", sub: "฿12.7M ค้างจ่าย", count: 8, href: "/admin/finance" },
  ];

  return (
    <div>
      <DashboardHeader
        title="ภาพรวมแพลตฟอร์ม"
        subtitle="สถิติทั้งระบบ • อัปเดตล่าสุด 19:45 น."
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
                ฿ ล้าน / วัน
              </span>
            }
          >
            <BarChart data={ADMIN_CHART} height={170} />
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
