# Project Brief: Event Ticket Booking & Management

สเปคสำหรับส่งให้ Claude Code พัฒนาเว็บแอปพลิเคชันระบบจองตั๋วคอนเสิร์ต/อีเวนต์

---

## 1. Tech Stack (บังคับ — ขาดข้อใดข้อหนึ่งจะไม่ได้คะแนนในระบบนั้น)

- **Framework:** Next.js (App Router) + TypeScript
- **Auth:** NextAuth.js (Auth.js) — ใช้ Credentials (Email/Password) และ/หรือ OAuth (Google/GitHub)
- **Database:** Supabase (PostgreSQL) บนคลาวด์
- **Deployment:** GitHub → Vercel ต้องใช้งานได้จริงผ่าน Production URL
- **Repo:** Public หรือ Private ที่แชร์สิทธิ์ให้ผู้สอน

---

## 2. Roles (RBAC)

แบ่งสิทธิ์ผู้ใช้ 3 บทบาท พร้อมป้องกันด้วย Middleware/Route Protection และเช็คสิทธิ์ทั้งระดับหน้าเว็บ ปุ่ม และ API:

| Role | สิทธิ์หลัก |
|---|---|
| **Admin** | ควบคุมดูแลแพลตฟอร์มทั้งหมด จัดการผู้ใช้และอีเวนต์ทุกอัน |
| **Event Organizer** | สร้าง/แก้ไขอีเวนต์ของตัวเอง, เช็คตั๋วหน้างาน (scan/verify) |
| **Ticket Buyer** | ค้นหาอีเวนต์ ซื้อตั๋ว ดูประวัติการซื้อ |

**บังคับ:** Middleware ป้องกัน route ตามบทบาท + ตรวจสิทธิ์ซ้ำในฝั่ง API (ไม่เชื่อ client อย่างเดียว)

---

## 3. Database Schema (ตารางที่สร้างเอง ≥ 5 ตาราง ไม่นับตารางระบบของ NextAuth)

| ตาราง | หน้าที่ | ความสัมพันธ์ |
|---|---|---|
| `venues` | สถานที่จัดงาน + ความจุที่นั่ง | 1 venue → many events |
| `events` | ข้อมูลคอนเสิร์ต/กิจกรรม | belongs to venue, organizer (user) |
| `ticket_types` | ประเภทตั๋ว (VIP, Regular) + ราคา | 1 event → many ticket_types |
| `tickets` | ตั๋วแต่ละใบ + Serial Number | belongs to ticket_type, transaction, buyer |
| `transactions` | ประวัติการซื้อ + สถานะชำระเงิน | 1 transaction → many tickets, belongs to buyer |

**Relational Integrity ที่ต้องมี:**
- One-to-Many: venue→events, event→ticket_types, event→tickets, transaction→tickets
- ระบบรัน Serial Number ให้ตั๋วแต่ละใบ (unique)
- จำกัดจำนวนตั๋วไม่ให้เกินความจุ/โควต้าของ ticket_type (Seat Allocation — กันจองเกิน/ขายซ้ำ)

> หากต้องการ Many-to-Many เพิ่ม เช่น ตาราง `event_categories` (event ↔ category) เพื่อความสมบูรณ์ของคะแนน

---

## 4. Core Flows ที่ต้องทำงานได้

1. Organizer สร้างอีเวนต์ → กำหนด venue, ticket_types, จำนวนตั๋ว
2. Buyer เลือกอีเวนต์ → เลือกประเภทตั๋ว/จำนวน → สร้าง transaction (pending)
3. ยืนยันชำระเงิน → ออก tickets พร้อม Serial Number → transaction = paid
4. ระบบกันจองเกินจำนวน (atomic / transaction-safe) เมื่อมีคนซื้อพร้อมกัน
5. Organizer เช็คตั๋วหน้างาน (verify by serial/QR) → mark ว่าใช้แล้ว
6. Admin ดูแลภาพรวมทั้งหมด

---

## 5. Nice-to-Have (คะแนนโบนัส/ความสมบูรณ์)

- **Realtime:** Supabase Realtime — เช่น live update จำนวนตั๋วคงเหลือ หรือ notification
- **UI/UX:** Loading state (Skeleton), Error Boundary, รองรับ Dark/Light Mode
- **Storage:** Supabase Storage อัปโหลดรูปจริง (โปสเตอร์อีเวนต์, รูปโปรไฟล์, หลักฐานการโอนเงิน)

---

## 6. คำสั่งเริ่มต้นสำหรับ Claude Code

> สร้างเว็บแอป Event Ticket Booking ตามสเปคด้านบน เริ่มจาก: ตั้งโปรเจกต์ Next.js (App Router, TypeScript) + Tailwind, ต่อ Supabase, วางโครง schema 5 ตาราง (พร้อม migration/SQL), ตั้ง NextAuth ด้วย Credentials + Google OAuth, ทำ RBAC middleware 3 roles แล้วค่อยไล่ทำ flow ทีละส่วน. ขอ .env.example และ README วิธี deploy ขึ้น Vercel ด้วย
