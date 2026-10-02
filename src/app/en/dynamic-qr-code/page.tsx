import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Dynamic QR Code: Update Content Later | Mioseg QR',
  description: 'Learn how a dynamic QR code works and how Mioseg QR lets you update connected information while keeping the same QR code.',
  alternates: {
      canonical: "/en/dynamic-qr-code",
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
  openGraph: { title: 'Dynamic QR Code: Update Content Later | Mioseg QR', description: 'Learn how a dynamic QR code works and how Mioseg QR lets you update connected information while keeping the same QR code.', url: '/en/dynamic-qr-code', type: "website" },
};

const faq = [{q:'What is a dynamic QR code?',a:'A dynamic QR code uses a managed destination so the information behind the QR code can be changed without necessarily replacing the QR code itself.'},
{q:'Does the printed QR code change after an update?',a:'With a Mioseg QR, the existing QR code can continue to be used while the connected content is updated.'},
{q:'When is a dynamic QR code useful?',a:'It is useful when information may change after the QR code has already been printed, shared or installed.'},
{q:'Can a Mioseg QR contain files or updates?',a:'Mioseg QR is designed to connect QR codes with different types of managed digital information, including media, files and updates.'}];

export default function SeoPage() {
 const jsonLd={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))};
 const features=[['▦','The QR code','The code can stay printed, attached or installed.'],
['↗','The connection','The scan opens the managed Mioseg QR destination.'],
['↻','The content','Connected information can be edited and updated later.']];
 const compare=[['Keep the QR code','Continue using the same printed or installed QR code.'],
['Update the information','Change connected content when details, files, locations or updates change.']];
 return <main className="seoPage">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  <section className="seoHero"><div className="seoHeroGrid"><div>
   <span className="seoEyebrow">DYNAMIC QR CODE</span><h1>The QR code stays. The information can evolve.</h1><p className="seoLead">A dynamic QR code is useful when the information behind it may change. With Mioseg QR, you can keep using the same QR code while updating the connected content.</p>
   <div className="seoActions"><Link className="seoPrimary" href="/en/get-app">Get Mioseg QR</Link><Link className="seoSecondary" href="/en/help/mioseg-qr-erstellen">View the guide</Link></div>
   <div className="seoTrust"><span>✓ Dynamic</span><span>✓ Easy to update</span><span>✓ Built to stay useful</span></div>
  </div><div className="seoMock"><div className="seoMockTop"/><span className="seoEyebrow seoBlue">MIOSEG QR</span><h3>One QR. Current information.</h3><p>The visible QR code can remain in place while the managed digital content behind it changes.</p><div className="seoPills"><span>Images</span><span>Files</span><span>Location</span><span>Updates</span></div></div></div></section>
  <section className="seoSection"><div className="seoHead"><span className="seoEyebrow seoBlue">HOW IT WORKS</span><h2>What does “dynamic” mean for a QR code?</h2><p>The key difference is whether changing the destination or content requires replacing the QR code itself.</p></div>
   <div className="seoGrid">{features.map(([i,t,x])=><article key={t}><div>{i}</div><h3>{t}</h3><p>{x}</p></article>)}</div>
  </section>
  <section className="seoDark"><div className="seoDarkInner"><span className="seoEyebrow">WHY IT MATTERS</span><h2>Useful when information changes over time.</h2><p>Products, projects, locations and businesses rarely stay exactly the same. A dynamic QR can remain at the physical touchpoint while the digital information is maintained.</p>
   <div className="seoCompare">{compare.map(([t,x])=><div key={t}><small>MIOSEG QR</small><h3>{t}</h3><p>{x}</p></div>)}</div>
  </div></section>
  <section className="seoSection"><div className="seoSplit"><div><span className="seoEyebrow seoBlue">CONNECTED</span><h2>From the physical world to current digital information.</h2><p>A Mioseg QR can connect objects, places, products, projects or businesses with information that remains manageable after the QR code has been printed or installed.</p><Link className="seoLink" href="/en/qr-code-generator">Create your own QR code →</Link></div>
   <div className="seoPanel"><div className="seoSteps"><div className="seoStep"><b>1</b><div><strong>Place the QR code</strong><span>On an object, product, location or document.</span></div></div><div className="seoStep"><b>2</b><div><strong>People scan it</strong><span>The public Mioseg QR page opens.</span></div></div><div className="seoStep"><b>3</b><div><strong>Keep content current</strong><span>Update the connected information when needed.</span></div></div></div></div>
  </div></section>
  <section className="seoSection"><div className="seoHead"><span className="seoEyebrow seoBlue">FREQUENTLY ASKED QUESTIONS</span><h2>Questions and answers</h2></div><div className="seoFaq">{faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>
  <section className="seoFinal"><span className="seoEyebrow">MIOSEG QR</span><h2>Keep the QR code. Update what matters.</h2><p>Create a digital connection that can develop together with your object, product, project or business.</p><div className="seoActions seoCenter"><Link className="seoPrimary" href="/en/get-app">Get started</Link><Link className="seoSecondary" href="/en/help">Open Help Center</Link></div></section>
  <style>{`
*{box-sizing:border-box}.seoPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.seoHero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.seoHeroGrid{width:min(1160px,100%);margin:auto;display:grid;grid-template-columns:1.08fr .75fr;gap:80px;align-items:center}.seoEyebrow{font-size:12px;letter-spacing:.15em;font-weight:850;color:#82aaff}.seoBlue{color:#2867e8}.seoHero h1{font-size:clamp(43px,6vw,68px);line-height:1.02;letter-spacing:-.045em;margin:15px 0 24px}.seoLead{font-size:19px;line-height:1.65;color:#bdc9da;max-width:700px}.seoActions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}.seoPrimary,.seoSecondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.seoPrimary{background:#fff;color:#0b1d37}.seoSecondary{border:1px solid #496487;color:#e2e9f4}.seoTrust{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;color:#9fb0c8;font-size:13px}.seoMock{background:#fff;color:#10213a;border-radius:28px;padding:25px;box-shadow:0 30px 80px #0007}.seoMockTop{height:100px;background:linear-gradient(135deg,#dce8fb,#adc7f3);border-radius:18px;margin-bottom:20px}.seoMock h3{margin:8px 0}.seoMock p{color:#687990;line-height:1.55}.seoPills{display:flex;flex-wrap:wrap;gap:8px}.seoPills span{padding:8px 11px;background:#edf3ff;color:#285db9;border-radius:9px;font-size:12px;font-weight:750}.seoSection{width:min(1160px,calc(100% - 36px));margin:90px auto}.seoHead{text-align:center;max-width:790px;margin:0 auto 38px}.seoHead h2,.seoSplit h2,.seoDark h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0 16px}.seoHead p,.seoSplit p{color:#617188;line-height:1.7;font-size:17px}.seoGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.seoGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.seoGrid article>div{font-size:28px}.seoGrid h3{margin:15px 0 8px}.seoGrid p{color:#687990;line-height:1.6;font-size:14px}.seoSplit{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.seoPanel{background:#fff;border:1px solid #e1e8f1;border-radius:28px;padding:42px}.seoSteps{display:grid;gap:12px}.seoStep{display:grid;grid-template-columns:42px 1fr;gap:15px;align-items:start;background:#f6f9fd;border-radius:15px;padding:16px}.seoStep b{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#e6efff;color:#2867e8}.seoStep strong,.seoStep span{display:block}.seoStep span{color:#728198;font-size:13px;margin-top:4px}.seoDark{background:#071426;color:#fff;padding:85px 24px}.seoDarkInner{max-width:1000px;margin:auto;text-align:center}.seoDarkInner>p{color:#b7c5d9;line-height:1.7;font-size:17px}.seoCompare{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:35px}.seoCompare>div{background:#0d203a;border:1px solid #263e5f;border-radius:18px;padding:28px;text-align:left}.seoCompare small{color:#82aaff;font-weight:850}.seoCompare h3{font-size:24px}.seoCompare p{color:#aebdd0;line-height:1.65}.seoLink{color:#2867e8;text-decoration:none;font-weight:800}.seoFaq{max-width:850px;margin:auto;display:grid;gap:10px}.seoFaq details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.seoFaq summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between}.seoFaq p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.seoFinal{background:#0a1930;color:#fff;text-align:center;padding:80px 24px}.seoFinal h2{font-size:clamp(35px,5vw,55px);margin:12px auto}.seoFinal p{color:#b7c5d9;font-size:18px;max-width:760px;margin:auto}.seoCenter{justify-content:center}@media(max-width:850px){.seoHeroGrid,.seoSplit{grid-template-columns:1fr}.seoGrid{grid-template-columns:1fr 1fr}.seoCompare{grid-template-columns:1fr}}@media(max-width:600px){.seoHero{padding:58px 24px 60px}.seoHero h1{font-size:42px}.seoSection{margin:65px auto}.seoGrid{grid-template-columns:1fr}.seoPanel{padding:25px}}
`}</style>
 </main>
}
