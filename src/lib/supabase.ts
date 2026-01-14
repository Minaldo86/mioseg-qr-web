import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL in Vercel Environment Variables.");
}

if (!supabaseAnonKey) {
  throw new Error("supabaseAnonKey is required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
