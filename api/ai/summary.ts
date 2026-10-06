import { callGemini } from "./gemini-service";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Only POST is supported." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("RECQ360 AI Summary Error:", err);
    return new Response(
      JSON.stringify({
        error: err?.message || "AI summary generation failed.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
