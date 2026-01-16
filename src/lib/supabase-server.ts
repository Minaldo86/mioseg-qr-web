import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required (server). Set it in Vercel Environment Variables.");
  }

  if (!supabaseAnonKey) {
    throw new Error("SUPABASE_ANON_KEY is required (server). Set it in Vercel Environment Variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
