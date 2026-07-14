import { defaultLocale, isValidLocale } from "../../../i18n/config";
import ResetPasswordClient from "./ResetPasswordClient";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ResetPasswordPage({ params }: Props) {
  const resolvedParams = await params;

  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  return <ResetPasswordClient locale={locale} />;
}
