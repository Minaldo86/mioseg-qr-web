import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";

import LanguageSwitcher from "../../components/LanguageSwitcher";
import { defaultLocale, isValidLocale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Home({ params }: Props) {
  const resolvedParams = await params;
  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  const t = getDictionary(locale);
  const heroStory =
    locale === "de"
      ? {
          badge: "Neue Hero Experience",
          scanLabel: "QR-Code erkannt",
          scanTitle: "Wohnung QR-X",
          scanText: "Exposé, Bilder, Dateien und Kontakt direkt öffnen.",
          folderLabel: "Gespeichert",
          folderTitle: "Ordner: Wohnungen",
          mapLabel: "Standort gemerkt",
          mapTitle: "Scan auf der Karte",
          detailLabel: "QR-X Detailansicht",
          detailTitle: "Alle Infos an einem Ort",
          detail1: "Bilder & Grundriss",
          detail2: "PDF-Dateien",
          detail3: "Ansprechpartner",
          flow1: "Scannen",
          flow2: "Speichern",
          flow3: "Wiederfinden",
        }
      : {
          badge: "New hero experience",
          scanLabel: "QR code detected",
          scanTitle: "Apartment QR-X",
          scanText: "Open exposé, images, files and contact instantly.",
          folderLabel: "Saved",
          folderTitle: "Folder: Apartments",
          mapLabel: "Location saved",
          mapTitle: "Scan on the map",
          detailLabel: "QR-X detail view",
          detailTitle: "Everything in one place",
          detail1: "Images & floor plan",
          detail2: "PDF files",
          detail3: "Contact person",
          flow1: "Scan",
          flow2: "Save",
          flow3: "Find again",
        };

  const realLifeUseCases =
    locale === "de"
      ? [
          {
            icon: "🏠",
            label: "Immobilien",
            title: "Wohnung oder Haus digital zeigen",
            text: "Ein QR-X an der Wohnung öffnet Exposé, Bilder, Grundriss, Energieausweis, Ansprechpartner und Standort – alles sofort abrufbar.",
            chips: ["Exposé", "PDF-Dateien", "Kontakt"],
          },
          {
            icon: "🍽️",
            label: "Gastronomie",
            title: "Speisekarte, Reservierung und Updates",
            text: "Restaurants können Speisekarten, Aktionen, Öffnungszeiten und Reservierungslinks über einen dynamischen QR-X aktuell halten.",
            chips: ["Speisekarte", "Reservierungslink", "Öffnungszeiten"],
          },
          {
            icon: "🚗",
            label: "Fahrzeuge",
            title: "Fahrzeugdaten direkt am Auto",
            text: "Autoverkäufer zeigen Ausstattung, Bilder, Videos, Preisänderungen und Kontakt direkt über einen QR-X am Fahrzeug.",
            chips: ["Bilder", "Ausstattung", "Preisupdate"],
          },
          {
            icon: "🎉",
            label: "Events",
            title: "Infos, Lageplan und Änderungen",
            text: "Veranstalter teilen Programm, Tickets, Lageplan und kurzfristige Änderungen – Nutzer speichern den QR-X und bleiben informiert.",
            chips: ["Tickets", "Programm", "Updates"],
          },
          {
            icon: "🏢",
            label: "Unternehmen",
            title: "Digitale Visitenkarte mit Mehrwert",
            text: "Unternehmen verbinden Kontakt, Leistungen, Website, Anfahrt und aktuelle Angebote in einem einzigen QR-X.",
            chips: ["Kontakt", "Leistungen", "Anfahrt"],
          },
          {
            icon: "📍",
            label: "Alltag",
            title: "Scannen, speichern, wiederfinden",
            text: "Nutzer verlieren interessante QR-Codes nicht mehr. Sie speichern sie in Ordnern und sehen später auf der Karte, wo sie gescannt wurden.",
            chips: ["Ordner", "Karte", "Verlauf"],
          },
          {
            icon: "🔐",
            label: "Privat teilen",
            title: "QR-X optional mit Passwort schützen",
            text: "Sensible Inhalte wie Exposés, interne Dateien oder private Eventinfos können nur für Personen sichtbar sein, die das Passwort kennen.",
            chips: ["Passwort", "Privat", "Kontrollierter Zugriff"],
          },
        ]
      : [
          {
            icon: "🏠",
            label: "Real estate",
            title: "Show apartments and houses digitally",
            text: "A QR-X at the property opens exposé, images, floor plan, energy certificate, contact and location instantly.",
            chips: ["Exposé", "PDF files", "Contact"],
          },
          {
            icon: "🍽️",
            label: "Restaurants",
            title: "Menu, booking and updates",
            text: "Restaurants can keep menus, offers, opening hours and booking links up to date through one dynamic QR-X.",
            chips: ["Menu", "Booking link", "Hours"],
          },
          {
            icon: "🚗",
            label: "Vehicles",
            title: "Vehicle details directly at the car",
            text: "Car sellers show specs, images, videos, price updates and contact directly through a QR-X on the vehicle.",
            chips: ["Images", "Specs", "Price update"],
          },
          {
            icon: "🎉",
            label: "Events",
            title: "Info, map and changes",
            text: "Organizers share program, tickets, venue map and last-minute updates. Users save the QR-X and stay informed.",
            chips: ["Tickets", "Program", "Updates"],
          },
          {
            icon: "🏢",
            label: "Business",
            title: "A digital business card with value",
            text: "Businesses connect contact, services, website, directions and current offers in one single QR-X.",
            chips: ["Contact", "Services", "Directions"],
          },
          {
            icon: "📍",
            label: "Everyday use",
            title: "Scan, save, find again",
            text: "Users no longer lose interesting QR codes. They save them in folders and later see where they scanned them on the map.",
            chips: ["Folders", "Map", "History"],
          },
          {
            icon: "🔐",
            label: "Private sharing",
            title: "Protect QR-X with an optional password",
            text: "Sensitive content such as exposés, internal files or private event information can be visible only to people who know the password.",
            chips: ["Password", "Private", "Controlled access"],
          },
        ];

  const conversionReasons =
    locale === "de"
      ? [
          {
            icon: "📁",
            title: "QR-Codes gehen nicht mehr verloren",
            text: "Scans werden gespeichert, sortiert und später wiedergefunden.",
          },
          {
            icon: "📍",
            title: "Jeder Scan bekommt Kontext",
            text: "Du siehst auf der Karte, wo ein QR-Code gescannt wurde.",
          },
          {
            icon: "🔔",
            title: "QR-X kann sich aktualisieren",
            text: "Gespeicherte QR-X können neue Informationen und Änderungen anzeigen.",
          },
          {
            icon: "🔐",
            title: "Optional privat teilen",
            text: "Sensible QR-X können später mit Passwortschutz abgesichert werden.",
          },
        ]
      : [
          {
            icon: "📁",
            title: "QR codes no longer get lost",
            text: "Scans are saved, sorted and easy to find again later.",
          },
          {
            icon: "📍",
            title: "Every scan gets context",
            text: "You can see on the map where a QR code was scanned.",
          },
          {
            icon: "🔔",
            title: "QR-X can update over time",
            text: "Saved QR-X can show new information and changes.",
          },
          {
            icon: "🔐",
            title: "Optionally private sharing",
            text: "Sensitive QR-X can later be protected with a password.",
          },
        ];

  const trustPoints =
    locale === "de"
      ? ["Keine Abo-Pflicht", "Credits statt monatlicher Kosten", "Für Alltag und Business", "Dynamische QR-X mit Updates"]
      : ["No subscription required", "Credits instead of monthly fees", "For everyday and business use", "Dynamic QR-X with updates"];


  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto 18px auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <LanguageSwitcher currentLocale={locale} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTextWrap}>
            <div className={styles.brandBadgeWrap}>
              <img
                src="/logo-white.png"
                alt={`${t.common.appName} Logo`}
                className={styles.heroBrandLogo}
              />
            </div>

            <h1 className={styles.heroTitle}>
              {t.home.hero.title1}
              <br />
              {t.home.hero.title2}
            </h1>

            <p className={styles.heroText}>{t.home.hero.text}</p>

            <div className={styles.heroButtons}>
              <Link href="/get-app" className={styles.primaryButton}>
                {t.home.hero.ctaPrimary}
              </Link>
              <Link href={`/${locale}#features`} className={styles.secondaryButton}>
                {t.home.hero.ctaSecondary}
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factScanTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factScanText}</span>
              </div>

              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factMapTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factMapText}</span>
              </div>

              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factQrxTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factQrxText}</span>
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

                <div className="miosegHeroScene">
                  <div className="miosegHeroBadge">{heroStory.badge}</div>

                  <div className="miosegScanBeam" />

                  <div className="miosegQrCard">
                    <div className="miosegQrVisual" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <div>
                      <div className="miosegMiniLabel">{heroStory.scanLabel}</div>
                      <h3>{heroStory.scanTitle}</h3>
                      <p>{heroStory.scanText}</p>
                    </div>
                  </div>

                  <div className="miosegDetailCard">
                    <div className="miosegMiniLabel">{heroStory.detailLabel}</div>
                    <h3>{heroStory.detailTitle}</h3>

                    <div className="miosegDetailRows">
                      <span>🏠 {heroStory.detail1}</span>
                      <span>📄 {heroStory.detail2}</span>
                      <span>👤 {heroStory.detail3}</span>
                    </div>
                  </div>

                  <div className="miosegFlowRow">
                    <span>{heroStory.flow1}</span>
                    <span>{heroStory.flow2}</span>
                    <span>{heroStory.flow3}</span>
                  </div>

                  <div className="miosegHeroMiniGrid">
                    <div className="miosegFolderCard">
                      <span className="miosegMiniIcon">📁</span>
                      <div>
                        <div className="miosegMiniLabel">{heroStory.folderLabel}</div>
                        <strong>{heroStory.folderTitle}</strong>
                      </div>
                    </div>

                    <div className="miosegMapCard">
                      <span className="miosegMiniIcon">📍</span>
                      <div>
                        <div className="miosegMiniLabel">{heroStory.mapLabel}</div>
                        <strong>{heroStory.mapTitle}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.features.eyebrow}</span>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
            {t.home.features.title}
          </h2>
          <p className={styles.sectionText}>{t.home.features.text}</p>
        </div>

        <div className={styles.featureStack}>
          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/scan-screen.jpg"
                alt={t.home.features.item1Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item1Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item1Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item1Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/map-screen.jpg"
                alt={t.home.features.item2Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item2Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item2Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item2Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/updates-screen.jpg"
                alt={t.home.features.item3Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item3Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item3Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item3Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/create-screen.jpg"
                alt={t.home.features.item4Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item4Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item4Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item4Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>
            {locale === "de" ? "Anwendungsfälle" : "Use cases"}
          </span>
          <h2 className={styles.sectionTitle}>
            {locale === "de"
              ? "Ein QR-X. Unzählige Möglichkeiten."
              : "One QR-X. Countless possibilities."}
          </h2>
          <p className={styles.sectionText}>
            {locale === "de"
              ? "Mioseg qr zeigt nicht nur einen Link. Jeder QR-X kann zu einem digitalen Bereich werden – mit Dateien, Bildern, Standort, Kontakt, Updates und Ordnerverwaltung."
              : "Mioseg qr is not just a link. Every QR-X can become a digital space with files, images, location, contact, updates and folder organization."}
          </p>
        </div>

        <div className="miosegUseCaseGrid">
          {realLifeUseCases.map((item, index) => (
            <article
              key={item.label}
              className="miosegUseCaseCard"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="miosegUseCaseTop">
                <div className="miosegUseCaseIcon">{item.icon}</div>
                <div>
                  <div className="miosegUseCaseLabel">{item.label}</div>
                  <h3>{item.title}</h3>
                </div>
              </div>

              <p>{item.text}</p>

              <div className="miosegUseCaseChips">
                {item.chips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="miosegUseCaseStory">
          <div className="miosegStoryPhone">
            <div className="miosegStoryHeader">
              <span />
              <span />
              <span />
            </div>

            <div className="miosegStoryScan">
              <div className="miosegStoryQr">QR</div>
              <div>
                <strong>{locale === "de" ? "QR-X wurde geöffnet" : "QR-X opened"}</strong>
                <p>{locale === "de" ? "Wohnung am Stadtpark" : "Apartment near the park"}</p>
              </div>
            </div>

            <div className="miosegStoryList">
              <span>🏠 {locale === "de" ? "Exposé" : "Exposé"}</span>
              <span>📄 {locale === "de" ? "Dokumente" : "Documents"}</span>
              <span>📍 {locale === "de" ? "Scan-Standort" : "Scan location"}</span>
              <span>📁 {locale === "de" ? "Ordner gespeichert" : "Saved to folder"}</span>
              <span>🔐 {locale === "de" ? "Optional passwortgeschützt" : "Optional password protection"}</span>
            </div>
          </div>

          <div className="miosegStoryText">
            <span className={styles.sectionEyebrow}>
              {locale === "de" ? "Der Aha-Moment" : "The aha moment"}
            </span>
            <h3>
              {locale === "de"
                ? "Der Nutzer scannt einmal – und verliert die Information nie wieder."
                : "The user scans once — and never loses the information again."}
            </h3>
            <p>
              {locale === "de"
                ? "Genau hier wird Mioseg qr besonders: QR-Codes werden gespeichert, sortiert, auf der Karte sichtbar und können sich durch QR-X Updates weiterentwickeln."
                : "This is where Mioseg qr becomes special: QR codes are saved, sorted, visible on the map and can evolve through QR-X updates."}
            </p>
            <Link href="/get-app" className={styles.primaryButton}>
              {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.target.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.target.title}</h2>
          <p className={styles.sectionText}>{t.home.target.text}</p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card1Title}</h3>
            <p className={styles.featureText}>{t.home.target.card1Text}</p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card2Title}</h3>
            <p className={styles.featureText}>{t.home.target.card2Text}</p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card3Title}</h3>
            <p className={styles.featureText}>{t.home.target.card3Text}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>
            {locale === "de" ? "So fühlt sich Mioseg qr an" : "How Mioseg qr feels"}
          </span>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
            {locale === "de"
              ? "Ein Scan wird zu einem digitalen Erlebnis."
              : "A scan becomes a digital experience."}
          </h2>
          <p className={styles.sectionText}>
            {locale === "de"
              ? "Mioseg qr verbindet QR-Code, Detailansicht, Ordner, Karte, Updates und optionalen Passwortschutz zu einem Ablauf, den Nutzer sofort verstehen."
              : "Mioseg qr connects QR code, detail view, folders, map, updates and optional password protection into one flow users understand instantly."}
          </p>
        </div>

        <div className="miosegMotionBoard">
          <div className="miosegMotionTrack">
            <div className="miosegMotionStep">
              <span>1</span>
              <strong>{locale === "de" ? "QR-Code scannen" : "Scan QR code"}</strong>
              <p>{locale === "de" ? "Kamera öffnen und QR-X erkennen." : "Open camera and detect QR-X."}</p>
            </div>

            <div className="miosegMotionConnector" />

            <div className="miosegMotionStep">
              <span>2</span>
              <strong>{locale === "de" ? "Detailbereich öffnen" : "Open detail view"}</strong>
              <p>{locale === "de" ? "Bilder, Dateien, Kontakt und CTA sehen." : "View images, files, contact and CTA."}</p>
            </div>

            <div className="miosegMotionConnector" />

            <div className="miosegMotionStep">
              <span>3</span>
              <strong>{locale === "de" ? "Speichern & wiederfinden" : "Save & find again"}</strong>
              <p>{locale === "de" ? "Ordner, Karte, Updates und Passwortschutz." : "Folders, map, updates and password protection."}</p>
            </div>
          </div>

          <div className="miosegAnimatedProduct">
            <div className="miosegFloatingQr">
              <div className="miosegQrVisual" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="miosegPulseRing" />
            </div>

            <div className="miosegProductPanel miosegPanelDetail">
              <div className="miosegMiniLabel">{locale === "de" ? "QR-X geöffnet" : "QR-X opened"}</div>
              <strong>{locale === "de" ? "Wohnung am Park" : "Apartment at the park"}</strong>
              <span>🏠 {locale === "de" ? "Exposé · Dateien · Kontakt" : "Exposé · Files · Contact"}</span>
            </div>

            <div className="miosegProductPanel miosegPanelFolder">
              <div className="miosegMiniLabel">{locale === "de" ? "Automatisch organisiert" : "Automatically organized"}</div>
              <strong>📁 {locale === "de" ? "Ordner Wohnungen" : "Folder Apartments"}</strong>
            </div>

            <div className="miosegProductPanel miosegPanelMap">
              <div className="miosegMiniLabel">{locale === "de" ? "Standort sichtbar" : "Location visible"}</div>
              <strong>📍 {locale === "de" ? "Scan auf Karte" : "Scan on map"}</strong>
            </div>

            <div className="miosegProductPanel miosegPanelLock">
              <div className="miosegMiniLabel">{locale === "de" ? "Privater QR-X" : "Private QR-X"}</div>
              <strong>🔐 {locale === "de" ? "Passwort aktiv" : "Password active"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.compare.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.compare.title}</h2>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <div className={styles.compareLabel}>{t.home.compare.normalLabel}</div>
            <h3 className={styles.compareTitle}>{t.home.compare.normalTitle}</h3>
            <ul className={styles.compareList}>
              <li>{t.home.compare.normal1}</li>
              <li>{t.home.compare.normal2}</li>
              <li>{t.home.compare.normal3}</li>
            </ul>
          </div>

          <div className={styles.compareCardFeatured}>
            <div className={styles.compareLabelFeatured}>{t.home.compare.qrxLabel}</div>
            <h3 className={styles.compareTitleFeatured}>{t.home.compare.qrxTitle}</h3>
            <ul className={styles.compareListFeatured}>
              <li>{t.home.compare.qrx1}</li>
              <li>{t.home.compare.qrx2}</li>
              <li>{t.home.compare.qrx3}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.pricing.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.pricing.title}</h2>
          <p className={styles.sectionText}>{t.home.pricing.text}</p>
        </div>

        <div className={styles.pricingWrap}>
          <div className={styles.pricingCardPrimary}>
            <h3 className={styles.pricingTitle}>{t.home.pricing.howTitle}</h3>
            <ul className={styles.pricingList}>
              <li>{t.home.pricing.how1}</li>
              <li>{t.home.pricing.how2}</li>
              <li>{t.home.pricing.how3}</li>
            </ul>
          </div>

          <div className={styles.pricingCardSecondary}>
            <h3 className={styles.pricingTitle}>{t.home.pricing.benefitsTitle}</h3>
            <ul className={styles.pricingList}>
              <li>{t.home.pricing.benefits1}</li>
              <li>{t.home.pricing.benefits2}</li>
              <li>{t.home.pricing.benefits3}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="miosegConversionSection">
        <div className="miosegConversionCard">
          <div className="miosegConversionText">
            <span className={styles.sectionEyebrow}>
              {locale === "de" ? "Warum Nutzer bleiben" : "Why users stay"}
            </span>

            <h2>
              {locale === "de"
                ? "Nicht nur scannen. Merken, ordnen und wiederfinden."
                : "Don’t just scan. Save, organize and find again."}
            </h2>

            <p>
              {locale === "de"
                ? "Mioseg qr wird dann unverzichtbar, wenn ein QR-Code nicht nur einmal geöffnet, sondern später wieder gebraucht wird – mit Ort, Ordner, Updates und QR-X Detailbereich."
                : "Mioseg qr becomes essential when a QR code is not just opened once, but needed again later — with location, folders, updates and QR-X details."}
            </p>

            <div className="miosegTrustPills">
              {trustPoints.map((point) => (
                <span key={point}>✓ {point}</span>
              ))}
            </div>

            <div className="miosegConversionActions">
              <Link href="/get-app" className={styles.primaryButton}>
                {t.home.download.ctaPrimary}
              </Link>
              <Link href={`/${locale}/explore`} className={styles.secondaryButton}>
                {locale === "de" ? "Explore ansehen" : "View Explore"}
              </Link>
            </div>
          </div>

          <div className="miosegConversionReasons">
            {conversionReasons.map((item, index) => (
              <article
                key={item.title}
                className="miosegConversionReason"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div>{item.icon}</div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="miosegFinalCta">
          <div>
            <span className={styles.sectionEyebrow}>
              {locale === "de" ? "Der nächste Schritt" : "The next step"}
            </span>
            <h2>
              {locale === "de"
                ? "Baue dir dein eigenes digitales QR-Gedächtnis."
                : "Build your own digital QR memory."}
            </h2>
            <p>
              {locale === "de"
                ? "Scanne QR-Codes, speichere wichtige Inhalte, finde Orte wieder und erstelle eigene QR-X für Menschen, Kunden oder Interessenten."
                : "Scan QR codes, save important content, find places again and create your own QR-X for people, customers or prospects."}
            </p>
          </div>

          <Link href="/get-app" className={styles.downloadPrimaryButton}>
            {t.home.hero.ctaPrimary}
          </Link>
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div className={styles.downloadTop}>
            <div className={styles.downloadBrand}>
              <div className={styles.downloadLogoWrap}>
                <img
                  src="/logo-white.png"
                  alt={`${t.common.appName} Download Logo`}
                  className={styles.downloadLogo}
                />
              </div>

              <div className={styles.downloadBrandText}>
                <span className={styles.downloadBrandTitle}>{t.common.appName}</span>
                <span className={styles.downloadBrandSubtitle}>
                  {t.home.download.brandSubtitle}
                </span>
              </div>
            </div>

            <div className={styles.downloadButtons}>
              <Link href="/get-app" className={styles.downloadPrimaryButton}>
                {t.home.download.ctaPrimary}
              </Link>
              <Link href="/datenschutz" className={styles.downloadSecondaryButton}>
                {t.home.download.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card1Title}</div>
              <p className={styles.trustText}>{t.home.download.card1Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card2Title}</div>
              <p className={styles.trustText}>{t.home.download.card2Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card3Title}</div>
              <p className={styles.trustText}>{t.home.download.card3Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card4Title}</div>
              <p className={styles.trustText}>{t.home.download.card4Text}</p>
            </div>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.miosegHeroScene {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 4px;
  overflow: hidden;
}

.miosegHeroBadge {
  width: fit-content;
  border-radius: 999px;
  padding: 8px 12px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.miosegScanBeam {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 92px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 132, 201, 0), rgba(117, 210, 255, 0.95), rgba(77, 132, 201, 0));
  box-shadow: 0 0 24px rgba(117, 210, 255, 0.85);
  animation: miosegScanMove 3.4s ease-in-out infinite;
  z-index: 3;
}

.miosegQrCard,
.miosegDetailCard,
.miosegFolderCard,
.miosegMapCard {
  position: relative;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.045));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(18px);
}

.miosegQrCard {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 14px;
  align-items: center;
  padding: 14px;
  animation: miosegFloat 5.2s ease-in-out infinite;
}

.miosegQrVisual {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(13, 23, 38, 0.08), 0 18px 34px rgba(0, 0, 0, 0.20);
}

.miosegQrVisual span {
  border-radius: 6px;
  background: #0d1726;
}

.miosegQrVisual span:nth-child(2),
.miosegQrVisual span:nth-child(4),
.miosegQrVisual span:nth-child(8) {
  background: #4d84c9;
}

.miosegQrCard h3,
.miosegDetailCard h3 {
  margin: 4px 0 6px;
  color: #ffffff;
  font-size: 20px;
  line-height: 1.15;
  letter-spacing: -0.35px;
}

.miosegQrCard p {
  margin: 0;
  color: #b9c8da;
  font-size: 13px;
  line-height: 1.55;
}

.miosegMiniLabel {
  color: #8fc7ff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.miosegDetailCard {
  padding: 16px;
  animation: miosegFloatAlt 5.8s ease-in-out infinite;
}

.miosegDetailRows {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.miosegDetailRows span {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 14px;
  color: #edf6ff;
  background: rgba(13, 23, 38, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  font-weight: 800;
}

.miosegFlowRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.miosegFlowRow span {
  min-height: 38px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #07101f;
  background: linear-gradient(180deg, #ffffff, #dbeafe);
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.14);
}

.miosegHeroMiniGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.miosegFolderCard,
.miosegMapCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  min-height: 74px;
}

.miosegMiniIcon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 20px;
}

.miosegFolderCard strong,
.miosegMapCard strong {
  display: block;
  margin-top: 3px;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.25;
}

@keyframes miosegScanMove {
  0%, 100% {
    transform: translateY(-24px);
    opacity: 0.28;
  }
  45%, 55% {
    opacity: 1;
  }
  50% {
    transform: translateY(145px);
  }
}

@keyframes miosegFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes miosegFloatAlt {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(7px) translateX(3px);
  }
}


.miosegUseCaseGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
}

.miosegUseCaseCard {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9fd 100%);
  border: 1px solid rgba(218, 228, 240, 0.95);
  box-shadow: 0 22px 54px rgba(14, 23, 38, 0.08);
  animation: miosegUseCaseIn 680ms ease both;
}

.miosegUseCaseCard::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: radial-gradient(circle at 18% 0%, rgba(77, 132, 201, 0.18), transparent 34%);
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
}

.miosegUseCaseCard:hover::before {
  opacity: 1;
}

.miosegUseCaseCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 68px rgba(14, 23, 38, 0.12);
}

.miosegUseCaseTop {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.miosegUseCaseIcon {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #0d1726 0%, #17304d 100%);
  box-shadow: 0 14px 30px rgba(13, 23, 38, 0.18);
  font-size: 25px;
}

.miosegUseCaseLabel {
  color: #4d84c9;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.miosegUseCaseCard h3 {
  margin: 0;
  color: #0d1726;
  font-size: 21px;
  line-height: 1.16;
  letter-spacing: -0.35px;
}

.miosegUseCaseCard p {
  position: relative;
  margin: 0;
  color: #5d6b7d;
  font-size: 15px;
  line-height: 1.72;
}

.miosegUseCaseChips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.miosegUseCaseChips span {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 11px;
  border-radius: 999px;
  color: #17304d;
  background: #eef4fb;
  border: 1px solid #dbe7f4;
  font-size: 12px;
  font-weight: 900;
}

.miosegUseCaseStory {
  max-width: 1180px;
  margin: 28px auto 0;
  border-radius: 34px;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 28px;
  align-items: center;
  background: linear-gradient(135deg, #0d1726 0%, #17304d 58%, #254c76 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 28px 76px rgba(13, 23, 38, 0.18);
  overflow: hidden;
  position: relative;
}

.miosegUseCaseStory::after {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  right: -140px;
  top: -180px;
  background: radial-gradient(circle, rgba(117, 210, 255, 0.22), transparent 62%);
  pointer-events: none;
}

.miosegStoryPhone {
  position: relative;
  z-index: 1;
  border-radius: 34px;
  padding: 16px;
  background: rgba(7, 16, 31, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 22px 60px rgba(0,0,0,0.22);
}

.miosegStoryHeader {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.miosegStoryHeader span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.36);
}

.miosegStoryScan {
  display: flex;
  gap: 14px;
  align-items: center;
  border-radius: 24px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.10);
}

.miosegStoryQr {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: #ffffff;
  color: #0d1726;
  font-weight: 950;
  letter-spacing: -1px;
}

.miosegStoryScan strong {
  display: block;
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 4px;
}

.miosegStoryScan p {
  margin: 0;
  color: #b9c8da;
  font-size: 13px;
}

.miosegStoryList {
  display: grid;
  gap: 9px;
  margin-top: 14px;
}

.miosegStoryList span {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.09);
  color: #edf6ff;
  font-weight: 850;
  font-size: 13px;
}

.miosegStoryText {
  position: relative;
  z-index: 1;
}

.miosegStoryText h3 {
  margin: 10px 0 12px;
  color: #ffffff;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.02;
  letter-spacing: -1.1px;
}

.miosegStoryText p {
  max-width: 650px;
  color: #d6e4f5;
  font-size: 17px;
  line-height: 1.72;
  margin: 0 0 22px;
}

@keyframes miosegUseCaseIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


.miosegUseCaseCard,
.miosegStoryPhone,
.miosegMotionStep,
.miosegProductPanel {
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}

.miosegMotionBoard {
  max-width: 1180px;
  margin: 0 auto;
  border-radius: 36px;
  padding: 28px;
  background: linear-gradient(135deg, rgba(13, 23, 38, 0.96) 0%, rgba(23, 48, 77, 0.96) 58%, rgba(37, 76, 118, 0.96) 100%);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 30px 86px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  position: relative;
}

.miosegMotionBoard::before {
  content: "";
  position: absolute;
  inset: -30%;
  background:
    radial-gradient(circle at 20% 30%, rgba(117, 210, 255, 0.18), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.12), transparent 24%);
  animation: miosegBoardGlow 8s ease-in-out infinite alternate;
  pointer-events: none;
}

.miosegMotionTrack {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 56px 1fr 56px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 28px;
}

.miosegMotionStep {
  border-radius: 26px;
  min-height: 160px;
  padding: 20px;
  background: rgba(255,255,255,0.085);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);
}

.miosegMotionStep:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 48px rgba(0,0,0,0.18);
  border-color: rgba(143, 199, 255, 0.42);
}

.miosegMotionStep span {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #07101f;
  background: linear-gradient(180deg, #ffffff, #dbeafe);
  font-weight: 950;
  margin-bottom: 14px;
}

.miosegMotionStep strong {
  display: block;
  color: #ffffff;
  font-size: 20px;
  line-height: 1.15;
  letter-spacing: -0.35px;
  margin-bottom: 8px;
}

.miosegMotionStep p {
  margin: 0;
  color: #c8d8ea;
  font-size: 14px;
  line-height: 1.6;
}

.miosegMotionConnector {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(117, 210, 255, 0.18), rgba(117, 210, 255, 0.9), rgba(117, 210, 255, 0.18));
  box-shadow: 0 0 20px rgba(117, 210, 255, 0.52);
  animation: miosegConnector 2.8s ease-in-out infinite;
}

.miosegAnimatedProduct {
  position: relative;
  z-index: 1;
  min-height: 440px;
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035)),
    radial-gradient(circle at 50% 48%, rgba(117, 210, 255, 0.16), transparent 34%);
  border: 1px solid rgba(255,255,255,0.10);
  overflow: hidden;
}

.miosegAnimatedProduct::before {
  content: "";
  position: absolute;
  inset: 36px;
  border-radius: 32px;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.42;
  mask-image: radial-gradient(circle at center, black 0%, transparent 70%);
}

.miosegFloatingQr {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  width: 132px;
  height: 132px;
  display: grid;
  place-items: center;
  border-radius: 34px;
  animation: miosegCenterFloat 4.6s ease-in-out infinite;
}

.miosegFloatingQr .miosegQrVisual {
  width: 118px;
  height: 118px;
  z-index: 2;
}

.miosegPulseRing {
  position: absolute;
  inset: -18px;
  border-radius: 42px;
  border: 2px solid rgba(117, 210, 255, 0.52);
  box-shadow: 0 0 44px rgba(117, 210, 255, 0.28);
  animation: miosegPulse 2.6s ease-in-out infinite;
}

.miosegProductPanel {
  position: absolute;
  border-radius: 24px;
  padding: 16px;
  min-width: 210px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(18px);
  box-shadow: 0 22px 56px rgba(0,0,0,0.22);
}

.miosegProductPanel strong {
  display: block;
  color: #ffffff;
  font-size: 17px;
  line-height: 1.25;
  margin-top: 5px;
}

.miosegProductPanel span {
  display: block;
  color: #c9d9eb;
  font-size: 13px;
  line-height: 1.45;
  margin-top: 8px;
}

.miosegPanelDetail {
  left: 44px;
  top: 50px;
  animation: miosegOrbitA 6.2s ease-in-out infinite;
}

.miosegPanelFolder {
  right: 56px;
  top: 76px;
  animation: miosegOrbitB 5.8s ease-in-out infinite;
}

.miosegPanelMap {
  left: 82px;
  bottom: 66px;
  animation: miosegOrbitC 6.5s ease-in-out infinite;
}

.miosegPanelLock {
  right: 86px;
  bottom: 52px;
  animation: miosegOrbitD 6s ease-in-out infinite;
}

@keyframes miosegConnector {
  0%, 100% { opacity: 0.35; transform: scaleX(0.76); }
  50% { opacity: 1; transform: scaleX(1); }
}

@keyframes miosegBoardGlow {
  from { transform: rotate(0deg) scale(1); }
  to { transform: rotate(8deg) scale(1.04); }
}

@keyframes miosegCenterFloat {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-1deg); }
  50% { transform: translate(-50%, -50%) translateY(-10px) rotate(1deg); }
}

@keyframes miosegPulse {
  0%, 100% { transform: scale(0.92); opacity: 0.35; }
  50% { transform: scale(1.08); opacity: 0.85; }
}

@keyframes miosegOrbitA {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -8px); }
}

@keyframes miosegOrbitB {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-8px, 10px); }
}

@keyframes miosegOrbitC {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(9px, 9px); }
}

@keyframes miosegOrbitD {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, -6px); }
}


.miosegConversionSection {
  padding: 96px 20px;
  background:
    radial-gradient(circle at 14% 10%, rgba(77, 132, 201, 0.12), transparent 34%),
    linear-gradient(180deg, #f7fafc 0%, #eef4fb 100%);
}

.miosegConversionCard {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
  gap: 28px;
  align-items: center;
  border-radius: 38px;
  padding: 34px;
  background: linear-gradient(135deg, #0d1726 0%, #17304d 62%, #254c76 100%);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 30px 90px rgba(13, 23, 38, 0.18);
  position: relative;
  overflow: hidden;
}

.miosegConversionCard::before {
  content: "";
  position: absolute;
  width: 520px;
  height: 520px;
  right: -180px;
  top: -220px;
  background: radial-gradient(circle, rgba(117, 210, 255, 0.22), transparent 62%);
  pointer-events: none;
}

.miosegConversionText {
  position: relative;
  z-index: 1;
}

.miosegConversionText h2 {
  margin: 12px 0 14px;
  color: #ffffff;
  font-size: clamp(34px, 5vw, 64px);
  line-height: 0.98;
  letter-spacing: -1.6px;
}

.miosegConversionText p {
  max-width: 640px;
  color: #d6e4f5;
  font-size: 18px;
  line-height: 1.75;
  margin: 0 0 22px;
}

.miosegTrustPills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 24px 0;
}

.miosegTrustPills span {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 13px;
  border-radius: 999px;
  color: #eaf4ff;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 13px;
  font-weight: 900;
  backdrop-filter: blur(14px);
}

.miosegConversionActions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.miosegConversionReasons {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

.miosegConversionReason {
  border-radius: 24px;
  padding: 18px;
  display: grid;
  grid-template-columns: 50px 1fr;
  column-gap: 14px;
  align-items: start;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.13);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 46px rgba(0,0,0,0.14);
  animation: miosegUseCaseIn 700ms ease both;
  transition: transform 220ms ease, background 220ms ease;
}

.miosegConversionReason:hover {
  transform: translateX(-4px);
  background: rgba(255,255,255,0.135);
}

.miosegConversionReason div {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255,255,255,0.13);
  font-size: 24px;
  grid-row: span 2;
}

.miosegConversionReason strong {
  display: block;
  color: #ffffff;
  font-size: 17px;
  line-height: 1.22;
  margin-bottom: 6px;
}

.miosegConversionReason p {
  margin: 0;
  color: #c8d8ea;
  font-size: 13px;
  line-height: 1.55;
}

.miosegFinalCta {
  max-width: 1180px;
  margin: 28px auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
  border-radius: 32px;
  padding: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
  border: 1px solid rgba(218, 228, 240, 0.95);
  box-shadow: 0 22px 62px rgba(14, 23, 38, 0.08);
}

.miosegFinalCta h2 {
  margin: 8px 0 8px;
  color: #0d1726;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.04;
  letter-spacing: -1px;
}

.miosegFinalCta p {
  margin: 0;
  max-width: 760px;
  color: #5d6b7d;
  font-size: 16px;
  line-height: 1.7;
}

@media (max-width: 980px) {
  .miosegConversionCard {
    grid-template-columns: 1fr;
  }

  .miosegFinalCta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .miosegConversionSection {
    padding: 68px 16px;
  }

  .miosegConversionCard {
    border-radius: 30px;
    padding: 22px;
  }

  .miosegConversionReason {
    grid-template-columns: 1fr;
  }

  .miosegConversionReason div {
    grid-row: auto;
    margin-bottom: 10px;
  }

  .miosegFinalCta {
    border-radius: 26px;
    padding: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .miosegScanBeam,
  .miosegQrCard,
  .miosegDetailCard,
  .miosegUseCaseCard,
  .miosegMotionConnector,
  .miosegMotionBoard::before,
  .miosegFloatingQr,
  .miosegPulseRing,
  .miosegPanelDetail,
  .miosegPanelFolder,
  .miosegPanelMap,
  .miosegPanelLock {
    animation: none !important;
  }
}

@media (max-width: 980px) {
  .miosegMotionTrack {
    grid-template-columns: 1fr;
  }

  .miosegMotionConnector {
    width: 3px;
    height: 34px;
    margin: 0 auto;
  }

  .miosegAnimatedProduct {
    min-height: 620px;
  }

  .miosegFloatingQr {
    top: 45%;
  }

  .miosegPanelDetail,
  .miosegPanelFolder,
  .miosegPanelMap,
  .miosegPanelLock {
    left: 18px;
    right: 18px;
    min-width: auto;
  }

  .miosegPanelDetail { top: 24px; }
  .miosegPanelFolder { top: 138px; }
  .miosegPanelMap { bottom: 138px; }
  .miosegPanelLock { bottom: 24px; }
}

@media (max-width: 640px) {
  .miosegMotionBoard {
    padding: 18px;
    border-radius: 28px;
  }

  .miosegAnimatedProduct {
    min-height: 650px;
  }
}

@media (max-width: 980px) {
  .miosegUseCaseGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .miosegUseCaseStory {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .miosegUseCaseGrid {
    grid-template-columns: 1fr;
  }

  .miosegUseCaseStory {
    padding: 18px;
    border-radius: 28px;
  }
}

@media (max-width: 760px) {
  .miosegQrCard {
    grid-template-columns: 78px 1fr;
  }

  .miosegQrVisual {
    width: 74px;
    height: 74px;
    border-radius: 20px;
  }

  .miosegHeroMiniGrid {
    grid-template-columns: 1fr;
  }
}
          `.trim(),
        }}
      />

    </main>
  );
}