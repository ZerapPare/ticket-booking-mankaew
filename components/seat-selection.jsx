"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/checkout-stepper";
import SeatMap from "@/components/seat-map";
import { supabasePublic } from "@/lib/supabase/public";
import { holdSeats, bookGa } from "@/lib/actions/booking";
import { formatBaht, seatLabel, sortSeats } from "@/lib/format";

const MAX_SEATS = 8;

// group seats (จาก supabase) เป็นแถว A,B,C...
function groupRows(data) {
  const rows = [];
  let cur = null;
  for (const s of data || []) {
    if (!cur || cur.letter !== s.row_letter) {
      cur = { letter: s.row_letter, seats: [] };
      rows.push(cur);
    }
    cur.seats.push({
      id: s.id,
      label: s.seat_label,
      num: s.seat_number,
      status: s.status,
    });
  }
  return rows;
}

export default function SeatSelection({ event, zones }) {
  const router = useRouter();
  const [zoneId, setZoneId] = useState(null);
  const [seatRows, setSeatRows] = useState([]);
  const [selected, setSelected] = useState([]); // seat ids (seated)
  const [gaQty, setGaQty] = useState(1); // ga
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const zone = zones.find((z) => z.id === zoneId) || null;
  const isSeated = zone?.seatingType === "seated";

  // โหลดผังที่นั่งเมื่อเลือกโซน seated
  useEffect(() => {
    if (!zone || zone.seatingType !== "seated") {
      setSeatRows([]);
      return;
    }
    let alive = true;
    setLoadingMap(true);
    supabasePublic()
      .from("seats")
      .select("id,seat_label,row_letter,seat_number,status")
      .eq("ticket_type_id", zone.id)
      .order("row_letter", { ascending: true })
      .order("seat_number", { ascending: true })
      .then(({ data }) => {
        if (alive) {
          setSeatRows(groupRows(data));
          setLoadingMap(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [zone]);

  function pickZone(z) {
    setZoneId(z.id);
    setSelected([]);
    setGaQty(1);
    setError(null);
  }

  function toggleSeat(id) {
    setSelected((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length >= MAX_SEATS
          ? cur
          : [...cur, id]
    );
  }

  // labels ของที่นั่งที่เลือก (สำหรับสรุป)
  const labelById = {};
  for (const r of seatRows) for (const s of r.seats) labelById[s.id] = s.label;
  const chips = sortSeats(selected.map((id) => labelById[id] || id)).map(
    (l) => seatLabel(l)
  );

  const qty = isSeated ? selected.length : gaQty;
  const price = zone?.price ?? 0;
  const total = price * qty;
  const canProceed = zone && qty > 0;

  function proceed() {
    if (!canProceed || pending) return;
    setError(null);
    startTransition(async () => {
      const res = isSeated
        ? await holdSeats(selected)
        : await bookGa(zone.id, gaQty);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(`/cart?txn=${res.txnId}`);
    });
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
              const on = z.id === zoneId;
              return (
                <button
                  key={z.id}
                  onClick={() => pickZone(z)}
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
              เลือกโซนด้านบนเพื่อดูที่นั่ง
            </div>
          ) : isSeated ? (
            <div className="mt-7">
              <div className="mb-[18px] flex items-center justify-between">
                <div className="text-[15px] font-semibold">
                  เลือกเก้าอี้ในโซน {zone.name}
                </div>
                <div className="text-[13px] text-faint">สูงสุด {MAX_SEATS} ที่นั่ง</div>
              </div>
              {loadingMap ? (
                <div className="py-10 text-center text-[14px] text-fainter">
                  กำลังโหลดผังที่นั่ง...
                </div>
              ) : (
                <SeatMap
                  ticketTypeId={zone.id}
                  initialRows={seatRows}
                  selected={selected}
                  onToggle={toggleSeat}
                  maxSeats={MAX_SEATS}
                />
              )}
              <div className="mt-7 flex items-center justify-center gap-5 text-[12px] text-faint">
                <Legend swatch="border-[1.5px] border-[#d4d4d8] bg-white" label="ว่าง" />
                <Legend swatch="bg-accent" label="เลือกแล้ว" />
                <Legend swatch="bg-[#e5e5e5]" label="ไม่ว่าง" />
              </div>
            </div>
          ) : (
            // โซนยืน (ga) — เลือกจำนวน
            <div className="mt-10 flex flex-col items-center gap-4 pb-6">
              <div className="text-[15px] font-semibold">
                {zone.name} (ยืน) • เหลือ {zone.available} ใบ
              </div>
              <div className="flex items-center gap-5">
                <StepBtn
                  label="−"
                  onClick={() => setGaQty((q) => Math.max(1, q - 1))}
                />
                <span className="w-10 text-center text-[24px] font-bold">
                  {gaQty}
                </span>
                <StepBtn
                  label="+"
                  onClick={() =>
                    setGaQty((q) =>
                      Math.min(MAX_SEATS, zone.available, zone.maxPerOrder, q + 1)
                    )
                  }
                />
              </div>
              <div className="text-[13px] text-fainter">
                สูงสุด {Math.min(MAX_SEATS, zone.maxPerOrder)} ใบต่อออเดอร์
              </div>
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
              {zone && (
                <div className="mt-[2px] text-[13px] text-faint">
                  {formatBaht(zone.price)} / {isSeated ? "ที่นั่ง" : "ใบ"}
                </div>
              )}
            </div>

            {isSeated && (
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
                  <div className="text-[13px] text-fainter">ยังไม่ได้เลือกที่นั่ง</div>
                )}
              </div>
            )}

            <div className="mb-2 flex justify-between text-[14px] text-faint">
              <span>ราคาบัตร × {qty}</span>
              <span>{formatBaht(total)}</span>
            </div>
            <div className="mb-[22px] mt-[14px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[18px] font-bold">
              <span>รวม</span>
              <span>{formatBaht(total)}</span>
            </div>

            {error && (
              <div className="mb-3 rounded-[9px] bg-danger-bg px-[14px] py-3 text-[13px] text-danger">
                {error}
              </div>
            )}

            <button
              disabled={!canProceed || pending}
              onClick={proceed}
              className="w-full rounded-[10px] py-[15px] text-center text-[16px] font-semibold text-white transition-colors"
              style={{ background: canProceed && !pending ? "#7c3aed" : "#c4b5fd" }}
            >
              {pending ? "กำลังจอง..." : "ดำเนินการต่อ"}
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

function StepBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line-2 text-[20px] text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
