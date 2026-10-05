const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_GEMINI_API_KEY']) ||
  'AQ.Ab8RN6K37VuXMhBrmMhbWcxM67hqH-GAR_vKBvrjv3u4FDPbiQ';

const CYCLONE_SYSTEM_PROMPT = `You are RECQ360 AI, the tactical decision-support engine for the Visakhapatnam Disaster Management Command Center.
You advise officers on cyclone preparedness across 10 city zones: shelters, de-watering pumps, generators, rescue boats, JCBs, ambulances, food/water stock and field inspections.
Style: crisp, operational, decisive. Use short paragraphs and bullet points. Reference zone names and readiness percentages from the provided live state. Never invent data that is not in the state; if something is unknown, say so and recommend how to verify it.`;

const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

async function executeGeminiRequest(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (e: any) {
      lastError = e;
      console.warn(`[Gemini] Model ${model} failed, trying next model:`, e?.message);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

export async function askGemini(
  query: string,
  stateContext?: unknown,
  history?: { sender: string; text: string }[],
): Promise<string> {
  // 1. Try serverless endpoint first
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, history, stateContext }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.text) return data.text;
    }
  } catch {
    // Continue to direct Gemini call
  }

  // 2. Direct Gemini REST API call
  const prompt = `${CYCLONE_SYSTEM_PROMPT}

LIVE OPERATIONAL STATE:
${JSON.stringify(stateContext ?? {})}

RECENT CHAT HISTORY:
${(history ?? [])
  .slice(-6)
  .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join('\n')}

USER QUESTION:
${query}

Provide a direct, authoritative operational response for the disaster response command center.`;

  return executeGeminiRequest(prompt);
}

export async function askGeminiSummary(body: {
  zoneData: unknown;
  alertData: unknown;
  overallReadiness: number;
}): Promise<string> {
  // 1. Try serverless endpoint first
  try {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.summary) return data.summary;
    }
  } catch {
    // Continue to direct Gemini call
  }

  // 2. Direct Gemini REST API call
  const prompt = `${CYCLONE_SYSTEM_PROMPT}

Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body.overallReadiness}%.
Zones: ${JSON.stringify(body.zoneData)}
Open alerts: ${JSON.stringify(body.alertData)}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

  return executeGeminiRequest(prompt);
}
