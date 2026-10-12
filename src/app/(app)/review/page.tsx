import Link from "next/link";
import { and, desc, eq, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format, startOfWeek, subDays } from "date-fns";
import { getDb } from "@/db";
import { checkIns, frictionLevers, habits } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const locale = (await getUserLocale(session.user.id)) as Locale;
  const db = getDb();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const since = subDays(new Date(), 7);

  const userHabits = await db
    .select({ id: habits.id, title: habits.title })
    .from(habits)
    .where(eq(habits.userId, session.user.id));
  const habitIds = userHabits.map((h) => h.id);

  if (habitIds.length === 0) {
    return (
      <main>
        <h1 className="page-title">{t(locale, "review")}</h1>
        <div className="empty">{t(locale, "emptyReview")}</div>
      </main>
    );
  }

  const doneLevers = await db
    .select({
      id: frictionLevers.id,
      action: frictionLevers.action,
      habitTitle: habits.title,
      implementedAt: frictionLevers.implementedAt,
    })
    .from(frictionLevers)
    .innerJoin(habits, eq(habits.id, frictionLevers.habitId))
    .where(
      and(
        eq(habits.userId, session.user.id),
        eq(frictionLevers.status, "done"),
        gte(frictionLevers.implementedAt, since),
      ),
    )
    .orderBy(desc(frictionLevers.implementedAt));

  const planned = await db
    .select({
      id: frictionLevers.id,
      action: frictionLevers.action,
      habitId: habits.id,
      habitTitle: habits.title,
    })
    .from(frictionLevers)
    .innerJoin(habits, eq(habits.id, frictionLevers.habitId))
    .where(and(eq(habits.userId, session.user.id), eq(frictionLevers.status, "planned")))
    .limit(3);

  const recentCheckIns = await db
    .select()
    .from(checkIns)
    .where(gte(checkIns.occurredOn, weekStartStr));

  const habitIdSet = new Set(habitIds);
  const myCheckIns = recentCheckIns.filter((c) => habitIdSet.has(c.habitId));
  const yesCount = myCheckIns.filter((c) => c.result === "yes").length;
  const total = myCheckIns.length;

  return (
    <main>
      <h1 className="page-title">{t(locale, "review")}</h1>
      <p className="lede">
        {weekStartStr} · {yesCount}/{total || 0} {t(locale, "checkIns")}
      </p>

      <section className="detail-block">
        <h2>{t(locale, "weekWins")}</h2>
        {doneLevers.length === 0 ? (
          <div className="empty">{t(locale, "emptyReview")}</div>
        ) : (
          <ul className="list-plain">
            {doneLevers.map((l) => (
              <li key={l.id}>
                <strong>{l.habitTitle}</strong> — {l.action}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-block">
        <h2>{t(locale, "weekBlockers")}</h2>
        <p className="muted">
          {locale === "zh"
            ? "若打卡常失败，先回头完成环境任务，而不是加更多提醒。"
            : "If check-ins keep failing, finish environment tasks before adding reminders."}
        </p>
      </section>

      <section className="detail-block">
        <h2>{t(locale, "weekSuggestion")}</h2>
        {planned[0] ? (
          <div className="panel">
            <p className="task-action">{planned[0].action}</p>
            <p className="muted">{planned[0].habitTitle}</p>
            <Link className="btn btn-primary" href={`/habits/${planned[0].habitId}`}>
              {t(locale, "markDone")}
            </Link>
          </div>
        ) : (
          <div className="empty">
            <Link href="/templates">{t(locale, "browseTemplates")}</Link>
          </div>
        )}
      </section>
    </main>
  );
}
