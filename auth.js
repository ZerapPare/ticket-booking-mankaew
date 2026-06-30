import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { supabaseServer } from "@/lib/supabase/server";
import { roleForEmail } from "@/lib/roles";

/*
  ตัวจริงของ Auth.js (รันฝั่ง Node ใน route handler — ใช้ service role + bcrypt ได้)
  - Credentials: ตรวจอีเมล/รหัสผ่านกับตาราง profiles (bcrypt.compare)
  - Google: เปิดใช้เมื่อมี AUTH_GOOGLE_ID/SECRET; sync profile ลง DB ใน jwt callback
  - role: ใช้ profiles.role เป็นหลัก, ผู้ใช้ใหม่จาก Google ใช้ roleForEmail()
*/
const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(creds) {
      const email = String(creds?.email || "").toLowerCase().trim();
      const password = String(creds?.password || "");
      if (!email || !password) return null;

      const { data: profile, error } = await supabaseServer()
        .from("profiles")
        .select("id, email, full_name, role, password_hash")
        .eq("email", email)
        .maybeSingle();

      if (error || !profile || !profile.password_hash) return null;
      const ok = await bcrypt.compare(password, profile.password_hash);
      if (!ok) return null;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (!user) return token;

      // Credentials: มี id + role จาก authorize แล้ว
      if (user.role) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }

      // OAuth (Google) ครั้งแรก: หา/สร้าง profile ใน DB
      const email = (user.email || "").toLowerCase();
      const db = supabaseServer();
      let { data: profile } = await db
        .from("profiles")
        .select("id, role")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        const { data: created } = await db
          .from("profiles")
          .insert({
            email,
            full_name: user.name,
            avatar_url: user.image,
            role: roleForEmail(email),
          })
          .select("id, role")
          .single();
        profile = created;
      }

      if (profile) {
        token.id = profile.id;
        token.role = profile.role;
      }
      return token;
    },
  },
});