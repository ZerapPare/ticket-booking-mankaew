import { DashboardHeader } from "@/components/dashboard/primitives";
import UsersTable from "@/components/admin/users-table";
import { listUsers } from "@/lib/data/admin";

export default async function AdminUsers() {
  const users = await listUsers();

  return (
    <div>
      <DashboardHeader
        title="จัดการผู้ใช้"
        subtitle={`${users.length.toLocaleString("en-US")} บัญชีทั้งหมด`}
        action={
          <div className="w-[240px] rounded-[9px] border border-line-2 px-4 py-[10px] text-[14px] text-fainter">
            ค้นหาชื่อ / อีเมล
          </div>
        }
      />
      <div className="p-[32px_40px]">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
