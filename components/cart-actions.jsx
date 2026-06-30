"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cancelHold } from "@/lib/actions/booking";

export default function CartActions({ txnId, eventId }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function edit() {
    start(async () => {
      await cancelHold(txnId);
      router.push(`/events/${eventId}/seats`);
    });
  }

  return (
    <div className="flex gap-[14px]">
      <button
        onClick={edit}
        disabled={pending}
        className="rounded-[10px] border border-[#d4d4d8] px-7 py-[15px] text-[16px] font-medium text-ink transition-colors hover:bg-surface disabled:opacity-60"
      >
        ← แก้ไข
      </button>
      <Link
        href={`/payment?txn=${txnId}`}
        className="flex-1 rounded-[10px] bg-accent py-[15px] text-center text-[16px] font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        ดำเนินการชำระเงิน
      </Link>
    </div>
  );
}
