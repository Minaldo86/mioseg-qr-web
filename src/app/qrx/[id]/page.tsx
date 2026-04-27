import styles from "./page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import TrackViewClient from "./TrackViewClient";
import QrxReportForm from "./QrxReportForm";

type NewsItem = { text: string; createdAt: string };

type QrxEntry = {
  id: string;
  title: string;
  description: string | null;
  news: NewsItem[] | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  logo_url: string | null;
  type: "normal" | "business" | null;
  verified: boolean | null;
  cover_image_url: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_navigation: string | null;
  company_name: string | null;
  suspended: boolean | null;
  suspended_reason: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes?: number | null;
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

  const qrxId = normalizeQrxId(id);
  const supabase = createSupabaseServerClient();

  const { data: entry, error: entryErr } = await supabase
    .from("qr_x_entries")
    .select(`
      id,
      title,
      description,
      news,
      location_name,
      location_lat,
      location_lng,
      logo_url,
      type,
      verified,
      cover_image_url,
      cta_phone,
      cta_website,
      cta_navigation,
      company_name,
      suspended,
      suspended_reason
    `)
    .eq("id", qrxId)
    .maybeSingle()
    .returns<QrxEntry>();

  const { data: media, error: mediaErr } = await supabase
    .from("qr_x_media")
    .select("id, qrx_id, type, url, filename, bytes")
    .eq("qrx_id", qrxId)
    .returns<QrxMedia[]>();

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
    mediaCount: (media ?? []).length,
    mediaErr: toErrorMessage(mediaErr),
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

  return (
    <main className={styles.page}>
      <TrackViewClient qrxId={qrxId} />

      {!isBusiness ? (
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{entry.title}</h1>
            <p className={styles.sub}>Aktuelle Informationen zum QR-X</p>
          </div>

          <div className={styles.ctaCol}>
            <a className={styles.openBtn} href={deepLink} data-fallback={fallbackUrl} id="openAppBtn">
              In App öffnen
            </a>

            {showDownloadHint && (
              <div className={styles.appHint}>
                App nicht installiert?{" "}
                <a className={styles.downloadLink} href={fallbackUrl}>
                  Hier herunterladen
                </a>
              </div>
            )}
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
            <div className={styles.businessHeroTopLeft}>
              <a className={styles.businessOpenBtn} href={deepLink} data-fallback={fallbackUrl} id="openAppBtn">
                In App öffnen
              </a>
            </div>

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

            {(hasWebsite || hasPhone) && (
              <div className={styles.businessHeroActions}>
                {websiteUrl ? (
                  <a className={styles.businessActionBtn} href={websiteUrl} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : null}

                {phoneUrl ? (
                  <a className={styles.businessActionBtn} href={phoneUrl}>
                    Anrufen
                  </a>
                ) : null}
              </div>
            )}

            {showDownloadHint && (
              <div className={styles.businessAppHint}>
                App nicht installiert?{" "}
                <a className={styles.downloadLink} href={fallbackUrl}>
                  Hier herunterladen
                </a>
              </div>
            )}
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

      {!isBusiness && entry.logo_url && (
        <div className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src={entry.logo_url} alt="Logo" />
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>Beschreibung</h2>
        <p className={styles.text}>
          {entry.description?.trim() ? entry.description : "Keine Beschreibung vorhanden."}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Bilder</h2>
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
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Dateien</h2>
        {files.length === 0 ? (
          <p className={styles.muted}>Keine Dateien vorhanden.</p>
        ) : (
          <div className={styles.list}>
            {files.map((f) => (
              <a key={f.id} className={styles.fileRow} href={f.url} target="_blank" rel="noreferrer">
                <span className={styles.bullet}>•</span>
                <span className={styles.fileName}>{f.filename}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Standort</h2>
        <p className={styles.text}>
          {entry.location_name?.trim() ? entry.location_name : "Kein Ort hinterlegt."}
        </p>

        <div className={styles.mapBtnRow}>
          {entry.location_lat != null && entry.location_lng != null && (
            <a
              className={styles.mapBtn}
              href={`https://www.google.com/maps?q=${entry.location_lat},${entry.location_lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Standort in Google Maps öffnen
            </a>
          )}

          {isBusiness && navigationUrl && (
            <a className={styles.mapBtn} href={navigationUrl} target="_blank" rel="noreferrer">
              Navigation öffnen
            </a>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>News & Aktualisierungen</h2>

        {(entry.news ?? []).length === 0 ? (
          <p className={styles.muted}>Noch keine News vorhanden.</p>
        ) : (
          <div className={styles.newsBox}>
            {(entry.news ?? []).map((n, idx) => (
              <div key={`${n.createdAt}-${idx}`} className={styles.newsRow}>
                <div className={styles.newsText}>{n.text}</div>
                <div className={styles.newsDate}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

    <section className={styles.section}>
  <QrxReportForm qrxId={qrxId} />
</section>

      <div className={styles.footer}>mioseg qr • QR-X Web</div>
    </main>
  );
}
