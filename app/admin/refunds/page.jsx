"use client";

import { DashboardHeader } from "@/components/dashboard/primitives";
import { useAdmin } from "@/components/admin/admin-provider";

// TODO: no refunds table in schema — approve/deny only mutate local state.
export default function AdminRefunds() {
  const { refunds, pendingRefunds, setRefundState } = useAdmin();

  return (
    <div>
      <DashboardHeader
        title="คำขอคืนเงิน"
        subtitle={`${pendingRefunds} คำขอรอดำเนินการ`}
      />
      <div className="flex flex-col gap-[14px] p-[32px_40px]">
        {refunds.map((r) => {
          const resolved = r.state !== "pending";
          const resLabel = r.state === "approved" ? "คืนเงินแล้ว" : "ปฏิเสธแล้ว";
          const resColor = r.state === "approved" ? "#16a34a" : "#71717a";
          const resBg = r.state === "approved" ? "#f0fdf4" : "#f4f4f5";
          return (
            <div
              key={r.id}
              className="flex items-center gap-5 rounded-[14px] border border-[#eee] bg-white p-[22px]"
            >
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-surface text-[14px] font-semibold text-faint">
                {r.initial}
              </div>
              <div className="flex-1">
                <div className="mb-[3px] text-[15px] font-semibold">
                  {r.name}{" "}
                  <span className="font-mono text-[13px] font-normal text-fainter">
                    · {r.order}
                  </span>
                </div>
                <div className="text-[13px] text-faint">
                  {r.event} • {r.detail}
                </div>
                <div className="mt-1 text-[13px] text-fainter">
                  เหตุผล: {r.reason}
                </div>
              </div>
              <div className="mr-2 text-right">
                <div className="text-[18px] font-bold">{r.amount}</div>
                <div className="text-[12px] text-fainter">{r.requested}</div>
              </div>
              {resolved ? (
                <span
                  className="rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold"
                  style={{ color: resColor, background: resBg }}
                >
                  {resLabel}
                </span>
              ) : (
                <div className="flex gap-[10px]">
                  <button
                    onClick={() => setRefundState(r.id, "denied")}
                    className="rounded-[9px] border border-line-2 px-[18px] py-[10px] text-[14px] font-medium text-muted transition-colors hover:bg-surface"
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={() => setRefundState(r.id, "approved")}
                    className="rounded-[9px] bg-accent px-5 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
                  >
                    อนุมัติคืนเงิน
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
