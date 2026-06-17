import Link from "next/link";
import styles from "./get-app.module.css";

export default function GetAppPage() {
  const appStoreUrl = "#";
  const googlePlayUrl = "#";

  const isAppStoreLive = appStoreUrl !== "#";
  const isGooglePlayLive = googlePlayUrl !== "#";

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.animatedGlowOne} />
        <div className={styles.animatedGlowTwo} />

        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <span className={styles.badge}>mioseg qr · App Download</span>

              <h1 className={styles.title}>
                Hol dir die mioseg qr App
                <br />
                für iPhone und Android.
              </h1>

              <p className={styles.text}>
                Scanne QR-Codes, speichere Inhalte, erstelle eigene QR-X und nutze
                Business QR-X mit professioneller Webansicht, Kontaktfunktionen,
                Medien und flexibler Verwaltung.
              </p>

              <div className={styles.storeBadgeRow}>
                <a
                  href={appStoreUrl}
                  className={`${styles.storeBadge} ${
                    !isAppStoreLive ? styles.storeBadgeDisabled : ""
                  }`}
                  aria-disabled={!isAppStoreLive}
                >
                  <span className={styles.storeBadgeIcon}></span>
                  <span className={styles.storeBadgeTextWrap}>
                    <span className={styles.storeBadgeSmall}>Laden im</span>
                    <span className={styles.storeBadgeBig}>App Store</span>
                  </span>
                </a>

                <a
                  href={googlePlayUrl}
                  className={`${styles.storeBadge} ${
                    !isGooglePlayLive ? styles.storeBadgeDisabled : ""
                  }`}
                  aria-disabled={!isGooglePlayLive}
                >
                  <span className={styles.storeBadgePlay}>▶</span>
                  <span className={styles.storeBadgeTextWrap}>
                    <span className={styles.storeBadgeSmall}>Jetzt bei</span>
                    <span className={styles.storeBadgeBig}>Google Play</span>
                  </span>
                </a>
              </div>

              <div className={styles.buttonRow}>
                <a
                  href={appStoreUrl}
                  className={`${styles.primaryButton} ${
                    !isAppStoreLive ? styles.buttonDisabled : ""
                  }`}
                  aria-disabled={!isAppStoreLive}
                >
                  Im App Store
                </a>

                <a
                  href={googlePlayUrl}
                  className={`${styles.secondaryButton} ${
                    !isGooglePlayLive ? styles.buttonDisabled : ""
                  }`}
                  aria-disabled={!isGooglePlayLive}
                >
                  Bei Google Play
                </a>
              </div>

              <div className={styles.heroFacts}>
                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>Scannen</strong>
                  <span className={styles.factText}>
                    QR-Codes speichern statt später neu suchen
                  </span>
                </div>

                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>QR-X</strong>
                  <span className={styles.factText}>
                    Inhalte später ändern, ohne neuen Code
                  </span>
                </div>

                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>Business</strong>
                  <span className={styles.factText}>
                    Professioneller Auftritt mit Kontakt und Medien
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.previewWrap}>
              <div className={styles.phoneShell}>
                <div className={styles.phoneNotch} />

                <div className={styles.phoneScreen}>
                  <div className={styles.phoneTopBar}>
                    <span className={styles.phoneTime}>9:41</span>
                    <div className={styles.phoneStatusIcons}>
                      <span>▂▄▆█</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  <div className={styles.phoneHeroCard}>
                    <div className={styles.phoneLogoWrap}>
                      <img
                        src="/logo-wwhite.png"
                        alt="mioseg qr Logo"
                        className={styles.phoneLogo}
                      />
                    </div>

                    <div className={styles.phoneBrandText}>
                      <div className={styles.phoneBrandTitle}>mioseg qr</div>
                      <div className={styles.phoneBrandSubTitle}>
                        QR-Codes speichern, organisieren und erweitern
                      </div>
                    </div>
                  </div>

                  <div className={styles.phoneMainCard}>
                    <div className={styles.phoneOverline}>Die App auf einen Blick</div>
                    <h3 className={styles.phoneCardTitle}>
                      Moderne QR-Workflows in einer App
                    </h3>
                    <p className={styles.phoneCardText}>
                      Scans, gespeicherte Inhalte, eigene QR-X und Business-Funktionen
                      übersichtlich in einer App.
                    </p>
                  </div>

                  <div className={styles.phoneMiniGrid}>
                    <div className={styles.phoneMiniCard}>
                      <div className={styles.phoneMiniTitle}>Scans</div>
                      <div className={styles.phoneMiniText}>
                        Speichern &amp; wiederfinden
                      </div>
                    </div>

                    <div className={styles.phoneMiniCard}>
                      <div className={styles.phoneMiniTitle}>QR-X</div>
                      <div className={styles.phoneMiniText}>
                        Flexibel aktualisieren
                      </div>
                    </div>
                  </div>

                  <div className={styles.phoneChipRow}>
                    <span className={styles.phoneChip}>Scannen</span>
                    <span className={styles.phoneChip}>Speichern</span>
                    <span className={styles.phoneChip}>Business</span>
                  </div>

                  <div className={styles.phoneBottomNav}>
                    <span className={styles.navDotActive} />
                    <span className={styles.navDot} />
                    <span className={styles.navDot} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.noticeCard}>
            <p className={styles.noticeTitle}>Hinweis</p>
            <p className={styles.noticeText}>
              Die finalen Store-Links kannst du hier später einfach einsetzen.
              Solange deine App noch nicht live ist, kannst du hier auch TestFlight,
              Beta-Links oder einen kurzen Hinweis zum baldigen Start anzeigen.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.previewSection}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>App Einblicke</span>
            <h2 className={styles.sectionTitle}>
              Zeig direkt, was Nutzer in der App erwartet
            </h2>
            <p className={styles.sectionText}>
              Hier kannst du echte Screenshots deiner App einsetzen. Das macht die
              Seite glaubwürdiger und deutlich hochwertiger.
            </p>
          </div>

          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/scan-screen.jpg"
                  alt="Scan Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>Scannen</div>
                <h3 className={styles.previewCardTitle}>QR-Codes schnell erfassen</h3>
                <p className={styles.previewCardText}>
                  Direkt scannen, benennen und dauerhaft in der App behalten.
                </p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/map-screen.jpg"
                  alt="Map Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>Karte</div>
                <h3 className={styles.previewCardTitle}>Standorte wiederfinden</h3>
                <p className={styles.previewCardText}>
                  Gespeicherte Scans auf der Karte sehen und später direkt zurück
                  navigieren.
                </p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/create-screen.jpg"
                  alt="Create Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>Erstellen</div>
                <h3 className={styles.previewCardTitle}>Eigene QR-X anlegen</h3>
                <p className={styles.previewCardText}>
                  Eigene Inhalte mit Text, Bildern und Medien flexibel gestalten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>Was dich erwartet</span>
            <h2 className={styles.sectionTitle}>Eine App für moderne QR-Workflows</h2>
            <p className={styles.sectionText}>
              mioseg qr verbindet klassisches Scannen mit einer eigenen QR-X
              Plattform für private Nutzer und Unternehmen.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCardFeatured}>
              <div className={styles.featureCardLabel}>Besonders stark</div>
              <h3 className={styles.featureCardFeaturedTitle}>
                Mehr als ein QR-Scanner
              </h3>
              <p className={styles.featureCardFeaturedText}>
                Die App verbindet klassisches Speichern mit QR-X, Business-Funktionen,
                Kartenansicht und strukturierter Verwaltung.
              </p>
              <div className={styles.featureList}>
                <div className={styles.featureListItem}>
                  ✓ Scannen &amp; dauerhaft speichern
                </div>
                <div className={styles.featureListItem}>
                  ✓ Eigene QR-X flexibel pflegen
                </div>
                <div className={styles.featureListItem}>
                  ✓ Business QR-X professionell nutzen
                </div>
              </div>
            </div>

            <div className={styles.featureCardColumn}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Scannen &amp; Speichern</h3>
                <p className={styles.cardText}>
                  Erfasse QR-Codes, speichere sie dauerhaft und organisiere sie
                  übersichtlich in deiner App.
                </p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Eigene QR-X erstellen</h3>
                <p className={styles.cardText}>
                  Erstelle eigene Inhalte mit Texten, Bildern, PDFs, MP3 oder MP4
                  und pflege sie flexibel weiter.
                </p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Business QR-X</h3>
                <p className={styles.cardText}>
                  Nutze professionelle Webansichten mit Firmenname, Coverbild,
                  Kontaktbuttons und modernem Business-Look.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLeft}>
              <span className={styles.sectionEyebrow}>Download &amp; Verfügbarkeit</span>
              <h2 className={styles.sectionTitle}>Bald oder bereits verfügbar</h2>
              <p className={styles.infoText}>
                Hier kannst du später deine offiziellen Store-Links hinterlegen und
                Besucher direkt zum richtigen App-Store weiterleiten.
              </p>
              <p className={styles.infoSubText}>
                Noch nicht live? Dann kannst du hier vorübergehend auch einen Hinweis
                wie „Demnächst im App Store und bei Google Play verfügbar“ anzeigen.
              </p>
            </div>

            <div className={styles.infoBoxRight}>
              <div className={styles.miniStatusCard}>
                <div className={styles.miniStatusLabel}>Aktueller Status</div>
                <div className={styles.miniStatusValue}>Coming Soon / Beta möglich</div>
              </div>

              <div className={styles.inlineLinks}>
                <Link href="/" className={styles.inlineLink}>
                  Zur Startseite
                </Link>
                <Link href="/datenschutz" className={styles.inlineLink}>
                  Datenschutz
                </Link>
                <Link href="/nutzungsbedingungen" className={styles.inlineLink}>
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