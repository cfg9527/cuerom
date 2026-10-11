import Link from "next/link";
import { redirect } from "next/navigation";
import { DoneFlow } from "@/components/done-flow";
import { checkInAction, getTodayData } from "@/lib/actions/app-actions";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const locale = (await getUserLocale(session.user.id)) as Locale;
  const data = await getTodayData(session.user.id);

  return (
    <main>
      <header className="section">
        <h1 className="page-title">{t(locale, "today")}</h1>
        <p className="lede">{t(locale, "openTasksHint")}</p>
        <div className="env-row">
          {data.envList.map((env) => (
            <Link key={env.id} href={`/environments/${env.id}`} className="env-chip">
              {env.name}
            </Link>
          ))}
          <Link href="/templates" className="env-chip">
            + {t(locale, "browseTemplates")}
          </Link>
        </div>
      </header>

      <section className="section">
        <h2 className="page-title" style={{ fontSize: "1.45rem" }}>
          {t(locale, "openTasks")}
        </h2>
        {data.openLevers.length === 0 ? (
          <div className="empty">
            <p>{t(locale, "noTasks")}</p>
            <p style={{ marginTop: "0.75rem" }}>
              <Link className="btn btn-primary" href="/templates">
                {t(locale, "browseTemplates")}
              </Link>
            </p>
          </div>
        ) : (
          <div className="task-list">
            {data.openLevers.map((lever) => (
              <article key={lever.id} className="task-item">
                <div className="task-meta">
                  <span className="chip">{lever.environmentName}</span>
                  <span className={lever.polarity === "break" ? "chip chip-copper" : "chip"}>
                    {lever.habitTitle}
                  </span>
                  <span className="chip">
                    {lever.direction === "lower"
                      ? t(locale, "lowerFriction")
                      : t(locale, "raiseFriction")}
                  </span>
                </div>
                <p className="task-action">{lever.action}</p>
                <div className="btn-row">
                  <DoneFlow
                    leverId={lever.id}
                    locale={locale}
                    actionLabel={lever.action}
                  />
                  <Link className="btn btn-ghost" href={`/habits/${lever.habitId}`}>
                    {t(locale, "habitDetail")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="page-title" style={{ fontSize: "1.45rem" }}>
          {t(locale, "checkIns")}
        </h2>
        <p className="lede">{t(locale, "checkInsHint")}</p>
        {data.activeHabits.length === 0 ? (
          <div className="empty">{t(locale, "noHabits")}</div>
        ) : (
          <div className="check-grid panel">
            {data.activeHabits.map((habit) => {
              const already = data.checked.has(habit.id);
              return (
                <div key={habit.id} className="check-item">
                  <div>
                    <strong>{habit.title}</strong>
                    {already ? (
                      <p className="muted" style={{ margin: "0.2rem 0 0" }}>
                        ✓ {data.today}
                      </p>
                    ) : null}
                  </div>
                  <form action={checkInAction} className="btn-row">
                    <input type="hidden" name="habitId" value={habit.id} />
                    <button className="btn btn-primary" name="result" value="yes" type="submit">
                      {t(locale, "yes")}
                    </button>
                    <button className="btn btn-ghost" name="result" value="no" type="submit">
                      {t(locale, "no")}
                    </button>
                    <button className="btn btn-ghost" name="result" value="skip" type="submit">
                      {t(locale, "skip")}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
