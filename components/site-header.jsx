import Link from "next/link";

// Shared sticky header (chrome) for the buyer browsing/checkout routes.
// Search is a link to the list for now; wire to real search later.
export default function SiteHeader() {
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
        <Link href="/account" className="text-[15px] text-muted hover:text-ink">
          ตั๋วของฉัน
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-accent px-5 py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
}

export function Logo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`font-mono text-[22px] font-bold tracking-[1px] ${className}`}
    >
      Mankaew<span className="text-accent">.</span>
    </Link>
  );
}
