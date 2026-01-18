// mioseg-qr-web/lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Next.js (Node runtime).
 * Uses server environment variables by default.
 * Falls back to NEXT_PUBLIC_* for local/preview convenience.
 *
 * IMPORTANT:
 * - This is NOT the browser client.
 * - persistSession is disabled on purpose for server usage.
 */
export function createSupabaseServerClient() {
  const supabaseUrl =
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();

  const supabaseAnonKey =
    (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL is required (server). Set it in Vercel Environment Variables."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY is required (server). Set it in Vercel Environment Variables."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
