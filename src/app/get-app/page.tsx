export const dynamic = "force-dynamic";

function getStoreLinks() {
  // Hier später echte Store-Links eintragen, wenn du im Play Store / App Store bist.
  // Bis dahin kannst du z.B. deinen APK-Download oder EAS-Update-Link einsetzen.
  const android = process.env.NEXT_PUBLIC_ANDROID_APP_URL?.trim() || "";
  const ios = process.env.NEXT_PUBLIC_IOS_APP_URL?.trim() || "";
  return { android, ios };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getFirst(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

export default function GetAppPage({ searchParams }: { searchParams?: SearchParams }) {
  const sp = searchParams ?? {};
  const from = getFirst(sp.from) || "/";

  const { android, ios } = getStoreLinks();

  // ✅ Deep Link zurück in die App (wenn installiert)
  // Falls "from" z.B. /qrx/<id>?save=1 ist, kannst du es direkt durchreichen:
  const deepLink = `miosegqr:/${from.startsWith("/") ? from : `/${from}`}`;

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#0f0f10", color: "#fff", fontFamily: "system-ui" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.06)",
          padding: 18,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>mioseg qr installieren</h1>

        <p style={{ marginTop: 8, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
          Du hast einen QR-X Link geöffnet, aber die App ist auf diesem Gerät noch nicht installiert.
          <br />
          Installiere die App, damit du QR-X Inhalte direkt speichern und verwalten kannst.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          {android ? (
            <a
              href={android}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Android herunterladen
            </a>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.7)" }}>
              Android-Link fehlt (NEXT_PUBLIC_ANDROID_APP_URL). Du kannst ihn später eintragen.
            </div>
          )}

          {ios ? (
            <a
              href={ios}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              iOS herunterladen
            </a>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.7)" }}>
              iOS-Link fehlt (NEXT_PUBLIC_IOS_APP_URL). Du kannst ihn später eintragen.
            </div>
          )}
        </div>

        {/* ✅ Optional: Falls App doch schon installiert wurde */}
        <div style={{ marginTop: 16 }}>
          <a
            href={deepLink}
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            App ist installiert? Jetzt öffnen
          </a>
        </div>

        <div style={{ marginTop: 18 }}>
          <a href={from} style={{ color: "rgba(255,255,255,0.85)" }}>
            ← Zurück zum QR-X Inhalt
          </a>
        </div>
      </div>
    </main>
  );
}
