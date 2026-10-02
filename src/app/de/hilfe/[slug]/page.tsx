import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelpArticle, helpArticles } from "../help-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return helpArticles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getHelpArticle(slug);
  if (!a) return {};
  return {
    title: `${a.title} | Mioseg QR Hilfe`,
    description: a.description,
    alternates: { canonical: `/de/hilfe/${a.slug}` },
  };
}

export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getHelpArticle(slug);
  if (!a) notFound();
  const related = helpArticles.filter(x => x.category === a.category && x.slug !== a.slug).slice(0,3);

  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"TechArticle",
    headline:a.title,
    description:a.description,
    inLanguage:"de",
    isPartOf:{"@type":"WebSite","name":"Mioseg QR","url":"https://www.mioseg-qr.com/de"},
  };

  return <main className="articlePage">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    <header className="top"><div className="topInner">
      <Link href="/de" className="brand"><img src="/logo-wwhite.png" alt="" /><span>mioseg qr</span></Link>
      <Link href="/de/hilfe" className="helpLink">Hilfe-Center</Link>
    </div></header>

    <div className="wrap">
      <nav className="crumb"><Link href="/de">Startseite</Link><b>›</b><Link href="/de/hilfe">Hilfe</Link><b>›</b><span>{a.category}</span></nav>
      <article>
        <div className="articleHero"><span>{a.category}</span><h1>{a.title}</h1><p>{a.description}</p></div>
        <div className="articleBody">
          <p className="lead">{a.intro}</p>
          <h2>So funktioniert es</h2>
          <div className="steps">
            {a.points.map((point,i)=><div className="step" key={point}><span>{i+1}</span><p>{point}</p></div>)}
          </div>

          {a.slug === "credits-speicher" && <div className="priceBox">
            <h2>Aktuelles Credit-Modell</h2>
            <div className="priceRow"><span>Erster normaler Mioseg QR</span><b>kostenlos</b></div>
            <div className="priceRow"><span>Weitere normale Mioseg QR</span><b>5 Credits</b></div>
            <div className="priceRow"><span>Erster Business QR</span><b>2 Credits</b></div>
            <div className="priceRow"><span>Weitere Business QR</span><b>7 Credits</b></div>
            <div className="priceRow"><span>Business-Verifizierung</span><b>+10 Credits</b></div>
            <div className="priceRow"><span>Speicher inklusive</span><b>2 MB / QR</b></div>
            <div className="priceRow"><span>Zusätzlicher Speicher</span><b>1 Credit / 5 MB</b></div>
            <div className="priceRow"><span>Aufrufe · Speichern · Follow</span><b>kostenlos</b></div>
          </div>}

          {a.slug === "ordner-unterordner" && <div className="example"><strong>Beispiel einer Ordnerstruktur</strong><pre>{`Firma
└── Baustellen
    └── Köln
        └── Projekt A
            ├── Elektro
            ├── Sanitär
            └── Brandschutz`}</pre></div>}

          <div className="note"><b>Gut zu wissen</b><p>Mioseg QR wird weiterentwickelt. Die aktuell in App und Web angezeigten Funktionen und Bezeichnungen sind maßgeblich.</p></div>
        </div>
      </article>

      {related.length > 0 && <section className="related"><h2>Passende Artikel</h2><div>{related.map(x=><Link key={x.slug} href={`/de/hilfe/${x.slug}`}><small>{x.category}</small><strong>{x.title}</strong><span>Artikel öffnen →</span></Link>)}</div></section>}
      <div className="back"><Link href="/de/hilfe">← Alle Hilfeartikel</Link></div>
    </div>

    <style>{`
      *{box-sizing:border-box}.articlePage{min-height:100vh;background:#f6f8fc;color:#102039;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.top{height:76px;background:#071426;color:#fff}.topInner{width:min(1120px,calc(100% - 36px));height:100%;margin:auto;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:9px;color:#fff;text-decoration:none;font-weight:800}.brand img{width:32px;height:32px;object-fit:contain}.helpLink{color:#c7d4e7;text-decoration:none;font-size:14px}
      .wrap{width:min(900px,calc(100% - 36px));margin:auto}.crumb{display:flex;gap:9px;align-items:center;padding:24px 0;color:#7b899d;font-size:13px;overflow:hidden;white-space:nowrap}.crumb a{color:#56709a;text-decoration:none}.crumb span{overflow:hidden;text-overflow:ellipsis}
      article{background:#fff;border:1px solid #e2e8f1;border-radius:24px;overflow:hidden;box-shadow:0 12px 35px rgba(20,43,78,.06)}.articleHero{padding:48px 54px 40px;background:radial-gradient(circle at 90% 0,rgba(49,110,255,.15),transparent 35%),linear-gradient(180deg,#fff,#f8faff)}.articleHero>span{font-size:12px;letter-spacing:.13em;text-transform:uppercase;font-weight:800;color:#2b68e8}.articleHero h1{font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.035em;margin:12px 0}.articleHero>p{font-size:18px;line-height:1.55;color:#64748a;margin:0;max-width:700px}.articleBody{padding:42px 54px 54px}.lead{font-size:18px;line-height:1.75;color:#33445c;margin:0 0 38px}.articleBody h2{font-size:23px;margin:36px 0 18px}.steps{display:grid;gap:12px}.step{display:flex;gap:15px;align-items:flex-start;padding:17px 18px;background:#f7f9fc;border:1px solid #e8edf4;border-radius:15px}.step>span{flex:0 0 29px;height:29px;display:grid;place-items:center;border-radius:9px;background:#e7efff;color:#2462e3;font-weight:800;font-size:13px}.step p{margin:3px 0 0;line-height:1.6;color:#43536a}
      .note{margin-top:34px;padding:19px 21px;border-left:4px solid #2c6cf1;background:#f1f6ff;border-radius:0 13px 13px 0}.note b{color:#184fbe}.note p{margin:5px 0 0;color:#52647d;line-height:1.55}.example{margin-top:28px;padding:22px;background:#0c1a2f;color:#fff;border-radius:16px}.example pre{white-space:pre-wrap;color:#cbd7e9;line-height:1.65;margin:15px 0 0}.priceBox{margin-top:34px;border:1px solid #e1e7f0;border-radius:17px;overflow:hidden}.priceBox h2{padding:20px;margin:0;background:#f7f9fc}.priceRow{display:flex;justify-content:space-between;gap:15px;padding:13px 20px;border-top:1px solid #edf0f5}.priceRow span{color:#55667d}.priceRow b{white-space:nowrap}
      .related{margin:48px 0}.related h2{font-size:24px}.related>div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.related a{display:flex;flex-direction:column;gap:7px;background:#fff;border:1px solid #e2e8f1;border-radius:16px;padding:18px;text-decoration:none;color:#152640}.related small{color:#6e82a0}.related strong{line-height:1.35}.related span{font-size:12px;color:#2867e8;margin-top:auto;padding-top:8px}.back{padding-bottom:60px}.back a{color:#315fba;text-decoration:none;font-weight:700}
      @media(max-width:700px){.articleHero,.articleBody{padding:30px 23px}.articleHero h1{font-size:34px}.articleHero>p,.lead{font-size:16px}.related>div{grid-template-columns:1fr}.priceRow{font-size:14px}}
    `}</style>
  </main>;
}
