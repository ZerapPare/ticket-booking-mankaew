import { DashboardHeader } from "@/components/dashboard/primitives";
import { getAdminFinance } from "@/lib/data/admin";

export default async function AdminFinance() {
  const { totalFees } = await getAdminFinance();

  return (
    <div>
      <DashboardHeader
        title="การเงิน"
        subtitle="รายได้ค่าธรรมเนียมของแพลตฟอร์ม"
      />
      <div className="p-[32px_40px]">
        <div className="max-w-[360px] rounded-[14px] bg-dark p-6 text-white">
          <div className="mb-[10px] text-[13px] opacity-70">
            รายได้ค่าธรรมเนียมรวม
          </div>
          <div className="text-[30px] font-bold">{totalFees}</div>
          <div className="mt-2 text-[12px] opacity-60">เดือนนี้</div>
        </div>
      </div>
    </div>
  );
}