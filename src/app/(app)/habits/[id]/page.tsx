import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { DoneFlow } from "@/components/done-flow";
import { getDb } from "@/db";
import {
  checkIns,
  cues,
  environments,
  frictionLevers,
  habitEnvironments,
  habits,
} from "@/db/schema";
import { addLeverAction } from "@/lib/actions/app-actions";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const locale = (await getUserLocale(session.user.id)) as Locale;
  const db = getDb();

  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)))
    .limit(1);
  if (!habit) notFound();

  const links = await db
    .select({
      environmentId: environments.id,
      environmentName: environments.name,
      role: habitEnvironments.role,
    })
    .from(habitEnvironments)
    .innerJoin(environments, eq(environments.id, habitEnvironments.environmentId))
    .where(eq(habitEnvironments.habitId, id));

  const cueRows = await db.select().from(cues).where(eq(cues.habitId, id));
  const levers = await db
    .select()
    .from(frictionLevers)
    .where(eq(frictionLevers.habitId, id))
    .orderBy(frictionLevers.sortOrder, desc(frictionLevers.createdAt));
  const recent = await db
    .select()
    .from(checkIns)
    .where(eq(checkIns.habitId, id))
    .orderBy(desc(checkIns.occurredOn))
    .limit(7);

  const primaryEnv = links[0];

  return (
    <main>
      <p>
        <Link href="/today">{t(locale, "back")}</Link>
      </p>
      <h1 className="page-title">{habit.title}</h1>
      <p className="lede">
        {habit.polarity === "break" ? t(locale, "break") : t(locale, "build")}
        {habit.description ? ` · ${habit.description}` : ""}
      </p>

      <section className="detail-block">
        <h2>{t(locale, "environments")}</h2>
        <div className="env-row">
          {links.map((link) => (
            <Link
              key={link.environmentId}
              href={`/environments/${link.environmentId}`}
              className="env-chip"
            >
              {link.environmentName}
            </Link>
          ))}
        </div>
      </section>

      <section className="detail-block">
        <h2>{t(locale, "cues")}</h2>
        {cueRows.length === 0 ? (
          <div className="empty">—</div>
        ) : (
          <ul className="list-plain">
            {cueRows.map((cue) => (
              <li key={cue.id}>{cue.description}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-block">
        <h2>{t(locale, "levers")}</h2>
        <div className="task-list">
          {levers.map((lever) => (
            <article key={lever.id} className="task-item">
              <div className="task-meta">
                <span className="chip">{lever.status}</span>
                <span className="chip">
                  {lever.direction === "lower"
                    ? t(locale, "lowerFriction")
                    : t(locale, "raiseFriction")}
                </span>
              </div>
              <p className="task-action">{lever.action}</p>
              {lever.status === "planned" ? (
                <DoneFlow leverId={lever.id} locale={locale} actionLabel={lever.action} />
              ) : null}
            </article>
          ))}
        </div>

        {primaryEnv ? (
          <div className="panel" style={{ marginTop: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>{t(locale, "addLever")}</h3>
            <form action={addLeverAction} className="stack-form">
              <input type="hidden" name="habitId" value={habit.id} />
              <input type="hidden" name="environmentId" value={primaryEnv.environmentId} />
              <label>
                <span>{t(locale, "addLever")}</span>
                <input name="action" required placeholder={t(locale, "actionPlaceholder")} />
              </label>
              <label>
                <span>
                  {habit.polarity === "break"
                    ? t(locale, "raiseFriction")
                    : t(locale, "lowerFriction")}
                </span>
                <select
                  name="direction"
                  defaultValue={habit.polarity === "break" ? "raise" : "lower"}
                >
                  <option value="lower">{t(locale, "lowerFriction")}</option>
                  <option value="raise">{t(locale, "raiseFriction")}</option>
                </select>
              </label>
              <button className="btn btn-primary" type="submit">
                {t(locale, "create")}
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <section className="detail-block">
        <h2>{t(locale, "recentCheckIns")}</h2>
        {recent.length === 0 ? (
          <div className="empty">—</div>
        ) : (
          <ul className="list-plain">
            {recent.map((c) => (
              <li key={c.id}>
                {c.occurredOn} · {c.result}
                {c.note ? ` — ${c.note}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
