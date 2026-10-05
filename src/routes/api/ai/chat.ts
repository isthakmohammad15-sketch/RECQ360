import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { getAiProviderAndModel, CYCLONE_SYSTEM_PROMPT } from "../../../lib/ai-gateway.server";

export const Route = createFileRoute("/api/ai/chat")({
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
          message?: string;
          history?: { sender: string; text: string }[];
          stateContext?: unknown;
          readOnly?: boolean;
        };
        if (!body.message?.trim()) {
          return Response.json({ error: "Message is required" }, { status: 400 });
        }

        try {
          const result = await generateText({
            model: aiSetup.model,
            system: `${CYCLONE_SYSTEM_PROMPT}${
              body.readOnly
                ? "\n\nThis user has the Read Only role. You are an advisory assistant only and must never claim to create, edit, or delete zones, assets, shelters, inspections or any other record. If asked to perform such an action, politely refuse and explain that their Read Only role does not permit modifying system data."
                : ""
            }\n\nLIVE OPERATIONAL STATE:\n${JSON.stringify(body.stateContext ?? {})}`,
            messages: [
              ...(body.history ?? []).slice(-10).map((m) => ({
                role: m.sender === "ai" ? ("assistant" as const) : ("user" as const),
                content: m.text,
              })),
              { role: "user" as const, content: body.message },
            ],
          });
          return Response.json({ text: result.text });
        } catch (error: any) {
          const status = error?.statusCode ?? error?.status ?? 500;
          if (status === 429) {
            return Response.json({ error: "AI rate limit reached. Try again shortly." }, { status: 429 });
          }
          if (status === 402) {
            return Response.json({ error: "AI credits exhausted for this workspace." }, { status: 402 });
          }
          console.error("AI chat error", error);
          return Response.json({ error: "AI request failed" }, { status: 500 });
        }
      },
    },
  },
});
