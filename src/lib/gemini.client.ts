import {
  generateTacticalResponse,
  generateTacticalExecutiveSummary,
  TacticalStateContext,
} from './tactical-engine';

export const STORAGE_AI_KEY = 'recq360_gemini_api_key';

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_AI_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_GEMINI_API_KEY']) ||
    'AQ.Ab8RN6K37VuXMhBrmMhbWcxM67hqH-GAR_vKBvrjv3u4FDPbiQ'
  );
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_AI_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_AI_KEY);
    }
  }
}

export function removeGeminiApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_AI_KEY);
  }
}

const CYCLONE_SYSTEM_PROMPT = `You are RECA, the tactical decision-support AI engine for the RECQ360 Disaster Management Command Center.
You advise officers on disaster and cyclone preparedness across municipal zones: shelters, de-watering pumps, generators, rescue boats, JCBs, ambulances, food/water stock and field inspections.
Style: crisp, operational, decisive. Use short paragraphs and bullet points. Reference zone names and readiness percentages from the provided live state. Never invent data that is not in the state; if something is unknown, say so and recommend how to verify it.`;

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
];

/**
 * Validates a user-provided Gemini API key with a test ping.
 */
export async function verifyGeminiApiKey(
  testKey: string
): Promise<{ valid: boolean; model?: string; error?: string }> {
  const cleanKey = testKey.trim();
  if (!cleanKey) {
    return { valid: false, error: 'API key is empty' };
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Ping RECA. Respond with: OK' }],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { valid: true, model };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        // If 401 Unauthorized or 403 Forbidden, stop testing other models as key is invalid
        if (res.status === 401 || res.status === 403) {
          return { valid: false, error: errMsg };
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return { valid: false, error: 'Connection timed out' };
      }
    }
  }

  return { valid: false, error: 'Unable to connect to Google Gemini API with this key' };
}

async function executeGeminiRequest(prompt: string, apiKey: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      // If unauthorized, do not retry further models with the same invalid key
      if (e?.message?.includes('401') || e?.message?.includes('UNAUTHENTICATED')) {
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

export async function askGemini(
  query: string,
  stateContext?: TacticalStateContext,
  history?: { sender: string; text: string }[]
): Promise<string> {
  const apiKey = getGeminiApiKey();

  // 1. Try serverless endpoint if available
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

  // 2. Try direct Gemini API call
  try {
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

    const remoteText = await executeGeminiRequest(prompt, apiKey);
    if (remoteText && remoteText.trim().length > 10) {
      return remoteText;
    }
  } catch (err: any) {
    console.warn('[RECA Engine] Remote Gemini call failed, engaging Tactical Telemetry Engine:', err?.message);
  }

  // 3. Fallback to Local Tactical Domain Reasoning Engine (Guarantees rich, real answers, never demo placeholders)
  return generateTacticalResponse(query, stateContext || {}, history);
}

export async function askGeminiSummary(body: {
  zoneData: unknown;
  alertData: unknown;
  overallReadiness: number;
  stateContext?: TacticalStateContext;
}): Promise<string> {
  const apiKey = getGeminiApiKey();

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
  try {
    const prompt = `${CYCLONE_SYSTEM_PROMPT}

Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body.overallReadiness}%.
Zones: ${JSON.stringify(body.zoneData)}
Open alerts: ${JSON.stringify(body.alertData)}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

    const summary = await executeGeminiRequest(prompt, apiKey);
    if (summary && summary.trim().length > 15) {
      return summary;
    }
  } catch (err: any) {
    console.warn('[RECA Summary] Remote Gemini call failed, engaging Tactical Telemetry Summary:', err?.message);
  }

  // 3. Fallback to Local Tactical Telemetry Summary Engine
  return generateTacticalExecutiveSummary(body.stateContext || { overallReadiness: body.overallReadiness });
}
