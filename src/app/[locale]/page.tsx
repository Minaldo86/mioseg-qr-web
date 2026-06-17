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
  const landingImages = {
    heroScan: "/landing/hero-scan.png",
    heroPhone: "/landing/hero-phone-map.png",
    realEstate: "/landing/usecase-real-estate.png",
    restaurant: "/landing/usecase-restaurant.png",
    business: "/landing/usecase-business.png",
    event: "/landing/usecase-event.png",
    school: "/landing/usecase-school.png",
    fitness: "/landing/usecase-fitness.png",
    creator: "/landing/usecase-creator.png",
    tourism: "/landing/usecase-tourism.png",
  };

  const heroCopy =
    locale === "de"
      ? {
          headline1: "Scannen.",
          headline2: "Speichern.",
          headline3: "Wiederfinden.",
          text: "Mioseg qr macht QR-Codes intelligent. Speichere Orte, entdecke neue Möglichkeiten und bleibe immer up to date.",
          ctaExplore: "Explore entdecken",
          navFeatures: "Funktionen",
          navExplore: "Explore",
          navUseCases: "Use Cases",
          navPrices: "Preise",
          miniScan: "Scannen",
          miniScanText: "QR-Codes öffnen",
          miniSave: "Speichern",
          miniSaveText: "Nie wieder verlieren",
          miniExplore: "Entdecken",
          miniExploreText: "Orte, Menschen, Möglichkeiten",
        }
      : {
          headline1: "Scan.",
          headline2: "Save.",
          headline3: "Find again.",
          text: "Mioseg qr makes QR codes intelligent. Save places, discover new possibilities and stay up to date.",
          ctaExplore: "Discover Explore",
          navFeatures: "Features",
          navExplore: "Explore",
          navUseCases: "Use Cases",
          navPrices: "Prices",
          miniScan: "Scan",
          miniScanText: "Open QR codes",
          miniSave: "Save",
          miniSaveText: "Never lose them again",
          miniExplore: "Discover",
          miniExploreText: "Places, people, possibilities",
        };

  const professionalUseCases =
    locale === "de"
      ? [
          {
            icon: "🏠",
            title: "Immobilien",
            text: "Exposés, Dokumente und Kontakte digital teilen.",
            image: landingImages.realEstate,
          },
          {
            icon: "🍽️",
            title: "Gastronomie",
            text: "Speisekarten, Aktionen und Reservierungslinks.",
            image: landingImages.restaurant,
          },
          {
            icon: "💼",
            title: "Unternehmen",
            text: "Produkte, Angebote und Infos für deine Kunden.",
            image: landingImages.business,
          },
          {
            icon: "🎟️",
            title: "Events",
            text: "Tickets, Infos und Updates – alles an einem Ort.",
            image: landingImages.event,
          },
          {
            icon: "🎓",
            title: "Schule & Campus",
            text: "Pläne, Räume, AGs und Infos schnell digital finden.",
            image: landingImages.school,
          },
          {
            icon: "🏋️",
            title: "Fitness & Vereine",
            text: "Kurse, Trainingszeiten und Community-Infos teilen.",
            image: landingImages.fitness,
          },
          {
            icon: "🎬",
            title: "Creator & Shops",
            text: "Profile, Produkte, Videos und Aktionen sichtbar machen.",
            image: landingImages.creator,
          },
          {
            icon: "📸",
            title: "Tourismus",
            text: "Sehenswürdigkeiten, Routen und lokale Tipps entdecken.",
            image: landingImages.tourism,
          },
        ]
      : [
          {
            icon: "🏠",
            title: "Real estate",
            text: "Share exposés, documents and contacts digitally.",
            image: landingImages.realEstate,
          },
          {
            icon: "🍽️",
            title: "Restaurants",
            text: "Menus, offers and booking links.",
            image: landingImages.restaurant,
          },
          {
            icon: "💼",
            title: "Business",
            text: "Products, offers and information for your customers.",
            image: landingImages.business,
          },
          {
            icon: "🎟️",
            title: "Events",
            text: "Tickets, information and updates — all in one place.",
            image: landingImages.event,
          },
          {
            icon: "🎓",
            title: "School & campus",
            text: "Plans, rooms, clubs and info quickly available digitally.",
            image: landingImages.school,
          },
          {
            icon: "🏋️",
            title: "Fitness & clubs",
            text: "Share classes, training times and community updates.",
            image: landingImages.fitness,
          },
          {
            icon: "🎬",
            title: "Creators & shops",
            text: "Make profiles, products, videos and campaigns visible.",
            image: landingImages.creator,
          },
          {
            icon: "📸",
            title: "Tourism",
            text: "Discover sights, routes and local tips.",
            image: landingImages.tourism,
          },
        ];

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
      <section className="miosegProHero">
        <div className="miosegProNav">
          <Link href={`/${locale}`} className="miosegProBrand">
            <img src="/logo-wwhite.png" alt={`${t.common.appName} Logo`} />
          </Link>

          <nav className="miosegProNavLinks" aria-label="Landing Navigation">
            <Link href={`/${locale}#features`}>{heroCopy.navFeatures}</Link>
            <Link href={`/${locale}/explore`}>{heroCopy.navExplore}</Link>
            <Link href={`/${locale}#usecases`}>{heroCopy.navUseCases}</Link>
            <Link href={`/${locale}#pricing`}>{heroCopy.navPrices}</Link>
          </nav>

          <div className="miosegProNavActions">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/get-app" className="miosegProDownload">
              ↓ {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>

        <div className="miosegProHeroGrid">
          <div className="miosegProHeroText">
            <h1>
              <span>{heroCopy.headline1}</span>
              <span>{heroCopy.headline2}</span>
              <span>{heroCopy.headline3}</span>
            </h1>

            <p>{heroCopy.text}</p>

            <div className="miosegProHeroActions">
              <Link href="/get-app" className="miosegProPrimary">
                ↓ {t.home.hero.ctaPrimary}
              </Link>
              <Link href={`/${locale}/explore`} className="miosegProSecondary">
                ⦿ {heroCopy.ctaExplore}
              </Link>
            </div>
          </div>

          <div className="miosegProHeroImage">
            <div className="miosegHeroPhotoFallback">
              <Image
                src={landingImages.heroScan}
                alt={
                  locale === "de"
                    ? "Person scannt einen Mioseg QR-Code"
                    : "Person scanning a Mioseg QR code"
                }
                width={1100}
                height={900}
                className="miosegHeroPhoto"
                priority
              />
            </div>

            <div className="miosegHeroOverlayCard">
              <div>
                <span>⌗</span>
                <strong>{heroCopy.miniScan}</strong>
                <p>{heroCopy.miniScanText}</p>
              </div>
              <div>
                <span>▣</span>
                <strong>{heroCopy.miniSave}</strong>
                <p>{heroCopy.miniSaveText}</p>
              </div>
              <div>
                <span>⌖</span>
                <strong>{heroCopy.miniExplore}</strong>
                <p>{heroCopy.miniExploreText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="usecases" className="miosegProUseCaseSection">
        <div className="miosegProSectionHeader">
          <span>⌖ {locale === "de" ? "Für jede Situation gemacht" : "Made for every situation"}</span>
          <h2>
            {locale === "de"
              ? "QR-X verbindet echte Orte mit digitalen Inhalten."
              : "QR-X connects real places with digital content."}
          </h2>
        </div>

        <div className="miosegProUseCaseGrid">
          {professionalUseCases.map((item) => (
            <article key={item.title} className="miosegProUseCard">
              <div className="miosegProUseImage">
                <Image src={item.image} alt={item.title} width={760} height={460} />
              </div>
              <div className="miosegProUseBody">
                <div className="miosegProUseIcon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="miosegProExploreBand">
        <div className="miosegProExploreText">
          <span>Explore</span>
          <h2>
            {locale === "de"
              ? "Entdecke, was um dich herum passiert."
              : "Discover what is happening around you."}
          </h2>
          <p>
            {locale === "de"
              ? "Oder mache dein Unternehmen, Event oder Projekt sichtbar. Explore zeigt QR-X auf einer Karte und verbindet Menschen mit Orten, Angeboten und Möglichkeiten."
              : "Or make your business, event or project visible. Explore shows QR-X on a map and connects people with places, offers and possibilities."}
          </p>

          <div className="miosegProExploreChips">
            <span>📍 {locale === "de" ? "In deiner Nähe" : "Nearby"}</span>
            <span>🔎 {locale === "de" ? "Orte entdecken" : "Discover places"}</span>
            <span>🏷️ {locale === "de" ? "Lokale Angebote" : "Local offers"}</span>
            <span>🤝 {locale === "de" ? "Gemeinde stärken" : "Support your community"}</span>
          </div>

          <div className="miosegProHeroActions">
            <Link href={`/${locale}/explore`} className="miosegProPrimary">
              🗺️ {locale === "de" ? "Explore ansehen" : "View Explore"}
            </Link>
            <Link href="/get-app" className="miosegProSecondary">
              {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>

        <div className="miosegProMapMock">
          <div className="miosegProMapPin pinA">☕</div>
          <div className="miosegProMapPin pinB">🏠</div>
          <div className="miosegProMapPin pinC">🎟️</div>
          <div className="miosegProMapPin pinD">🩺</div>
          <div className="miosegProUserPoint" />

          <div className="miosegProMapCard">
            <div className="miosegProMapCardImage" />
            <div>
              <span>{locale === "de" ? "In der Nähe" : "Nearby"}</span>
              <strong>{locale === "de" ? "Café Bella Vista" : "Café Bella Vista"}</strong>
              <p>{locale === "de" ? "Gastronomie · 250 m" : "Restaurant · 250 m"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="miosegProBenefitBar">
        <div>
          <span>🔐</span>
          <strong>{locale === "de" ? "Passwortschutz" : "Password protection"}</strong>
          <p>{locale === "de" ? "Schütze private QR-X mit einem Passwort." : "Protect private QR-X with a password."}</p>
        </div>
        <div>
          <span>🔄</span>
          <strong>{locale === "de" ? "Immer aktuell" : "Always up to date"}</strong>
          <p>{locale === "de" ? "Änderungen bleiben sofort sichtbar." : "Changes stay instantly visible."}</p>
        </div>
        <div>
          <span>🔖</span>
          <strong>{locale === "de" ? "Speichern & organisieren" : "Save & organize"}</strong>
          <p>{locale === "de" ? "Ordner, Karte und Verlauf bleiben übersichtlich." : "Folders, map and history stay organized."}</p>
        </div>
        <div>
          <span>📍</span>
          <strong>Explore</strong>
          <p>{locale === "de" ? "Entdecke Möglichkeiten in deiner Nähe." : "Discover opportunities nearby."}</p>
        </div>
      </section>
      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div className={styles.downloadTop}>
            <div className={styles.downloadBrand}>
              <div className={styles.downloadLogoWrap}>
                <img
                  src="/logo-wwhite.png"
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


      <style
        dangerouslySetInnerHTML={{
          __html: `
.miosegProHero {
  min-height: 680px;
  background:
    radial-gradient(circle at 78% 18%, rgba(37, 99, 235, 0.32), transparent 28%),
    linear-gradient(135deg, #07101f 0%, #0d1726 48%, #14385f 100%);
  color: #ffffff;
  overflow: hidden;
}

.miosegProNav {
  max-width: 1320px;
  margin: 0 auto;
  min-height: 82px;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 18px;
  align-items: center;
  position: relative;
  z-index: 5;
}

.miosegProBrand img {
  width: 132px;
  height: auto;
  display: block;
}

.miosegProNavLinks {
  display: flex;
  justify-content: center;
  gap: 34px;
}

.miosegProNavLinks a {
  color: rgba(255,255,255,0.86);
  text-decoration: none;
  font-size: 15px;
  font-weight: 900;
}

.miosegProNavLinks a:hover {
  color: #ffffff;
}

.miosegProNavActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.miosegProDownload,
.miosegProPrimary {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  padding: 0 20px;
  background: linear-gradient(135deg, #0d6efd 0%, #7c3aed 100%);
  color: #ffffff;
  text-decoration: none;
  font-weight: 950;
  box-shadow: 0 18px 42px rgba(37, 99, 235, 0.28);
}

.miosegProSecondary {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0 20px;
  background: rgba(255,255,255,0.10);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.28);
  text-decoration: none;
  font-weight: 950;
  backdrop-filter: blur(14px);
}

.miosegProHeroGrid {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(360px, 0.82fr) minmax(520px, 1.18fr);
  gap: 42px;
  align-items: center;
  padding: 42px 24px 74px;
}

.miosegProHeroText h1 {
  margin: 0;
  font-size: clamp(56px, 7vw, 104px);
  line-height: 0.92;
  letter-spacing: -3px;
  font-weight: 950;
}

.miosegProHeroText h1 span {
  display: block;
}

.miosegProHeroText h1 span:nth-child(3) {
  background: linear-gradient(135deg, #1685ff 0%, #8b5cf6 82%);
  -webkit-background-clip: text;
  color: transparent;
}

.miosegProHeroText p {
  max-width: 520px;
  margin: 28px 0;
  color: rgba(255,255,255,0.82);
  font-size: 20px;
  line-height: 1.65;
}

.miosegProHeroActions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.miosegProHeroImage {
  min-height: 520px;
  border-radius: 34px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
    radial-gradient(circle at 76% 28%, rgba(255,255,255,0.15), transparent 34%);
  box-shadow: 0 34px 92px rgba(0,0,0,0.28);
}

.miosegHeroPhotoFallback {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7,16,31,0.18), rgba(7,16,31,0.48)),
    radial-gradient(circle at 32% 38%, rgba(255,255,255,0.22), transparent 18%),
    linear-gradient(135deg, #213a59 0%, #0d1726 100%);
}

.miosegHeroPhoto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.86;
}

.miosegHeroOverlayCard {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  width: min(260px, calc(100% - 60px));
  display: grid;
  gap: 12px;
  border-radius: 28px;
  padding: 18px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 26px 70px rgba(0,0,0,0.18);
  backdrop-filter: blur(18px);
}

.miosegHeroOverlayCard div {
  display: grid;
  grid-template-columns: 44px 1fr;
  column-gap: 12px;
  align-items: center;
}

.miosegHeroOverlayCard span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #eef4ff;
  color: #2563eb;
  font-weight: 950;
}

.miosegHeroOverlayCard strong {
  color: #0d1726;
  font-size: 15px;
  font-weight: 950;
}

.miosegHeroOverlayCard p {
  grid-column: 2;
  margin: 2px 0 0;
  color: #5d6b7d;
  font-size: 12px;
  line-height: 1.35;
}

.miosegProUseCaseSection {
  padding: 56px 20px 72px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
}

.miosegProSectionHeader {
  max-width: 1180px;
  margin: 0 auto 24px;
  text-align: center;
}

.miosegProSectionHeader span {
  color: #2563eb;
  font-size: 16px;
  font-weight: 950;
}

.miosegProSectionHeader h2 {
  margin: 14px auto 0;
  max-width: 820px;
  color: #0d1726;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.02;
  letter-spacing: -1.4px;
}

.miosegProUseCaseGrid {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.miosegProUseCard {
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid #e1e9f2;
  box-shadow: 0 18px 50px rgba(14, 23, 38, 0.08);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.miosegProUseCard:hover {
  transform: translateY(-5px);
  box-shadow: 0 26px 70px rgba(14, 23, 38, 0.12);
}

.miosegProUseImage {
  height: 150px;
  background:
    linear-gradient(135deg, rgba(37,99,235,0.16), rgba(124,58,237,0.10)),
    #eef4fb;
  overflow: hidden;
}

.miosegProUseImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.miosegProUseBody {
  position: relative;
  padding: 42px 20px 22px;
}

.miosegProUseIcon {
  position: absolute;
  top: -31px;
  left: 20px;
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(14, 23, 38, 0.14);
  font-size: 28px;
}

.miosegProUseBody h3 {
  margin: 0 0 8px;
  color: #0d1726;
  font-size: 22px;
  letter-spacing: -0.35px;
}

.miosegProUseBody p {
  margin: 0;
  color: #5d6b7d;
  font-size: 15px;
  line-height: 1.55;
}

.miosegProExploreBand {
  max-width: 1440px;
  margin: 0 auto 48px;
  border-radius: 42px;
  padding: 44px;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 32px;
  align-items: center;
  background:
    radial-gradient(circle at 80% 30%, rgba(37,99,235,0.18), transparent 28%),
    linear-gradient(135deg, #eef4ff 0%, #ffffff 100%);
  border: 1px solid #e1e9f2;
  box-shadow: 0 28px 86px rgba(14, 23, 38, 0.10);
}

.miosegProExploreText > span {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e8f0ff;
  color: #2563eb;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 12px;
}

.miosegProExploreText h2 {
  margin: 18px 0 14px;
  color: #0d1726;
  font-size: clamp(36px, 5vw, 62px);
  line-height: 1.02;
  letter-spacing: -1.6px;
}

.miosegProExploreText p {
  margin: 0 0 20px;
  color: #5d6b7d;
  font-size: 18px;
  line-height: 1.7;
}

.miosegProExploreChips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 22px 0;
}

.miosegProExploreChips span {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  border-radius: 14px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #dfe9f5;
  color: #17304d;
  font-size: 13px;
  font-weight: 900;
}

.miosegProMapMock {
  position: relative;
  min-height: 410px;
  border-radius: 34px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.68) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.68) 1px, transparent 1px),
    linear-gradient(135deg, #dbeafe 0%, #f3f8ff 54%, #cfe2f5 100%);
  background-size: 58px 58px, 58px 58px, auto;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: inset 0 0 0 1px rgba(13,23,38,0.04);
}

.miosegProMapPin {
  position: absolute;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(180deg, #0d6efd, #7c3aed);
  border: 3px solid #ffffff;
  box-shadow: 0 16px 36px rgba(37,99,235,0.28);
  font-size: 24px;
  animation: miosegProPin 3.2s ease-in-out infinite;
}

.pinA { left: 70px; top: 78px; }
.pinB { right: 125px; top: 70px; animation-delay: 180ms; }
.pinC { left: 42%; bottom: 66px; animation-delay: 360ms; }
.pinD { right: 58px; bottom: 110px; animation-delay: 540ms; }

.miosegProUserPoint {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #2563eb;
  border: 5px solid #ffffff;
  box-shadow: 0 0 0 22px rgba(37,99,235,0.16);
  animation: miosegProPulse 2.5s ease-in-out infinite;
}

.miosegProMapCard {
  position: absolute;
  right: 26px;
  bottom: 28px;
  width: 250px;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255,255,255,0.94);
  box-shadow: 0 18px 50px rgba(14,23,38,0.18);
  border: 1px solid rgba(255,255,255,0.85);
}

.miosegProMapCardImage {
  height: 92px;
  background:
    linear-gradient(135deg, rgba(13,23,38,0.08), rgba(37,99,235,0.10)),
    url("/landing/explore-card.png");
  background-size: cover;
  background-position: center;
}

.miosegProMapCard div:last-child {
  padding: 13px;
}

.miosegProMapCard span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.miosegProMapCard strong {
  display: block;
  color: #0d1726;
  font-size: 16px;
  margin: 5px 0;
}

.miosegProMapCard p {
  margin: 0;
  color: #5d6b7d;
  font-size: 12px;
  font-weight: 800;
}

.miosegProBenefitBar {
  max-width: 1320px;
  margin: -20px auto 64px;
  border-radius: 30px;
  padding: 20px 28px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  background: linear-gradient(135deg, #0d1726 0%, #17304d 100%);
  color: #ffffff;
  box-shadow: 0 24px 70px rgba(13, 23, 38, 0.18);
}

.miosegProBenefitBar div {
  display: grid;
  grid-template-columns: 54px 1fr;
  column-gap: 14px;
  align-items: center;
  min-height: 88px;
}

.miosegProBenefitBar span {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(255,255,255,0.10);
  font-size: 26px;
  grid-row: span 2;
}

.miosegProBenefitBar strong {
  font-size: 17px;
}

.miosegProBenefitBar p {
  margin: 4px 0 0;
  color: rgba(255,255,255,0.72);
  font-size: 13px;
  line-height: 1.4;
}

@keyframes miosegProPin {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes miosegProPulse {
  0%, 100% { box-shadow: 0 0 0 14px rgba(37,99,235,0.16); }
  50% { box-shadow: 0 0 0 30px rgba(37,99,235,0); }
}

@media (max-width: 1100px) {
  .miosegProNav {
    grid-template-columns: 1fr auto;
  }

  .miosegProNavLinks {
    display: none;
  }

  .miosegProHeroGrid,
  .miosegProExploreBand {
    grid-template-columns: 1fr;
  }

  .miosegProUseCaseGrid,
  .miosegProBenefitBar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .miosegProHeroImage {
    min-height: 460px;
  }
}

@media (max-width: 680px) {
  .miosegProNav {
    padding: 14px 16px;
  }

  .miosegProNavActions {
    width: 100%;
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .miosegProHeroGrid {
    padding: 32px 16px 52px;
  }

  .miosegProHeroText h1 {
    font-size: 54px;
  }

  .miosegProHeroImage {
    min-height: 420px;
    border-radius: 28px;
  }

  .miosegHeroOverlayCard {
    left: 18px;
    right: 18px;
    bottom: 18px;
    top: auto;
    transform: none;
    width: auto;
  }

  .miosegProUseCaseGrid,
  .miosegProBenefitBar {
    grid-template-columns: 1fr;
  }

  .miosegProExploreBand {
    margin: 0 14px 44px;
    padding: 22px;
    border-radius: 30px;
  }

  .miosegProMapMock {
    min-height: 360px;
  }

  .miosegProMapCard {
    left: 18px;
    right: 18px;
    width: auto;
  }
}
          `.trim(),
        }}
      />

    </main>
  );
}