"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEventAction } from "@/lib/actions/organizer";

export default function EditEventForm({ event }) {
  const router = useRouter();
  const [info, setInfo] = useState({
    title: event.title,
    date: event.date,
    time: event.time,
    category: event.category,
    venue: event.venue,
    description: event.description,
  });
  const [zones, setZones] = useState(
    event.zones.map((z) => ({ ...z, price: String(z.price) }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const setField = (k, v) => {
    setSaved(false);
    setInfo((s) => ({ ...s, [k]: v }));
  };
  const setZonePrice = (id, v) => {
    setSaved(false);
    setZones((zs) => zs.map((z) => (z.id === id ? { ...z, price: v } : z)));
  };

  async function save() {
    setError("");
    setSaved(false);
    if (!info.title.trim() || !info.venue.trim() || !info.date)
      return setError("กรอกชื่อ วันที่ และสถานที่ให้ครบ");

    const zonePrices = [];
    for (const z of zones) {
      const price = Number(z.price);
      if (!Number.isFinite(price) || price < 0)
        return setError(`ราคาโซน "${z.name}" ไม่ถูกต้อง`);
      zonePrices.push({ id: z.id, price });
    }

    setSaving(true);
    const res = await updateEventAction(event.id, {
      title: info.title.trim(),
      startsAt: `${info.date}T${info.time || "19:00"}:00`,
      category: info.category?.trim() || undefined,
      venue: info.venue.trim(),
      description: info.description?.trim() || undefined,
      zonePrices,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="max-w-[900px] p-[32px_40px]">
      <Card>
        <h2 className="mb-6 text-[18px] font-semibold">ข้อมูลงาน</h2>
        <div className="flex flex-col gap-[18px]">
          <Field label="ชื่ออีเวนต์">
            <Input value={info.title} onChange={(v) => setField("title", v)} />
          </Field>
          <div className="flex gap-[14px]">
            <Field label="วันที่จัดงาน" className="flex-1">
              <Input type="date" value={info.date} onChange={(v) => setField("date", v)} />
            </Field>
            <Field label="เวลาเริ่ม" className="w-[140px]">
              <Input type="time" value={info.time} onChange={(v) => setField("time", v)} />
            </Field>
            <Field label="หมวดหมู่" className="w-[180px]">
              <Input value={info.category} onChange={(v) => setField("category", v)} placeholder="คอนเสิร์ต" />
            </Field>
          </div>
          <Field label="สถานที่">
            <Input value={info.venue} onChange={(v) => setField("venue", v)} />
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

      <div className="mt-5">
        <Card>
          <h2 className="mb-1 text-[18px] font-semibold">ราคาบัตรต่อโซน</h2>
          <p className="mb-5 text-[13px] text-fainter">
            แก้ไขได้เฉพาะราคา — การเพิ่ม/ลบโซนหรือจำนวนที่นั่งทำไม่ได้เมื่อเริ่มขายแล้ว
          </p>
          <div className="flex flex-col gap-[10px]">
            {zones.map((z) => (
              <div
                key={z.id}
                className="flex items-center gap-4 rounded-[10px] border border-[#eee] px-4 py-3"
              >
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{z.name}</div>
                  <div className="text-[12px] text-fainter">
                    {z.type === "seated" ? "มีที่นั่ง" : "ยืน"} • ความจุ{" "}
                    {z.capacity.toLocaleString("en-US")} • ขายแล้ว{" "}
                    {z.sold.toLocaleString("en-US")}
                  </div>
                </div>
                <div className="w-[160px]">
                  <div className="mb-[6px] text-[12px] text-muted">ราคา (฿)</div>
                  <Input
                    type="number"
                    value={z.price}
                    onChange={(v) => setZonePrice(z.id, v)}
                  />
                </div>
              </div>
            ))}
            {zones.length === 0 && (
              <div className="py-4 text-center text-[13px] text-fainter">
                ยังไม่มีโซน
              </div>
            )}
          </div>
        </Card>
      </div>

      {error && (
        <div className="mt-4 rounded-[10px] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#dc2626]">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="mt-4 rounded-[10px] bg-[#f0fdf4] px-4 py-3 text-[14px] text-[#16a34a]">
          บันทึกแล้ว — ส่งให้แอดมินอนุมัติอีกครั้ง
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push(`/organizer/report/${event.id}`)}
          className="rounded-[10px] border border-[#d4d4d8] px-7 py-[13px] text-[15px] font-medium transition-colors hover:bg-surface"
        >
          ← กลับ
        </button>
        <div className="flex-1" />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-[10px] bg-accent px-8 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-[#c4b5fd]"
        >
          {saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-[16px] border border-[#eee] bg-white p-8">{children}</div>
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