import "server-only";
import { createClient } from "@supabase/supabase-js";

/*
  Supabase client ฝั่ง server — ใช้ SERVICE ROLE key (bypass RLS)
  สิทธิ์ตามบทบาทถูกบังคับในโค้ดแอป (NextAuth + การตรวจใน route/layout)
  ห้าม import ไฟล์นี้จาก client component (มี 'server-only' กันไว้)
*/
let _client = null;

export function supabaseServer() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "ขาด env: NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY (.env.local)"
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}