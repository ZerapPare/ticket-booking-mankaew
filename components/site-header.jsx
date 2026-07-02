import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";

// Sticky header — รู้สถานะ session (server component)
export default async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-white/[.86] px-12 py-[18px] backdrop-blur-[10px]">
      <div className="flex items-center gap-11">
        <Logo />
        <nav className="hidden items-center gap-[30px] text-[15px] text-muted md:flex">
          <Link href="/events" className="hover:text-ink">คอนเสิร์ต</Link>
          <Link href="/events" className="hover:text-ink">เทศกาล</Link>
        </nav>
      </div>
      <div className="flex items-center gap-[18px]">
        <Link
          href="/events"
          className="hidden w-60 items-center gap-[10px] rounded-full border border-line-2 bg-surface px-[18px] py-[9px] text-[14px] text-fainter sm:flex"
        >
          <span aria-hidden>⌕</span> ค้นหาศิลปิน, อีเวนต์
        </Link>

        {role === "admin" && (
          <Link href="/admin" className="text-[15px] text-muted hover:text-ink">
            Admin
          </Link>
        )}
        {role === "organizer" && (
          <Link
            href="/organizer"
            className="text-[15px] text-muted hover:text-ink"
          >
            หลังบ้าน
          </Link>
        )}

        {user ? (
          <Link
            href="/account"
            className="flex items-center gap-2 text-[15px] text-muted hover:text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft-2 text-[13px] font-semibold text-accent">
              {(user.name || user.email || "?").charAt(0).toUpperCase()}
            </span>
            ตั๋วของฉัน
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-accent px-5 py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}