import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

type QrxEntry = {
  id: string;
  title: string;
  description: string | null;
  news: { text: string; createdAt: string }[] | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  logo_url: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: string; // "image" | "file"
  url: string;
  filename: string;
  bytes?: number | null;
};

export default async function QrxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // QR-X ID kann z.B. "qrx:abcd" oder "abcd" sein
  const qrxId = id.startsWith("qrx:") ? id.slice(4) : id;

  const { data: entry, error: entryErr } = await supabase
    .from("qr_x_entries")
    .select("id, title, description, news, location_name, location_lat, location_lng, logo_url")
    .eq("id", qrxId)
    .maybeSingle();

  if (entryErr || !entry) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.sub}>QR-X wurde nicht gefunden oder wurde gelöscht.</p>
        </div>
      </main>
    );
  }

  const { data: media } = await supabase
    .from("qr_x_media")
    .select("id, qrx_id, type, url, filename, bytes")
    .eq("qrx_id", qrxId);

  const images = (media ?? []).filter((m) => m.type === "image");
  const files = (media ?? []).filter((m) => m.type === "file");

  const deepLink = `miosegqr://qrx/${qrxId}`;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{entry.title}</h1>
          <p className={styles.sub}>Aktuelle Informationen zum QR-X</p>
        </div>

        <a className={styles.openBtn} href={deepLink}>
          In App öffnen
        </a>
      </div>

      {entry.logo_url && (
        <div className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src={entry.logo_url} alt="Logo" />
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>Beschreibung</h2>
        <p className={styles.text}>{entry.description?.trim() ? entry.description : "Keine Beschreibung vorhanden."}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Bilder</h2>
        {images.length === 0 ? (
          <p className={styles.muted}>Keine Bilder vorhanden.</p>
        ) : (
          <div className={styles.grid}>
            {images.map((img) => (
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
        <p className={styles.text}>{entry.location_name?.trim() ? entry.location_name : "Kein Ort hinterlegt."}</p>

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

      <div className={styles.footer}>mioseg qr • QR-X Web</div>
    </main>
  );
}
