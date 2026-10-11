"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  parseLocale,
} from "@/lib/i18n/locale";

export async function setLocaleCookie(localeRaw: string) {
  const locale = parseLocale(localeRaw);
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false, // readable by client if needed; SSR still uses cookies()
  });
  return locale;
}

/** Public language picker — works before login; syncs account if signed in. */
export async function setPublicLocaleAction(formData: FormData) {
  const locale = await setLocaleCookie(String(formData.get("locale") ?? "en"));

  const session = await auth();
  if (session?.user?.id) {
    const db = getDb();
    await db
      .update(users)
      .set({ locale, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  }

  revalidatePath("/", "layout");
}
