import { cookies, headers } from "next/headers";
import type { Locale } from "./messages";

export const LOCALE_COOKIE = "cuerom_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function parseLocale(value: unknown): Locale {
  return value === "zh" ? "zh" : "en";
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";
  const primary = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("zh")) return "zh";
  return "en";
}

/** Public + SSR-friendly locale: cookie → Accept-Language → en */
export async function getPublicLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "en" || fromCookie === "zh") {
    return fromCookie;
  }
  const h = await headers();
  return localeFromAcceptLanguage(h.get("accept-language"));
}
