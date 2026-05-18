import { supabaseAdmin } from "../../../../lib/supabase-admin";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  qrxId?: string | null;
  amount?: number | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    qrx_id: input.qrxId ?? null,
    amount: input.amount ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = await req.json();
    const requestId = String(body?.requestId || "").trim();
    const action = body?.action;
    const reviewNote =
      typeof body?.reviewNote === "string" ? body.reviewNote.trim() : null;

    if (!requestId) {
      return Response.json({ error: "requestId fehlt" }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return Response.json(
        { error: "action muss approve oder reject sein" },
        { status: 400 }
      );
    }

    const { data: requestRow, error: fetchError } = await supabaseAdmin
      .from("qrx_verification_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !requestRow) {
      return Response.json(
        { error: "Verifizierungsantrag nicht gefunden" },
        { status: 404 }
      );
    }

    if (requestRow.status !== "pending") {
      return Response.json(
        { error: "Antrag wurde bereits bearbeitet" },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    if (action === "approve") {
      const { error: qrxError } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          verified: true,
          updated_at: nowIso,
        })
        .eq("id", requestRow.qrx_id)
        .eq("owner_user_id", requestRow.owner_user_id)
        .eq("type", "business");

      if (qrxError) {
        return Response.json(
          {
            error: "QR-X konnte nicht verifiziert werden",
            details: qrxError.message,
          },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("qrx_verification_requests")
        .update({
          status: "approved",
          review_note: reviewNote,
          reviewed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", requestId);

      if (updateError) {
        return Response.json(
          {
            error: "Antrag konnte nicht aktualisiert werden",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "verification_approved",
        targetUserId: requestRow.owner_user_id,
        qrxId: requestRow.qrx_id,
        note: reviewNote || `Business QR-X verifiziert. Request-ID: ${requestId}`,
      });

      return Response.json({ ok: true, status: "approved" });
    }

    const refundAmount =
      typeof requestRow.credits_charged === "number" &&
      requestRow.credits_charged > 0
        ? requestRow.credits_charged
        : 10;

    if (!requestRow.refund_done && refundAmount > 0) {
      const { error: refundError } = await supabaseAdmin.rpc("add_credits_admin", {
        p_user_id: requestRow.owner_user_id,
        p_amount: refundAmount,
      });

      if (refundError) {
        return Response.json(
          {
            error: "Credits konnten nicht erstattet werden",
            details: refundError.message,
          },
          { status: 500 }
        );
      }
    }

    const { error: rejectError } = await supabaseAdmin
      .from("qrx_verification_requests")
      .update({
        status: "rejected",
        refund_done: true,
        review_note: reviewNote,
        reviewed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", requestId);

    if (rejectError) {
      return Response.json(
        {
          error: "Ablehnung konnte nicht gespeichert werden",
          details: rejectError.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: "verification_rejected",
      targetUserId: requestRow.owner_user_id,
      qrxId: requestRow.qrx_id,
      amount: !requestRow.refund_done ? refundAmount : null,
      note:
        reviewNote ||
        `Business QR-X abgelehnt. ${
          !requestRow.refund_done ? `${refundAmount} Credits erstattet.` : "Keine erneute Erstattung."
        } Request-ID: ${requestId}`,
    });

    return Response.json({
      ok: true,
      status: "rejected",
      refunded: !requestRow.refund_done,
      refundedAmount: !requestRow.refund_done ? refundAmount : 0,
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
