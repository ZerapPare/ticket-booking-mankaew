// UI constants + view helpers for the Admin console.
// (Real data now comes from lib/data/admin.js + lib/actions/admin.js.)
// This file holds only presentational config — no mock datasets.

export const ADMIN_PROFILE = {
  initial: "A",
  name: "Admin",
  role: "ผู้ดูแลแพลตฟอร์ม",
  dark: true,
};

// nav hrefs (badges injected live from AdminShell props)
export const ADMIN_NAV = [
  { href: "/admin", icon: "▦", label: "ภาพรวม", badgeKey: null },
  { href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้", badgeKey: null },
  { href: "/admin/approvals", icon: "✓", label: "อนุมัติอีเวนต์", badgeKey: "approvals" },
];

export const ADMIN_USER_TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "buyer", label: "ผู้ซื้อ" },
  { id: "organizer", label: "ผู้จัดงาน" },
];

// เติมสีสำหรับแถวผู้ใช้ (avatar / role / status) ตาม role (label ไทย) + สถานะ ok
export function userView(u) {
  const isOrg = u.role === "ผู้จัดงาน";
  return {
    ...u,
    avBg: isOrg ? "#18181b" : "#ede9fe",
    avFg: isOrg ? "#fff" : "#7c3aed",
    roleColor: isOrg ? "#7c3aed" : "#3f3f46",
    roleBg: isOrg ? "#f5f3ff" : "#f4f4f5",
    stColor: u.ok === true ? "#16a34a" : u.ok === false ? "#d97706" : "#dc2626",
    stBg: u.ok === true ? "#f0fdf4" : u.ok === false ? "#fffbeb" : "#fef2f2",
  };
}
