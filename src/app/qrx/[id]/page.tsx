import type { CSSProperties } from "react";
import styles from "./page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import TrackViewClient from "./TrackViewClient";
import QrxReportForm from "./QrxReportForm";
import QrxPasswordGate from "./QrxPasswordGate";
import QrxCodeCanvas from "./QrxCodeCanvas";

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
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "⚕️" },
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
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
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
          <p className={styles.sub}>Dieser QR-X ist nicht mehr verfügbar.</p>
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

  return (
    <main className={styles.page}>
      <TrackViewClient qrxId={qrxId} />

      <QrxPasswordGate qrxId={qrxId} enabled={entry.password_protected === true && !hasAdminAccess}>
        {/* 1. Hero */}
        {isBusiness ? (
          <section style={heroShellStyle}>
            <div style={heroCardStyle}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Cover" style={heroCoverImageStyle} />
              ) : (
                <div style={heroCoverFallbackStyle} />
              )}

              <div style={heroOverlayStyle} />

              {entry.verified ? (
                <div style={heroVerifiedBadgeStyle}>
                  <span style={heroVerifiedDotStyle}>✓</span>
                  VERIFIED
                </div>
              ) : null}

              <div style={heroTitleWrapStyle}>
                {logoUrl ? (
                  <div style={heroLogoFrameStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" style={heroLogoStyle} />
                  </div>
                ) : null}

                <h1 style={heroTitleStyle}>{companyName}</h1>
              </div>
            </div>
          </section>
        ) : (
          <section style={sectionCardStyle}>
            <div style={phaseBadgeRowStyle}>
              <span style={phaseCategoryBadgeStyle}>⌗ Normaler QR-X</span>
              {categoryMeta ? (
                <span style={phaseCategoryBadgeStyle}>
                  {categoryMeta.icon} {categoryMeta.label}
                </span>
              ) : null}
              {entry.verified ? <span style={phaseVerifiedSoftBadgeStyle}>✓ Verifiziert</span> : null}
            </div>
            <h1 style={normalHeroTitleStyle}>{companyName}</h1>
          </section>
        )}

        {entry.verified ? (
          <section style={verifiedNoticeStyle}>
            <div style={verifiedIconStyle}>✓</div>
            <div>
              <h2 style={verifiedTitleStyle}>Verifiziert</h2>
              <p style={verifiedTextStyle}>
                Dieses Business-QR-X wurde erfolgreich geprüft und ist verifiziert.
              </p>
            </div>
          </section>
        ) : null}

        {/* 2. Business-Profil */}
        <section style={sectionCardStyle}>
          <div style={profileHeaderStyle}>
            <span style={profileKickerStyle}>{isBusiness ? "BUSINESS PROFILE" : "QR-X PROFIL"}</span>
            {categoryMeta ? (
              <span style={profileCategoryPillStyle}>
                {categoryMeta.icon} {categoryMeta.label}
              </span>
            ) : null}
          </div>

          <div style={profileStatsStyle}>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(followerCount)}</strong>
              <span style={profileStatLabelStyle}>FOLLOWER</span>
            </div>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(totalMediaCount)}</strong>
              <span style={profileStatLabelStyle}>MEDIEN</span>
            </div>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(newsItems.length)}</strong>
              <span style={profileStatLabelStyle}>UPDATES</span>
            </div>
          </div>

          <div style={profileActionsStyle}>
            <a href={deepLink} data-fallback={fallbackUrl} id="openAppBtn" style={appButtonStyle}>
              App öffnen
            </a>

            {websiteUrl ? (
              <a style={actionChipStyle} href={websiteUrl} target="_blank" rel="noreferrer">
                🌐 Website
              </a>
            ) : null}

            {phoneUrl ? (
              <a style={actionChipStyle} href={phoneUrl}>
                ☎️ Anrufen
              </a>
            ) : null}

            {emailUrl ? (
              <a style={actionChipStyle} href={emailUrl}>
                ✉️ E-Mail
              </a>
            ) : null}

            {navigationUrl ? (
              <a style={actionChipStyle} href={navigationUrl} target="_blank" rel="noreferrer">
                🧭 Navigation
              </a>
            ) : null}
          </div>

          {showDownloadHint ? (
            <p className={styles.muted} style={{ marginTop: 14 }}>
              App nicht installiert?{" "}
              <a className={styles.downloadLink} href={fallbackUrl}>
                Hier herunterladen
              </a>
            </p>
          ) : null}
        </section>

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

        {/* 3. Titel */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Titel</h2>
          <p style={simpleTextStyle}>{entry.title?.trim() || companyName}</p>
        </section>

        {/* 4. Beschreibung */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Beschreibung</h2>
          <p style={descriptionTextStyle}>
            {entry.description?.trim() ? entry.description : "Keine Beschreibung vorhanden."}
          </p>
        </section>

        {/* 5. News / Updates */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>News / Updates</h2>

          {newsItems.length === 0 ? (
            <p style={mutedTextStyle}>Noch keine News vorhanden.</p>
          ) : (
            <div style={newsBoxStyle}>
              {newsItems.map((n, index) => (
  <article
    key={n.id}
    style={{
      ...newsRowStyle,
      borderBottom:
        index === newsItems.length - 1
          ? "none"
          : "1px solid rgba(65,84,103,0.6)",
    }}
  >
                  <div style={newsTextStyle}>{n.text}</div>
                  <div style={newsDateStyle}>{formatDate(n.createdAt)}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 6. Bilder */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Bilder</h2>

          {galleryImages.length === 0 ? (
            <p style={mutedTextStyle}>Keine Bilder vorhanden.</p>
          ) : (
            <div style={imageGridStyle}>
              {galleryImages.map((img) => (
                <a key={img.id} href={img.url} target="_blank" rel="noreferrer" style={imageItemStyle}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.filename} style={imageThumbStyle} />
                  <span style={imageCaptionStyle}>{img.filename}</span>
                  <span style={imageOpenHintStyle}>Zum Öffnen Bild antippen</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* 7. Dateien */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Dateien</h2>

          {files.length === 0 ? (
            <p style={mutedTextStyle}>–</p>
          ) : (
            <div style={fileListStyle}>
              {files.map((f) => (
                <a key={f.id} href={f.url} target="_blank" rel="noreferrer" style={fileRowStyle}>
                  <span>📄 {f.filename}</span>
                  <span>Öffnen</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* 8. Standort */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Ort</h2>
          <p style={simpleTextStyle}>{entry.location_name?.trim() ? entry.location_name : "Kein Ort hinterlegt."}</p>

          {entry.location_lat != null && entry.location_lng != null ? (
            <p style={coordinateTextStyle}>
              {entry.location_lat}, {entry.location_lng}
            </p>
          ) : null}

          <div style={mapButtonWrapStyle}>
            {entry.location_lat != null && entry.location_lng != null ? (
              <a
                style={wideSecondaryButtonStyle}
                href={`https://www.google.com/maps?q=${entry.location_lat},${entry.location_lng}`}
                target="_blank"
                rel="noreferrer"
              >
                🗺️ In Google Maps öffnen
              </a>
            ) : null}

            {isBusiness && navigationUrl ? (
              <a style={wideSecondaryButtonStyle} href={navigationUrl} target="_blank" rel="noreferrer">
                🧭 Navigation öffnen
              </a>
            ) : null}
          </div>
        </section>

        {/* 9. Transfer */}
        {isOwner ? (
          <section style={sectionCardStyle}>
            <h2 style={cardTitleStyle}>Transfer</h2>
            <p style={mutedTextStyle}>Verlauf und aktueller Transferstatus dieses QR-X.</p>

            {transferHistory.length === 0 ? (
              <div style={emptyTransferStyle}>↔ Noch kein Transfer vorhanden.</div>
            ) : (
              <div style={transferListStyle}>
                {transferHistory.map((item, index) => (
                  <div key={item.id ?? item.transfer_id ?? `${item.created_at}-${index}`} style={transferCardStyle}>
                    <div style={transferTopStyle}>
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

        {/* 10. Gefolgt */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>Gefolgt</h2>

          {isOwner ? (
            <>
              <p style={mutedTextStyle}>Du bist der Besitzer dieses QR-X.</p>
              <button type="button" disabled style={widePrimaryDisabledButtonStyle}>
                👑 Eigener QR-X
              </button>
            </>
          ) : currentUserId ? (
            <>
              <p style={mutedTextStyle}>
                {savedRow
                  ? "Dieser QR-X ist aktuell in deinen gespeicherten Einträgen."
                  : "Folge diesem QR-X, um ihn schneller wiederzufinden."}
              </p>

              <form action={toggleFollowAction}>
                <button type="submit" style={widePrimaryButtonStyle}>
                  {savedRow ? "🔖 Folgen beenden" : "🔖 Folgen"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p style={mutedTextStyle}>Melde dich an, um diesem QR-X zu folgen.</p>
              <a href={`/login?next=${encodeURIComponent(`/qrx/${qrxId}`)}`} style={widePrimaryLinkStyle}>
                + Folgen
              </a>
            </>
          )}

          <p style={centerInfoStyle}>
            Gespeichert von {formatNumber(followerCount)} Nutzer{Number(followerCount) === 1 ? "" : "n"}
          </p>
        </section>

        {/* 11. QR-X Code */}
        <section style={{ ...sectionCardStyle, textAlign: "center" }}>
          <QrxCodeCanvas
            value={publicQrxUrl}
            qrxId={qrxId}
            variant={isBusiness ? "business" : "normal"}
            logoSrc="/logo-white.png"
          />
        </section>

        {/* 12. Inhalt melden */}
        <section style={sectionCardStyle}>
          <QrxReportForm qrxId={qrxId} />
        </section>

        <div className={styles.footer}>mioseg qr • QR-X Web</div>
      </QrxPasswordGate>
    </main>
  );
}

const sectionCardStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 20px",
  borderRadius: 26,
  padding: 22,
  background: "#0D1728",
  border: "1px solid rgba(59, 130, 246, 0.18)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
};

const heroShellStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 20px",
};

const heroCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 26,
  minHeight: 316,
  background: "#0D1728",
  border: "1px solid rgba(59, 130, 246, 0.18)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
};

const heroCoverImageStyle: CSSProperties = {
  width: "100%",
  height: 316,
  objectFit: "cover",
  display: "block",
  filter: "brightness(0.72) blur(0.2px)",
};

const heroCoverFallbackStyle: CSSProperties = {
  minHeight: 316,
  background: "linear-gradient(135deg, #0D1728, #142236)",
};

const heroOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(6,12,21,0.08) 0%, rgba(6,12,21,0.3) 48%, rgba(6,12,21,0.82) 100%)",
};

const heroVerifiedBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  minHeight: 38,
  borderRadius: 999,
  padding: "0 16px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#C9A84F",
  color: "#ffffff",
  fontWeight: 800,
  letterSpacing: "0.02em",
  boxShadow: "0 10px 22px rgba(0,0,0,0.24)",
};

const heroVerifiedDotStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(15,23,42,0.22)",
  fontSize: 12,
};

const heroTitleWrapStyle: CSSProperties = {
  position: "absolute",
  left: 22,
  right: 22,
  bottom: 24,
  display: "grid",
  justifyItems: "center",
  gap: 10,
  textAlign: "center",
};

const heroLogoFrameStyle: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 22,
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid rgba(255,255,255,0.28)",
};

const heroLogoStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 800,
  textShadow: "0 8px 22px rgba(0,0,0,0.38)",
};

const normalHeroTitleStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1.1,
  fontWeight: 950,
};

const verifiedNoticeStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 20px",
  borderRadius: 24,
  padding: 20,
  background: "#06281F",
  border: "1px solid rgba(52,211,153,0.34)",
  display: "flex",
  alignItems: "center",
  gap: 18,
  boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
};

const verifiedIconStyle: CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 999,
  background: "#2BA36D",
  color: "#ffffff",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  fontSize: 20,
  flex: "0 0 auto",
};

const verifiedTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 800,
};

const verifiedTextStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(255,255,255,0.82)",
  lineHeight: 1.55,
  fontWeight: 400,
  fontSize: 16,
};

const profileHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  marginBottom: 30,
};

const profileKickerStyle: CSSProperties = {
  color: "#D4AF37",
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const profileCategoryPillStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  padding: "0 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.78)",
  display: "inline-flex",
  alignItems: "center",
  fontWeight: 700,
  fontSize: 14,
};

const profileStatsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const profileStatBoxStyle: CSSProperties = {
  minHeight: 92,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "grid",
  placeItems: "center",
  gap: 3,
  color: "#ffffff",
  textAlign: "center",
};

const profileStatValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 800,
};

const profileStatLabelStyle: CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const profileActionsStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 24,
};

const actionChipStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 999,
  padding: "0 18px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 15,
};

const appButtonStyle: CSSProperties = {
  ...actionChipStyle,
  background: "#ffffff",
  color: "#0f172a",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 22,
  lineHeight: 1.22,
  fontWeight: 800,
  letterSpacing: "-0.02em",
};


const simpleTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,255,255,0.86)",
  fontSize: 17,
  lineHeight: 1.55,
  fontWeight: 400,
};

const descriptionTextStyle: CSSProperties = {
  margin: "18px 0 0",
  color: "rgba(255,255,255,0.84)",
  fontSize: 16,
  lineHeight: 1.65,
  whiteSpace: "pre-wrap",
  fontWeight: 400,
};

const mutedTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,255,255,0.58)",
  fontSize: 15,
  lineHeight: 1.55,
};


const newsBoxStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 22,
  overflowY: "auto",
  overflowX: "hidden",
  maxHeight: 460,
  border: "1px solid rgba(65,84,103,0.75)",
  background: "rgba(255,255,255,0.025)",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(148,163,184,0.45) transparent",
  overscrollBehavior: "contain",
  paddingRight: 4,
};

const newsRowStyle: CSSProperties = {
  padding: "16px 18px",
};

const newsTextStyle: CSSProperties = {
  color: "rgba(255,255,255,0.86)",
  fontSize: 16,
  lineHeight: 1.55,
};

const newsDateStyle: CSSProperties = {
  marginTop: 8,
  color: "#8f9baa",
  fontSize: 14,
};

const imageGridStyle: CSSProperties = {
  marginTop: 22,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 22,
};

const imageItemStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: 8,
  color: "#9fc2ee",
  textDecoration: "none",
  textAlign: "center",
};

const imageThumbStyle: CSSProperties = {
  width: 112,
  height: 112,
  borderRadius: 18,
  objectFit: "cover",
  display: "block",
  boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
};

const imageCaptionStyle: CSSProperties = {
  color: "#aeb9c6",
  fontSize: 14,
  wordBreak: "break-word",
  maxWidth: 150,
};

const imageOpenHintStyle: CSSProperties = {
  color: "#9fc2ee",
  fontSize: 13,
  lineHeight: 1.2,
};

const fileListStyle: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 10,
};

const fileRowStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 18,
  padding: "0 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e5edf5",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  fontWeight: 850,
};

const coordinateTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#8f9baa",
  fontSize: 16,
  lineHeight: 1.55,
};

const mapButtonWrapStyle: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 10,
};

const widePrimaryButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 58,
  borderRadius: 18,
  border: 0,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 18,
};

const widePrimaryDisabledButtonStyle: CSSProperties = {
  ...widePrimaryButtonStyle,
  cursor: "default",
  opacity: 0.88,
};

const widePrimaryLinkStyle: CSSProperties = {
  width: "100%",
  minHeight: 58,
  borderRadius: 18,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const wideSecondaryButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 56,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "0 18px",
  background: "rgba(255,255,255,0.055)",
  color: "#ffffff",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 17,
};

const emptyTransferStyle: CSSProperties = {
  marginTop: 16,
  borderRadius: 18,
  padding: 18,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(65,84,103,0.75)",
  color: "#9aa7b5",
  fontSize: 17,
};

const transferListStyle: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 12,
};

const transferCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 800,
};

const transferTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#ffffff",
};

const centerInfoStyle: CSSProperties = {
  margin: "14px 0 0",
  textAlign: "center",
  color: "#9aa7b5",
  fontSize: 15,
};




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
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.78)",
  fontSize: 13,
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.08)",
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
