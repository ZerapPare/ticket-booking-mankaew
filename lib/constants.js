// ค่าคงที่ของ checkout flow (ไม่ใช่ข้อมูลใน DB)

// ค่าธรรมเนียมระบบต่อที่นั่ง — ไม่มีคอลัมน์ใน DB จึงคิดฝั่งแอป
export const FEE_PER_SEAT = 60;

// เพดานที่นั่งต่อออเดอร์ (UX เท่านั้น) — กันไม่ให้เลือกเกินก่อนกดต่อ
// ตัวบังคับจริงอยู่ที่ DB: hold_seats() จะ raise EXCEEDS_MAX_PER_ORDER ถ้าเกิน 8
export const MAX_SEATS = 8;