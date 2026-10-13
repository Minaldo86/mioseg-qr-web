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

    // Ablehnung und Rückerstattung ausschließlich atomar in der Datenbank ausführen.
    // Die RPC sperrt den Antrag, verbucht die Credits samt Ledger-Eintrag
    // und setzt status/refund_done in derselben Transaktion.
    const { data: rejectionResult, error: rejectError } = await supabaseAdmin.rpc(
      "qrx_reject_verification_admin",
      {
        p_request_id: requestId,
        p_review_note: reviewNote,
      }
    );

    if (rejectError) {
      console.error("qrx_reject_verification_admin failed:", rejectError.message);
      return Response.json(
        { error: "Ablehnung oder Rückerstattung fehlgeschlagen" },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: "verification_rejected",
      targetUserId: requestRow.owner_user_id,
      qrxId: requestRow.qrx_id,
      amount: Number(rejectionResult?.refunded_amount ?? 0),
      note: reviewNote || `Business QR abgelehnt. Request-ID: ${requestId}`,
    });

    return Response.json(rejectionResult);

  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
