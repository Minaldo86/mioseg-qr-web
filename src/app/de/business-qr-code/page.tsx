import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business QR-Code für Unternehmen | Mioseg QR",
  description:
    "Business QR mit Mioseg QR: Unternehmensprofil, Kontakt, Standort, Social Media, Updates und optionale Sichtbarkeit in Explore über einen dynamischen QR-Code.",
  alternates: {
      canonical: "/de/business-qr-code",
      languages: {
        "de-DE": "/de/business-qr-code",
        "en": "/en/business-qr-code",
        "tr": "/tr/business-qr-code",
        "pl": "/pl/business-qr-code",
        "ar": "/ar/business-qr-code",
        "fr": "/fr/qr-code-business",
        "es": "/es/codigo-qr-business",
        "it": "/it/business-qr-code",
        "x-default": "/en/business-qr-code",
      },
    },
  openGraph: {
    title: "Business QR-Code für Unternehmen | Mioseg QR",
    description:
      "Unternehmensinformationen, Kontakt, Standort und aktuelle Inhalte mit einem dynamischen Business QR verbinden.",
    url: "/de/business-qr-code",
    type: "website",
  },
};

const faq = [
  {
    q: "Was ist ein Business QR bei Mioseg QR?",
    a: "Ein Business QR ist ein dynamischer Mioseg QR für Unternehmen. Er kann Unternehmensinformationen, Kontaktmöglichkeiten, Website, Standort, Social-Media-Profile und weitere Inhalte in einem öffentlichen Profil bündeln.",
  },
  {
    q: "Kann ich die Informationen später ändern?",
    a: "Ja. Der Business QR ist dynamisch. Die hinterlegten Inhalte können später bearbeitet werden, während derselbe QR-Code weiterverwendet werden kann.",
  },
  {
    q: "Muss mein Business QR in Explore sichtbar sein?",
    a: "Nein. Bei einem Business QR kannst du festlegen, ob er in Explore angezeigt werden soll. Ist die Explore-Sichtbarkeit ausgeschaltet, bleibt der QR-Code weiterhin über den QR-Code beziehungsweise seinen direkten Link erreichbar.",
  },
  {
    q: "Welche Social-Media-Profile kann ich hinterlegen?",
    a: "Mioseg QR unterstützt im Business-Profil unter anderem Instagram, TikTok, YouTube, Facebook und LinkedIn.",
  },
  {
    q: "Kann ein Business QR verifiziert werden?",
    a: "Für Business QR ist eine optionale Verifizierung vorgesehen. Sie ist von der normalen Erstellung eines Business QR getrennt.",
  },
];

export default function BusinessQrPage() {
  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    mainEntity:faq.map(x=>({
      "@type":"Question", name:x.q,
      acceptedAnswer:{"@type":"Answer",text:x.a},
    })),
  };

  return (
    <main className="bqrPage">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />

      <section className="bqrHero">
        <div className="bqrHeroGrid">
          <div>
            <span className="bqrEyebrow">BUSINESS QR</span>
            <h1>Dein Unternehmen.<br />Ein QR-Code.<br />Direkt erreichbar.</h1>
            <p className="bqrLead">
              Verbinde dein Unternehmen mit einem dynamischen Business QR. Stelle Informationen,
              Kontaktmöglichkeiten, Website, Standort und Social Media zentral bereit und halte
              die Inhalte später aktuell.
            </p>
            <div className="bqrActions">
              <Link href="/de/get-app" className="bqrPrimary">Business QR erstellen</Link>
              <Link href="/de/hilfe/business-qr" className="bqrSecondary">Business-QR-Anleitung</Link>
            </div>
            <div className="bqrTrust">
              <span>✓ Dynamisch</span><span>✓ Kontakt & Standort</span><span>✓ Explore optional</span>
            </div>
          </div>

          <div className="bqrProfile">
            <div className="bqrCover" />
            <div className="bqrCompany">
              <div className="bqrLogo">M</div>
              <div><h3>Dein Unternehmen</h3><span>mioseg qr</span></div>
              <b title="Optionale Verifizierung">✓</b>
            </div>
            <p>Informationen, Leistungen und aktuelle Inhalte direkt über deinen Business QR.</p>
            <div className="bqrProfileActions"><span>☎ Anrufen</span><span>↗ Website</span><span>⌖ Route</span></div>
            <div className="bqrSocial"><span>◎</span><span>♪</span><span>▶</span><span>in</span></div>
          </div>
        </div>
      </section>

      <section className="bqrSection">
        <div className="bqrSectionHead">
          <span className="bqrEyebrow bqrBlue">DIGITALER KONTAKTPUNKT</span>
          <h2>Mehr als eine Visitenkarte hinter einem QR-Code.</h2>
          <p>
            Ein Business QR verbindet einen realen Kontaktpunkt mit einem verwaltbaren digitalen
            Unternehmensprofil. Interessenten gelangen nach dem Scan direkt zu den Informationen
            und Aktionen, die du bereitstellst.
          </p>
        </div>
        <div className="bqrFeatureGrid">
          {[
            ["🏢","Unternehmensprofil","Name, Kategorie, Logo, Titelbild und weitere Informationen zentral darstellen."],
            ["☎","Direkter Kontakt","Telefon, Website und E-Mail direkt erreichbar machen."],
            ["⌖","Standort & Navigation","Einen realen Standort hinterlegen und den Weg dorthin erleichtern."],
            ["◎","Social Media","Deine Social-Media-Profile direkt mit dem Business-Profil verbinden."],
            ["↻","Aktuelle Inhalte","Informationen später ändern, ohne den QR-Code austauschen zu müssen."],
            ["✓","Optionale Verifizierung","Business QR können zusätzlich eine Verifizierung erhalten."],
          ].map(([i,t,x])=><article key={t}><div>{i}</div><h3>{t}</h3><p>{x}</p></article>)}
        </div>
      </section>

      <section className="bqrSection bqrExplore">
        <div className="bqrSplit">
          <div className="bqrMap">
            <div className="bqrMapRoad r1"/><div className="bqrMapRoad r2"/>
            <div className="bqrPin p1">⌖</div><div className="bqrPin p2">⌖</div><div className="bqrPin p3">⌖</div>
            <div className="bqrMapCard"><small>EXPLORE</small><b>Unternehmen entdecken</b><span>Karte · Standort · Navigation</span></div>
          </div>
          <div>
            <span className="bqrEyebrow bqrBlue">EXPLORE</span>
            <h2>Du entscheidest, ob dein Business QR entdeckt werden soll.</h2>
            <p>
              Mit <strong>„In Explore anzeigen“</strong> kannst du einen Business QR zusätzlich
              über Explore sichtbar machen. So können öffentliche Business QR auf der Karte
              entdeckt werden.
            </p>
            <div className="bqrToggle"><span><b>In Explore anzeigen</b><small>Optional für Business QR</small></span><i>✓</i></div>
            <p className="bqrNote">
              Schaltest du die Explore-Sichtbarkeit aus, bleibt der Business QR weiterhin über
              den QR-Code oder seinen direkten Link erreichbar.
            </p>
            <Link href="/de/hilfe/in-explore-anzeigen">Explore-Sichtbarkeit verstehen →</Link>
          </div>
        </div>
      </section>

      <section className="bqrDark">
        <div className="bqrDarkInner">
          <span className="bqrEyebrow">VOM SCAN ZUR AKTION</span>
          <h2>Weniger suchen. Direkt handeln.</h2>
          <p>Ein Scan kann Besucher direkt von einem realen Ort zu deinem digitalen Unternehmensprofil führen.</p>
          <div className="bqrFlow">
            <div><b>▦</b><strong>QR scannen</strong><small>am Standort, Produkt oder Projekt</small></div><i>→</i>
            <div><b>🏢</b><strong>Profil öffnen</strong><small>Informationen ansehen</small></div><i>→</i>
            <div><b>↗</b><strong>Aktion starten</strong><small>Kontakt, Website oder Navigation</small></div>
          </div>
        </div>
      </section>

      <section className="bqrSection">
        <div className="bqrSectionHead">
          <span className="bqrEyebrow bqrBlue">EINSATZBEREICHE</span>
          <h2>Ein Business QR kann dort arbeiten, wo dein Unternehmen sichtbar ist.</h2>
        </div>
        <div className="bqrUseGrid">
          {[
            ["🍽","Gastronomie","Standort, Kontakt, Website, aktuelle Informationen und Social Media bereitstellen."],
            ["🏠","Immobilien","Objekte oder Standorte mit Informationen, Kontakt und Navigation verbinden."],
            ["🛠","Handwerk & Projekte","Leistungen, Referenzen, Projektinformationen und Kontakt zugänglich machen."],
            ["🏢","Filialen & Standorte","Einzelne reale Standorte mit eigenen digitalen Informationen verbinden."],
            ["🎟","Events","Veranstaltungsinformationen, Änderungen und Kontaktmöglichkeiten aktuell halten."],
            ["📍","Lokale Services","Angebote dort auffindbar machen, wo sie tatsächlich stattfinden."],
          ].map(([i,t,x])=><article key={t}><div>{i}</div><h3>{t}</h3><p>{x}</p></article>)}
        </div>
      </section>

      <section className="bqrSection bqrDynamic">
        <div className="bqrSplit">
          <div>
            <span className="bqrEyebrow bqrBlue">DYNAMISCH</span>
            <h2>Ändert sich dein Unternehmen, kann sich dein Business QR mitentwickeln.</h2>
            <p>
              Öffnungszeiten, Ansprechpartner, Dokumente, Social-Media-Profile oder andere
              Informationen können sich verändern. Ein dynamischer Mioseg QR lässt dich die
              hinterlegten Inhalte aktualisieren, während der QR-Code bestehen bleibt.
            </p>
            <Link href="/de/dynamischer-qr-code">Dynamische QR-Codes verstehen →</Link>
          </div>
          <div className="bqrUpdate">
            <div><small>QR-CODE</small><b>▦</b><span>bleibt bestehen</span></div>
            <i>↻</i>
            <div><small>BUSINESS-PROFIL</small><b>Aktualisieren</b><span>Kontakt · Standort · Inhalte</span></div>
          </div>
        </div>
      </section>

      <section className="bqrSection">
        <div className="bqrSectionHead">
          <span className="bqrEyebrow bqrBlue">HÄUFIGE FRAGEN</span>
          <h2>Fragen zum Business QR</h2>
        </div>
        <div className="bqrFaq">
          {faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}
        </div>
      </section>

      <section className="bqrFinal">
        <span className="bqrEyebrow">MIOSEG QR FÜR UNTERNEHMEN</span>
        <h2>Mach dein Unternehmen digital erreichbar.</h2>
        <p>Erstelle einen dynamischen Business QR und verbinde reale Kontaktpunkte mit aktuellen digitalen Informationen.</p>
        <div className="bqrActions bqrCenter">
          <Link href="/de/get-app" className="bqrPrimary">Business QR erstellen</Link>
          <Link href="/de/hilfe/business-qr" className="bqrSecondary">Mehr erfahren</Link>
        </div>
      </section>

      <style>{`
*{box-sizing:border-box}.bqrPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.bqrHero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.bqrHeroGrid{width:min(1160px,100%);margin:auto;display:grid;grid-template-columns:1.08fr .75fr;gap:80px;align-items:center}.bqrEyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.bqrBlue{color:#2867e8}.bqrHero h1{font-size:clamp(43px,6vw,68px);line-height:1.02;letter-spacing:-.045em;margin:15px 0 24px}.bqrLead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:700px}.bqrActions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.bqrPrimary,.bqrSecondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.bqrPrimary{background:#fff;color:#0b1d37}.bqrSecondary{border:1px solid #496487;color:#e2e9f4}.bqrTrust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.bqrProfile{background:#fff;color:#10213a;border-radius:28px;padding:0 22px 22px;overflow:hidden;box-shadow:0 30px 80px #0007}.bqrCover{height:105px;margin:0 -22px;background:linear-gradient(135deg,#dce8fb,#adc7f3)}.bqrCompany{display:flex;align-items:center;gap:12px;margin-top:-25px}.bqrLogo{width:58px;height:58px;border:5px solid #fff;border-radius:16px;background:#0a1930;color:#fff;display:grid;place-items:center;font-size:22px;font-weight:900}.bqrCompany h3{margin:28px 0 1px;font-size:18px}.bqrCompany span{font-size:11px;color:#6d7c91}.bqrCompany>b{margin-left:auto;color:#2867e8;background:#eaf1ff;border-radius:50%;width:24px;height:24px;display:grid;place-items:center}.bqrProfile>p{color:#66778d;font-size:13px;line-height:1.55}.bqrProfileActions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.bqrProfileActions span{background:#edf3ff;color:#285db9;padding:10px 5px;border-radius:9px;text-align:center;font-size:11px;font-weight:750}.bqrSocial{display:flex;gap:8px;margin-top:13px}.bqrSocial span{width:32px;height:32px;display:grid;place-items:center;border:1px solid #e1e7f0;border-radius:50%;font-size:11px;font-weight:800}.bqrSection{width:min(1160px,calc(100% - 36px));margin:90px auto}.bqrSectionHead{text-align:center;max-width:790px;margin:0 auto 38px}.bqrSectionHead h2,.bqrSplit h2,.bqrDark h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.bqrSectionHead p,.bqrSplit p{color:#617188;line-height:1.7;font-size:17px}.bqrFeatureGrid,.bqrUseGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.bqrFeatureGrid article,.bqrUseGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.bqrFeatureGrid article>div,.bqrUseGrid article>div{font-size:28px}.bqrFeatureGrid h3,.bqrUseGrid h3{margin:15px 0 8px}.bqrFeatureGrid p,.bqrUseGrid p{color:#687990;line-height:1.6;font-size:14px}.bqrExplore,.bqrDynamic{background:#fff;border:1px solid #e1e8f1;border-radius:30px;padding:55px}.bqrSplit{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.bqrSplit a{color:#2867e8;text-decoration:none;font-weight:800}.bqrMap{height:380px;background:#e8eff8;border-radius:25px;position:relative;overflow:hidden}.bqrMapRoad{position:absolute;background:#fff}.r1{width:150%;height:20px;transform:rotate(-25deg);left:-25%;top:45%}.r2{height:150%;width:18px;transform:rotate(18deg);left:55%;top:-25%}.bqrPin{position:absolute;width:38px;height:38px;background:#2867e8;color:#fff;border:4px solid #fff;box-shadow:0 4px 15px #23466f33;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center}.bqrPin::first-letter{transform:rotate(45deg)}.p1{top:70px;left:90px}.p2{top:190px;right:80px}.p3{bottom:60px;left:180px}.bqrMapCard{position:absolute;left:22px;right:22px;bottom:20px;background:#fff;border-radius:14px;padding:14px;box-shadow:0 10px 30px #203e641c}.bqrMapCard small,.bqrMapCard b,.bqrMapCard span{display:block}.bqrMapCard small{color:#2867e8;font-weight:850}.bqrMapCard b{margin:5px 0}.bqrMapCard span{color:#728198;font-size:12px}.bqrToggle{display:flex;justify-content:space-between;align-items:center;background:#f4f7fb;border:1px solid #e1e7f0;border-radius:14px;padding:15px;margin:22px 0 12px}.bqrToggle small{display:block;color:#7a899c;margin-top:3px}.bqrToggle i{width:42px;height:24px;background:#2867e8;color:#fff;border-radius:999px;font-style:normal;text-align:right;padding:3px 6px}.bqrNote{font-size:14px!important}.bqrDark{background:#071426;color:#fff;padding:85px 24px}.bqrDarkInner{max-width:1000px;margin:auto;text-align:center}.bqrDarkInner>p{color:#b7c5d9;line-height:1.7;font-size:17px}.bqrFlow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:14px;margin-top:40px}.bqrFlow div{background:#0d203a;border:1px solid #263e5f;border-radius:16px;padding:22px}.bqrFlow b,.bqrFlow strong,.bqrFlow small{display:block}.bqrFlow b{font-size:27px;color:#82aaff}.bqrFlow strong{margin:8px}.bqrFlow small{color:#aab9cc}.bqrFlow i{font-style:normal;color:#82aaff;font-size:25px}.bqrUpdate{background:#eaf1ff;border-radius:25px;padding:30px;display:grid;grid-template-columns:1fr auto 1fr;gap:15px;align-items:center;text-align:center}.bqrUpdate div{background:#fff;border-radius:15px;padding:20px}.bqrUpdate small,.bqrUpdate b,.bqrUpdate span{display:block}.bqrUpdate small{color:#2867e8;font-weight:850}.bqrUpdate b{font-size:28px;margin:10px}.bqrUpdate span{font-size:12px;color:#718096}.bqrUpdate i{font-style:normal;color:#2867e8;font-size:28px}.bqrFaq{max-width:850px;margin:auto;display:grid;gap:10px}.bqrFaq details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.bqrFaq summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.bqrFaq p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.bqrFinal{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.bqrFinal h2{font-size:clamp(35px,5vw,55px);margin:12px auto}.bqrFinal p{color:#b7c5d9;font-size:18px;max-width:760px;margin:auto}.bqrCenter{justify-content:center}@media(max-width:850px){.bqrHeroGrid,.bqrSplit{grid-template-columns:1fr}.bqrFeatureGrid,.bqrUseGrid{grid-template-columns:1fr 1fr}.bqrFlow{grid-template-columns:1fr}.bqrFlow i{transform:rotate(90deg)}.bqrExplore,.bqrDynamic{padding:30px}.bqrUpdate{grid-template-columns:1fr}.bqrUpdate i{transform:rotate(90deg)}}@media(max-width:600px){.bqrHero{padding:58px 24px 60px}.bqrHero h1{font-size:42px}.bqrSection{margin:65px auto}.bqrFeatureGrid,.bqrUseGrid{grid-template-columns:1fr}.bqrExplore,.bqrDynamic{width:calc(100% - 24px)}.bqrProfileActions{grid-template-columns:1fr}.bqrMap{height:300px}}
      `}</style>
    </main>
  );
}
