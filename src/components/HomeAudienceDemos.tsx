"use client";

import { useState } from "react";

const BUSINESS_DEMOS: Demo[] = [
  {
    eyebrow: "Maschine & Industrie",
    title: "MX-500",
    text: "Betriebsanleitung, technische Daten, Wartung, Prüfberichte und aktuelle Änderungen direkt an der Maschine.",
    href: "https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67",
    image: "/landing/business-machine-qrx.png",
    imageAlt: "MX-500 Industriemaschine mit QR-X",
    cta: "QR-X öffnen",
  },
  {
    eyebrow: "Business QR-X + Collection",
    title: "Theater am Rhein",
    text: "Ein Theater-QR-X bündelt die Spielzeit und verbindet mehrere eigenständige Produktionen in einer Collection.",
    href: "https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1",
    image: "/landing/theater.jpg",
    imageAlt: "Theater am Rhein Spielzeit 2026/27",
    cta: "Collection öffnen",
  },
  {
    eyebrow: "Produkt",
    title: "AeroTherm X12",
    text: "Produktdaten, Dokumente, Support und spätere Aktualisierungen dauerhaft mit der Wärmepumpe verbinden.",
    href: "https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d",
    image: "/landing/wärmepumpe.png",
    imageAlt: "AeroTherm X12 Wärmepumpe",
    cta: "QR-X öffnen",
  },
  {
    eyebrow: "Immobilie",
    title: "WohnOase",
    text: "Exposé, Bilder, Grundrisse, Standort und Kontakt über einen dauerhaft aktualisierbaren QR-X bereitstellen.",
    href: "https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d",
    image: "/landing/immobilien.png",
    imageAlt: "WohnOase Immobilie",
    cta: "QR-X öffnen",
  },
];

const PRIVATE_DEMOS: Demo[] = [
  {
    eyebrow: "Produkt im Alltag",
    title: "Meine AeroTherm X12",
    text: "QR-X an der Wärmepumpe scannen, speichern und Handbuch, Produktinformationen sowie spätere Hersteller-Updates wiederfinden.",
    href: "https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d",
    image: "/landing/wärmepumpe.png",
    imageAlt: "AeroTherm X12 Wärmepumpe im privaten Einsatz",
    cta: "QR-X öffnen",
  },
  {
    eyebrow: "Privater QR-X",
    title: "Mein Zuhause",
    text: "Grundrisse, Energieausweis, Wartungsunterlagen und Hausinformationen in einem passwortgeschützten QR-X bündeln.",
    href: "https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616",
    image: "/landing/mein zuhause.png",
    imageAlt: "Privater QR-X Mein Zuhause",
    cta: "Geschützten QR-X öffnen",
    password: "mioseg-qr",
  },
  {
    eyebrow: "Reise & Kultur",
    title: "Paris Culture Guide",
    text: "Sehenswürdigkeiten und Kultur entdecken, den QR-X speichern und interessante Orte später wiederfinden.",
    href: "https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0",
    image: "/landing/paris.png",
    imageAlt: "Paris Culture Guide",
    cta: "QR-X öffnen",
  },
  {
    eyebrow: "Restaurant",
    title: "Trattoria Bellavista",
    text: "Speisekarte ansehen, Restaurant speichern und über neue Gerichte und aktuelle Angebote informiert bleiben.",
    href: "https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b",
    image: "/landing/restaurant.jpg",
    imageAlt: "Trattoria Bellavista Restaurant",
    cta: "QR-X öffnen",
  },
];

type Demo = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  image: string;
  imageAlt: string;
  cta: string;
  password?: string;
};

type Audience = "private" | "business";

export default function HomeAudienceDemos() {
  const [activeAudience, setActiveAudience] = useState<Audience>("business");
  const demos = activeAudience === "business" ? BUSINESS_DEMOS : PRIVATE_DEMOS;

  return (
    <section className="landingBAudience" aria-labelledby="audience-title">
      <div className="landingBSectionHeader">
        <span className="landingBEyebrow">Was bringt dir QR-X?</span>
        <h2 id="audience-title">Zwei Seiten. Dieselbe Verbindung.</h2>
        <p>
          Wähle eine Perspektive und probiere darunter echte QR-X Beispiele direkt aus.
        </p>
      </div>

      <div className="landingBAudienceGrid landingBAudienceSelector" role="group" aria-label="QR-X Zielgruppe auswählen">
        <button
          type="button"
          className={`landingBAudienceCard landingBAudienceChoice ${activeAudience === "private" ? "landingBAudienceChoiceActive" : ""}`}
          onClick={() => setActiveAudience("private")}
          aria-pressed={activeAudience === "private"}
        >
          <span className="landingBAudienceBadge">Für dich</span>
          <h3>Scannen, behalten und später wiederfinden.</h3>
          <p>
            Interessante QR-Codes und QR-X verschwinden nicht mehr nach dem Scan. Speichere sie, ordne sie und finde sie später wieder.
          </p>
          <div className="landingBAudienceFlow">
            <span>Scannen</span><b>→</b><span>Speichern</span><b>→</b><span>Wiederfinden</span><b>→</b><span>Folgen</span>
          </div>
          <span className="landingBAudienceOpenHint">Private Beispiele anzeigen ↓</span>
        </button>

        <button
          type="button"
          className={`landingBAudienceCard landingBAudienceCardBusiness landingBAudienceChoice ${activeAudience === "business" ? "landingBAudienceChoiceActive" : ""}`}
          onClick={() => setActiveAudience("business")}
          aria-pressed={activeAudience === "business"}
        >
          <span className="landingBAudienceBadge">Für Unternehmen</span>
          <h3>Informationen genau dort bereitstellen, wo sie gebraucht werden.</h3>
          <p>
            Verbinde ein reales Objekt, einen Standort oder ein Projekt mit einem QR-X. Inhalte lassen sich später ändern, ohne den angebrachten QR-X auszutauschen.
          </p>
          <div className="landingBAudienceFlow">
            <span>Erstellen</span><b>→</b><span>Anbringen</span><b>→</b><span>Aktualisieren</span><b>→</b><span>Sichtbar bleiben</span>
          </div>
          <span className="landingBAudienceOpenHint">Unternehmensbeispiele anzeigen ↓</span>
        </button>
      </div>

      <div className="landingBAudienceDemoPanel" aria-live="polite">
        <div className="landingBAudienceDemoHead">
          <div>
            <span className="landingBAudienceBadge">
              {activeAudience === "business" ? "Für Unternehmen" : "Für dich"}
            </span>
            <h3>
              {activeAudience === "business"
                ? "QR-X im echten Einsatz"
                : "QR-X, die du im Alltag nutzen kannst"}
            </h3>
          </div>
          <p>
            {activeAudience === "business"
              ? "Öffne die Beispiele und sieh direkt, wie unterschiedliche Produkte, Objekte und Angebote mit QR-X funktionieren."
              : "Öffne die privaten Beispiele und sieh, wie QR-X gespeichert, wiedergefunden oder geschützt genutzt werden können."}
          </p>
        </div>

        <div className={`landingBAudienceDemoGrid ${activeAudience === "private" ? "landingBAudienceDemoGridPrivate" : ""}`}>
          {demos.map((demo) => (
            <article className="landingBAudienceDemoCard" key={`${activeAudience}-${demo.title}`}>
              <a href={demo.href} target="_blank" rel="noreferrer" className="landingBAudienceDemoImageLink" aria-label={`${demo.title} öffnen`}>
                <img src={demo.image} alt={demo.imageAlt} className="landingBAudienceDemoImage" />
                <span className="landingBAudienceDemoImageBadge">Live QR-X</span>
              </a>
              <div className="landingBAudienceDemoBody">
                <small>{demo.eyebrow}</small>
                <h4>{demo.title}</h4>
                <p>{demo.text}</p>
                {demo.password && (
                  <div className="landingBAudienceDemoPassword">
                    <span>🔐 Demo-Passwort</span>
                    <strong>{demo.password}</strong>
                  </div>
                )}
                <a className="landingBAudienceDemoLink" href={demo.href} target="_blank" rel="noreferrer">
                  {demo.cta} <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
