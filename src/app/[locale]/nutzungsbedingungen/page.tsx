import LegalPage from "../../../../components/LegalPage";
import { getTermsDocument } from "../../../../legal/terms";
import { getLegalLocale } from "../../../../legal/get-legal-locale";

type Props = {
  params: Promise<{ locale: string }>;
};

const EYEBROW = {
  de: "Nutzungsbedingungen",
  en: "Terms of Use",
  tr: "Kullanım Koşulları",
  pl: "Warunki użytkowania",
  ar: "شروط الاستخدام",
  fr: "Conditions d’utilisation",
  es: "Términos de uso",
  it: "Condizioni d’uso",
} as const;

export default async function NutzungsbedingungenPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = getLegalLocale(resolvedParams.locale);
  const document = getTermsDocument(locale);

  return (
    <LegalPage
      locale={locale}
      eyebrow={EYEBROW[locale]}
      document={document}
    />
  );
}
