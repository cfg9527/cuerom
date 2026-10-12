import { generateText } from "ai";
import { pickEncouragement } from "@/lib/encouragements";
import type { Locale } from "@/lib/i18n/messages";
import { REFLECTION_MAX_OUTPUT_TOKENS, REFLECTION_MODEL_ID } from "./config";

export type ReflectionResult = {
  text: string;
  source: "ai" | "static";
};

function gatewayConfigured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

export async function generateTaskReflection(input: {
  locale: Locale;
  action: string;
  habitTitle?: string | null;
  environmentName?: string | null;
}): Promise<ReflectionResult> {
  const fallback = pickEncouragement(input.locale);
  if (!gatewayConfigured()) {
    return { text: fallback, source: "static" };
  }

  const action = input.action.trim();
  if (!action) {
    return { text: fallback, source: "static" };
  }

  const habit = input.habitTitle?.trim() || "";
  const room = input.environmentName?.trim() || "";
  const isZh = input.locale === "zh";

  const system = isZh
    ? "你是 CueRoom 的溫暖旁白。用戶剛完成一個「改環境」的設定任務。用繁體中文回一句短感想（約 30 字），聚焦空間／提示／阻力的改變，溫暖具體，不要講連續打卡、罪疚或說教。只輸出那一句，不要引號或前綴。"
    : "You are CueRoom's warm narrator. The user just finished an environment-setup task. Reply with one short reflection (~30 words max) about the room/cue/friction change — warm, specific, no streak talk, no guilt. Output only that sentence, no quotes or labels.";

  const user = isZh
    ? `任務：${action}${habit ? `\n習慣：${habit}` : ""}${room ? `\n空間：${room}` : ""}`
    : `Setup task: ${action}${habit ? `\nHabit: ${habit}` : ""}${room ? `\nEnvironment: ${room}` : ""}`;

  try {
    const { text } = await generateText({
      model: REFLECTION_MODEL_ID,
      system,
      prompt: user,
      maxOutputTokens: REFLECTION_MAX_OUTPUT_TOKENS,
      temperature: 0.8,
    });
    const cleaned = text
      .trim()
      .replace(/^["「『]|["」』]$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) {
      return { text: fallback, source: "static" };
    }
    return { text: cleaned, source: "ai" };
  } catch {
    return { text: fallback, source: "static" };
  }
}
