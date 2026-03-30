import type { ReactNode } from "react";
import { defaultLocale, isValidLocale, rtlLocales } from "../../i18n/config";

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default function LocaleLayout({ children, params }: Props) {
  const locale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}