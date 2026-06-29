"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { HOLD_SECONDS, MAX_SEATS, getZone, FEE_PER_SEAT } from "@/lib/mock-data";

/*
  Booking flow state shared across the buyer routes:
  detail → queue → seats → cart → payment → ticket.

  This is TRANSIENT checkout/UI state only (which zone/seats the user is picking
  right now), kept in sessionStorage so it survives navigation between routes.
  It is NOT the database — all real data (events, tickets, transactions) lives in
  Supabase/SQL (see libs/01_schema.sql). In production the seat hold + countdown
  timer MUST be owned by the backend so two buyers can't grab the same seat.
*/

const STORAGE_KEY = "mankaew:booking";

const EMPTY = {
  eventId: null,
  zoneId: null,
  seats: [], // e.g. ["A-5","A-6"]
  holdExpiresAt: null, // epoch ms
  payMethod: "card",
  orderId: null,
};

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // load once on mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const actions = useMemo(() => {
    const patch = (p) => setState((s) => ({ ...s, ...p }));
    return {
      selectEvent: (eventId) =>
        // เริ่ม flow ใหม่ทุกครั้ง = ล้างเวลาถือบัตรเดิม เพื่อให้เริ่มนับ 10:00 ใหม่
        // (หน้า seats/cart/payment ไม่เรียก selectEvent จึงนับต่อเนื่องในออเดอร์เดียวกัน)
        patch({ eventId, zoneId: null, seats: [], orderId: null, holdExpiresAt: null }),
      selectZone: (zoneId) => patch({ zoneId, seats: [] }),
      toggleSeat: (id) =>
        setState((s) => {
          if (s.seats.includes(id))
            return { ...s, seats: s.seats.filter((x) => x !== id) };
          if (s.seats.length >= MAX_SEATS) return s;
          return { ...s, seats: [...s.seats, id] };
        }),
      startHold: () =>
        setState((s) => ({
          ...s,
          holdExpiresAt: s.holdExpiresAt ?? Date.now() + HOLD_SECONDS * 1000,
        })),
      restartHold: () =>
        patch({ holdExpiresAt: Date.now() + HOLD_SECONDS * 1000 }),
      clearHold: () => patch({ holdExpiresAt: null }),
      setPayMethod: (payMethod) => patch({ payMethod }),
      // load a previously purchased ticket (from the account page) into view
      loadTicket: ({ eventId, zoneId, seats = [], orderId = null }) =>
        patch({ eventId, zoneId, seats, orderId, holdExpiresAt: null }),
      completeOrder: () => {
        const orderId = String(Math.floor(1000 + Math.random() * 9000));
        patch({ orderId, holdExpiresAt: null });
        return orderId;
      },
      reset: () => setState(EMPTY),
    };
  }, []);

  const derived = useMemo(() => {
    const zone = getZone(state.zoneId);
    const qty = state.seats.length;
    const price = zone ? zone.price : 0;
    const subtotal = price * qty;
    const fee = FEE_PER_SEAT * qty;
    return { zone, qty, price, subtotal, fee, total: subtotal + fee };
  }, [state.zoneId, state.seats]);

  const value = useMemo(
    () => ({ ...state, ...actions, ...derived, hydrated }),
    [state, actions, derived, hydrated]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}
