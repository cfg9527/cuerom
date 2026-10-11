import { timingSafeEqual } from "crypto";

export function getPreviewBypassToken(): string | null {
  const token = process.env.PREVIEW_BYPASS_TOKEN?.trim();
  return token || null;
}

export function isValidPreviewKey(key: string | null | undefined): boolean {
  const expected = getPreviewBypassToken();
  if (!expected || !key) return false;
  try {
    const a = Buffer.from(key);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
