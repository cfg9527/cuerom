import { LocaleSwitcher } from "@/components/locale-switcher";
import { SecretEdition } from "@/components/secret/secret-edition";
import { getPublicLocale } from "@/lib/i18n/locale";
import { t, type Locale } from "@/lib/i18n/messages";
import { isValidPreviewKey } from "@/lib/preview/auth";

type SearchParams = Promise<{ key?: string | string[] }>;

/**
 * Secret edition — tokenized novel surface.
 * Independent from the public logged-in app: no auth, no Neon, no login CTAs.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const keyRaw = params.key;
  const key = Array.isArray(keyRaw) ? keyRaw[0] : keyRaw;
  const locale = (await getPublicLocale()) as Locale;

  if (!isValidPreviewKey(key)) {
    return (
      <main className="shell secret-denied" lang={locale}>
        <div className="auth-topbar">
          <p className="nav-brand" style={{ margin: 0 }}>
            {t(locale, "previewEdition")}
          </p>
          <LocaleSwitcher locale={locale} tone="on-light" />
        </div>
        <div className="auth-card">
          <h1 className="page-title">{t(locale, "previewBannerShort")}</h1>
          <p className="lede">{t(locale, "previewDenied")}</p>
          <p className="muted">{t(locale, "previewNote")}</p>
        </div>
      </main>
    );
  }

  return <SecretEdition locale={locale} />;
}
