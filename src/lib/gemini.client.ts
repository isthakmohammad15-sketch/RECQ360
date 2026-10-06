import { Zone, Shelter, Asset, AlertItem, DepartmentProgress, EmergencyContact, DisasterCity } from '../types';

export const STORAGE_AI_KEY = 'recq360_gemini_api_key';

export interface TacticalStateContext {
  overallReadiness?: number;
  activeCity?: DisasterCity | null;
  zones?: Zone[];
  shelters?: Shelter[];
  assets?: Asset[];
  alerts?: AlertItem[];
  departmentStats?: DepartmentProgress[];
  emergencyContacts?: EmergencyContact[];
}

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_AI_KEY);
    if (saved && saved.trim() && !saved.includes('AQ.Ab8RN6K37')) return saved.trim();
  }
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.['VITE_GEMINI_API_KEY'] || import.meta.env?.['GEMINI_API_KEY'])) ||
    ''
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

const CYCLONE_SYSTEM_PROMPT = `You are RECA, the real-time tactical decision-support AI engine for the RECQ360 Disaster Management Command Center.
You advise officers on disaster and cyclone preparedness across municipal zones: relief shelters, de-watering pumps, auxiliary diesel generators, rescue boats, JCB earthmovers, ambulances, food/water stock and field inspections.
Style: authoritative, operational, decisive. Use clear paragraphs and bullet points. Reference real zone names, equipment counts, and readiness percentages from the provided live telemetry state. Never invent data that is not in the state.`;

const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

/**
 * Validates a user-provided Gemini API key with a live test ping.
 */
export async function verifyGeminiApiKey(
  testKey: string
): Promise<{ valid: boolean; model?: string; error?: string }> {
  const cleanKey = testKey.trim();
  if (!cleanKey) {
    return { valid: false, error: 'API key is empty' };
  }

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
              parts: [{ text: 'Respond with: RECA Online' }],
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
        lastError = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        if (res.status === 401 || res.status === 403) {
          return { valid: false, error: lastError };
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return { valid: false, error: 'Connection timed out' };
      }
      lastError = e?.message || 'Network error';
    }
  }

  return { valid: false, error: lastError || 'Unable to connect to Google Gemini API' };
}

async function executeGeminiRequest(prompt: string, apiKey: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (e: any) {
      lastError = e;
      // If unauthorized, do not retry further models with the same invalid key
      if (
        e?.message?.includes('401') ||
        e?.message?.includes('UNAUTHENTICATED') ||
        e?.message?.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')
      ) {
        break;
      }
    }
  }

  throw lastError || new Error('Google Gemini API request failed');
}

/**
 * Ask Google Gemini live with full operational telemetry state context.
 */
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

  // 2. Direct live Gemini API call
  const prompt = `${CYCLONE_SYSTEM_PROMPT}

LIVE OPERATIONAL TELEMETRY STATE:
${JSON.stringify(stateContext ?? {})}

RECENT CHAT HISTORY:
${(history ?? [])
  .slice(-6)
  .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join('\n')}

USER QUESTION:
${query}

Provide a direct, authoritative operational response for the disaster response command center based on the live operational data.`;

  return executeGeminiRequest(prompt, apiKey);
}

/**
 * Generates Executive Daily Readiness Summary live from Gemini.
 */
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

  // 2. Direct live Gemini REST API call
  const prompt = `${CYCLONE_SYSTEM_PROMPT}

Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body.overallReadiness}%.
Zones: ${JSON.stringify(body.zoneData)}
Open alerts: ${JSON.stringify(body.alertData)}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

  return executeGeminiRequest(prompt, apiKey);
}
