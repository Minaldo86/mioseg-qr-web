import { supabaseAdmin } from "../../../../lib/supabase-admin";

const QRX_VERIFICATION_BUCKET = "qrx-verification-documents";
const DEFAULT_SITE_URL = "https://mioseg-qr.com";

type VerificationRequestRow = {
  id: string;
  qrx_id: string | null;
  owner_user_id: string | null;
  status: string | null;
  document_filename: string | null;
  document_type: string | null;
  document_path: string | null;
  created_at: string | null;
  qr_x_entries?: {
    title?: string | null;
    company_name?: string | null;
    category?: string | null;
    verified?: boolean | null;
  } | {
    title?: string | null;
    company_name?: string | null;
    category?: string | null;
    verified?: boolean | null;
  }[] | null;
};

function buildWaitingInfo(createdAt: string | null) {
  if (!createdAt) {
    return {
      waiting_days: 0,
      waiting_label: "Wartezeit unbekannt",
    };
  }

  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const waitingDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (waitingDays <= 0) {
    return {
      waiting_days: 0,
      waiting_label: "Seit heute in Prüfung",
    };
  }

  return {
    waiting_days: waitingDays,
    waiting_label: `${waitingDays} ${waitingDays === 1 ? "Tag" : "Tage"} in Prüfung`,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("qrx_verification_requests")
      .select(`
        id,
        qrx_id,
        owner_user_id,
        status,
        document_filename,
        document_type,
        document_path,
        created_at,
        qr_x_entries:qrx_id (
          id,
          title,
          company_name,
          category,
          verified
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const siteBaseUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

    const enriched = await Promise.all(
      (data ?? []).map(async (item: VerificationRequestRow) => {
        let signedDocumentUrl: string | null = null;

        if (item.document_path) {
          const { data: signed, error: signedError } = await supabaseAdmin.storage
            .from(QRX_VERIFICATION_BUCKET)
            .createSignedUrl(item.document_path, 60 * 60);

          if (!signedError) {
            signedDocumentUrl = signed?.signedUrl ?? null;
          }
        }

        const qrx = Array.isArray(item.qr_x_entries)
          ? item.qr_x_entries[0]
          : item.qr_x_entries;

        return {
          id: item.id,
          qrx_id: item.qrx_id,
          owner_user_id: item.owner_user_id,
          status: item.status,
          document_filename: item.document_filename,
          document_type: item.document_type,
          document_path: item.document_path,
          created_at: item.created_at,
          signed_document_url: signedDocumentUrl,
          qrx_title: qrx?.title ?? null,
          company_name: qrx?.company_name ?? null,
          category: qrx?.category ?? null,
          qrx_verified: qrx?.verified ?? null,
          qrx_web_url: item.qrx_id ? `${siteBaseUrl}/qrx/${item.qrx_id}` : null,
          ...buildWaitingInfo(item.created_at),
        };
      })
    );

    return Response.json(enriched);
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
