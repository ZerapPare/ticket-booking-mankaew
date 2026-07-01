"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import CheckoutStepper from "@/components/checkout-stepper";
import { useBooking } from "@/lib/booking-context";
import { useCountdown } from "@/lib/use-countdown";
import { cancelOrderAction, confirmPaymentAction } from "@/lib/actions/booking";
import { formatBaht, formatClock } from "@/lib/format";

const METHODS = [
  { id: "card", icon: "💳", label: "บัตรเครดิต / เดบิต", sub: "Visa, Mastercard, JCB" },
  { id: "promptpay", icon: "📱", label: "PromptPay / QR", sub: "สแกนจ่ายผ่านแอปธนาคาร" },
  { id: "mbanking", icon: "🏦", label: "Mobile Banking", sub: "SCB, KBank, Krungthai, BBL" },
];

export default function PaymentPage() {
  const router = useRouter();
  const {
    hydrated,
    event,
    zone,
    qty,
    subtotal,
    fee,
    total,
    payMethod,
    txnId,
    holdExpiresAt,
    setPayMethod,
    clearHold,
  } = useBooking();

  const remaining = useCountdown(holdExpiresAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && (!event || !zone || qty === 0 || !txnId))
      router.replace("/events");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (remaining === 0 && event && txnId) {
      cancelOrderAction(txnId);
      clearHold();
      router.replace(`/events/${event.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  if (!hydrated || !event || !zone || qty === 0 || !txnId) return null;

  const holdLabel = formatClock(remaining ?? 0);
  const showQR = payMethod === "promptpay" || payMethod === "mbanking";

  async function confirm() {
    setError("");
    setSubmitting(true);
    const res = await confirmPaymentAction(txnId, payMethod);
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      return;
    }
    clearHold();
    router.push(`/tickets/${txnId}`);
  }

  return (
    <div className="mx-auto max-w-[880px] px-12 pb-14 pt-9">
      <CheckoutStepper
        current={3}
        right={<span className="text-accent">⏱ {holdLabel}</span>}
      />
      <h1 className="mb-6 text-[30px] font-bold tracking-[-.5px]">ชำระเงิน</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-[14px] text-[14px] font-semibold text-muted">
            เลือกวิธีชำระเงิน
          </div>
          <div className="mb-[30px] flex flex-col gap-3">
            {METHODS.map((m) => {
              const on = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
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

          {payMethod === "card" ? (
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
                {/* Real QR encoding a mock PromptPay payment payload */}
                <QRCodeSVG
                  value={`promptpay://mankaew?amount=${total}&ref=${txnId}`}
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
            <div className="mb-1 text-[17px] font-semibold">{event.title}</div>
            <div className="mb-[18px] text-[13px] text-faint">
              {zone.name} • {qty} ใบ
            </div>
            <div className="mb-2 flex justify-between text-[14px] text-faint">
              <span>ราคาบัตร</span>
              <span>{formatBaht(subtotal)}</span>
            </div>
            <div className="mb-[14px] flex justify-between text-[14px] text-faint">
              <span>ค่าธรรมเนียม</span>
              <span>{formatBaht(fee)}</span>
            </div>
            <div className="mb-[22px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[19px] font-bold">
              <span>รวม</span>
              <span>{formatBaht(total)}</span>
            </div>

            {error ? (
              <div className="mb-3 rounded-[10px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#dc2626]">
                {error}
              </div>
            ) : null}

            <button
              onClick={confirm}
              disabled={submitting}
              className="w-full rounded-[10px] py-[15px] text-center text-[16px] font-semibold text-white transition-colors"
              style={{ background: submitting ? "#c4b5fd" : "#7c3aed" }}
            >
              {submitting ? "กำลังยืนยัน…" : `ยืนยันชำระเงิน ${formatBaht(total)}`}
            </button>
            <div className="mt-3 text-center text-[11px] text-fainter">
              🔒 ชำระเงินอย่างปลอดภัยผ่านระบบเข้ารหัส
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}