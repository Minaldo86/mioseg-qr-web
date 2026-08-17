// src/legal/get-legal-locale.ts

import type { LegalLocale } from "./types";

const SUPPORTED_LEGAL_LOCALES: LegalLocale[] = [
  "de",
  "en",
  "tr",
  "pl",
  "ar",
  "fr",
  "es",
  "it",
];

export function getLegalLocale(language: string | null | undefined): LegalLocale {
  if (!language) return "de";

  const normalized = language.toLowerCase().trim();

  if (SUPPORTED_LEGAL_LOCALES.includes(normalized as LegalLocale)) {
    return normalized as LegalLocale;
  }

  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("pl")) return "pl";
  if (normalized.startsWith("ar")) return "ar";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";

  return "de";
}