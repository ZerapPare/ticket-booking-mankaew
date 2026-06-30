import { notFound } from "next/navigation";
import BuyButton from "@/components/buy-button";
import { getEventDetail } from "@/lib/data/events";
import { LINEUP } from "@/lib/mock-data";
import { formatBaht } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const ev = await getEventDetail(id);
  return { title: ev ? `${ev.title} — Mankaew` : "ไม่พบอีเวนต์ — Mankaew" };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = await getEventDetail(id);
  if (!event) notFound();

  return (
    <div>
      {/* Banner */}
      <section
        className="relative border-b border-[#eee]"
        style={{ background: event.grad }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,transparent 0 16px, rgba(0,0,0,.02) 16px 17px)",
          }}
        />
        <div className="relative mx-auto flex max-w-[1280px] flex-col items-start gap-12 px-12 py-14 md:flex-row md:items-end">
          <div className="relative aspect-[3/4] w-[280px] flex-shrink-0 overflow-hidden rounded-[12px] border border-white/70 bg-white/50">
            <div className="absolute left-3 top-3 rounded bg-white/80 px-2 py-1 font-mono text-[10px] tracking-wide text-[#52525b]">
              POSTER
            </div>
          </div>
          <div className="pb-2">
            <div className="mb-[18px] inline-block rounded-[5px] bg-accent px-[11px] py-[5px] font-mono text-[11px] tracking-wide text-white">
              ON SALE NOW
            </div>
            <h1 className="mb-4 text-[40px] font-bold leading-none tracking-[-1px] sm:text-[56px]">
              {event.title}
            </h1>
            <div className="text-[17px] text-muted">
              {event.date} • {event.venue}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 px-12 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-[14px] text-[22px] font-semibold">เกี่ยวกับงาน</h2>
          <p className="mb-9 text-[16px] leading-[1.7] text-muted">
            {event.desc || "—"}
          </p>

          <h2 className="mb-[18px] text-[22px] font-semibold">ไลน์อัพศิลปิน</h2>
          <div className="mb-10 flex flex-wrap gap-[10px]">
            {LINEUP.map((name) => (
              <span
                key={name}
                className="rounded-full border border-line-2 px-4 py-[9px] text-[14px] text-muted"
              >
                {name}
              </span>
            ))}
          </div>

          <h2 className="mb-[18px] text-[22px] font-semibold">ราคาบัตร</h2>
          <div className="overflow-hidden rounded-[12px] border border-[#eee]">
            {event.zones.map((z) => (
              <div
                key={z.id}
                className="flex items-center justify-between border-b border-surface px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-[14px]">
                  <span
                    className="h-3 w-3 rounded-[3px]"
                    style={{ background: z.color }}
                  />
                  <span className="text-[15px] font-medium">{z.name}</span>
                </div>
                <span className="text-[15px] font-semibold">
                  {formatBaht(z.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky purchase card */}
        <div>
          <div className="sticky top-24 rounded-[16px] border border-line-2 p-7">
            <div className="mb-2 font-mono text-[12px] tracking-[1px] text-fainter">
              ราคาเริ่มต้น
            </div>
            <div className="mb-1 text-[34px] font-bold">
              {formatBaht(event.fromPrice)}
            </div>
            <div className="mb-6 text-[13px] text-faint">
              รวมที่นั่งทุกโซน • บัตรอิเล็กทรอนิกส์
            </div>
            <div className="mb-5 flex items-center gap-3 rounded-[10px] bg-surface px-4 py-[14px]">
              <div className="text-[20px]">⏱</div>
              <div className="text-[13px] leading-[1.4] text-muted">
                บัตรจะเปิดขายรอบทั่วไป
                <br />
                <strong>เริ่มกดบัตรได้ทันที</strong> — มีระบบจัดคิว
              </div>
            </div>
            <BuyButton eventId={event.id} />
            <div className="text-center text-[12px] text-fainter">
              เมื่อกดแล้วคุณจะเข้าสู่ห้องรอคิว
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}