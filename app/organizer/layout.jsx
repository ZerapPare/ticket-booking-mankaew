import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";

export const ORG_NAV = [
  { href: "/organizer", icon: "▦", label: "แดชบอร์ด" },
  { href: "/organizer/events", icon: "🗓", label: "อีเวนต์ของฉัน" },
  { href: "/organizer/create", icon: "＋", label: "สร้างอีเวนต์" },
  { href: "/organizer/checkin", icon: "✓", label: "เช็คอินหน้างาน" },
  { href: "/organizer/attendees", icon: "👥", label: "ผู้เข้างาน" },
];

export default async function OrganizerLayout({ children }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) redirect("/login?callbackUrl=/organizer");
  if (role !== "organizer" && role !== "admin") redirect("/");

  const name = session.user.name || session.user.email || "ผู้จัดงาน";
  const profile = {
    initial: name.charAt(0).toUpperCase(),
    name,
    role: role === "admin" ? "แอดมิน" : "ผู้จัดงาน",
  };

  return (
    <div className="flex min-h-screen bg-bg-soft">
      <DashboardSidebar brandLabel="ORGANIZER" items={ORG_NAV} profile={profile} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
