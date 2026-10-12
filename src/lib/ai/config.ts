/**
 * Reflection model via Vercel AI Gateway.
 *
 * Chosen 2026-10-11 by querying GET https://ai-gateway.vercel.sh/v1/models
 * and ranking type=language text→text models by estimated cost
 * (100 input + 40 output tokens). This id has pricing input=0, output=0
 * (gateway tag: "free") — cheapest available for short bilingual reflections.
 * Paid runners-up at that time included mistral/mistral-nemo (~$4e-6/call).
 */
export const REFLECTION_MODEL_ID = "inclusionai/ling-3.1-flash-free" as const;

/** Tight cap so each done-flow reflection stays tiny. */
export const REFLECTION_MAX_OUTPUT_TOKENS = 80;
