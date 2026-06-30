import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutStepper from "@/components/checkout-stepper";
import HoldCountdown from "@/components/hold-countdown";
import CartActions from "@/components/cart-actions";
import { getTransaction } from "@/lib/data/transactions";
import { formatBaht } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "สรุปคำสั่งซื้อ — Mankaew" };

export default async function CartPage({ searchParams }) {
  const { txn } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/events");

  const t = txn ? await getTransaction(txn, session.user.id) : null;
  if (!t) redirect("/events");
  if (t.status === "paid") redirect(`/tickets/${t.id}`);
  if (t.status !== "pending") redirect(`/events/${t.event.id}`);

  return (
    <div className="mx-auto max-w-[880px] px-12 pb-14 pt-9">
      <CheckoutStepper current={2} />

      {/* hold countdown */}
      <div
        className="mb-7 flex items-center justify-between rounded-[14px] px-[26px] py-5 text-white"
        style={{ background: "linear-gradient(120deg,#7c3aed,#9333ea)" }}
      >
        <div className="flex items-center gap-[14px]">
          <span className="text-[24px]">⏱</span>
          <div>
            <div className="text-[14px] opacity-85">เวลาถือบัตรของคุณ</div>
            <div className="text-[13px] opacity-70">
              ชำระเงินภายในเวลาที่กำหนด มิฉะนั้นบัตรจะถูกปล่อยคืน
            </div>
          </div>
        </div>
        <HoldCountdown
          expiresAt={t.holdExpiresAt}
          txnId={t.id}
          redirectTo={`/events/${t.event.id}`}
          className="font-mono text-[40px] font-bold tracking-[1px]"
        />
      </div>

      <h1 className="mb-6 text-[30px] font-bold tracking-[-.5px]">สรุปคำสั่งซื้อ</h1>

      <div className="mb-6 overflow-hidden rounded-[16px] border border-[#eee]">
        <div className="flex gap-5 border-b border-surface p-6">
          <div
            className="aspect-[3/4] w-[90px] flex-shrink-0 rounded-[8px]"
            style={{ background: t.event.grad }}
          />
          <div className="flex-1">
            <div className="mb-[6px] text-[19px] font-semibold">
              {t.event.title}
            </div>
            <div className="mb-[14px] text-[14px] text-faint">
              {t.event.date} • {t.event.venue}
            </div>
            <div className="flex flex-col gap-2">
              {t.zones.map((z) => (
                <div key={z.name} className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface px-3 py-[6px] text-[13px]">
                    {z.name}
                  </span>
                  <span className="rounded-full bg-surface px-3 py-[6px] text-[13px]">
                    {z.count} ใบ
                  </span>
                  {z.seatLabels.length > 0 && (
                    <span className="rounded-full bg-accent-soft-2 px-3 py-[6px] font-mono text-[13px] text-accent">
                      ที่นั่ง {z.seatLabels.join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-[22px]">
          {t.zones.map((z) => (
            <div
              key={z.name}
              className="mb-[10px] flex justify-between text-[14px] text-faint"
            >
              <span>
                ราคาบัตร ({z.name}) × {z.count}
              </span>
              <span>{formatBaht(z.price * z.count)}</span>
            </div>
          ))}
          <div className="mt-[6px] flex justify-between border-t border-[#f0f0f1] pt-[14px] text-[20px] font-bold">
            <span>ยอดชำระทั้งหมด</span>
            <span>{formatBaht(t.total)}</span>
          </div>
        </div>
      </div>

      <CartActions txnId={t.id} eventId={t.event.id} />
    </div>
  );
}
