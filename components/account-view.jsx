"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const TABS = ["ตั๋วของฉัน", "ประวัติการซื้อ", "ตั้งค่าบัญชี"];

export default function AccountView({ user, tickets }) {
  const { upcoming = [], past = [] } = tickets || {};

  const displayName = user?.name || user?.email || "ผู้ใช้";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[1080px] px-12 py-12">
      <div className="mb-10 flex items-center gap-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-[26px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
        >
          {initial}
        </div>
        <div>
          <h1 className="mb-[2px] text-[26px] font-bold">สวัสดี, {displayName}</h1>
          <div className="text-[14px] text-faint">{user?.email}</div>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-[14px] text-faint hover:text-ink"
        >
          ออกจากระบบ
        </button>
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
      {upcoming.length > 0 ? (
        <div className="mb-9 flex flex-col gap-[14px]">
          {upcoming.map((t) => (
            <Link
              key={t.orderId}
              href={`/tickets/${t.orderId}`}
              className="flex items-center gap-5 rounded-[14px] border border-[#eee] p-5 text-left transition-colors hover:border-accent-border"
            >
              <div
                className="aspect-[3/4] w-16 flex-shrink-0 rounded-[8px]"
                style={{ background: t.grad }}
              />
              <div className="flex-1">
                <div className="mb-1 text-[17px] font-semibold">{t.title}</div>
                <div className="text-[13px] text-faint">
                  {t.date} • {t.venue}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-[6px] text-[13px] text-faint">
                  {t.zoneName} • {t.qty} ใบ
                </div>
                <span className="rounded-full bg-success-bg px-3 py-[5px] text-[12px] font-semibold text-[#22c55e]">
                  พร้อมใช้งาน
                </span>
              </div>
              <div className="text-[13px] font-medium text-accent">ดูตั๋ว →</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mb-9 rounded-[14px] border border-dashed border-[#e4e4e7] p-8 text-center text-[14px] text-fainter">
          ยังไม่มีตั๋ว —{" "}
          <Link href="/events" className="font-medium text-accent">
            เลือกซื้ออีเวนต์
          </Link>
        </div>
      )}

      <div className="mb-[14px] font-mono text-[13px] tracking-[1px] text-fainter">
        ที่ผ่านมา
      </div>
      {past.length > 0 ? (
        <div className="flex flex-col gap-[14px]">
          {past.map((t) => (
            <Link
              key={t.orderId}
              href={`/tickets/${t.orderId}`}
              className="flex items-center gap-5 rounded-[14px] border border-[#f0f0f1] p-5 opacity-65 transition-opacity hover:opacity-100"
            >
              <div
                className="aspect-[3/4] w-16 flex-shrink-0 rounded-[8px]"
                style={{ background: t.grad }}
              />
              <div className="flex-1">
                <div className="mb-1 text-[17px] font-semibold">{t.title}</div>
                <div className="text-[13px] text-faint">
                  {t.date} • {t.venue}
                </div>
              </div>
              <span className="rounded-full bg-surface px-3 py-[5px] text-[12px] text-faint">
                จบงานแล้ว
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-[14px] text-fainter">— ไม่มีประวัติ</div>
      )}
    </div>
  );
}