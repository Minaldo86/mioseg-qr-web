import { NextResponse, after } from "next/server";
import { supabaseAdmin as db } from "@/lib/supabase-admin";
import { UUID_GUARD, workerAuthorized, sendGuardEmails } from "@/lib/media-guard";
export const runtime="nodejs"; export const dynamic="force-dynamic"; export const maxDuration=60;
export async function POST(req:Request) {
 if(!workerAuthorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try {
  if(Number(req.headers.get("content-length")??0)>8192)return NextResponse.json({error:"Too large"},{status:413});
  const v=await req.json() as {qrxId:string;period:string;bytes:number;requests:number;needBytes:number;needRequests:number};
  if(!UUID_GUARD.test(v.qrxId??"") || v.period!==new Date().toISOString().slice(0,7)+"-01")throw new Error("input");
  for(const k of ["bytes","requests","needBytes","needRequests"] as const)if(!Number.isSafeInteger(v[k]) || v[k]<0 || v[k]>1e15)throw new Error("input");
  const {data,error}=await db.rpc("qrx_guard_policy",{p_qrx_id:v.qrxId,p_period:v.period,p_bytes:v.bytes,p_requests:v.requests,p_need_bytes:v.needBytes,p_need_requests:v.needRequests});
  if(error || !data)return NextResponse.json({error:"Policy unavailable"},{status:503});
  after(async()=>{try{await sendGuardEmails(2);}catch{console.error("Media guard mail processing unavailable");}});
  return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}});
 } catch {return NextResponse.json({error:"Invalid request"},{status:400});}
}
