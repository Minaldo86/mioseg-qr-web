"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Message = { id:string; kind:"info"|"acknowledgement"|"consent"; title:string; body:string; document_type:string|null; document_version:string|null };
const STRINGS:Record<string,{accept:string;decline:string;ok:string;later:string;view:string;error:string}> = {
 de:{accept:"Zustimmen",decline:"Ablehnen",ok:"Verstanden",later:"Später",view:"Dokument ansehen",error:"Speichern fehlgeschlagen. Bitte erneut versuchen."},
 en:{accept:"Accept",decline:"Decline",ok:"Understood",later:"Later",view:"View document",error:"Could not save. Please retry."},
 tr:{accept:"Kabul et",decline:"Reddet",ok:"Anladım",later:"Daha sonra",view:"Belgeyi görüntüle",error:"Kaydedilemedi."},
 pl:{accept:"Akceptuję",decline:"Odrzuć",ok:"Rozumiem",later:"Później",view:"Zobacz dokument",error:"Nie udało się zapisać."},
 ar:{accept:"أوافق",decline:"أرفض",ok:"فهمت",later:"لاحقًا",view:"عرض المستند",error:"تعذر الحفظ."},
 fr:{accept:"Accepter",decline:"Refuser",ok:"Compris",later:"Plus tard",view:"Voir le document",error:"Enregistrement impossible."},
 es:{accept:"Aceptar",decline:"Rechazar",ok:"Entendido",later:"Más tarde",view:"Ver documento",error:"No se pudo guardar."},
 it:{accept:"Accetto",decline:"Rifiuto",ok:"Ho capito",later:"Più tardi",view:"Vedi documento",error:"Impossibile salvare."},
};
export default function AdminAnnouncementGate({locale,children}:{locale:string;children:React.ReactNode}) {
 const [messages,setMessages]=useState<Message[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [userId,setUserId]=useState<string|null>(null);
 const ui=STRINGS[locale]||STRINGS.de;
 const refresh=useCallback(async()=>{
   const {data:{user}}=await supabase.auth.getUser(); setUserId(user?.id||null);
   if(!user){setMessages([]);return;}
   const {data,error}=await supabase.rpc("my_pending_admin_announcements");
   if(error){console.warn("Announcements check",error.message);return;}
   setMessages((data||[]) as Message[]);
 },[]);
 useEffect(()=>{void refresh();const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{setTimeout(()=>void refresh(),0)});const onFocus=()=>void refresh();window.addEventListener("focus",onFocus);return()=>{subscription.unsubscribe();window.removeEventListener("focus",onFocus)}},[refresh]);
 const message=messages[0];
 async function respond(response:string){if(!message||busy)return;setBusy(true);setError("");
  const {error}=await supabase.rpc("respond_to_admin_announcement",{p_announcement_id:message.id,p_response:response});
  if(error){setError(ui.error);setBusy(false);return;} await refresh();setBusy(false);
 }
 return <>{children}{userId&&message?<div role="dialog" aria-modal="true" aria-label={message.title} style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.78)",display:"grid",placeItems:"center",padding:16}}><section style={{width:"min(520px,100%)",maxHeight:"90vh",overflowY:"auto",background:"#101a2a",color:"#f8fafc",border:"1px solid #334155",borderRadius:20,padding:24}}><h2 style={{marginTop:0}}>{message.title}</h2><p style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{message.body}</p>{message.kind==="consent"&&message.document_type==="terms"?<a target="_blank" rel="noopener noreferrer" href={`/${locale}/nutzungsbedingungen`} style={{color:"#93c5fd"}}>{ui.view} ({message.document_version})</a>:null}{error?<p style={{color:"#fca5a5"}}>{error}</p>:null}<div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>{message.kind==="consent"?<><button disabled={busy} onClick={()=>void respond("accepted")}>{ui.accept}</button><button disabled={busy} onClick={()=>void respond("declined")}>{ui.decline}</button></>:<><button disabled={busy} onClick={()=>void respond("acknowledged")}>{ui.ok}</button>{message.kind==="info"?<button disabled={busy} onClick={()=>setMessages(v=>v.slice(1))}>{ui.later}</button>:null}</>}</div></section></div>:null}</>;
}
