"use client";

import { DashboardHeader } from "@/components/dashboard/primitives";
import { useAdmin } from "@/components/admin/admin-provider";

// TODO: no approval table in schema yet — approve/reject only mutate local state.
export default function AdminApprovals() {
  const { approvals, resolveApproval } = useAdmin();

  return (
    <div>
      <DashboardHeader
        title="อนุมัติอีเวนต์"
        subtitle={`${approvals.length} อีเวนต์รอการตรวจสอบ`}
      />
      <div className="p-[32px_40px]">
        {approvals.length > 0 ? (
          <div className="flex flex-col gap-4">
            {approvals.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-[22px] rounded-[16px] border border-[#eee] bg-white p-6"
              >
                <div
                  className="h-24 w-[72px] flex-shrink-0 rounded-[10px]"
                  style={{ background: a.grad }}
                />
                <div className="flex-1">
                  <div className="mb-[6px] flex items-center gap-[10px]">
                    <span className="text-[18px] font-semibold">{a.title}</span>
                    <span className="rounded-full bg-accent-soft px-[10px] py-[3px] text-[11px] font-semibold text-accent">
                      {a.cat}
                    </span>
                  </div>
                  <div className="mb-[6px] text-[13px] text-faint">
                    {a.date} • {a.venue} • {a.cap} ที่นั่ง
                  </div>
                  <div className="text-[13px] text-fainter">
                    โดย {a.organizer} • ส่งเมื่อ {a.submitted}
                  </div>
                </div>
                <div className="flex gap-[10px]">
                  <button
                    onClick={() => resolveApproval(a.id)}
                    className="rounded-[9px] border border-line-2 px-5 py-[10px] text-[14px] font-medium text-danger transition-colors hover:bg-danger-bg"
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={() => resolveApproval(a.id)}
                    className="rounded-[9px] bg-accent px-6 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
                  >
                    อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#eee] bg-white p-16 text-center">
            <div className="mb-3 text-[40px]">✓</div>
            <div className="mb-[6px] text-[18px] font-semibold">
              ตรวจสอบครบทุกรายการแล้ว
            </div>
            <div className="text-[14px] text-faint">
              ไม่มีอีเวนต์ที่รอการอนุมัติในขณะนี้
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
