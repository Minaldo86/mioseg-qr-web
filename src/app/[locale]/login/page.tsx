import { defaultLocale, isValidLocale } from "../../../i18n/config";
import LoginClient from "./LoginClient";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LoginPage({ params }: Props) {
  const resolvedParams = await params;

  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  return <LoginClient locale={locale} />;
}