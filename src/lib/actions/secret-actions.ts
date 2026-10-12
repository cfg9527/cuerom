"use server";

import { generateTaskReflection } from "@/lib/ai/reflection";
import type { Locale } from "@/lib/i18n/messages";

/** Secret edition only — no auth, no DB. Literary旁白 after a stage direction. */
export async function secretNarrationAction(input: {
  locale: Locale;
  action: string;
  habit?: string;
  room?: string;
}): Promise<{ text: string; source: "ai" | "static" }> {
  const result = await generateTaskReflection({
    locale: input.locale,
    action: input.action,
    habitTitle: input.habit,
    environmentName: input.room,
  });
  return result;
}
