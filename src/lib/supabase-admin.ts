import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | null = null;

function getRequiredEnvValue(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const supabaseUrl = getRequiredEnvValue([
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_URL",
  ]);

  const serviceRoleKey = getRequiredEnvValue([
    "SUPABASE_SERVICE_ROLE_KEY",
    "SERVICE_ROLE_KEY",
  ]);

  if (!supabaseUrl) {
    throw new Error(
      "Supabase URL fehlt. Bitte SUPABASE_URL oder NEXT_PUBLIC_SUPABASE_URL in Vercel setzen."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Supabase Service Role Key fehlt. Bitte SUPABASE_SERVICE_ROLE_KEY in Vercel setzen."
    );
  }

  cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});
