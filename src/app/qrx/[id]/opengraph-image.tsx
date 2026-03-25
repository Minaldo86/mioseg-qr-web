import { ImageResponse } from "next/og";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function normalizeQrxId(id: string): string {
  let v = String(id || "").trim();
  try {
    v = decodeURIComponent(v);
  } catch (error) {
    console.warn("decodeURIComponent failed in opengraph-image:", error);
  }
  if (v.startsWith("qrx:")) v = v.slice(4);
  return v;
}

type QrxEntry = {
  id: string;
  title: string;
  description: string | null;
  logo_url: string | null;
  type: "normal" | "business" | null;
  verified: boolean | null;
  cover_image_url: string | null;
  company_name: string | null;
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const qrxId = normalizeQrxId(id);
  const supabase = createSupabaseServerClient();

  const { data: entry } = await supabase
    .from("qr_x_entries")
    .select(`
      id,
      title,
      description,
      logo_url,
      type,
      verified,
      cover_image_url,
      company_name
    `)
    .eq("id", qrxId)
    .maybeSingle<QrxEntry>();

  if (!entry) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#0f1115",
            color: "white",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 800,
          }}
        >
          mioseg qr
        </div>
      ),
      size
    );
  }

  const isBusiness = entry.type === "business";
  const title =
    (isBusiness ? entry.company_name : entry.title)?.trim() ||
    entry.title ||
    "mioseg qr";
  const subtitle =
    entry.description?.trim() ||
    (isBusiness ? "Business QR-X von mioseg qr" : "QR-X von mioseg qr");

  if (isBusiness) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            overflow: "hidden",
            background: "#111111",
            color: "white",
          }}
        >
          {entry.cover_image_url ? (
            <img
              src={entry.cover_image_url}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, #15120d 0%, #2a2112 45%, #0f1115 100%)",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,10,14,0.18) 0%, rgba(8,10,14,0.55) 45%, rgba(8,10,14,0.88) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 36,
              left: 40,
              right: 40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "12px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              mioseg qr
            </div>

            {entry.verified ? (
              <div
                style={{
                  display: "flex",
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "#d8b15c",
                  color: "#0f141b",
                  border: "1px solid rgba(255,245,220,0.45)",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                VERIFIED BUSINESS
              </div>
            ) : null}
          </div>

          <div
            style={{
              position: "absolute",
              left: 56,
              right: 56,
              bottom: 52,
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
          >
            {entry.logo_url ? (
              <img
                src={entry.logo_url}
                alt=""
                style={{
                  width: 170,
                  height: 170,
                  objectFit: "cover",
                  borderRadius: 18,
                  border: "3px solid rgba(216,177,92,0.9)",
                  background: "#11161f",
                }}
              />
            ) : (
              <div
                style={{
                  width: 170,
                  height: 170,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  border: "3px solid rgba(216,177,92,0.9)",
                  background: "#11161f",
                  color: "#d8b15c",
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                QR-X
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 860,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  marginBottom: 16,
                  textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                }}
              >
                {title}
              </div>

              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "rgba(255,255,255,0.88)",
                  maxWidth: 760,
                }}
              >
                {subtitle.length > 140 ? `${subtitle.slice(0, 140)}…` : subtitle}
              </div>
            </div>
          </div>
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0f1115 0%, #171c24 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(124,58,237,0.18), transparent 30%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 36,
            left: 40,
            display: "flex",
            padding: "12px 20px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          mioseg qr
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 56,
            right: 56,
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          {entry.logo_url ? (
            <img
              src={entry.logo_url}
              alt=""
              style={{
                width: 160,
                height: 160,
                objectFit: "cover",
                borderRadius: 22,
                border: "2px solid rgba(255,255,255,0.16)",
                background: "#11161f",
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                border: "2px solid rgba(255,255,255,0.16)",
                background: "#11161f",
                color: "#c9aeff",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              QR-X
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 860,
            }}
          >
            <div
              style={{
                fontSize: 54,
                fontWeight: 900,
                lineHeight: 1.08,
                marginBottom: 16,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.84)",
                maxWidth: 760,
              }}
            >
              {subtitle.length > 150 ? `${subtitle.slice(0, 150)}…` : subtitle}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}