import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { ORG_NAV, ORG_PROFILE } from "@/lib/organizer-mock";

// TODO (auth phase): guard this layout with auth() — require role organizer/admin.
export default function OrganizerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-soft">
      <DashboardSidebar
        brandLabel="ORGANIZER"
        items={ORG_NAV}
        profile={ORG_PROFILE}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
