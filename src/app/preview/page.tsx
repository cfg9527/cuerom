import { LocaleSwitcher } from "@/components/locale-switcher";
import { PreviewDoneFlow } from "@/components/preview-done-flow";
import { getPublicLocale } from "@/lib/i18n/locale";
import { t, type Locale } from "@/lib/i18n/messages";
import { isValidPreviewKey } from "@/lib/preview/auth";
import { getPreviewDashboardData } from "@/lib/preview/fixtures";

type SearchParams = Promise<{ key?: string | string[] }>;

/**
 * Secret edition — tokenized demo surface.
 * Completely independent from the public logged-in app: no auth, no Neon rows.
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

  const data = getPreviewDashboardData(locale);
  const hasOpen = data.openCount > 0;
  const totalLevers = data.openCount + data.doneCount;
  const momentumPct =
    totalLevers === 0 ? 0 : Math.round((data.doneCount / totalLevers) * 100);

  return (
    <div className="app-frame preview-frame secret-edition" lang={locale}>
      <div className="preview-banner" role="status">
        <p className="preview-banner-text">
          <strong>{t(locale, "previewBannerShort")}</strong>
          <span aria-hidden="true"> · </span>
          <span>{t(locale, "previewBanner")}</span>
        </p>
        <LocaleSwitcher locale={locale} tone="on-light" />
      </div>

      <main className="dashboard-root">
        <section className="dash-hero" aria-labelledby="dash-brand">
          <div className="dash-hero-visual" aria-hidden="true">
            <div className="dash-room-window" />
            <div className="dash-room-floor" />
            <div className="dash-room-glow" />
          </div>
          <div className="dash-hero-copy">
            <p id="dash-brand" className="dash-brand">
              {t(locale, "previewEdition")}
            </p>
            <h1 className="dash-headline">{t(locale, "dashboardHeadline")}</h1>
            <p className="dash-support">
              {t(locale, "dashboardSupport")}{" "}
              <span className="dash-secret-note">{t(locale, "previewNote")}</span>
            </p>
            <div className="dash-ctas">
              <a className="btn btn-primary dash-cta-primary" href="#open-tasks">
                {hasOpen ? t(locale, "previewTasksCta") : t(locale, "dashboardCtaRoom")}
              </a>
            </div>
          </div>
        </section>

        <div className="dash-body">
          <section className="dash-glance" aria-label={t(locale, "today")}>
            <div className="glance-stat">
              <span className="glance-value">{data.openCount}</span>
              <span className="glance-label">{t(locale, "glanceOpen")}</span>
            </div>
            <div className="glance-stat">
              <span className="glance-value">{data.envCount}</span>
              <span className="glance-label">{t(locale, "glanceRooms")}</span>
            </div>
            <div className="glance-stat">
              <span className="glance-value">{data.doneCount}</span>
              <span className="glance-label">{t(locale, "glanceChanged")}</span>
            </div>
            <div className="glance-stat">
              <span className="glance-value">{data.checkedCount}</span>
              <span className="glance-label">{t(locale, "glanceChecked")}</span>
            </div>
          </section>

          <section className="dash-momentum" aria-label={t(locale, "momentumLabel")}>
            <div className="momentum-row">
              <div>
                <p className="momentum-title">{t(locale, "momentumLabel")}</p>
                <p className="muted">{t(locale, "momentumHint")}</p>
              </div>
              <span className="momentum-pct">{momentumPct}%</span>
            </div>
            <div
              className="momentum-track"
              role="progressbar"
              aria-valuenow={momentumPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="momentum-fill" style={{ width: `${momentumPct}%` }} />
            </div>
          </section>

          {data.envList.length > 0 ? (
            <section className="dash-envs" aria-label={t(locale, "environments")}>
              <div className="env-row">
                {data.envList.map((env) => (
                  <span key={env.id} className="env-chip">
                    {env.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="section" id="open-tasks">
            <h2 className="page-title" style={{ fontSize: "1.45rem" }}>
              {t(locale, "openTasks")}
            </h2>
            <p className="lede">{t(locale, "openTasksHint")}</p>
            <div className="task-list">
              {data.openLevers.map((lever) => (
                <article key={lever.id} className="task-item">
                  <div className="task-meta">
                    <span className="chip">{lever.environmentName}</span>
                    <span
                      className={lever.polarity === "break" ? "chip chip-copper" : "chip"}
                    >
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
                    <PreviewDoneFlow locale={locale} actionLabel={lever.action} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="page-title" style={{ fontSize: "1.45rem" }}>
              {t(locale, "checkIns")}
            </h2>
            <p className="lede">{t(locale, "checkInsHint")}</p>
            <div className="check-grid panel">
              {data.activeHabits.map((habit) => (
                <div key={habit.id} className="check-item">
                  <div>
                    <strong>{habit.title}</strong>
                    {habit.checked ? (
                      <p className="muted" style={{ margin: "0.2rem 0 0" }}>
                        ✓ {data.today}
                      </p>
                    ) : null}
                  </div>
                  <div className="btn-row">
                    <span className="btn btn-primary" style={{ opacity: 0.55, cursor: "default" }}>
                      {t(locale, "yes")}
                    </span>
                    <span className="btn btn-ghost" style={{ opacity: 0.55, cursor: "default" }}>
                      {t(locale, "no")}
                    </span>
                    <span className="btn btn-ghost" style={{ opacity: 0.55, cursor: "default" }}>
                      {t(locale, "skip")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
