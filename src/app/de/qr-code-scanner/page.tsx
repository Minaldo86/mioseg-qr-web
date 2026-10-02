import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QR-Code-Scanner: scannen, speichern & wiederfinden | Mioseg QR",
  description:
    "QR-Codes mit Mioseg QR scannen, aus Bildern und Screenshots erkennen, speichern, in Ordnern organisieren und später wiederfinden.",
  alternates: { canonical: "/de/qr-code-scanner" },
  openGraph: {
    title: "QR-Code-Scanner | Mioseg QR",
    description:
      "QR-Codes scannen, speichern, organisieren und später wiederfinden – auch aus Bildern und Screenshots.",
    url: "/de/qr-code-scanner",
    type: "website",
  },
};

const faq = [
  {
    q: "Was ist ein QR-Code-Scanner?",
    a: "Ein QR-Code-Scanner erkennt die Informationen in einem QR-Code und öffnet das hinterlegte Ziel. Mit Mioseg QR kannst du einen erkannten Code zusätzlich speichern, organisieren und später wiederfinden.",
  },
  {
    q: "Kann ich einen QR-Code aus einem Screenshot scannen?",
    a: "Ja. In Mioseg QR kannst du ein Bild oder einen Screenshot aus deiner Galerie auswählen. Wird darin ein QR-Code erkannt, kannst du das Ergebnis öffnen oder speichern.",
  },
  {
    q: "Kann ich gescannte QR-Codes später wiederfinden?",
    a: "Ja. Gespeicherte QR-Codes findest du in „Meine Scans“ wieder und kannst sie zur besseren Übersicht in Ordnern und Unterordnern organisieren.",
  },
  {
    q: "Kann ich auch eigene QR-Codes erstellen?",
    a: "Ja. Neben dem Scanner kannst du mit Mioseg QR eigene dynamische QR-Codes erstellen und deren Inhalte später aktualisieren, ohne den gedruckten QR-Code austauschen zu müssen.",
  },
];

export default function QrCodeScannerPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="hero">
        <div className="heroGrid">
          <div>
            <span className="eyebrow">QR-CODE-SCANNER</span>
            <h1>QR-Code scannen.<br />Speichern. Wiederfinden.</h1>
            <p className="lead">
              Ein QR-Code ist schnell gescannt – aber später oft nicht mehr auffindbar.
              Mioseg QR verbindet den Scanner deshalb mit deiner persönlichen QR-Sammlung:
              scannen, öffnen, speichern, organisieren und jederzeit wiederfinden.
            </p>
            <div className="actions">
              <Link href="/de/get-app" className="primary">QR-Scanner nutzen</Link>
              <Link href="/de/hilfe/qr-code-scannen" className="secondary">Anleitung ansehen</Link>
            </div>
            <div className="trust">
              <span>✓ QR-Codes scannen</span>
              <span>✓ Aus Bildern erkennen</span>
              <span>✓ Dauerhaft speichern</span>
            </div>
          </div>

          <div className="phoneCard" aria-label="Ablauf beim QR-Code-Scannen">
            <div className="phoneTop">mioseg qr</div>
            <div className="scanFrame">
              <div className="corner c1" /><div className="corner c2" />
              <div className="corner c3" /><div className="corner c4" />
              <div className="qrMock">▦</div>
              <div className="scanLine" />
            </div>
            <strong>QR-Code scannen</strong>
            <span>Kamera verwenden oder Bild aus Galerie auswählen</span>
            <div className="phoneButtons">
              <b>Scannen</b><b>Aus Galerie</b>
            </div>
          </div>
        </div>
      </section>

      <section className="flow section">
        <div className="sectionHead">
          <span className="eyebrow dark">MEHR ALS NUR ÖFFNEN</span>
          <h2>Was passiert nach dem Scan?</h2>
          <p>Mit Mioseg QR endet der Vorgang nicht beim Öffnen eines Links.</p>
        </div>
        <div className="flowGrid">
          {[
            ["01", "Scannen", "QR-Code mit der Kamera erfassen oder aus einem vorhandenen Bild erkennen."],
            ["02", "Ergebnis prüfen", "Das erkannte Ziel ansehen und entscheiden, ob du es öffnen oder speichern möchtest."],
            ["03", "Speichern", "Interessante QR-Codes in „Meine Scans“ dauerhaft ablegen."],
            ["04", "Wiederfinden", "Gespeicherte Codes später suchen und in Ordnern oder Unterordnern organisieren."],
          ].map(([n,t,x]) => (
            <article className="flowCard" key={n}>
              <span>{n}</span><h3>{t}</h3><p>{x}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section">
        <div className="split">
          <div className="visual">
            <div className="imageIcon">▧</div>
            <div className="floating one">Screenshot</div>
            <div className="floating two">QR-Code erkannt ✓</div>
          </div>
          <div>
            <span className="eyebrow dark">QR AUS GALERIE</span>
            <h2>QR-Code aus einem Bild oder Screenshot scannen.</h2>
            <p>
              Du hast einen QR-Code auf deinem Smartphone erhalten und kannst ihn nicht
              gleichzeitig mit der Kamera scannen? Wähle das Bild einfach aus deiner Galerie.
              Mioseg QR erkennt den QR-Code im Bild und zeigt dir das Ergebnis.
            </p>
            <ul>
              <li>Screenshot oder Foto auswählen</li>
              <li>QR-Code im Bild erkennen</li>
              <li>Ziel öffnen oder direkt speichern</li>
            </ul>
            <Link href="/de/hilfe/qr-code-aus-galerie">So funktioniert „Aus Galerie“ →</Link>
          </div>
        </div>
      </section>

      <section className="organize section">
        <div className="sectionHead">
          <span className="eyebrow dark">MEINE SCANS</span>
          <h2>Gescannt heißt nicht verloren.</h2>
          <p>
            Ein gespeicherter QR-Code bleibt in Mioseg QR auffindbar. So entsteht aus einzelnen
            Scans eine persönliche, strukturierte Sammlung.
          </p>
        </div>
        <div className="featureGrid">
          <article><div>⌕</div><h3>Suchen</h3><p>Gespeicherte QR-Codes später gezielt wiederfinden.</p></article>
          <article><div>▤</div><h3>Ordner</h3><p>Scans thematisch oder nach Projekten sortieren.</p></article>
          <article><div>↳</div><h3>Unterordner</h3><p>Ordner beliebig weiter strukturieren – etwa Firma → Projekt → Gewerk.</p></article>
        </div>
      </section>

      <section className="difference section">
        <div className="differenceBox">
          <span className="eyebrow">DER UNTERSCHIED</span>
          <h2>Ein Scanner öffnet einen QR-Code.<br />Mioseg QR hilft dir, ihn weiter zu nutzen.</h2>
          <div className="compare">
            <div><small>KLASSISCHER QR-SCANNER</small><strong>Scannen → öffnen → schließen</strong></div>
            <div className="arrow">→</div>
            <div><small>MIOSEG QR</small><strong>Scannen → speichern → organisieren → wiederfinden</strong></div>
          </div>
        </div>
      </section>

      <section className="own section">
        <div className="split reverse">
          <div>
            <span className="eyebrow dark">EIGENE QR-CODES</span>
            <h2>Nicht nur scannen. Eigene dynamische QR-Codes erstellen.</h2>
            <p>
              Mit Mioseg QR kannst du auch eigene QR-Codes mit Gegenständen, Orten, Produkten
              oder Projekten verbinden. Bei einem dynamischen QR-Code lassen sich die
              hinterlegten Inhalte später aktualisieren, während der QR-Code selbst gleich bleibt.
            </p>
            <Link className="textCta" href="/de/dynamischer-qr-code">Mehr über dynamische QR-Codes →</Link>
          </div>
          <div className="cloud">
            {["Bilder","PDF & Dateien","Standort","Kontakt","News","Updates"].map(x=><span key={x}>{x}</span>)}
            <b>▦</b>
          </div>
        </div>
      </section>

      <section className="faq section">
        <div className="sectionHead">
          <span className="eyebrow dark">HÄUFIGE FRAGEN</span>
          <h2>Fragen zum QR-Code-Scanner</h2>
        </div>
        <div className="faqList">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}<span>+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final">
        <span className="eyebrow">MIOSEG QR</span>
        <h2>Scannen ist nur der Anfang.</h2>
        <p>Speichere QR-Codes, organisiere sie und finde sie später wieder.</p>
        <div className="actions center">
          <Link href="/de/get-app" className="primary">Kostenlos starten</Link>
          <Link href="/de/hilfe" className="secondary light">Hilfe-Center öffnen</Link>
        </div>
      </section>

      <footer>
        <Link href="/de">Mioseg QR</Link>
        <div><Link href="/de/hilfe">Hilfe</Link><Link href="/de/datenschutz">Datenschutz</Link><Link href="/de/nutzungsbedingungen">Nutzungsbedingungen</Link></div>
      </footer>

      <style>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.hero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.heroGrid{width:min(1160px,100%);margin:0 auto;display:grid;grid-template-columns:1.1fr .7fr;gap:80px;align-items:center}.eyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.eyebrow.dark{color:#2867e8}.hero h1{font-size:clamp(43px,6vw,70px);line-height:1.02;letter-spacing:-.045em;margin:15px 0 24px}.lead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:690px}.actions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.primary,.secondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:#fff;color:#0b1d37}.secondary{border:1px solid #496487;color:#e2e9f4}.trust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.phoneCard{width:min(360px,100%);justify-self:center;background:#fff;color:#10213a;border-radius:30px;padding:20px;box-shadow:0 30px 80px #0007;text-align:center}.phoneTop{font-weight:900;text-align:left}.scanFrame{height:260px;margin:20px 0;position:relative;display:grid;place-items:center;background:#edf3fb;border-radius:22px;overflow:hidden}.qrMock{font-size:105px;color:#0a1930}.scanLine{position:absolute;left:16%;right:16%;top:48%;height:2px;background:#2867e8;box-shadow:0 0 12px #2867e8}.corner{position:absolute;width:35px;height:35px;border-color:#2867e8;border-style:solid}.c1{top:18px;left:18px;border-width:3px 0 0 3px}.c2{top:18px;right:18px;border-width:3px 3px 0 0}.c3{bottom:18px;left:18px;border-width:0 0 3px 3px}.c4{bottom:18px;right:18px;border-width:0 3px 3px 0}.phoneCard>span{display:block;color:#718096;font-size:13px;margin:7px 0 15px}.phoneButtons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.phoneButtons b{padding:11px;background:#edf3ff;color:#225bc6;border-radius:10px;font-size:13px}.section{width:min(1160px,calc(100% - 36px));margin:90px auto}.sectionHead{text-align:center;max-width:760px;margin:0 auto 38px}.sectionHead h2,.split h2,.difference h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.sectionHead p,.split p{color:#617188;line-height:1.7;font-size:17px}.flowGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.flowCard,.featureGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.flowCard>span{color:#2867e8;font-weight:900}.flowCard h3,.featureGrid h3{margin:20px 0 9px}.flowCard p,.featureGrid p{color:#687990;line-height:1.6;font-size:14px}.gallery{background:#fff;border:1px solid #e1e8f1;border-radius:30px;padding:55px}.split{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.visual{height:360px;border-radius:25px;background:linear-gradient(145deg,#eaf1ff,#f7f9fc);display:grid;place-items:center;position:relative}.imageIcon{font-size:120px;color:#2867e8}.floating{position:absolute;background:#fff;border:1px solid #dde5f0;padding:13px 17px;border-radius:13px;box-shadow:0 10px 30px #163a6c18;font-weight:750}.floating.one{top:30px;left:30px}.floating.two{bottom:35px;right:25px}.split ul{padding-left:20px;color:#43556d;line-height:2}.split a,.textCta{color:#2867e8;font-weight:800;text-decoration:none}.featureGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.featureGrid article>div{font-size:28px;color:#2867e8}.differenceBox{background:#071426;color:#fff;border-radius:30px;padding:60px;text-align:center}.compare{margin-top:35px;display:grid;grid-template-columns:1fr auto 1fr;gap:22px;align-items:center}.compare>div:not(.arrow){background:#0d203a;border:1px solid #263e5f;border-radius:17px;padding:25px}.compare small{display:block;color:#82aaff;font-weight:850;margin-bottom:10px}.compare strong{font-size:17px}.arrow{font-size:28px;color:#82aaff}.reverse{grid-template-columns:1fr 1fr}.cloud{min-height:350px;background:#eaf1ff;border-radius:27px;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:10px;padding:45px;position:relative}.cloud span{background:#fff;padding:10px 14px;border-radius:999px;border:1px solid #dce6f5;color:#425a79}.cloud b{width:100%;text-align:center;font-size:90px;color:#2867e8}.faqList{max-width:850px;margin:auto;display:grid;gap:10px}.faqList details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.faqList summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.faqList p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.final{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.final h2{font-size:clamp(35px,5vw,55px);margin:12px 0}.final p{color:#b7c5d9;font-size:18px}.center{justify-content:center}.light{color:#fff}footer{background:#071426;color:#9fb0c8;padding:28px max(24px,calc((100% - 1160px)/2));display:flex;justify-content:space-between;gap:20px}footer a{color:#b8c6da;text-decoration:none}footer div{display:flex;gap:20px}@media(max-width:850px){.heroGrid,.split{grid-template-columns:1fr}.phoneCard{margin-top:10px}.flowGrid{grid-template-columns:1fr 1fr}.gallery{padding:30px}.compare{grid-template-columns:1fr}.arrow{transform:rotate(90deg)}}@media(max-width:600px){.hero{padding-bottom:60px}.heroGrid{gap:35px}.hero h1{font-size:43px}.flowGrid,.featureGrid{grid-template-columns:1fr}.section{margin:65px auto}.gallery{width:calc(100% - 24px)}.differenceBox{padding:40px 20px}.visual{height:280px}.trust{gap:10px}.compare{gap:12px}footer{flex-direction:column}}
      `}</style>
    </main>
  );
}
