import { redirect } from "next/navigation";
import { applyTemplateAction } from "@/lib/actions/app-actions";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";
import { STARTER_TEMPLATES } from "@/lib/templates";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const locale = (await getUserLocale(session.user.id)) as Locale;

  return (
    <main>
      <h1 className="page-title">{t(locale, "browseTemplates")}</h1>
      <p className="lede">{t(locale, "onboardingBody")}</p>
      <div className="template-list">
        {STARTER_TEMPLATES.map((template) => {
          const copy = template[locale];
          return (
            <article key={template.id} className="template-item">
              <div className="task-meta">
                <span className={template.polarity === "break" ? "chip chip-copper" : "chip"}>
                  {template.polarity === "break" ? t(locale, "break") : t(locale, "build")}
                </span>
                <span className="chip">{copy.environment}</span>
              </div>
              <h3>
                {copy.habit}
                {locale === "en" ? (
                  <span className="muted"> · {template.zh.habit}</span>
                ) : (
                  <span className="muted"> · {template.en.habit}</span>
                )}
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {copy.action}
              </p>
              <form action={applyTemplateAction}>
                <input type="hidden" name="templateId" value={template.id} />
                <button className="btn btn-primary" type="submit">
                  {t(locale, "useTemplate")}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </main>
  );
}
