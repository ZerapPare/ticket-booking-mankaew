"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/lib/actions/organizer";

const STEPS = ["1 ข้อมูลงาน", "2 โซน & ราคา"];
const ZONE_COLORS = ["#7c3aed", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

const emptyZone = () => ({
  name: "",
  price: "",
  type: "seated",
  capacity: "",
  rows: "",
  cols: "",
});

export default function CreateEventForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({
    title: "",
    date: "",
    time: "19:00",
    category: "คอนเสิร์ต",
    venue: "",
    description: "",
  });
  const [zones, setZones] = useState([emptyZone()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = (k, v) => setInfo((s) => ({ ...s, [k]: v }));
  const setZone = (i, patch) =>
    setZones((zs) => zs.map((z, j) => (j === i ? { ...z, ...patch } : z)));
  const addZone = () => setZones((zs) => [...zs, emptyZone()]);
  const removeZone = (i) =>
    setZones((zs) => (zs.length > 1 ? zs.filter((_, j) => j !== i) : zs));

  function next() {
    setError("");
    if (step === 1) {
      if (!info.title.trim() || !info.venue.trim() || !info.date) {
        setError("กรอกชื่อ วันที่ และสถานที่ให้ครบ");
        return;
      }
      setStep(2);
    } else {
      publish();
    }
  }

  async function publish() {
    setError("");
    const zonesPayload = [];
    for (const z of zones) {
      if (!z.name.trim()) return setError("กรอกชื่อโซนให้ครบทุกโซน");
      const price = Number(z.price);
      if (!Number.isFinite(price) || price < 0)
        return setError(`ราคาโซน "${z.name}" ไม่ถูกต้อง`);
      if (z.type === "seated") {
        const rows = Number(z.rows);
        const cols = Number(z.cols);
        if (!(rows > 0 && cols > 0))
          return setError(`โซน "${z.name}": ระบุจำนวนแถว/คอลัมน์`);
        if (rows > 26) return setError(`โซน "${z.name}": แถวสูงสุด 26 (A–Z)`);
        zonesPayload.push({ name: z.name.trim(), price, type: "seated", rows, cols });
      } else {
        const capacity = Number(z.capacity);
        if (!(capacity > 0))
          return setError(`โซน "${z.name}": ระบุจำนวนบัตร`);
        zonesPayload.push({ name: z.name.trim(), price, type: "ga", capacity });
      }
    }

    setSubmitting(true);
    const res = await createEventAction({
      title: info.title.trim(),
      startsAt: `${info.date}T${info.time || "19:00"}:00`,
      category: info.category?.trim() || undefined,
      venue: info.venue.trim(),
      description: info.description?.trim() || undefined,
      zones: zonesPayload,
    });
    setSubmitting(false);
    if (!res.ok) return setError(res.error);
    router.push("/organizer/events");
  }

  const totalCap = zones.reduce((s, z) => {
    const n =
      z.type === "seated"
        ? Number(z.rows) * Number(z.cols)
        : Number(z.capacity);
    return s + (Number.isFinite(n) ? n : 0);
  }, 0);

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

      <div className="max-w-[900px] p-[32px_40px]">
        {step === 1 ? (
          <Card>
            <h2 className="mb-6 text-[18px] font-semibold">ข้อมูลงาน</h2>
            <div className="flex flex-col gap-[18px]">
              <Field label="ชื่ออีเวนต์">
                <Input
                  value={info.title}
                  onChange={(v) => setField("title", v)}
                  placeholder="เช่น NEON NIGHTS BANGKOK 2026"
                />
              </Field>
              <div className="flex gap-[14px]">
                <Field label="วันที่จัดงาน" className="flex-1">
                  <Input
                    type="date"
                    value={info.date}
                    onChange={(v) => setField("date", v)}
                  />
                </Field>
                <Field label="เวลาเริ่ม" className="w-[140px]">
                  <Input
                    type="time"
                    value={info.time}
                    onChange={(v) => setField("time", v)}
                  />
                </Field>
                <Field label="หมวดหมู่" className="w-[180px]">
                  <Input
                    value={info.category}
                    onChange={(v) => setField("category", v)}
                    placeholder="คอนเสิร์ต"
                  />
                </Field>
              </div>
              <Field label="สถานที่">
                <Input
                  value={info.venue}
                  onChange={(v) => setField("venue", v)}
                  placeholder="เช่น IMPACT Arena เมืองทอง"
                />
              </Field>
              <Field label="รายละเอียดงาน">
                <textarea
                  value={info.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="อธิบายเกี่ยวกับงาน ไลน์อัพ และข้อมูลสำคัญ..."
                  className="min-h-[96px] w-full rounded-[9px] border border-line-2 px-[14px] py-[13px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
                />
              </Field>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">โซนและราคาบัตร</h2>
              <button
                onClick={addZone}
                className="text-[14px] font-medium text-accent"
              >
                + เพิ่มโซน
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {zones.map((z, i) => (
                <ZoneRow
                  key={i}
                  z={z}
                  color={ZONE_COLORS[i % ZONE_COLORS.length]}
                  onChange={(patch) => setZone(i, patch)}
                  onRemove={() => removeZone(i)}
                  removable={zones.length > 1}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-[10px] bg-accent-soft-3 px-5 py-4">
              <span className="text-[14px] text-muted">ความจุรวม</span>
              <span className="text-[18px] font-bold">
                {totalCap.toLocaleString("en-US")} ที่นั่ง
              </span>
            </div>
          </Card>
        )}

        {error && (
          <div className="mt-4 rounded-[10px] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#dc2626]">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(1)}
              className="rounded-[10px] border border-[#d4d4d8] px-7 py-[13px] text-[15px] font-medium transition-colors hover:bg-surface"
            >
              ← ย้อนกลับ
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={next}
            disabled={submitting}
            className="rounded-[10px] bg-accent px-8 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-[#c4b5fd]"
          >
            {step === 1
              ? "ถัดไป: โซน & ราคา"
              : submitting
                ? "กำลังเผยแพร่…"
                : "เผยแพร่อีเวนต์"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoneRow({ z, color, onChange, onRemove, removable }) {
  const seated = z.type === "seated";
  return (
    <div className="rounded-[12px] border border-[#eee] p-4">
      <div className="flex items-center gap-3">
        <div className="h-[14px] w-[14px] flex-shrink-0 rounded-[4px]" style={{ background: color }} />
        <input
          value={z.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="ชื่อโซน (เช่น VIP / ZONE A)"
          className="flex-1 rounded-[9px] border border-line-2 px-[13px] py-[10px] text-[14px] font-medium outline-none placeholder:text-fainter focus:border-accent"
        />
        <div className="flex overflow-hidden rounded-[9px] border border-line-2 text-[13px]">
          <TypeTab on={seated} onClick={() => onChange({ type: "seated" })}>
            มีที่นั่ง
          </TypeTab>
          <TypeTab on={!seated} onClick={() => onChange({ type: "ga" })}>
            ยืน
          </TypeTab>
        </div>
        {removable && (
          <button
            onClick={onRemove}
            className="px-1 text-[18px] text-fainter hover:text-[#dc2626]"
            aria-label="ลบโซน"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-[10px]">
        <Field label="ราคา (฿)" className="w-[140px]">
          <Input
            type="number"
            value={z.price}
            onChange={(v) => onChange({ price: v })}
            placeholder="0"
          />
        </Field>
        {seated ? (
          <>
            <Field label="แถว (A–Z)" className="w-[120px]">
              <Input
                type="number"
                value={z.rows}
                onChange={(v) => onChange({ rows: v })}
                placeholder="10"
              />
            </Field>
            <Field label="ที่นั่ง/แถว" className="w-[120px]">
              <Input
                type="number"
                value={z.cols}
                onChange={(v) => onChange({ cols: v })}
                placeholder="18"
              />
            </Field>
            <div className="flex flex-1 items-end pb-[12px] text-[13px] text-fainter">
              รวม{" "}
              {Number(z.rows) > 0 && Number(z.cols) > 0
                ? (Number(z.rows) * Number(z.cols)).toLocaleString("en-US")
                : "—"}{" "}
              ที่นั่ง
            </div>
          </>
        ) : (
          <Field label="จำนวนบัตร" className="w-[160px]">
            <Input
              type="number"
              value={z.capacity}
              onChange={(v) => onChange({ capacity: v })}
              placeholder="500"
            />
          </Field>
        )}
      </div>
    </div>
  );
}

function TypeTab({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-[10px] font-medium transition-colors"
      style={{
        background: on ? "#7c3aed" : "#fff",
        color: on ? "#fff" : "#71717a",
      }}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-[16px] border border-[#eee] bg-white p-8">
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <div className="mb-[7px] text-[13px] text-muted">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[9px] border border-line-2 px-[14px] py-[11px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
    />
  );
}
