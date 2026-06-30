"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { Logo } from "@/components/logo";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (isRegister) {
      setError("ยังไม่เปิดสมัครสมาชิกด้วยอีเมลในขั้นนี้ — เข้าสู่ระบบด้วย Google ได้เลย");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    const s = await getSession();
    const role = s?.user?.role;
    router.push(
      callbackUrl ||
        (role === "admin" ? "/admin" : role === "organizer" ? "/organizer" : "/")
    );
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel */}
      <div
        className="relative flex flex-1 flex-col justify-between overflow-hidden p-14 text-white"
        style={{ background: "linear-gradient(150deg,#7c3aed,#5b21b6)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,transparent 0 18px, rgba(255,255,255,.04) 18px 19px)",
          }}
        />
        <Logo className="relative !text-[24px] text-white" />
        <div className="relative">
          <h2 className="mb-4 text-[40px] font-bold leading-[1.1]">
            ทุกค่ำคืนของดนตรี
            <br />
            เริ่มต้นที่นี่
          </h2>
          <p className="max-w-[360px] text-[16px] leading-[1.6] opacity-85">
            เข้าสู่ระบบเพื่อกดบัตร เก็บตั๋วอิเล็กทรอนิกส์
            และไม่พลาดทุกอีเวนต์ที่คุณรัก
          </p>
        </div>
        <div className="relative font-mono text-[13px] opacity-70">
          © 2026 Mankaew LIVE
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full flex-col justify-center px-8 py-14 sm:px-16 md:w-[480px]">
        <h1 className="mb-[6px] text-[30px] font-bold">
          {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </h1>
        <p className="mb-8 text-[15px] text-faint">
          {isRegister
            ? "สร้างบัญชีเพื่อเริ่มกดบัตร"
            : "ยินดีต้อนรับกลับมา กดบัตรต่อได้เลย"}
        </p>

        <form onSubmit={submit}>
          {isRegister && (
            <Field
              label="ชื่อ-นามสกุล"
              placeholder="กรอกชื่อของคุณ"
              value={name}
              onChange={setName}
            />
          )}
          <Field
            label="อีเมล"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={setEmail}
          />
          <Field
            label="รหัสผ่าน"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <div className="mb-4 rounded-[9px] bg-danger-bg px-[14px] py-3 text-[13px] text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mb-[18px] mt-1 w-full rounded-[10px] bg-accent py-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mb-[18px] flex items-center gap-3 text-[13px] text-fainter">
          <div className="h-px flex-1 bg-line" />
          หรือ
          <div className="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: callbackUrl || "/" })}
          className="mb-6 rounded-[10px] border border-line-2 py-[13px] text-center text-[15px] text-muted transition-colors hover:bg-surface"
        >
          ดำเนินการต่อด้วย Google
        </button>

        <div className="text-center text-[14px] text-faint">
          {isRegister ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError(null);
            }}
            className="font-semibold text-accent"
          >
            {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </div>

        <Link href="/" className="mt-8 text-center text-[13px] text-fainter hover:text-faint">
          ← กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="mb-4">
      <div className="mb-[6px] text-[13px] text-muted">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[9px] border border-line-2 px-[14px] py-[13px] text-[15px] outline-none placeholder:text-fainter focus:border-accent"
      />
    </div>
  );
}