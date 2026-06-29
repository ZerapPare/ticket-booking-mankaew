"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBooking } from "@/lib/booking-context";
import { getEvent, getZone } from "@/lib/mock-data";

// Mock purchased tickets. Real data comes from Supabase `tickets` + `transactions`.
const MY_TICKETS = [
  { eventId: "neon", zoneId: "vip", seats: ["A-1", "A-2"], orderId: "4821" },
  { eventId: "kwave", zoneId: "a", seats: ["B-7"], orderId: "3310" },
];

const TABS = ["ตั๋วของฉัน", "ประวัติการซื้อ", "ตั้งค่าบัญชี"];

export default function AccountPage() {
  const router = useRouter();
  const { loadTicket } = useBooking();

  function openTicket(t) {
    loadTicket(t);
    router.push(`/tickets/${t.orderId}`);
  }

  return (
    <div className="mx-auto max-w-[1080px] px-12 py-12">
      <div className="mb-10 flex items-center gap-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-[26px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
        >
          ก
        </div>
        <div>
          <h1 className="mb-[2px] text-[26px] font-bold">สวัสดี, กานต์</h1>
          <div className="text-[14px] text-faint">
            kan.s@email.com • สมาชิกตั้งแต่ 2024
          </div>
        </div>
        <div className="flex-1" />
        <Link href="/login" className="text-[14px] text-faint hover:text-ink">
          ออกจากระบบ
        </Link>
      </div>

      <div className="mb-7 flex gap-2 border-b border-line">
        {TABS.map((t, i) => (
          <div
            key={t}
            className={`mr-6 px-1 py-3 text-[15px] ${
              i === 0
                ? "border-b-2 border-accent font-semibold text-ink"
                : "text-faint"
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="mb-[14px] font-mono text-[13px] tracking-[1px] text-fainter">
        กำลังจะมาถึง
      </div>
      <div className="mb-9 flex flex-col gap-[14px]">
        {MY_TICKETS.map((t) => {
          const ev = getEvent(t.eventId);
          const zone = getZone(t.zoneId);
          return (
            <button
              key={t.orderId}
              onClick={() => openTicket(t)}
              className="flex items-center gap-5 rounded-[14px] border border-[#eee] p-5 text-left transition-colors hover:border-accent-border"
            >
              <div
                className="aspect-[3/4] w-16 flex-shrink-0 rounded-[8px]"
                style={{ background: ev.grad }}
              />
              <div className="flex-1">
                <div className="mb-1 text-[17px] font-semibold">{ev.title}</div>
                <div className="text-[13px] text-faint">
                  {ev.date} • {ev.venue}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-[6px] text-[13px] text-faint">
                  {zone.name} • {t.seats.length} ใบ
                </div>
                <span className="rounded-full bg-success-bg px-3 py-[5px] text-[12px] font-semibold text-[#22c55e]">
                  พร้อมใช้งาน
                </span>
              </div>
              <div className="text-[13px] font-medium text-accent">ดูตั๋ว →</div>
            </button>
          );
        })}
      </div>

      <div className="mb-[14px] font-mono text-[13px] tracking-[1px] text-fainter">
        ที่ผ่านมา
      </div>
      <div className="flex items-center gap-5 rounded-[14px] border border-[#f0f0f1] p-5 opacity-65">
        <div
          className="aspect-[3/4] w-16 flex-shrink-0 rounded-[8px]"
          style={{ background: "linear-gradient(160deg,#e5e5e5,#f5f5f5)" }}
        />
        <div className="flex-1">
          <div className="mb-1 text-[17px] font-semibold">
            LUKTHUNG LEGENDS NIGHT
          </div>
          <div className="text-[13px] text-faint">12 ธ.ค. 2025 • ธันเดอร์โดม</div>
        </div>
        <span className="rounded-full bg-surface px-3 py-[5px] text-[12px] text-faint">
          จบงานแล้ว
        </span>
      </div>
    </div>
  );
}
