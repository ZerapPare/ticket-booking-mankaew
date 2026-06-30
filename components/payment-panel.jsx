"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { confirmPayment } from "@/lib/actions/booking";
import { formatBaht } from "@/lib/format";

const METHODS = [
  { id: "card", icon: "💳", label: "บัตรเครดิต / เดบิต", sub: "Visa, Mastercard, JCB" },
  { id: "promptpay", icon: "📱", label: "PromptPay / QR", sub: "สแกนจ่ายผ่านแอปธนาคาร" },
  { id: "mbanking", icon: "🏦", label: "Mobile Banking", sub: "SCB, KBank, Krungthai, BBL" },
];

export default function PaymentPanel({ txnId, total, eventTitle, zoneLabel, qty }) {
  const router = useRouter();
  const [method, setMethod] = useState("card");
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const showQR = method === "promptpay" || method === "mbanking";

  function pay() {
    if (pending) return;
    setError(null);
    start(async () => {
      const res = await confirmPayment(txnId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(`/tickets/${txnId}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-[14px] text-[14px] font-semibold text-muted">
          เลือกวิธีชำระเงิน
        </div>
        <div className="mb-[30px] flex flex-col gap-3">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="flex items-center gap-[14px] rounded-[12px] border-2 px-5 py-4 text-left transition-colors"
                style={{
                  borderColor: on ? "#7c3aed" : "#eee",
                  background: on ? "#faf5ff" : "#fff",
                }}
              >
                <span className="text-[22px]">{m.icon}</span>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{m.label}</div>
                  <div className="text-[13px] text-faint">{m.sub}</div>
                </div>
                <span
                  className="h-[18px] w-[18px] rounded-full border-2"
                  style={{
                    borderColor: on ? "#7c3aed" : "#d4d4d8",
                    background: on ? "#7c3aed" : "#fff",
                  }}
                />
              </button>
            );
          })}
        </div>

        {method === "card" ? (
          <div className="rounded-[12px] border border-[#eee] p-[22px]">
            <div className="mb-[6px] text-[13px] text-faint">หมายเลขบัตร</div>
            <div className="mb-4 rounded-[8px] border border-line-2 px-[14px] py-[13px] font-mono text-[15px] text-fainter">
              0000 0000 0000 0000
            </div>
            <div className="flex gap-[14px]">
              <div className="flex-1">
                <div className="mb-[6px] text-[13px] text-faint">วันหมดอายุ</div>
                <div className="rounded-[8px] border border-line-2 px-[14px] py-[13px] font-mono text-[15px] text-fainter">
                  MM / YY
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-[6px] text-[13px] text-faint">CVV</div>
                <div className="rounded-[8px] border border-line-2 px-[14px] py-[13px] font-mono text-[15px] text-fainter">
                  •••
                </div>
              </div>
            </div>
          </div>
        ) : showQR ? (
          <div className="rounded-[12px] border border-[#eee] p-7 text-center">
            <div className="mb-[18px] text-[14px] text-muted">
              สแกน QR เพื่อชำระผ่านแอปธนาคาร
            </div>
            <div className="mx-auto w-fit rounded-[10px] border border-line-2 bg-white p-3">
              <QRCodeSVG
                value={`promptpay://mankaew?amount=${total}&txn=${txnId}`}
                size={170}
                level="M"
              />
            </div>
            <div className="mt-3 font-mono text-[11px] text-fainter">
              PromptPay • {formatBaht(total)}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <div className="rounded-[16px] border border-line-2 p-6">
          <div className="mb-4 font-mono text-[13px] tracking-[1px] text-faint">
            สรุปยอด
          </div>
          <div className="mb-1 text-[17px] font-semibold">{eventTitle}</div>
          <div className="mb-[18px] text-[13px] text-faint">
            {zoneLabel} • {qty} ใบ
          </div>
          <div className="mb-[22px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[19px] font-bold">
            <span>รวม</span>
            <span>{formatBaht(total)}</span>
          </div>

          {error && (
            <div className="mb-3 rounded-[9px] bg-danger-bg px-[14px] py-3 text-[13px] text-danger">
              {error}
            </div>
          )}

          <button
            onClick={pay}
            disabled={pending}
            className="w-full rounded-[10px] bg-accent py-[15px] text-center text-[16px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "กำลังยืนยัน..." : `ยืนยันชำระเงิน ${formatBaht(total)}`}
          </button>
          <div className="mt-3 text-center text-[11px] text-fainter">
            🔒 ชำระเงินอย่างปลอดภัยผ่านระบบเข้ารหัส
          </div>
        </div>
      </div>
    </div>
  );
}
