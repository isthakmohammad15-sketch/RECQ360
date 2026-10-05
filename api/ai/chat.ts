import { generateText } from "ai";
import { getAiProviderAndModel, CYCLONE_SYSTEM_PROMPT } from "../../src/lib/ai-gateway.server";

export default async function handler(req: any, res: any) {
  if (req instanceof Request) {
    return handleWebRequest(req);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const aiSetup = getAiProviderAndModel();
  if (!aiSetup) {
    return res.status(500).json({
      error: "AI is not configured. Provide GEMINI_API_KEY, LOVABLE_API_KEY, or OPENAI_API_KEY.",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body?.message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const result = await generateText({
      model: aiSetup.model,
      system: `${CYCLONE_SYSTEM_PROMPT}${
        body.readOnly
          ? "\n\nThis user has the Read Only role. You are an advisory assistant only and must never claim to create, edit, or delete records."
          : ""
      }\n\nLIVE OPERATIONAL STATE:\n${JSON.stringify(body.stateContext ?? {})}`,
      messages: [
        ...(body.history ?? []).slice(-10).map((m: any) => ({
          role: m.sender === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        })),
        { role: "user" as const, content: body.message },
      ],
    });
    return res.status(200).json({ text: result.text });
  } catch (error: any) {
    console.error("AI chat error", error);
    return res.status(500).json({ error: "AI request failed" });
  }
}

async function handleWebRequest(request: Request) {
  const aiSetup = getAiProviderAndModel();
  if (!aiSetup) {
    return Response.json({ error: "AI is not configured." }, { status: 500 });
  }
  const body = (await request.json()) as any;
  if (!body?.message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }
  try {
    const result = await generateText({
      model: aiSetup.model,
      system: `${CYCLONE_SYSTEM_PROMPT}\n\nLIVE OPERATIONAL STATE:\n${JSON.stringify(body.stateContext ?? {})}`,
      messages: [
        ...(body.history ?? []).slice(-10).map((m: any) => ({
          role: m.sender === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        })),
        { role: "user" as const, content: body.message },
      ],
    });
    return Response.json({ text: result.text });
  } catch (error: any) {
    return Response.json({ error: "AI request failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleWebRequest(request);
}
