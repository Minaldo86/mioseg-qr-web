import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dynamischer QR-Code: Inhalte später ändern | Mioseg QR",
  description:
    "Was ist ein dynamischer QR-Code? Erfahre, wie du Inhalte später aktualisierst, während derselbe QR-Code bestehen bleibt – mit Mioseg QR.",
  alternates: {
      canonical: "/de/dynamischer-qr-code",
      languages: {
        "de-DE": "/de/dynamischer-qr-code",
        "en": "/en/dynamic-qr-code",
        "tr": "/tr/dinamik-qr-kod",
        "pl": "/pl/dynamiczny-kod-qr",
        "ar": "/ar/dynamic-qr-code",
        "fr": "/fr/qr-code-dynamique",
        "es": "/es/codigo-qr-dinamico",
        "it": "/it/codice-qr-dinamico",
        "x-default": "/en/dynamic-qr-code",
      },
    },
  openGraph: {
    title: "Dynamischer QR-Code | Mioseg QR",
    description:
      "Ein QR-Code, dessen hinterlegte Inhalte sich später aktualisieren lassen.",
    url: "/de/dynamischer-qr-code",
    type: "website",
  },
};

const faq = [
  {
    q: "Was ist ein dynamischer QR-Code?",
    a: "Ein dynamischer QR-Code verweist auf verwaltbare digitale Inhalte. Dadurch können die hinterlegten Informationen später geändert oder erweitert werden, während der verwendete QR-Code gleich bleibt.",
  },
  {
    q: "Muss ich den QR-Code neu drucken, wenn sich Inhalte ändern?",
    a: "Bei einem Mioseg QR können die hinterlegten Inhalte aktualisiert werden, ohne den bereits verwendeten QR-Code auszutauschen.",
  },
  {
    q: "Welche Inhalte kann ich bei Mioseg QR aktualisieren?",
    a: "Je nach Nutzung kannst du unter anderem Informationen, Bilder, Dateien, Standort, Kontaktmöglichkeiten sowie News und Updates verwalten.",
  },
  {
    q: "Wofür eignet sich ein dynamischer QR-Code?",
    a: "Zum Beispiel für Produkte, Maschinen, Immobilien, Projekte, Veranstaltungen, Standorte oder andere reale Dinge, deren digitale Informationen aktuell gehalten werden sollen.",
  },
];

export default function DynamicQrPage() {
  const faqJsonLd = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    mainEntity:faq.map(x=>({
      "@type":"Question",
      name:x.q,
      acceptedAnswer:{"@type":"Answer",text:x.a},
    })),
  };

  return (
    <main className="dynPage">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{__html:JSON.stringify(faqJsonLd)}} />

      <section className="dynHero">
        <div className="dynHeroGrid">
          <div>
            <span className="dynEyebrow">DYNAMISCHER QR-CODE</span>
            <h1>Der QR-Code bleibt.<br />Die Informationen entwickeln sich weiter.</h1>
            <p className="dynLead">
              Ein dynamischer QR-Code mit Mioseg QR verbindet einen dauerhaften Code mit
              Inhalten, die du später aktualisieren und erweitern kannst. So muss ein bereits
              gedruckter oder angebrachter QR-Code nicht bei jeder Änderung ersetzt werden.
            </p>
            <div className="dynActions">
              <Link href="/de/get-app" className="dynPrimary">Dynamischen QR erstellen</Link>
              <Link href="/de/hilfe/was-ist-mioseg-qr" className="dynSecondary">Mehr über Mioseg QR</Link>
            </div>
            <div className="dynTrust">
              <span>✓ QR bleibt gleich</span><span>✓ Inhalte aktualisieren</span><span>✓ Zentral verwalten</span>
            </div>
          </div>

          <div className="dynVisual">
            <div className="dynQr">▦</div>
            <div className="dynConnector" />
            <div className="dynContentCards">
              <div><span>▧</span><b>Bilder</b><small>aktualisiert</small></div>
              <div><span>▤</span><b>Dokumente</b><small>neue Version</small></div>
              <div><span>⌖</span><b>Standort</b><small>änderbar</small></div>
            </div>
            <div className="dynBadge">↻ Inhalte aktualisierbar</div>
          </div>
        </div>
      </section>

      <section className="section intro">
        <div className="dynSectionHead">
          <span className="eyebrow dark">EINFACH ERKLÄRT</span>
          <h2>Was bedeutet „dynamisch“ bei einem QR-Code?</h2>
          <p>
            Der entscheidende Unterschied liegt nicht im Aussehen des QR-Codes, sondern darin,
            wie das Ziel dahinter verwaltet wird.
          </p>
        </div>
        <div className="dynExplain">
          <article>
            <small>1 · DER CODE</small>
            <div className="dynBigQr">▦</div>
            <h3>Bleibt bestehen</h3>
            <p>Der QR-Code kann auf einem Schild, Produkt, Dokument oder Gegenstand angebracht bleiben.</p>
          </article>
          <div className="dynArrow">→</div>
          <article>
            <small>2 · MIOSEG QR</small>
            <div className="dynHub">↻</div>
            <h3>Verwaltet die Verbindung</h3>
            <p>Du bearbeitest die digitalen Informationen über dein Mioseg-QR-Konto.</p>
          </article>
          <div className="dynArrow">→</div>
          <article>
            <small>3 · DIE INHALTE</small>
            <div className="dynHub">▤</div>
            <h3>Können sich ändern</h3>
            <p>Nutzer scannen weiterhin denselben Code und erhalten die aktuell hinterlegten Informationen.</p>
          </article>
        </div>
      </section>

      <section className="section compareSection">
        <div className="dynSectionHead">
          <span className="eyebrow dark">VERGLEICH</span>
          <h2>Statischer und dynamischer QR-Code.</h2>
        </div>
        <div className="dynTable">
          <div className="dynThead"><b>Eigenschaft</b><b>Statischer QR-Code</b><b>Dynamischer Mioseg QR</b></div>
          {[
            ["QR-Code nach Erstellung","fest","bleibt gleich"],
            ["Inhalte später ändern","nicht über den Code verwaltet","ja"],
            ["Neue Informationen ergänzen","neuer Zielinhalt erfordert ggf. neuen Code","über Mioseg QR verwaltbar"],
            ["Bilder & Dateien verwalten","–","ja"],
            ["News & Updates","–","ja"],
            ["Standort & Kontakt","abhängig vom festen Ziel","in Mioseg QR integrierbar"],
          ].map((r,i)=><div className="dynTrow" key={i}><strong>{r[0]}</strong><span>{r[1]}</span><span className="dynYes">{r[2]}</span></div>)}
        </div>
      </section>

      <section className="dynDark">
        <div className="dynDarkInner">
          <span className="dynEyebrow">WARUM DYNAMISCH?</span>
          <h2>Die reale Welt bleibt stehen.<br />Informationen ändern sich.</h2>
          <p>
            Ein QR-Aufkleber auf einer Maschine kann jahrelang bestehen. In dieser Zeit können
            sich Anleitungen, Dokumente, Ansprechpartner oder Wartungsinformationen verändern.
            Der dynamische QR-Code hält die physische Kennzeichnung und die digitalen
            Informationen voneinander unabhängig.
          </p>
          <div className="dynTimeline">
            <div><small>TAG 1</small><b>QR-Code anbringen</b><span>Dokument Version 1</span></div>
            <i>→</i>
            <div><small>SPÄTER</small><b>Inhalt ändern</b><span>Dokument Version 2</span></div>
            <i>→</i>
            <div><small>WEITERHIN</small><b>Derselbe QR-Code</b><span>Aktuelle Information</span></div>
          </div>
        </div>
      </section>

      <section className="section content">
        <div className="dynSplit">
          <div>
            <span className="eyebrow dark">MIOSEG QR</span>
            <h2>Welche Inhalte können hinter einem dynamischen QR-Code stehen?</h2>
            <p>
              Mioseg QR macht aus dem QR-Code einen verwaltbaren digitalen Informationspunkt.
              Welche Inhalte sinnvoll sind, hängt davon ab, was du mit dem Code verbindest.
            </p>
            <Link href="/de/hilfe/medien-dateien-updates">Inhalte & Medien kennenlernen →</Link>
          </div>
          <div className="dynCloud">
            {["Bilder","PDF & Dateien","News","Updates","Standort","Kontakt","Social Media","Passwort"].map(x=><span key={x}>{x}</span>)}
            <b>▦</b>
          </div>
        </div>
      </section>

      <section className="section examples">
        <div className="dynSectionHead">
          <span className="eyebrow dark">BEISPIELE</span>
          <h2>Wo dynamische QR-Codes sinnvoll sein können.</h2>
        </div>
        <div className="dynCards">
          {[
            ["⚙","Maschine","Anleitungen, technische Daten, Wartungsinformationen und Dokumente an einem festen QR-Code bereitstellen."],
            ["🏠","Immobilie","Objektinformationen, Dateien, Kontakt und Standort aktuell halten."],
            ["📦","Produkt","Produktinformationen und Dokumente ergänzen oder aktualisieren."],
            ["🛠","Projekt","Projektinformationen, Bilder, Unterlagen und Änderungen zentral zugänglich machen."],
            ["🎟","Event","Termine, Hinweise und aktuelle Informationen über denselben Code bereitstellen."],
            ["⌖","Standort","Digitale Informationen direkt mit einem realen Ort verbinden."],
          ].map(([icon,title,text])=><article key={title}><div>{icon}</div><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="section follow">
        <div className="dynFollowBox">
          <div>
            <span className="dynEyebrow">SCANNEN IST NUR DER ANFANG</span>
            <h2>Speichern, folgen und später wiederfinden.</h2>
            <p>
              Mioseg QR verbindet dynamische QR-Codes mit weiteren Funktionen: Nutzer können
              interessante Mioseg QR speichern und später wiederfinden. Bei unterstützten
              Aktualisierungen kann das Folgen dabei helfen, auf dem Laufenden zu bleiben.
            </p>
          </div>
          <div className="dynFlow">
            <div><b>▦</b><span>Scannen</span></div><i>→</i>
            <div><b>♡</b><span>Speichern</span></div><i>→</i>
            <div><b>↻</b><span>Aktuell bleiben</span></div>
          </div>
        </div>
      </section>

      <section className="section faq">
        <div className="dynSectionHead">
          <span className="eyebrow dark">HÄUFIGE FRAGEN</span>
          <h2>Fragen zu dynamischen QR-Codes</h2>
        </div>
        <div className="dynFaqList">
          {faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}
        </div>
      </section>

      <section className="dynFinal">
        <span className="dynEyebrow">MIOSEG QR</span>
        <h2>Ein QR-Code. Immer aktuell.</h2>
        <p>Erstelle einen dynamischen Mioseg QR und verwalte die Inhalte dahinter.</p>
        <div className="actions center">
          <Link href="/de/get-app" className="dynPrimary">Kostenlos starten</Link>
          <Link href="/de/qr-code-generator" className="dynSecondary">Zum QR-Code-Generator</Link>
        </div>
      </section>

      <style>{`
*{box-sizing:border-box}.dynPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.dynHero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.dynHeroGrid{width:min(1160px,100%);margin:auto;display:grid;grid-template-columns:1.1fr .8fr;gap:70px;align-items:center}.dynEyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.dynEyebrow.dynDark{color:#2867e8}.dynHero h1{font-size:clamp(42px,5.7vw,67px);line-height:1.03;letter-spacing:-.045em;margin:15px 0 24px}.dynLead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:700px}.dynActions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.dynPrimary,.dynSecondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.dynPrimary{background:#fff;color:#0b1d37}.dynSecondary{border:1px solid #496487;color:#e2e9f4}.dynTrust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.dynVisual{background:#fff;border-radius:28px;padding:28px;color:#10213a;position:relative;box-shadow:0 30px 80px #0007}.dynQr{font-size:100px;text-align:center;background:#edf3fb;border-radius:20px;padding:15px}.dynConnector{height:25px;width:2px;background:#91b0e6;margin:auto}.dynContentCards{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.dynContentCards div{background:#f7f9fc;border:1px solid #e3e9f2;border-radius:12px;padding:10px;text-align:center}.dynContentCards span,.dynContentCards b,.dynContentCards small{display:block}.dynContentCards span{font-size:20px;color:#2867e8}.dynContentCards b{font-size:11px;margin:5px}.dynContentCards small{font-size:9px;color:#6e7f95}.dynBadge{text-align:center;background:#e8f1ff;color:#245fc9;border-radius:999px;padding:9px;margin:15px auto 0;font-size:12px;font-weight:800;width:max-content;max-width:100%}.dynSection{width:min(1160px,calc(100% - 36px));margin:90px auto}.dynSectionHead{text-align:center;max-width:780px;margin:0 auto 38px}.dynSectionHead h2,.dynSplit h2,.dynFollowBox h2,.dynDark h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.dynSectionHead p,.dynSplit p{color:#617188;line-height:1.7;font-size:17px}.dynExplain{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:16px;align-items:center}.dynExplain article{background:#fff;border:1px solid #e1e8f1;border-radius:21px;padding:27px;text-align:center}.dynExplain small{color:#2867e8;font-weight:850}.dynBigQr,.dynHub{font-size:75px;margin:18px}.dynHub{color:#2867e8}.dynExplain p{color:#687990;line-height:1.6;font-size:14px}.dynArrow{font-size:28px;color:#2867e8}.dynTable{max-width:1000px;margin:auto;background:#fff;border:1px solid #e1e8f1;border-radius:22px;overflow:hidden}.dynThead,.dynTrow{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:15px;padding:18px 22px}.dynThead{background:#0a1930;color:#fff}.dynTrow{border-top:1px solid #e8edf4;align-items:center}.dynTrow span{color:#687990}.dynTrow .dynYes{color:#245fc9;font-weight:750}.dynDark{background:#071426;color:#fff;padding:85px 24px}.dynDarkInner{max-width:1000px;margin:auto;text-align:center}.dynDarkInner>p{color:#b7c5d9;line-height:1.7;max-width:800px;margin:auto;font-size:17px}.dynTimeline{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:15px;align-items:center;margin-top:40px}.dynTimeline div{background:#0d203a;border:1px solid #263e5f;border-radius:16px;padding:22px}.dynTimeline small,.dynTimeline b,.dynTimeline span{display:block}.dynTimeline small{color:#82aaff;font-weight:850}.dynTimeline b{margin:7px}.dynTimeline span{color:#aebcd0;font-size:13px}.dynTimeline i{font-style:normal;color:#82aaff;font-size:25px}.dynContent{background:#fff;border:1px solid #e1e8f1;border-radius:30px;padding:55px}.dynSplit{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.dynSplit a{color:#2867e8;text-decoration:none;font-weight:800}.dynCloud{min-height:350px;background:#eaf1ff;border-radius:27px;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:10px;padding:45px}.dynCloud span{background:#fff;padding:10px 14px;border-radius:999px;border:1px solid #dce6f5;color:#425a79}.dynCloud b{width:100%;text-align:center;font-size:90px;color:#2867e8}.dynCards{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.dynCards article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.dynCards article>div{font-size:28px}.dynCards h3{margin:15px 0 8px}.dynCards p{color:#687990;line-height:1.6;font-size:14px}.dynFollowBox{background:#0a1930;color:#fff;border-radius:30px;padding:55px;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}.dynFollowBox p{color:#b7c5d9;line-height:1.7}.dynFlow{display:flex;align-items:center;justify-content:center;gap:10px}.dynFlow div{background:#102744;border:1px solid #294462;border-radius:14px;padding:15px;text-align:center}.dynFlow b,.dynFlow span{display:block}.dynFlow b{font-size:25px;color:#82aaff}.dynFlow span{font-size:11px;margin-top:5px}.dynFlow i{font-style:normal;color:#82aaff}.dynFaqList{max-width:850px;margin:auto;display:grid;gap:10px}.dynFaqList details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.dynFaqList summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.dynFaqList p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.dynFinal{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.dynFinal h2{font-size:clamp(35px,5vw,55px);margin:12px auto}.dynFinal p{color:#b7c5d9;font-size:18px}.dynCenter{justify-content:center}@media(max-width:850px){.dynHeroGrid,.dynSplit,.dynFollowBox{grid-template-columns:1fr}.dynExplain{grid-template-columns:1fr}.dynArrow{transform:rotate(90deg);text-align:center}.dynTimeline{grid-template-columns:1fr}.dynTimeline i{transform:rotate(90deg)}.dynCards{grid-template-columns:1fr 1fr}.dynContent{padding:30px}}@media(max-width:600px){.dynHero{padding:58px 24px 60px}.dynHero h1{font-size:41px}.dynSection{margin:65px auto}.dynCards{grid-template-columns:1fr}.dynThead,.dynTrow{grid-template-columns:1fr}.dynThead b:first-child{display:none}.dynTrow strong{color:#0a1930}.dynContent{width:calc(100% - 24px)}.dynFlow{flex-wrap:wrap}.dynFollowBox{padding:35px 22px}}
      `}</style>
    </main>
  );
}
