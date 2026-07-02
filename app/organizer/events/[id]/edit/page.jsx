import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/primitives";
import EditEventForm from "@/components/organizer/edit-event-form";
import { getOrganizerEventForEdit } from "@/lib/data/organizer";

export const dynamic = "force-dynamic";
export const metadata = { title: "แก้ไขอีเวนต์ — Organizer | Mankaew" };

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const session = await auth();
  const scope = session?.user?.role === "admin" ? null : session?.user?.id;
  const event = await getOrganizerEventForEdit(id, scope);
  if (!event) notFound();

  return (
    <div>
      <DashboardHeader
        title="แก้ไขรายละเอียดอีเวนต์"
        subtitle={event.title}
        action={
          <Link
            href={`/organizer/report/${id}`}
            className="rounded-[9px] border border-line-2 px-[18px] py-[10px] text-[14px] text-muted transition-colors hover:bg-surface"
          >
            ← กลับหน้ารายงาน
          </Link>
        }
      />
      <EditEventForm event={event} />
    </div>
  );
}