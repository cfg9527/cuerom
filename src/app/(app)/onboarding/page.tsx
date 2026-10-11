import Link from "next/link";
import { redirect } from "next/navigation";
import { createHabitAction } from "@/lib/actions/app-actions";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const locale = (await getUserLocale(session.user.id)) as Locale;

  return (
    <main>
      <h1 className="page-title">{t(locale, "onboardingTitle")}</h1>
      <p className="lede">{t(locale, "onboardingBody")}</p>
      <p style={{ marginBottom: "1.25rem" }}>
        <Link className="btn btn-primary" href="/templates">
          {t(locale, "browseTemplates")}
        </Link>
      </p>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{t(locale, "addHabit")}</h2>
        <form action={createHabitAction} className="stack-form">
          <label>
            <span>{t(locale, "title")}</span>
            <input name="title" required />
          </label>
          <label>
            <span>{t(locale, "polarity")}</span>
            <select name="polarity" defaultValue="build">
              <option value="build">{t(locale, "build")}</option>
              <option value="break">{t(locale, "break")}</option>
            </select>
          </label>
          <label>
            <span>{t(locale, "environments")}</span>
            <input name="environmentName" placeholder="Desk / 书桌" />
          </label>
          <label>
            <span>{t(locale, "addLever")}</span>
            <input name="action" placeholder={t(locale, "actionPlaceholder")} />
          </label>
          <button className="btn btn-primary" type="submit">
            {t(locale, "create")}
          </button>
        </form>
      </div>
    </main>
  );
}
