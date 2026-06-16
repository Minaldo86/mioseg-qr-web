import type { CSSProperties } from "react";
import styles from "./page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import TrackViewClient from "./TrackViewClient";
import QrxReportForm from "./QrxReportForm";
import QrxPasswordGate from "./QrxPasswordGate";

type NewsItem = { text: string; createdAt: string };

type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
  icon: string;
}> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🏥" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "▦" },
];

function getBusinessCategoryMeta(value: string | null | undefined) {
  if (!value) return null;
  return BUSINESS_CATEGORY_OPTIONS.find((item) => item.value === value) ?? null;
}

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string;
  description: string | null;
  news: NewsItem[] | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  logo_url: string | null;
  type: "normal" | "business" | null;
  category: string | null;
  verified: boolean | null;
  cover_image_url: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  company_name: string | null;
  suspended: boolean | null;
  suspended_reason: string | null;
  deleted_at: string | null;
  deleted_reason: string | null;
  deleted_by_admin: boolean | null;
  password_protected: boolean | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes?: number | null;
};

type TransferHistoryItem = {
  id?: string;
  transfer_id?: string;
  qrx_id?: string;
  status?: string;
  created_at?: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  from_user_id?: string | null;
  from_name?: string | null;
  to_user_id?: string | null;
  to_name?: string | null;
  recipient_email?: string | null;
};

type SearchParams = Record<string, string | string[] | undefined>;

function getFirst(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

function toErrorMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function normalizeQrxId(id: string): string {
  let v = String(id || "").trim();
  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }
  if (v.startsWith("qrx:")) v = v.slice(4);
  return v;
}

function isProbablyMobile(ua: string | null): boolean {
  if (!ua) return false;
  const u = ua.toLowerCase();
  return /android|iphone|ipad|ipod|mobile|tablet/.test(u);
}

function normalizeWebsite(url: string | null | undefined): string | null {
  const trimmed = String(url || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeNavigation(value: string | null | undefined): string | null {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function formatNumber(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Math.max(0, numberValue));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];
  return raw
    .filter((item) => typeof item?.text === "string" && item.text.trim().length > 0)
    .map((item, index) => ({
      id: `${item.createdAt ?? "news"}-${index}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function QrxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const debug = getFirst(sp.debug) === "1";
  const adminKey = getFirst(sp.adminKey);
  const hasAdminAccess =
    !!process.env.QRX_ADMIN_ACCESS_KEY &&
    adminKey === process.env.QRX_ADMIN_ACCESS_KEY;

  const qrxId = normalizeQrxId(id);
  const supabase = createSupabaseServerClient();

  const { data: entry, error: entryErr } = await supabase
    .from("qr_x_entries")
    .select(`
      id,
      owner_user_id,
      title,
      description,
      news,
      location_name,
      location_lat,
      location_lng,
      logo_url,
      type,
      category,
      verified,
      cover_image_url,
      cta_phone,
      cta_website,
      cta_email,
      cta_navigation,
      company_name,
      suspended,
      suspended_reason,
      deleted_at,
      deleted_reason,
      deleted_by_admin,
      password_protected,
      views_total,
      follower_count,
      created_at
    `)
    .eq("id", qrxId)
    .maybeSingle()
    .returns<QrxEntry>();

  const { data: media, error: mediaErr } = await supabase
    .from("qr_x_media")
    .select("id, qrx_id, type, url, filename, bytes")
    .eq("qrx_id", qrxId)
    .returns<QrxMedia[]>();

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const { count: saveCountRaw } = await supabase
    .from("qrx_saves")
    .select("*", { count: "exact", head: true })
    .eq("qrx_id", qrxId);

  const { data: savedRow } = currentUserId
    ? await supabase
        .from("qrx_saves")
        .select("qrx_id")
        .eq("qrx_id", qrxId)
        .eq("user_id", currentUserId)
        .maybeSingle()
    : { data: null };

  const isOwner = Boolean(entry?.owner_user_id && currentUserId && entry.owner_user_id === currentUserId);

  const { data: transferHistoryRaw } = isOwner
    ? await supabase.rpc("get_qrx_transfer_history", { p_qrx_id: qrxId })
    : { data: [] };

  async function toggleFollowAction() {
    "use server";

    const actionSupabase = createSupabaseServerClient();
    const { data: actionUserData } = await actionSupabase.auth.getUser();
    const actionUserId = actionUserData.user?.id ?? null;

    if (!actionUserId) return;

    const { data: existing } = await actionSupabase
      .from("qrx_saves")
      .select("qrx_id")
      .eq("qrx_id", qrxId)
      .eq("user_id", actionUserId)
      .maybeSingle();

    if (existing) {
      await actionSupabase
        .from("qrx_saves")
        .delete()
        .eq("qrx_id", qrxId)
        .eq("user_id", actionUserId);
    } else {
      await actionSupabase
        .from("qrx_saves")
        .upsert({ qrx_id: qrxId, user_id: actionUserId }, { onConflict: "qrx_id,user_id" });
    }

    revalidatePath(`/qrx/${qrxId}`);
  }

  const h = await headers();
  const ua = h.get("user-agent");
  const showDownloadHint = isProbablyMobile(ua);

  const debugPayload = {
    idParam: id,
    qrxId,
    entryFound: !!entry,
    entryErr: toErrorMessage(entryErr),
    suspended: entry?.suspended ?? null,
    suspendedReason: entry?.suspended_reason ?? null,
    deletedAt: entry?.deleted_at ?? null,
    deletedReason: entry?.deleted_reason ?? null,
    deletedByAdmin: entry?.deleted_by_admin ?? null,
    passwordProtected: entry?.password_protected ?? null,
    hasAdminAccess,
    mediaCount: (media ?? []).length,
    mediaErr: toErrorMessage(mediaErr),
    currentUserId,
    saveCount: saveCountRaw ?? entry?.follower_count ?? 0,
    hasSaved: Boolean(savedRow),
    env: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      runtime: "nodejs",
    },
  };

  if (entryErr || !entry) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.sub}>QR-X wurde nicht gefunden oder wurde gelöscht.</p>
          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  if (entry.deleted_at) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>QR-X nicht verfügbar</h1>
          <p className={styles.sub}>
            Dieser QR-X ist nicht mehr verfügbar.
          </p>

          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  if (entry.suspended === true) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>QR-X gesperrt</h1>
          <p className={styles.sub}>
            Dieser QR-X wurde vorübergehend deaktiviert und ist aktuell nicht verfügbar.
          </p>

          {entry.suspended_reason?.trim() ? (
            <p className={styles.sub}>Grund: {entry.suspended_reason}</p>
          ) : null}

          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  const images: QrxMedia[] = (media ?? []).filter((m) => m.type === "image");
  const files: QrxMedia[] = (media ?? []).filter((m) => m.type === "file");

  const isBusiness = entry.type === "business";
  const hasWebsite = !!entry.cta_website?.trim();
  const hasPhone = !!entry.cta_phone?.trim();
  const hasEmail = !!entry.cta_email?.trim();
  const hasNavigation = !!entry.cta_navigation?.trim();

  const companyName = entry.company_name?.trim() || entry.title;
  const logoUrl = entry.logo_url?.trim() || null;
  const coverUrl = entry.cover_image_url?.trim() || null;

  const galleryImages = images.filter((img) => {
    if (!img.url) return false;
    if (logoUrl && img.url === logoUrl) return false;
    if (coverUrl && img.url === coverUrl) return false;
    return true;
  });

  const wantSave = getFirst(sp.save) === "1";
  const deepLink = wantSave ? `miosegqr://qrx/${qrxId}?save=1` : `miosegqr://qrx/${qrxId}`;
  const fallbackUrl = `/get-app?from=${encodeURIComponent(`/qrx/${qrxId}${wantSave ? "?save=1" : ""}`)}`;
  const websiteUrl = normalizeWebsite(entry.cta_website);
  const navigationUrl = normalizeNavigation(entry.cta_navigation);
  const phoneUrl = entry.cta_phone?.trim() ? `tel:${entry.cta_phone.trim()}` : null;
  const emailUrl = entry.cta_email?.trim() ? `mailto:${entry.cta_email.trim()}` : null;
  const categoryMeta = getBusinessCategoryMeta(entry.category);
  const newsItems = normalizeNewsItems(entry.news);
  const transferHistory = ((transferHistoryRaw ?? []) as TransferHistoryItem[]).sort((a, b) => {
    const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
  const totalMediaCount = (media ?? []).length;
  const followerCount = saveCountRaw ?? entry.follower_count ?? 0;
  const publicQrxUrl = `https://www.mioseg-qr.com/qrx/${qrxId}`;
  const publicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&margin=28&data=${encodeURIComponent(publicQrxUrl)}`;

  return (
    <main className={styles.page}>
      <TrackViewClient qrxId={qrxId} />

      <QrxPasswordGate qrxId={qrxId} enabled={entry.password_protected === true && !hasAdminAccess}>
        {/* 1. Hero: nur Identität – keine Aktionen und keine Beschreibung */}
        {!isBusiness ? (
          <div className={styles.header}>
            <div>
              <div style={phaseBadgeRowStyle}>
                <span style={phaseCategoryBadgeStyle}>⌗ Normaler QR-X</span>
                {categoryMeta ? (
                  <span style={phaseCategoryBadgeStyle}>{categoryMeta.icon} {categoryMeta.label}</span>
                ) : null}
                {entry.verified ? <span style={phaseVerifiedSoftBadgeStyle}>✓ Verifiziert</span> : null}
              </div>
              <h1 className={styles.title}>{companyName}</h1>
            </div>
          </div>
        ) : (
          <div className={styles.businessHero}>
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.businessHeroCover} src={coverUrl} alt="Cover" />
            ) : (
              <div className={styles.businessHeroCoverFallback} />
            )}

            <div className={styles.businessHeroOverlay} />

            <div className={styles.businessHeroTopBar}>
              {entry.verified ? (
                <div className={styles.businessVerifiedBadge}>
                  <span className={styles.businessVerifiedDot}>●</span>
                  VERIFIED
                </div>
              ) : null}
            </div>

            <div className={styles.businessHeroContent}>
              {logoUrl ? (
                <div className={styles.businessLogoFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.businessLogo} src={logoUrl} alt="Logo" />
                </div>
              ) : null}

              <h1 className={styles.businessCompanyName}>{companyName}</h1>

              <div style={phaseBadgeRowStyle}>
                <span style={phaseCategoryBadgeStyle}>🏢 Business QR-X</span>
                {categoryMeta ? (
                  <span style={phaseCategoryBadgeStyle}>{categoryMeta.icon} {categoryMeta.label}</span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var btn = document.getElementById("openAppBtn");
  if(!btn) return;

  btn.addEventListener("click", function(e){
    var href = btn.getAttribute("href");
    var fallback = btn.getAttribute("data-fallback");
    if(!href) return;

    try { window.location.href = href; } catch(e){}

    setTimeout(function(){
      try { window.location.href = fallback; } catch(e){}
    }, 1200);

    e.preventDefault();
  });
})();`.trim(),
          }}
        />

        {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}

        {/* 2. Statistiken */}
        <section className={styles.section}>
          <div style={phaseAppStatsRowStyle}>
            <div style={phaseAppStatPillStyle}>
              <span style={phaseAppStatIconStyle}>👥</span>
              <strong>{formatNumber(followerCount)}</strong>
              <small>Follower</small>
            </div>
            <div style={phaseAppStatPillStyle}>
              <span style={phaseAppStatIconStyle}>🖼️</span>
              <strong>{formatNumber(totalMediaCount)}</strong>
              <small>Medien</small>
            </div>
            <div style={phaseAppStatPillStyle}>
              <span style={phaseAppStatIconStyle}>📰</span>
              <strong>{formatNumber(newsItems.length)}</strong>
              <small>Updates</small>
            </div>
            <div style={phaseAppStatPillStyle}>
              <span style={phaseAppStatIconStyle}>👁️</span>
              <strong>{formatNumber(entry.views_total)}</strong>
              <small>Aufrufe</small>
            </div>
          </div>
        </section>

        {/* 3. Aktionen */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>Aktionen</h2>
              <p className={styles.muted} style={{ margin: 0 }}>Öffnen, folgen oder direkt Kontakt aufnehmen.</p>
            </div>
          </div>

          <div style={phaseAppActionGridStyle}>
            <a className={isBusiness ? styles.businessOpenBtn : styles.openBtn} href={deepLink} data-fallback={fallbackUrl} id="openAppBtn">
              App öffnen
            </a>

            {currentUserId ? (
              <form action={toggleFollowAction} style={{ display: "contents" }}>
                <button type="submit" style={phasePrimaryButtonStyle}>
                  {savedRow ? "✓ Bereits gefolgt" : "+ Folgen"}
                </button>
              </form>
            ) : (
              <a href={`/login?next=${encodeURIComponent(`/qrx/${qrxId}`)}`} style={phasePrimaryLinkStyle}>
                Folgen
              </a>
            )}

            {websiteUrl ? <a style={phaseSecondaryLinkStyle} href={websiteUrl} target="_blank" rel="noreferrer">🌐 Website</a> : null}
            {phoneUrl ? <a style={phaseSecondaryLinkStyle} href={phoneUrl}>☎️ Anrufen</a> : null}
            {emailUrl ? <a style={phaseSecondaryLinkStyle} href={emailUrl}>✉️ E-Mail</a> : null}
            {navigationUrl ? <a style={phaseSecondaryLinkStyle} href={navigationUrl} target="_blank" rel="noreferrer">🧭 Navigation</a> : null}
          </div>

          {showDownloadHint ? (
            <p className={styles.muted} style={{ marginTop: 12 }}>
              App nicht installiert? <a className={styles.downloadLink} href={fallbackUrl}>Hier herunterladen</a>
            </p>
          ) : null}
        </section>

        {/* 4. Titel & Beschreibung */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>Titel & Beschreibung</h2>
              <p className={styles.muted} style={{ margin: 0 }}>Die wichtigsten Informationen zu diesem QR-X.</p>
            </div>
          </div>

          <div style={phaseTitleBoxStyle}>
            <div>
              <span style={phaseSmallBadgeStyle}>Titel</span>
              <h3 style={phaseTitleTextStyle}>{entry.title?.trim() || companyName}</h3>
            </div>

            <div>
              <span style={phaseSmallBadgeStyle}>Beschreibung</span>
              <p style={phaseDescriptionTextStyle}>
                {entry.description?.trim() ? entry.description : "Keine Beschreibung vorhanden."}
              </p>
            </div>
          </div>
        </section>

        {/* 5. News & Updates */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>News & Updates</h2>
              <p className={styles.muted} style={{ margin: 0 }}>Aktuelle Informationen dieses QR-X.</p>
            </div>
            <span style={phaseSmallBadgeStyle}>{formatNumber(newsItems.length)} Updates</span>
          </div>

          {newsItems.length === 0 ? (
            <p className={styles.muted}>Noch keine News vorhanden.</p>
          ) : (
            <div style={phaseNewsListStyle}>
              {newsItems.map((n) => (
                <article key={n.id} style={phaseNewsCardStyle}>
                  <div style={phaseNewsDateStyle}>{new Date(n.createdAt).toLocaleString("de-DE")}</div>
                  <div style={phaseNewsTextStyle}>{n.text}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 6. Medien */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>Medien</h2>
              <p className={styles.muted} style={{ margin: 0 }}>Bilder und Dateien dieses QR-X.</p>
            </div>
            <span style={phaseSmallBadgeStyle}>{formatNumber(totalMediaCount)} Medien</span>
          </div>

          {galleryImages.length === 0 ? (
            <p className={styles.muted}>Keine Bilder vorhanden.</p>
          ) : (
            <div className={styles.grid}>
              {galleryImages.map((img) => (
                <a key={img.id} className={styles.imgCard} href={img.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.img} src={img.url} alt={img.filename} />
                  <div className={styles.caption}>{img.filename}</div>
                </a>
              ))}
            </div>
          )}

          {files.length > 0 ? (
            <div style={{ marginTop: 18 }}>
              <h3 style={phaseSubSectionTitleStyle}>Dateien</h3>
              <div className={styles.list}>
                {files.map((f) => (
                  <a key={f.id} className={styles.fileRow} href={f.url} target="_blank" rel="noreferrer">
                    <span className={styles.bullet}>•</span>
                    <span className={styles.fileName}>{f.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* 7. Standort */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>Standort</h2>
              <p className={styles.muted} style={{ margin: 0 }}>Ort und Navigation.</p>
            </div>
          </div>

          <div style={phaseActionBoxStyle}>
            <p className={styles.text} style={{ marginTop: 0 }}>
              {entry.location_name?.trim() ? entry.location_name : "Kein Ort hinterlegt."}
            </p>
            <div style={phaseButtonRowStyle}>
              {entry.location_lat != null && entry.location_lng != null ? (
                <a
                  style={phaseSecondaryLinkStyle}
                  href={`https://www.google.com/maps?q=${entry.location_lat},${entry.location_lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps
                </a>
              ) : null}
              {isBusiness && navigationUrl ? (
                <a style={phaseSecondaryLinkStyle} href={navigationUrl} target="_blank" rel="noreferrer">
                  Navigation öffnen
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* 8. QR-X Bild */}
        <section className={styles.section}>
          <div style={phaseSectionHeaderStyle}>
            <div>
              <h2 className={styles.h2}>QR-X Bild</h2>
              <p className={styles.muted} style={{ margin: 0 }}>
                Lade den öffentlichen QR-Code als PNG herunter oder öffne den direkten Link.
              </p>
            </div>
          </div>

          <div style={phaseQrSectionStyle}>
            <div style={phaseQrWrapStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicQrUrl} alt="QR-X Code" style={phaseQrImageStyle} />
            </div>
            <div style={phaseButtonRowStyle}>
              <a href={publicQrUrl} download={`mioseg-qrx-${qrxId}.png`} style={phasePrimaryLinkStyle}>
                QR-Code herunterladen
              </a>
              <a href={publicQrxUrl} style={phaseSecondaryLinkStyle}>
                Link öffnen
              </a>
            </div>
          </div>
        </section>

        {/* 9. Transfer – nur Besitzer */}
        {isOwner ? (
          <section className={styles.section}>
            <div style={phaseSectionHeaderStyle}>
              <div>
                <h2 className={styles.h2}>Transfer</h2>
                <p className={styles.muted} style={{ margin: 0 }}>Verlauf der QR-X-Übertragungen.</p>
              </div>
              <span style={phaseSmallBadgeStyle}>{formatNumber(transferHistory.length)} Einträge</span>
            </div>

            {transferHistory.length === 0 ? (
              <p className={styles.muted}>Noch kein Transfer-Verlauf vorhanden.</p>
            ) : (
              <div style={phaseTransferListStyle}>
                {transferHistory.map((item, index) => (
                  <div key={item.id ?? item.transfer_id ?? `${item.created_at}-${index}`} style={phaseTransferCardStyle}>
                    <div style={phaseTransferTopStyle}>
                      <strong>{item.status ?? "Transfer"}</strong>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {item.recipient_email ? <span>Empfänger: {item.recipient_email}</span> : null}
                    {item.from_name ? <span>Von: {item.from_name}</span> : null}
                    {item.to_name ? <span>An: {item.to_name}</span> : null}
                    {item.accepted_at ? <span>Angenommen: {formatDate(item.accepted_at)}</span> : null}
                    {item.expires_at ? <span>Ablauf: {formatDate(item.expires_at)}</span> : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* 10. Inhalt melden */}
        <section className={styles.section}>
          <QrxReportForm qrxId={qrxId} />
        </section>

        <div className={styles.footer}>mioseg qr • QR-X Web</div>
      </QrxPasswordGate>
    </main>
  );
}

const phaseBadgeRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const phaseCategoryBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(59,130,246,0.18)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(147,197,253,0.28)",
};

const phaseSubtitleStyle: CSSProperties = {
  marginTop: 8,
  color: "#bfdbfe",
  fontSize: 16,
  fontWeight: 950,
};

const phaseStatsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const phaseStatCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const phaseStatIconStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 20,
};

const phaseStatValueStyle: CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 950,
};

const phaseStatLabelStyle: CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const phaseActionsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const phaseActionBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  gap: 14,
};

const phasePrimaryButtonStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  border: 0,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 950,
  cursor: "pointer",
};

const phasePrimaryLinkStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 950,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const phaseSecondaryLinkStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  padding: "0 18px",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  fontWeight: 950,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(255,255,255,0.12)",
};

const phaseSmallInfoStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const phaseQrWrapStyle: CSSProperties = {
  width: 190,
  height: 190,
  borderRadius: 24,
  padding: 12,
  background: "#ffffff",
  justifySelf: "center",
  boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
};

const phaseQrImageStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  borderRadius: 16,
};

const phaseButtonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const phaseTransferListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const phaseTransferCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 800,
};

const phaseTransferTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#ffffff",
};


const phaseAppLikeProfileCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(15,23,42,0.74))",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
};

const phaseAppProfileTopStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const phaseAppAvatarStyle: CSSProperties = {
  width: 86,
  height: 86,
  borderRadius: 28,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  display: "grid",
  placeItems: "center",
  color: "#ffffff",
  fontSize: 34,
  fontWeight: 950,
  flex: "0 0 auto",
};

const phaseAppAvatarImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const phaseAppProfileInfoStyle: CSSProperties = {
  flex: 1,
  minWidth: 240,
};

const phaseAppTitleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 32,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const phaseAppSubtitleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#93c5fd",
  fontSize: 15,
  fontWeight: 900,
};

const phaseAppDescriptionStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#cbd5e1",
  lineHeight: 1.65,
  fontSize: 15,
  fontWeight: 700,
  whiteSpace: "pre-wrap",
};

const phaseAppStatsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
  marginTop: 18,
};

const phaseAppStatPillStyle: CSSProperties = {
  borderRadius: 20,
  padding: "12px 10px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  placeItems: "center",
  gap: 5,
  color: "#ffffff",
  textAlign: "center",
};

const phaseAppStatIconStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 17,
};

const phaseAppActionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginTop: 18,
};

const phaseSectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14,
};

const phaseSmallBadgeStyle: CSSProperties = {
  minHeight: 30,
  borderRadius: 999,
  padding: "0 10px",
  display: "inline-flex",
  alignItems: "center",
  background: "rgba(255,255,255,0.07)",
  color: "#cbd5e1",
  border: "1px solid rgba(255,255,255,0.1)",
  fontSize: 12,
  fontWeight: 900,
};

const phaseNewsListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const phaseNewsCardStyle: CSSProperties = {
  borderRadius: 20,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const phaseNewsDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 950,
};

const phaseNewsTextStyle: CSSProperties = {
  color: "#dbeafe",
  lineHeight: 1.65,
  whiteSpace: "pre-wrap",
  fontWeight: 760,
};

const phaseSubSectionTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const phaseVerifiedSoftBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(34,197,94,0.16)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(134,239,172,0.24)",
};

const phaseTitleBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  gap: 18,
};

const phaseTitleTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#ffffff",
  fontSize: 28,
  lineHeight: 1.12,
  fontWeight: 950,
  letterSpacing: "-0.035em",
};

const phaseDescriptionTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#dbeafe",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  fontWeight: 740,
};

const phaseQrSectionStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  gap: 16,
  justifyItems: "center",
};
