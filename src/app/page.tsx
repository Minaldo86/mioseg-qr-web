import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextWrap}>
            <div className={styles.brandBadgeWrap}>
              <div className={styles.brandBadge}>
                <div className={styles.brandBadgeLogoWrap}>
                  <Image
                    src="/mioseg_qr_white_transparent.png"
                    alt="mioseg qr Logo"
                    width={34}
                    height={34}
                    className={styles.brandBadgeLogo}
                    priority
                  />
                </div>

                <div className={styles.brandBadgeTextWrap}>
                  <span className={styles.brandBadgeTitle}>mioseg qr</span>
                  <span className={styles.brandBadgeSubtitle}>QR-X Plattform</span>
                </div>
              </div>
            </div>

            <h1 className={styles.heroTitle}>
              QR-Codes neu gedacht.
              <br />
              Speichern, verwalten, teilen und als QR-X veröffentlichen.
            </h1>

            <p className={styles.heroText}>
              Mit mioseg qr können Nutzer QR-Codes scannen, organisieren und
              eigene QR-X erstellen. Von einfachen Inhalten bis zu Business
              QR-X mit Firmenprofil, Kontaktbuttons, Medien, Speichererweiterung
              und Webansicht.
            </p>

            <div className={styles.heroButtons}>
              <Link href="/get-app" className={styles.primaryButton}>
                App ansehen
              </Link>
              <Link href="/datenschutz" className={styles.secondaryButton}>
                Datenschutz
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>1</strong>
                <span className={styles.factLabel}>QR-X kostenlos zum Start</span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Pay-per-Use</strong>
                <span className={styles.factLabel}>Credits statt Abo</span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Business</strong>
                <span className={styles.factLabel}>QR-X für Unternehmen</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualStage}>
              <div className={styles.glowOne} />
              <div className={styles.glowTwo} />

              <div className={styles.phoneMockup}>
                <div className={styles.phoneHeader}>
                  <span className={styles.phoneDot} />
                  <span className={styles.phoneDot} />
                  <span className={styles.phoneDot} />
                </div>

                <div className={styles.heroLogoShowcase}>
                  <div className={styles.heroLogoShell}>
                    <Image
                      src="/mioseg_qr_white_transparent.png"
                      alt="mioseg qr Hero Logo"
                      width={88}
                      height={88}
                      className={styles.heroLogo}
                      priority
                    />
                  </div>

                  <div className={styles.heroLogoTextWrap}>
                    <span className={styles.heroLogoTitle}>mioseg qr</span>
                    <span className={styles.heroLogoSubtitle}>Business QR-X Demo</span>
                  </div>
                </div>

                <div className={styles.phoneCardPrimary}>
                  <p className={styles.phoneOverline}>QR-X Business</p>
                  <h3 className={styles.phoneCardTitle}>mioseg qr Demo</h3>
                  <p className={styles.phoneCardText}>
                    Firmenprofil, Website, Anruf, Navigation, Bilder, Videos und
                    Updates in einer Webansicht.
                  </p>
                </div>

                <div className={styles.phoneCardSecondary}>
                  <p className={styles.phoneOverline}>Scan &amp; Verwaltung</p>
                  <p className={styles.phoneCardText}>
                    QR-Codes speichern, in Ordnern sortieren, teilen und Änderungen
                    nachverfolgen.
                  </p>
                </div>

                <div className={styles.phoneActionRow}>
                  <div className={styles.phoneActionChip}>Website</div>
                  <div className={styles.phoneActionChip}>Anrufen</div>
                  <div className={styles.phoneActionChip}>Route</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Funktionen</span>
          <h2 className={styles.sectionTitle}>Alles für moderne QR-Workflows</h2>
          <p className={styles.sectionText}>
            Entwickelt für private Nutzer, Creator und Unternehmen, die Inhalte
            nicht nur verlinken, sondern dauerhaft verwalten und weiterentwickeln
            wollen.
          </p>
        </div>

        <div className={styles.grid3}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Scannen &amp; Speichern</h3>
            <p className={styles.featureText}>
              QR-Codes erfassen, sichern und später wiederfinden – inklusive
              Verwaltung in Ordnern und optionalem Standortbezug.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Eigene QR-X erstellen</h3>
            <p className={styles.featureText}>
              Inhalte wie Texte, Bilder, PDFs, MP3 oder MP4 an einen QR-X binden
              und flexibel aktualisieren.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Teilen &amp; Webansicht</h3>
            <p className={styles.featureText}>
              QR-X können über öffentliche Webansichten erreichbar gemacht und
              mit anderen geteilt werden.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Business QR-X</span>
          <h2 className={styles.sectionTitle}>Für Unternehmen sichtbar professioneller</h2>
          <p className={styles.sectionText}>
            Business QR-X heben sich optisch und funktional klar von normalen
            QR-X ab und eignen sich für Produkte, Standorte, Fahrzeuge,
            Speisekarten, Services oder Unternehmensprofile.
          </p>
        </div>

        <div className={styles.businessGrid}>
          <div className={styles.businessCard}>
            <h3 className={styles.featureTitle}>Business-Look &amp; Branding</h3>
            <p className={styles.featureText}>
              Firmenname, Coverbild, verifizierter Eindruck und strukturierte
              Darstellung für professionelle Außenwirkung.
            </p>
          </div>

          <div className={styles.businessCard}>
            <h3 className={styles.featureTitle}>Kontakt-Buttons</h3>
            <p className={styles.featureText}>
              Direkte Aktionen wie Website, Anruf oder Navigation für schnelle
              Interaktion mit Interessenten und Kunden.
            </p>
          </div>

          <div className={styles.businessCard}>
            <h3 className={styles.featureTitle}>Medien &amp; Updates</h3>
            <p className={styles.featureText}>
              Bilder, Videos und weitere Inhalte zentral pflegen und nachträglich
              aktualisieren, ohne den QR-Code neu zu drucken.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Preismodell</span>
          <h2 className={styles.sectionTitle}>Kein Abo. Volle Flexibilität.</h2>
          <p className={styles.sectionText}>
            mioseg qr setzt auf ein Credit-Modell statt auf starre monatliche
            Abonnements.
          </p>
        </div>

        <div className={styles.pricingWrap}>
          <div className={styles.pricingCardPrimary}>
            <h3 className={styles.pricingTitle}>So funktioniert es</h3>
            <ul className={styles.pricingList}>
              <li>1 QR-X kostenlos im Grundumfang</li>
              <li>Weitere QR-X werden über Credits freigeschaltet</li>
              <li>Zusätzlicher Speicher kann separat erweitert werden</li>
              <li>Business QR-X können eigene Kostenlogik haben</li>
            </ul>
          </div>

          <div className={styles.pricingCardSecondary}>
            <h3 className={styles.pricingTitle}>Vorteile</h3>
            <ul className={styles.pricingList}>
              <li>Kein klassisches Abo nötig</li>
              <li>Kosten nur bei tatsächlicher Nutzung</li>
              <li>Ideal für private und geschäftliche Nutzung</li>
              <li>Skalierbar für Medien und Speicher</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Bereit für die nächste Generation von QR-Codes?</h2>
          <p className={styles.ctaText}>
            Entdecke mioseg qr, verwalte deine QR-X strukturiert und nutze die
            Webplattform für öffentliche Inhalte, Business-Präsentationen und
            flexible Updates.
          </p>

          <div className={styles.heroButtons}>
            <Link href="/get-app" className={styles.primaryButton}>
              Zur App
            </Link>
            <Link href="/nutzungsbedingungen" className={styles.secondaryButtonDark}>
              Nutzungsbedingungen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}