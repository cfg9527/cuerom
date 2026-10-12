import Link from "next/link";
import type { Locale } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/messages";

export function AppNav({ locale }: { locale: Locale }) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <Link href="/today" className="nav-brand nav-brand-compact">
        {t(locale, "brand")}
      </Link>
      <div className="nav-links">
        <Link href="/today">{t(locale, "today")}</Link>
        <Link href="/templates">{t(locale, "browseTemplates")}</Link>
        <Link href="/review">{t(locale, "review")}</Link>
        <Link href="/settings">{t(locale, "settings")}</Link>
      </div>
    </nav>
  );
}
