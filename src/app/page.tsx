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
  <img
    src="/logo-white.png"
    alt="mioseg qr Logo"
    className={styles.heroBrandLogo}
  />
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
                    <img
                      src="/logo-white.png"
                      alt="mioseg qr Hero Logo"
                      className={styles.heroLogo}
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
          <span className={styles.sectionEyebrow}>Use Cases</span>
          <h2 className={styles.sectionTitle}>So sieht der Mehrwert im echten Alltag aus</h2>
          <p className={styles.sectionText}>
            Die App überzeugt dann am stärksten, wenn Nutzer sofort erkennen,
            warum normale QR-Codes, QR-X und Business QR-X in der Praxis völlig
            unterschiedliche Stärken haben.
          </p>
        </div>

        <div className={styles.showcaseCard}>
          <div className={styles.showcaseImageWrap}>
            <Image
              src="/use-cases-triptych.png"
              alt="Vergleich von normalen QR-Codes, flexiblem QR-X und Business QR-X im Alltag"
              width={1536}
              height={1024}
              className={styles.showcaseImage}
            />
          </div>

          <div className={styles.showcaseTextGrid}>
            <div className={styles.showcaseTextCard}>
              <div className={styles.useCaseType}>Normale QR-Codes</div>
              <h3 className={styles.useCaseTitle}>Speisekarte, WLAN, Produktlink</h3>
              <p className={styles.useCaseText}>
                Perfekt zum schnellen Öffnen eines Links. Mit mioseg qr kannst du
                solche Scans direkt speichern und später wiederfinden, statt
                dieselben Codes erneut suchen zu müssen.
              </p>
            </div>

            <div className={styles.showcaseTextCard}>
              <div className={styles.useCaseType}>QR-X</div>
              <h3 className={styles.useCaseTitle}>Event, Angebot, Fahrzeug oder Produkt</h3>
              <p className={styles.useCaseText}>
                Ein QR-X kann deutlich mehr als ein Link: Tickets, Videos,
                Galerie, Downloads, Infos und Updates in einer flexiblen Ansicht.
              </p>
            </div>

            <div className={styles.showcaseTextCard}>
              <div className={styles.useCaseType}>Business QR-X</div>
              <h3 className={styles.useCaseTitle}>Firma, Dienstleister, Fuhrpark, Restaurant</h3>
              <p className={styles.useCaseText}>
                Professionelle Darstellung mit Firmenname, Coverbild, Kontakt,
                Website, Anruf, Navigation und Medien – ideal für Vertrauen und
                bessere Conversion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Standort & Kartenansicht</span>
          <h2 className={styles.sectionTitle}>Scannen, Ort speichern und später direkt wieder hin navigieren</h2>
          <p className={styles.sectionText}>
            Einer der stärksten Alltagsvorteile von mioseg qr: Beim Scannen oder
            Erstellen kann der Standort gespeichert werden. So wird aus einem
            QR-Code nicht nur ein Link, sondern auch ein wiederfindbarer Ort.
          </p>
        </div>

        <div className={styles.locationGrid}>
          <div className={styles.locationCardFeatured}>
            <div className={styles.locationBadge}>Warum das stark ist</div>
            <h3 className={styles.locationTitleFeatured}>
              Der QR-Code bleibt nicht nur als Inhalt gespeichert, sondern auch mit seinem Ort.
            </h3>
            <p className={styles.locationTextFeatured}>
              Das ist besonders praktisch für Restaurants, Baustellen, Fahrzeuge,
              Schilder, Lagerorte, Parkplätze, Maschinen, Produkte vor Ort oder
              Fundstellen, die du später wiederfinden möchtest.
            </p>
            <ul className={styles.locationListFeatured}>
              <li>Scan mit Standort speichern</li>
              <li>gespeicherte QR-Codes auf Karte wiederfinden</li>
              <li>direkt zur Position navigieren</li>
              <li>ideal für private Nutzung und Business-Prozesse</li>
            </ul>
          </div>

          <div className={styles.locationInfoGrid}>
            <div className={styles.locationCard}>
              <h3 className={styles.featureTitle}>Standort beim Scan merken</h3>
              <p className={styles.featureText}>
                Wenn du einen QR-Code unterwegs scannst, kann die App den Ort
                direkt mit speichern. So weißt du später nicht nur was, sondern
                auch wo es war.
              </p>
            </div>

            <div className={styles.locationCard}>
              <h3 className={styles.featureTitle}>Kartenansicht statt Chaos</h3>
              <p className={styles.featureText}>
                Gespeicherte Scans lassen sich übersichtlicher verstehen, wenn
                sie zusätzlich auf einer Karte verortet sind. Das spart Zeit und
                macht die Sammlung deutlich praktischer.
              </p>
            </div>

            <div className={styles.locationCard}>
              <h3 className={styles.featureTitle}>Direkt dorthin navigieren</h3>
              <p className={styles.featureText}>
                Du findest einen gespeicherten QR-Code später wieder und kannst
                direkt zur Position zurück navigieren – besonders stark bei
                Orten, Baustellen, Fahrzeugen oder Standorten.
              </p>
            </div>

            <div className={styles.locationCard}>
              <h3 className={styles.featureTitle}>Nützlich für Alltag und Arbeit</h3>
              <p className={styles.featureText}>
                Ob Lieblingscafé, Parkplatz, Montageort, Lager, Objekt oder
                Servicepunkt: mioseg qr macht aus gescannten Codes ein
                wiederverwendbares System mit Ortsbezug.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Follower & automatische Updates</span>
          <h2 className={styles.sectionTitle}>QR-X kann Menschen binden und bei Änderungen automatisch informieren</h2>
          <p className={styles.sectionText}>
            Ein QR-X ist nicht nur eine statische Seite. Nutzer können ihm folgen,
            der Ersteller sieht die Reichweite und Änderungen können automatisch
            an Follower ausgespielt werden. Dadurch wird aus einem QR-Code ein
            echter Informationskanal.
          </p>
        </div>

        <div className={styles.followGrid}>
          <div className={styles.followCardFeatured}>
            <div className={styles.followBadge}>Besonders stark für reale Updates</div>
            <h3 className={styles.followTitleFeatured}>
              Ideal, wenn Informationen sich ändern und Menschen zuverlässig Bescheid wissen sollen.
            </h3>
            <p className={styles.followTextFeatured}>
              Ein klassischer QR-Code zeigt oft nur einen Link. Ein QR-X kann
              dagegen eine Beziehung aufbauen: Nutzer folgen dem Inhalt, der
              Ersteller sieht, wie viele Menschen interessiert sind, und
              Änderungen erreichen diese Zielgruppe automatisch.
            </p>
            <ul className={styles.followListFeatured}>
              <li>Follower-Zahl sichtbar für den Ersteller</li>
              <li>Änderungen automatisch an Follower kommunizieren</li>
              <li>mehr Relevanz als ein statischer Code</li>
              <li>ideal für wiederkehrende Informationen und Hinweise</li>
            </ul>
          </div>

          <div className={styles.followInfoGrid}>
            <div className={styles.followCard}>
              <h3 className={styles.featureTitle}>Arztpraxis &amp; Betriebsurlaub</h3>
              <p className={styles.featureText}>
                Eine Praxis kann per QR-X aktuelle Hinweise, Urlaubszeiten,
                Vertretungen oder geänderte Öffnungszeiten veröffentlichen und
                Follower automatisch informieren.
              </p>
            </div>

            <div className={styles.followCard}>
              <h3 className={styles.featureTitle}>Restaurant &amp; Öffnungszeiten</h3>
              <p className={styles.featureText}>
                Wenn sich Zeiten, Speisekarte oder Sonderaktionen ändern, bleibt
                der QR-X aktuell und interessierte Nutzer bekommen Änderungen mit.
              </p>
            </div>

            <div className={styles.followCard}>
              <h3 className={styles.featureTitle}>Fahrzeug, Produkt oder Angebot</h3>
              <p className={styles.featureText}>
                Bei Preisänderungen, neuen Bildern, Verfügbarkeiten oder Status-
                Updates können Follower direkt informiert werden.
              </p>
            </div>

            <div className={styles.followCard}>
              <h3 className={styles.featureTitle}>Events &amp; Organisation</h3>
              <p className={styles.featureText}>
                Programmänderungen, neue Uhrzeiten, Hinweise oder kurzfristige
                Infos lassen sich schnell aktualisieren und an Follower ausspielen.
              </p>
            </div>
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
            <h3 className={styles.featureTitle}>Scans mit Ort und Kontext verstehen</h3>
            <p className={styles.featureText}>
              Durch Standort, Karte und spätere Navigation ist nicht nur der
              Code selbst gespeichert, sondern auch der reale Bezug dazu.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Ideal für private und geschäftliche Nutzung</h3>
            <p className={styles.featureText}>
              Vom privaten Sammeln bis zum professionellen Firmenauftritt:
              die App deckt beide Welten sauber ab.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Mehr Ordnung durch Ordner und Historie</h3>
            <p className={styles.featureText}>
              Gespeicherte Scans, QR-X und Änderungen bleiben strukturiert statt
              in Chats, Browser-Tabs oder Notizen verloren zu gehen.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>Später wiederfinden statt neu suchen</h3>
            <p className={styles.featureText}>
              Das spart Zeit im Alltag und macht die App langfristig nützlich –
              genau deshalb bleibt sie auf dem Handy.
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
                  Deine App für Scans, QR-X, Business QR-X, Standortbezug und lebendige Updates
                </span>
              </div>
            </div>

            <div className={styles.downloadButtons}>
              <Link href="/get-app" className={styles.downloadPrimaryButton}>
                Im Store ansehen
              </Link>
              <Link href="/get-app" className={styles.downloadSecondaryButton}>
                Download-Infos
              </Link>
            </div>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>iPhone & Android</div>
              <p className={styles.trustText}>
                Für mobile Nutzung gedacht – ideal zum schnellen Scannen,
                Speichern und Wiederfinden unterwegs.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Datenschutz in der App</div>
              <p className={styles.trustText}>
                Rechtliche Inhalte sind in der App erreichbar und zusätzlich
                dezent ganz unten auf der Website verlinkt.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Standort nur mit Zustimmung</div>
              <p className={styles.trustText}>
                Ortsdaten werden nur verwendet, wenn der Nutzer sie im jeweiligen
                Vorgang aktiv freigibt.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>Ein Account, viele Vorteile</div>
              <p className={styles.trustText}>
                Gespeicherte Scans, eigene QR-X, Ordner, Medien, Updates,
                Follower und Business-Inhalte bleiben an einem Ort gebündelt.
              </p>
            </div>
          </div>

          <div className={styles.downloadBottom}>
            <div className={styles.storeHints}>
              <span className={styles.storeHint}>✓ Scan-Verlauf mit Mehrwert</span>
              <span className={styles.storeHint}>✓ QR-X statt statischer Links</span>
              <span className={styles.storeHint}>✓ Business QR-X für professionelle Nutzung</span>
              <span className={styles.storeHint}>✓ Standort, Kartenansicht und Navigation</span>
              <span className={styles.storeHint}>✓ Follower und automatische Update-Infos</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}