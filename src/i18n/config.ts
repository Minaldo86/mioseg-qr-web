export const locales = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";
export const rtlLocales: Locale[] = ["ar"];

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}