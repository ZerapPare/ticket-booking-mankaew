"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/site-header";
import { useBooking } from "@/lib/booking-context";
import { QUEUE_TOTAL } from "@/lib/mock-data";

/*
  Waiting-room queue simulation. The position walks down to 0 on a client
  interval purely to demo the UX. In PRODUCTION the queue position and the
  "your turn" signal must come from the backend (server time / WebSocket) so the
  countdown can't be skipped by refreshing.
*/
export default function QueueRoom({ eventId, eventTitle }) {
  const router = useRouter();
  const { eventId: current, selectEvent, restartHold } = useBooking();
  const [pos, setPos] = useState(QUEUE_TOTAL);
  const [ready, setReady] = useState(false);
  const timer = useRef(null);

  // keep the flow pointed at this event (e.g. on a deep link / refresh)
  useEffect(() => {
    if (current !== eventId) selectEvent(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    timer.current = setInterval(() => {
      setPos((p) => {
        const next = p - Math.ceil(QUEUE_TOTAL / 7);
        if (next <= 0) {
          setReady(true);
          clearInterval(timer.current);
          return 0;
        }
        return next;
      });
    }, 900);
    return () => clearInterval(timer.current);
  }, []);

  // ถึงคิวแล้ว -> เริ่มจับเวลาถือบัตร 10:00 ใหม่สดทุกครั้ง
  useEffect(() => {
    if (ready) restartHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const pct = Math.min(100, Math.round((1 - pos / QUEUE_TOTAL) * 100));
  const etaSec = Math.max(0, Math.round((pos / 220) * 0.9));
  const eta = etaSec > 60 ? `${Math.ceil(etaSec / 60)} นาที` : `${etaSec} วินาที`;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-12 py-12"
      style={{ background: "linear-gradient(160deg,#faf5ff,#fff 55%)" }}
    >
      <div className="w-[520px] max-w-full text-center">
        <Logo className="mb-12 inline-block" />

        {ready ? (
          <div>
            <div className="mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-[34px] text-white">
              ✓
            </div>
            <h1 className="mb-3 text-[32px] font-bold">ถึงคิวคุณแล้ว!</h1>
            <p className="mb-8 text-[16px] text-faint">
              คุณมีเวลา 10 นาทีในการเลือกที่นั่งและชำระเงิน
            </p>
            <Link
              href={`/events/${eventId}/seats`}
              className="inline-block rounded-[10px] bg-accent px-12 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              เลือกที่นั่ง →
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 font-mono text-[12px] uppercase tracking-[2px] text-accent">
              Waiting Room • ห้องรอคิว
            </div>
            <h1 className="mb-[10px] text-[30px] font-bold tracking-[-.5px]">
              {eventTitle}
            </h1>
            <p className="mb-10 text-[15px] text-faint">
              กรุณาอย่าปิดหรือรีเฟรชหน้านี้ ระบบกำลังจัดคิวให้คุณ
            </p>

            <div className="mb-1 text-[64px] font-bold tracking-[-2px]">
              #{pos.toLocaleString("en-US")}
            </div>
            <div className="mb-8 text-[14px] text-faint">
              ลำดับคิวของคุณ • โดยประมาณ
            </div>

            <div className="mb-[14px] h-2 overflow-hidden rounded-full bg-[#ece8fb]">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[13px] text-fainter">
              <span>เวลารอโดยประมาณ ~ {eta}</span>
              <span>{pct}%</span>
            </div>

            <div className="mt-10 flex items-center justify-center gap-[10px] rounded-[12px] border border-[#ece8fb] bg-white p-4 text-[13px] text-faint">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
              เชื่อมต่อแล้ว — ระบบจะพาคุณเข้าสู่หน้าเลือกที่นั่งอัตโนมัติ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
