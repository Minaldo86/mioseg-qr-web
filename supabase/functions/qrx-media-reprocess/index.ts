import { createClient } from "jsr:@supabase/supabase-js@2";

type JsonBody = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

function json(status: number, body: JsonBody) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return json(405, { code: "METHOD_NOT_ALLOWED", message: "Use POST" });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!jwt) {
      return json(401, { code: "UNAUTHORIZED", message: "Missing bearer token" });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !anonKey || !serviceKey) {
      return json(500, { code: "CONFIG_MISSING", message: "Supabase env vars missing" });
    }

    const supabaseUser = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const supabaseAdmin = createClient(url, serviceKey);

    const body = (await req.json().catch(() => null)) as { mediaId?: unknown; reason?: unknown } | null;
    const mediaId = String(body?.mediaId ?? "").trim();
    const reason = String(body?.reason ?? "admin_reprocess").trim();

    if (!mediaId) {
      return json(400, { code: "BAD_REQUEST", message: "mediaId is required" });
    }

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return json(401, { code: "UNAUTHORIZED", message: "Invalid session" });
    }

    const uid = userData.user.id;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, is_admin")
      .eq("id", uid)
      .maybeSingle();

    if (profileErr) {
      return json(500, { code: "PROFILE_LOOKUP_FAILED", message: profileErr.message });
    }

    const isAdmin =
      profile?.is_admin === true ||
      String((profile as any)?.role || "").toLowerCase() === "admin";

    if (!isAdmin) {
      return json(403, { code: "FORBIDDEN", message: "Admin only" });
    }

    const selectCols =
      "id, qrx_id, type, filename, mime_type, processing_status, processing_error, original_storage_path, storage_path";

    const { data: media, error: mediaErr } = await supabaseAdmin
      .from("qr_x_media")
      .select(selectCols)
      .eq("id", mediaId)
      .maybeSingle();

    if (mediaErr) {
      return json(500, { code: "MEDIA_LOOKUP_FAILED", message: mediaErr.message });
    }

    if (!media) {
      return json(404, { code: "NOT_FOUND", message: "Media not found" });
    }

    const mimeType = String((media as any).mime_type || "");
    const type = String((media as any).type || "");

    if (!mimeType.startsWith("image/") || type === "file") {
      return json(400, {
        code: "NOT_IMAGE",
        message: "Only image/logo media can be reprocessed",
      });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("qr_x_media")
      .update({
        processing_status: "queued",
        processing_error: null,
      })
      .eq("id", mediaId)
      .select(selectCols)
      .single();

    if (updateErr) {
      return json(500, { code: "REQUEUE_FAILED", message: updateErr.message });
    }

    try {
      EdgeRuntime.waitUntil(
        supabaseAdmin.functions.invoke("qrx-media-process-image", {
          body: {
            mediaId,
            reason,
          },
        }) as Promise<unknown>,
      );
    } catch (e) {
      console.warn("qrx-media-process-image invoke skipped:", String((e as any)?.message ?? e));
    }

    return json(200, {
      ok: true,
      media: updated,
      queued: true,
    });
  } catch (e) {
    return json(500, {
      code: "UNEXPECTED",
      message: String((e as { message?: string })?.message ?? e),
    });
  }
});
