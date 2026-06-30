import { Suspense } from "react";
import LoginForm from "@/components/login-form";

export const metadata = { title: "เข้าสู่ระบบ — Mankaew" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}