"use client";

import { useState } from "react";
import {
  TableShell,
  TableRow,
  StatusPill,
} from "@/components/dashboard/primitives";
import { ADMIN_USER_TABS, userView } from "@/lib/admin-mock";

const TEMPLATE = "1.8fr 1fr 1fr 1fr 0.8fr";

export default function UsersTable({ users }) {
  const [tab, setTab] = useState("all");

  const rows = users
    .filter(
      (u) =>
        tab === "all" ||
        (tab === "buyer" && u.role === "ผู้ซื้อ") ||
        (tab === "organizer" && u.role === "ผู้จัดงาน")
    )
    .map(userView);

  return (
    <>
      <div className="mb-[22px] flex gap-[10px]">
        {ADMIN_USER_TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-[18px] py-[9px] text-[14px] transition-colors ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-line-2 bg-white text-muted hover:border-accent-border"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <TableShell
        template={TEMPLATE}
        headers={["ผู้ใช้", "ประเภท", "เข้าร่วม", "กิจกรรม", "สถานะ"]}
      >
        {rows.map((u) => (
          <TableRow key={u.id || u.email} template={TEMPLATE}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-semibold"
                style={{ background: u.avBg, color: u.avFg }}
              >
                {u.initial}
              </div>
              <div>
                <div className="text-[14px] font-medium">{u.name}</div>
                <div className="text-[12px] text-fainter">{u.email}</div>
              </div>
            </div>
            <span>
              <StatusPill label={u.role} color={u.roleColor} bg={u.roleBg} />
            </span>
            <span className="text-[13px] text-faint">{u.joined}</span>
            <span className="text-[13px] text-muted">{u.activity}</span>
            <span>
              <StatusPill label={u.status} color={u.stColor} bg={u.stBg} />
            </span>
          </TableRow>
        ))}
      </TableShell>
    </>
  );
}
