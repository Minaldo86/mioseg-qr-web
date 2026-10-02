import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QR-Code-Generator: dynamische QR-Codes erstellen | Mioseg QR",
  description:
    "Mit Mioseg QR eigene dynamische QR-Codes erstellen, Inhalte hinterlegen und später aktualisieren – ohne den QR-Code neu drucken zu müssen.",
  alternates: {
      canonical: "/de/qr-code-generator",
      languages: {
        "de-DE": "/de/qr-code-generator",
        "en": "/en/qr-code-generator",
        "tr": "/tr/qr-kod-olusturucu",
        "pl": "/pl/generator-kodow-qr",
        "ar": "/ar/qr-code-generator",
        "fr": "/fr/generateur-qr-code",
        "es": "/es/generador-codigo-qr",
        "it": "/it/generatore-codice-qr",
        "x-default": "/en/qr-code-generator",
      },
    },
  openGraph: {
    title: "QR-Code-Generator | Mioseg QR",
    description:
      "Dynamische QR-Codes erstellen, verwalten und Inhalte später aktualisieren.",
    url: "/de/qr-code-generator",
    type: "website",
  },
};

const faq = [
  {
    q: "Was ist ein QR-Code-Generator?",
    a: "Ein QR-Code-Generator erstellt einen QR-Code, über den digitale Informationen aufgerufen werden können. Mit Mioseg QR kannst du eigene dynamische QR-Codes erstellen und verwalten.",
  },
  {
    q: "Was ist der Unterschied zwischen einem statischen und einem dynamischen QR-Code?",
    a: "Bei einem statischen QR-Code ist das Ziel direkt im Code hinterlegt. Bei einem dynamischen QR-Code bleibt der QR-Code gleich, während die dahinterliegenden Inhalte später aktualisiert werden können.",
  },
  {
    q: "Kann ich die Inhalte meines Mioseg QR später ändern?",
    a: "Ja. Bilder, Dateien, Kontaktdaten, Standortinformationen sowie weitere Inhalte können später aktualisiert werden, ohne dass der bereits verwendete QR-Code ersetzt werden muss.",
  },
  {
    q: "Kann ich Mioseg QR auch für Unternehmen verwenden?",
    a: "Ja. Business QR ergänzt unter anderem Unternehmensinformationen, Kontaktmöglichkeiten, Standort, Social Media und eine optionale Sichtbarkeit in Explore.",
  },
];

export default function QrCodeGeneratorPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="page">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="hero">
        <div className="heroGrid">
          <div>
            <span className="eyebrow">QR-CODE-GENERATOR</span>
            <h1>QR-Code erstellen.<br />Einmal verbinden.<br />Aktuell halten.</h1>
            <p className="lead">
              Erstelle mit Mioseg QR einen dynamischen QR-Code und verbinde ihn mit
              Informationen, Bildern, Dateien, Kontakten oder einem Standort. Der QR-Code
              bleibt derselbe – die Inhalte dahinter kannst du später aktualisieren.
            </p>
            <div className="actions">
              <Link href="/de/get-app" className="primary">QR-Code erstellen</Link>
              <Link href="/de/hilfe/mioseg-qr-erstellen" className="secondary">Anleitung ansehen</Link>
            </div>
            <div className="trust">
              <span>✓ Dynamisch</span><span>✓ Später aktualisierbar</span><span>✓ App & Web</span>
            </div>
          </div>

          <div className="generatorCard">
            <div className="gcTop"><b>mioseg qr</b><span>QR erstellen</span></div>
            <div className="qrBox">▦</div>
            <div className="fields">
              <div><small>TITEL</small><strong>Mein Mioseg QR</strong></div>
              <div><small>INHALTE</small><strong>Bilder · Dateien · Standort</strong></div>
            </div>
            <div className="createButton">QR-Code erstellen</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <span className="eyebrow dark">SO FUNKTIONIERT ES</span>
          <h2>Vom Inhalt zum eigenen QR-Code.</h2>
          <p>Du erstellst einen digitalen Informationspunkt, den du mit einem realen Gegenstand, Ort, Produkt oder Projekt verbinden kannst.</p>
        </div>
        <div className="steps">
          {[
            ["01","Mioseg QR erstellen","Lege einen neuen dynamischen QR-Code in deinem Konto an."],
            ["02","Inhalte hinzufügen","Ergänze Informationen, Bilder, Dateien, Kontaktmöglichkeiten oder einen Standort."],
            ["03","QR-Code verwenden","Teile den QR-Code digital oder bringe ihn an dem passenden Gegenstand, Ort oder Projekt an."],
            ["04","Später aktualisieren","Ändere die hinterlegten Inhalte. Der verwendete QR-Code kann dabei derselbe bleiben."],
          ].map(([n,t,x]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}
        </div>
      </section>

      <section className="section compareSection">
        <div className="sectionHead">
          <span className="eyebrow dark">STATISCH ODER DYNAMISCH?</span>
          <h2>Der QR-Code muss nicht mit seinen Informationen altern.</h2>
        </div>
        <div className="compare">
          <article>
            <small>STATISCHER QR-CODE</small>
            <div className="miniQr">▦</div>
            <h3>Festes Ziel</h3>
            <p>Die Information ist direkt mit dem erzeugten Code verbunden. Ändert sich das Ziel, wird in der Regel ein neuer QR-Code benötigt.</p>
          </article>
          <div className="versus">→</div>
          <article className="active">
            <small>DYNAMISCHER MIOSEG QR</small>
            <div className="miniQr">▦</div>
            <h3>QR bleibt. Inhalte ändern sich.</h3>
            <p>Du verwaltest die Informationen hinter dem QR-Code und kannst sie später aktualisieren oder erweitern.</p>
          </article>
        </div>
      </section>

      <section className="section contentSection">
        <div className="split">
          <div>
            <span className="eyebrow dark">INHALTE</span>
            <h2>Mehr als nur ein Link hinter dem QR-Code.</h2>
            <p>
              Ein Mioseg QR kann als zentraler digitaler Informationspunkt dienen. So lassen
              sich relevante Inhalte an einem Ort bündeln und später weiterentwickeln.
            </p>
            <Link href="/de/hilfe/medien-dateien-updates">Mehr zu Inhalten und Medien →</Link>
          </div>
          <div className="cloud">
            {["Bilder","PDF & Dateien","Standort","Kontakt","News","Updates","Passwort"].map(x =>
              <span key={x}>{x}</span>
            )}
            <b>▦</b>
          </div>
        </div>
      </section>

      <section className="darkSection">
        <div className="darkInner">
          <span className="eyebrow">DER DYNAMISCHE UNTERSCHIED</span>
          <h2>Einmal verbinden.<br />Dauerhaft aktuell halten.</h2>
          <p>
            Eine Anleitung ändert sich. Ein Dokument wird ersetzt. Ein Termin verschiebt sich.
            Kontaktdaten ändern sich. Mit einem dynamischen QR-Code kannst du die Informationen
            aktualisieren, ohne den bereits angebrachten QR-Code austauschen zu müssen.
          </p>
          <div className="timeline">
            <div><small>HEUTE</small><strong>QR-Code anbringen</strong></div>
            <span>→</span>
            <div><small>SPÄTER</small><strong>Inhalte aktualisieren</strong></div>
            <span>→</span>
            <div><small>WEITERHIN</small><strong>Derselbe QR-Code</strong></div>
          </div>
        </div>
      </section>

      <section className="section useCases">
        <div className="sectionHead">
          <span className="eyebrow dark">ANWENDUNGEN</span>
          <h2>Ein QR-Code für reale Dinge, Orte und Projekte.</h2>
        </div>
        <div className="caseGrid">
          {[
            ["⚙","Maschinen & Produkte","Anleitungen, technische Daten, Dokumente oder aktuelle Hinweise bereitstellen."],
            ["🏠","Immobilien","Informationen, Dokumente, Kontakt und Standort an einem Objekt bündeln."],
            ["🛠","Projekte & Handwerk","Projektinformationen, Dateien oder Aktualisierungen direkt zugänglich machen."],
            ["🎟","Events","Informationen und Änderungen über denselben QR-Code bereitstellen."],
          ].map(([i,t,x]) => <article key={t}><div>{i}</div><h3>{t}</h3><p>{x}</p></article>)}
        </div>
      </section>

      <section className="section business">
        <div className="split">
          <div className="businessVisual">
            <div className="profile"><div className="logo">M</div><div><b>Business QR</b><span>Unternehmensprofil</span></div></div>
            <div className="profileRows"><span>⌖ Standort</span><span>↗ Website & Kontakt</span><span>◎ Social Media</span><span>✓ Optional verifiziert</span></div>
          </div>
          <div>
            <span className="eyebrow dark">FÜR UNTERNEHMEN</span>
            <h2>Aus dem QR-Code wird ein digitaler Kontaktpunkt.</h2>
            <p>Business QR erweitert den dynamischen QR-Code um Unternehmensinformationen, Kontaktaktionen, Standort, Social Media und weitere Business-Funktionen.</p>
            <Link href="/de/business-qr-code">Business QR kennenlernen →</Link>
          </div>
        </div>
      </section>

      <section className="section faq">
        <div className="sectionHead"><span className="eyebrow dark">HÄUFIGE FRAGEN</span><h2>Fragen zum QR-Code-Generator</h2></div>
        <div className="faqList">
          {faq.map(item => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}
        </div>
      </section>

      <section className="final">
        <span className="eyebrow">MIOSEG QR</span>
        <h2>Bereit für deinen ersten dynamischen QR-Code?</h2>
        <p>Erstelle deinen ersten Mioseg QR und halte die Inhalte dahinter aktuell.</p>
        <div className="actions center">
          <Link href="/de/get-app" className="primary">Kostenlos starten</Link>
          <Link href="/de/hilfe/mioseg-qr-erstellen" className="secondary">Anleitung öffnen</Link>
        </div>
      </section>

      <style>{`
      *{box-sizing:border-box}.page{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.hero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.heroGrid{width:min(1160px,100%);margin:auto;display:grid;grid-template-columns:1.1fr .7fr;gap:80px;align-items:center}.eyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.eyebrow.dark{color:#2867e8}.hero h1{font-size:clamp(43px,6vw,68px);line-height:1.02;letter-spacing:-.045em;margin:15px 0 24px}.lead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:700px}.actions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.primary,.secondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:#fff;color:#0b1d37}.secondary{border:1px solid #496487;color:#e2e9f4}.trust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.generatorCard{background:#fff;color:#10213a;border-radius:28px;padding:25px;box-shadow:0 30px 80px #0007}.gcTop{display:flex;justify-content:space-between;align-items:center}.gcTop span{font-size:12px;color:#728198}.qrBox{font-size:120px;text-align:center;background:#edf3fb;border-radius:20px;margin:22px 0;padding:25px;color:#0b1d37}.fields{display:grid;gap:8px}.fields div{background:#f7f9fc;border:1px solid #e5eaf2;border-radius:11px;padding:11px}.fields small{display:block;color:#7b899d;font-size:9px}.fields strong{font-size:13px}.createButton{margin-top:12px;text-align:center;background:#2867e8;color:#fff;padding:12px;border-radius:11px;font-weight:800}.section{width:min(1160px,calc(100% - 36px));margin:90px auto}.sectionHead{text-align:center;max-width:780px;margin:0 auto 38px}.sectionHead h2,.split h2,.darkInner h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.sectionHead p,.split p{color:#617188;line-height:1.7;font-size:17px}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.steps article,.caseGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.steps article>span{color:#2867e8;font-weight:900}.steps h3,.caseGrid h3{margin:20px 0 9px}.steps p,.caseGrid p{color:#687990;line-height:1.6;font-size:14px}.compare{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;max-width:900px;margin:auto}.compare article{background:#fff;border:1px solid #e1e8f1;border-radius:23px;padding:30px;text-align:center}.compare article.active{border-color:#8fb2ff;box-shadow:0 15px 45px #2867e814}.compare small{color:#2867e8;font-weight:850}.miniQr{font-size:85px;margin:20px;color:#10213a}.compare p{color:#687990;line-height:1.6}.versus{font-size:30px;color:#2867e8}.contentSection,.business{background:#fff;border:1px solid #e1e8f1;border-radius:30px;padding:55px}.split{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.split a{color:#2867e8;text-decoration:none;font-weight:800}.cloud{min-height:350px;background:#eaf1ff;border-radius:27px;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:10px;padding:45px}.cloud span{background:#fff;padding:10px 14px;border-radius:999px;border:1px solid #dce6f5;color:#425a79}.cloud b{width:100%;text-align:center;font-size:90px;color:#2867e8}.darkSection{background:#071426;color:#fff;padding:85px 24px}.darkInner{max-width:1000px;margin:auto;text-align:center}.darkInner>p{max-width:760px;margin:0 auto;color:#b7c5d9;line-height:1.7;font-size:17px}.timeline{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:15px;align-items:center;margin-top:40px}.timeline div{background:#0d203a;border:1px solid #263e5f;border-radius:16px;padding:22px}.timeline small{display:block;color:#82aaff;font-weight:850;margin-bottom:8px}.timeline>span{color:#82aaff;font-size:25px}.caseGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.caseGrid article>div{font-size:28px}.businessVisual{background:#edf3ff;border-radius:25px;padding:30px}.profile{display:flex;align-items:center;gap:15px;background:#fff;border-radius:16px;padding:18px}.logo{width:48px;height:48px;display:grid;place-items:center;background:#0b1d37;color:#fff;border-radius:13px;font-weight:900}.profile span{display:block;color:#78869a;font-size:12px}.profileRows{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.profileRows span{background:#fff;border-radius:11px;padding:12px;font-size:13px;color:#40536d}.faqList{max-width:850px;margin:auto;display:grid;gap:10px}.faqList details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.faqList summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.faqList p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.final{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.final h2{font-size:clamp(35px,5vw,55px);max-width:850px;margin:12px auto}.final p{color:#b7c5d9;font-size:18px}.center{justify-content:center}@media(max-width:850px){.heroGrid,.split{grid-template-columns:1fr}.steps,.caseGrid{grid-template-columns:1fr 1fr}.compare{grid-template-columns:1fr}.versus{transform:rotate(90deg)}.timeline{grid-template-columns:1fr}.timeline>span{transform:rotate(90deg)}.contentSection,.business{padding:30px}}@media(max-width:600px){.hero{padding:58px 24px 60px}.hero h1{font-size:42px}.steps,.caseGrid,.profileRows{grid-template-columns:1fr}.section{margin:65px auto}.contentSection,.business{width:calc(100% - 24px)}}
      `}</style>
    </main>
  );
}
