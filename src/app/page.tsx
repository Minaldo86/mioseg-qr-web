
import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextWrap}>
            <div className={styles.brandBadgeWrap}>
              <img
                src="/logo-white.png"
                alt="mioseg qr Logo"
                className={styles.heroBrandLogo}
              />
            </div>

            <h1 className={styles.heroTitle}>
              Einmal scannen.
              <br />
              Immer wiederfinden.
            </h1>

            <p className={styles.heroText}>
              mioseg qr speichert QR-Codes, zeigt ihre Standorte auf der Karte
              und macht aus einfachen Codes aktualisierbare QR-X Seiten mit
              Text, Bildern, News und mehr.
            </p>

            <div className={styles.heroButtons}>
              <Link href="/get-app" className={styles.primaryButton}>
                App herunterladen
              </Link>
              <Link href="#features" className={styles.secondaryButton}>
                Funktionen ansehen
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Scannen</strong>
                <span className={styles.factLabel}>
                  QR-Codes speichern statt neu suchen
                </span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>Karte</strong>
                <span className={styles.factLabel}>
                  Orte direkt wiederfinden und navigieren
                </span>
              </div>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>QR-X</strong>
                <span className={styles.factLabel}>
                  Inhalte später ändern, ohne neuen Code
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
                    <img
                      src="/logo-white.png"
                      alt="mioseg qr Hero Logo"
                      className={styles.heroLogo}
                    />
                  </div>

                  <div className={styles.heroLogoTextWrap}>
                    <span className={styles.heroLogoTitle}>mioseg qr</span>
                    <span className={styles.heroLogoSubtitle}>
                      QR-Codes speichern, organisieren und erweitern
                    </span>
                  </div>
                </div>

                <div className={styles.phoneCardPrimary}>
                  <p className={styles.phoneOverline}>Der Vorteil</p>
                  <h3 className={styles.phoneCardTitle}>
                    Scans, Orte und Updates an einem Ort
                  </h3>
                  <p className={styles.phoneCardText}>
                    Statt Links zu verlieren, bleibt alles gespeichert und später
                    sofort wieder auffindbar.
                  </p>
                </div>

                <div className={styles.phoneActionRow}>
                  <div className={styles.phoneActionChip}>Scannen</div>
                  <div className={styles.phoneActionChip}>Karte</div>
                  <div className={styles.phoneActionChip}>QR-X</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Die wichtigsten Funktionen</span>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
  Weniger erklären. Schneller verstehen.
</h2>
          <p className={styles.sectionText}>
            Die App soll in wenigen Sekunden klar machen, warum sie nützlich
            ist. Deshalb stehen hier nur die vier stärksten Vorteile.
          </p>
        </div>

        <div className={styles.featureStack}>
          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/scan-screen.jpg"
                alt="QR-Code scannen in mioseg qr"
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>1 · Scannen</span>
              <h3 className={styles.featureHeadline}>
                QR-Codes speichern statt später wieder suchen
              </h3>
              <p className={styles.featureBody}>
                Scanne QR-Codes direkt mit der App und behalte sie dauerhaft.
                So musst du denselben Code nicht immer wieder neu finden.
              </p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/map-screen.jpg"
                alt="Kartenansicht von gespeicherten QR-Codes"
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>2 · Karte</span>
              <h3 className={styles.featureHeadline}>
                Finde Scans später direkt auf der Karte wieder
              </h3>
              <p className={styles.featureBody}>
                Wenn ein Standort gespeichert wurde, siehst du sofort, wo du den
                QR-Code gefunden hast – inklusive Navigation zurück zum Ort.
              </p>
            </div>
          </div>

          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/updates-screen.jpg"
                alt="Updates und eigene QR-X in mioseg qr"
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>3 · Updates</span>
              <h3 className={styles.featureHeadline}>
                Gespeicherte QR-X können sich aktualisieren
              </h3>
              <p className={styles.featureBody}>
                QR-X ist mehr als ein Link. Inhalte können später geändert
                werden, ohne den Code neu zu drucken.
              </p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/create-screen.jpg"
                alt="QR-X erstellen in mioseg qr"
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>4 · Eigene QR-X</span>
              <h3 className={styles.featureHeadline}>
                Erstelle eigene QR-X mit Text, Bildern und News
              </h3>
              <p className={styles.featureBody}>
                Ideal für Produkte, Fahrzeuge, Restaurants, Events oder
                Unternehmen. Ein Code – aber Inhalte, die lebendig bleiben.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Für wen ist das?</span>
          <h2 className={styles.sectionTitle}>
            Für Alltag, Organisation und Business
          </h2>
          <p className={styles.sectionText}>
            mioseg qr funktioniert für private Nutzer genauso wie für
            Unternehmen, die mehr aus einem QR-Code machen wollen.
          </p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Privat</h3>
            <p className={styles.featureText}>
              Restaurants, Parkplätze, Produkte, Anleitungen oder Orte einfach
              speichern und später wiederfinden.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Events & Angebote</h3>
            <p className={styles.featureText}>
              Infos, Änderungen und aktuelle Hinweise flexibel pflegen – ohne
              neuen QR-Code.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Business QR-X</h3>
            <p className={styles.featureText}>
              Firmenname, Coverbild, Kontaktbuttons, Website, Navigation und
              Medien in einer professionellen Ansicht.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Kurz erklärt</span>
          <h2 className={styles.sectionTitle}>
            Was ist der Unterschied zwischen QR-Code und QR-X?
          </h2>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <div className={styles.compareLabel}>Normaler QR-Code</div>
            <h3 className={styles.compareTitle}>Meist nur ein Link</h3>
            <ul className={styles.compareList}>
              <li>führt auf eine feste Seite</li>
              <li>später oft schwer wiederzufinden</li>
              <li>kaum flexibel bei Änderungen</li>
            </ul>
          </div>

          <div className={styles.compareCardFeatured}>
            <div className={styles.compareLabelFeatured}>QR-X</div>
            <h3 className={styles.compareTitleFeatured}>
              Ein Code mit echten Inhalten
            </h3>
            <ul className={styles.compareListFeatured}>
              <li>Texte, Bilder, Dateien und News</li>
              <li>später aktualisierbar</li>
              <li>gespeichert, organisiert und wiederfindbar</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Preismodell</span>
          <h2 className={styles.sectionTitle}>Kein Abo. Nutzung nach Bedarf.</h2>
          <p className={styles.sectionText}>
            Der Einstieg ist einfach. Weitere QR-X und zusätzlicher Speicher
            werden bei Bedarf über Credits freigeschaltet.
          </p>
        </div>

        <div className={styles.pricingWrap}>
          <div className={styles.pricingCardPrimary}>
            <h3 className={styles.pricingTitle}>So funktioniert es</h3>
            <ul className={styles.pricingList}>
              <li>1 QR-X kostenlos im Grundumfang</li>
              <li>weitere QR-X per Credits</li>
              <li>zusätzlicher Speicher bei Bedarf</li>
            </ul>
          </div>

          <div className={styles.pricingCardSecondary}>
            <h3 className={styles.pricingTitle}>Vorteile</h3>
            <ul className={styles.pricingList}>
              <li>kein klassisches Abo</li>
              <li>nur zahlen, wenn du es nutzt</li>
              <li>für privat und Business geeignet</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div className={styles.downloadTop}>
            <div className={styles.downloadBrand}>
              <div className={styles.downloadLogoWrap}>
                <img
                  src="/logo-white.png"
                  alt="mioseg qr Download Logo"
                  className={styles.downloadLogo}
                />
              </div>

              <div className={styles.downloadBrandText}>
                <span className={styles.downloadBrandTitle}>mioseg qr</span>
                <span className={styles.downloadBrandSubtitle}>
                  QR-Codes speichern, organisieren und erweitern
                </span>
              </div>
            </div>

            <div className={styles.downloadButtons}>
              <Link href="/get-app" className={styles.downloadPrimaryButton}>
                Jetzt herunterladen
              </Link>
              <Link href="/datenschutz" className={styles.downloadSecondaryButton}>
                Datenschutz
              </Link>
            </div>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Scannen</div>
              <p className={styles.trustText}>
                QR-Codes direkt speichern und später wiederfinden.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Karte</div>
              <p className={styles.trustText}>
                Orte mit Scans verknüpfen und erneut ansteuern.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>QR-X</div>
              <p className={styles.trustText}>
                Inhalte nachträglich ändern, ohne neuen Code.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Business</div>
              <p className={styles.trustText}>
                Professioneller Auftritt mit Cover, Firma und Kontakt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}