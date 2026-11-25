import { createClient as createSupabase } from "@supabase/supabase-js";

// ใช้ secret key ฝั่งเซิร์ฟเวอร์เท่านั้น (ไม่มี prefix NEXT_PUBLIC จึงไม่ถูกส่งไปที่เบราว์เซอร์)
export async function createClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
