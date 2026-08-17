import LegalPage from "../../../../components/LegalPage";
import { getPrivacyDocument } from "../../../../legal/privacy";
import { getLegalLocale } from "../../../../legal/get-legal-locale";

type Props = {
  params: Promise<{ locale: string }>;
};

const EYEBROW = {
  de: "Datenschutz",
  en: "Privacy",
  tr: "Gizlilik",
  pl: "Prywatność",
  ar: "الخصوصية",
  fr: "Confidentialité",
  es: "Privacidad",
  it: "Privacy",
} as const;

export default async function DatenschutzPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = getLegalLocale(resolvedParams.locale);
  const document = getPrivacyDocument(locale);

  return (
    <LegalPage
      locale={locale}
      eyebrow={EYEBROW[locale]}
      document={document}
    />
  );
}
