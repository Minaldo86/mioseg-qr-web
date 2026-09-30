import { NextResponse, after } from "next/server";
import { supabaseAdmin as db } from "@/lib/supabase-admin";
import { consentInfo, hashToken, sendGuardEmails } from "@/lib/media-guard";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
const escape=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function page(body:string,status=200) {return new Response(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mioseg QR – Abrufvolumen</title><body style="font-family:system-ui;max-width:680px;margin:40px auto;padding:20px;line-height:1.6"><h1>Mioseg QR</h1>${body}</body></html>`,{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"}});}
export async function GET(req:Request) {
 try {
  const token=new URL(req.url).searchParams.get("token")??"";const i=await consentInfo(token),s=i.settings;
  const gb=(x:number)=>escape((x/1e9).toLocaleString("de-DE",{maximumFractionDigits:3}));
  return page(`<h2>${escape(i.title)} – zusätzliches Abrufvolumen</h2>
<p>Pro Kalendermonat (UTC) sind ${gb(s.free_bytes)} GB und ${escape(s.free_requests)} Medienabrufe frei. Ein Zusatzpaket kostet <strong>${escape(s.credits_per_pack)} Credit(s)</strong> und erweitert beide Limits um ${gb(s.pack_bytes)} GB und ${escape(s.pack_requests)} Abrufe.</p>
<p>Sobald eines der Limits nicht ausreicht, dürfen nach deiner Zustimmung automatisch Pakete aus deinem bestehenden Credit-Guthaben gekauft werden. Das kann bereits vor der vollständigen Auslieferung einer angeforderten Datei nötig sein. Unverbrauchtes Zusatzvolumen bleibt bis zum Monatsende verfügbar. Es erfolgt keine Zahlung per Bank oder Kreditkarte.</p>
<p>Ohne Zustimmung, ohne ausreichende Credits oder beim Erreichen deines Monatsmaximums werden weitere Medienabrufe begrenzt. Texte bleiben erreichbar. Die Upload-Abrechnung ist getrennt. Bereitgestellte Bytes sind nicht garantiert beim Besucher empfangen; bei verlorener Abschlussmeldung kann die angeforderte Menge vorsorglich als verbraucht gelten.</p>
<form method="post" action="/api/media-guard/consent"><input type="hidden" name="token" value="${escape(token)}">
<label>Maximal automatisch buchbare Credits pro Monat für diesen QR: <input name="cap" type="number" min="1" max="${s.max_monthly_credits}" value="${Math.min(s.max_monthly_credits,s.credits_per_pack)}" required></label>
<p><label><input type="checkbox" name="confirmed" value="yes"> Ich stimme diesen Konditionen (Version ${s.terms_version}) und der automatischen Abbuchung bis zu meinem Monatsmaximum ausdrücklich zu.</label></p>
<button name="action" value="approve">Abbuchung per Credits erlauben</button>
<button name="action" value="reject" formnovalidate>Ablehnen</button>
<button name="action" value="revoke" formnovalidate>Zustimmung widerrufen</button></form>
<p>Allein die Zustimmung bucht nichts ab. Widerruf verhindert weitere Käufe; bereits gekaufte Pakete bleiben bis Monatsende nutzbar und werden nicht automatisch erstattet. Dieser Link gilt sieben Tage und ist nach einer Entscheidung verbraucht.</p>`);
 }catch(e){return page(`<p>${escape(e instanceof Error?e.message:"Link nicht verfügbar.")}</p>`,400);}
}
export async function POST(req:Request) {
 if(req.headers.get("origin")!==new URL(req.url).origin)return page("<p>Ungültige Anfrage.</p>",403);
 try {
  const form=await req.formData(),token=String(form.get("token")??""),action=String(form.get("action")??"");
  await consentInfo(token);
  if(!["approve","reject","revoke"].includes(action) || (action==="approve" && form.get("confirmed")!=="yes"))throw new Error("Bitte bestätige die Konditionen ausdrücklich.");
  const cap=action==="approve"?Number(form.get("cap")):0;
  if(!Number.isSafeInteger(cap))throw new Error("Ungültiges Monatsmaximum.");
  const {error}=await db.rpc("qrx_guard_consent",{p_hash:hashToken(token),p_action:action,p_cap:cap});
  if(error)throw new Error("Die Entscheidung konnte nicht gespeichert werden. Der Link könnte abgelaufen sein.");
  after(async()=>{try{await sendGuardEmails(2);}catch{console.error("Media guard confirmation unavailable");}});
  return page(`<h2>Entscheidung gespeichert</h2><p>${action==="approve"?`Die automatische Abbuchung ist bis zu ${escape(cap)} Credits pro Kalendermonat für diesen QR erlaubt.`:"Weitere automatische Käufe sind deaktiviert."}</p><p>Allein diese Entscheidung hat keine Credits abgebucht. Die Medienfreigabe wird bei weiteren Abrufen innerhalb von etwa einer Minute geprüft.</p>`);
 }catch(e){return page(`<p>${escape(e instanceof Error?e.message:"Fehler.")}</p>`,400);}
}
