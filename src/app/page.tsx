import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.page}>
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroTextWrap}>
            <span style={styles.badge}>mioseg qr · QR-X Plattform</span>

            <h1 style={styles.heroTitle}>
              QR-Codes neu gedacht.
              <br />
              Speichern, verwalten, teilen und als QR-X veröffentlichen.
            </h1>

            <p style={styles.heroText}>
              Mit mioseg qr können Nutzer QR-Codes scannen, organisieren und
              eigene QR-X erstellen. Von einfachen Inhalten bis zu Business
              QR-X mit Firmenprofil, Kontaktbuttons, Medien, Speichererweiterung
              und Webansicht.
            </p>

            <div style={styles.heroButtons}>
              <Link href="/get-app" style={styles.primaryButton}>
                App ansehen
              </Link>
              <Link href="/datenschutz" style={styles.secondaryButton}>
                Datenschutz
              </Link>
            </div>

            <div style={styles.heroFacts}>
              <div style={styles.factCard}>
                <strong style={styles.factNumber}>1</strong>
                <span style={styles.factLabel}>QR-X kostenlos zum Start</span>
              </div>
              <div style={styles.factCard}>
                <strong style={styles.factNumber}>Pay-per-Use</strong>
                <span style={styles.factLabel}>Credits statt Abo</span>
              </div>
              <div style={styles.factCard}>
                <strong style={styles.factNumber}>Business</strong>
                <span style={styles.factLabel}>QR-X für Unternehmen</span>
              </div>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.phoneMockup}>
              <div style={styles.phoneHeader}>
                <span style={styles.phoneDot} />
                <span style={styles.phoneDot} />
                <span style={styles.phoneDot} />
              </div>

              <div style={styles.phoneCardPrimary}>
                <p style={styles.phoneOverline}>QR-X Business</p>
                <h3 style={styles.phoneCardTitle}>mioseg qr Demo</h3>
                <p style={styles.phoneCardText}>
                  Firmenprofil, Website, Anruf, Navigation, Bilder, Videos und
                  Updates in einer Webansicht.
                </p>
              </div>

              <div style={styles.phoneCardSecondary}>
                <p style={styles.phoneOverline}>Scan & Verwaltung</p>
                <p style={styles.phoneCardText}>
                  QR-Codes speichern, in Ordnern sortieren, teilen und Änderungen
                  nachverfolgen.
                </p>
              </div>

              <div style={styles.phoneActionRow}>
                <div style={styles.phoneActionChip}>Website</div>
                <div style={styles.phoneActionChip}>Anrufen</div>
                <div style={styles.phoneActionChip}>Route</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionIntro}>
          <span style={styles.sectionEyebrow}>Funktionen</span>
          <h2 style={styles.sectionTitle}>Alles für moderne QR-Workflows</h2>
          <p style={styles.sectionText}>
            Entwickelt für private Nutzer, Creator und Unternehmen, die Inhalte
            nicht nur verlinken, sondern dauerhaft verwalten und weiterentwickeln
            wollen.
          </p>
        </div>

        <div style={styles.grid3}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Scannen & Speichern</h3>
            <p style={styles.featureText}>
              QR-Codes erfassen, sichern und später wiederfinden – inklusive
              Verwaltung in Ordnern und optionalem Standortbezug.
            </p>
          </div>

          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Eigene QR-X erstellen</h3>
            <p style={styles.featureText}>
              Inhalte wie Texte, Bilder, PDFs, MP3 oder MP4 an einen QR-X binden
              und flexibel aktualisieren.
            </p>
          </div>

          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Teilen & Webansicht</h3>
            <p style={styles.featureText}>
              QR-X können über öffentliche Webansichten erreichbar gemacht und
              mit anderen geteilt werden.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.sectionIntro}>
          <span style={styles.sectionEyebrow}>Business QR-X</span>
          <h2 style={styles.sectionTitle}>Für Unternehmen sichtbar professioneller</h2>
          <p style={styles.sectionText}>
            Business QR-X heben sich optisch und funktional klar von normalen
            QR-X ab und eignen sich für Produkte, Standorte, Fahrzeuge,
            Speisekarten, Services oder Unternehmensprofile.
          </p>
        </div>

        <div style={styles.businessGrid}>
          <div style={styles.businessCard}>
            <h3 style={styles.featureTitle}>Business-Look & Branding</h3>
            <p style={styles.featureText}>
              Firmenname, Coverbild, verifizierter Eindruck und strukturierte
              Darstellung für professionelle Außenwirkung.
            </p>
          </div>

          <div style={styles.businessCard}>
            <h3 style={styles.featureTitle}>Kontakt-Buttons</h3>
            <p style={styles.featureText}>
              Direkte Aktionen wie Website, Anruf oder Navigation für schnelle
              Interaktion mit Interessenten und Kunden.
            </p>
          </div>

          <div style={styles.businessCard}>
            <h3 style={styles.featureTitle}>Medien & Updates</h3>
            <p style={styles.featureText}>
              Bilder, Videos und weitere Inhalte zentral pflegen und nachträglich
              aktualisieren, ohne den QR-Code neu zu drucken.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionIntro}>
          <span style={styles.sectionEyebrow}>Preismodell</span>
          <h2 style={styles.sectionTitle}>Kein Abo. Volle Flexibilität.</h2>
          <p style={styles.sectionText}>
            mioseg qr setzt auf ein Credit-Modell statt auf starre monatliche
            Abonnements.
          </p>
        </div>

        <div style={styles.pricingWrap}>
          <div style={styles.pricingCardPrimary}>
            <h3 style={styles.pricingTitle}>So funktioniert es</h3>
            <ul style={styles.pricingList}>
              <li>1 QR-X kostenlos im Grundumfang</li>
              <li>Weitere QR-X werden über Credits freigeschaltet</li>
              <li>Zusätzlicher Speicher kann separat erweitert werden</li>
              <li>Business QR-X können eigene Kostenlogik haben</li>
            </ul>
          </div>

          <div style={styles.pricingCardSecondary}>
            <h3 style={styles.pricingTitle}>Vorteile</h3>
            <ul style={styles.pricingList}>
              <li>Kein klassisches Abo nötig</li>
              <li>Kosten nur bei tatsächlicher Nutzung</li>
              <li>Ideal für private und geschäftliche Nutzung</li>
              <li>Skalierbar für Medien und Speicher</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>Bereit für die nächste Generation von QR-Codes?</h2>
          <p style={styles.ctaText}>
            Entdecke mioseg qr, verwalte deine QR-X strukturiert und nutze die
            Webplattform für öffentliche Inhalte, Business-Präsentationen und
            flexible Updates.
          </p>

          <div style={styles.heroButtons}>
            <Link href="/get-app" style={styles.primaryButton}>
              Zur App
            </Link>
            <Link href="/nutzungsbedingungen" style={styles.secondaryButton}>
              Nutzungsbedingungen
            </Link>
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
      "linear-gradient(180deg, #08111d 0%, #0d1726 36%, #ffffff 36%, #ffffff 100%)",
  },

  heroSection: {
    padding: "72px 24px 56px",
  },
  heroContent: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 32,
    alignItems: "center",
  },
  heroTextWrap: {
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
  heroTitle: {
    fontSize: 54,
    lineHeight: 1.06,
    fontWeight: 900,
    margin: "0 0 18px 0",
    letterSpacing: -1.4,
  },
  heroText: {
    fontSize: 18,
    lineHeight: 1.75,
    color: "#b7c5d7",
    maxWidth: 720,
    margin: "0 0 28px 0",
  },
  heroButtons: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 26,
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
  heroFacts: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  factCard: {
    minWidth: 160,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  factNumber: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: 900,
  },
  factLabel: {
    fontSize: 13,
    color: "#b7c5d7",
    lineHeight: 1.5,
  },

  heroVisual: {
    display: "flex",
    justifyContent: "center",
  },
  phoneMockup: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 30,
    padding: 18,
    background: "linear-gradient(180deg, #101d2f 0%, #13243a 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  },
  phoneHeader: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  phoneDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#6f84a0",
  },
  phoneCardPrimary: {
    borderRadius: 22,
    background: "linear-gradient(180deg, #1b3351 0%, #28486e 100%)",
    padding: 18,
    marginBottom: 14,
    color: "#ffffff",
  },
  phoneCardSecondary: {
    borderRadius: 22,
    backgroundColor: "#0e1a2b",
    border: "1px solid #21344f",
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
  },
  phoneCardText: {
    margin: 0,
    color: "#d8e6f9",
    fontSize: 14,
    lineHeight: 1.7,
  },
  phoneActionRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  phoneActionChip: {
    padding: "10px 14px",
    borderRadius: 999,
    backgroundColor: "#13253b",
    border: "1px solid #27415f",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
  },

  section: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "60px 24px",
  },
  sectionAlt: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "60px 24px",
    backgroundColor: "#f7fafc",
    borderRadius: 32,
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

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 12px 30px rgba(14, 23, 38, 0.04)",
  },
  featureTitle: {
    margin: "0 0 12px 0",
    fontSize: 22,
    fontWeight: 800,
    color: "#0e1726",
  },
  featureText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#5d6b7d",
  },

  businessGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  businessCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 24,
    padding: 24,
  },

  pricingWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  },
  pricingCardPrimary: {
    background: "linear-gradient(180deg, #0d1726 0%, #12233a 100%)",
    color: "#ffffff",
    borderRadius: 28,
    padding: 28,
  },
  pricingCardSecondary: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 28,
    padding: 28,
  },
  pricingTitle: {
    margin: "0 0 16px 0",
    fontSize: 24,
    fontWeight: 900,
  },
  pricingList: {
    margin: 0,
    paddingLeft: 20,
    lineHeight: 2,
    fontSize: 15,
    color: "inherit",
  },

  ctaSection: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "24px 24px 40px",
  },
  ctaCard: {
    borderRadius: 32,
    padding: 34,
    background: "linear-gradient(180deg, #13233b 0%, #0d1726 100%)",
    color: "#ffffff",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  },
  ctaTitle: {
    margin: "0 0 12px 0",
    fontSize: 36,
    lineHeight: 1.15,
    fontWeight: 900,
    letterSpacing: -0.8,
  },
  ctaText: {
    margin: "0 0 22px 0",
    fontSize: 17,
    lineHeight: 1.75,
    color: "#c8d6e8",
    maxWidth: 860,
  },
};