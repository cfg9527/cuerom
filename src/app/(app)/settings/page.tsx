import { redirect } from "next/navigation";
import {
  deleteAccountAction,
  logoutAction,
} from "@/lib/actions/auth-actions";
import { updateLocaleAction } from "@/lib/actions/app-actions";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const locale = (await getUserLocale(session.user.id)) as Locale;
  const tipUrl = process.env.NEXT_PUBLIC_TIP_URL || "https://buymeacoffee.com";

  return (
    <main>
      <h1 className="page-title">{t(locale, "settings")}</h1>
      <p className="lede">{session.user.email}</p>

      <section className="panel detail-block">
        <h2 style={{ marginTop: 0 }}>{t(locale, "locale")}</h2>
        <form action={updateLocaleAction} className="btn-row">
          <button
            className={locale === "en" ? "btn btn-primary" : "btn btn-ghost"}
            name="locale"
            value="en"
            type="submit"
          >
            EN
          </button>
          <button
            className={locale === "zh" ? "btn btn-primary" : "btn btn-ghost"}
            name="locale"
            value="zh"
            type="submit"
          >
            中文
          </button>
        </form>
      </section>

      <section className="panel detail-block">
        <h2 style={{ marginTop: 0 }}>{t(locale, "tipSupport")}</h2>
        <p className="muted">{t(locale, "tipHint")}</p>
        <a className="btn btn-primary" href={tipUrl} target="_blank" rel="noreferrer">
          {t(locale, "tipSupport")}
        </a>
      </section>

      <section className="panel detail-block">
        <form action={logoutAction}>
          <button className="btn btn-ghost" type="submit">
            {t(locale, "signOut")}
          </button>
        </form>
      </section>

      <section className="panel detail-block">
        <h2 style={{ marginTop: 0 }}>{t(locale, "deleteAccount")}</h2>
        <p className="muted">{t(locale, "deleteConfirm")}</p>
        <form action={deleteAccountAction} className="stack-form">
          <input name="confirm" placeholder="DELETE" required />
          <button className="btn btn-primary" type="submit">
            {t(locale, "deleteAccount")}
          </button>
        </form>
      </section>
    </main>
  );
}
