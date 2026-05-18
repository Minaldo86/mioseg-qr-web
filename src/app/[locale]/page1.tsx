import Link from "next/link";
import Image from "next/image";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;

  const text = getText(locale);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(60,110,180,0.22) 0%, rgba(8,17,29,0) 32%), linear-gradient(180deg, #08111d 0%, #0d1726 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "32px",
          alignItems: "center",
        }}
      >
        <section
          style={{
            borderRadius: "32px",
            padding: "40px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              marginBottom: "22px",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.4px",
              color: "#d7e6f7",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: "#7fb3ff",
                boxShadow: "0 0 14px rgba(127,179,255,0.9)",
                display: "inline-block",
              }}
            />
            {text.badge}
          </div>

          <Image
            src="/logo-white.png"
            alt="mioseg qr Logo"
            width={320}
            height={120}
            priority
            style={{
              width: "320px",
              maxWidth: "100%",
              height: "auto",
              display: "block",
              marginBottom: "26px",
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 6vw, 66px)",
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: "-1.8px",
              maxWidth: "760px",
            }}
          >
            {text.title1}
            <br />
            <span style={{ color: "#d5e7ff" }}>{text.title2}</span>
          </h1>

          <p
            style={{
              margin: "22px 0 0 0",
              maxWidth: "720px",
              color: "#b8c9dc",
              fontSize: "18px",
              lineHeight: 1.8,
            }}
          >
            {text.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "30px",
            }}
          >
            <Link
              href="/datenschutz"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                padding: "0 20px",
                borderRadius: "14px",
                textDecoration: "none",
                background: "#ffffff",
                color: "#0d1726",
                fontWeight: 800,
                fontSize: "15px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.20)",
              }}
            >
              {text.privacy}
            </Link>

            <Link
              href="/impressum"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                padding: "0 20px",
                borderRadius: "14px",
                textDecoration: "none",
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.16)",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              {text.imprint}
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "34px",
            }}
          >
            <InfoCard title={text.card1Title} text={text.card1Text} />
            <InfoCard title={text.card2Title} text={text.card2Text} />
            <InfoCard title={text.card3Title} text={text.card3Text} />
          </div>
        </section>

        <aside
          style={{
            position: "relative",
            minHeight: "620px",
            borderRadius: "32px",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(20,36,58,0.94) 0%, rgba(12,24,41,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "999px",
              background: "rgba(90,150,255,0.18)",
              filter: "blur(50px)",
              top: "40px",
              right: "20px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
              filter: "blur(50px)",
              bottom: "20px",
              left: "10px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: "360px",
              borderRadius: "30px",
              background: "linear-gradient(180deg, #101d2f 0%, #13243a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 70px rgba(0,0,0,0.34)",
              padding: "18px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <Dot />
              <Dot />
              <Dot />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "14px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/logo-white.png"
                  alt="mioseg qr"
                  width={80}
                  height={80}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "22px",
                    fontWeight: 900,
                    lineHeight: 1.1,
                  }}
                >
                  mioseg qr
                </div>
                <div
                  style={{
                    color: "#a8bed7",
                    fontSize: "13px",
                    fontWeight: 700,
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  {text.mockupSubtitle}
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: "22px",
                background: "linear-gradient(180deg, #1b3351 0%, #28486e 100%)",
                padding: "18px",
                color: "#ffffff",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#9fc8ff",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {text.mockupOverline}
              </p>
              <h3
                style={{
                  margin: "10px 0 10px 0",
                  fontSize: "24px",
                  fontWeight: 900,
                  lineHeight: 1.2,
                }}
              >
                {text.mockupTitle}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#d8e6f9",
                  fontSize: "14px",
                  lineHeight: 1.75,
                }}
              >
                {text.mockupText}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Chip>{text.chip1}</Chip>
              <Chip>{text.chip2}</Chip>
              <Chip>{text.chip3}</Chip>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 980px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 16px !important;
          }
        }

        @media (max-width: 640px) {
          section[style*="padding: 40px"] {
            padding: 24px !important;
            border-radius: 24px !important;
          }

          aside[style*="min-height: 620px"] {
            min-height: auto !important;
            padding: 22px !important;
            border-radius: 24px !important;
          }

          div[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          h1 {
            font-size: 36px !important;
          }
        }
      `}</style>
    </main>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "999px",
        backgroundColor: "#6f84a0",
        display: "inline-block",
      }}
    />
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        backgroundColor: "#13253b",
        border: "1px solid #27415f",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "16px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          color: "#ffffff",
          fontWeight: 900,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#b7c5d7",
          lineHeight: 1.6,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function getText(locale: string) {
  const dict: Record<
    string,
    {
      badge: string;
      title1: string;
      title2: string;
      description: string;
      privacy: string;
      imprint: string;
      card1Title: string;
      card1Text: string;
      card2Title: string;
      card2Text: string;
      card3Title: string;
      card3Text: string;
      mockupSubtitle: string;
      mockupOverline: string;
      mockupTitle: string;
      mockupText: string;
      chip1: string;
      chip2: string;
      chip3: string;
    }
  > = {
    de: {
      badge: "Bald verfügbar",
      title1: "Etwas Großes",
      title2: "kommt bald.",
      description:
        "mioseg qr wird aktuell final überarbeitet. Die App ist bald verfügbar – klarer, stärker und mit mehr echtem Nutzen rund um QR-Codes, Karte und QR-X.",
      privacy: "Datenschutz",
      imprint: "Impressum",
      card1Title: "Scannen",
      card1Text: "QR-Codes speichern statt sie später erneut suchen zu müssen.",
      card2Title: "Karte",
      card2Text: "Standorte mit Scans verbinden und später direkt wiederfinden.",
      card3Title: "QR-X",
      card3Text: "Inhalte später aktualisieren, ohne den QR-Code neu zu drucken.",
      mockupSubtitle: "QR-Codes speichern, organisieren und erweitern",
      mockupOverline: "Status",
      mockupTitle: "Wir bauen gerade die finale Version",
      mockupText:
        "Design, Nutzerführung und Inhalte werden aktuell optimiert, damit der Start sauber und hochwertig wirkt.",
      chip1: "Coming Soon",
      chip2: "Premium Rework",
      chip3: "Finale Optimierung",
    },
    en: {
      badge: "Coming soon",
      title1: "Something big",
      title2: "is coming soon.",
      description:
        "mioseg qr is currently getting its final polish. The app will launch soon — clearer, stronger, and with more real value around QR codes, map features, and QR-X.",
      privacy: "Privacy",
      imprint: "Legal notice",
      card1Title: "Scan",
      card1Text: "Save QR codes instead of searching for them again later.",
      card2Title: "Map",
      card2Text: "Connect scans with locations and find them again later.",
      card3Title: "QR-X",
      card3Text: "Update content later without printing a new QR code.",
      mockupSubtitle: "Save, organize, and extend QR codes",
      mockupOverline: "Status",
      mockupTitle: "We are building the final version",
      mockupText:
        "Design, user flow, and content are being refined so the launch feels clean and premium.",
      chip1: "Coming Soon",
      chip2: "Premium Rework",
      chip3: "Final Polish",
    },
  };

  return dict[locale] ?? dict.de;
}