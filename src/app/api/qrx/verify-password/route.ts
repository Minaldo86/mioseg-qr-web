import { supabaseAdmin } from "@/lib/supabase-admin";

const encoder = new TextEncoder();
const UNLOCK_TTL_MS = 15 * 60 * 1000;

function json(obj: unknown, status = 200, headers?: Headers) {
  return Response.json(obj, { status, headers });
}
function fromHex(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) throw new Error("Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i=0;i<out.length;i++) out[i]=parseInt(hex.slice(i*2,i*2+2),16);
  return out;
}
function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function timingSafeEqualHex(a:string,b:string) {
  try { const aa=fromHex(a),bb=fromHex(b); if(aa.length!==bb.length)return false; let diff=0; for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i]; return diff===0; } catch { return false; }
}
async function pbkdf2Hash(password:string,saltHex:string,iterations:number) {
  const keyMaterial=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:fromHex(saltHex),iterations},keyMaterial,256);
  return toHex(bits);
}
async function verifyPassword(password:string,storedHash:string|null|undefined) {
  if(!storedHash||typeof storedHash!=="string")return false;
  const parts=storedHash.split("$"); if(parts.length!==4)return false;
  const [algorithm,iterationsRaw,saltHex,expectedHex]=parts;
  if(algorithm!=="pbkdf2_sha256")return false;
  const iterations=Number(iterationsRaw);
  if(!Number.isInteger(iterations)||iterations<100000)return false;
  return timingSafeEqualHex(await pbkdf2Hash(password,saltHex,iterations),expectedHex);
}
function cookieName(qrxId:string) {
  return `mioseg_qrx_unlock_${qrxId.replace(/[^a-zA-Z0-9_-]/g,"_")}`;
}
async function signUnlock(value:string,secret:string) {
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return toHex(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}

export async function POST(req:Request) {
  try {
    const body=await req.json().catch(()=>null);
    const qrxId=typeof body?.qrxId==="string"?body.qrxId.trim():"";
    const password=typeof body?.password==="string"?body.password:"";
    if(!qrxId)return json({error:"qrxId fehlt"},400);
    if(!password)return json({error:"Passwort fehlt"},400);

    const secret=String(process.env.QRX_PASSWORD_UNLOCK_SECRET||"").trim();
    if(!secret)return json({error:"Passwort-Freigabe ist serverseitig nicht konfiguriert."},500);

    const {data:entry,error}=await supabaseAdmin.from("qr_x_entries")
      .select("id,password_protected,password_hash,deleted_at,suspended")
      .eq("id",qrxId).maybeSingle();
    if(error)return json({error:"Mioseg QR konnte nicht geladen werden"},500);
    if(!entry)return json({error:"Mioseg QR nicht gefunden"},404);
    if(entry.deleted_at)return json({error:"Mioseg QR nicht verfügbar"},410);
    if(entry.suspended===true)return json({error:"Mioseg QR gesperrt"},423);

    if(!entry.password_protected)return json({ok:true,protected:false,accessGranted:true});

    const valid=await verifyPassword(password,entry.password_hash);
    if(!valid)return json({ok:true,protected:true,accessGranted:false});

    const expires=Date.now()+UNLOCK_TTL_MS;
    const expiresRaw=String(expires);
    const signature=await signUnlock(`${qrxId}.${expiresRaw}`,secret);
    const headers=new Headers();
    headers.append("Set-Cookie",`${cookieName(qrxId)}=${expiresRaw}.${signature}; Path=/qrx/${encodeURIComponent(qrxId)}; Max-Age=${Math.floor(UNLOCK_TTL_MS/1000)}; HttpOnly; Secure; SameSite=Lax`);

    return json({ok:true,protected:true,accessGranted:true},200,headers);
  } catch(error:unknown) {
    return json({error:error instanceof Error?error.message:"Server error"},500);
  }
}
