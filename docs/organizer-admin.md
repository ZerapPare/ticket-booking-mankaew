# Mankaew — สรุปงาน UI ฝั่ง Organizer & Admin

> สถานะ: ✅ เสร็จครบ 11 หน้า — `npm run build` ผ่าน (30 routes), dev ทุกหน้า HTTP 200, ไม่มี error
> ภาษา: **JavaScript (`.jsx`)**
> ที่มาดีไซน์: recreate จาก `dist/docs/PULSE Organizer.dc.html` + `PULSE Admin.dc.html` (อ้างอิงเท่านั้น)
> รอบนี้ = **mock UI** (ยังไม่ต่อ Supabase/auth) ตามที่ตกลง

---

## 1. ภาพรวม

สร้างหน้า dashboard ฝั่ง **Event Organizer (6 หน้า)** และ **Admin (5 หน้า)**
ต่อจากฝั่ง Buyer ที่เสร็จแล้ว ใช้ design system เดิม (ธีมขาว accent ม่วง `#7c3aed`,
ฟอนต์ Anuphan + Space Mono) เลย์เอาต์เป็น **sidebar 248px + main content** พื้น `#fafafa`

ตัดสินใจขอบเขตรอบนี้:
- Organizer/Admin = **mock UI** (เหมือนฝั่ง Buyer) — ต่อ DB ทีหลัง
- ส่วนที่ไม่มีใน schema (payouts / refunds / อนุมัติอีเวนต์ / กราฟ) = **placeholder + mock** มี comment TODO

---

## 2. หน้าที่สร้าง

### Event Organizer (6 หน้า)
| หน้า | Route | ไฟล์ |
|---|---|---|
| แดชบอร์ด — 4 stat + กราฟแท่ง 14 วัน + คำสั่งซื้อล่าสุด | `/organizer` | `app/organizer/page.jsx` |
| อีเวนต์ของฉัน — ตาราง + progress ขายแล้ว | `/organizer/events` | `app/organizer/events/page.jsx` |
| สร้างอีเวนต์ — wizard 3 สเต็ป (ข้อมูล/โซน&ราคา/รอบขาย) | `/organizer/create` | `app/organizer/create/page.jsx` |
| รายงานยอดขาย — 3 การ์ด + ยอดขายแยกโซน | `/organizer/report` | `app/organizer/report/page.jsx` |
| เช็คอินหน้างาน — สแกนเนอร์ + จำลองการสแกน | `/organizer/checkin` | `app/organizer/checkin/page.jsx` |
| ผู้เข้างาน — ตาราง + ค้นหา | `/organizer/attendees` | `app/organizer/attendees/page.jsx` |

### Admin (5 หน้า)
| หน้า | Route | ไฟล์ |
|---|---|---|
| ภาพรวมแพลตฟอร์ม — 4 stat + กราฟ GMV + การ์ดงานค้าง | `/admin` | `app/admin/page.jsx` |
| จัดการผู้ใช้ — แท็บกรอง + ตาราง | `/admin/users` | `app/admin/users/page.jsx` |
| อนุมัติอีเวนต์ — อนุมัติ/ปฏิเสธ + empty state | `/admin/approvals` | `app/admin/approvals/page.jsx` |
| การเงิน & payout — การ์ด + ตาราง + ปุ่มโอนเงิน | `/admin/finance` | `app/admin/finance/page.jsx` |
| คำขอคืนเงิน — อนุมัติ/ปฏิเสธ | `/admin/refunds` | `app/admin/refunds/page.jsx` |

---

## 3. โครงสร้างไฟล์ที่เพิ่ม

```
app/
  organizer/
    layout.jsx              # sidebar + main (TODO: auth guard)
    page.jsx               # + export CreateButton (ใช้ซ้ำ)
    events/ create/ report/ checkin/ attendees/  (page.jsx)
  admin/
    layout.jsx             # ครอบด้วย AdminShell
    page.jsx  users/ approvals/ finance/ refunds/  (page.jsx)

components/
  dashboard/
    dashboard-sidebar.jsx  # sidebar 248px ใช้ร่วม Organizer+Admin (client, active=usePathname)
    primitives.jsx         # DashboardHeader, StatCard, BarChart, StatusPill, Panel, TableShell, TableRow
  admin/
    admin-provider.jsx     # client context: approvals/payouts/refunds + actions + badge counts
    admin-shell.jsx        # ครอบ AdminProvider + sidebar (badge live)

lib/
  organizer-mock.js        # ข้อมูล mock + nav + chart Organizer
  admin-mock.js            # ข้อมูล mock + nav + chart Admin
```

---

## 4. จุดเด่นเชิงเทคนิค

- **Sidebar + primitives ใช้ร่วมกัน** ทั้ง Organizer และ Admin (ลดโค้ดซ้ำ)
- **Badge live** — Admin มี `components/admin/admin-provider.jsx` (React context):
  กดอนุมัติอีเวนต์/คืนเงิน → badge ใน sidebar + เลขในหน้า dashboard ลดทันที (sync state)
- **Interactive ครบ (client state)** — wizard 3 สเต็ป, toggle รอบขาย, "จำลองการสแกน" (เพิ่มยอดเช็คอิน),
  แท็บกรองผู้ใช้, อนุมัติ/ปฏิเสธ/โอนเงิน เปลี่ยนสถานะใน UI
- **มี comment TODO** ชัดเจนทุกจุดที่เป็น placeholder (payouts/refunds/approval ไม่มีตารางใน schema)

---

## 5. การ Verify

- `npm run build` → ✅ ผ่าน, **30 routes** (รวม Organizer 6 + Admin 5)
- `npm run dev` → ทุกหน้า HTTP 200, log ไม่มี error/warning

**วิธีเข้าตอนนี้** (ยังไม่มี auth): เข้าตรงผ่าน URL — `/organizer`, `/admin` และหน้าย่อยทั้งหมด

---

## 6. งานที่เหลือ (เฟสถัดไป — ตามแผนที่อนุมัติไว้)

- [ ] ต่อ **auth จริง** — NextAuth (Auth.js v5) Credentials + Google + Supabase
- [ ] **email → role** (buyer/organizer/admin) + redirect ตาม role หลังล็อกอิน
- [ ] **การซื้อบัตรต้องล็อกอินก่อน** (buy-gate) + ลิงก์เข้า dashboard ตาม role ใน header
- [ ] **route guard** — `proxy.js` (Next 16) กัน `/organizer`, `/admin` ตาม role + เช็คซ้ำใน layout
- [ ] ต่อ **ข้อมูลจริง** จาก Supabase แทน mock (dashboard/ตาราง/เช็คอิน) + เพิ่ม migration สำหรับ payouts/refunds/approval

> deps สำหรับ auth (`next-auth`, `@supabase/supabase-js`, `bcryptjs`, `zod`) ติดตั้งไว้แล้ว พร้อมใช้รอบหน้า
> แผนเต็มอยู่ที่ `~/.claude/plans/event-organizer-jiggly-hamster.md`
