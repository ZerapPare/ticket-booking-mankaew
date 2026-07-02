import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { ADMIN_NAV, ADMIN_PROFILE } from "@/lib/admin-mock";

export default function AdminShell({ children, badges }) {
  const { pendingApprovals = 0 } = badges || {};
  const items = ADMIN_NAV.map((n) => ({
    ...n,
    badge: n.badgeKey === "approvals" ? pendingApprovals : 0,
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
