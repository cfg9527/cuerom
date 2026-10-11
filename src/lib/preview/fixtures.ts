import type { Locale } from "@/lib/i18n/messages";
import { STARTER_TEMPLATES } from "@/lib/templates";

export type PreviewLever = {
  id: string;
  action: string;
  direction: "lower" | "raise";
  habitTitle: string;
  polarity: "build" | "break";
  environmentName: string;
  status: "planned" | "done";
};

export type PreviewHabit = {
  id: string;
  title: string;
  checked: boolean;
};

export type PreviewDashboardData = {
  openLevers: PreviewLever[];
  doneCount: number;
  openCount: number;
  envCount: number;
  checkedCount: number;
  envList: { id: string; name: string }[];
  activeHabits: PreviewHabit[];
  today: string;
};

/** Fixed demo fixtures — never loaded from the real database. */
export function getPreviewDashboardData(locale: Locale): PreviewDashboardData {
  const copy = (t: (typeof STARTER_TEMPLATES)[number]) => t[locale];

  const openIds = ["water", "phone", "read", "floss"] as const;
  const doneIds = ["move", "notes"] as const;

  const openLevers: PreviewLever[] = openIds.map((id, i) => {
    const t = STARTER_TEMPLATES.find((x) => x.id === id)!;
    const c = copy(t);
    return {
      id: `preview-open-${id}`,
      action: c.action,
      direction: t.polarity === "build" ? "lower" : "raise",
      habitTitle: c.habit,
      polarity: t.polarity,
      environmentName: c.environment,
      status: "planned",
    };
  });

  const doneLevers = doneIds.map((id) => {
    const t = STARTER_TEMPLATES.find((x) => x.id === id)!;
    const c = copy(t);
    return {
      id: `preview-done-${id}`,
      action: c.action,
      environmentName: c.environment,
      habitTitle: c.habit,
    };
  });

  const envNames = new Map<string, string>();
  for (const t of STARTER_TEMPLATES) {
    const c = copy(t);
    envNames.set(t.id, c.environment);
  }
  // Unique room chips from open + done fixtures
  const seen = new Set<string>();
  const envList: { id: string; name: string }[] = [];
  for (const item of [...openLevers, ...doneLevers]) {
    if (seen.has(item.environmentName)) continue;
    seen.add(item.environmentName);
    envList.push({ id: `preview-env-${envList.length}`, name: item.environmentName });
  }

  const activeHabits: PreviewHabit[] = STARTER_TEMPLATES.slice(0, 5).map((t, i) => {
    const c = copy(t);
    return {
      id: `preview-habit-${t.id}`,
      title: c.habit,
      checked: i === 0 || i === 2,
    };
  });

  return {
    openLevers,
    doneCount: doneLevers.length,
    openCount: openLevers.length,
    envCount: envList.length,
    checkedCount: activeHabits.filter((h) => h.checked).length,
    envList,
    activeHabits,
    today: "demo",
  };
}
