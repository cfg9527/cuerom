import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  environments,
  frictionLevers,
  habitEnvironments,
  habits,
  cues,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserLocale } from "@/lib/session";
import { t, type Locale } from "@/lib/i18n/messages";

export default async function EnvironmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const locale = (await getUserLocale(session.user.id)) as Locale;
  const db = getDb();

  const [env] = await db
    .select()
    .from(environments)
    .where(and(eq(environments.id, id), eq(environments.userId, session.user.id)))
    .limit(1);
  if (!env) notFound();

  const linkedHabits = await db
    .select({
      id: habits.id,
      title: habits.title,
      polarity: habits.polarity,
      role: habitEnvironments.role,
    })
    .from(habitEnvironments)
    .innerJoin(habits, eq(habits.id, habitEnvironments.habitId))
    .where(eq(habitEnvironments.environmentId, id));

  const leverRows = await db
    .select({
      id: frictionLevers.id,
      action: frictionLevers.action,
      status: frictionLevers.status,
      direction: frictionLevers.direction,
      habitTitle: habits.title,
    })
    .from(frictionLevers)
    .innerJoin(habits, eq(habits.id, frictionLevers.habitId))
    .where(eq(frictionLevers.environmentId, id));

  const cueRows = await db.select().from(cues).where(eq(cues.environmentId, id));

  return (
    <main>
      <p>
        <Link href="/today">{t(locale, "back")}</Link>
      </p>
      <h1 className="page-title">{env.name}</h1>
      <p className="lede">
        {t(locale, env.kind)} · {t(locale, "envDetail")}
      </p>

      <section className="detail-block">
        <h2>{t(locale, "linkedHabits")}</h2>
        {linkedHabits.length === 0 ? (
          <div className="empty">{t(locale, "noHabits")}</div>
        ) : (
          <ul className="list-plain">
            {linkedHabits.map((h) => (
              <li key={h.id}>
                <Link href={`/habits/${h.id}`}>{h.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-block">
        <h2>{t(locale, "cues")}</h2>
        {cueRows.length === 0 ? (
          <div className="empty">—</div>
        ) : (
          <ul className="list-plain">
            {cueRows.map((c) => (
              <li key={c.id}>{c.description}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-block">
        <h2>{t(locale, "frictionInventory")}</h2>
        <div className="task-list">
          {leverRows.map((lever) => (
            <article key={lever.id} className="task-item">
              <div className="task-meta">
                <span className="chip">{lever.habitTitle}</span>
                <span className="chip">{lever.status}</span>
              </div>
              <p className="task-action">{lever.action}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
