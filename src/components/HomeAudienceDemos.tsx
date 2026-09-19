"use client";

import { useState } from "react";

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
type SupportedLocale = "de" | "en";

const COPY = {
  de: {
    sectionEyebrow: "Was bringt dir QR-X?",
    sectionTitle: "Zwei Seiten. Dieselbe Verbindung.",
    sectionText: "Wähle eine Perspektive und probiere darunter echte QR-X Beispiele direkt aus.",
    selectorLabel: "QR-X Zielgruppe auswählen",
    privateBadge: "Für dich",
    privateTitle: "Scannen, behalten und später wiederfinden.",
    privateText: "Interessante QR-Codes und QR-X verschwinden nicht mehr nach dem Scan. Speichere sie, ordne sie und finde sie später wieder.",
    privateFlow: ["Scannen", "Speichern", "Wiederfinden", "Folgen"],
    privateHint: "Private Beispiele anzeigen ↓",
    businessBadge: "Für Unternehmen",
    businessTitle: "Informationen genau dort bereitstellen, wo sie gebraucht werden.",
    businessText: "Verbinde ein reales Objekt, einen Standort oder ein Projekt mit einem QR-X. Inhalte lassen sich später ändern, ohne den angebrachten QR-X auszutauschen.",
    businessFlow: ["Erstellen", "Anbringen", "Aktualisieren", "Sichtbar bleiben"],
    businessHint: "Unternehmensbeispiele anzeigen ↓",
    businessDemoTitle: "QR-X im echten Einsatz",
    privateDemoTitle: "QR-X, die du im Alltag nutzen kannst",
    businessDemoText: "Öffne die Beispiele und sieh direkt, wie unterschiedliche Produkte, Objekte und Angebote mit QR-X funktionieren.",
    privateDemoText: "Öffne die privaten Beispiele und sieh, wie QR-X gespeichert, wiedergefunden oder geschützt genutzt werden können.",
    live: "Live QR-X",
    open: "öffnen",
    demoPassword: "Demo-Passwort",
    objectLabelTitle: "QR-X direkt am Objekt",
    objectLabelText: "Informationen dort, wo sie gebraucht werden.",
    businessSectionEyebrow: "Mioseg qr für Unternehmen",
    businessSectionTitle: "Eine Maschine. Ein QR-X. Alle wichtigen Informationen.",
    businessSectionText: "Ein Mitarbeiter scannt den QR-X direkt an der Maschine und gelangt zu den Informationen, die für dieses konkrete Objekt hinterlegt wurden.",
    businessInfo: ["Betriebsanleitung","Technische Daten","Wartung & Service","Prüfberichte","Sicherheitsinfos","Ersatzteile","Ansprechpartner","Aktuelle Änderungen"],
    businessPromiseTitle: "Einmal anbringen. Dauerhaft verwalten.",
    businessPromiseText: "Der QR-X bleibt an der Maschine. Die Informationen dahinter können jederzeit aktualisiert werden.",
    businessTransfer: "Was hier für eine Maschine funktioniert, lässt sich genauso auf Produkte, Immobilien, Fahrzeuge, Gebäude, Projekte oder Standorte übertragen.",
    privateLabelTitle: "QR-X im Alltag entdecken",
    privateLabelText: "Interessantes speichern und später wiederfinden.",
    privateSectionEyebrow: "Mioseg qr für dich",
    privateSectionTitle: "Entdecken. Speichern. Später wiederfinden.",
    privateSectionText: "Du entdeckst einen interessanten Ort, ein Restaurant, eine Sehenswürdigkeit oder einen anderen QR-X? Scanne ihn mit mioseg qr und behalte ihn einfach bei dir.",
    privateInfo: ["Scannen","Speichern","In Ordner ablegen","Folgen","Updates erhalten","Auf der Karte wiederfinden"],
    privatePromiseTitle: "Einmal entdeckt. Dauerhaft bei dir.",
    privatePromiseText: "Interessante QR-X bleiben gespeichert und können später schnell wiedergefunden werden.",
    privateTransfer: "Egal ob Restaurant, Reiseziel, Veranstaltung, Produkt oder ein QR-X für dein Zuhause – mit mioseg qr musst du interessante Informationen nicht jedes Mal neu suchen."
  },
  en: {
    sectionEyebrow: "What can QR-X do for you?",
    sectionTitle: "Two sides. One connection.",
    sectionText: "Choose a perspective and try real QR-X examples below.",
    selectorLabel: "Choose a QR-X audience",
    privateBadge: "For you",
    privateTitle: "Scan, keep and find it again later.",
    privateText: "Interesting QR codes and QR-X no longer disappear after you scan them. Save them, organize them and find them again whenever you need them.",
    privateFlow: ["Scan", "Save", "Find again", "Follow"],
    privateHint: "Show personal examples ↓",
    businessBadge: "For businesses",
    businessTitle: "Provide information exactly where it is needed.",
    businessText: "Connect a real object, location or project to a QR-X. Update the content later without replacing the QR-X attached to it.",
    businessFlow: ["Create", "Attach", "Update", "Stay visible"],
    businessHint: "Show business examples ↓",
    businessDemoTitle: "QR-X in real use",
    privateDemoTitle: "QR-X you can use in everyday life",
    businessDemoText: "Open the examples and see how different products, objects and services work with QR-X.",
    privateDemoText: "Open the personal examples and see how QR-X can be saved, found again or protected.",
    live: "Live QR-X",
    open: "open",
    demoPassword: "Demo password",
    objectLabelTitle: "QR-X directly on the object",
    objectLabelText: "Information exactly where it is needed.",
    businessSectionEyebrow: "Mioseg qr for businesses",
    businessSectionTitle: "One machine. One QR-X. All the important information.",
    businessSectionText: "An employee scans the QR-X directly on the machine and opens the information stored for that specific object.",
    businessInfo: ["Operating manual","Technical data","Maintenance & service","Inspection reports","Safety information","Spare parts","Contact person","Latest changes"],
    businessPromiseTitle: "Attach once. Manage continuously.",
    businessPromiseText: "The QR-X stays on the machine. The information behind it can be updated at any time.",
    businessTransfer: "What works for a machine works just as well for products, real estate, vehicles, buildings, projects or locations.",
    privateLabelTitle: "Discover QR-X in everyday life",
    privateLabelText: "Save what interests you and find it again later.",
    privateSectionEyebrow: "Mioseg qr for you",
    privateSectionTitle: "Discover. Save. Find again.",
    privateSectionText: "Found an interesting place, restaurant, attraction or another QR-X? Scan it with mioseg qr and keep it with you.",
    privateInfo: ["Scan","Save","Organize in folders","Follow","Receive updates","Find again on the map"],
    privatePromiseTitle: "Discover once. Keep it with you.",
    privatePromiseText: "Interesting QR-X stay saved and can be found again quickly later.",
    privateTransfer: "Whether it is a restaurant, travel destination, event, product or a QR-X for your home – with mioseg qr you do not have to search for useful information again every time."
  }
} as const;

const BUSINESS_DEMOS: Record<SupportedLocale, Demo[]> = {
  de: [
    { eyebrow:"Maschine & Industrie", title:"MX-500", text:"Betriebsanleitung, technische Daten, Wartung, Prüfberichte und aktuelle Änderungen direkt an der Maschine.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500 Industriemaschine mit QR-X", cta:"QR-X öffnen" },
    { eyebrow:"Business QR-X + Collection", title:"Theater am Rhein", text:"Ein Theater-QR-X bündelt die Spielzeit und verbindet mehrere eigenständige Produktionen in einer Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein Spielzeit 2026/27", cta:"Collection öffnen" },
    { eyebrow:"Produkt", title:"AeroTherm X12", text:"Produktdaten, Dokumente, Support und spätere Aktualisierungen dauerhaft mit der Wärmepumpe verbinden.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 Wärmepumpe", cta:"QR-X öffnen" },
    { eyebrow:"Immobilie", title:"WohnOase", text:"Exposé, Bilder, Grundrisse, Standort und Kontakt über einen dauerhaft aktualisierbaren QR-X bereitstellen.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase Immobilie", cta:"QR-X öffnen" }
  ],
  en: [
    { eyebrow:"Machine & industry", title:"MX-500", text:"Operating manual, technical data, maintenance, inspection reports and current changes directly at the machine.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500 industrial machine with QR-X", cta:"Open QR-X" },
    { eyebrow:"Business QR-X + Collection", title:"Theater am Rhein", text:"A theater QR-X brings the season together and connects several independent productions in one Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein 2026/27 season", cta:"Open Collection" },
    { eyebrow:"Product", title:"AeroTherm X12", text:"Connect product data, documents, support and future updates permanently to the heat pump.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 heat pump", cta:"Open QR-X" },
    { eyebrow:"Real estate", title:"WohnOase", text:"Provide property details, images, floor plans, location and contact through a QR-X that can be updated at any time.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase property", cta:"Open QR-X" }
  ]
};

const PRIVATE_DEMOS: Record<SupportedLocale, Demo[]> = {
  de: [
    { eyebrow:"Produkt im Alltag", title:"Meine AeroTherm X12", text:"QR-X an der Wärmepumpe scannen, speichern und Handbuch, Produktinformationen sowie spätere Hersteller-Updates wiederfinden.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 Wärmepumpe im privaten Einsatz", cta:"QR-X öffnen" },
    { eyebrow:"Privater QR-X", title:"Mein Zuhause", text:"Grundrisse, Energieausweis, Wartungsunterlagen und Hausinformationen in einem passwortgeschützten QR-X bündeln.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Privater QR-X Mein Zuhause", cta:"Geschützten QR-X öffnen", password:"mioseg-qr" },
    { eyebrow:"Reise & Kultur", title:"Paris Culture Guide", text:"Sehenswürdigkeiten und Kultur entdecken, den QR-X speichern und interessante Orte später wiederfinden.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"QR-X öffnen" },
    { eyebrow:"Restaurant", title:"Trattoria Bellavista", text:"Speisekarte ansehen, Restaurant speichern und über neue Gerichte und aktuelle Angebote informiert bleiben.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista Restaurant", cta:"QR-X öffnen" }
  ],
  en: [
    { eyebrow:"Everyday product", title:"My AeroTherm X12", text:"Scan and save the QR-X on the heat pump, then find the manual, product information and future manufacturer updates again later.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 heat pump in personal use", cta:"Open QR-X" },
    { eyebrow:"Private QR-X", title:"My Home", text:"Keep floor plans, energy certificate, maintenance documents and home information together in a password-protected QR-X.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Private My Home QR-X", cta:"Open protected QR-X", password:"mioseg-qr" },
    { eyebrow:"Travel & culture", title:"Paris Culture Guide", text:"Discover attractions and culture, save the QR-X and find interesting places again later.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Open QR-X" },
    { eyebrow:"Restaurant", title:"Trattoria Bellavista", text:"View the menu, save the restaurant and stay informed about new dishes and current offers.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista restaurant", cta:"Open QR-X" }
  ]
};

export default function HomeAudienceDemos({ locale = "de" }: { locale?: string }) {
  const language: SupportedLocale = locale === "de" ? "de" : "en";
  const c = COPY[language];
  const [activeAudience, setActiveAudience] = useState<Audience>("business");
  const demos = activeAudience === "business" ? BUSINESS_DEMOS[language] : PRIVATE_DEMOS[language];

  return (
    <section className="landingBAudience" aria-labelledby="audience-title">
      <div className="landingBSectionHeader">
        <span className="landingBEyebrow">{c.sectionEyebrow}</span>
        <h2 id="audience-title">{c.sectionTitle}</h2>
        <p>{c.sectionText}</p>
      </div>

      <div className="landingBAudienceGrid landingBAudienceSelector" role="group" aria-label={c.selectorLabel}>
        <button type="button" className={`landingBAudienceCard landingBAudienceChoice ${activeAudience === "private" ? "landingBAudienceChoiceActive" : ""}`} onClick={() => setActiveAudience("private")} aria-pressed={activeAudience === "private"}>
          <span className="landingBAudienceBadge">{c.privateBadge}</span>
          <h3>{c.privateTitle}</h3>
          <p>{c.privateText}</p>
          <div className="landingBAudienceFlow">{c.privateFlow.map((x,i) => <span key={x}>{i > 0 && <b>→</b>}{x}</span>)}</div>
          <span className="landingBAudienceOpenHint">{c.privateHint}</span>
        </button>

        <button type="button" className={`landingBAudienceCard landingBAudienceCardBusiness landingBAudienceChoice ${activeAudience === "business" ? "landingBAudienceChoiceActive" : ""}`} onClick={() => setActiveAudience("business")} aria-pressed={activeAudience === "business"}>
          <span className="landingBAudienceBadge">{c.businessBadge}</span>
          <h3>{c.businessTitle}</h3>
          <p>{c.businessText}</p>
          <div className="landingBAudienceFlow">{c.businessFlow.map((x,i) => <span key={x}>{i > 0 && <b>→</b>}{x}</span>)}</div>
          <span className="landingBAudienceOpenHint">{c.businessHint}</span>
        </button>
      </div>

      <div className="landingBAudienceDemoPanel" aria-live="polite">
        <div className="landingBAudienceDemoHead">
          <div>
            <span className="landingBAudienceBadge">{activeAudience === "business" ? c.businessBadge : c.privateBadge}</span>
            <h3>{activeAudience === "business" ? c.businessDemoTitle : c.privateDemoTitle}</h3>
          </div>
          <p>{activeAudience === "business" ? c.businessDemoText : c.privateDemoText}</p>
        </div>

        <div className="landingBAudienceDemoGrid">
          {demos.map((demo) => (
            <article className="landingBAudienceDemoCard" key={`${activeAudience}-${demo.title}`}>
              <a href={demo.href} target="_blank" rel="noreferrer" className="landingBAudienceDemoImageLink" aria-label={`${demo.title} ${c.open}`}>
                <img src={demo.image} alt={demo.imageAlt} className="landingBAudienceDemoImage" />
                <span className="landingBAudienceDemoImageBadge">{c.live}</span>
              </a>
              <div className="landingBAudienceDemoBody">
                <small>{demo.eyebrow}</small><h4>{demo.title}</h4><p>{demo.text}</p>
                {demo.password && <div className="landingBAudienceDemoPassword"><span>🔐 {c.demoPassword}</span><strong>{demo.password}</strong></div>}
                <a className="landingBAudienceDemoLink" href={demo.href} target="_blank" rel="noreferrer">{demo.cta} <span>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeAudience === "business" ? (
        <section id="business" className="landingBBusiness">
          <div className="landingBBusinessVisual">
            <img src="/landing/business-machine-qrx.png" alt={language === "de" ? "Mitarbeiter scannt einen QR-X an einer Industriemaschine" : "Employee scans a QR-X on an industrial machine"} className="landingBBusinessImage" />
            <div className="landingBBusinessImageLabel"><strong>{c.objectLabelTitle}</strong><span>{c.objectLabelText}</span></div>
          </div>
          <div className="landingBBusinessCopy">
            <span className="landingBEyebrow">{c.businessSectionEyebrow}</span><h2>{c.businessSectionTitle}</h2><p>{c.businessSectionText}</p>
            <div className="landingBBusinessInfoGrid">{c.businessInfo.map(item => <span key={item}>✓ {item}</span>)}</div>
            <div className="landingBBusinessPromise"><strong>{c.businessPromiseTitle}</strong><p>{c.businessPromiseText}</p></div>
            <p className="landingBBusinessTransfer">{c.businessTransfer}</p>
          </div>
        </section>
      ) : (
        <section className="landingBBusiness">
          <div className="landingBBusinessVisual">
            <img src="/landing/Trattoria.png" alt={language === "de" ? "Person scannt einen QR-X an der Trattoria Bellavista" : "Person scans a QR-X at Trattoria Bellavista"} className="landingBBusinessImage" />
            <div className="landingBBusinessImageLabel"><strong>{c.privateLabelTitle}</strong><span>{c.privateLabelText}</span></div>
          </div>
          <div className="landingBBusinessCopy">
            <span className="landingBEyebrow">{c.privateSectionEyebrow}</span><h2>{c.privateSectionTitle}</h2><p>{c.privateSectionText}</p>
            <div className="landingBBusinessInfoGrid">{c.privateInfo.map(item => <span key={item}>✓ {item}</span>)}</div>
            <div className="landingBBusinessPromise"><strong>{c.privatePromiseTitle}</strong><p>{c.privatePromiseText}</p></div>
            <p className="landingBBusinessTransfer">{c.privateTransfer}</p>
          </div>
        </section>
      )}
    </section>
  );
}
