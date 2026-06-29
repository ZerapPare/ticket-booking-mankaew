"use client";

import {
  DashboardHeader,
  TableShell,
  TableRow,
  StatusPill,
} from "@/components/dashboard/primitives";
import { useAdmin } from "@/components/admin/admin-provider";

const TEMPLATE = "1.8fr 1.2fr 1fr 1fr 0.9fr";

// TODO: no payouts table in schema — "โอนเงิน" only mutates local state.
export default function AdminFinance() {
  const { payouts, payPayout } = useAdmin();

  return (
    <div>
      <DashboardHeader
        title="การเงิน & การจ่ายเงิน"
        subtitle="รายได้ค่าธรรมเนียม และการโอนเงินให้ผู้จัดงาน"
      />
      <div className="p-[32px_40px]">
        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[14px] bg-dark p-6 text-white">
            <div className="mb-[10px] text-[13px] opacity-70">
              รายได้ค่าธรรมเนียมรวม
            </div>
            <div className="text-[30px] font-bold">฿8.42M</div>
            <div className="mt-2 text-[12px] opacity-60">เดือนนี้</div>
          </div>
          <FinanceCard label="รอโอนให้ผู้จัดงาน" value="฿12.7M" sub="8 รายการ" color="#f59e0b" />
          <FinanceCard label="โอนแล้วเดือนนี้" value="฿34.1M" sub="42 รายการ" color="#16a34a" />
        </div>

        <TableShell
          template={TEMPLATE}
          headers={["อีเวนต์ / ผู้จัดงาน", "ยอดสุทธิ", "กำหนดโอน", "สถานะ", ""]}
        >
          {payouts.map((p) => {
            const stColor = p.paid ? "#16a34a" : p.locked ? "#71717a" : "#d97706";
            const stBg = p.paid ? "#f0fdf4" : p.locked ? "#f4f4f5" : "#fffbeb";
            const action = p.paid ? "ดูใบเสร็จ" : p.locked ? "—" : "โอนเงิน";
            const actColor = p.paid ? "#71717a" : p.locked ? "#d4d4d8" : "#7c3aed";
            return (
              <TableRow key={p.id} template={TEMPLATE}>
                <div>
                  <div className="text-[14px] font-semibold">{p.event}</div>
                  <div className="text-[12px] text-fainter">{p.org}</div>
                </div>
                <span className="text-[15px] font-semibold">{p.amount}</span>
                <span className="text-[13px] text-faint">{p.due}</span>
                <span>
                  <StatusPill label={p.status} color={stColor} bg={stBg} />
                </span>
                <span className="text-right">
                  <button
                    onClick={() => !p.paid && !p.locked && payPayout(p.id)}
                    disabled={p.paid || p.locked}
                    className="text-[13px] font-semibold"
                    style={{ color: actColor, cursor: p.paid || p.locked ? "default" : "pointer" }}
                  >
                    {action}
                  </button>
                </span>
              </TableRow>
            );
          })}
        </TableShell>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, sub, color }) {
  return (
    <div className="rounded-[14px] border border-[#eee] bg-white p-6">
      <div className="mb-[10px] text-[13px] text-faint">{label}</div>
      <div className="text-[30px] font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-2 text-[12px] text-fainter">{sub}</div>
    </div>
  );
}
