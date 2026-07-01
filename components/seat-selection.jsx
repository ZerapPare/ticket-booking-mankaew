"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/checkout-stepper";
import { useBooking } from "@/lib/booking-context";
import { useCountdown } from "@/lib/use-countdown";
import { ZONES, buildSeatRows, MAX_SEATS, HOLD_SECONDS } from "@/lib/mock-data";
import { formatBaht, formatClock, seatLabel, sortSeats } from "@/lib/format";

export default function SeatSelection({ event }) {
  const router = useRouter();
  const b = useBooking();
  const {
    eventId,
    zoneId,
    seats,
    zone,
    qty,
    subtotal,
    fee,
    total,
    holdExpiresAt,
    selectEvent,
    selectZone,
    toggleSeat,
    startHold,
    clearHold,
  } = b;

  // bind the flow to this event + start the 10-min hold
  useEffect(() => {
    if (eventId !== event.id) selectEvent(event.id);
    startHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const remaining = useCountdown(holdExpiresAt);

  // hold expired → release seats and return to the event
  useEffect(() => {
    if (remaining === 0) {
      clearHold();
      router.replace(`/events/${event.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const rows = zoneId ? buildSeatRows(zoneId) : [];
  const chips = sortSeats(seats).map(seatLabel);
  const holdLabel = formatClock(remaining ?? HOLD_SECONDS);

  return (
    <div className="mx-auto max-w-[1280px] px-12 pb-14 pt-9">
      <CheckoutStepper
        current={1}
        right={
          <span className="text-accent">⏱ ถือบัตรไว้ {holdLabel}</span>
        }
      />
      <h1 className="mb-7 text-[32px] font-bold tracking-[-.5px]">เลือกที่นั่ง</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Venue map */}
        <div className="rounded-[16px] border border-[#eee] bg-bg-soft p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {ZONES.map((z) => {
              const on = z.id === zoneId;
              return (
                <button
                  key={z.id}
                  onClick={() => selectZone(z.id)}
                  className="flex items-center gap-[9px] rounded-full border-[1.5px] px-[15px] py-[9px] transition-all"
                  style={{
                    background: on ? "#f5f3ff" : "#fff",
                    borderColor: on ? "#7c3aed" : "#e4e4e7",
                  }}
                >
                  <span
                    className="h-[11px] w-[11px] rounded-[3px]"
                    style={{ background: z.color }}
                  />
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: on ? "#7c3aed" : "#18181b" }}
                  >
                    {z.name}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: on ? "#7c3aed" : "#a1a1aa" }}
                  >
                    {formatBaht(z.price)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-[8px] bg-dark py-[11px] text-center font-mono text-[13px] tracking-[4px] text-white">
            STAGE • เวที
          </div>

          {zoneId ? (
            <div className="mt-7">
              <div className="mb-[18px] flex items-center justify-between">
                <div className="text-[15px] font-semibold">
                  เลือกเก้าอี้ในโซน {zone?.name}
                </div>
                <div className="text-[13px] text-faint">
                  สูงสุด {MAX_SEATS} ที่นั่ง
                </div>
              </div>
              <div className="seatmap-scroll flex flex-col items-center gap-[7px] overflow-x-auto">
                {rows.map((row) => (
                  <div key={row.letter} className="flex items-center gap-2">
                    <span className="w-4 text-center font-mono text-[11px] text-fainter">
                      {row.letter}
                    </span>
                    <div className="flex gap-[6px]">
                      {row.seats.map((st) => {
                        const selected = seats.includes(st.id);
                        const bg = st.taken
                          ? "#e5e5e5"
                          : selected
                            ? "#7c3aed"
                            : "#fff";
                        const bd = st.taken
                          ? "#e5e5e5"
                          : selected
                            ? "#7c3aed"
                            : "#d4d4d8";
                        const fg = selected
                          ? "#fff"
                          : st.taken
                            ? "#c4c4c4"
                            : "#71717a";
                        return (
                          <button
                            key={st.id}
                            disabled={st.taken}
                            onClick={() => toggleSeat(st.id)}
                            className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px] border-[1.5px] text-[10px] transition-all"
                            style={{
                              background: bg,
                              borderColor: bd,
                              color: fg,
                              cursor: st.taken ? "not-allowed" : "pointer",
                            }}
                          >
                            {st.num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-7 mt-12 pb-7 text-center text-[14px] text-fainter">
              เลือกโซนด้านบนเพื่อดูแผนผังที่นั่ง แล้วคลิกเลือกเก้าอี้รายตัว
            </div>
          )}

          <div className="mt-7 flex items-center justify-center gap-5 text-[12px] text-faint">
            <Legend swatch="border-[1.5px] border-[#d4d4d8] bg-white" label="ว่าง" />
            <Legend swatch="bg-accent" label="เลือกแล้ว" />
            <Legend swatch="bg-[#e5e5e5]" label="ไม่ว่าง" />
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-24 rounded-[16px] border border-line-2 p-[26px]">
            <h3 className="mb-1 text-[18px] font-semibold">{event.title}</h3>
            <div className="mb-[22px] text-[13px] text-faint">
              {event.date} • {event.venue}
            </div>

            <div className="mb-[18px] border-t border-[#f0f0f1] pt-[18px]">
              <div className="mb-2 font-mono text-[11px] tracking-[1px] text-fainter">
                โซนที่เลือก
              </div>
              <div
                className="text-[17px] font-semibold"
                style={{ color: zone ? "#18181b" : "#a1a1aa" }}
              >
                {zone ? zone.name : "ยังไม่ได้เลือกโซน"}
              </div>
              <div className="mt-[2px] text-[13px] text-faint">
                {zone
                  ? `${formatBaht(zone.price)} / ที่นั่ง • คลิกเลือกเก้าอี้ในผังด้านซ้าย`
                  : "กรุณาเลือกโซนก่อน แล้วเลือกเก้าอี้รายตัว"}
              </div>
            </div>

            <div className="mb-[22px]">
              <div className="mb-[10px] font-mono text-[11px] tracking-[1px] text-fainter">
                ที่นั่งที่เลือก ({qty})
              </div>
              {chips.length > 0 ? (
                <div className="flex flex-wrap gap-[7px]">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-[8px] bg-accent-soft-2 px-3 py-[6px] font-mono text-[13px] font-semibold text-accent"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-fainter">
                  ยังไม่ได้เลือกที่นั่ง
                </div>
              )}
            </div>

            <Row label={`ราคาบัตร × ${qty}`} value={formatBaht(subtotal)} />
            <Row label="ค่าธรรมเนียม" value={formatBaht(fee)} muted />
            <div className="mb-[22px] mt-[14px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[18px] font-bold">
              <span>รวม</span>
              <span>{formatBaht(total)}</span>
            </div>

            <button
              disabled={qty === 0}
              onClick={() => router.push("/cart")}
              className="w-full rounded-[10px] py-[15px] text-center text-[16px] font-semibold text-white transition-colors"
              style={{ background: qty > 0 ? "#7c3aed" : "#c4b5fd" }}
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-[6px]">
      <span className={`h-[13px] w-[13px] rounded-[4px] ${swatch}`} />
      {label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="mb-2 flex justify-between text-[14px] text-faint">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
