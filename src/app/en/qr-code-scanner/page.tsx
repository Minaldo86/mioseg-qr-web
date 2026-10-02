import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QR Code Scanner: Scan, Save & Find Again | Mioseg QR",
  description:
    "Scan QR codes with Mioseg QR, recognize them from images and screenshots, save them, organize them in folders and find them again later.",
  alternates: {
      canonical: "/en/qr-code-scanner",
      languages: {
        "de-DE": "/de/qr-code-scanner",
        "en": "/en/qr-code-scanner",
        "tr": "/tr/qr-kod-tarayici",
        "pl": "/pl/skaner-kodow-qr",
        "ar": "/ar/qr-code-scanner",
        "fr": "/fr/scanner-qr-code",
        "es": "/es/escaner-codigo-qr",
        "it": "/it/scanner-codice-qr",
        "x-default": "/en/qr-code-scanner",
      },
    },
  openGraph: {
    title: "QR Code Scanner | Mioseg QR",
    description:
      "Scan, save, organize and find QR codes again — including QR codes from images and screenshots.",
    url: "/en/qr-code-scanner",
    type: "website",
  },
};

const faq = [
  {
    q: "What is a QR code scanner?",
    a: "A QR code scanner recognizes the information contained in a QR code and opens its destination. With Mioseg QR, you can also save the recognized code, organize it and find it again later.",
  },
  {
    q: "Can I scan a QR code from a screenshot?",
    a: "Yes. In Mioseg QR, you can select an image or screenshot from your gallery. If a QR code is detected, you can open or save the result.",
  },
  {
    q: "Can I find scanned QR codes again later?",
    a: "Yes. Saved QR codes are available in My Scans and can be organized in folders and nested subfolders.",
  },
  {
    q: "Can I create my own QR codes too?",
    a: "Yes. In addition to scanning QR codes, Mioseg QR lets you create your own dynamic QR codes and update their content later without replacing the printed QR code.",
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
    <main className="scanSeoPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="scanSeoHero">
        <div className="scanSeoHeroGrid">
          <div>
            <span className="scanSeoEyebrow">QR CODE SCANNER</span>
            <h1>Scan a QR code.<br />Save it. Find it again.</h1>
            <p className="scanSeoLead">
              A QR code takes only a moment to scan — but it is often difficult to find again later.
              Mioseg QR connects the scanner with your personal QR collection: scan, open, save,
              organize and find QR codes again whenever you need them.
            </p>
            <div className="scanSeoActions">
              <Link href="/en/get-app" className="scanSeoPrimary">Use the QR scanner</Link>
              <Link href="/en/help/qr-code-scannen" className="scanSeoSecondary">View the guide</Link>
            </div>
            <div className="scanSeoTrust">
              <span>✓ Scan QR codes</span>
              <span>✓ Detect from images</span>
              <span>✓ Save for later</span>
            </div>
          </div>

          <div className="scanSeoPhone">
            <div className="scanSeoPhoneTop">mioseg qr</div>
            <div className="scanSeoFrame">
              <div className="scanSeoCorner scanSeoC1" /><div className="scanSeoCorner scanSeoC2" />
              <div className="scanSeoCorner scanSeoC3" /><div className="scanSeoCorner scanSeoC4" />
              <div className="scanSeoQr">▦</div>
              <div className="scanSeoLine" />
            </div>
            <strong>Scan QR code</strong>
            <span>Use the camera or select an image from your gallery</span>
            <div className="scanSeoPhoneButtons"><b>Scan</b><b>From gallery</b></div>
          </div>
        </div>
      </section>

      <section className="scanSeoSection">
        <div className="scanSeoHead">
          <span className="scanSeoEyebrow scanSeoBlue">MORE THAN JUST OPENING A LINK</span>
          <h2>What happens after you scan?</h2>
          <p>With Mioseg QR, the process does not end when a link opens.</p>
        </div>
        <div className="scanSeoFlowGrid">
          {[
            ["01","Scan","Capture a QR code with your camera or recognize it from an existing image."],
            ["02","Check the result","Review the detected destination and decide whether you want to open or save it."],
            ["03","Save","Keep useful QR codes in My Scans instead of losing them after closing the page."],
            ["04","Find again","Search your saved codes later and organize them in folders and nested subfolders."],
          ].map(([n,t,x]) => (
            <article className="scanSeoFlowCard" key={n}>
              <span>{n}</span><h3>{t}</h3><p>{x}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="scanSeoSection scanSeoGallery">
        <div className="scanSeoSplit">
          <div className="scanSeoVisual">
            <div className="scanSeoImageIcon">▧</div>
            <div className="scanSeoFloating scanSeoOne">Screenshot</div>
            <div className="scanSeoFloating scanSeoTwo">QR code detected ✓</div>
          </div>
          <div>
            <span className="scanSeoEyebrow scanSeoBlue">SCAN FROM GALLERY</span>
            <h2>Scan a QR code from an image or screenshot.</h2>
            <p>
              Received a QR code on the same phone you want to use to scan it? Select the
              screenshot or image from your gallery. Mioseg QR recognizes the QR code and
              shows you the result.
            </p>
            <ul>
              <li>Select a screenshot or photo</li>
              <li>Detect the QR code in the image</li>
              <li>Open the destination or save it</li>
            </ul>
            <Link href="/en/help/qr-code-aus-galerie">How scanning from your gallery works →</Link>
          </div>
        </div>
      </section>

      <section className="scanSeoSection">
        <div className="scanSeoHead">
          <span className="scanSeoEyebrow scanSeoBlue">MY SCANS</span>
          <h2>Scanned does not have to mean lost.</h2>
          <p>
            A saved QR code remains available in Mioseg QR. Individual scans can become an
            organized personal collection that is easy to search later.
          </p>
        </div>
        <div className="scanSeoFeatureGrid">
          <article><div>⌕</div><h3>Search</h3><p>Find saved QR codes again when you need them.</p></article>
          <article><div>▤</div><h3>Folders</h3><p>Organize scans by topic, purpose or project.</p></article>
          <article><div>↳</div><h3>Nested folders</h3><p>Create deeper structures such as Company → Projects → Location → Topic.</p></article>
        </div>
      </section>

      <section className="scanSeoSection">
        <div className="scanSeoDifference">
          <span className="scanSeoEyebrow">THE DIFFERENCE</span>
          <h2>A scanner opens a QR code.<br />Mioseg QR helps you keep using it.</h2>
          <div className="scanSeoCompare">
            <div><small>CLASSIC QR SCANNER</small><strong>Scan → open → close</strong></div>
            <div className="scanSeoArrow">→</div>
            <div><small>MIOSEG QR</small><strong>Scan → save → organize → find again</strong></div>
          </div>
        </div>
      </section>

      <section className="scanSeoSection">
        <div className="scanSeoSplit">
          <div>
            <span className="scanSeoEyebrow scanSeoBlue">YOUR OWN QR CODES</span>
            <h2>Do more than scan. Create your own dynamic QR codes.</h2>
            <p>
              Mioseg QR also lets you connect your own QR codes with objects, places, products
              or projects. With a dynamic QR code, the content can be updated later while the
              QR code itself stays the same.
            </p>
            <Link href="/en/dynamic-qr-code">Learn more about dynamic QR codes →</Link>
          </div>
          <div className="scanSeoCloud">
            {["Images","PDF & files","Location","Contact","News","Updates"].map(x=><span key={x}>{x}</span>)}
            <b>▦</b>
          </div>
        </div>
      </section>

      <section className="scanSeoSection">
        <div className="scanSeoHead">
          <span className="scanSeoEyebrow scanSeoBlue">FREQUENTLY ASKED QUESTIONS</span>
          <h2>Questions about the QR code scanner</h2>
        </div>
        <div className="scanSeoFaq">
          {faq.map(item => (
            <details key={item.q}>
              <summary>{item.q}<span>+</span></summary><p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="scanSeoFinal">
        <span className="scanSeoEyebrow">MIOSEG QR</span>
        <h2>Scanning is only the beginning.</h2>
        <p>Save QR codes, organize them and find them again later.</p>
        <div className="scanSeoActions scanSeoCenter">
          <Link href="/en/get-app" className="scanSeoPrimary">Start for free</Link>
          <Link href="/en/help" className="scanSeoSecondary">Open Help Center</Link>
        </div>
      </section>

      <style>{`
*{box-sizing:border-box}.scanSeoPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.scanSeoHero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.scanSeoHeroGrid{width:min(1160px,100%);margin:auto;display:grid;grid-template-columns:1.1fr .7fr;gap:80px;align-items:center}.scanSeoEyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.scanSeoBlue{color:#2867e8}.scanSeoHero h1{font-size:clamp(43px,6vw,70px);line-height:1.02;letter-spacing:-.045em;margin:15px 0 24px}.scanSeoLead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:690px}.scanSeoActions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.scanSeoPrimary,.scanSeoSecondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.scanSeoPrimary{background:#fff;color:#0b1d37}.scanSeoSecondary{border:1px solid #496487;color:#e2e9f4}.scanSeoTrust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.scanSeoPhone{width:min(360px,100%);justify-self:center;background:#fff;color:#10213a;border-radius:30px;padding:20px;box-shadow:0 30px 80px #0007;text-align:center}.scanSeoPhoneTop{font-weight:900;text-align:left}.scanSeoFrame{height:260px;margin:20px 0;position:relative;display:grid;place-items:center;background:#edf3fb;border-radius:22px;overflow:hidden}.scanSeoQr{font-size:105px}.scanSeoLine{position:absolute;left:16%;right:16%;top:48%;height:2px;background:#2867e8;box-shadow:0 0 12px #2867e8}.scanSeoCorner{position:absolute;width:35px;height:35px;border-color:#2867e8;border-style:solid}.scanSeoC1{top:18px;left:18px;border-width:3px 0 0 3px}.scanSeoC2{top:18px;right:18px;border-width:3px 3px 0 0}.scanSeoC3{bottom:18px;left:18px;border-width:0 0 3px 3px}.scanSeoC4{bottom:18px;right:18px;border-width:0 3px 3px 0}.scanSeoPhone>span{display:block;color:#718096;font-size:13px;margin:7px 0 15px}.scanSeoPhoneButtons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.scanSeoPhoneButtons b{padding:11px;background:#edf3ff;color:#225bc6;border-radius:10px;font-size:13px}.scanSeoSection{width:min(1160px,calc(100% - 36px));margin:90px auto}.scanSeoHead{text-align:center;max-width:760px;margin:0 auto 38px}.scanSeoHead h2,.scanSeoSplit h2,.scanSeoDifference h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.scanSeoHead p,.scanSeoSplit p{color:#617188;line-height:1.7;font-size:17px}.scanSeoFlowGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.scanSeoFlowCard,.scanSeoFeatureGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.scanSeoFlowCard>span{color:#2867e8;font-weight:900}.scanSeoFlowCard h3,.scanSeoFeatureGrid h3{margin:20px 0 9px}.scanSeoFlowCard p,.scanSeoFeatureGrid p{color:#687990;line-height:1.6;font-size:14px}.scanSeoGallery{background:#fff;border:1px solid #e1e8f1;border-radius:30px;padding:55px}.scanSeoSplit{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.scanSeoVisual{height:360px;border-radius:25px;background:linear-gradient(145deg,#eaf1ff,#f7f9fc);display:grid;place-items:center;position:relative}.scanSeoImageIcon{font-size:120px;color:#2867e8}.scanSeoFloating{position:absolute;background:#fff;border:1px solid #dde5f0;padding:13px 17px;border-radius:13px;box-shadow:0 10px 30px #163a6c18;font-weight:750}.scanSeoOne{top:30px;left:30px}.scanSeoTwo{bottom:35px;right:25px}.scanSeoSplit ul{padding-left:20px;color:#43556d;line-height:2}.scanSeoSplit a{color:#2867e8;font-weight:800;text-decoration:none}.scanSeoFeatureGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.scanSeoFeatureGrid article>div{font-size:28px;color:#2867e8}.scanSeoDifference{background:#071426;color:#fff;border-radius:30px;padding:60px;text-align:center}.scanSeoCompare{margin-top:35px;display:grid;grid-template-columns:1fr auto 1fr;gap:22px;align-items:center}.scanSeoCompare>div:not(.scanSeoArrow){background:#0d203a;border:1px solid #263e5f;border-radius:17px;padding:25px}.scanSeoCompare small{display:block;color:#82aaff;font-weight:850;margin-bottom:10px}.scanSeoArrow{font-size:28px;color:#82aaff}.scanSeoCloud{min-height:350px;background:#eaf1ff;border-radius:27px;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:10px;padding:45px}.scanSeoCloud span{background:#fff;padding:10px 14px;border-radius:999px;border:1px solid #dce6f5;color:#425a79}.scanSeoCloud b{width:100%;text-align:center;font-size:90px;color:#2867e8}.scanSeoFaq{max-width:850px;margin:auto;display:grid;gap:10px}.scanSeoFaq details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.scanSeoFaq summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.scanSeoFaq p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.scanSeoFinal{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.scanSeoFinal h2{font-size:clamp(35px,5vw,55px);margin:12px 0}.scanSeoFinal p{color:#b7c5d9;font-size:18px}.scanSeoCenter{justify-content:center}@media(max-width:850px){.scanSeoHeroGrid,.scanSeoSplit{grid-template-columns:1fr}.scanSeoFlowGrid{grid-template-columns:1fr 1fr}.scanSeoGallery{padding:30px}.scanSeoCompare{grid-template-columns:1fr}.scanSeoArrow{transform:rotate(90deg)}}@media(max-width:600px){.scanSeoHero{padding:58px 24px 60px}.scanSeoHero h1{font-size:43px}.scanSeoFlowGrid,.scanSeoFeatureGrid{grid-template-columns:1fr}.scanSeoSection{margin:65px auto}.scanSeoGallery{width:calc(100% - 24px)}.scanSeoDifference{padding:40px 20px}.scanSeoVisual{height:280px}}
      `}</style>
    </main>
  );
}
