"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/checkout-stepper";
import { useBooking } from "@/lib/booking-context";
import { useCountdown } from "@/lib/use-countdown";
import { getEvent, HOLD_SECONDS } from "@/lib/mock-data";
import { formatBaht, formatClock, seatLabel, sortSeats } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const {
    hydrated,
    eventId,
    zone,
    qty,
    seats,
    subtotal,
    fee,
    total,
    holdExpiresAt,
    clearHold,
  } = useBooking();

  const event = getEvent(eventId);
  const remaining = useCountdown(holdExpiresAt);

  // no valid selection (e.g. direct visit) → back to browsing
  useEffect(() => {
    if (hydrated && (!event || !zone || qty === 0)) router.replace("/events");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // hold expired → release and return to event
  useEffect(() => {
    if (remaining === 0 && event) {
      clearHold();
      router.replace(`/events/${event.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  if (!hydrated || !event || !zone || qty === 0) return null;

  const seatText = sortSeats(seats).map(seatLabel).join(", ");
  const holdLabel = formatClock(remaining ?? HOLD_SECONDS);

  return (
    <div className="mx-auto max-w-[880px] px-12 pb-14 pt-9">
      <CheckoutStepper current={2} />

      {/* hold countdown */}
      <div
        className="mb-7 flex items-center justify-between rounded-[14px] px-[26px] py-5 text-white"
        style={{ background: "linear-gradient(120deg,#7c3aed,#9333ea)" }}
      >
        <div className="flex items-center gap-[14px]">
          <span className="text-[24px]">⏱</span>
          <div>
            <div className="text-[14px] opacity-85">เวลาถือบัตรของคุณ</div>
            <div className="text-[13px] opacity-70">
              ชำระเงินภายในเวลาที่กำหนด มิฉะนั้นบัตรจะถูกปล่อยคืน
            </div>
          </div>
        </div>
        <div className="font-mono text-[40px] font-bold tracking-[1px]">
          {holdLabel}
        </div>
      </div>

      <h1 className="mb-6 text-[30px] font-bold tracking-[-.5px]">
        สรุปคำสั่งซื้อ
      </h1>

      <div className="mb-6 overflow-hidden rounded-[16px] border border-[#eee]">
        <div className="flex gap-5 border-b border-surface p-6">
          <div
            className="aspect-[3/4] w-[90px] flex-shrink-0 rounded-[8px]"
            style={{ background: event.grad }}
          />
          <div className="flex-1">
            <div className="mb-[6px] text-[19px] font-semibold">
              {event.title}
            </div>
            <div className="mb-[14px] text-[14px] text-faint">
              {event.date} • {event.venue}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-surface px-3 py-[6px] text-[13px]">
                {zone.name}
              </span>
              <span className="rounded-full bg-surface px-3 py-[6px] text-[13px]">
                {qty} ใบ
              </span>
              <span className="rounded-full bg-accent-soft-2 px-3 py-[6px] font-mono text-[13px] text-accent">
                ที่นั่ง {seatText}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-[22px]">
          <div className="mb-[10px] flex justify-between text-[14px] text-faint">
            <span>
              ราคาบัตร ({zone.name}) × {qty}
            </span>
            <span>{formatBaht(subtotal)}</span>
          </div>
          <div className="mb-[10px] flex justify-between text-[14px] text-faint">
            <span>ค่าธรรมเนียมระบบ</span>
            <span>{formatBaht(fee)}</span>
          </div>
          <div className="mt-[6px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[20px] font-bold">
            <span>ยอดชำระทั้งหมด</span>
            <span>{formatBaht(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-[14px]">
        <button
          onClick={() => router.push(`/events/${event.id}/seats`)}
          className="rounded-[10px] border border-[#d4d4d8] px-7 py-[15px] text-[16px] font-medium text-ink transition-colors hover:bg-surface"
        >
          ← แก้ไข
        </button>
        <button
          onClick={() => router.push("/payment")}
          className="flex-1 rounded-[10px] bg-accent py-[15px] text-center text-[16px] font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          ดำเนินการชำระเงิน
        </button>
      </div>
    </div>
  );
}
