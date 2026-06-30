import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/");
  return <AdminShell>{children}</AdminShell>;
}