"use client";

import { useEffect, useState } from "react";

/*
  Returns the whole seconds remaining until `expiresAt` (epoch ms), ticking once
  per second. Returns null when no deadline is set.

  UI-only: the authoritative hold deadline must come from the backend in
  production so the timer can't be reset by reloading the page.
*/
export function useCountdown(expiresAt) {
  const calc = () =>
    expiresAt == null ? null : Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    setRemaining(calc());
    if (expiresAt == null) return;
    const t = setInterval(() => {
      const r = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  return remaining;
}
