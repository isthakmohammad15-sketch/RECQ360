import { executeAiSummary } from "../../src/lib/ai-gateway.server";

export default async function handler(req: any, res: any) {
  if (req instanceof Request) {
    return handleWebRequest(req);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const summary = await executeAiSummary(body ?? {});
    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error("AI summary error:", error);
    return res.status(500).json({
      error: error?.message || "AI summary generation failed.",
    });
  }
}

async function handleWebRequest(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as any;
    const summary = await executeAiSummary(body ?? {});
    return Response.json({ summary });
  } catch (error: any) {
    console.error("AI summary web error:", error);
    return Response.json(
      { error: error?.message || "AI summary generation failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleWebRequest(request);
}
