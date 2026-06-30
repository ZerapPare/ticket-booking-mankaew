"use client";

import { useEffect, useRef, useState } from "react";
import { supabasePublic } from "@/lib/supabase/public";

/*
  ผังที่นั่งแบบ realtime — รับสถานะเริ่มต้นจาก server แล้ว subscribe ตาราง seats
  (filter ตาม ticket_type_id) ผ่าน anon client เพื่ออัปเดตสด เมื่อมีคนจอง/ซื้อ
  selected = array ของ seat id (uuid) ที่ผู้ใช้เลือก, onToggle(id) จากหน้าแม่
*/
export default function SeatMap({
  ticketTypeId,
  initialRows,
  selected,
  onToggle,
  maxSeats = 8,
}) {
  const [rows, setRows] = useState(initialRows);

  // sync เมื่อเปลี่ยนโซน
  useEffect(() => setRows(initialRows), [initialRows]);

  // refs ให้ realtime handler เห็นค่าล่าสุดโดยไม่ต้อง resubscribe
  const selectedRef = useRef(selected);
  const onToggleRef = useRef(onToggle);
  selectedRef.current = selected;
  onToggleRef.current = onToggle;

  useEffect(() => {
    const supa = supabasePublic();
    const ch = supa
      .channel(`seats-${ticketTypeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `ticket_type_id=eq.${ticketTypeId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row?.id) return;
          setRows((prev) =>
            prev.map((r) => ({
              ...r,
              seats: r.seats.map((s) =>
                s.id === row.id ? { ...s, status: row.status } : s
              ),
            }))
          );
          // ถ้าที่นั่งที่เราเลือกถูกคนอื่นจองไป -> ปลดเลือกออก
          if (row.status !== "available" && selectedRef.current.includes(row.id)) {
            onToggleRef.current(row.id);
          }
        }
      )
      .subscribe();

    return () => {
      supa.removeChannel(ch);
    };
  }, [ticketTypeId]);

  return (
    <div className="seatmap-scroll flex flex-col items-center gap-[7px] overflow-x-auto">
      {rows.map((row) => (
        <div key={row.letter} className="flex items-center gap-2">
          <span className="w-4 text-center font-mono text-[11px] text-fainter">
            {row.letter}
          </span>
          <div className="flex gap-[6px]">
            {row.seats.map((st) => {
              const taken = st.status !== "available";
              const sel = !taken && selected.includes(st.id);
              const bg = taken ? "#e5e5e5" : sel ? "#7c3aed" : "#fff";
              const bd = taken ? "#e5e5e5" : sel ? "#7c3aed" : "#d4d4d8";
              const fg = sel ? "#fff" : taken ? "#c4c4c4" : "#71717a";
              const atMax = selected.length >= maxSeats && !sel;
              return (
                <button
                  key={st.id}
                  disabled={taken || atMax}
                  onClick={() => onToggle(st.id)}
                  title={st.label}
                  className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px] border-[1.5px] text-[10px] transition-all"
                  style={{
                    background: bg,
                    borderColor: bd,
                    color: fg,
                    cursor: taken ? "not-allowed" : atMax ? "default" : "pointer",
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
  );
}
