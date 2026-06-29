"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Shared dashboard sidebar (248px) for Organizer + Admin consoles.
  - brandLabel: "ORGANIZER" | "ADMIN CONSOLE"
  - items: [{ href, icon, label, badge? }]
  - profile: { initial, name, role, dark? }
*/
export default function DashboardSidebar({ brandLabel, items, profile }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-surface px-6 pb-5 pt-6">
        <Link
          href="/"
          className="font-mono text-[20px] font-bold tracking-[1px]"
        >
          Mankaew<span className="text-accent">.</span>
        </Link>
        <div className="mt-[2px] font-mono text-[11px] tracking-[2px] text-fainter">
          {brandLabel}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-[14px_14px]">
        {items.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-[9px] px-[14px] py-[11px] text-[15px] transition-colors ${
                active
                  ? "bg-accent-soft font-semibold text-accent"
                  : "text-muted hover:bg-bg-soft"
              }`}
            >
              <span className="w-5 text-center text-[17px]">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.badge > 0 && (
                <span className="rounded-full bg-accent px-2 py-[2px] text-[11px] font-bold text-white">
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-surface p-4">
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[15px] font-semibold text-white"
          style={{
            background: profile.dark
              ? "#18181b"
              : "linear-gradient(135deg,#7c3aed,#9333ea)",
          }}
        >
          {profile.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">
            {profile.name}
          </div>
          <div className="text-[12px] text-fainter">{profile.role}</div>
        </div>
      </div>
    </aside>
  );
}
