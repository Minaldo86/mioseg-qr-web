"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type FollowSnapshot = {
  loaded: boolean;
  authenticated: boolean;
  savedIds: Set<string>;
};

const listeners = new Set<(snapshot: FollowSnapshot) => void>();

let snapshot: FollowSnapshot = {
  loaded: false,
  authenticated: false,
  savedIds: new Set<string>(),
};

let loadingPromise: Promise<FollowSnapshot> | null = null;

function publish(next: FollowSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener(snapshot));
}

async function loadSnapshot() {
  if (snapshot.loaded) return snapshot;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      const next = {
        loaded: true,
        authenticated: false,
        savedIds: new Set<string>(),
      };
      publish(next);
      return next;
    }

    const response = await fetch("/api/explore/follow", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const next = {
        loaded: true,
        authenticated: true,
        savedIds: new Set<string>(),
      };
      publish(next);
      return next;
    }

    const payload = (await response.json()) as { savedIds?: string[] };
    const next = {
      loaded: true,
      authenticated: true,
      savedIds: new Set(payload.savedIds ?? []),
    };
    publish(next);
    return next;
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

function subscribe(listener: (value: FollowSnapshot) => void) {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

export default function ExploreFollowClient({
  qrxId,
  locale,
  compact = false,
}: {
  qrxId: string;
  locale: string;
  compact?: boolean;
}) {
  const [state, setState] = useState(snapshot);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const unsubscribe = subscribe(setState);
    void loadSnapshot();
    return unsubscribe;
  }, []);

  const followed = state.savedIds.has(qrxId);

  async function handleToggle() {
    if (saving) return;

    setErrorText("");

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/${locale}/login?next=${encodeURIComponent(next)}`;
      return;
    }

    const previous = new Set(snapshot.savedIds);
    const optimistic = new Set(previous);

    if (followed) optimistic.delete(qrxId);
    else optimistic.add(qrxId);

    publish({
      loaded: true,
      authenticated: true,
      savedIds: optimistic,
    });

    setSaving(true);

    try {
      const response = await fetch("/api/explore/follow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId,
          action: followed ? "remove" : "save",
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        followed?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Speichern nicht möglich.");
      }

      const confirmed = new Set(snapshot.savedIds);
      if (payload?.followed) confirmed.add(qrxId);
      else confirmed.delete(qrxId);

      publish({
        loaded: true,
        authenticated: true,
        savedIds: confirmed,
      });
    } catch (errorValue) {
      publish({
        loaded: true,
        authenticated: true,
        savedIds: previous,
      });

      setErrorText(
        errorValue instanceof Error
          ? errorValue.message
          : "Speichern nicht möglich.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 5 }}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleToggle();
        }}
        disabled={saving}
        aria-pressed={followed}
        title={
          !state.loaded
            ? "Status wird geladen"
            : state.authenticated
              ? followed
                ? "QR-X nicht mehr folgen"
                : "QR-X folgen"
              : "Zum Folgen anmelden"
        }
        style={{
          minHeight: compact ? 42 : 46,
          borderRadius: 14,
          padding: compact ? "0 14px" : "0 17px",
          border: followed
            ? "1px solid rgba(134,239,172,0.5)"
            : "1px solid #d6e2ef",
          background: followed
            ? "linear-gradient(180deg,#166534,#15803d)"
            : "linear-gradient(180deg,#ffffff,#edf4fb)",
          color: followed ? "#ffffff" : "#17304d",
          fontSize: 13,
          fontWeight: 950,
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.68 : 1,
          whiteSpace: "nowrap",
          boxShadow: followed
            ? "0 10px 24px rgba(22,101,52,0.18)"
            : "0 10px 24px rgba(14,23,38,0.07)",
        }}
      >
        {!state.loaded
          ? "Lädt …"
          : saving
            ? "Speichert …"
            : followed
              ? "✓ Gefolgt"
              : state.authenticated
                ? "+ Folgen"
                : "Anmelden & folgen"}
      </button>

      {errorText ? (
        <span
          role="alert"
          style={{
            maxWidth: 180,
            color: "#b91c1c",
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1.3,
          }}
        >
          {errorText}
        </span>
      ) : null}
    </div>
  );
}
