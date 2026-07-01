"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FEE_PER_SEAT, MAX_SEATS, HOLD_MS } from "@/lib/constants";

/*
  Booking flow state shared across the buyer routes:
  detail → queue → seats → cart → payment → ticket.

  This is TRANSIENT checkout/UI state only (which zone/seats the user is picking
  right now + a snapshot of the event/zone for display), kept in sessionStorage so
  it survives navigation between routes. It is NOT the database.

  The authoritative work is done on the server:
  - the seat hold + 10-min timer are created by hold_seats()/book_tickets()
    (see lib/actions/booking.js) — `txnId` + `holdExpiresAt` come from the DB.
  - issued tickets are read from Supabase on the e-ticket / account pages.
*/

const STORAGE_KEY = "mankaew:booking";

const EMPTY = {
  event: null, // { id, title, date, venue, grad }
  zone: null, // { id, name, price, seatingType, color }
  seats: [], // display labels for seated zones, e.g. ["A-5","A-6"]
  seatIds: [], // seat UUIDs (what hold_seats needs), aligned with `seats`
  gaQty: 1, // quantity for standing (ga) zones
  txnId: null, // real transaction id once the hold is created
  holdExpiresAt: null, // epoch ms, from the DB hold
  payMethod: "card",
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
      // เริ่ม flow ใหม่จากหน้า detail (ปุ่มกดบัตร) — เก็บแค่ id ไว้ก่อน
      startFlow: (eventId) =>
        patch({
          event: { id: eventId },
          zone: null,
          seats: [],
          seatIds: [],
          gaQty: 1,
          txnId: null,
          holdExpiresAt: null,
        }),
      // หน้า seats เติมข้อมูลอีเวนต์เต็ม; ถ้าเป็นคนละอีเวนต์ = ล้าง flow เดิม
      setEvent: (snap) =>
        setState((s) =>
          s.event?.id === snap.id
            ? { ...s, event: snap }
            : { ...EMPTY, event: snap, payMethod: s.payMethod }
        ),
      selectZone: (zone) =>
        patch({ zone, seats: [], seatIds: [], gaQty: 1 }),
      toggleSeat: ({ id, label }) =>
        setState((s) => {
          const i = s.seatIds.indexOf(id);
          if (i !== -1)
            return {
              ...s,
              seatIds: s.seatIds.filter((x) => x !== id),
              seats: s.seats.filter((_, j) => j !== i),
            };
          if (s.seatIds.length >= MAX_SEATS) return s;
          return { ...s, seatIds: [...s.seatIds, id], seats: [...s.seats, label] };
        }),
      setGaQty: (n) =>
        patch({ gaQty: Math.max(1, Math.min(MAX_SEATS, Math.floor(n) || 1)) }),
      // เริ่มนับถอยหลัง checkout ที่ "ถึงคิวคุณแล้ว" — ตั้งครั้งเดียว ไม่รีเซ็ตซ้ำ
      // (นับต่อเนื่อง queue → seats → cart → payment)
      startCheckoutTimer: () =>
        setState((s) =>
          s.holdExpiresAt ? s : { ...s, holdExpiresAt: Date.now() + HOLD_MS }
        ),
      // เมื่อ RPC สร้าง hold สำเร็จ -> เก็บแค่ txn จริง (ไม่แตะ timer ของคิว)
      beginHold: (txnId) => patch({ txnId }),
      // ปล่อย hold (หมดเวลา/ยกเลิก) — ล้างทั้ง txn และเวลา เพื่อไม่ให้ใช้ txn เดิมซ้ำ
      clearHold: () => patch({ txnId: null, holdExpiresAt: null }),
      setPayMethod: (payMethod) => patch({ payMethod }),
      reset: () => setState(EMPTY),
    };
  }, []);

  const derived = useMemo(() => {
    const isGa = state.zone?.seatingType === "ga";
    const qty = isGa ? state.gaQty : state.seatIds.length;
    const price = state.zone ? state.zone.price : 0;
    const subtotal = price * qty;
    const fee = FEE_PER_SEAT * qty;
    return {
      isGa,
      qty,
      price,
      subtotal,
      fee,
      total: subtotal + fee,
      eventId: state.event?.id ?? null,
    };
  }, [state.zone, state.seatIds, state.gaQty, state.event]);

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