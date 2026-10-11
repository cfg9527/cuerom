import { setPublicLocaleAction } from "@/lib/actions/locale-actions";
import type { Locale } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/messages";

type Props = {
  locale: Locale;
  /** `on-dark` for landing hero; `on-light` for auth/settings chrome */
  tone?: "on-dark" | "on-light";
};

export function LocaleSwitcher({ locale, tone = "on-light" }: Props) {
  return (
    <form
      action={setPublicLocaleAction}
      className={`locale-switcher locale-switcher-${tone}`}
      aria-label={t(locale, "locale")}
    >
      <button
        type="submit"
        name="locale"
        value="en"
        className={locale === "en" ? "locale-btn is-active" : "locale-btn"}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="submit"
        name="locale"
        value="zh"
        className={locale === "zh" ? "locale-btn is-active" : "locale-btn"}
        aria-pressed={locale === "zh"}
      >
        中文
      </button>
    </form>
  );
}
