import { executeAiChat } from "../../src/lib/ai-gateway.server";

export default async function handler(req: any, res: any) {
  if (req instanceof Request) {
    return handleWebRequest(req);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body?.message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const text = await executeAiChat({
      message: body.message,
      history: body.history,
      stateContext: body.stateContext,
    });

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return res.status(500).json({
      error: error?.message || "AI request failed. Please check your API key configuration.",
    });
  }
}

async function handleWebRequest(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as any;
    if (!body?.message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const text = await executeAiChat({
      message: body.message,
      history: body.history,
      stateContext: body.stateContext,
    });

    return Response.json({ text });
  } catch (error: any) {
    console.error("AI web request error:", error);
    return Response.json(
      { error: error?.message || "AI request failed. Please check your API key configuration." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleWebRequest(request);
}
