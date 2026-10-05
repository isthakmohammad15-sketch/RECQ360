import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { getAiProviderAndModel, CYCLONE_SYSTEM_PROMPT } from "../../../lib/ai-gateway.server";

export const Route = createFileRoute("/api/ai/summary")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const aiSetup = getAiProviderAndModel();
        if (!aiSetup) {
          return Response.json(
            { error: "AI is not configured. Provide GEMINI_API_KEY, LOVABLE_API_KEY, or OPENAI_API_KEY." },
            { status: 500 },
          );
        }

        const body = (await request.json()) as {
          zoneData?: unknown;
          alertData?: unknown;
          overallReadiness?: number;
        };

        try {
          const result = await generateText({
            model: aiSetup.model,
            system: CYCLONE_SYSTEM_PROMPT,
            prompt: `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body.overallReadiness ?? "unknown"}%.
Zones: ${JSON.stringify(body.zoneData ?? [])}
Open alerts: ${JSON.stringify(body.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`,
          });
          return Response.json({ summary: result.text });
        } catch (error: any) {
          const status = error?.statusCode ?? error?.status ?? 500;
          console.error("AI summary error", error);
          return Response.json({ error: "AI summary failed" }, { status: status === 429 || status === 402 ? status : 500 });
        }
      },
    },
  },
});
