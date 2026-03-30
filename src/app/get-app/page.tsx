import type { CSSProperties } from "react";
import Link from "next/link";

export default function GetAppPage() {
  const appStoreUrl = "#";
  const googlePlayUrl = "#";

  const isAppStoreLive = appStoreUrl !== "#";
  const isGooglePlayLive = googlePlayUrl !== "#";

  return (
    <main style={styles.page}>
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            <div style={styles.heroLeft}>
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

              <div style={styles.storeBadgeRow}>
                <a
                  href={appStoreUrl}
                  style={{
                    ...styles.storeBadge,
                    ...(isAppStoreLive ? null : styles.storeBadgeDisabled),
                  }}
                  aria-disabled={!isAppStoreLive}
                >
                  <span style={styles.storeBadgeIcon}></span>
                  <span style={styles.storeBadgeTextWrap}>
                    <span style={styles.storeBadgeSmall}>Laden im</span>
                    <span style={styles.storeBadgeBig}>App Store</span>
                  </span>
                </a>

                <a
                  href={googlePlayUrl}
                  style={{
                    ...styles.storeBadge,
                    ...(isGooglePlayLive ? null : styles.storeBadgeDisabled),
                  }}
                  aria-disabled={!isGooglePlayLive}
                >
                  <span style={styles.storeBadgePlay}>▶</span>
                  <span style={styles.storeBadgeTextWrap}>
                    <span style={styles.storeBadgeSmall}>Jetzt bei</span>
                    <span style={styles.storeBadgeBig}>Google Play</span>
                  </span>
                </a>
              </div>

              <div style={styles.buttonRow}>
                <a
                  href={appStoreUrl}
                  style={{
                    ...styles.primaryButton,
                    ...(isAppStoreLive ? null : styles.buttonDisabled),
                  }}
                  aria-disabled={!isAppStoreLive}
                >
                  Im App Store
                </a>

                <a
                  href={googlePlayUrl}
                  style={{
                    ...styles.secondaryButton,
                    ...(isGooglePlayLive ? null : styles.buttonDisabledAlt),
                  }}
                  aria-disabled={!isGooglePlayLive}
                >
                  Bei Google Play
                </a>
              </div>

              <div style={styles.heroFacts}>
                <div style={styles.factCard}>
                  <strong style={styles.factTitle}>Scannen</strong>
                  <span style={styles.factText}>
                    QR-Codes speichern statt später neu suchen
                  </span>
                </div>

                <div style={styles.factCard}>
                  <strong style={styles.factTitle}>QR-X</strong>
                  <span style={styles.factText}>
                    Inhalte später ändern, ohne neuen Code
                  </span>
                </div>

                <div style={styles.factCard}>
                  <strong style={styles.factTitle}>Business</strong>
                  <span style={styles.factText}>
                    Professioneller Auftritt mit Kontakt und Medien
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.previewWrap}>
              <div style={styles.previewGlowOne} />
              <div style={styles.previewGlowTwo} />

              <div style={styles.phoneShell}>
                <div style={styles.phoneNotch} />

                <div style={styles.phoneScreen}>
                  <div style={styles.phoneTopBar}>
                    <span style={styles.phoneTime}>9:41</span>
                    <div style={styles.phoneStatusIcons}>
                      <span>▂▄▆█</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  <div style={styles.phoneHeroCard}>
                    <div style={styles.phoneLogoWrap}>
                      <img
                        src="/logo-white.png"
                        alt="mioseg qr Logo"
                        style={styles.phoneLogo}
                      />
                    </div>

                    <div style={styles.phoneBrandText}>
                      <div style={styles.phoneBrandTitle}>mioseg qr</div>
                      <div style={styles.phoneBrandSubTitle}>
                        QR-Codes speichern, organisieren und erweitern
                      </div>
                    </div>
                  </div>

                  <div style={styles.phoneMainCard}>
                    <div style={styles.phoneOverline}>Die App auf einen Blick</div>
                    <h3 style={styles.phoneCardTitle}>
                      Alles Wichtige rund um QR-Codes an einem Ort
                    </h3>
                    <p style={styles.phoneCardText}>
                      Scans, gespeicherte Inhalte, eigene QR-X und Business-Funktionen
                      übersichtlich in einer App.
                    </p>
                  </div>

                  <div style={styles.phoneMiniGrid}>
                    <div style={styles.phoneMiniCard}>
                      <div style={styles.phoneMiniTitle}>Scans</div>
                      <div style={styles.phoneMiniText}>Speichern & wiederfinden</div>
                    </div>

                    <div style={styles.phoneMiniCard}>
                      <div style={styles.phoneMiniTitle}>QR-X</div>
                      <div style={styles.phoneMiniText}>Flexibel aktualisieren</div>
                    </div>
                  </div>

                  <div style={styles.phoneChipRow}>
                    <span style={styles.phoneChip}>Scannen</span>
                    <span style={styles.phoneChip}>Speichern</span>
                    <span style={styles.phoneChip}>Business</span>
                  </div>

                  <div style={styles.phoneBottomNav}>
                    <span style={styles.navDotActive} />
                    <span style={styles.navDot} />
                    <span style={styles.navDot} />
                  </div>
                </div>
              </div>
            </div>
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
                übersichtlich in deiner App.
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
          <div style={styles.infoBox}>
            <div style={styles.infoBoxLeft}>
              <span style={styles.sectionEyebrow}>Download & Verfügbarkeit</span>
              <h2 style={styles.sectionTitle}>Bald oder bereits verfügbar</h2>
              <p style={styles.infoText}>
                Hier kannst du später deine offiziellen Store-Links hinterlegen und
                Besucher direkt zum richtigen App-Store weiterleiten.
              </p>
              <p style={styles.infoSubText}>
                Noch nicht live? Dann kannst du hier vorübergehend auch einen Hinweis
                wie „Demnächst im App Store und bei Google Play verfügbar“ anzeigen.
              </p>
            </div>

            <div style={styles.infoBoxRight}>
              <div style={styles.miniStatusCard}>
                <div style={styles.miniStatusLabel}>Aktueller Status</div>
                <div style={styles.miniStatusValue}>Coming Soon / Beta möglich</div>
              </div>

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
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #08111d 0%, #0d1726 34%, #ffffff 34%, #ffffff 100%)",
  },

  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
  },

  heroSection: {
    padding: "80px 0 64px",
    color: "#ffffff",
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: 32,
    alignItems: "center",
  },

  heroLeft: {
    minWidth: 0,
  },

  badge: {
    display: "inline-block",
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#d9e8ff",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 18,
    letterSpacing: 0.3,
  },

  title: {
    fontSize: "clamp(38px, 6vw, 60px)",
    lineHeight: 1.04,
    fontWeight: 900,
    margin: "0 0 18px 0",
    letterSpacing: -1.5,
  },

  text: {
    fontSize: 18,
    lineHeight: 1.8,
    color: "#b7c5d7",
    maxWidth: 760,
    margin: "0 0 24px 0",
  },

  storeBadgeRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  storeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    minHeight: 58,
    padding: "10px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    textDecoration: "none",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },

  storeBadgeDisabled: {
    opacity: 0.6,
    pointerEvents: "none",
  },

  storeBadgeIcon: {
    fontSize: 30,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
  },

  storeBadgePlay: {
    fontSize: 20,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    color: "#7fc2ff",
  },

  storeBadgeTextWrap: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },

  storeBadgeSmall: {
    fontSize: 11,
    color: "#c7d5e6",
    fontWeight: 700,
    marginBottom: 4,
  },

  storeBadgeBig: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: 900,
    letterSpacing: -0.3,
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
    minHeight: 50,
    padding: "0 22px",
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
    minHeight: 50,
    padding: "0 22px",
    borderRadius: 14,
    backgroundColor: "transparent",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 15,
    border: "1px solid rgba(255,255,255,0.18)",
  },

  buttonDisabled: {
    opacity: 0.65,
    pointerEvents: "none",
  },

  buttonDisabledAlt: {
    opacity: 0.65,
    pointerEvents: "none",
  },

  heroFacts: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },

  factCard: {
    minWidth: 170,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  factTitle: {
    fontSize: 17,
    color: "#ffffff",
    fontWeight: 900,
  },

  factText: {
    fontSize: 13,
    color: "#b7c5d7",
    lineHeight: 1.55,
  },

  previewWrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 560,
  },

  previewGlowOne: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    background: "rgba(90,150,255,0.16)",
    filter: "blur(52px)",
    top: 6,
    right: 8,
    zIndex: 0,
  },

  previewGlowTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    filter: "blur(46px)",
    bottom: 30,
    left: 10,
    zIndex: 0,
  },

  phoneShell: {
    position: "relative",
    zIndex: 1,
    width: 340,
    height: 690,
    borderRadius: 42,
    padding: 10,
    background:
      "linear-gradient(180deg, #0b1119 0%, #141e2a 40%, #0a1017 100%)",
    boxShadow:
      "0 40px 100px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  phoneNotch: {
    position: "absolute",
    top: 18,
    left: "50%",
    transform: "translateX(-50%)",
    width: 130,
    height: 28,
    borderRadius: 18,
    background: "#05080d",
    zIndex: 3,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },

  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    overflow: "hidden",
    padding: "18px 16px 16px 16px",
    background: "linear-gradient(180deg, #101d2f 0%, #13243a 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
  },

  phoneTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#dce8f7",
    fontSize: 12,
    fontWeight: 700,
    paddingTop: 4,
    marginBottom: 20,
  },

  phoneTime: {
    letterSpacing: 0.2,
  },

  phoneStatusIcons: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 11,
  },

  phoneHeroCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    padding: "14px 14px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
  },

  phoneLogoWrap: {
    width: 74,
    height: 74,
    borderRadius: 20,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    flexShrink: 0,
  },

  phoneLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  phoneBrandText: {
    minWidth: 0,
  },

  phoneBrandTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: -0.4,
  },

  phoneBrandSubTitle: {
    color: "#a8bed7",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 6,
    lineHeight: 1.5,
  },

  phoneMainCard: {
    borderRadius: 22,
    background: "linear-gradient(180deg, #1b3351 0%, #28486e 100%)",
    padding: 18,
    marginBottom: 14,
    color: "#ffffff",
  },

  phoneOverline: {
    margin: "0 0 8px 0",
    color: "#9fc8ff",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  phoneCardTitle: {
    margin: "0 0 10px 0",
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1.2,
  },

  phoneCardText: {
    margin: 0,
    color: "#d8e6f9",
    fontSize: 14,
    lineHeight: 1.75,
  },

  phoneMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 14,
  },

  phoneMiniCard: {
    borderRadius: 18,
    padding: 14,
    background: "#0f1b2c",
    border: "1px solid #23364f",
  },

  phoneMiniTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 6,
  },

  phoneMiniText: {
    color: "#b7c5d7",
    fontSize: 12,
    lineHeight: 1.5,
  },

  phoneChipRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: "auto",
  },

  phoneChip: {
    padding: "10px 14px",
    borderRadius: 999,
    backgroundColor: "#13253b",
    border: "1px solid #27415f",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
  },

  phoneBottomNav: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    paddingTop: 18,
  },

  navDotActive: {
    width: 26,
    height: 6,
    borderRadius: 999,
    background: "#ffffff",
    opacity: 0.95,
  },

  navDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "rgba(255,255,255,0.35)",
  },

  noticeCard: {
    maxWidth: 760,
    marginTop: 28,
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
    lineHeight: 1.75,
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
    lineHeight: 1.25,
  },

  cardText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#5d6b7d",
  },

  infoBox: {
    borderRadius: 30,
    padding: 30,
    background: "linear-gradient(180deg, #f7fafc 0%, #eef4f9 100%)",
    border: "1px solid #dfe9f3",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 24,
    alignItems: "start",
  },

  infoBoxLeft: {},

  infoBoxRight: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  infoText: {
    margin: "0 0 12px 0",
    fontSize: 16,
    lineHeight: 1.8,
    color: "#425265",
  },

  infoSubText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#607083",
  },

  miniStatusCard: {
    borderRadius: 20,
    padding: 18,
    background: "#ffffff",
    border: "1px solid #dfe9f3",
    boxShadow: "0 10px 24px rgba(14, 23, 38, 0.04)",
  },

  miniStatusLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "#5f7896",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  miniStatusValue: {
    fontSize: 17,
    fontWeight: 800,
    color: "#0e1726",
    lineHeight: 1.35,
  },

  inlineLinks: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },

  inlineLink: {
    color: "#183a67",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
};