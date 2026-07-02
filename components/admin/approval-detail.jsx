"use client";

import { useState } from "react";

// ปุ่ม "ดูรายละเอียด" ต่อการ์ด — ขยายดูคำอธิบาย + โซนของอีเวนต์ที่รออนุมัติ
export default function ApprovalDetail({ description, zones = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-[#f0f0f1] pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[13px] font-medium text-accent"
      >
        {open ? "ซ่อนรายละเอียด ▴" : "ดูรายละเอียด ▾"}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <div className="mb-1 text-[12px] font-semibold text-fainter">
              รายละเอียดงาน
            </div>
            <p className="whitespace-pre-line text-[13px] text-faint">
              {description || "— ไม่มีคำอธิบาย —"}
            </p>
          </div>

          <div>
            <div className="mb-[6px] text-[12px] font-semibold text-fainter">
              โซนบัตร ({zones.length})
            </div>
            {zones.length > 0 ? (
              <div className="flex flex-col gap-[6px]">
                {zones.map((z, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[9px] border border-[#eee] px-[14px] py-[9px] text-[13px]"
                  >
                    <span className="font-medium">{z.name}</span>
                    <span className="flex items-center gap-4 text-fainter">
                      <span>{z.type}</span>
                      <span className="font-semibold text-ink">{z.price}</span>
                      <span>{z.cap} ที่นั่ง</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-fainter">ยังไม่มีโซนบัตร</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
