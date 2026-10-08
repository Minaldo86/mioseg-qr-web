import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "SERVER_CONFIGURATION_ERROR" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const body = await req.json().catch(() => ({}));
  const south = finiteNumber(body?.viewport?.south);
  const north = finiteNumber(body?.viewport?.north);
  const west = finiteNumber(body?.viewport?.west);
  const east = finiteNumber(body?.viewport?.east);

  if (
    south == null || north == null || west == null || east == null ||
    south < -90 || north > 90 || west < -180 || east > 180 ||
    south > north || west > east
  ) {
    return json({ ok: false, error: "INVALID_VIEWPORT" }, 400);
  }

  const { data: saves, error: savesError } = await admin
    .from("qrx_saves")
    .select("qrx_id")
    .eq("user_id", user.id)
    .limit(5000);

  if (savesError) {
    console.error("get-dashboard-map-qrx saves:", savesError);
    return json({ ok: false, error: "MAP_LOAD_FAILED" }, 500);
  }

  const savedIds = [...new Set(
    (saves ?? [])
      .map((row: { qrx_id: string | null }) => row.qrx_id)
      .filter((id: string | null): id is string => typeof id === "string" && id.length > 0)
  )];

  const fields =
    "id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,password_protected";

  const ownPromise = admin
    .from("qr_x_entries")
    .select(fields)
    .eq("owner_user_id", user.id)
    .is("deleted_at", null)
    .or("suspended.is.null,suspended.eq.false")
    .gte("location_lat", south)
    .lte("location_lat", north)
    .gte("location_lng", west)
    .lte("location_lng", east);

  const savedPromise =
    savedIds.length > 0
      ? admin
          .from("qr_x_entries")
          .select(fields)
          .in("id", savedIds)
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false")
          .gte("location_lat", south)
          .lte("location_lat", north)
          .gte("location_lng", west)
          .lte("location_lng", east)
      : Promise.resolve({ data: [], error: null });

  const [ownRes, savedRes] = await Promise.all([ownPromise, savedPromise]);

  if (ownRes.error || savedRes.error) {
    console.error("get-dashboard-map-qrx entries:", ownRes.error ?? savedRes.error);
    return json({ ok: false, error: "MAP_LOAD_FAILED" }, 500);
  }

  const own = (ownRes.data ?? []).map((entry: any) => ({
    ...entry,
    password_protected: entry.password_protected === true,
  }));

  const saved = (savedRes.data ?? [])
    .filter((entry: any) => entry.owner_user_id !== user.id)
    .map((entry: any) => {
      if (entry.password_protected === true) {
        // Saved protected QR remain visible on the personal map. Exact map
        // coordinates are intentionally retained for the marker; descriptive
        // location/category/content is withheld from the non-owner.
        return {
          id: entry.id,
          title: entry.title,
          company_name: null,
          description: null,
          type: entry.type,
          owner_user_id: entry.owner_user_id,
          location_name: null,
          location_lat: entry.location_lat,
          location_lng: entry.location_lng,
          category: null,
          verified: entry.verified,
          follower_count: entry.follower_count,
          views_total: entry.views_total,
          cover_image_url: entry.cover_image_url,
          password_protected: true,
        };
      }
      return {
        ...entry,
        password_protected: false,
      };
    });

  return json({ ok: true, own, saved });
});
