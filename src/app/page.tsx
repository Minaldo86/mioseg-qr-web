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
              Normale QR-Codes reichen oft nicht.
              <br />
              QR-X macht daraus echte Inhalte, Updates und Mehrwert.
            </h1>

            <p className={styles.heroText}>
              Mit mioseg qr scannst du nicht nur QR-Codes – du speicherst,
              organisierst und verwaltest sie dauerhaft. Und mit QR-X machst du
              aus einem einfachen Code eine flexible, aktualisierbare und
              professionelle Webansicht mit Medien, Aktionen und echtem Nutzen.
            </p>

            <div className={styles.heroButtons}>
              <Link href="/get-app" className={styles.primaryButton}>
                App herunterladen
              </Link>
              <Link href="/datenschutz" className={styles.secondaryButton}>
                Datenschutz
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Scannen</strong>
                <span className={styles.factLabel}>
                  QR-Codes speichern statt später wieder suchen
                </span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>QR-X</strong>
                <span className={styles.factLabel}>
                  Mehr Inhalte, Updates und Medien hinter einem Code
                </span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Business</strong>
                <span className={styles.factLabel}>
                  Firmenprofil, Kontaktbuttons und professioneller Auftritt
                </span>
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
                    <span className={styles.heroLogoSubtitle}>Mehr als nur ein QR-Scanner</span>
                  </div>
                </div>

                <div className={styles.phoneCardPrimary}>
                  <p className={styles.phoneOverline}>Warum Nutzer die App behalten</p>
                  <h3 className={styles.phoneCardTitle}>Scans, QR-X und Updates an einem Ort</h3>
                  <p className={styles.phoneCardText}>
                    Alles bleibt gespeichert, sortierbar und später wieder
                    abrufbar – statt jedes Mal neu zu scannen oder Links zu verlieren.
                  </p>
                </div>

                <div className={styles.phoneCardSecondary}>
                  <p className={styles.phoneOverline}>Mehrwert im Alltag</p>
                  <p className={styles.phoneCardText}>
                    Restaurant, Event, Fahrzeug, Produkt oder Unternehmen:
                    ein QR-X kann Website, Video, Galerie, Infos und Kontakt
                    in einer Ansicht bündeln.
                  </p>
                </div>

                <div className={styles.phoneActionRow}>
                  <div className={styles.phoneActionChip}>Scans speichern</div>
                  <div className={styles.phoneActionChip}>QR-X erstellen</div>
                  <div className={styles.phoneActionChip}>Business nutzen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Der Unterschied</span>
          <h2 className={styles.sectionTitle}>Warum ein normaler QR-Code oft nicht mehr ausreicht</h2>
          <p className={styles.sectionText}>
            Viele QR-Codes leiten nur auf eine starre Website weiter. Nutzer
            verlieren den Link später wieder, Inhalte ändern sich nicht sichtbar
            und wichtige Informationen sind oft unübersichtlich verteilt.
          </p>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <div className={styles.compareLabel}>Normaler QR-Code</div>
            <h3 className={styles.compareTitle}>Einmal scannen, einmal weitergeleitet</h3>
            <ul className={styles.compareList}>
              <li>führt meist nur auf einen einzelnen Link</li>
              <li>keine strukturierte Verwaltung in der App</li>
              <li>später oft nicht mehr wiederzufinden</li>
              <li>wenig Flexibilität bei neuen Inhalten</li>
            </ul>
          </div>

          <div className={styles.compareCardFeatured}>
            <div className={styles.compareLabelFeatured}>QR-X mit mioseg qr</div>
            <h3 className={styles.compareTitleFeatured}>Mehr Inhalte, mehr Nutzen, mehr Kontrolle</h3>
            <ul className={styles.compareListFeatured}>
              <li>Scans dauerhaft speichern und organisieren</li>
              <li>Texte, Bilder, PDFs, MP3, MP4 und Updates integrieren</li>
              <li>Inhalte später anpassen, ohne den QR-Code neu zu drucken</li>
              <li>für privat und Business deutlich vielseitiger</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Alltagsbeispiele</span>
          <h2 className={styles.sectionTitle}>Dafür braucht man mioseg qr im echten Leben</h2>
          <p className={styles.sectionText}>
            Die App überzeugt, wenn Nutzer sofort sehen, wo sie im Alltag
            echten Mehrwert bringt.
          </p>
        </div>

        <div className={styles.useCaseGrid}>
          <div className={styles.useCaseCard}>
            <div className={styles.useCaseType}>Normale QR-Codes</div>
            <h3 className={styles.useCaseTitle}>Speisekarte, WLAN, Produktlink</h3>
            <p className={styles.useCaseText}>
              Statt denselben QR-Code immer wieder neu zu scannen, speicherst du
              ihn direkt in der App und findest ihn später sofort wieder.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseType}>QR-X</div>
            <h3 className={styles.useCaseTitle}>Event, Produkt, Fahrzeug oder Angebot</h3>
            <p className={styles.useCaseText}>
              Ein einziger Code kann Tickets, Videos, Bilder, Updates, Downloads
              und Zusatzinfos bündeln – alles an einem Ort.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseType}>Business QR-X</div>
            <h3 className={styles.useCaseTitle}>Firma, Dienstleister, Restaurant, Fuhrpark</h3>
            <p className={styles.useCaseText}>
              Professionelle Webansichten mit Firmenname, Coverbild, Website,
              Anruf, Navigation und Medien sorgen für deutlich mehr Vertrauen.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Warum jeder die App braucht</span>
          <h2 className={styles.sectionTitle}>Nicht nur scannen. Behalten, verwalten und wiederverwenden.</h2>
          <p className={styles.sectionText}>
            Der größte Unterschied liegt nicht nur im Erstellen von QR-X –
            sondern darin, dass Nutzer ihre gescannten Codes endlich sinnvoll
            speichern und strukturieren können.
          </p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Nie wieder einen wichtigen QR-Code verlieren</h3>
            <p className={styles.featureText}>
              Restaurant, Parkplatz, Anleitung, Produktseite oder Kontaktlink:
              alles bleibt in deiner App gespeichert.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Mehr aus einem QR-Code machen</h3>
            <p className={styles.featureText}>
              Mit QR-X wird aus einem einfachen Scan eine echte Inhaltsseite mit
              Bildern, Videos, Dateien und Updates.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Ideal für private und geschäftliche Nutzung</h3>
            <p className={styles.featureText}>
              Vom privaten Sammeln bis zum professionellen Firmenauftritt:
              die App deckt beide Welten sauber ab.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
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

      <section className={styles.sectionAlt}>
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
          <h2 className={styles.ctaTitle}>Ein QR-Code ist nur der Anfang. Der Mehrwert kommt mit mioseg qr.</h2>
          <p className={styles.ctaText}>
            Lade die App herunter, speichere deine Scans dauerhaft, erstelle
            eigene QR-X und nutze Business QR-X für professionelle Inhalte,
            Kontakte und Medien.
          </p>

          <div className={styles.heroButtons}>
            <Link href="/get-app" className={styles.primaryButton}>
              App herunterladen
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