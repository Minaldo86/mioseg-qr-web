import type { Metadata } from "next";
import Link from "next/link";
import { helpArticles, helpCategories } from "./help-content";

export const metadata: Metadata = {
  title: "Hilfe-Center | Mioseg QR",
  description: "Anleitungen zu Mioseg QR: QR-Codes scannen, speichern, wiederfinden, dynamische Mioseg QR erstellen, Business QR, Explore, Credits, Transfer und Sicherheit.",
  alternates: { canonical: "/de/hilfe" },
};

const icons: Record<string,string> = {
  "Erste Schritte":"✦","Scannen & Organisieren":"⌗","Mioseg QR":"▣",
  "Business QR":"◆","Explore & Karte":"⌖","Teilen & Übertragen":"↗",
  "Sicherheit":"⬡","Credits & Speicher":"◈","Problemlösungen":"?"
};

export default function HilfePage() {
  return (
    <main className="helpPage">
      <section className="hero">
        <Link className="brand" href="/de"><img src="/logo-wwhite.png" alt="" /><span>mioseg qr</span></Link>
        <div className="heroInner">
          <span className="eyebrow">HILFE-CENTER</span>
          <h1>Wie können wir dir helfen?</h1>
          <p>Alles zu Mioseg QR – vom ersten Scan bis zum Business QR.</p>
          <form className="search" action="/de/hilfe" method="get">
            <span>⌕</span><input name="q" aria-label="Hilfe durchsuchen" placeholder="Hilfe durchsuchen …" />
          </form>
          <div className="quick">
            <Link href="/de/hilfe/qr-code-scannen">QR-Code scannen</Link>
            <Link href="/de/hilfe/qr-code-aus-galerie">Aus Galerie scannen</Link>
            <Link href="/de/hilfe/mioseg-qr-erstellen">Mioseg QR erstellen</Link>
            <Link href="/de/hilfe/business-qr">Business QR</Link>
          </div>
        </div>
      </section>

      <section className="intro">
        <div><span className="introIcon">◎</span></div>
        <div><h2>Mioseg QR verbindet die physische mit der digitalen Welt.</h2>
        <p>Scanne QR-Codes, speichere sie, organisiere sie und finde sie später wieder. Oder verbinde Gegenstände, Orte, Produkte und Projekte dauerhaft mit digitalen Informationen.</p></div>
      </section>

      <section className="content">
        <div className="sectionHead"><span>ANLEITUNGEN</span><h2>Entdecke alle Themen</h2><p>Wähle einen Bereich oder öffne direkt eine Anleitung.</p></div>
        <div className="categoryGrid">
          {helpCategories.map(category => {
            const items = helpArticles.filter(a => a.category === category);
            return <section className="category" key={category}>
              <div className="categoryTop"><span className="categoryIcon">{icons[category]}</span><div><h3>{category}</h3><small>{items.length} {items.length === 1 ? "Artikel" : "Artikel"}</small></div></div>
              <div className="articleLinks">
                {items.map(a => <Link key={a.slug} href={`/de/hilfe/${a.slug}`}><span>{a.title}</span><b>›</b></Link>)}
              </div>
            </section>
          })}
        </div>
      </section>

      <section className="popular">
        <div className="sectionHead"><span>SCHNELL GEFUNDEN</span><h2>Häufige Themen</h2></div>
        <div className="popularGrid">
          {["meine-scans","ordner-unterordner","in-explore-anzeigen","credits-speicher","passwortschutz","mioseg-qr-uebertragen"].map(slug => {
            const a = helpArticles.find(x => x.slug === slug)!;
            return <Link key={slug} href={`/de/hilfe/${slug}`}><small>{a.category}</small><h3>{a.title}</h3><p>{a.description}</p><strong>Artikel öffnen →</strong></Link>
          })}
        </div>
      </section>

      <section className="cta"><div><span>NOCH FRAGEN?</span><h2>Du findest nicht, was du suchst?</h2><p>Sieh dir die Problemlösungen an oder nutze die Kontaktmöglichkeiten von Mioseg QR.</p></div><div className="ctaBtns"><Link href="/de/hilfe/problemloesungen">Problemlösungen</Link><Link href="/de">Zur Startseite</Link></div></section>

      <style>{`
        *{box-sizing:border-box}.helpPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .hero{background:radial-gradient(circle at 75% 15%,rgba(46,111,255,.24),transparent 30%),linear-gradient(145deg,#06101f,#0a1a32 70%,#0c2242);color:#fff;padding:0 24px 70px}
        .brand{width:min(1160px,100%);height:82px;margin:auto;display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:800}.brand img{width:34px;height:34px;object-fit:contain}.brand span{font-size:18px}
        .heroInner{width:min(900px,100%);margin:54px auto 0;text-align:center}.eyebrow,.sectionHead>span,.cta>div>span{font-size:12px;letter-spacing:.16em;font-weight:800;color:#7fa8ff}
        .hero h1{font-size:clamp(38px,6vw,64px);line-height:1.03;margin:14px 0 16px;letter-spacing:-.04em}.hero p{font-size:18px;color:#b7c4d8;margin:0 auto 30px}
        .search{height:62px;max-width:680px;margin:auto;background:#fff;border-radius:18px;display:flex;align-items:center;padding:0 20px;box-shadow:0 18px 45px rgba(0,0,0,.2)}.search span{color:#66758c;font-size:28px}.search input{border:0;outline:0;width:100%;font-size:16px;padding:0 12px;background:transparent;color:#13233b}
        .quick{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:18px}.quick a{color:#cbd8eb;text-decoration:none;font-size:13px;border:1px solid rgba(255,255,255,.14);padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.05)}
        .intro{width:min(1080px,calc(100% - 40px));margin:-32px auto 0;background:#fff;border:1px solid #e5ebf4;border-radius:22px;padding:28px 32px;display:flex;gap:22px;align-items:center;box-shadow:0 14px 38px rgba(15,38,75,.08)}.introIcon{display:grid;place-items:center;width:56px;height:56px;border-radius:17px;background:#edf3ff;color:#2d6df6;font-size:28px}.intro h2{margin:0 0 7px;font-size:21px}.intro p{margin:0;color:#66758a;line-height:1.6}
        .content,.popular{width:min(1160px,calc(100% - 40px));margin:72px auto}.sectionHead{text-align:center;margin-bottom:30px}.sectionHead h2{font-size:34px;letter-spacing:-.03em;margin:8px 0}.sectionHead p{color:#718096;margin:0}
        .categoryGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.category{background:#fff;border:1px solid #e3e9f2;border-radius:20px;padding:22px;box-shadow:0 8px 24px rgba(22,44,80,.04)}.categoryTop{display:flex;align-items:center;gap:13px;margin-bottom:15px}.categoryIcon{width:42px;height:42px;display:grid;place-items:center;background:#edf3ff;color:#2867ef;border-radius:13px;font-weight:900}.category h3{margin:0;font-size:17px}.category small{color:#8a98aa}.articleLinks{border-top:1px solid #edf0f5}.articleLinks a{display:flex;justify-content:space-between;gap:10px;padding:12px 2px;color:#33445c;text-decoration:none;border-bottom:1px solid #f0f3f7;font-size:14px}.articleLinks a:last-child{border:0}.articleLinks b{color:#6c8ed8}
        .popular{margin-top:82px}.popularGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.popularGrid>a{background:#0b1930;color:#fff;text-decoration:none;padding:24px;border-radius:20px;min-height:190px}.popularGrid small{color:#7fa8ff;font-weight:700}.popularGrid h3{margin:10px 0 8px;font-size:19px}.popularGrid p{color:#aebdd1;line-height:1.55;font-size:14px}.popularGrid strong{font-size:13px;color:#fff}
        .cta{width:min(1160px,calc(100% - 40px));margin:80px auto;background:linear-gradient(135deg,#1264f6,#6947df);color:#fff;border-radius:24px;padding:34px 38px;display:flex;justify-content:space-between;align-items:center;gap:25px}.cta h2{margin:7px 0;font-size:28px}.cta p{margin:0;color:#dbe7ff}.ctaBtns{display:flex;gap:10px;flex-wrap:wrap}.ctaBtns a{color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.35);padding:12px 16px;border-radius:12px;font-weight:700}.ctaBtns a:first-child{background:#fff;color:#1559d7;border-color:#fff}
        @media(max-width:900px){.categoryGrid,.popularGrid{grid-template-columns:1fr 1fr}.cta{align-items:flex-start;flex-direction:column}}@media(max-width:620px){.hero{padding-left:18px;padding-right:18px}.brand{height:68px}.heroInner{margin-top:34px}.hero h1{font-size:40px}.search{height:56px}.intro{align-items:flex-start;padding:22px}.categoryGrid,.popularGrid{grid-template-columns:1fr}.content,.popular{width:min(100% - 28px,1160px);margin-top:55px}.cta{width:calc(100% - 28px);padding:26px}.ctaBtns{width:100%}.ctaBtns a{flex:1;text-align:center}}
      `}</style>
    </main>
  );
}
