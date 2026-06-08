import { defaultLocale, isValidLocale } from "../../../i18n/config";
import RegisterClient from "./RegisterClient";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RegisterPage({ params }: Props) {
  const resolvedParams = await params;

  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  return <RegisterClient locale={locale} />;
}