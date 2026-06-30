"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

/*
  E-Ticket — แสดงตั๋วจริงต่อใบ (1 เก้าอี้ = 1 ตั๋ว = 1 QR)
  QR เข้ารหัส qr_code จริงจาก DB ที่ใช้สแกนเช็คอินหน้างาน (check_in_ticket)
*/
export default function ETicket({ event, tickets }) {
  return (
    <div
      className="min-h-screen px-12 py-12"
      style={{ background: "linear-gradient(160deg,#faf5ff,#fff 50%)" }}
    >
      <div className="mx-auto max-w-[460px] text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e] text-[30px] text-white">
          ✓
        </div>
        <h1 className="mb-2 text-[30px] font-bold">ชำระเงินสำเร็จ!</h1>
        <p className="mb-8 text-[15px] text-faint">
          บัตร {tickets.length} ใบพร้อมแล้ว แสดง QR ที่หน้างานเพื่อเข้าชม
        </p>

        <div className="flex flex-col gap-6">
          {tickets.map((tk) => (
            <div
              key={tk.id}
              className="overflow-hidden rounded-[20px] border border-line-2 bg-white text-left"
              style={{ boxShadow: "0 12px 40px rgba(124,58,237,.1)" }}
            >
              <div className="relative p-6" style={{ background: event.grad }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg,transparent 0 14px, rgba(0,0,0,.02) 14px 15px)",
                  }}
                />
                <div className="relative">
                  <div className="mb-2 font-mono text-[11px] tracking-[2px] text-accent">
                    E-TICKET • บัตรอิเล็กทรอนิกส์
                  </div>
                  <div className="text-[22px] font-bold leading-[1.1]">
                    {event.title}
                  </div>
                  <div className="mt-[6px] text-[14px] text-muted">
                    {event.date} • {event.venue}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 border-b-2 border-dashed border-line-2 px-6 py-[22px]">
                <div className="flex-1">
                  <TicketLabel>โซน</TicketLabel>
                  <div className="mb-[14px] text-[16px] font-semibold">
                    {tk.zoneName}
                  </div>
                  <TicketLabel>ที่นั่ง</TicketLabel>
                  <div className="font-mono text-[15px] font-semibold">
                    {tk.seatLabel || "ยืน (ไม่ระบุที่นั่ง)"}
                  </div>
                </div>
                <div className="flex-1">
                  <TicketLabel>ประตูเข้า</TicketLabel>
                  <div className="mb-[14px] text-[16px] font-semibold">Gate 3</div>
                  <TicketLabel>เปิดประตู</TicketLabel>
                  <div className="text-[16px] font-semibold">17:00 น.</div>
                </div>
              </div>

              <div className="px-6 py-7 text-center">
                <div className="mx-auto mb-[14px] w-fit rounded-[12px] border border-line-2 bg-white p-3">
                  <QRCodeSVG value={tk.qr || tk.serial} size={150} level="M" />
                </div>
                <div className="font-mono text-[13px] tracking-[1px] text-faint">
                  {tk.serial}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/account"
            className="flex-1 rounded-[10px] border border-[#d4d4d8] py-[14px] text-[15px] font-medium text-ink transition-colors hover:bg-surface"
          >
            ตั๋วของฉัน
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-[10px] bg-accent py-[14px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}

function TicketLabel({ children }) {
  return (
    <div className="mb-1 font-mono text-[10px] tracking-[1px] text-fainter">
      {children}
    </div>
  );
}
