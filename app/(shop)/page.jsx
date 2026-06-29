import Link from "next/link";
import KeyVisual from "@/components/key-visual";
import SiteFooter from "@/components/site-footer";
import { FEATURED, UPCOMING } from "@/lib/mock-data";
import { formatBaht } from "@/lib/format";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 px-12 pb-[72px] pt-20 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="mb-6 font-mono text-[13px] uppercase tracking-[3px] text-accent">
            / Featured this week
          </div>
          <h1 className="mb-6 text-[56px] font-bold leading-[1.02] tracking-[-1px] sm:text-[72px]">
            NEON NIGHTS
            <br />
            BANGKOK 2026
          </h1>
          <p className="mb-9 max-w-[440px] text-[18px] leading-[1.55] text-faint">
            ค่ำคืนแห่ง T-Pop ครั้งใหญ่ที่สุดของปี รวมศิลปินชั้นนำกว่า 12 วง
            บนเวทีเดียว
          </p>
          <div className="mb-10 flex gap-10">
            <HeroMeta label="DATE" value={FEATURED.date} />
            <HeroMeta label="VENUE" value={FEATURED.venue} />
            <HeroMeta label="FROM" value={formatBaht(FEATURED.fromPrice)} />
          </div>
          <div className="flex gap-[14px]">
            <Link
              href={`/events/${FEATURED.id}`}
              className="rounded-[8px] bg-accent px-[38px] py-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              ซื้อบัตร
            </Link>
            <Link
              href={`/events/${FEATURED.id}`}
              className="rounded-[8px] border border-[#d4d4d8] px-8 py-[15px] text-[16px] font-medium text-ink transition-colors hover:bg-surface"
            >
              รายละเอียด
            </Link>
          </div>
        </div>

        <Link
          href={`/events/${FEATURED.id}`}
          className="relative flex aspect-[4/5] items-end rounded-[12px] border border-[#ece8fb] p-8"
          style={{ background: FEATURED.grad }}
        >
          <div
            className="absolute inset-0 rounded-[12px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg,transparent 0 14px, rgba(124,58,237,.04) 14px 15px)",
            }}
          />
          <div className="absolute left-6 top-6 rounded bg-white/70 px-[10px] py-[5px] font-mono text-[11px] tracking-wide text-accent">
            [ KEY VISUAL ]
          </div>
          <div className="relative font-mono text-[13px] tracking-wide text-accent">
            NOW ON SALE
          </div>
        </Link>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-[1280px] px-12 pb-[90px] pt-2">
        <div className="mb-7 flex items-baseline justify-between">
          <h2 className="text-[26px] font-semibold">อีเวนต์ที่กำลังจะมา</h2>
          <Link href="/events" className="text-[14px] text-accent">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {UPCOMING.map((ev) => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="group">
              <KeyVisual
                grad={ev.grad}
                className="mb-[14px] aspect-[3/4] rounded-[10px] border border-[#eee]"
              />
              <div className="mb-[6px] font-mono text-[11px] tracking-wide text-fainter">
                {ev.date}
              </div>
              <div className="mb-1 text-[17px] font-semibold group-hover:text-accent">
                {ev.title}
              </div>
              <div className="text-[13px] text-faint">{ev.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function HeroMeta({ label, value }) {
  return (
    <div>
      <div className="mb-[6px] font-mono text-[12px] tracking-[1px] text-fainter">
        {label}
      </div>
      <div className="text-[17px] font-medium">{value}</div>
    </div>
  );
}
