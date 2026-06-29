# Handoff: Mankaew — แพลตฟอร์มจองบัตรคอนเสิร์ต (Concert Ticketing Platform)

## Overview
Mankaew เป็นแพลตฟอร์มกดบัตรคอนเสิร์ต/เทศกาล สำหรับตลาดไทย รองรับ 3 บทบาท (roles):
- **Ticket Buyer** — ค้นหา/เลือกอีเวนต์ → ห้องรอคิว → เลือกที่นั่งรายตัว → ชำระเงิน → E-Ticket
- **Event Organizer** — แดชบอร์ด, สร้างอีเวนต์, รายงานยอดขาย, เช็คอินหน้างาน, รายชื่อผู้เข้างาน
- **Admin** — ภาพรวมแพลตฟอร์ม, จัดการผู้ใช้, อนุมัติอีเวนต์, การเงิน/payout, คำขอคืนเงิน

UI เป็นภาษาไทยผสมอังกฤษ ธีมขาวมินิมอล accent สีม่วง

## About the Design Files
ไฟล์ในแพ็กเกจนี้เป็น **ดีไซน์อ้างอิงที่สร้างด้วย HTML** — เป็น prototype ที่แสดงหน้าตาและพฤติกรรมที่ต้องการ **ไม่ใช่โค้ดโปรดักชันที่ก็อปไปใช้ตรงๆ**

ไฟล์เขียนด้วยรูปแบบภายในชื่อ "Design Components" (`.dc.html`): มาร์กอัปอยู่ในส่วนเทมเพลต และ logic อยู่ใน `class Component extends DCLogic` — `{{ ... }}` คือ data binding, `<sc-if>`/`<sc-for>` คือ control flow ใช้อ่านเป็น reference เพื่อเข้าใจโครงสร้าง/พฤติกรรมเท่านั้น

**งานคือการสร้างดีไซน์เหล่านี้ขึ้นใหม่ในโค้ดเบสเป้าหมาย** โดยใช้ framework/แพตเทิร์น/ไลบรารีที่โปรเจกต์นั้นใช้อยู่ (เช่น React + Next.js, Vue, ฯลฯ) ถ้ายังไม่มีโค้ดเบส แนะนำ React + TypeScript + Tailwind CSS เพราะ map กับ token ด้านล่างได้ตรง

## Fidelity
**High-fidelity (hifi)** — สี ตัวอักษร ระยะห่าง และ interaction เป็นค่าสุดท้ายที่ต้องการ ให้ recreate UI ให้ตรงพิกเซลด้วยไลบรารีของโค้ดเบส รูปภาพทั้งหมดเป็น **placeholder** (กล่อง gradient + ป้าย "KEY VISUAL"/"QR CODE") ต้องแทนที่ด้วยภาพจริง

---

## Design Tokens

### Colors
| Token | Hex | การใช้งาน |
|---|---|---|
| accent / primary | `#7c3aed` | ปุ่มหลัก, ลิงก์, ไฮไลต์, โลโก้จุด |
| accent-hover/dark | `#5b21b6` | เน้นเข้ม |
| accent-soft-bg | `#f5f3ff` / `#ede9fe` / `#faf5ff` | พื้นชิป/การ์ดที่ถูกเลือก |
| accent-border | `#ddd6fe` / `#c4b5fd` | เส้นขอบอ่อน, ปุ่ม disabled |
| text | `#18181b` | ข้อความหลัก |
| text-muted | `#3f3f46` | ข้อความรอง |
| text-faint | `#71717a` | คำอธิบาย |
| text-fainter | `#a1a1aa` | label, placeholder |
| bg | `#ffffff` | พื้นหลังหลัก |
| bg-soft | `#fafafa` | พื้นหลัง dashboard/แผนผัง |
| surface | `#f4f4f5` | ชิป/อินพุต |
| border | `#ececee` / `#eee` / `#e4e4e7` | เส้นขอบ/เส้นคั่น |
| dark surface | `#18181b` | แถบ STAGE, สแกนเนอร์, การ์ดการเงิน |
| success | `#16a34a` / `#22c55e` (bg `#f0fdf4`) | สถานะสำเร็จ/เช็คอินแล้ว |
| warning | `#d97706` / `#f59e0b` (bg `#fffbeb`) | สถานะรอ/เหลือน้อย |
| danger | `#dc2626` / `#ef4444` (bg `#fef2f2`) | ปฏิเสธ/ใกล้เต็ม |
| zone colors | VIP `#7c3aed`, A `#3b82f6`, B `#ec4899`, C `#10b981`, D `#f59e0b` | สีประจำโซน |

### Typography
- **Body / UI:** `Anuphan` (Google Fonts) น้ำหนัก 200/300/400/500/600/700 — รองรับไทย+ละติน
- **Mono / labels / โค้ด:** `Space Mono` (400/700) — ใช้กับ label ตัวพิมพ์เล็ก, รหัสตั๋ว, โลโก้, ตัวเลขนาฬิกา
- Scale ที่ใช้: hero 72–118px / h1 26–56px / h2 17–26px / body 14–18px / label 10–13px
- letter-spacing: หัวข้อใหญ่ -.5 ถึง -3px; label mono +1 ถึง +4px
- ขนาดเล็กสุดของ body ≈ 13–14px

### Spacing / Radius / Shadow
- Padding หลัก: หน้าเพจ 28–48px, การ์ด 22–32px
- Gap grid: 20–24px
- Border radius: ชิป/ปุ่มกลม `999px`, ปุ่ม/อินพุต `8–10px`, การ์ด `12–16px`, การ์ดใหญ่/ตั๋ว `16–20px`, เก้าอี้ `6px`
- Shadow: เบามาก เช่น `0 1px 3px rgba(0,0,0,.12)`, ตั๋ว `0 12px 40px rgba(124,58,237,.1)`
- พื้น header เหนียว (sticky) + `backdrop-filter: blur(10px)` พื้น `rgba(255,255,255,.86)`

---

## A) Ticket Buyer (ไฟล์: `PULSE Ticketing.dc.html`)
แอป single-page สลับหน้าจอด้วย state `screen` หน้า home/list/detail/seat/cart/pay/account มี header ร่วม (sticky) ส่วน queue/auth/ticket เต็มจอไม่มี header

### Screens
1. **Home** — Hero แบ่งครึ่ง (ซ้าย: ชื่ออีเวนต์ใหญ่ + meta DATE/VENUE/FROM + ปุ่ม "ซื้อบัตร/รายละเอียด"; ขวา: โปสเตอร์ 4:5) + กริด "อีเวนต์ที่กำลังจะมา" 4 คอลัมน์ + footer. การ์ด/ฮีโร่คลิกไป detail
2. **Event List** — หัวข้อ + จำนวนผล + แถวฟิลเตอร์ชิป (ทั้งหมด/คอนเสิร์ต/เทศกาล/กีฬา/โชว์/สัปดาห์นี้) + ตัวเรียง + กริดการ์ด 3 คอลัมน์ (โปสเตอร์ 16:10 + หมวด + วันที่ + ชื่อ + ราคา)
3. **Event Detail** — แบนเนอร์สีโซน + โปสเตอร์ + ชื่อ/วัน/สถานที่; เนื้อหา 2 คอลัมน์ (ซ้าย: เกี่ยวกับงาน, ไลน์อัพศิลปินเป็นชิป, ตารางราคาบัตรตามโซน; ขวา: การ์ด sticky ราคาเริ่มต้น + ปุ่ม "กดบัตรเลย" → queue)
4. **Queue / Waiting Room** — เต็มจอ พื้น gradient อ่อน; แสดงลำดับคิว (`#1,247`) + progress bar + ETA, เดินอัตโนมัติทุก ~0.9s จนถึง 0 แล้วสลับเป็นสถานะ "ถึงคิวคุณแล้ว" + ปุ่ม "เลือกที่นั่ง"
5. **Seat Selection (เลือกที่นั่งรายตัว)** — 2 คอลัมน์:
   - ซ้าย: ชิปเลือกโซน (สีประจำโซน + ราคา) → เมื่อเลือกโซนแสดงแถบ STAGE + **ผังเก้าอี้รายตัว** จัดเป็นแถว A,B,C… แต่ละเก้าอี้ 26×26px radius 6px คลิก toggle ได้: ว่าง(ขาว ขอบ `#d4d4d8`) / เลือกแล้ว(`#7c3aed` ตัวอักษรขาว) / ไม่ว่าง(`#e5e5e5` กดไม่ได้ cursor not-allowed) + legend
   - ขวา: การ์ด sticky — โซนที่เลือก, ชิปเลขที่นั่งที่เลือก (เช่น A5, A6), ราคา×จำนวน, ค่าธรรมเนียม, รวม, ปุ่ม "ดำเนินการต่อ" (disabled/สีจาง ถ้ายังไม่เลือกที่นั่ง)
   - เลือกได้สูงสุด 8 ที่นั่ง; เก้าอี้ "ไม่ว่าง" คำนวณ deterministic `((row*7 + col*13 + zoneSeed) % 9) < 2`
6. **Cart / Summary** — แถบ countdown gradient ม่วง (mm:ss, ถือบัตร 10:00 เดินถอยหลัง) + สรุปคำสั่งซื้อ (โปสเตอร์ + โซน + จำนวน + เลขที่นั่ง) + ราคา + ปุ่ม "แก้ไข"/"ดำเนินการชำระเงิน"
7. **Payment** — เลือกวิธีจ่าย (บัตรเครดิต / PromptPay QR / Mobile Banking) → ฟอร์มบัตร หรือ QR placeholder ตามที่เลือก + การ์ดสรุปยอด sticky + ปุ่ม "ยืนยันชำระเงิน" → ticket
8. **E-Ticket** — เต็มจอ การ์ดตั๋ว: หัวสีโซน + ชื่อ/วัน/สถานที่, ส่วนรายละเอียด (โซน, เลขที่นั่ง, ประตู Gate 3, เปิดประตู 17:00) คั่นด้วยเส้นประ, QR placeholder, รหัส `MKW-2026-XXXX` + ปุ่ม "ตั๋วของฉัน"/"กลับหน้าแรก"
9. **Account / My Tickets** — โปรไฟล์ + แท็บ (ตั๋วของฉัน/ประวัติ/ตั้งค่า) + รายการตั๋ว "กำลังจะมาถึง" (คลิกดูตั๋ว) + "ที่ผ่านมา" (จาง)
10. **Login / Register** — แยกซ้าย (แผง gradient ม่วงพร้อมสโลแกน) / ขวา (ฟอร์ม) สลับโหมด login↔register ได้ (โหมด register มีช่องชื่อเพิ่ม)

### State (Buyer)
`screen`, `event` (อ็อบเจกต์อีเวนต์ปัจจุบัน), `zoneId`, `selectedSeats[]` (เช่น `["A-5","A-6"]`), `qty` (= จำนวนที่นั่ง), `queuePos`/`queueReady`, `hold` (วินาที เริ่ม 600), `payMethod`, `authMode`, `orderId`
- ราคา: `subtotal = zonePrice × qty`, `fee = 60 × qty`, `total = subtotal + fee`
- Timer: interval ~900ms — หน้า queue ลด `queuePos` ทีละ `ceil(total/7)` จนถึง 0; หน้า cart/pay ลด `hold` ทีละ 1 วินาที
- เลือกโซนใหม่ → reset `selectedSeats=[]`, `qty=0`

### Data (ใช้เป็น mock)
- อีเวนต์: NEON NIGHTS BANGKOK 2026 (featured), MIDNIGHT CITY TOUR, K-WAVE FESTIVAL, BANGKOK JAZZ & SOUL, WONDER FIELD FEST (มี title/date/venue/price/cat/gradient)
- โซน: VIP STANDING ฿4,500 / ZONE A ฿3,500 / ZONE B ฿2,500 / ZONE C ฿1,800 / ZONE D ฿1,500 (แต่ละโซนมีจำนวนแถว×เก้าอี้: vip 4×12, a 5×14, b 6×16, c 6×18, d 7×18)

---

## B) Event Organizer (ไฟล์: `PULSE Organizer.dc.html`)
เลย์เอาต์ dashboard: sidebar ซ้าย 248px (โลโก้ + เมนู + โปรไฟล์ผู้จัด) + main content. state `screen` + wizard `step`

### Screens
1. **แดชบอร์ด** — 4 stat cards (ยอดขายรวม/บัตรที่ขายแล้ว/อีเวนต์กำลังขาย/รายได้สุทธิ) + กราฟแท่งยอดขาย 14 วัน (แท่ง div สูงตามค่า, 3 แท่งท้ายเป็นสี accent ที่เหลือ `#ddd6fe`) + รายการคำสั่งซื้อล่าสุด
2. **อีเวนต์ของฉัน** — ตาราง (อีเวนต์/วันที่/สถานะ/ขายแล้ว+progress/จัดการ); สถานะ กำลังขาย(เขียว)/ร่าง(เทา)/จบแล้ว(เทา)
3. **สร้างอีเวนต์ (wizard 3 สเต็ป)** — (1) ข้อมูลงาน: ชื่อ/วันที่/หมวด/สถานที่/รายละเอียด + ช่องอัปโหลดโปสเตอร์ (dropzone) (2) โซน&ราคา: ตารางแก้ไขโซน (สี/ชื่อ/ราคา/จำนวนที่นั่ง) + เพิ่มโซน + ความจุรวม (3) รอบการขาย: การ์ดรอบพรีเซล/ทั่วไป (ช่วงเวลา/โควต้า/toggle เปิด-ปิด) + แจ้งระบบจัดคิวอัตโนมัติ. ปุ่ม ย้อนกลับ/ถัดไป; สเต็ป 3 = "เผยแพร่อีเวนต์" → ไปหน้าอีเวนต์
4. **รายงานยอดขาย** — 3 การ์ด (รายได้รวม/บัตรขายแล้ว/รายได้สุทธิ) + ยอดขายแยกตามโซน (progress bar สีโซน + รายได้)
5. **เช็คอินหน้างาน** — กล่องสแกนเนอร์พื้นดำ (กรอบ QR มุม accent + ป้าย "[ CAMERA / QR ]") + ปุ่ม "จำลองการสแกน" (เพิ่มยอดเช็คอิน + เพิ่มชื่อล่าสุด) + การ์ดสถิติ เช็คอินแล้ว/ทั้งหมด + รายการเช็คอินล่าสุด
6. **ผู้เข้างาน** — ตาราง (ผู้ถือบัตร/รหัสคำสั่งซื้อ/จำนวน/โซน/สถานะเช็คอิน) + ช่องค้นหา/กรอง

### State (Organizer)
`screen` (dashboard/events/create/report/checkin/attendees), `step` (1–3), `checkedIn` (ตัวเลข), `scans[]` (รายการเช็คอินที่จำลอง). กราฟ/ตารางเป็น mock data ใน logic

---

## C) Admin (ไฟล์: `PULSE Admin.dc.html`)
เลย์เอาต์ dashboard เหมือน Organizer (sidebar 248px label "ADMIN CONSOLE") เมนูมี badge ตัวเลขงานค้าง

### Screens
1. **ภาพรวมแพลตฟอร์ม** — 4 stat (GMV/ผู้ใช้/อีเวนต์/รายได้ค่าธรรมเนียม) + กราฟ GMV 14 วัน + การ์ด "ต้องดำเนินการ" (อีเวนต์รออนุมัติ/คำขอคืนเงิน/รายการรอโอน — คลิกไปหน้านั้น)
2. **จัดการผู้ใช้** — แท็บกรอง (ทั้งหมด/ผู้ซื้อ/ผู้จัดงาน) + ตาราง (ผู้ใช้/ประเภท/เข้าร่วม/กิจกรรม/สถานะ). ผู้จัดงาน avatar ดำ, ผู้ซื้อ avatar ม่วงอ่อน
3. **อนุมัติอีเวนต์** — การ์ดอีเวนต์รอตรวจ (โปสเตอร์ + ข้อมูล + ผู้จัด + เวลาส่ง) + ปุ่ม ปฏิเสธ/อนุมัติ → ลบออกจากคิวจริง (badge เมนูลดตาม); คิวว่าง = empty state
4. **การเงิน & payout** — 3 การ์ด (ค่าธรรมเนียมรวม การ์ดดำ/รอโอน/โอนแล้ว) + ตาราง payout (อีเวนต์+ผู้จัด/ยอดสุทธิ/กำหนดโอน/สถานะ/ปุ่มโอนเงิน) — กด "โอนเงิน" เปลี่ยนสถานะเป็น "โอนแล้ว"
5. **คำขอคืนเงิน** — การ์ดคำขอ (ผู้ขอ/รหัส/อีเวนต์/รายละเอียด/เหตุผล/ยอด) + ปุ่ม อนุมัติคืนเงิน/ปฏิเสธ → เปลี่ยนเป็นป้ายสถานะ

### State (Admin)
`screen` (dashboard/users/approvals/finance/refunds), `userTab`, `approvals[]`, `payouts[]`, `refunds[]` — actions แก้ไข array จริง (อนุมัติ/ปฏิเสธ/โอน) แล้ว re-render

---

## Interactions & Behavior (รวม)
- **นำทาง:** ทุกแอปสลับหน้าจอด้วย state ไม่ใช่ route แยก — ในโค้ดจริงควรทำเป็น route/หน้าแยก (`/events`, `/events/:id`, `/checkout`, `/admin/refunds` ฯลฯ)
- **Timer:** queue progress และ countdown ถือบัตร ใช้ interval — ในโปรดักชันควรผูกกับ server time / WebSocket จริง
- **Seat map:** toggle เลือก/ยกเลิกเก้าอี้, จำกัด 8 ที่นั่ง, ที่นั่งไม่ว่าง disabled — โปรดักชันต้อง lock ที่นั่งฝั่ง server กันชนกัน
- **Hover/active:** ปุ่มหลักเข้มขึ้นเมื่อ hover, การ์ด/ชิปที่เลือกได้มีพื้น/ขอบ accent
- transition `all .15s` กับชิป/เก้าอี้

## Assets
- **รูปภาพทั้งหมดเป็น placeholder** (กล่อง CSS gradient + ลายเส้นทแยง + ป้าย mono "KEY VISUAL"/"POSTER"/"QR CODE") — ต้องแทนด้วย: โปสเตอร์/key visual อีเวนต์จริง และ QR code จริง (สร้างจาก order/ticket id)
- ไม่มีไฟล์ภาพ/ไอคอนแนบ — ไอคอนใช้ emoji/อักขระ ควรแทนด้วย icon library ของโค้ดเบส (เช่น lucide)
- ฟอนต์โหลดจาก Google Fonts: Anuphan, Space Mono

## Files
- `PULSE Ticketing.dc.html` — Ticket Buyer (10 หน้า)
- `PULSE Organizer.dc.html` — Event Organizer (6 หน้า)
- `PULSE Admin.dc.html` — Admin (5 หน้า)

> หมายเหตุ: ชื่อไฟล์ยังขึ้นต้น "PULSE" แต่แบรนด์ในดีไซน์คือ **Mankaew** (โลโก้, "Mankaew LIVE", รหัสตั๋ว `MKW-2026-…`)
