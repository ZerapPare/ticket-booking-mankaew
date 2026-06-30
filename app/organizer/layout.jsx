import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { ORG_NAV, ORG_PROFILE } from "@/lib/organizer-mock";

export default async function OrganizerLayout({ children }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id) redirect("/login?callbackUrl=/organizer");
  if (role !== "organizer" && role !== "admin") redirect("/");

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
