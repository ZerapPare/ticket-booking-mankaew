import ETicket from "@/components/e-ticket";

export const metadata = { title: "บัตรอิเล็กทรอนิกส์ — Mankaew" };

export default async function TicketPage({ params }) {
  const { id } = await params;
  return <ETicket orderId={id} />;
}
