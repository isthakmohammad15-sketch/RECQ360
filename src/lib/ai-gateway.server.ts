import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Lovable AI Gateway provider — server only. */
export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/**
 * Resolves the active AI provider and model.
 * Supports:
 * - LOVABLE_API_KEY (Lovable AI Gateway)
 * - GEMINI_API_KEY / GOOGLE_API_KEY (Google Gemini direct via OpenAI-compatible endpoint)
 * - OPENAI_API_KEY (OpenAI direct)
 * - OPENROUTER_API_KEY (OpenRouter direct)
 */
export function getAiProviderAndModel() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey =
    process.env["GEMINI_API_KEY"] ||
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ||
    process.env["GOOGLE_API_KEY"] ||
    "AQ.Ab8RN6K37VuXMhBrmMhbWcxM67hqH-GAR_vKBvrjv3u4FDPbiQ";
  const openaiKey = process.env["OPENAI_API_KEY"];
  const openrouterKey = process.env["OPENROUTER_API_KEY"];

  if (lovableKey) {
    const provider = createLovableAiGatewayProvider(lovableKey);
    return {
      model: provider("google/gemini-3.6-flash"),
      providerName: "lovable",
    };
  }

  if (geminiKey) {
    const provider = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: geminiKey,
    });
    return {
      model: provider(process.env["AI_MODEL"] || "gemini-3.8-flash"),
      providerName: "gemini",
    };
  }

  if (openaiKey) {
    const provider = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: openaiKey,
    });
    return {
      model: provider(process.env["AI_MODEL"] || "gpt-4o-mini"),
      providerName: "openai",
    };
  }

  if (openrouterKey) {
    const provider = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openrouterKey,
    });
    return {
      model: provider(process.env["AI_MODEL"] || "google/gemini-2.0-flash-001"),
      providerName: "openrouter",
    };
  }

  return null;
}

export const CYCLONE_SYSTEM_PROMPT = `You are RECA, the tactical decision-support AI engine for the RECQ360 Disaster Management Command Center.
You advise officers on disaster and cyclone preparedness across municipal zones: shelters, de-watering pumps, generators, rescue boats, JCBs, ambulances, food/water stock and field inspections.
Style: crisp, operational, decisive. Use short paragraphs and bullet points. Reference zone names and readiness percentages from the provided live state. Never invent data that is not in the state; if something is unknown, say so and recommend how to verify it.`;

