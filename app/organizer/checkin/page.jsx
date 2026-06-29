"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { ORG_BASE_CHECKINS } from "@/lib/organizer-mock";

const NAMES = [
  ["ณ", "ณัฐวุฒิ ทองดี"],
  ["B", "Bella Chen"],
  ["ส", "สุดารัตน์ พงษ์"],
  ["จ", "จิรายุ มั่นคง"],
  ["R", "Ryan Park"],
];
const ZONES = ["VIP STANDING", "ZONE A", "ZONE B", "ZONE C", "ZONE D"];

export default function CheckinPage() {
  const [checkedIn, setCheckedIn] = useState(1842);
  const [scans, setScans] = useState([]);

  // UI simulation only — production scans a real QR and calls check_in_ticket RPC.
  function simulateScan() {
    const pick = NAMES[Math.floor(Math.random() * NAMES.length)];
    const id = "MKW-2026-" + Math.floor(4000 + Math.random() * 900);
    const t = new Date();
    const time =
      String(t.getHours()).padStart(2, "0") +
      ":" +
      String(t.getMinutes()).padStart(2, "0");
    setCheckedIn((c) => c + 1);
    setScans((s) => [
      { name: pick[1], zone: ZONES[Math.floor(Math.random() * 5)], id, time },
      ...s,
    ]);
  }

  const recent = [...scans, ...ORG_BASE_CHECKINS].slice(0, 7);

  return (
    <div>
      <DashboardHeader
        title="เช็คอินหน้างาน"
        subtitle="NEON NIGHTS BANGKOK 2026 • Gate 3"
        action={
          <div className="flex items-center gap-[10px]">
            <span className="h-[9px] w-[9px] rounded-full bg-[#22c55e]" />
            <span className="text-[14px] text-muted">
              เครื่องสแกนพร้อมใช้งาน
            </span>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-7 p-[32px_40px] lg:grid-cols-[1fr_380px]">
        {/* Scanner */}
        <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-[18px] bg-dark p-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg,transparent 0 18px, rgba(255,255,255,.025) 18px 19px)",
            }}
          />
          <div className="relative flex h-[240px] w-[240px] items-center justify-center rounded-[20px] border-2 border-white/15">
            <Corner className="left-[-2px] top-[-2px] rounded-tl-[14px] border-l-[3px] border-t-[3px]" />
            <Corner className="right-[-2px] top-[-2px] rounded-tr-[14px] border-r-[3px] border-t-[3px]" />
            <Corner className="bottom-[-2px] left-[-2px] rounded-bl-[14px] border-b-[3px] border-l-[3px]" />
            <Corner className="bottom-[-2px] right-[-2px] rounded-br-[14px] border-b-[3px] border-r-[3px]" />
            <span className="font-mono text-[12px] text-white/50">
              [ CAMERA / QR ]
            </span>
          </div>
          <div className="relative mt-7 text-[14px] text-white/70">
            เล็ง QR บนตั๋วเข้ากรอบเพื่อเช็คอิน
          </div>
          <button
            onClick={simulateScan}
            className="relative mt-5 rounded-[10px] bg-accent px-8 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            จำลองการสแกน
          </button>
        </div>

        {/* Stats + recent */}
        <div>
          <div className="mb-5 grid grid-cols-2 gap-[14px]">
            <div className="rounded-[12px] border border-[#eee] bg-white p-[18px]">
              <div className="mb-[6px] text-[12px] text-faint">เช็คอินแล้ว</div>
              <div className="text-[26px] font-bold text-[#22c55e]">
                {checkedIn.toLocaleString("en-US")}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#eee] bg-white p-[18px]">
              <div className="mb-[6px] text-[12px] text-faint">ทั้งหมด</div>
              <div className="text-[26px] font-bold">3,142</div>
            </div>
          </div>
          <div className="rounded-[14px] border border-[#eee] bg-white p-5">
            <div className="mb-[14px] text-[14px] font-semibold">
              เช็คอินล่าสุด
            </div>
            <div className="flex flex-col">
              {recent.map((c, i) => (
                <div
                  key={c.id + i}
                  className="flex items-center gap-3 border-b border-[#f6f6f7] py-[10px] last:border-b-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-bg text-[14px] text-[#22c55e]">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">{c.name}</div>
                    <div className="text-[12px] text-fainter">
                      {c.zone} • {c.id}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] text-fainter">
                    {c.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({ className }) {
  return (
    <div
      className={`absolute h-10 w-10 border-accent ${className}`}
      aria-hidden
    />
  );
}
