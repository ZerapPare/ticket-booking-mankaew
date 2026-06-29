# Mankaew — สรุปงาน UI ฝั่ง Ticket Buyer

> สถานะ: ✅ เสร็จครบ 10 หน้า — `npm run build` ผ่าน (19 routes), ทุกหน้า HTTP 200, ไม่มี error/warning
> ภาษา: **JavaScript (`.jsx`)** — ไม่ใช่ TypeScript
> ที่มาดีไซน์: recreate จาก `dist/docs/PULSE Ticketing.dc.html` (อ้างอิงเท่านั้น ไม่ก็อปโค้ดตรง)

---

## 1. ภาพรวม

สร้างหน้า UI ฝั่ง **Ticket Buyer** ของแพลตฟอร์มจองบัตรคอนเสิร์ต Mankaew บน
**Next.js 16.2.9 (App Router) + Tailwind CSS v4** โดยทำเป็น **route แยกจริง**
(ตามที่ README handoff แนะนำ ไม่ใช่ single-page state-switching แบบในดีไซน์อ้างอิง)

ธีม: ขาวมินิมอล accent ม่วง `#7c3aed`, ฟอนต์ Anuphan (เนื้อหา) + Space Mono (label/รหัส)

---

## 2. หน้าที่สร้าง (10 หน้า)

| # | หน้า | Route | ไฟล์หลัก |
|---|------|-------|---------|
| 1 | Home — hero + อีเวนต์ที่กำลังจะมา + footer | `/` | `app/(shop)/page.jsx` |
| 2 | Event List — filter chips (กรองได้จริง) + กริดการ์ด | `/events` | `app/(shop)/events/page.jsx`, `components/event-list.jsx` |
| 3 | Event Detail — banner + ไลน์อัพ + ตารางราคาโซน + sticky CTA | `/events/[id]` | `app/(shop)/events/[id]/page.jsx` |
| 4 | Queue / ห้องรอคิว (เต็มจอ) — คิวเดินอัตโนมัติ + progress | `/queue/[id]` | `components/queue-room.jsx` |
| 5 | Seat Selection — เลือกโซน + ผังเก้าอี้รายตัว + สรุป | `/events/[id]/seats` | `components/seat-selection.jsx` |
| 6 | Cart — countdown ถือบัตร + สรุปคำสั่งซื้อ | `/cart` | `app/(shop)/cart/page.jsx` |
| 7 | Payment — เลือกวิธีจ่าย + บัตร/PromptPay QR + สรุปยอด | `/payment` | `app/(shop)/payment/page.jsx` |
| 8 | E-Ticket (เต็มจอ) — การ์ดตั๋ว + QR จริง | `/tickets/[id]` | `components/e-ticket.jsx` |
| 9 | Account / ตั๋วของฉัน — โปรไฟล์ + แท็บ + รายการตั๋ว | `/account` | `app/(shop)/account/page.jsx` |
| 10 | Login / Register — สลับโหมดได้ | `/login` | `app/login/page.jsx` |

**Route groups**
- `(shop)` = หน้าที่มี header ร่วม (sticky): home, events, detail, seats, cart, payment, account
- เต็มจอไม่มี header: queue, tickets, login

---

## 3. โครงสร้างไฟล์

```
app/
  layout.jsx                      # root: ฟอนต์ + BookingProvider
  globals.css                     # design tokens (Tailwind v4 @theme)
  (shop)/
    layout.jsx                    # SiteHeader ร่วม
    page.jsx                      # Home
    events/page.jsx               # Event List
    events/[id]/page.jsx          # Event Detail
    events/[id]/seats/page.jsx    # Seat Selection
    cart/page.jsx                 # Cart
    payment/page.jsx              # Payment
    account/page.jsx              # Account
  queue/[id]/page.jsx             # Queue (เต็มจอ)
  tickets/[id]/page.jsx           # E-Ticket (เต็มจอ)
  login/page.jsx                  # Login/Register (เต็มจอ)

components/
  site-header.jsx                 # header + Logo
  site-footer.jsx
  key-visual.jsx                  # placeholder รูปโปสเตอร์ (gradient)
  event-list.jsx                  # กริด + filter (client)
  buy-button.jsx                  # "กดบัตรเลย" → queue
  queue-room.jsx
  seat-selection.jsx
  e-ticket.jsx
  checkout-stepper.jsx            # stepper 1→2→3→4

lib/
  booking-context.jsx            # checkout state (sessionStorage)
  mock-data.js                   # events, zones, lineup, seat helpers
  format.js                      # ฿ / mm:ss / seat label
  use-countdown.js               # hook นับถอยหลัง
```

---

## 4. การจัดการ State (checkout flow)

`lib/booking-context.jsx` (React Context + `sessionStorage`) เก็บ state ชั่วคราว
ของ flow จอง ส่งต่อข้ามหน้า: **detail → queue → seats → cart → payment → ticket**

เก็บ: `eventId`, `zoneId`, `seats[]`, `holdExpiresAt`, `payMethod`, `orderId`
คำนวณ derived: `qty`, `subtotal`, `fee` (฿60/ใบ), `total`

> ⚠️ เป็น **transient checkout state เท่านั้น** ไม่ใช่ฐานข้อมูล
> ข้อมูลจริงทั้งหมด (events, tickets, transactions) อยู่ใน Supabase/SQL — ดู `libs/01_schema.sql`

---

## 5. ทำตามหมายเหตุ production 3 ข้อ

| ข้อกำหนด | สถานะ |
|---|---|
| `.dc.html` เป็นดีไซน์อ้างอิง ไม่ก็อปตรง | ✅ recreate ใหม่เป็น Next.js + Tailwind |
| รูปทุกใบเป็น placeholder ต้องต่อภาพจริง + QR generator จริง | ✅ รูป = placeholder (มี comment ชี้ Supabase Storage); **QR ของจริง** ด้วย `qrcode.react` (Payment + E-Ticket) |
| timer/คิว/ล็อกที่นั่ง production ต้องผูก backend | ✅ client simulation + comment เตือนทุกไฟล์ว่าต้องใช้ server time/WebSocket + seat lock กันแย่งที่นั่ง |

---

## 6. Dependencies ที่เพิ่ม

- `qrcode.react` — สร้าง QR จริงสำหรับ PromptPay QR และรหัสบัตร E-Ticket (`MKW-2026-xxxx`)

---

## 7. การ Verify

- `npm run build` → ✅ ผ่าน, prerender 19 routes
- dev server → ทุกหน้า HTTP 200, ไม่มี error/warning/hydration mismatch

วิธีรัน: `npm run dev` → http://localhost:3000

---

## 8. งานที่ยังเหลือ (รอดำเนินการต่อ)

- [ ] ฝั่ง **Event Organizer** — `dist/docs/PULSE Organizer.dc.html` (dashboard, สร้างอีเวนต์ wizard, รายงานยอดขาย, เช็คอินหน้างาน, ผู้เข้างาน)
- [ ] ฝั่ง **Admin** — `dist/docs/PULSE Admin.dc.html` (ภาพรวม, จัดการผู้ใช้, อนุมัติอีเวนต์, payout, คืนเงิน)
- [ ] ต่อ **backend จริง** — Supabase client + NextAuth (Credentials + Google) + RBAC middleware, เปลี่ยน mock data เป็นข้อมูลจริงจาก SQL
- [ ] แทน placeholder รูปด้วยภาพจริงจาก Supabase Storage
