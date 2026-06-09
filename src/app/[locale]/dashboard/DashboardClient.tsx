"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

type Props = {
  creditsLabel: string;
  createdQrxLabel: string;
  savedQrxLabel: string;
  savedQrLabel: string;
};

type StatValue = number | "…" | "–";

export default function DashboardClient({
  creditsLabel,
  createdQrxLabel,
  savedQrxLabel,
  savedQrLabel,
}: Props) {
  const [credits, setCredits] = useState<StatValue>("…");
  const [createdQrx, setCreatedQrx] = useState<StatValue>("…");
  const [savedQrx, setSavedQrx] = useState<StatValue>("…");
  const [savedQr, setSavedQr] = useState<StatValue>("…");

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.warn("Dashboard user error:", userError.message);
    }

    if (!user) {
      setCredits("–");
      setCreatedQrx("–");
      setSavedQrx("–");
      setSavedQr("–");
      return;
    }

    const [creditsRes, createdRes, savedQrxRes, savedQrRes] = await Promise.all([
      supabase
        .from("qrx_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("qr_x_entries")
        .select("id", { count: "exact", head: true })
        .eq("owner_user_id", user.id),

      supabase
        .from("qrx_saves")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),

      supabase
        .from("user_scans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    if (creditsRes.error) console.warn("Dashboard credits error:", creditsRes.error.message);
    if (createdRes.error) console.warn("Dashboard created QR-X error:", createdRes.error.message);
    if (savedQrxRes.error) console.warn("Dashboard saved QR-X error:", savedQrxRes.error.message);
    if (savedQrRes.error) console.warn("Dashboard saved QR error:", savedQrRes.error.message);

    setCredits(Number(creditsRes.data?.credits ?? 0));
    setCreatedQrx(Number(createdRes.count ?? 0));
    setSavedQrx(Number(savedQrxRes.count ?? 0));
    setSavedQr(Number(savedQrRes.count ?? 0));
  }

  const stats = [
    { label: creditsLabel, value: credits, icon: "💳" },
    { label: createdQrxLabel, value: createdQrx, icon: "▣" },
    { label: savedQrxLabel, value: savedQrx, icon: "🔖" },
    { label: savedQrLabel, value: savedQr, icon: "⌗" },
  ];

  return (
    <>
      {stats.map((item) => (
        <article key={item.label} className={styles.statCard}>
          <div className={styles.statIcon}>{item.icon}</div>
          <div>
            <div className={styles.statValue}>{String(item.value)}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        </article>
      ))}
    </>
  );
}
