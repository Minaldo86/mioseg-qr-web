"use client";

import { useEffect, useState } from "react";

type PricingPack = {
  id: string;
  credits: number;
  is_active: boolean | null;
  price_cents_launch: number | null;
  price_cents_regular: number | null;
  badge: string | null;
};

type PricingConfig = {
  launch_discount_enabled?: boolean | null;
  currency?: string | null;
};

function formatPrice(cents: number | null | undefined, currency = "EUR") {
  if (typeof cents !== "number") return "–";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default function CreditsTestPage() {
  const [userId, setUserId] = useState("");
  const [packs, setPacks] = useState<PricingPack[]>([]);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingPackId, setWorkingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const useLaunchPrice = Boolean(config?.launch_discount_enabled);
  const currency = config?.currency || "EUR";

  useEffect(() => {
    let mounted = true;

    async function loadPacks() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/create-checkout-session", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Pakete konnten nicht geladen werden.");
        }

        if (mounted) {
          setConfig(data.pricingConfig ?? null);
          setPacks(Array.isArray(data.pricingPacks) ? data.pricingPacks : []);
        }
      } catch (e: unknown) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Pakete konnten nicht geladen werden.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPacks();

    return () => {
      mounted = false;
    };
  }, []);

  async function buyPack(packId: string) {
    try {
      if (!userId.trim()) {
        alert("Bitte zuerst eine User-ID eintragen.");
        return;
      }

      setWorkingPackId(packId);
      setError(null);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim(),
          packId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Checkout konnte nicht gestartet werden.");
      }

      if (!data?.url) {
        throw new Error("Stripe Checkout URL fehlt.");
      }

      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout konnte nicht gestartet werden.");
    } finally {
      setWorkingPackId(null);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>mioseg qr · Credit-Testkauf</h1>
        <p style={styles.sub}>
          Testseite für Stripe Checkout im Web. In der App müssen Credits später über Apple/Google laufen.
        </p>

        <label style={styles.label}>
          User-ID, der Credits gutgeschrieben werden sollen
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Supabase User-ID"
            style={styles.input}
          />
        </label>

        {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1" ? (
          <div style={styles.success}>
            Zahlung abgeschlossen. Der Webhook sollte die Credits gutgeschrieben haben.
          </div>
        ) : null}

        {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("canceled") === "1" ? (
          <div style={styles.warning}>Zahlung abgebrochen.</div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}

        {loading ? (
          <div style={styles.muted}>Lade Pakete…</div>
        ) : packs.length === 0 ? (
          <div style={styles.muted}>Keine aktiven Pakete gefunden.</div>
        ) : (
          <div style={styles.grid}>
            {packs.map((pack) => {
              const price = useLaunchPrice
                ? pack.price_cents_launch
                : pack.price_cents_regular;

              return (
                <div key={pack.id} style={styles.pack}>
                  <div style={styles.packTop}>
                    <strong>{pack.credits} Credits</strong>
                    {pack.badge ? <span style={styles.badge}>{pack.badge}</span> : null}
                  </div>

                  <div style={styles.price}>{formatPrice(price, currency)}</div>
                  <div style={styles.muted}>Paket-ID: {pack.id}</div>

                  <button
                    type="button"
                    onClick={() => buyPack(pack.id)}
                    disabled={workingPackId === pack.id}
                    style={{
                      ...styles.button,
                      opacity: workingPackId === pack.id ? 0.65 : 1,
                    }}
                  >
                    {workingPackId === pack.id ? "Öffne Stripe…" : "Testkauf starten"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#08111f",
    color: "white",
    padding: 24,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#0f172a",
    border: "1px solid #263246",
    borderRadius: 20,
    padding: 22,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  sub: {
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  label: {
    display: "grid",
    gap: 8,
    fontWeight: 800,
    marginTop: 18,
  },
  input: {
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    padding: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginTop: 18,
  },
  pack: {
    borderRadius: 16,
    border: "1px solid #334155",
    background: "#111827",
    padding: 16,
  },
  packTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  badge: {
    borderRadius: 999,
    background: "#1d4ed8",
    color: "#dbeafe",
    padding: "5px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  price: {
    fontSize: 24,
    fontWeight: 900,
    marginTop: 12,
  },
  muted: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    width: "100%",
    marginTop: 14,
    border: "none",
    borderRadius: 12,
    background: "white",
    color: "#111827",
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  success: {
    marginTop: 14,
    borderRadius: 12,
    background: "#14532d",
    color: "#bbf7d0",
    padding: 12,
    fontWeight: 800,
  },
  warning: {
    marginTop: 14,
    borderRadius: 12,
    background: "#713f12",
    color: "#fef3c7",
    padding: 12,
    fontWeight: 800,
  },
  error: {
    marginTop: 14,
    borderRadius: 12,
    background: "#7f1d1d",
    color: "#fecaca",
    padding: 12,
    fontWeight: 800,
  },
};
