import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import type { Locale } from "@/lib/i18n/messages";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function getUserLocale(userId: string): Promise<Locale> {
  const db = getDb();
  const [row] = await db
    .select({ locale: users.locale })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return (row?.locale === "zh" ? "zh" : "en") as Locale;
}
