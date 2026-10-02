import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
 title: 'Tu empresa. Un código QR. Acceso directo. | Mioseg QR', description: 'Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.',
 alternates: {
      canonical: "/es/codigo-qr-business",
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
 openGraph: { title: 'Tu empresa. Un código QR. Acceso directo. | Mioseg QR', description: 'Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.', url: '/es/codigo-qr-business', type:"website" }
};

const faq=[{q:'¿Qué es un Business QR?',a:'Es un perfil dinámico de Mioseg QR que reúne datos de empresa, contacto, ubicación, redes sociales y otros contenidos.'},{q:'¿Es obligatorio aparecer en Explore?',a:'No. Es opcional. Aunque lo desactives, el QR y el enlace directo siguen siendo accesibles.'}];
const points=['Perfil empresarial','Contacto','Ubicación','Redes sociales','Visibilidad en Explore','Verificación'];

export default function Page(){
 const jsonLd={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))};
 return <main className="locSeoPage">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  <section className="locSeoHero"><div className="locSeoWrap locSeoHeroGrid"><div><span className="locSeoEyebrow">BUSINESS QR</span><h1>Tu empresa. Un código QR. Acceso directo.</h1><p className="locSeoLead">Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.</p><div className="locSeoActions"><Link href="/es/get-app" className="locSeoPrimary">Empezar</Link><Link href="/es/ayuda" className="locSeoSecondary">Centro de ayuda</Link></div></div><div className="locSeoMock"><div className="locSeoQr">▦</div><h3>Mioseg QR</h3><p>Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.</p></div></div></section>
  <section className="locSeoSection"><div className="locSeoHead"><span className="locSeoEyebrow" style={{color:"#2867e8"}}>MIOSEG QR</span><h2>Más que un QR: un perfil digital para tu empresa.</h2></div><div className="locSeoGrid">{points.map((p,i)=><article key={p}><b>{String(i+1).padStart(2,"0")}</b><h3>{p}</h3><p>Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.</p></article>)}</div></section>
  <section className="locSeoDark"><span className="locSeoEyebrow">MIOSEG QR</span><h2>Tu empresa. Un código QR. Acceso directo.</h2><p>Reúne información de empresa, contacto, web, ubicación y redes sociales en un Business QR dinámico.</p></section>
  <section className="locSeoSection"><div className="locSeoHead"><span className="locSeoEyebrow" style={{color:"#2867e8"}}>Preguntas frecuentes</span><h2>Preguntas frecuentes</h2></div><div className="locSeoFaq">{faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>
  <section className="locSeoFinal"><span className="locSeoEyebrow">MIOSEG QR</span><h2>Descubre Mioseg QR</h2><div className="locSeoActions"><Link href="/es/get-app" className="locSeoPrimary">Empezar</Link><Link href="/es/ayuda" className="locSeoSecondary">Centro de ayuda</Link></div></section>
  <style>{`
*{box-sizing:border-box}.locSeoPage{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,-apple-system,sans-serif}.locSeoHero{background:radial-gradient(circle at 78% 35%,#17366b 0,#0c2346 22%,#071426 52%);color:#fff;padding:78px 24px 90px}.locSeoWrap{width:min(1160px,100%);margin:auto}.locSeoHeroGrid{display:grid;grid-template-columns:1.08fr .72fr;gap:75px;align-items:center}.locSeoEyebrow{font-size:12px;letter-spacing:.12em;font-weight:850;color:#82aaff}.locSeoHero h1{font-size:clamp(42px,6vw,68px);line-height:1.04;letter-spacing:-.04em;margin:15px 0 24px}.locSeoLead{font-size:19px;line-height:1.7;color:#bdc9da}.locSeoActions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.locSeoPrimary,.locSeoSecondary{padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.locSeoPrimary{background:#fff;color:#0b1d37}.locSeoSecondary{border:1px solid #496487;color:#e2e9f4}.locSeoMock{background:#fff;color:#10213a;border-radius:26px;padding:25px;box-shadow:0 30px 80px #0007}.locSeoQr{height:190px;background:#edf3fb;border-radius:20px;display:grid;place-items:center;font-size:90px;color:#2867e8}.locSeoMock p{color:#687990;line-height:1.6}.locSeoSection{width:min(1160px,calc(100% - 36px));margin:90px auto}.locSeoHead{text-align:center;max-width:790px;margin:0 auto 38px}.locSeoHead h2{font-size:clamp(31px,4vw,48px);line-height:1.1;letter-spacing:-.03em;margin:12px 0}.locSeoGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.locSeoGrid article{background:#fff;border:1px solid #e1e8f1;border-radius:20px;padding:25px}.locSeoGrid b{display:block;color:#2867e8;font-size:13px;margin-bottom:12px}.locSeoGrid h3{margin:0 0 8px}.locSeoGrid p{color:#687990;line-height:1.6;font-size:14px}.locSeoDark{background:#071426;color:#fff;padding:80px 24px;text-align:center}.locSeoDark h2{font-size:clamp(31px,4vw,48px);max-width:850px;margin:12px auto}.locSeoDark p{max-width:760px;margin:18px auto;color:#b7c5d9;line-height:1.7}.locSeoFaq{max-width:850px;margin:auto;display:grid;gap:10px}.locSeoFaq details{background:#fff;border:1px solid #e1e8f1;border-radius:15px;padding:0 20px}.locSeoFaq summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:800;display:flex;justify-content:space-between;gap:20px}.locSeoFaq p{color:#607188;line-height:1.7;padding:0 0 20px;margin:0}.locSeoFinal{background:#0a1930;color:#fff;text-align:center;padding:75px 24px}.locSeoFinal h2{font-size:clamp(34px,5vw,52px);margin:12px}.locSeoFinal .locSeoActions{justify-content:center}@media(max-width:850px){.locSeoHeroGrid{grid-template-columns:1fr}.locSeoGrid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.locSeoHero{padding:58px 24px}.locSeoHero h1{font-size:41px}.locSeoGrid{grid-template-columns:1fr}.locSeoSection{margin:65px auto}}
`}</style>
 </main>
}
