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

  try {
    const result = await generateText({
      model: aiSetup.model,
      system: CYCLONE_SYSTEM_PROMPT,
      prompt: `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body?.overallReadiness ?? "unknown"}%.
Zones: ${JSON.stringify(body?.zoneData ?? [])}
Open alerts: ${JSON.stringify(body?.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`,
    });
    return res.status(200).json({ summary: result.text });
  } catch (error: any) {
    console.error("AI summary error", error);
    return res.status(500).json({ error: "AI summary failed" });
  }
}

async function handleWebRequest(request: Request) {
  const aiSetup = getAiProviderAndModel();
  if (!aiSetup) {
    return Response.json({ error: "AI is not configured." }, { status: 500 });
  }
  const body = (await request.json()) as any;
  try {
    const result = await generateText({
      model: aiSetup.model,
      system: CYCLONE_SYSTEM_PROMPT,
      prompt: `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body?.overallReadiness ?? "unknown"}%.
Zones: ${JSON.stringify(body?.zoneData ?? [])}
Open alerts: ${JSON.stringify(body?.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`,
    });
    return Response.json({ summary: result.text });
  } catch (error: any) {
    return Response.json({ error: "AI summary failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleWebRequest(request);
}
