"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveEventAction, rejectEventAction } from "@/lib/actions/admin";

export default function ApprovalActions({ id }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  function run(action) {
    setErr("");
    start(async () => {
      const res = await action(id);
      if (res?.ok) router.refresh();
      else setErr(res?.error || "ดำเนินการไม่สำเร็จ");
    });
  }

  return (
    <div className="flex flex-col items-end gap-[6px]">
      <div className="flex gap-[10px]">
        <button
          onClick={() => run(rejectEventAction)}
          disabled={pending}
          className="rounded-[9px] border border-line-2 px-5 py-[10px] text-[14px] font-medium text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
        >
          ปฏิเสธ
        </button>
        <button
          onClick={() => run(approveEventAction)}
          disabled={pending}
          className="rounded-[9px] bg-accent px-6 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          {pending ? "กำลังบันทึก…" : "อนุมัติ"}
        </button>
      </div>
      {err && <span className="text-[12px] text-danger">{err}</span>}
    </div>
  );
}
