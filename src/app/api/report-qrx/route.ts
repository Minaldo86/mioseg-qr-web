import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ReportReason =
  | "fake_or_fraud"
  | "wrong_business_info"
  | "spam"
  | "illegal_or_dangerous"
  | "copyright"
  | "other";

type ExistingReport = {
  reporter_fingerprint: string | null;
  report_weight: number | null;
  description_hash?: string | null;
  created_at?: string | null;
};

const FLAG_SCORE_THRESHOLD = 3;
const AUTO_SUSPEND_SCORE_THRESHOLD = 5;
const RECENT_REPORT_WINDOW_MS = 2 * 60 * 1000;
const RECENT_REPORT_SPAM_THRESHOLD = 3;
const DUPLICATE_DESCRIPTION_THRESHOLD = 2;

const REASON_LABELS: Record<ReportReason, string> = {
  fake_or_fraud: "Betrug / Fake",
  wrong_business_info: "Falsche Unternehmensangaben",
  spam: "Spam / Werbung",
  illegal_or_dangerous: "Illegale oder gefährliche Inhalte",
  copyright: "Urheberrecht / fremde Inhalte",
  other: "Sonstiges",
};

function normalizeReason(value: unknown): ReportReason {
  const text = String(value || "other");

  if (
    text === "fake_or_fraud" ||
    text === "wrong_business_info" ||
    text === "spam" ||
    text === "illegal_or_dangerous" ||
    text === "copyright" ||
    text === "other"
  ) {
    return text;
  }

  return "other";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function cleanEmail(value: unknown) {
  const text = String(value || "").trim().toLowerCase();

  if (!text) return null;
  if (text.length > 180) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return null;

  return text;
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown-ip";
  }

  return realIp || "unknown-ip";
}

function createReporterFingerprint(req: Request, reporterEmail: string | null) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown-agent";
  const raw = reporterEmail ? `email:${reporterEmail}` : `anon:${ip}:${userAgent}`;

  return createHash("sha256").update(raw).digest("hex");
}

function createDescriptionHash(text: string) {
  return createHash("sha256")
    .update(text.trim().toLowerCase().replace(/\s+/g, " "))
    .digest("hex");
}

function getReportWeight(reason: ReportReason, reporterEmail: string | null) {
  let weight = reporterEmail ? 2 : 1;

  if (reason === "illegal_or_dangerous") {
    weight += 1;
  }

  if (reason === "fake_or_fraud") {
    weight += 1;
  }

  return Math.min(weight, 3);
}

function adjustReportWeightForSpam(input: {
  baseWeight: number;
  existingReports: ExistingReport[];
  descriptionHash: string;
}) {
  const now = Date.now();
  const recentWindowStart = now - RECENT_REPORT_WINDOW_MS;

  const recentReports = input.existingReports.filter((report) => {
    if (!report.created_at) return false;
    const createdAtMs = new Date(report.created_at).getTime();
    return Number.isFinite(createdAtMs) && createdAtMs >= recentWindowStart;
  });

  const duplicateDescriptionCount = input.existingReports.filter(
    (report) => report.description_hash === input.descriptionHash
  ).length;

  let adjustedWeight = input.baseWeight;
  const spamReasons: string[] = [];

  if (recentReports.length >= RECENT_REPORT_SPAM_THRESHOLD) {
    adjustedWeight = Math.max(1, Math.floor(adjustedWeight / 2));
    spamReasons.push(
      `Viele Meldungen in kurzer Zeit (${recentReports.length} in 2 Minuten)`
    );
  }

  if (duplicateDescriptionCount >= DUPLICATE_DESCRIPTION_THRESHOLD) {
    adjustedWeight = 0;
    spamReasons.push(
      `Doppelte/ähnliche Beschreibung (${duplicateDescriptionCount + 1}x)`
    );
  }

  return {
    adjustedWeight,
    spamReasons,
    recentReportCount: recentReports.length,
    duplicateDescriptionCount,
  };
}

async function nextTicketNumber() {
  const year = new Date().getFullYear();
  const prefix = `SUP-${year}-`;

  const { count, error } = await supabaseAdmin
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00.000Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);

  if (error) {
    console.warn("ticket count failed:", error.message);
  }

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  qrxId?: string | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    qrx_id: input.qrxId ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

function calculateUniqueReportStats(
  reports: ExistingReport[],
  currentFingerprint: string,
  currentWeight: number
) {
  const weightsByFingerprint = new Map<string, number>();

  for (const report of reports) {
    const fingerprint = report.reporter_fingerprint;
    if (!fingerprint) continue;

    const weight = Math.max(1, report.report_weight ?? 1);
    const previousWeight = weightsByFingerprint.get(fingerprint) ?? 0;

    weightsByFingerprint.set(fingerprint, Math.max(previousWeight, weight));
  }

  const previousCurrentWeight = weightsByFingerprint.get(currentFingerprint) ?? 0;
  weightsByFingerprint.set(currentFingerprint, Math.max(previousCurrentWeight, currentWeight));

  let score = 0;

  for (const weight of weightsByFingerprint.values()) {
    score += weight;
  }

  return {
    reportCount: weightsByFingerprint.size,
    reportScore: score,
  };
}

async function updateQrxModerationState(input: {
  qrxId: string;
  ownerUserId: string;
  currentSuspended: boolean | null;
  reportCount: number;
  reportScore: number;
  reasonLabel: string;
}) {
  const nowIso = new Date().toISOString();

  if (input.reportScore >= AUTO_SUSPEND_SCORE_THRESHOLD) {
    const { error } = await supabaseAdmin
      .from("qr_x_entries")
      .update({
        report_count: input.reportCount,
        report_score: input.reportScore,
        moderation_status: "auto_suspended",
        moderation_flagged_at: nowIso,
        auto_suspended_at: nowIso,
        suspended: true,
        suspended_reason: `Automatisch gesperrt nach ${input.reportScore} gewichteten Meldungen. Letzter Grund: ${input.reasonLabel}`,
        suspended_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", input.qrxId);

    if (error) {
      console.warn("auto suspend update failed:", error.message);
      return;
    }

    await writeAdminLog({
      actionType: "qrx_auto_suspended_by_reports",
      targetUserId: input.ownerUserId,
      qrxId: input.qrxId,
      note: `QR-X automatisch gesperrt. Meldungen: ${input.reportCount}, Score: ${input.reportScore}`,
    });

    return;
  }

  if (input.reportScore >= FLAG_SCORE_THRESHOLD) {
    const { error } = await supabaseAdmin
      .from("qr_x_entries")
      .update({
        report_count: input.reportCount,
        report_score: input.reportScore,
        moderation_status: "flagged",
        moderation_flagged_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", input.qrxId);

    if (error) {
      console.warn("flag update failed:", error.message);
      return;
    }

    await writeAdminLog({
      actionType: "qrx_flagged_by_reports",
      targetUserId: input.ownerUserId,
      qrxId: input.qrxId,
      note: `QR-X zur Prüfung markiert. Meldungen: ${input.reportCount}, Score: ${input.reportScore}`,
    });

    return;
  }

  const { error } = await supabaseAdmin
    .from("qr_x_entries")
    .update({
      report_count: input.reportCount,
      report_score: input.reportScore,
      moderation_status: "ok",
      updated_at: nowIso,
    })
    .eq("id", input.qrxId);

  if (error) {
    console.warn("report score update failed:", error.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const qrxId = String(body?.qrxId || "").trim();
    const reason = normalizeReason(body?.reason);
    const description = String(body?.description || "").trim();
    const reporterEmail = cleanEmail(body?.reporterEmail);
    const reporterFingerprint = createReporterFingerprint(req, reporterEmail);
    const baseReportWeight = getReportWeight(reason, reporterEmail);
    const descriptionHash = createDescriptionHash(description);

    if (!qrxId || !isUuid(qrxId)) {
      return Response.json({ error: "Ungültige QR-X-ID" }, { status: 400 });
    }

    if (description.length < 20) {
      return Response.json(
        { error: "Bitte beschreibe das Problem mit mindestens 20 Zeichen." },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return Response.json(
        { error: "Die Beschreibung ist zu lang. Maximal 2000 Zeichen." },
        { status: 400 }
      );
    }

    const { data: qrx, error: qrxError } = await supabaseAdmin
      .from("qr_x_entries")
      .select("id, owner_user_id, title, company_name, suspended")
      .eq("id", qrxId)
      .maybeSingle();

    if (qrxError || !qrx) {
      return Response.json(
        { error: "QR-X wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const { data: existingReports, error: existingReportsError } = await supabaseAdmin
      .from("support_tickets")
      .select("reporter_fingerprint, report_weight, description_hash, created_at")
      .eq("qrx_id", qrx.id)
      .eq("problem_type", "qrx_report");

    if (existingReportsError) {
      return Response.json(
        {
          error: "Meldungen konnten nicht geprüft werden.",
          details: existingReportsError.message,
        },
        { status: 500 }
      );
    }

    const alreadyReported = (existingReports ?? []).some(
      (item) => item.reporter_fingerprint === reporterFingerprint
    );

    if (alreadyReported) {
      return Response.json(
        {
          error:
            "Für diesen QR-X wurde von diesem Gerät bzw. dieser E-Mail bereits eine Meldung abgegeben.",
        },
        { status: 429 }
      );
    }

    const {
      adjustedWeight: reportWeight,
      spamReasons,
      recentReportCount,
      duplicateDescriptionCount,
    } = adjustReportWeightForSpam({
      baseWeight: baseReportWeight,
      existingReports: existingReports ?? [],
      descriptionHash,
    });

    const { reportCount, reportScore } = calculateUniqueReportStats(
      existingReports ?? [],
      reporterFingerprint,
      reportWeight
    );

    const ticketNumber = await nextTicketNumber();
    const reasonLabel = REASON_LABELS[reason];
    const publicQrxUrl = `https://mioseg-qr.com/qrx/${qrx.id}`;

    const fullDescription = [
      "Öffentliche QR-X Meldung",
      `Grund: ${reasonLabel}`,
      `Basis-Gewichtung: ${baseReportWeight}`,
      `Tatsächliche Gewichtung: ${reportWeight}`,
      `Spam-/Cluster-Hinweis: ${spamReasons.length > 0 ? spamReasons.join(" | ") : "unauffällig"}`,
      `Meldungen im 2-Minuten-Fenster: ${recentReportCount}`,
      `Gleiche Beschreibung bisher: ${duplicateDescriptionCount}`,
      `Meldungen eindeutig: ${reportCount}`,
      `Melde-Score: ${reportScore}`,
      `QR-X Titel: ${qrx.title || "Ohne Titel"}`,
      qrx.company_name ? `Firma: ${qrx.company_name}` : null,
      `QR-X ID: ${qrx.id}`,
      `QR-X öffnen: ${publicQrxUrl}`,
      reporterEmail
        ? `Reporter E-Mail: ${reporterEmail}`
        : "Reporter E-Mail: nicht angegeben",
      "",
      "Beschreibung:",
      description,
    ]
      .filter(Boolean)
      .join("\n");

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: qrx.owner_user_id,
        qrx_id: qrx.id,
        problem_type: "qrx_report",
        status: "open",
        title: `QR-X Meldung: ${reasonLabel}`,
        description: fullDescription,
        report_reason: reason,
        reporter_email: reporterEmail,
        reporter_fingerprint: reporterFingerprint,
        report_weight: reportWeight,
        description_hash: descriptionHash,
      })
      .select("*")
      .single();

    if (ticketError) {
      return Response.json(
        {
          error: "Meldung konnte nicht gespeichert werden.",
          details: ticketError.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: "qrx_report_created",
      targetUserId: qrx.owner_user_id,
      qrxId: qrx.id,
      note: `${ticketNumber}: QR-X Meldung (${reasonLabel}), Gewicht: ${reportWeight}, Score: ${reportScore}${spamReasons.length > 0 ? `, Cluster: ${spamReasons.join(" | ")}` : ""}`,
    });

    await updateQrxModerationState({
      qrxId: qrx.id,
      ownerUserId: qrx.owner_user_id,
      currentSuspended: qrx.suspended,
      reportCount,
      reportScore,
      reasonLabel,
    });

    return Response.json({
      ok: true,
      ticketNumber,
      ticketId: ticket.id,
      qrxId: qrx.id,
      qrxUrl: publicQrxUrl,
      reportCount,
      reportScore,
      baseReportWeight,
      reportWeight,
      spamReasons,
      recentReportCount,
      duplicateDescriptionCount,
      moderationStatus:
        reportScore >= AUTO_SUSPEND_SCORE_THRESHOLD
          ? "auto_suspended"
          : reportScore >= FLAG_SCORE_THRESHOLD
            ? "flagged"
            : "ok",
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
