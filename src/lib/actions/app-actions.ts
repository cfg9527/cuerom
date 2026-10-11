"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  checkIns,
  cues,
  environments,
  frictionLevers,
  habitEnvironments,
  habits,
  proofPhotos,
  users,
} from "@/db/schema";
import { pickEncouragement } from "@/lib/encouragements";
import type { Locale } from "@/lib/i18n/messages";
import { requireUser, getUserLocale } from "@/lib/session";
import { STARTER_TEMPLATES } from "@/lib/templates";
import { format } from "date-fns";

async function uid() {
  const user = await requireUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function updateLocaleAction(formData: FormData) {
  const userId = await uid();
  const locale = String(formData.get("locale") ?? "en") === "zh" ? "zh" : "en";
  const db = getDb();
  await db
    .update(users)
    .set({ locale, updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/", "layout");
}

export async function applyTemplateAction(formData: FormData) {
  const userId = await uid();
  const templateId = String(formData.get("templateId") ?? "");
  const locale = (await getUserLocale(userId)) as Locale;
  const template = STARTER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return;

  const copy = template[locale];
  const db = getDb();

  const [env] = await db
    .insert(environments)
    .values({
      userId,
      name: copy.environment,
      kind: template.environmentKind,
    })
    .returning();

  const [habit] = await db
    .insert(habits)
    .values({
      userId,
      title: copy.habit,
      polarity: template.polarity,
      description: copy.cue,
    })
    .returning();

  await db.insert(habitEnvironments).values({
    habitId: habit!.id,
    environmentId: env!.id,
    role: "primary",
  });

  await db.insert(cues).values({
    habitId: habit!.id,
    environmentId: env!.id,
    description: copy.cue,
    cueType: "visual",
    desirability: template.polarity === "build" ? "want" : "avoid",
  });

  await db.insert(frictionLevers).values({
    habitId: habit!.id,
    environmentId: env!.id,
    direction: template.polarity === "build" ? "lower" : "raise",
    action: copy.action,
    status: "planned",
    sortOrder: 0,
  });

  revalidatePath("/today");
  redirect(`/habits/${habit!.id}`);
}

export async function createHabitAction(formData: FormData) {
  const userId = await uid();
  const title = String(formData.get("title") ?? "").trim();
  const polarity =
    String(formData.get("polarity") ?? "build") === "break" ? "break" : "build";
  const envName = String(formData.get("environmentName") ?? "").trim() || "Desk";
  const action =
    String(formData.get("action") ?? "").trim() ||
    (polarity === "build"
      ? "Make the good cue obvious in this space"
      : "Add friction so the bad cue is harder");
  if (!title) return;

  const db = getDb();
  const [env] = await db
    .insert(environments)
    .values({ userId, name: envName, kind: "physical" })
    .returning();
  const [habit] = await db
    .insert(habits)
    .values({ userId, title, polarity })
    .returning();
  await db.insert(habitEnvironments).values({
    habitId: habit!.id,
    environmentId: env!.id,
    role: "primary",
  });
  await db.insert(frictionLevers).values({
    habitId: habit!.id,
    environmentId: env!.id,
    direction: polarity === "build" ? "lower" : "raise",
    action,
    status: "planned",
  });
  revalidatePath("/today");
  redirect(`/habits/${habit!.id}`);
}

export async function addLeverAction(formData: FormData) {
  const userId = await uid();
  const habitId = String(formData.get("habitId") ?? "");
  const environmentId = String(formData.get("environmentId") ?? "");
  const action = String(formData.get("action") ?? "").trim();
  const direction =
    String(formData.get("direction") ?? "lower") === "raise" ? "raise" : "lower";
  if (!habitId || !environmentId || !action) return;

  const db = getDb();
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) return;

  await db.insert(frictionLevers).values({
    habitId,
    environmentId,
    direction,
    action,
    status: "planned",
  });
  revalidatePath(`/habits/${habitId}`);
  revalidatePath("/today");
}

export type DoneResult = {
  encouragement: string;
  leverId: string;
};

export async function markLeverDoneAction(formData: FormData): Promise<DoneResult> {
  const userId = await uid();
  const leverId = String(formData.get("leverId") ?? "");
  const blobUrl = String(formData.get("blobUrl") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const locale = await getUserLocale(userId);
  const db = getDb();

  const [lever] = await db
    .select({
      id: frictionLevers.id,
      habitId: frictionLevers.habitId,
      userId: habits.userId,
    })
    .from(frictionLevers)
    .innerJoin(habits, eq(habits.id, frictionLevers.habitId))
    .where(and(eq(frictionLevers.id, leverId), eq(habits.userId, userId)))
    .limit(1);

  if (!lever) {
    return { encouragement: pickEncouragement(locale), leverId };
  }

  await db
    .update(frictionLevers)
    .set({
      status: "done",
      implementedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(frictionLevers.id, leverId));

  if (blobUrl) {
    await db.insert(proofPhotos).values({
      userId,
      frictionLeverId: leverId,
      blobUrl,
      caption,
    });
  }

  revalidatePath("/today");
  revalidatePath(`/habits/${lever.habitId}`);
  return { encouragement: pickEncouragement(locale), leverId };
}

export async function checkInAction(formData: FormData) {
  const userId = await uid();
  const habitId = String(formData.get("habitId") ?? "");
  const resultRaw = String(formData.get("result") ?? "yes");
  const result =
    resultRaw === "no" ? "no" : resultRaw === "skip" ? "skip" : "yes";
  const note = String(formData.get("note") ?? "").trim() || null;
  const occurredOn = format(new Date(), "yyyy-MM-dd");

  const db = getDb();
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) return;

  const [link] = await db
    .select()
    .from(habitEnvironments)
    .where(eq(habitEnvironments.habitId, habitId))
    .limit(1);

  await db
    .insert(checkIns)
    .values({
      habitId,
      environmentId: link?.environmentId ?? null,
      occurredOn,
      result,
      note,
    })
    .onConflictDoUpdate({
      target: [checkIns.habitId, checkIns.occurredOn],
      set: { result, note, updatedAt: new Date() },
    });

  revalidatePath("/today");
  revalidatePath(`/habits/${habitId}`);
}

export async function getTodayData(userId: string) {
  const db = getDb();
  const openLevers = await db
    .select({
      id: frictionLevers.id,
      action: frictionLevers.action,
      direction: frictionLevers.direction,
      status: frictionLevers.status,
      habitId: habits.id,
      habitTitle: habits.title,
      polarity: habits.polarity,
      environmentId: environments.id,
      environmentName: environments.name,
    })
    .from(frictionLevers)
    .innerJoin(habits, eq(habits.id, frictionLevers.habitId))
    .innerJoin(environments, eq(environments.id, frictionLevers.environmentId))
    .where(and(eq(habits.userId, userId), eq(frictionLevers.status, "planned")))
    .orderBy(frictionLevers.sortOrder, desc(frictionLevers.createdAt));

  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId)))
    .orderBy(desc(habits.createdAt));

  const today = format(new Date(), "yyyy-MM-dd");
  const habitIds = activeHabits.map((h) => h.id);
  const todaysCheckIns =
    habitIds.length === 0
      ? []
      : await db
          .select()
          .from(checkIns)
          .where(
            and(inArray(checkIns.habitId, habitIds), eq(checkIns.occurredOn, today)),
          );
  const checked = new Set(todaysCheckIns.map((c) => c.habitId));

  const envList = await db
    .select()
    .from(environments)
    .where(eq(environments.userId, userId))
    .orderBy(desc(environments.createdAt));

  return { openLevers, activeHabits, checked, envList, today };
}
