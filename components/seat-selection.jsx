"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/checkout-stepper";
import { useBooking } from "@/lib/booking-context";
import { MAX_SEATS } from "@/lib/constants";
import { holdSeatsAction, bookGaAction } from "@/lib/actions/booking";
import { formatBaht, seatLabel, sortSeats } from "@/lib/format";

export default function SeatSelection({ event, zones, seatMaps }) {
  const router = useRouter();
  const b = useBooking();
  const {
    zone,
    seats,
    seatIds,
    gaQty,
    isGa,
    qty,
    subtotal,
    fee,
    total,
    setEvent,
    selectZone,
    toggleSeat,
    setGaQty,
    beginHold,
  } = b;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // bind the flow to this event (resets selection if the event changed)
  useEffect(() => {
    setEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const rows = zone && !isGa ? seatMaps[zone.id] || [] : [];
  const chips = sortSeats(seats).map(seatLabel);

  async function onContinue() {
    setError("");
    setSubmitting(true);
    const res = isGa
      ? await bookGaAction(zone.id, gaQty)
      : await holdSeatsAction(seatIds);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error);
      // ที่นั่งอาจถูกคนอื่นจองระหว่างนี้ — ล้างที่เลือกแล้วโหลดผังใหม่
      if (!isGa) {
        selectZone(zone);
        router.refresh();
      }
      return;
    }
    beginHold({ txnId: res.txnId, holdExpiresAt: res.holdExpiresAt });
    router.push("/cart");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-12 pb-14 pt-9">
      <CheckoutStepper current={1} />
      <h1 className="mb-7 text-[32px] font-bold tracking-[-.5px]">เลือกที่นั่ง</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Venue map */}
        <div className="rounded-[16px] border border-[#eee] bg-bg-soft p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {zones.map((z) => {
              const on = z.id === zone?.id;
              return (
                <button
                  key={z.id}
                  onClick={() => selectZone(z)}
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

          {!zone ? (
            <div className="mb-7 mt-12 pb-7 text-center text-[14px] text-fainter">
              เลือกโซนด้านบนเพื่อดูแผนผังที่นั่ง แล้วคลิกเลือกเก้าอี้รายตัว
            </div>
          ) : isGa ? (
            /* GA / โซนยืน — เลือกจำนวนบัตร */
            <div className="mt-10 flex flex-col items-center gap-4 pb-6">
              <div className="text-[15px] font-semibold">
                โซนยืน {zone.name} — เลือกจำนวนบัตร
              </div>
              <div className="flex items-center gap-5">
                <Stepper
                  label="−"
                  disabled={gaQty <= 1}
                  onClick={() => setGaQty(gaQty - 1)}
                />
                <span className="w-12 text-center font-mono text-[28px] font-bold">
                  {gaQty}
                </span>
                <Stepper
                  label="+"
                  disabled={gaQty >= MAX_SEATS}
                  onClick={() => setGaQty(gaQty + 1)}
                />
              </div>
              <div className="text-[13px] text-faint">สูงสุด {MAX_SEATS} ใบต่อออเดอร์</div>
            </div>
          ) : (
            <div className="mt-7">
              <div className="mb-[18px] flex items-center justify-between">
                <div className="text-[15px] font-semibold">
                  เลือกเก้าอี้ในโซน {zone.name}
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
                        const selected = seatIds.includes(st.id);
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
                            onClick={() =>
                              toggleSeat({ id: st.id, label: st.label })
                            }
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
          )}

          {zone && !isGa && (
            <div className="mt-7 flex items-center justify-center gap-5 text-[12px] text-faint">
              <Legend swatch="border-[1.5px] border-[#d4d4d8] bg-white" label="ว่าง" />
              <Legend swatch="bg-accent" label="เลือกแล้ว" />
              <Legend swatch="bg-[#e5e5e5]" label="ไม่ว่าง" />
            </div>
          )}
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
                  ? `${formatBaht(zone.price)} / ${isGa ? "ใบ" : "ที่นั่ง"}`
                  : "กรุณาเลือกโซนก่อน"}
              </div>
            </div>

            <div className="mb-[22px]">
              <div className="mb-[10px] font-mono text-[11px] tracking-[1px] text-fainter">
                {isGa ? `จำนวนบัตร (${qty})` : `ที่นั่งที่เลือก (${qty})`}
              </div>
              {isGa ? (
                <div className="text-[15px] font-semibold">{qty} ใบ</div>
              ) : chips.length > 0 ? (
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
            <Row label="ค่าธรรมเนียม" value={formatBaht(fee)} />
            <div className="mb-[22px] mt-[14px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[18px] font-bold">
              <span>รวม</span>
              <span>{formatBaht(total)}</span>
            </div>

            {error ? (
              <div className="mb-3 rounded-[10px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#dc2626]">
                {error}
              </div>
            ) : null}

            <button
              disabled={qty === 0 || submitting}
              onClick={onContinue}
              className="w-full rounded-[10px] py-[15px] text-center text-[16px] font-semibold text-white transition-colors"
              style={{ background: qty > 0 && !submitting ? "#7c3aed" : "#c4b5fd" }}
            >
              {submitting ? "กำลังถือบัตร…" : "ดำเนินการต่อ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] text-[22px] font-semibold transition-colors"
      style={{
        borderColor: disabled ? "#e4e4e7" : "#7c3aed",
        color: disabled ? "#c4c4c4" : "#7c3aed",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
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