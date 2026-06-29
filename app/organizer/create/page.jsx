"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORG_WIZARD_ZONES, ORG_WIZARD_ROUNDS } from "@/lib/organizer-mock";

const STEPS = ["1 ข้อมูลงาน", "2 โซน & ราคา", "3 รอบการขาย"];
const NEXT_LABEL = {
  1: "ถัดไป: โซน & ราคา",
  2: "ถัดไป: รอบการขาย",
  3: "เผยแพร่อีเวนต์",
};

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  function next() {
    if (step < 3) setStep(step + 1);
    else router.push("/organizer/events");
  }

  return (
    <div>
      <div className="border-b border-line bg-white px-10 py-7">
        <h1 className="mb-4 text-[26px] font-bold">สร้างอีเวนต์ใหม่</h1>
        <div className="flex items-center gap-2 font-mono text-[13px]">
          {STEPS.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              <span
                style={{
                  color: step === i + 1 ? "#7c3aed" : "#a1a1aa",
                  fontWeight: step === i + 1 ? 700 : 400,
                }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="text-[#d4d4d8]">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[860px] p-[32px_40px]">
        {step === 1 && <StepInfo />}
        {step === 2 && <StepZones />}
        {step === 3 && <StepRounds />}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className="rounded-[10px] border border-[#d4d4d8] px-7 py-[13px] text-[15px] font-medium transition-colors hover:bg-surface"
            >
              ← ย้อนกลับ
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={next}
            className="rounded-[10px] bg-accent px-8 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            {NEXT_LABEL[step]}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-[16px] border border-[#eee] bg-white p-8">
      {children}
    </div>
  );
}

function Field({ label, placeholder, textarea, value }) {
  return (
    <div>
      <div className="mb-[7px] text-[13px] text-muted">{label}</div>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          className="min-h-[96px] w-full rounded-[9px] border border-line-2 px-[14px] py-[13px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
        />
      ) : (
        <input
          defaultValue={value}
          placeholder={placeholder}
          className="w-full rounded-[9px] border border-line-2 px-[14px] py-[13px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
        />
      )}
    </div>
  );
}

function StepInfo() {
  return (
    <Card>
      <h2 className="mb-6 text-[18px] font-semibold">ข้อมูลงาน</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-[18px]">
          <Field label="ชื่ออีเวนต์" placeholder="เช่น NEON NIGHTS BANGKOK 2026" />
          <div className="flex gap-[14px]">
            <div className="flex-1">
              <Field label="วันที่จัดงาน" placeholder="วว / ดด / ปปปป" />
            </div>
            <div className="flex-1">
              <Field label="หมวดหมู่" value="คอนเสิร์ต" />
            </div>
          </div>
          <Field label="สถานที่" placeholder="เช่น IMPACT Arena เมืองทอง" />
          <Field
            label="รายละเอียดงาน"
            placeholder="อธิบายเกี่ยวกับงาน ไลน์อัพ และข้อมูลสำคัญ..."
            textarea
          />
        </div>
        <div>
          <div className="mb-[7px] text-[13px] text-muted">โปสเตอร์งาน</div>
          {/* TODO: real upload to Supabase Storage */}
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-[10px] rounded-[12px] border-2 border-dashed border-[#d4d4d8] p-5 text-center text-fainter">
            <span className="text-[28px]">⬆</span>
            <span className="text-[13px]">
              ลากไฟล์มาวาง
              <br />
              หรือคลิกเพื่ออัปโหลด
            </span>
            <span className="font-mono text-[10px]">JPG/PNG • 3:4</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepZones() {
  const TEMPLATE = "24px 1.4fr 1fr 1fr 40px";
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold">โซนและราคาบัตร</h2>
        <button className="text-[14px] font-medium text-accent">+ เพิ่มโซน</button>
      </div>
      <div
        className="grid gap-4 px-1 pb-[10px] font-mono text-[12px] uppercase tracking-[1px] text-fainter"
        style={{ gridTemplateColumns: TEMPLATE }}
      >
        <span />
        <span>ชื่อโซน</span>
        <span>ราคา (฿)</span>
        <span>จำนวนที่นั่ง</span>
        <span />
      </div>
      <div className="flex flex-col gap-[10px]">
        {ORG_WIZARD_ZONES.map((z) => (
          <div
            key={z.name}
            className="grid items-center gap-4"
            style={{ gridTemplateColumns: TEMPLATE }}
          >
            <div
              className="h-[14px] w-[14px] rounded-[4px]"
              style={{ background: z.color }}
            />
            <div className="rounded-[9px] border border-line-2 px-[13px] py-[11px] text-[14px] font-medium">
              {z.name}
            </div>
            <div className="rounded-[9px] border border-line-2 px-[13px] py-[11px] text-[14px]">
              {z.price}
            </div>
            <div className="rounded-[9px] border border-line-2 px-[13px] py-[11px] text-[14px] text-faint">
              {z.cap}
            </div>
            <button className="text-center text-[18px] text-fainter">×</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-[10px] bg-accent-soft-3 px-5 py-4">
        <span className="text-[14px] text-muted">ความจุรวม</span>
        <span className="text-[18px] font-bold">5,000 ที่นั่ง</span>
      </div>
    </Card>
  );
}

function StepRounds() {
  return (
    <Card>
      <h2 className="mb-6 text-[18px] font-semibold">รอบการเปิดขาย</h2>
      <div className="flex flex-col gap-[14px]">
        {ORG_WIZARD_ROUNDS.map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-5 rounded-[12px] border border-[#eee] p-5"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-[20px]"
              style={{ background: r.iconBg, color: r.iconFg }}
            >
              {r.icon}
            </div>
            <div className="flex-1">
              <div className="mb-[3px] text-[15px] font-semibold">{r.name}</div>
              <div className="text-[13px] text-faint">{r.window}</div>
            </div>
            <div className="text-right">
              <div className="mb-[3px] text-[12px] text-fainter">โควต้า</div>
              <div className="text-[15px] font-semibold">{r.quota}</div>
            </div>
            <Toggle on={r.on} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-accent-border bg-accent-soft-3 px-5 py-[18px]">
        <span className="text-[20px]">🎟</span>
        <div className="text-[13px] text-accent-dark">
          เปิดใช้งานระบบจัดคิว (Waiting Room)
          อัตโนมัติเมื่อมีผู้เข้าชมพร้อมกันจำนวนมาก
        </div>
      </div>
    </Card>
  );
}

function Toggle({ on: initial }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative h-[26px] w-[46px] rounded-full transition-colors"
      style={{ background: on ? "#7c3aed" : "#d4d4d8" }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? "23px" : "3px" }}
      />
    </button>
  );
}
