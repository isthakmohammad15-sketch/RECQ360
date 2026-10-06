import { callGemini } from "./gemini-service";

export default async function handler(req: any, res?: any) {
  // 1. Handle Web Standard Request (Edge runtime / Web Request)
  if (req instanceof Request || (typeof req?.json === "function" && !res)) {
    try {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
      }
      const body = await req.json();
      if (!body?.message?.trim()) {
        return new Response(JSON.stringify({ error: "Message cannot be empty." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const text = await callGemini(
        body.message,
        body.systemPrompt,
        body.history,
        body.stateContext
      );
      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("AI chat edge error:", err);
      return new Response(
        JSON.stringify({ error: err?.message || "AI request failed." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 2. Handle Node.js IncomingMessage & ServerResponse (Standard Node runtime)
  if (req.method !== "POST") {
    if (res?.status) return res.status(405).json({ error: "Method not allowed" });
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {}
    } else if (!body && typeof req.on === "function") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      try {
        body = JSON.parse(raw);
      } catch {}
    }

    if (!body?.message?.trim()) {
      if (res?.status) return res.status(400).json({ error: "Message cannot be empty." });
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Message cannot be empty." }));
      return;
    }

    const text = await callGemini(
      body.message,
      body.systemPrompt,
      body.history,
      body.stateContext
    );

    if (res?.status) return res.status(200).json({ text });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ text }));
  } catch (err: any) {
    console.error("AI chat node error:", err);
    if (res?.status) return res.status(500).json({ error: err?.message || "AI request failed." });
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "AI request failed." }));
  }
}

export async function POST(request: Request) {
  return handler(request);
}
