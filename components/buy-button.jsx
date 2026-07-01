"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/lib/booking-context";

// Starts the buy flow for an event: records the event in the checkout state,
// then sends the user into the queue / waiting room.
export default function BuyButton({ eventId }) {
  const router = useRouter();
  const { startFlow } = useBooking();

  return (
    <button
      onClick={() => {
        startFlow(eventId);
        router.push(`/queue/${eventId}`);
      }}
      className="mb-3 w-full rounded-[10px] bg-accent py-4 text-center text-[17px] font-semibold text-white transition-colors hover:bg-accent-dark"
    >
      กดบัตรเลย
    </button>
  );
}
