"use client";

import { useState } from "react";
import { checkInAction } from "@/lib/actions/organizer";

// เช็คอินด้วยการกรอกรหัสบัตร (serial/QR) — เรียก check_in_ticket ผ่าน server action
export default function CheckinPanel({ initial }) {
  const [checkedIn, setCheckedIn] = useState(initial.checkedIn);
  const [total] = useState(initial.total);
  const [recent, setRecent] = useState(initial.recent);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null); // { ok, text }
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const c = code.trim();
    if (!c || busy) return;
    setBusy(true);
    const res = await checkInAction(c);
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    const a = res.attendee;
    setMsg({ ok: true, text: `เช็คอิน ${a.name} สำเร็จ` });
    setCheckedIn((n) => n + 1);
    setRecent((r) => [a, ...r].slice(0, 10));
    setCode("");
  }

  return (
    <div className="grid grid-cols-1 gap-7 p-[32px_40px] lg:grid-cols-[1fr_380px]">
      {/* Scanner + manual input */}
      <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-[18px] bg-dark p-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,transparent 0 18px, rgba(255,255,255,.025) 18px 19px)",
          }}
        />
        <div className="relative flex h-[200px] w-[200px] items-center justify-center rounded-[20px] border-2 border-white/15">
          <Corner className="left-[-2px] top-[-2px] rounded-tl-[14px] border-l-[3px] border-t-[3px]" />
          <Corner className="right-[-2px] top-[-2px] rounded-tr-[14px] border-r-[3px] border-t-[3px]" />
          <Corner className="bottom-[-2px] left-[-2px] rounded-bl-[14px] border-b-[3px] border-l-[3px]" />
          <Corner className="bottom-[-2px] right-[-2px] rounded-br-[14px] border-b-[3px] border-r-[3px]" />
          <span className="font-mono text-[12px] text-white/50">[ QR / รหัสบัตร ]</span>
        </div>

        <form onSubmit={submit} className="relative mt-8 flex w-full max-w-[360px] gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="กรอกรหัสบัตร (serial หรือ QR)"
            className="flex-1 rounded-[10px] border border-white/15 bg-white/5 px-4 py-[13px] font-mono text-[14px] text-white outline-none placeholder:text-white/40 focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="rounded-[10px] bg-accent px-6 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-[#5b4699]"
          >
            {busy ? "…" : "เช็คอิน"}
          </button>
        </form>

        {msg && (
          <div
            className="relative mt-4 rounded-[10px] px-4 py-2 text-[13px] font-medium"
            style={{
              background: msg.ok ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
              color: msg.ok ? "#4ade80" : "#f87171",
            }}
          >
            {msg.text}
          </div>
        )}
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
            <div className="text-[26px] font-bold">
              {total.toLocaleString("en-US")}
            </div>
          </div>
        </div>
        <div className="rounded-[14px] border border-[#eee] bg-white p-5">
          <div className="mb-[14px] text-[14px] font-semibold">เช็คอินล่าสุด</div>
          {recent.length > 0 ? (
            <div className="flex flex-col">
              {recent.map((c, i) => (
                <div
                  key={c.serial + i}
                  className="flex items-center gap-3 border-b border-[#f6f6f7] py-[10px] last:border-b-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-bg text-[14px] text-[#22c55e]">
                    ✓
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{c.name}</div>
                    <div className="truncate text-[12px] text-fainter">
                      {c.zone} • {c.serial}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] text-fainter">{c.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[13px] text-fainter">
              ยังไม่มีการเช็คอิน
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Corner({ className }) {
  return (
    <div className={`absolute h-10 w-10 border-accent ${className}`} aria-hidden />
  );
}
