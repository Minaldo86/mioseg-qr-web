// src/app/api/legal/route.ts
// Public read-only endpoint for legal documents used by the Mioseg QR app.
import { NextRequest, NextResponse } from "next/server";
import { getImprintDocument } from "../../../legal/imprint";
import { getPrivacyDocument } from "../../../legal/privacy";
import { getTermsDocument } from "../../../legal/terms";
import { getLegalLocale } from "../../../legal/get-legal-locale";

export const dynamic = "force-dynamic";

type LegalType = "imprint" | "privacy" | "terms";

const getters = {
  imprint: getImprintDocument,
  privacy: getPrivacyDocument,
  terms: getTermsDocument,
} satisfies Record<LegalType, typeof getImprintDocument>;

export function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  if (type !== "imprint" && type !== "privacy" && type !== "terms") {
    return NextResponse.json(
      { error: "Invalid type. Use imprint, privacy, or terms." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const locale = getLegalLocale(request.nextUrl.searchParams.get("lang"));
  const document = getters[type](locale);

  return NextResponse.json(
    { schemaVersion: 1, type, locale, document },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
