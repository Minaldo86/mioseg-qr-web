"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

type ActivityItem = {
  id: string;
  qrxId: string;
  title: string;
  occurredAt: string;
  detail: string;
};

type SavedQrxRow = {
  qrx_id: string;
  created_at: string;
};

type QrxEntryRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  owner_user_id: string | null;
  deleted_at: string | null;
};

type QrxUpdateRow = {
  id: string;
  qrx_id: string;
  created_at: string;
  changed_title: boolean | null;
  changed_description: boolean | null;
  changed_news: boolean | null;
  changed_images: boolean | null;
  changed_files: boolean | null;
};

function getTitle(row: QrxEntryRow) {
  return row.company_name?.trim() || row.title?.trim() || "Unbenannter QR-X";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unbekannter Zeitpunkt";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildUpdateDetail(row: QrxUpdateRow) {
  const parts: string[] = [];

  if (row.changed_title) parts.push("Titel");
  if (row.changed_description) parts.push("Beschreibung");
  if (row.changed_news) parts.push("News");
  if (row.changed_images) parts.push("Bilder");
  if (row.changed_files) parts.push("Dateien");

  return parts.length > 0
    ? `${parts.join(", ")} geändert`
    : "Inhalt geändert";
}

export default function DashboardActivityClient({
  locale,
}: {
  locale: string;
}) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.warn("Dashboard activities user error:", userError.message);
    }

    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: saveRows, error: savesError } = await supabase
      .from("qrx_saves")
      .select("qrx_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<SavedQrxRow[]>();

    if (savesError) {
      console.warn("Dashboard saved QR-X error:", savesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const saves = saveRows ?? [];
    const savedIds = Array.from(
      new Set(saves.map((row) => row.qrx_id).filter(Boolean)),
    );

    if (savedIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const savedAtMap = new Map(
      saves.map((row) => [row.qrx_id, new Date(row.created_at).getTime()]),
    );

    const { data: entryRows, error: entriesError } = await supabase
      .from("qr_x_entries")
      .select("id,title,company_name,owner_user_id,deleted_at")
      .in("id", savedIds)
      .is("deleted_at", null)
      .returns<QrxEntryRow[]>();

    if (entriesError) {
      console.warn("Dashboard saved entries error:", entriesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const foreignEntries = (entryRows ?? []).filter(
      (entry) => entry.owner_user_id !== user.id,
    );
    const foreignIds = foreignEntries.map((entry) => entry.id);

    if (foreignIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const titleMap = new Map(
      foreignEntries.map((entry) => [entry.id, getTitle(entry)]),
    );

    const { data: updateRows, error: updatesError } = await supabase
      .from("qrx_updates")
      .select(
        "id,qrx_id,created_at,changed_title,changed_description,changed_news,changed_images,changed_files",
      )
      .in("qrx_id", foreignIds)
      .order("created_at", { ascending: false })
      .limit(60)
      .returns<QrxUpdateRow[]>();

    if (updatesError) {
      console.warn("Dashboard saved updates error:", updatesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const activities: ActivityItem[] = (updateRows ?? [])
      .filter((row) => {
        const savedAt = savedAtMap.get(row.qrx_id) ?? 0;
        const updatedAt = new Date(row.created_at).getTime();
        return Number.isFinite(updatedAt) && updatedAt > savedAt;
      })
      .map((row) => ({
        id: `saved-update-${row.id}`,
        qrxId: row.qrx_id,
        title: titleMap.get(row.qrx_id) || "Gespeicherter QR-X",
        occurredAt: row.created_at,
        detail: buildUpdateDetail(row),
      }))
      .slice(0, 12);

    setItems(activities);
    setLoading(false);
  }

  const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "120px",
          display: "grid",
          placeItems: "center",
          color: "#94a3b8",
          fontWeight: 850,
        }}
      >
        Änderungen werden geladen …
      </div>
    );
  }

  if (empty) {
    return (
      <div
        style={{
          borderRadius: "20px",
          padding: "18px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#94a3b8",
          lineHeight: 1.55,
          fontWeight: 800,
        }}
      >
        Seit dem Speichern gab es noch keine Änderungen an deinen gespeicherten QR-X.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "10px",
      }}
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/qrx/${item.qrxId}`}
          style={{
            minHeight: "94px",
            borderRadius: "20px",
            padding: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.075)",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: "42px",
              height: "42px",
              flex: "0 0 auto",
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(245,158,11,0.11)",
              color: "#fde68a",
              fontSize: "18px",
              fontWeight: 950,
            }}
          >
            ↻
          </span>

          <span style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                display: "block",
                color: "#fde68a",
                fontSize: "10px",
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Gespeicherter QR-X geändert
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "4px",
                color: "#94a3b8",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {item.detail} · {formatDate(item.occurredAt)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
