"use client";

import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { AdminProvider, useAdmin } from "@/components/admin/admin-provider";
import { ADMIN_NAV, ADMIN_PROFILE } from "@/lib/admin-mock";

function Shell({ children }) {
  const { pendingApprovals, pendingRefunds } = useAdmin();
  const items = ADMIN_NAV.map((n) => ({
    ...n,
    badge:
      n.badgeKey === "approvals"
        ? pendingApprovals
        : n.badgeKey === "refunds"
          ? pendingRefunds
          : 0,
  }));
  return (
    <div className="flex min-h-screen bg-bg-soft">
      <DashboardSidebar
        brandLabel="ADMIN CONSOLE"
        items={items}
        profile={ADMIN_PROFILE}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export default function AdminShell({ children }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
