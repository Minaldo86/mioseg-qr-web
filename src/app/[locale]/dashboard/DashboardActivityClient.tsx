"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

type ActivityKind = "created" | "updated" | "saved";

type ActivityItem = {
  id: string;
  kind: ActivityKind;
  qrxId: string;
  title: string;
  occurredAt: string;
  detail: string;
};

type OwnQrxRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  created_at: string;
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

type QrxSaveRow = {
  id: string;
  qrx_id: string;
  created_at: string;
};

function getTitle(row: OwnQrxRow) {
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
    ? `${parts.join(", ")} aktualisiert`
    : "QR-X aktualisiert";
}

function getActivityMeta(kind: ActivityKind) {
  if (kind === "created") {
    return {
      icon: "＋",
      label: "Erstellt",
      color: "#93c5fd",
      background: "rgba(59,130,246,0.12)",
    };
  }

  if (kind === "saved") {
    return {
      icon: "🔖",
      label: "Neu gespeichert",
      color: "#86efac",
      background: "rgba(34,197,94,0.11)",
    };
  }

  return {
    icon: "↻",
    label: "Aktualisiert",
    color: "#fde68a",
    background: "rgba(245,158,11,0.11)",
  };
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

    const { data: ownRows, error: ownError } = await supabase
      .from("qr_x_entries")
      .select("id,title,company_name,created_at")
      .eq("owner_user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<OwnQrxRow[]>();

    if (ownError) {
      console.warn("Dashboard activities QR-X error:", ownError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const ownQrx = ownRows ?? [];
    const ownIds = ownQrx.map((row) => row.id);
    const titleMap = new Map(ownQrx.map((row) => [row.id, getTitle(row)]));

    const createdItems: ActivityItem[] = ownQrx.slice(0, 8).map((row) => ({
      id: `created-${row.id}-${row.created_at}`,
      kind: "created",
      qrxId: row.id,
      title: getTitle(row),
      occurredAt: row.created_at,
      detail: "Neuer QR-X erstellt",
    }));

    if (ownIds.length === 0) {
      setItems(createdItems);
      setLoading(false);
      return;
    }

    const [updatesResult, savesResult] = await Promise.all([
      supabase
        .from("qrx_updates")
        .select(
          "id,qrx_id,created_at,changed_title,changed_description,changed_news,changed_images,changed_files",
        )
        .in("qrx_id", ownIds)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<QrxUpdateRow[]>(),

      supabase
        .from("qrx_saves")
        .select("id,qrx_id,created_at")
        .in("qrx_id", ownIds)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<QrxSaveRow[]>(),
    ]);

    if (updatesResult.error) {
      console.warn(
        "Dashboard activities updates error:",
        updatesResult.error.message,
      );
    }

    if (savesResult.error) {
      console.warn(
        "Dashboard activities saves error:",
        savesResult.error.message,
      );
    }

    const updateItems: ActivityItem[] = (updatesResult.data ?? []).map((row) => ({
      id: `updated-${row.id}`,
      kind: "updated",
      qrxId: row.qrx_id,
      title: titleMap.get(row.qrx_id) || "QR-X",
      occurredAt: row.created_at,
      detail: buildUpdateDetail(row),
    }));

    const saveItems: ActivityItem[] = (savesResult.data ?? []).map((row) => ({
      id: `saved-${row.id}`,
      kind: "saved",
      qrxId: row.qrx_id,
      title: titleMap.get(row.qrx_id) || "QR-X",
      occurredAt: row.created_at,
      detail: "Jemand hat diesen QR-X gespeichert",
    }));

    const merged = [...createdItems, ...updateItems, ...saveItems]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() -
          new Date(a.occurredAt).getTime(),
      )
      .slice(0, 12);

    setItems(merged);
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
        Aktivitäten werden geladen …
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
        Noch keine Aktivitäten vorhanden.
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
      {items.map((item) => {
        const meta = getActivityMeta(item.kind);

        return (
          <Link
            key={item.id}
            href={`/${locale}/dashboard/qrx/${item.qrxId}/edit`}
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
                background: meta.background,
                color: meta.color,
                fontSize: "18px",
                fontWeight: 950,
              }}
            >
              {meta.icon}
            </span>

            <span style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: "block",
                  color: meta.color,
                  fontSize: "10px",
                  fontWeight: 950,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {meta.label}
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
        );
      })}
    </div>
  );
}
