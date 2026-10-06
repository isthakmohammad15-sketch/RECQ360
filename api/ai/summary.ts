import { callGemini } from "./gemini-service";

export default async function handler(req: any, res?: any) {
  // 1. Handle Web Standard Request
  if (req instanceof Request || (typeof req?.json === "function" && !res)) {
    try {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
      }
      const body = await req.json();
      const prompt = `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body?.overallReadiness ?? 'unknown'}%.
Zones: ${JSON.stringify(body?.zoneData ?? [])}
Open alerts: ${JSON.stringify(body?.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

      const summary = await callGemini(
        prompt,
        "You are the Chief Disaster Operations Advisor for RECQ360 Command Center. Write executive briefing summaries directly, authoritatively, and concisely."
      );

      return new Response(JSON.stringify({ summary }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("AI summary edge error:", err);
      return new Response(
        JSON.stringify({ error: err?.message || "AI summary generation failed." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 2. Handle Node.js IncomingMessage
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

    const prompt = `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body?.overallReadiness ?? 'unknown'}%.
Zones: ${JSON.stringify(body?.zoneData ?? [])}
Open alerts: ${JSON.stringify(body?.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

    const summary = await callGemini(
      prompt,
      "You are the Chief Disaster Operations Advisor for RECQ360 Command Center. Write executive briefing summaries directly, authoritatively, and concisely."
    );

    if (res?.status) return res.status(200).json({ summary });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ summary }));
  } catch (err: any) {
    console.error("AI summary node error:", err);
    if (res?.status) return res.status(500).json({ error: err?.message || "AI summary failed." });
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "AI summary failed." }));
  }
}

export async function POST(request: Request) {
  return handler(request);
}
