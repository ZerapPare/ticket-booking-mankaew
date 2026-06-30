// Next.js 16: middleware = "proxy" — ทำหน้าที่ RBAC redirect (optimistic)
// ใช้ NextAuth instance แบบ edge-safe (authConfig ไม่มี providers/Node deps)
// ความปลอดภัยจริงเช็คซ้ำใน layout/page ฝั่ง server ด้วย auth()
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Auth.js middleware function -> ใช้เป็น proxy ของ Next 16
export default auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/organizer/:path*",
    "/account",
    "/queue/:path*",
    "/cart",
    "/payment",
  ],
};