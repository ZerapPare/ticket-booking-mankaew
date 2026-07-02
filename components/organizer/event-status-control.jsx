"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setEventStatusAction } from "@/lib/actions/organizer";
import { StatusPill } from "@/components/dashboard/primitives";

const PILL = {
  published: { label: "กำลังขาย", color: "#16a34a", bg: "#f0fdf4" },
  pending: { label: "รออนุมัติ", color: "#f59e0b", bg: "#fffbeb" },
  cancelled: { label: "ยกเลิก", color: "#dc2626", bg: "#fef2f2" },
  completed: { label: "ปิดการขาย", color: "#71717a", bg: "#f4f4f5" },
};

// ข้อความอธิบายสถานะที่ organizer จัดการเองไม่ได้
const NOTE = {
  pending: "อีเวนต์นี้กำลังรอแอดมินอนุมัติ",
  cancelled: "อีเวนต์ถูกยกเลิก — แก้ไขรายละเอียดเพื่อส่งอนุมัติใหม่",
};

export default function EventStatusControl({ eventId, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pill = PILL[status] || { label: status, color: "#71717a", bg: "#f4f4f5" };

  // organizer จัดการได้เฉพาะเมื่ออีเวนต์ผ่านการอนุมัติแล้ว (published/completed)
  const actions = [];
  if (status === "published") {
    actions.push({ to: "completed", label: "ปิดการขาย", variant: "neutral" });
    actions.push({ to: "cancelled", label: "ยกเลิกอีเวนต์", variant: "danger" });
  } else if (status === "completed") {
    actions.push({ to: "published", label: "เปิดขายอีกครั้ง", variant: "primary" });
    actions.push({ to: "cancelled", label: "ยกเลิกอีเวนต์", variant: "danger" });
  }

  async function change(to) {
    if (busy) return;
    if (
      to === "cancelled" &&
      !window.confirm("ยืนยันยกเลิกอีเวนต์นี้? ผู้ซื้อจะไม่เห็นอีเวนต์นี้อีก")
    )
      return;
    setError("");
    setBusy(true);
    const res = await setEventStatusAction(eventId, to);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#eee] bg-white p-5">
      <span className="text-[14px] text-faint">สถานะ:</span>
      <StatusPill label={pill.label} color={pill.color} bg={pill.bg} />
      {actions.length === 0 && NOTE[status] && (
        <span className="text-[13px] text-fainter">— {NOTE[status]}</span>
      )}
      <div className="flex-1" />
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.to}
            onClick={() => change(a.to)}
            disabled={busy}
            className="rounded-[9px] px-4 py-[9px] text-[14px] font-semibold transition-colors disabled:opacity-50"
            style={variantStyle(a.variant)}
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && <div className="w-full text-[13px] text-[#dc2626]">{error}</div>}
    </div>
  );
}

function variantStyle(v) {
  if (v === "primary") return { background: "#7c3aed", color: "#fff" };
  if (v === "danger")
    return { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  return { background: "#fff", color: "#3f3f46", border: "1px solid #d4d4d8" };
}
