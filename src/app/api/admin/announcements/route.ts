import { supabaseAdmin } from "../../../../lib/supabase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  try {
    const raw = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const i = raw.indexOf(":");
    return i >= 0 && raw.slice(0, i) === user && raw.slice(i + 1) === pass;
  } catch { return false; }
}
const fail = (message: string, status: number) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  if (!authorized(req)) return fail("Unauthorized", 401);
  const { data, error } = await supabaseAdmin.from("admin_announcements")
    .select("id,kind,status,audience,title_de,body_de,title_en,body_en,document_type,document_version,created_at,published_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) { console.error("admin announcements GET", error); return fail("Laden fehlgeschlagen", 500); }
  return Response.json({ announcements: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!authorized(req)) return fail("Unauthorized", 401);
  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return fail("Ungültiges JSON", 400); }
  const kind = input.kind;
  const audience = input.audience;
  const title = typeof input.title_de === "string" ? input.title_de.trim() : "";
  const body = typeof input.body_de === "string" ? input.body_de.trim() : "";
  const docType = typeof input.document_type === "string" ? input.document_type.trim() : null;
  const docVersion = typeof input.document_version === "string" ? input.document_version.trim() : null;
  if (!["info", "acknowledgement", "consent"].includes(String(kind))) return fail("Ungültige Art", 400);
  if (!["all", "selected"].includes(String(audience))) return fail("Ungültige Empfänger", 400);
  if (!title || title.length > 160 || !body || body.length > 10000) return fail("Titel oder Inhalt ungültig", 400);
  if (kind === "consent" && (!docType || !docVersion)) return fail("Dokumenttyp und Version fehlen", 400);
  const ids = Array.isArray(input.user_ids) ? input.user_ids : [];
  if (audience === "selected" && (!ids.length || ids.length > 100)) return fail("Bitte 1 bis 100 Nutzer-IDs angeben", 400);
  if (audience === "selected" && ids.some((id) => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))) return fail("Ungültige Nutzer-ID", 400);
  const { data, error } = await supabaseAdmin.from("admin_announcements").insert({
    kind, audience, status: "draft", title_de: title, body_de: body,
    title_en: typeof input.title_en === "string" ? input.title_en.trim().slice(0, 160) || null : null,
    body_en: typeof input.body_en === "string" ? input.body_en.trim().slice(0, 10000) || null : null,
    document_type: kind === "consent" ? docType : null,
    document_version: kind === "consent" ? docVersion : null,
  }).select("id").single();
  if (error || !data) { console.error("admin announcements POST", error); return fail("Entwurf konnte nicht gespeichert werden", 500); }
  if (audience === "selected") {
    const { error: targetError } = await supabaseAdmin.from("admin_announcement_targets")
      .insert([...new Set(ids as string[])].map((user_id) => ({ announcement_id: data.id, user_id })));
    if (targetError) {
      console.error("admin announcement targets", targetError);
      await supabaseAdmin.from("admin_announcements").delete().eq("id", data.id);
      return fail("Empfänger konnten nicht gespeichert werden", 400);
    }
  }
  return Response.json({ id: data.id, status: "draft" }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return fail("Unauthorized", 401);
  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return fail("Ungültiges JSON", 400); }
  if (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id)) return fail("Ungültige ID", 400);
  if (input.action !== "publish" && input.action !== "archive") return fail("Ungültige Aktion", 400);
  const { data: existing, error: readError } = await supabaseAdmin.from("admin_announcements")
    .select("id,status,kind,document_type,document_version").eq("id", input.id).single();
  if (readError || !existing) return fail("Mitteilung nicht gefunden", 404);
  if (input.action === "publish" && existing.status !== "draft") return fail("Nur Entwürfe können veröffentlicht werden", 409);
  if (input.action === "archive" && existing.status !== "published") return fail("Nur veröffentlichte Mitteilungen können archiviert werden", 409);
  if (input.action === "publish" && existing.kind === "consent") {
    const { count, error } = await supabaseAdmin.from("legal_document_versions")
      .select("document_version", { head: true, count: "exact" })
      .eq("document_type", existing.document_type!).eq("document_version", existing.document_version!);
    if (error || !count) return fail("Diese Dokumentversion ist nicht archiviert", 409);
  }
  const next = input.action === "publish" ? { status: "published", published_at: new Date().toISOString() } : { status: "archived" };
  const { error } = await supabaseAdmin.from("admin_announcements").update(next)
    .eq("id", input.id).eq("status", existing.status);
  if (error) { console.error("admin announcements PATCH", error); return fail("Aktualisierung fehlgeschlagen", 500); }
  return Response.json({ ok: true });
}
