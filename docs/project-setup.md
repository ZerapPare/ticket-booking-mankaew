# Mankaew — คู่มือติดตั้ง & ตั้งค่าโปรเจกต์ (Project Setup)

เอกสารนี้บอก "ต้องใส่คีย์อะไร รัน SQL ไฟล์ไหน ตามลำดับไหน" เพื่อให้เว็บ Mankaew
ทำงานได้จริงตั้งแต่ศูนย์ — ทั้งบนเครื่อง (dev) และบน Vercel (production)

> อ่านภาพรวมโปรเจกต์แบบง่ายก่อนได้ที่ [overview-for-team.md](overview-for-team.md)

---

## 1. Stack ที่ใช้

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | **Next.js 16.2.9** (App Router, **JavaScript `.jsx`** ไม่ใช่ TypeScript) |
| UI | **Tailwind CSS v4** (`@theme` tokens ใน `app/globals.css`) |
| Database | **Supabase (PostgreSQL)** + Realtime |
| Auth | **NextAuth / Auth.js v5** (Credentials + Google) — JWT session |
| อื่นๆ | `bcryptjs` (เช็ครหัสผ่าน), `qrcode.react` (QR ตั๋วจริง) |

ธีม: พื้นขาวมินิมอล สีหลักม่วง `#7c3aed` · ฟอนต์ Anuphan (ไทย) + Space Mono (ตัวเลข/โค้ด)

---

## 2. สิ่งที่ต้องเตรียม (Prerequisites)

1. **Node.js** 20+
2. บัญชี **Supabase** (สร้าง project ใหม่ 1 อัน)
3. บัญชี **Google Cloud** (สำหรับ Login ด้วย Google — ทำ OAuth client)
4. (สำหรับ deploy) บัญชี **Vercel**

---

## 3. ตัวแปรสภาพแวดล้อม (.env.local)

คัดลอก [.env.example](../.env.example) เป็น `.env.local` แล้วเติมค่าจริง
(**`.env.local` ถูก gitignore ไว้ — ห้าม commit**)

| ตัวแปร | เอามาจากไหน | หมายเหตุ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ขึ้น client ได้ |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase → Settings → API (publishable/anon) | ขึ้น client ได้ (ใช้ทำ realtime + อ่าน public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role) | ⚠️ **ความลับสูงสุด — ห้ามขึ้น `NEXT_PUBLIC_` เด็ดขาด** ใช้ฝั่ง server เท่านั้น |
| `AUTH_SECRET` | สุ่มเอง: `openssl rand -base64 32` | |
| `AUTH_URL` | dev = `http://localhost:3000` · prod = `https://<app>.vercel.app` | |
| `AUTH_TRUST_HOST` | `true` | จำเป็นตอนอยู่บน Vercel |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud → Credentials → OAuth client (Web) | ถ้าไม่ใส่ ปุ่ม Google จะปิดเอง |
| `ADMIN_EMAILS` | เช่น `admin@example.com` | อีเมลในลิสต์นี้ได้ role admin |
| `ORGANIZER_EMAILS` | เช่น `organizer@example.com` | อีเมลในลิสต์นี้ได้ role organizer |

> **การให้ role ทำผ่านอีเมล** (`lib/roles.js` อ่าน `ADMIN_EMAILS`/`ORGANIZER_EMAILS`)
> อีเมลที่ไม่อยู่ในลิสต์ = **buyer** โดยอัตโนมัติ

**Google OAuth — Authorized redirect URI ต้องเป็น:**
```
<AUTH_URL>/api/auth/callback/google
```
เช่น `http://localhost:3000/api/auth/callback/google` และ `https://<app>.vercel.app/api/auth/callback/google`
(อย่าลืม `/api/` — ตกไปจะเจอ `redirect_uri_mismatch`)

---

## 4. รัน SQL ใส่ Supabase (สำคัญ — ต้องตามลำดับ)

เปิด **Supabase → SQL Editor** แล้ววาง/รันทีละไฟล์จาก `libs/` **เรียงตามเลข**

| ลำดับ | ไฟล์ | ทำอะไร |
|---|---|---|
| 1 | `libs/01_schema.sql` | สร้างตารางหลัก (profiles, events, venues, ticket_types, transactions, tickets ...) |
| 2 | `libs/02_functions.sql` | ฟังก์ชันจอง `book_tickets`, `confirm_payment`, `cancel_transaction` (ฉบับแรก) |
| 3 | `libs/03_rls.sql` | เปิด Row Level Security + policy |
| 4 | `libs/04_seed.sql` | ข้อมูลตั้งต้น (venue/เดโม) |
| 5 | `libs/05_storage.sql` | bucket/สตอเรจ (ถ้ามีใช้รูป) |
| 6 | `libs/06_auth.sql` | คอลัมน์ `password_hash` + ตั้งรหัส 3 บัญชีเดโม + `verify_password` |
| 7 | `libs/07_seats.sql` | ตาราง `seats`, ล็อกที่นั่งรายตัว `hold_seats`, `release_expired_seats`, redefine confirm/cancel ให้จัดการ seat + เปิด Realtime |
| 8 | `libs/08_admin.sql` | สถานะ `pending`, ตาราง `payouts`, `refunds` |
| 9 | `libs/09_seed_demo.sql` | อีเวนต์เดโม **NEON NIGHTS** (โซนยืน VIP + ZONE A–D แบบมีเก้าอี้จริง) + INDIE SUNSET |
| 10 | `libs/10_grants.sql` | GRANT ให้ `anon`/`authenticated` อ่านได้ + **GRANT ALL ให้ `service_role`** |
| 11 | `libs/12_booking.sql` | redefine `book_tickets` ให้โซนยืนมี `hold_expires_at` (หมดเวลา 10 นาทีเหมือนโซนที่นั่ง) |

> ไม่มีไฟล์เลข `11` (ตัดสินใจไม่ทำ grant สำหรับ verify_password ฝั่ง anon — ใช้ service_role แทน)

**เช็คว่าต่อ Supabase ติดจริง:** หลังรันครบ เปิดเว็บหน้าแรก ต้องเห็นอีเวนต์ NEON NIGHTS
โผล่มาจาก DB (ไม่ใช่ mock)

### บัญชีเดโม (หลังรัน 06)

| อีเมล | รหัสผ่าน | Role |
|---|---|---|
| `admin@example.com` | `Mankaew!2026` | admin |
| `organizer@example.com` | `Mankaew!2026` | organizer |
| `buyer@example.com` | `Mankaew!2026` | buyer |

(role มาจาก `ADMIN_EMAILS`/`ORGANIZER_EMAILS` — ต้องตั้งอีเมลให้ตรงใน `.env`)

---

## 5. รันบนเครื่อง (Local)

```bash
npm install
npm run dev
```
เปิด http://localhost:3000

Flow ทดสอบฝั่งคนซื้อ: Login (`buyer@example.com` / `Mankaew!2026`) → เลือกอีเวนต์ NEON
→ กดบัตร → ห้องรอคิว → เลือกที่นั่ง (ZONE A) → ตะกร้า → จ่ายเงิน → ได้ตั๋ว QR → เห็นใน "ตั๋วของฉัน"

**ทดสอบล็อกที่นั่งจริง (2 เบราว์เซอร์):** จอ A เลือกเก้าอี้ค้างไว้ → จอ B ต้องเห็นเก้าอี้นั้นเป็น
"ไม่ว่าง" สดๆ (realtime) และจองซ้ำไม่ได้

---

## 6. Deploy บน Vercel

1. Import repo เข้า Vercel
2. **ใส่ Environment Variables ทั้งหมดจากข้อ 3** (Vercel Dashboard → Settings → Environment Variables)
   — `.env.local` ไม่ถูก push ขึ้น git จึงต้องตั้งบน Vercel เอง มิฉะนั้นเจอ
   *"There is a problem with the server configuration"*
   - `AUTH_URL` = `https://<app>.vercel.app`
   - `AUTH_TRUST_HOST` = `true`
3. เพิ่ม production redirect URI ใน Google Cloud:
   `https://<app>.vercel.app/api/auth/callback/google`
4. Redeploy

**เช็ก:** เปิด `https://<app>.vercel.app/api/auth/providers` ต้องเห็น `credentials` + `google`

---

## 7. สถาปัตยกรรม (ตอนนี้อะไรจริง / อะไรจำลอง)

### Auth & สิทธิ์ (RBAC) — 2 ชั้น
- `proxy.js` (Next.js middleware) redirect เบื้องต้นตาม path (`/admin`, `/organizer`, `/account`, `/queue`, `/cart`, `/payment`)
- ตรวจซ้ำฝั่ง server ด้วย `auth()` ใน layout/page (`app/admin/layout.jsx`, `app/organizer/layout.jsx` ฯลฯ)
- แยก config: `auth.config.js` (edge-safe ใช้กับ proxy) + `auth.js` (ตัวเต็ม มี providers)

### Client 2 แบบ (ต่อ Supabase)
- `lib/supabase/server.js` — **service_role** (bypass RLS, ฝั่ง server, มี `import "server-only"`)
- `lib/supabase/public.js` — **anon** (ขึ้น client ได้, ใช้ realtime + อ่าน public)

### การจอง (ของจริง)
- **โซนที่นั่ง (seated):** เลือกเก้าอี้รายตัว → `holdSeats(seatIds)` → RPC `hold_seats` (ล็อก `FOR UPDATE` กันแย่ง) → pending txn + `hold_expires_at` 10 นาที
- **โซนยืน (ga):** เลือกจำนวน → `bookGa(ticketTypeId, qty)` → RPC `book_tickets`
- จ่ายเงิน → `confirmPayment` · ยกเลิก/หมดเวลา → `cancelHold` / `release_expired_seats`
- Server Actions อยู่ที่ `lib/actions/booking.js` · DAL อยู่ที่ `lib/data/{events,seats,transactions}.js`
- ผังที่นั่ง realtime: `components/seat-map.jsx` subscribe ตาราง `seats` ผ่าน anon client

### ⚠️ ส่วนที่ยัง "จำลอง" (mock/hardcoded) — ยังไม่ผูก DB
- **ห้องรอคิว** (`components/queue-room.jsx`): ตำแหน่งคิวนับถอยหลังฝั่ง client ล้วน (`QUEUE_TOTAL=1247`) ยังไม่มีคิว backend จริง
- **ค่าธรรมเนียม** `FEE_PER_SEAT=60` ใน `lib/booking-context.jsx` — ไม่ตรงกับยอดจริงใน DB และไม่แสดง breakdown ในตะกร้า
- **รายชื่อศิลปิน (LINEUP)** ในหน้า event detail — hardcode เหมือนกันทุกอีเวนต์
- **ตั๋ว (e-ticket):** `Gate 3` / `17:00 น.` — hardcode ยังไม่ดึงจากอีเวนต์
- **จ่ายเงิน:** เป็น UI จำลอง (ไม่มี payment gateway จริง) แต่เปลี่ยนสถานะ DB จริง
- `lib/mock-data.js` ส่วนใหญ่เป็น zombie (ไม่ถูกใช้แล้ว) — เหลือ `EVENT_FILTERS` + ค่าคงที่ไม่กี่ตัวที่ยังใช้

---

## 8. แผนที่ไฟล์สำคัญ

```
app/
  (shop)/          หน้าฝั่งคนซื้อ (home, events, events/[id], cart, payment, account)
  events/[id]/seats/  หน้าเลือกที่นั่ง (มี auth guard)
  queue/[id]/      ห้องรอคิว
  tickets/[id]/    e-ticket
  organizer/ admin/  แดชบอร์ด (มี layout guard ด้วย auth())
  api/auth/[...nextauth]/  NextAuth handler
auth.js  auth.config.js  proxy.js   ระบบล็อกอิน + RBAC
lib/
  supabase/{server,public}.js   client 2 แบบ
  data/{events,seats,transactions}.js   อ่านข้อมูล (DAL)
  actions/booking.js            server actions จอง/จ่าย/ยกเลิก
  roles.js                      แมปอีเมล → role
components/       ชิ้นส่วน UI (seat-map, seat-selection, hold-countdown, e-ticket, ...)
libs/*.sql        ไฟล์ migration ฐานข้อมูล (รันตามลำดับ ข้อ 4)
```

---

## 9. กับดักที่เคยเจอ (Troubleshooting)

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `42501 permission denied` (anon อ่านไม่ได้) | ยังไม่ได้รัน `10_grants.sql` |
| `42501` แต่เป็นฝั่ง service_role | โปรเจกต์ Supabase นี้ไม่ auto-grant service_role → ต้องรันบล็อก GRANT ใน `10_grants.sql` |
| `42883 gen_random_bytes does not exist` | pgcrypto อยู่ schema `extensions` — โค้ดเลี่ยงไปใช้ `gen_random_uuid()` แล้ว (07/12) |
| `22P02 invalid input syntax for type uuid: 'undefined'` ตอนเข้า /account | session เก่าไม่มี `user.id` (สร้างตอน service_role ยังพัง) → **logout แล้ว login ใหม่** |
| Vercel *"problem with server configuration"* | ยังไม่ได้ตั้ง env vars บน Vercel |
| Google `redirect_uri_mismatch` | redirect URI ต้องมี `/api/` เต็ม: `.../api/auth/callback/google` |
```
