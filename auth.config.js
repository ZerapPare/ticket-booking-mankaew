// ค่าตั้ง Auth.js ส่วนที่ "edge-safe" — ใช้ได้ใน proxy.js (ไม่พึ่ง Node/Supabase/bcrypt)
// RBAC อยู่ใน callback `authorized` และการ map token<->session
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [], // providers จริงอยู่ใน auth.js (Credentials/Google)
  callbacks: {
    // ตัดสินสิทธิ์เข้าถึง route (ใช้โดย proxy)
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const p = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const needAdmin = p.startsWith("/admin");
      const needOrganizer = p.startsWith("/organizer");
      const needAuth =
        needAdmin ||
        needOrganizer ||
        p.startsWith("/account") ||
        p.startsWith("/queue") ||
        p === "/cart" ||
        p === "/payment";

      if (!needAuth) return true;
      if (!isLoggedIn) return false; // -> เด้งไป /login?callbackUrl=...
      if (needAdmin && role !== "admin")
        return Response.redirect(new URL("/", nextUrl));
      if (needOrganizer && role !== "organizer" && role !== "admin")
        return Response.redirect(new URL("/", nextUrl));
      return true;
    },
    // เผย role + id ลง session
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};