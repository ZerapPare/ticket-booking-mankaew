# Mankaew — Project Setup

ระบบจองบัตรคอนเสิร์ต/เทศกาล (ticket booking & management) พร้อมระบบจัดคิว, ที่นั่งรายตัว,
บัตรอิเล็กทรอนิกส์ (e-ticket) และแดชบอร์ดสำหรับ buyer / organizer / admin

## Tech Stack

| ส่วน | เทคโนโลยี |
| --- | --- |
| Framework | Next.js **16.2.9** (App Router) — ดู `AGENTS.md` มีการเปลี่ยนแปลง breaking |
| UI | React 19.2.4, Tailwind CSS v4 (`@tailwindcss/postcss`) |
| ภาษา | JavaScript/JSX เป็นหลัก (TypeScript config พร้อมใช้, `allowJs`) |
| Database | Supabase (PostgreSQL 15+) |
| Auth | NextAuth / Auth.js **v5 (beta)** — Credentials + Google OAuth |
| Password hash | bcryptjs (`$2a$`) เทียบได้กับ pgcrypto ฝั่ง DB |
| Validation | zod v4 |
| อื่นๆ | qrcode.react (e-ticket QR), server-only |

## Prerequisites

- Node.js 20+
- โปรเจกต์ Supabase (URL + anon key + service role key)
- Google OAuth client (Web) — ออปชัน; ถ้าไม่ตั้ง provider Google จะถูกข้ามอัตโนมัติ

## การติดตั้ง

```bash
npm install
cp .env.example .env.local   # แล้วเติมค่าจริง
npm run dev                  # http://localhost:3000
```

Scripts (`package.json`):

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — รัน production
- `npm run lint` — ESLint (`eslint-config-next`)

## Environment Variables (`.env.local`)

คัดลอกจาก `.env.example` — **อย่า commit `.env.local`**

| ตัวแปร | ใช้ทำอะไร |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_KEY` | anon / publishable key (ขึ้น client ได้, ถูกจำกัดด้วย RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ service role key — ฝั่ง server เท่านั้น, bypass RLS, ห้ามขึ้น `NEXT_PUBLIC_` |
| `AUTH_SECRET` | ความลับ NextAuth (`openssl rand -base64 32`) |
| `AUTH_URL` | โดเมนแอป (dev = `http://localhost:3000`) |
| `AUTH_TRUST_HOST` | `true` เมื่อ deploy หลัง proxy (Vercel) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client (Web); redirect URI = `<AUTH_URL>/api/auth/callback/google` |
| `ADMIN_EMAILS` | อีเมล (คั่นด้วย `,`) ที่แมปเป็น role `admin` สำหรับผู้ใช้ใหม่ |
| `ORGANIZER_EMAILS` | อีเมลที่แมปเป็น role `organizer` สำหรับผู้ใช้ใหม่ |

## Database Setup

รันไฟล์ SQL ใน `libs/` ตามลำดับเลข ผ่าน Supabase SQL Editor:

| ไฟล์ | เนื้อหา |
| --- | --- |
| `01_schema.sql` | Schema ตารางหลัก (profiles, venues, events, ticket_types, transactions, tickets, notifications) |
| `02_functions.sql` | Functions/RPC — หัวใจคือ `book_tickets()` จองแบบ atomic กันขายเกิน |
| `03_rls.sql` | Row Level Security — เปิดทุกตาราง, anon อ่านได้เฉพาะข้อมูลสาธารณะ |
| `04_seed.sql` | Seed ตัวอย่างสำหรับทดสอบ |
| `05_storage.sql` | Storage bucket (โปสเตอร์/สลิป/โปรไฟล์) |
| `06_auth.sql` | เพิ่มคอลัมน์ `password_hash` + ตั้งรหัสบัญชี seed |
| `07_seats.sql` | ที่นั่งรายตัว + ล็อกกันแย่งซ้ำ |
| `08_admin.sql` | ตารางฝั่ง admin (สถานะ `pending` รออนุมัติ ฯลฯ) |
| `09_seed_demo.sql` | ข้อมูล demo (อีเวนต์ NEON NIGHTS + โซน + `generate_seats`) |
| `10_grants.sql` | GRANT สิทธิ์อ่านระดับตารางแก่ role สาธารณะ |

### บัญชี seed (รหัสผ่านเดียวกัน: `Mankaew!2026`)

- `admin@example.com` → admin
- `organizer@example.com` → organizer
- `buyer@example.com` → buyer

## สถาปัตยกรรม Auth & RBAC

แอปยืนยันตัวตนด้วย **NextAuth (ไม่ใช่ Supabase Auth)** โมเดล 3 role: `buyer` / `organizer` / `admin`

- `auth.config.js` — ค่าตั้ง **edge-safe** (ไม่มี Node/Supabase/bcrypt) ใช้ใน `proxy.js`; มี callback `authorized` (RBAC) และ `session`
- `auth.js` — instance จริง (รันฝั่ง Node): provider Credentials (bcrypt เทียบกับ `profiles`) + Google (sync profile ลง DB ใน `jwt` callback); role มาจาก `profiles.role` เป็นหลัก, ผู้ใช้ใหม่ใช้ `roleForEmail()`
- `proxy.js` — Next.js 16 middleware ("proxy") ทำ RBAC redirect แบบ optimistic; ความปลอดภัยจริงเช็คซ้ำใน layout/page ฝั่ง server ด้วย `auth()`
- `lib/roles.js` — แมปอีเมล → role จาก `ADMIN_EMAILS` / `ORGANIZER_EMAILS`
- `app/api/auth/[...nextauth]/route.js` — export `handlers` (GET/POST)

Route ที่ต้องล็อกอิน (matcher ใน `proxy.js`): `/admin/*`, `/organizer/*`, `/account`, `/queue/*`, `/cart`, `/payment`

## Supabase Clients

- `lib/supabase/server.js` — `supabaseServer()` ใช้ **service role key** (bypass RLS), มี `server-only` กัน import จาก client
- `lib/supabase/public.js` — `supabasePublic()` ใช้ **anon key**, อ่านได้เฉพาะข้อมูลสาธารณะตาม RLS (เหมาะกับ browse + realtime)

## โครงสร้างโปรเจกต์ (App Router)

```
app/
  layout.jsx               root layout (ฟอนต์ Anuphan/Space Mono, BookingProvider)
  home/                    หน้าแรก (landing)
  (shop)/                  ฝั่งผู้ซื้อ: events, cart, payment, account
  organizer/               แดชบอร์ด organizer (create, checkin, attendees, events, report)
  admin/                   แดชบอร์ด admin (users, approvals, finance, refunds)
  login/                   หน้าเข้าสู่ระบบ
  queue/[id]/              ห้องจัดคิว
  tickets/[id]/            e-ticket
  api/auth/[...nextauth]/  NextAuth route handler
components/                UI (dashboard/, admin/, organizer/, seat-selection, e-ticket, ฯลฯ)
lib/
  actions/                 server actions (booking.js, organizer.js)
  data/                    data-access ฝั่ง server (events.js, organizer.js, tickets.js)
  supabase/                server.js (service role) + public.js (anon)
  roles.js                 แมปอีเมล → role
  booking-context.jsx      React context ฝั่ง client สำหรับ flow การจอง
  constants.js / format.js / use-countdown.js / mock-data.js / admin-mock.js
libs/                      สคริปต์ SQL ตั้งค่า DB (รันตามลำดับเลข)
auth.js / auth.config.js   ตั้งค่า NextAuth
proxy.js                   middleware RBAC
```

## หมายเหตุ

- **Next.js 16 มี breaking changes** — ดู `AGENTS.md`; อ่าน guide ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด
- Path alias: `@/*` → root (ตั้งใน `tsconfig.json`)
