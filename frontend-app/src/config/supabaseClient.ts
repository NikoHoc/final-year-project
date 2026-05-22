import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Peringatan: EXPO_PUBLIC_SUPABASE_URL atau ANON_KEY belum diatur di .env");
}

export const supabaseRealtime = createClient(supabaseUrl, supabaseAnonKey);