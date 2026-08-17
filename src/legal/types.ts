// src/legal/types.ts

export type LegalLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

export type LegalSection = {
  title: string;
  content: string[];
};

export type LegalDocument = {
  title: string;
  subtitle: string;
  fallbackNotice?: string;
  sections: LegalSection[];
};