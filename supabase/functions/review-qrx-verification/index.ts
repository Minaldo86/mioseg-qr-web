// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-review-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const adminKey = req.headers.get("x-admin-review-key");
    const expectedKey =
      Deno.env.get("QRX_ADMIN_REVIEW_KEY") || Deno.env.get("ADMIN_REVIEW_KEY");

    if (!expectedKey) {
      return json(
        {
          error:
            "Server configuration error: QRX_ADMIN_REVIEW_KEY is missing in Supabase Edge Function secrets.",
        },
        500,
      );
    }

    if (!adminKey || adminKey !== expectedKey) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { requestId, action, reviewNote } = await req.json();

    if (!requestId || !action) {
      return json({ error: "Missing params" }, 400);
    }

    if (!["approve", "reject"].includes(action)) {
      return json({ error: "Invalid action" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        {
          error:
            "Server configuration error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
        },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: reqData, error: fetchError } = await supabase
      .from("qrx_verification_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !reqData) {
      return json(
        {
          error: "Request not found",
          details: fetchError?.message ?? null,
        },
        404,
      );
    }

    if (reqData.status !== "pending") {
      return json(
        {
          error: "Already processed",
          status: reqData.status,
        },
        400,
      );
    }

    const nowIso = new Date().toISOString();

    if (action === "approve") {
      const { error: updateQrxError } = await supabase
        .from("qr_x_entries")
        .update({ verified: true, updated_at: nowIso })
        .eq("id", reqData.qrx_id)
        .eq("owner_user_id", reqData.owner_user_id)
        .eq("type", "business");

      if (updateQrxError) {
        return json(
          {
            error: "Failed to update qr_x_entries",
            details: updateQrxError.message,
          },
          500,
        );
      }

      const { error: updateRequestError } = await supabase
        .from("qrx_verification_requests")
        .update({
          status: "approved",
          review_note: reviewNote ?? null,
          reviewed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", requestId)
        .eq("status", "pending");

      if (updateRequestError) {
        return json(
          {
            error: "Failed to update verification request",
            details: updateRequestError.message,
          },
          500,
        );
      }

      return json({
        success: true,
        action: "approved",
        requestId,
        qrxId: reqData.qrx_id,
      });
    }

    if (action === "reject") {
      const creditsToRefund = Number(reqData.credits_charged ?? 0);

      if (!reqData.refund_done && creditsToRefund > 0) {
        const { error: refundError } = await supabase.rpc("add_credits_admin", {
          p_user_id: reqData.owner_user_id,
          p_amount: creditsToRefund,
        });

        if (refundError) {
          return json(
            {
              error: "Failed to refund credits",
              details: refundError.message,
            },
            500,
          );
        }
      }

      const { error: updateRequestError } = await supabase
        .from("qrx_verification_requests")
        .update({
          status: "rejected",
          refund_done: true,
          review_note: reviewNote ?? null,
          reviewed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", requestId)
        .eq("status", "pending");

      if (updateRequestError) {
        return json(
          {
            error: "Failed to update verification request",
            details: updateRequestError.message,
          },
          500,
        );
      }

      return json({
        success: true,
        action: "rejected",
        requestId,
        qrxId: reqData.qrx_id,
        refunded: !reqData.refund_done && creditsToRefund > 0,
        refundedAmount: creditsToRefund,
      });
    }

    return json({ error: "Unknown state" }, 500);
  } catch (err) {
    return json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});
