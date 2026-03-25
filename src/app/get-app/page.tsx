import Link from "next/link";

export default function GetAppPage() {
  const appStoreUrl = "#";
  const googlePlayUrl = "#";

  return (
    <main style={styles.page}>
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <span style={styles.badge}>mioseg qr · App Download</span>

          <h1 style={styles.title}>
            Hol dir die mioseg qr App
            <br />
            für iPhone und Android.
          </h1>

          <p style={styles.text}>
            Scanne QR-Codes, speichere Inhalte, erstelle eigene QR-X und nutze
            Business QR-X mit professioneller Webansicht, Kontaktfunktionen,
            Medien und flexibler Verwaltung.
          </p>

          <div style={styles.buttonRow}>
            <a href={appStoreUrl} style={styles.primaryButton}>
              Im App Store
            </a>
            <a href={googlePlayUrl} style={styles.secondaryButton}>
              Bei Google Play
            </a>
          </div>

          <div style={styles.noticeCard}>
            <p style={styles.noticeTitle}>Hinweis</p>
            <p style={styles.noticeText}>
              Die finalen Store-Links kannst du hier später einfach einsetzen.
              Solange deine App noch nicht live ist, kannst du hier auch TestFlight,
              Beta-Links oder einen kurzen Hinweis zum baldigen Start anzeigen.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionIntro}>
            <span style={styles.sectionEyebrow}>Was dich erwartet</span>
            <h2 style={styles.sectionTitle}>Eine App für moderne QR-Workflows</h2>
            <p style={styles.sectionText}>
              mioseg qr verbindet klassisches Scannen mit einer eigenen QR-X
              Plattform für private Nutzer und Unternehmen.
            </p>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Scannen & Speichern</h3>
              <p style={styles.cardText}>
                Erfasse QR-Codes, speichere sie dauerhaft und organisiere sie
                in deiner App.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Eigene QR-X erstellen</h3>
              <p style={styles.cardText}>
                Erstelle eigene Inhalte mit Texten, Bildern, PDFs, MP3 oder MP4
                und pflege sie flexibel weiter.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Business QR-X</h3>
              <p style={styles.cardText}>
                Nutze professionelle Webansichten mit Firmenname, Coverbild,
                Kontaktbuttons und modernem Business-Look.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={styles.sectionIntro}>
            <span style={styles.sectionEyebrow}>Download & Verfügbarkeit</span>
            <h2 style={styles.sectionTitle}>Bald oder bereits verfügbar</h2>
            <p style={styles.sectionText}>
              Hier kannst du später deine offiziellen Store-Links hinterlegen und
              Besucher direkt zum richtigen App-Store weiterleiten.
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Noch nicht live? Dann kannst du hier vorübergehend auch einen Hinweis
              wie „Demnächst im App Store und bei Google Play verfügbar“ anzeigen.
            </p>

            <div style={styles.inlineLinks}>
              <Link href="/" style={styles.inlineLink}>
                Zur Startseite
              </Link>
              <Link href="/datenschutz" style={styles.inlineLink}>
                Datenschutz
              </Link>
              <Link href="/nutzungsbedingungen" style={styles.inlineLink}>
                Nutzungsbedingungen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #08111d 0%, #0d1726 34%, #ffffff 34%, #ffffff 100%)",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
  },

  heroSection: {
    padding: "80px 0 64px",
    color: "#ffffff",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#d9e8ff",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 18,
  },
  title: {
    fontSize: 54,
    lineHeight: 1.06,
    fontWeight: 900,
    margin: "0 0 18px 0",
    letterSpacing: -1.4,
  },
  text: {
    fontSize: 18,
    lineHeight: 1.75,
    color: "#b7c5d7",
    maxWidth: 760,
    margin: "0 0 28px 0",
  },

  buttonRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 20px",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    color: "#0d1726",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 15,
    boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 20px",
    borderRadius: 14,
    backgroundColor: "transparent",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 15,
    border: "1px solid rgba(255,255,255,0.18)",
  },

  noticeCard: {
    maxWidth: 760,
    borderRadius: 22,
    padding: 20,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  noticeTitle: {
    margin: "0 0 8px 0",
    fontSize: 15,
    fontWeight: 800,
    color: "#ffffff",
  },
  noticeText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#c7d5e6",
  },

  section: {
    padding: "64px 0",
  },
  sectionAlt: {
    padding: "24px 0 64px",
  },
  sectionIntro: {
    maxWidth: 760,
    marginBottom: 28,
  },
  sectionEyebrow: {
    display: "inline-block",
    marginBottom: 12,
    fontSize: 13,
    fontWeight: 800,
    color: "#355b8d",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: 38,
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#0e1726",
    letterSpacing: -0.8,
  },
  sectionText: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.75,
    color: "#5d6b7d",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 12px 30px rgba(14, 23, 38, 0.04)",
  },
  cardTitle: {
    margin: "0 0 12px 0",
    fontSize: 22,
    fontWeight: 800,
    color: "#0e1726",
  },
  cardText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#5d6b7d",
  },

  infoBox: {
    borderRadius: 28,
    padding: 28,
    background: "linear-gradient(180deg, #f7fafc 0%, #eef4f9 100%)",
    border: "1px solid #dfe9f3",
  },
  infoText: {
    margin: "0 0 18px 0",
    fontSize: 16,
    lineHeight: 1.75,
    color: "#425265",
  },
  inlineLinks: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  inlineLink: {
    color: "#183a67",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
};