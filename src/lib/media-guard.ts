import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseAdmin as db } from "@/lib/supabase-admin";
export const UUID_GUARD=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type GuardSettings={enabled:boolean;default_enabled:boolean;free_bytes:number;free_requests:number;pack_bytes:number;pack_requests:number;credits_per_pack:number;max_monthly_credits:number;warn_percent:number;terms_version?:number};
export function hashToken(value:string) { return createHash("sha256").update(value).digest("hex"); }
export function workerAuthorized(req:Request) {
 const secret=process.env.MEDIA_GUARD_SECRET;
 const got=Buffer.from(req.headers.get("authorization")??""), want=Buffer.from(`Bearer ${secret??""}`);
 return !!secret && secret.length>=32 && got.length===want.length && timingSafeEqual(got,want);
}
export function validSettings(value:unknown):GuardSettings {
 if (!value || typeof value!=="object") throw new Error("Einstellungen fehlen.");
 const v=value as Record<string,unknown>;
 const n=(key:string,min:number,max:number)=>{const x=Number(v[key]); if(!Number.isSafeInteger(x)||x<min||x>max)throw new Error(`Ungültiger Wert: ${key}`);return x;};
 if(typeof v.enabled!=="boolean" || typeof v.default_enabled!=="boolean")throw new Error("Ungültige Aktivierung.");
 const settings={enabled:v.enabled,default_enabled:v.default_enabled,free_bytes:n("free_bytes",1,1e12),free_requests:n("free_requests",1,1e9),pack_bytes:n("pack_bytes",1,1e12),pack_requests:n("pack_requests",1,1e9),credits_per_pack:n("credits_per_pack",1,100000),max_monthly_credits:n("max_monthly_credits",1,100000),warn_percent:n("warn_percent",1,99)};
 if(settings.free_bytes+Math.floor(settings.max_monthly_credits/settings.credits_per_pack)*settings.pack_bytes>1e15)throw new Error("Das maximal mögliche Monatsvolumen ist zu groß.");
 return settings;
}
export async function guardSettings():Promise<GuardSettings> {
 const {data,error}=await db.from("qrx_guard_settings").select("*").eq("id",1).single();
 if(error || !data)throw new Error("Bitte zuerst die Media-Guard-SQL-Migration ausführen.");
 return {...data,free_bytes:Number(data.free_bytes),free_requests:Number(data.free_requests),pack_bytes:Number(data.pack_bytes),pack_requests:Number(data.pack_requests)};
}
export function consentBase() {
 const value=process.env.MEDIA_GUARD_SITE_URL;
 if(!value)throw new Error("MEDIA_GUARD_SITE_URL fehlt.");
 const u=new URL(value); if(u.protocol!=="https:" || u.username || u.password || u.pathname!=="/" || u.search || u.hash)throw new Error("MEDIA_GUARD_SITE_URL muss eine HTTPS-Webadresse ohne Pfad sein.");
 return u.origin;
}
export async function consentInfo(token:string) {
 if(!/^[a-f0-9]{64}$/.test(token))throw new Error("Ungültiger Link.");
 const {data:t,error}=await db.from("qrx_guard_tokens").select("*").eq("token_hash",hashToken(token)).single();
 const s=await guardSettings();
 if(error || !t || t.used_at || Date.parse(t.expires_at)<Date.now() || t.terms_version!==s.terms_version)throw new Error("Dieser Link ist abgelaufen oder wurde bereits verwendet.");
 const {data:e}=await db.from("qr_x_entries").select("owner_user_id,title").eq("id",t.qrx_id).single();
 if(!e || e.owner_user_id!==t.owner_user_id)throw new Error("Dieser Link ist nicht mehr gültig.");
 const period=new Date().toISOString().slice(0,7)+"-01";
 const {data:u}=await db.from("qrx_guard_usage").select("terms_version,free_bytes,free_requests,pack_bytes,pack_requests,credits_per_pack").eq("qrx_id",t.qrx_id).eq("period_start",period).maybeSingle();
 // Changing prices never silently changes an existing month's purchased quota.
 if(u && u.terms_version!==s.terms_version)throw new Error("Die Konditionen wurden geändert. Eine neue Zustimmung ist ab dem nächsten Kalendermonat möglich.");
 const {data:c}=await db.from("qrx_guard_consents").select("approved,max_monthly_credits,owner_user_id").eq("qrx_id",t.qrx_id).maybeSingle();
 return {token:t,settings:s,title:e.title??"Mioseg QR",consent:c};
}
type Mail={id:string;qrx_id:string;owner_user_id:string;period_start:string;kind:string;event_key:string;claimed_at:string;meta?:{charged_credits?:number;new_balance?:number;approved?:boolean;cap?:number};payload?:Record<string,unknown>};
export async function sendGuardEmails(limit=5) {
 const apiKey=process.env.RESEND_API_KEY,from=process.env.MEDIA_COST_EMAIL_FROM;
 if(!apiKey || !from)return {sent:0,pending:true};
 const origin=consentBase();
 const {data:rows,error}=await db.from("qrx_guard_mail").select("id").in("status",["pending","processing"]).lt("attempts",10).order("created_at").limit(limit*3);
 if(error)throw new Error("Mailwarteschlange konnte nicht geladen werden.");
 let sent=0,processed=0,failed=0;
 for(const row of rows??[]) {
  if(processed>=limit)break;
  const {data:m,error:claimError}=await db.rpc("qrx_guard_claim_mail",{p_id:row.id});
  if(claimError || !m)continue;
  processed++; const mail=m as Mail;
  try {
   const {data:e,error:entryError}=await db.from("qr_x_entries").select("owner_user_id,title").eq("id",mail.qrx_id).single();
   if(entryError)throw new Error("QR-Prüfung fehlgeschlagen.");
   if(!e || e.owner_user_id!==mail.owner_user_id) {await db.from("qrx_guard_mail").update({status:"cancelled"}).eq("id",mail.id).eq("claimed_at",mail.claimed_at);continue;}
   let payload=mail.payload;
   if(!payload) {
    const {data:user,error:userError}=await db.auth.admin.getUserById(mail.owner_user_id);
    if(userError || !user?.user?.email)throw new Error("Keine Ersteller-E-Mail verfügbar.");
    const s=await guardSettings(); const token=randomBytes(32).toString("hex");
    const {error:tokenError}=await db.from("qrx_guard_tokens").insert({token_hash:hashToken(token),qrx_id:mail.qrx_id,owner_user_id:mail.owner_user_id,terms_version:s.terms_version,expires_at:new Date(Date.now()+7*86400000).toISOString()});
    if(tokenError)throw new Error("Zustimmungslink konnte nicht erstellt werden.");
    const {data:u}=await db.from("qrx_guard_usage").select("*").eq("qrx_id",mail.qrx_id).eq("period_start",mail.period_start).maybeSingle();
    const link=`${origin}/api/media-guard/consent?token=${token}`;
    const gb=(n:number)=>Number(n/1e9).toLocaleString("de-DE",{maximumFractionDigits:3});
    const terms=u??s;
    const intro=mail.kind==="purchase" ? `Zusätzliches Abrufvolumen wurde gemäß deiner Zustimmung freigeschaltet. Abgebucht: ${mail.meta?.charged_credits??"siehe Credit-Verlauf"} Credits. Neues Guthaben: ${mail.meta?.new_balance??"siehe Credit-Verlauf"} Credits.` : mail.kind==="consent" ? `Deine Entscheidung wurde gespeichert: ${mail.meta?.approved?`Automatische Käufe bis zu ${mail.meta.cap} Credits pro Monat erlaubt.`:"Weitere automatische Käufe deaktiviert."} Allein die Zustimmung bucht keine Credits ab.` : mail.kind==="limit" ? "Ein Medienabruf konnte wegen des erreichten Limits nicht freigegeben werden. Ohne ausreichendes Volumen bleiben weitere Medienabrufe begrenzt." : "Dein Mioseg QR wird häufig genutzt. Die eingestellte Warnschwelle des freien Abrufvolumens oder der freien Abrufanzahl wurde erreicht.";
    payload={from,to:[user.user.email],subject:`Mioseg QR: ${mail.kind==="purchase"?"Credit-Buchung":mail.kind==="consent"?"Entscheidung bestätigt":mail.kind==="limit"?"Abruflimit erreicht":"Abrufvolumen-Warnung"}`,
     text:`${String(e.title??"Mioseg QR")}\n\n${intro}\n\nKalendermonat (UTC): ${mail.period_start}\nErfasste Auslieferung: ${gb(Number(u?.bytes_served??0))} GB; Abrufe: ${u?.requests??0}.\nBisher gebuchte Credits in diesem Monat: ${u?.credits_spent??0}.\n\nFreivolumen: ${gb(Number(terms.free_bytes))} GB und ${terms.free_requests} Abrufe pro Monat.\nEin Zusatzpaket kostet ${terms.credits_per_pack} Credit(s) und erweitert beide Limits um ${gb(Number(terms.pack_bytes))} GB und ${terms.pack_requests} Abrufe. Ein Paket wird benötigt, sobald eines der beiden Limits nicht ausreicht.\n\nZustimmen, ablehnen oder Zustimmung widerrufen:\n${link}\n\nBeim Öffnen des Links wird nichts abgebucht. Du bestätigst deine Entscheidung auf der folgenden Seite. Ohne Zustimmung, bei fehlenden Credits oder erreichtem Monatsmaximum werden Medienabrufe begrenzt. Texte des QR bleiben erreichbar. Die Speicherkosten beim Hochladen sind davon getrennt. Bereits gekaufte Zusatzpakete gelten bis zum Monatsende und werden durch Widerruf nicht erstattet.\n\nGemessen werden vom Server bereitgestellte Nutzdaten, nicht garantiert auf deinem Gerät empfangene Bytes. Bei einer verlorenen Abschlussmeldung kann die angeforderte Datenmenge vorsorglich als verbraucht gelten. Bitte melde fehlerhafte Buchungen beim Support.`};
    const {error:saveError}=await db.from("qrx_guard_mail").update({payload}).eq("id",mail.id).eq("claimed_at",mail.claimed_at);
    if(saveError)throw new Error("Mail konnte nicht gespeichert werden.");
   }
   const r=await fetch("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`guard-${mail.id}`},body:JSON.stringify(payload)});
   if(!r.ok)throw new Error(`Mail HTTP ${r.status}`);
   const {error:sentError}=await db.from("qrx_guard_mail").update({status:"sent",sent_at:new Date().toISOString(),lease_until:null}).eq("id",mail.id).eq("claimed_at",mail.claimed_at);
   if(sentError)throw new Error("Mailstatus konnte nicht gespeichert werden.");
   sent++;
  } catch { failed++; await db.from("qrx_guard_mail").update({status:"pending",lease_until:null}).eq("id",mail.id).eq("claimed_at",mail.claimed_at); }
 }
 return {sent,failed};
}
