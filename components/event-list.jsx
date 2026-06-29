"use client";

import { useState } from "react";
import Link from "next/link";
import KeyVisual from "@/components/key-visual";
import { EVENT_FILTERS } from "@/lib/mock-data";
import { formatBaht } from "@/lib/format";

// Maps a filter chip to a predicate. Chips without data (สัปดาห์นี้)
// fall back to "show all" for the mock.
function matches(filter, ev) {
  if (filter === "คอนเสิร์ต" || filter === "เทศกาล") return ev.cat === filter;
  return true;
}

export default function EventList({ events }) {
  const [active, setActive] = useState("ทั้งหมด");
  const shown = events.filter((ev) => matches(active, ev));

  return (
    <div className="mx-auto max-w-[1280px] px-12 py-12">
      <h1 className="mb-2 text-[40px] font-bold tracking-[-.5px]">
        อีเวนต์ทั้งหมด
      </h1>
      <p className="mb-8 text-[15px] text-faint">
        พบ {shown.length} อีเวนต์ที่เปิดขายตอนนี้
      </p>

      <div className="mb-9 flex flex-wrap items-center gap-[10px]">
        {EVENT_FILTERS.map((f) => {
          const on = f === active;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full border px-[18px] py-[9px] text-[14px] transition-colors ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-line-2 bg-white text-muted hover:border-accent-border"
              }`}
            >
              {f}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-2 rounded-full border border-line-2 px-[18px] py-[9px] text-[14px] text-muted">
          เรียงตาม: วันที่ ▾
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((ev) => (
          <Link
            key={ev.key}
            href={`/events/${ev.id}`}
            className="group overflow-hidden rounded-[12px] border border-[#eee]"
          >
            <KeyVisual grad={ev.grad} className="aspect-[16/10]">
              <div className="absolute right-3 top-3 rounded-full bg-white/[.85] px-[10px] py-1 text-[11px] font-semibold text-accent">
                {ev.cat}
              </div>
            </KeyVisual>
            <div className="px-5 pb-5 pt-[18px]">
              <div className="mb-2 font-mono text-[11px] tracking-wide text-fainter">
                {ev.date}
              </div>
              <div className="mb-[6px] text-[18px] font-semibold group-hover:text-accent">
                {ev.title}
              </div>
              <div className="mb-[14px] text-[13px] text-faint">{ev.sub}</div>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">
                  {formatBaht(ev.fromPrice)}
                </span>
                <span className="text-[13px] font-medium text-accent">
                  ซื้อบัตร →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
