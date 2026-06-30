import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ETicket from "@/components/e-ticket";
import { getTransaction } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";
export const metadata = { title: "บัตรอิเล็กทรอนิกส์ — Mankaew" };

export default async function TicketPage({ params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/tickets/${id}`);

  const t = await getTransaction(id, session.user.id);
  if (!t) redirect("/account");
  if (t.status !== "paid") redirect(`/cart?txn=${id}`);

  return <ETicket event={t.event} tickets={t.tickets} />;
}
