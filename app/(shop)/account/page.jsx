import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountView from "@/components/account-view";
import { getMyTickets } from "@/lib/data/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "บัญชีของฉัน — Mankaew" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const tickets = await getMyTickets(session.user.id);
  return <AccountView user={session.user} tickets={tickets} />;
}