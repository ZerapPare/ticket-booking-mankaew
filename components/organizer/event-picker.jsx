"use client";

import { useRouter } from "next/navigation";

// ตัวเลือกอีเวนต์ — เปลี่ยนแล้ว navigate ไป ?event=<id> (ให้ server page อ่านต่อ)
export default function EventPicker({ options, value, basePath }) {
  const router = useRouter();
  if (!options?.length) return null;

  return (
    <select
      value={value || ""}
      onChange={(e) => router.push(`${basePath}?event=${e.target.value}`)}
      className="rounded-[9px] border border-line-2 bg-white px-4 py-[10px] text-[14px] text-muted outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.title}
        </option>
      ))}
    </select>
  );
}
