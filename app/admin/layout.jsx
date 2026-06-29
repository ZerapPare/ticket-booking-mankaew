import AdminShell from "@/components/admin/admin-shell";

// TODO (auth phase): guard with auth() — require role admin.
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
