"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelHold } from "@/lib/actions/booking";
import { formatClock } from "@/lib/format";

/*
  นับถอยหลังจาก hold_expires_at (เวลาจาก DB) — เป็น source of truth จริง
  หมดเวลา -> ยกเลิก hold (คืนที่นั่ง) แล้วเด้งออก
*/
export default function HoldCountdown({
  expiresAt,
  txnId,
  redirectTo = "/events",
  className = "",
}) {
  const target = expiresAt ? new Date(expiresAt).getTime() : null;
  const [secs, setSecs] = useState(() =>
    target ? Math.max(0, Math.ceil((target - Date.now()) / 1000)) : 0
  );
  const router = useRouter();

  useEffect(() => {
    if (target == null) return;
    const t = setInterval(() => {
      const r = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setSecs(r);
      if (r <= 0) {
        clearInterval(t);
        cancelHold(txnId).finally(() => router.replace(redirectTo));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [target, txnId, redirectTo, router]);

  return <span className={className}>{formatClock(secs)}</span>;
}
