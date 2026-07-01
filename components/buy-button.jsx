"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/lib/booking-context";

// เริ่ม flow ซื้อ -> เข้าห้องรอคิว (ต้อง login; proxy คุม /queue อยู่แล้ว)
export default function BuyButton({ eventId }) {
  const router = useRouter();
  const { selectEvent } = useBooking();
  return (
    <button
      onClick={() => {
        selectEvent(eventId);
        router.push(`/queue/${eventId}`);
      }}
      className="mb-3 w-full rounded-[10px] bg-accent py-4 text-center text-[17px] font-semibold text-white transition-colors hover:bg-accent-dark"
    >
      กดบัตรเลย
    </button>
  );
}
