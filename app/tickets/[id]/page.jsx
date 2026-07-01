import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import ETicket from "@/components/e-ticket";
import { getOrder } from "@/lib/data/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "บัตรอิเล็กทรอนิกส์ — Mankaew" };

export default async function TicketPage({ params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/tickets/${id}`);

  const order = await getOrder(id, session.user.id);
  if (!order) notFound();

  return <ETicket order={order} />;
}