import { NextResponse, after } from "next/server";
import { supabaseAdmin as db } from "@/lib/supabase-admin";
import { isMediaCostAdmin } from "@/lib/media-cost-auth";
import { guardSettings, validSettings, UUID_GUARD, sendGuardEmails } from "@/lib/media-guard";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
export async function GET(req:Request) {
 if(!isMediaCostAdmin(req))return NextResponse.json({error:"Nicht autorisiert."},{status:401});
 try {
  const settings=await guardSettings(),period=new Date().toISOString().slice(0,7)+"-01";
  const results=await Promise.all([
   db.from("qrx_guard_usage").select("*").eq("period_start",period).order("updated_at",{ascending:false}).limit(100),
   db.from("qrx_guard_overrides").select("*").limit(100),
   db.from("qrx_guard_consents").select("qrx_id,approved,max_monthly_credits,owner_user_id,terms_version").limit(100),
   db.from("qrx_guard_mail").select("id,qrx_id,kind,status,attempts,created_at,sent_at").order("created_at",{ascending:false}).limit(30),
  ]);
  if(results.some(r=>r.error))throw new Error("Verbrauchsdaten konnten nicht geladen werden.");
  return NextResponse.json({settings,usage:results[0].data,overrides:results[1].data,consents:results[2].data,mail:results[3].data},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Fehler."},{status:503});}
}
export async function POST(req:Request) {
 if(!isMediaCostAdmin(req))return NextResponse.json({error:"Nicht autorisiert."},{status:401});
 if(req.headers.get("origin")!==new URL(req.url).origin)return NextResponse.json({error:"Ungültige Anfrage."},{status:403});
 try {
  const v=await req.json() as {action:string;settings:unknown;qrxId:string;enabled:boolean;blocked:boolean};
  if(v.action==="save") {
   const settings=validSettings(v.settings);
   const {error}=await db.rpc("qrx_guard_save_settings",{p_settings:settings});if(error)throw new Error("Speichern fehlgeschlagen.");
  }else if(v.action==="override" || v.action==="invite") {
   if(!UUID_GUARD.test(v.qrxId??""))throw new Error("Bitte eine gültige QR-ID eingeben.");
   const {data:e,error:entryError}=await db.from("qr_x_entries").select("owner_user_id").eq("id",v.qrxId).single();
   if(entryError || !e)throw new Error("QR nicht gefunden.");
   if(v.action==="override") {
    if(typeof v.enabled!=="boolean" || typeof v.blocked!=="boolean")throw new Error("Ungültige Einstellung.");
    const {error}=await db.from("qrx_guard_overrides").upsert({qrx_id:v.qrxId,enabled:v.enabled,blocked:v.blocked});if(error)throw new Error("QR-Einstellung konnte nicht gespeichert werden.");
   }else {
    const {error}=await db.from("qrx_guard_mail").insert({qrx_id:v.qrxId,owner_user_id:e.owner_user_id,period_start:new Date().toISOString().slice(0,7)+"-01",kind:"warning",event_key:`invite:${crypto.randomUUID()}`});
    if(error)throw new Error("E-Mail konnte nicht vorgemerkt werden.");
    after(async()=>{try{await sendGuardEmails(2);}catch{console.error("Media guard invitation unavailable");}});
   }
  }else if(v.action==="send") {
   const result=await sendGuardEmails(5);return NextResponse.json({ok:true,result});
  }else throw new Error("Ungültige Aktion.");
  return NextResponse.json({ok:true});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Fehler."},{status:400});}
}
