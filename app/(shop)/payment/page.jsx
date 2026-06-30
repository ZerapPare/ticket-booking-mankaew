import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutStepper from "@/components/checkout-stepper";
import HoldCountdown from "@/components/hold-countdown";
import PaymentPanel from "@/components/payment-panel";
import { getTransaction } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";
export const metadata = { title: "ชำระเงิน — Mankaew" };

export default async function PaymentPage({ searchParams }) {
  const { txn } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/events");

  const t = txn ? await getTransaction(txn, session.user.id) : null;
  if (!t) redirect("/events");
  if (t.status === "paid") redirect(`/tickets/${t.id}`);
  if (t.status !== "pending") redirect(`/events/${t.event.id}`);

  const zoneLabel = t.zones.map((z) => z.name).join(", ");

  return (
    <div className="mx-auto max-w-[880px] px-12 pb-14 pt-9">
      <CheckoutStepper
        current={3}
        right={
          <span className="text-accent">
            ⏱{" "}
            <HoldCountdown
              expiresAt={t.holdExpiresAt}
              txnId={t.id}
              redirectTo={`/events/${t.event.id}`}
            />
          </span>
        }
      />
      <h1 className="mb-6 text-[30px] font-bold tracking-[-.5px]">ชำระเงิน</h1>

      <PaymentPanel
        txnId={t.id}
        total={t.total}
        eventTitle={t.event.title}
        zoneLabel={zoneLabel}
        qty={t.qty}
      />
    </div>
  );
}
