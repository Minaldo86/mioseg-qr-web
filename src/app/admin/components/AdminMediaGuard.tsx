"use client";
import { useEffect,useState,type CSSProperties } from "react";
import type { GuardSettings } from "@/lib/media-guard";
type Usage={qrx_id:string;bytes_served:number;requests:number;credits_spent:number;packs:number;updated_at:string};
type Mail={id:string;qrx_id:string;kind:string;status:string;attempts:number};
type Report={settings:GuardSettings;usage:Usage[];overrides:{qrx_id:string;enabled:boolean;blocked:boolean}[];consents:{qrx_id:string;approved:boolean;max_monthly_credits:number}[];mail:Mail[]};
const style:CSSProperties={background:"#172033",color:"#e2e8f0",padding:8,border:"1px solid #475569",borderRadius:6,width:"100%",boxSizing:"border-box"};
export default function AdminMediaGuard() {
 const [r,setR]=useState<Report|null>(null),[s,setS]=useState<GuardSettings|null>(null),[id,setId]=useState("");
 const [enabled,setEnabled]=useState(true),[blocked,setBlocked]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function load() {
  const res=await fetch("/api/admin/media-guard",{cache:"no-store"}),v=await res.json() as Report & {error?:string};
  if(!res.ok)throw new Error(v.error??"Laden fehlgeschlagen.");setR(v);setS(v.settings);
 }
 useEffect(()=>{void load().catch(e=>setMessage(e.message));},[]);
 async function action(body:Record<string,unknown>) {
  setBusy(true);setMessage("");
  try {const res=await fetch("/api/admin/media-guard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),v=await res.json() as Report & {error?:string};if(!res.ok)throw new Error(v.error??"Fehler.");await load();setMessage(body.action==="invite"?"E-Mail vorgemerkt. Versandstatus unten prüfen.":"Gespeichert. Worker-Einstellungen werden innerhalb von etwa einer Minute neu geladen.");}
  catch(e){setMessage(e instanceof Error?e.message:"Fehler.");}finally{setBusy(false);}
 }
 const update=(k:keyof GuardSettings,v:number|boolean)=>setS(old=>old?{...old,[k]:v}:old);
 const numbers:[keyof GuardSettings,string,number,number][]=[
  ["free_bytes","Freie Auslieferung pro QR/Monat (Bytes)",1,1e12],["free_requests","Freie Medienabrufe pro QR/Monat",1,1e9],
  ["pack_bytes","Zusätzliches Volumen pro Paket (Bytes)",1,1e12],["pack_requests","Zusätzliche Medienabrufe pro Paket",1,1e9],
  ["credits_per_pack","Credits pro Zusatzpaket",1,100000],["max_monthly_credits","Höchstens automatisch buchbare Credits pro QR/Monat",1,100000],
  ["warn_percent","Ersteller kontaktieren ab (%)",1,99],
 ];
 return <section style={{marginTop:32,paddingTop:24,borderTop:"1px solid #475569"}}><h2>Abrufschutz pro Mioseg QR</h2>
 <p>Monatliche Limits für bereitgestellte Nutzdaten und Medienabrufe. Zusatzpakete werden nur mit ausdrücklicher Zustimmung und ausreichendem Guthaben gekauft. Ein Paket erweitert beide Limits. 1 GB = 1.000.000.000 Bytes.</p>
 <p>Zusätzliche Cloudflare-Durable-Object-Kosten sind in der bisherigen Kosten-Teilschätzung nicht enthalten. Limits sind keine garantierte Obergrenze für die gesamte Anbieterrechnung.</p>
 {message&&<p role="status">{message}</p>}
 {s&&<form onSubmit={e=>{e.preventDefault();void action({action:"save",settings:s});}}>
 <p><label><input type="checkbox" checked={s.enabled} onChange={e=>update("enabled",e.target.checked)}/> Abrufschutz im Backend aktivieren</label></p>
 <p><label><input type="checkbox" checked={s.default_enabled} onChange={e=>update("default_enabled",e.target.checked)}/> Standardmäßig für alle QR aktivieren (sonst nur unten ausgewählte Test-QR)</label></p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>{numbers.map(([k,label,min,max])=><label key={k}>{label}<input style={style} type="number" required step="1" min={min} max={max} value={Number(s[k])} onChange={e=>update(k,Number(e.target.value))}/></label>)}</div>
 <p>Änderungen an Paketpreis oder Volumen erfordern eine neue Zustimmung. Bereits gestartete Monatskontingente behalten ihre Konditionen bis Monatsende. Es erfolgt keine rückwirkende Abrechnung.</p>
 <button disabled={busy}>Einstellungen speichern</button></form>}
 <h3>Einzelnen QR auswählen</h3><input style={style} placeholder="QR-ID (UUID)" value={id} onChange={e=>setId(e.target.value.trim())}/>
 <p><label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Für diesen QR aktiv</label> · <label><input type="checkbox" checked={blocked} onChange={e=>setBlocked(e.target.checked)}/> Medien manuell sperren</label></p>
 <button disabled={busy||!id} onClick={()=>void action({action:"override",qrxId:id,enabled,blocked})}>QR-Einstellung speichern</button>{" "}
 <button disabled={busy||!id} onClick={()=>void action({action:"invite",qrxId:id})}>Zustimmungs-E-Mail an Ersteller senden</button>
 <p><button disabled={busy} onClick={()=>void load().catch(e=>setMessage(e.message))}>Anzeige aktualisieren</button>{" "}<button disabled={busy} onClick={()=>void action({action:"send"})}>Ausstehende E-Mails erneut versuchen</button></p>
 <h3>Verbrauch dieses Monats (bis zu 100 zuletzt aktive QR)</h3><div style={{overflowX:"auto"}}><table><thead><tr><th>QR-ID</th><th>GB bereitgestellt</th><th>Abrufe</th><th>Credits gebucht</th></tr></thead><tbody>{r?.usage.map(u=><tr key={u.qrx_id}><td><button onClick={()=>{setId(u.qrx_id);const o=r.overrides.find(x=>x.qrx_id===u.qrx_id);setEnabled(o?.enabled??r.settings.default_enabled);setBlocked(o?.blocked??false);}}>{u.qrx_id}</button></td><td>{(Number(u.bytes_served)/1e9).toLocaleString("de-DE",{maximumFractionDigits:4})}</td><td>{u.requests}</td><td>{u.credits_spent}</td></tr>)}</tbody></table></div>
 <h3>E-Mail-Versand (letzte 30 Einträge)</h3>{r?.mail.map(m=><p key={m.id}>{m.qrx_id} · {m.kind} · {m.status} · Versuche: {m.attempts}</p>)}
 <p>Messung beginnt mit Aktivierung. Video-Teilabrufe werden mit ihrer angeforderten Teilmenge reserviert. Nach erfolgreicher Abschlussmeldung zählt die bereitgestellte Datenmenge; bei verlorener Abschlussmeldung wird nach 30 Minuten vorsorglich die reservierte Menge angerechnet. Einstellungen und Anzeige können bis zu etwa einer Minute verzögert sein.</p>
 </section>;
}
