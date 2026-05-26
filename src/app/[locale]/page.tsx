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

  const explorePreviewItems =
    locale === "de"
      ? [
          { icon: "🍽️", title: "Café am Markt", category: "Gastronomie", meta: "248 Aufrufe · 36 Follower", badge: "Beliebt" },
          { icon: "🏠", title: "Wohnung Stadtpark", category: "Immobilien", meta: "Exposé · Dateien · Kontakt", badge: "QR-X" },
          { icon: "🩺", title: "Praxis Gesund", category: "Praxis & Gesundheit", meta: "Verifiziert · Route · Kontakt", badge: "Verifiziert" },
        ]
      : [
          { icon: "🍽️", title: "Market Café", category: "Restaurant", meta: "248 views · 36 followers", badge: "Popular" },
          { icon: "🏠", title: "Park Apartment", category: "Real estate", meta: "Exposé · Files · Contact", badge: "QR-X" },
          { icon: "🩺", title: "Health Practice", category: "Health", meta: "Verified · Route · Contact", badge: "Verified" },
        ];


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
          {realLifeUseCases.slice(0, 4).map((item, index) => (
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

      <section className="miosegExploreFocusSection">
        <div className="miosegExploreFocusGrid">
          <div className="miosegExploreFocusText">
            <span className={styles.sectionEyebrow}>Explore</span>
            <div className="miosegPreviewNote">{locale === "de" ? "Später mit echten Bildern, Orten und Community-Inhalten." : "Later enhanced with real images, places and community content."}</div>
            <h2>
              {locale === "de"
                ? "Entdecke, was um dich herum passiert."
                : "Discover what is happening around you."}
            </h2>
            <p>
              {locale === "de"
                ? "Explore verbindet Menschen, Unternehmen, Orte und Events auf einer interaktiven Karte. Entdecke neue Möglichkeiten in deiner Nähe oder mache das sichtbar, was du liebst."
                : "Explore connects people, businesses, places and events on an interactive map. Discover new possibilities nearby or make what you love visible."}
            </p>

            <div className="miosegExploreBenefits">
              <div>
                <strong>🗺️ {locale === "de" ? "Karte statt Liste" : "Map instead of list"}</strong>
                <span>{locale === "de" ? "QR-X erscheinen dort, wo sie relevant sind." : "QR-X appear where they are relevant."}</span>
              </div>
              <div>
                <strong>🏷️ {locale === "de" ? "Kategorien & Filter" : "Categories & filters"}</strong>
                <span>{locale === "de" ? "Restaurants, Praxen, Events, Unternehmen und mehr." : "Restaurants, health, events, businesses and more."}</span>
              </div>
              <div>
                <strong>🔥 {locale === "de" ? "Beliebte Profile zuerst" : "Popular profiles first"}</strong>
                <span>{locale === "de" ? "Follower, Aufrufe und Verifizierung schaffen Vertrauen." : "Followers, views and verification build trust."}</span>
              </div>
            </div>

            <div className="miosegConversionActions">
              <Link href={`/${locale}/explore`} className={styles.primaryButton}>
                {locale === "de" ? "Explore öffnen" : "Open Explore"}
              </Link>
              <Link href="/get-app" className={styles.secondaryButton}>
                {t.home.hero.ctaPrimary}
              </Link>
            </div>
          </div>

          <div className="miosegExploreMapMock">
            <div className="miosegExploreMapTop">
              <div>
                <span>mioseg qr</span>
                <strong>Explore Map</strong>
              </div>
              <small>{locale === "de" ? "Live Vorschau" : "Live preview"}</small>
            </div>

            <div className="miosegMapCanvas">
              <div className="miosegMapRoad miosegMapRoadOne" />
              <div className="miosegMapRoad miosegMapRoadTwo" />
              <div className="miosegMapRoad miosegMapRoadThree" />

              <div className="miosegMapPin miosegPinOne">🍽️</div>
              <div className="miosegMapPin miosegPinTwo">🏠</div>
              <div className="miosegMapPin miosegPinThree">🩺</div>
              <div className="miosegMapPin miosegPinFour">🎉</div>

              <div className="miosegMapUserPulse" />
            </div>

            <div className="miosegExplorePreviewList">
              {explorePreviewItems.map((item) => (
                <article key={item.title} className="miosegExplorePreviewCard">
                  <div className="miosegExplorePreviewIcon">{item.icon}</div>
                  <div>
                    <div className="miosegExplorePreviewBadge">{item.badge}</div>
                    <strong>{item.title}</strong>
                    <span>{item.category} · {item.meta}</span>
                  </div>
                </article>
              ))}
            </div>
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



  .miosegExploreMapMock {
    border-radius: 30px;
    padding: 14px;
  }

  .miosegMapCanvas {
    height: 300px;
  }
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