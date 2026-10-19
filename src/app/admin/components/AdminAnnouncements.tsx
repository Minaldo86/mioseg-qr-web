"use client";

import { useCallback, useEffect, useState } from "react";

type AnnouncementStatistics = { recipients: number; acknowledged: number; accepted: number; declined: number; pending: number };
type Item = { statistics?: AnnouncementStatistics | null; id: string; kind: string; status: string; audience: string; title_de: string; created_at: string; published_at: string | null };
const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: 11, background: "#0b1324", color: "#f8fafc", border: "1px solid #334155", borderRadius: 10 };
const buttonStyle = { padding: "10px 14px", background: "#1e3a5f", color: "#fff", border: "1px solid #475569", borderRadius: 10, cursor: "pointer" };

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Item[]>([]);
  const [kind, setKind] = useState("info");
  const [audience, setAudience] = useState("all");
  const [userIds, setUserIds] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [docType, setDocType] = useState("terms");
  const [docVersion, setDocVersion] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const res = await fetch("/api/admin/announcements", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Laden fehlgeschlagen");
    setItems(data.announcements || []);
  }, []);
  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [load]);
  async function create() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, audience, user_ids: userIds.split(/[\s,;]+/).filter(Boolean), title_de: title, body_de: body, title_en: titleEn, body_en: bodyEn, document_type: docType, document_version: docVersion }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");
      setTitle(""); setBody(""); setTitleEn(""); setBodyEn("");
      setMessage("Entwurf gespeichert. Noch nicht veröffentlicht."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Fehler"); } finally { setBusy(false); }
  }
  async function action(id: string, name: "publish" | "archive") {
    if (!window.confirm(name === "publish" ? "Mitteilung wirklich veröffentlichen?" : "Mitteilung archivieren?")) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/admin/announcements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aktion fehlgeschlagen");
      setMessage(name === "publish" ? "Veröffentlicht. Die Mitteilung wird in App und Web angezeigt." : "Archiviert."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Fehler"); } finally { setBusy(false); }
  }
  return <section style={{ padding: 20, borderRadius: 20, background: "#0f172a", border: "1px solid #26364f", marginBottom: 20, color: "#f8fafc" }}>
    <h2>Mitteilungen & Zustimmungen</h2>
    <p style={{ color: "#94a3b8" }}>Mitteilungen erstellen, veröffentlichen und Rückmeldungen aus App und Web auswerten.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      <label>Art<select style={inputStyle} value={kind} onChange={(e) => setKind(e.target.value)}><option value="info">Information</option><option value="acknowledgement">Lesebestätigung</option><option value="consent">Zustimmung</option></select></label>
      <label>Empfänger<select style={inputStyle} value={audience} onChange={(e) => setAudience(e.target.value)}><option value="all">Alle Nutzer</option><option value="selected">Ausgewählte Nutzer</option></select></label>
    </div>
    {audience === "selected" && <label style={{ display: "block", marginTop: 12 }}>Nutzer-IDs (durch Komma oder Zeilenumbruch getrennt)<textarea style={inputStyle} rows={2} value={userIds} onChange={(e) => setUserIds(e.target.value)} /></label>}
    {kind === "consent" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}><label>Dokumenttyp<input style={inputStyle} value={docType} onChange={(e) => setDocType(e.target.value)} /></label><label>Archivierte Version<input style={inputStyle} placeholder="z. B. 1.2" value={docVersion} onChange={(e) => setDocVersion(e.target.value)} /></label></div>}
    <label style={{ display: "block", marginTop: 12 }}>Titel (Deutsch)<input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} /></label>
    <label style={{ display: "block", marginTop: 12 }}>Nachricht (Deutsch)<textarea style={inputStyle} value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={10000} /></label>
    <details style={{ marginTop: 12 }}><summary>Englische Übersetzung (optional)</summary><label>Title<input style={inputStyle} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></label><label>Message<textarea style={inputStyle} value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} rows={3} /></label></details>
    <button style={{ ...buttonStyle, marginTop: 14 }} disabled={busy || !title.trim() || !body.trim()} onClick={create}>Als Entwurf speichern</button>
    {message && <p role="status">{message}</p>}
    <h3 style={{ marginTop: 26 }}>Gespeicherte Mitteilungen</h3>
    <button style={buttonStyle} disabled={busy} onClick={() => load().catch((e) => setMessage(e.message))}>Aktualisieren</button>
    {items.length === 0 ? <p>Noch keine Mitteilungen.</p> : <div style={{ display: "grid", gap: 10, marginTop: 12 }}>{items.map((item) => <div key={item.id} style={{ padding: 12, border: "1px solid #334155", borderRadius: 12 }}><strong>{item.title_de}</strong><div style={{ color: "#94a3b8", fontSize: 13 }}>{item.kind} · {item.audience} · {item.status} · {new Date(item.created_at).toLocaleString("de-DE")}</div>{item.statistics && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginTop: 12 }}>
          {([ ["Empfänger", item.statistics.recipients], ["Bestätigt", item.statistics.acknowledged], ["Zugestimmt", item.statistics.accepted], ["Abgelehnt", item.statistics.declined], ["Offen", item.statistics.pending] ] as const).map(([label, value]) =>
            <div key={label} style={{ padding: 10, borderRadius: 10, background: "#0b1324", border: "1px solid #334155" }}><div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div><strong style={{ fontSize: 22 }}>{value}</strong></div>)}
          <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#94a3b8" }}>Antwortquote: {item.statistics.recipients ? ((item.statistics.recipients - item.statistics.pending) / item.statistics.recipients * 100).toFixed(1).replace(".", ",") : "0"} % · Aktuelle registrierte Konten als Empfängerbasis</div>
        </div>}{item.status === "draft" && <button style={{ ...buttonStyle, marginTop: 8 }} disabled={busy} onClick={() => action(item.id, "publish")}>Veröffentlichen</button>}{item.status === "published" && <button style={{ ...buttonStyle, marginTop: 8 }} disabled={busy} onClick={() => action(item.id, "archive")}>Archivieren</button>}</div>)}</div>}
  </section>;
}
