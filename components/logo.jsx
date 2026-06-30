import Link from "next/link";

// โลโก้ Mankaew. (client-safe — ใช้ร่วมได้ทั้ง server/client component)
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