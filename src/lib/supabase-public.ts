import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://ljnuzfjlxsecsdcbcpny.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnV6ZmpseHNlY3NkY2JjcG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTI5OTgsImV4cCI6MjA3OTU4ODk5OH0.0rnqq6_sVORPLTp4ku1k0Prg2lAdCKwnzP-ci6rIaYI";

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});