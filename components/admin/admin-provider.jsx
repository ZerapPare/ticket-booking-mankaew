"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  ADMIN_APPROVALS,
  ADMIN_PAYOUTS,
  ADMIN_REFUNDS,
} from "@/lib/admin-mock";

/*
  In-memory admin state so the sidebar badges + dashboard counts stay in sync
  with actions on the approvals / payouts / refunds pages (approve, pay, deny).
  UI only — TODO: back these with real tables + server actions later.
*/
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [approvals, setApprovals] = useState(ADMIN_APPROVALS);
  const [payouts, setPayouts] = useState(ADMIN_PAYOUTS);
  const [refunds, setRefunds] = useState(ADMIN_REFUNDS);

  const actions = useMemo(
    () => ({
      resolveApproval: (id) =>
        setApprovals((list) => list.filter((a) => a.id !== id)),
      payPayout: (id) =>
        setPayouts((list) =>
          list.map((p) =>
            p.id === id ? { ...p, paid: true, status: "โอนแล้ว" } : p
          )
        ),
      setRefundState: (id, state) =>
        setRefunds((list) =>
          list.map((r) => (r.id === id ? { ...r, state } : r))
        ),
    }),
    []
  );

  const pendingApprovals = approvals.length;
  const pendingRefunds = refunds.filter((r) => r.state === "pending").length;
  const pendingPayouts = payouts.filter((p) => !p.paid && !p.locked).length;

  const value = useMemo(
    () => ({
      approvals,
      payouts,
      refunds,
      pendingApprovals,
      pendingRefunds,
      pendingPayouts,
      ...actions,
    }),
    [approvals, payouts, refunds, pendingApprovals, pendingRefunds, pendingPayouts, actions]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
}
