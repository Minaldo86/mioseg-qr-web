import LegalPage from "../../../../components/LegalPage";
import { getImprintDocument } from "../../../../legal/imprint";
import { getLegalLocale } from "../../../../legal/get-legal-locale";

type Props = {
  params: Promise<{ locale: string }>;
};

const EYEBROW = {
  de: "Rechtliches",
  en: "Legal",
  tr: "Yasal",
  pl: "Informacje prawne",
  ar: "معلومات قانونية",
  fr: "Mentions légales",
  es: "Legal",
  it: "Note legali",
} as const;

export default async function ImpressumPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = getLegalLocale(resolvedParams.locale);
  const document = getImprintDocument(locale);

  return (
    <LegalPage
      locale={locale}
      eyebrow={EYEBROW[locale]}
      document={document}
    />
  );
}
