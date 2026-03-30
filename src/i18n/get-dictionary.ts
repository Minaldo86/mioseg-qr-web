import type { Locale } from "./config";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import tr from "./dictionaries/tr";
import pl from "./dictionaries/pl";
import ar from "./dictionaries/ar";
import fr from "./dictionaries/fr";
import es from "./dictionaries/es";
import it from "./dictionaries/it";

export const dictionaries = {
  de,
  en,
  tr,
  pl,
  ar,
  fr,
  es,
  it,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.de;
}