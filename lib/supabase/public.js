import { createClient } from "@supabase/supabase-js";

/*
  Supabase client ด้วย ANON/publishable key — ใช้ได้ทั้ง server และ client
  อ่านได้เฉพาะข้อมูลสาธารณะตามที่ RLS อนุญาต (อีเวนต์ published, venues,
  ticket_types/seats ของอีเวนต์ที่เปิดขาย) เหมาะกับหน้า browse + realtime
*/
let _client = null;

export function supabasePublic() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      "ขาด env: NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_KEY (.env.local)"
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}