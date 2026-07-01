import ETicket from "@/components/e-ticket";

export const metadata = { title: "บัตรอิเล็กทรอนิกส์ — Mankaew" };

export default async function TicketPage({ params }) {
  const { id } = await params;
<<<<<<< HEAD
<<<<<<< HEAD
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/tickets/${id}`);

  const t = await getTransaction(id, session.user.id);
  if (!t) redirect("/account");
  if (t.status !== "paid") redirect(`/cart?txn=${id}`);

  return <ETicket event={t.event} tickets={t.tickets} />;
=======
  return <ETicket orderId={id} />;
>>>>>>> parent of 18b3827 (ระบบที่นั่ง)
=======
  return <ETicket orderId={id} />;
>>>>>>> parent of 18b3827 (ระบบที่นั่ง)
}
