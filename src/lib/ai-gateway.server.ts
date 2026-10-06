/**
 * RECQ360 Server-side AI Gateway
 * Connects securely to Google Gemini and other AI providers without exposing keys to the browser.
 */

export const RECQ_AI_SYSTEM_PROMPT = `You are RECQ360 AI, an advanced conversational AI assistant for the RECQ360 Disaster Management Command Center.
You communicate naturally, clearly, helpfully, and conversationally, just like ChatGPT.
You possess deep expertise in disaster preparedness, emergency response, urban resilience, rescue logistics, and resource mobilization, as well as general knowledge.

Guidelines:
1. Always understand the user's intent and answer naturally and directly.
2. If live operational telemetry data is provided in context, reference relevant details (such as zones, shelters, equipment, or readiness percentages) accurately when answering situational or operational questions.
3. If asked general questions (e.g. "Who are you?", "What can you do?", or general topics), answer conversationally and informatively.
4. Do NOT explain internal application mechanics, workflow steps, or demo simulations. Speak directly and genuinely as an intelligent assistant.`;

export const CYCLONE_SYSTEM_PROMPT = RECQ_AI_SYSTEM_PROMPT;

const GEMINI_CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export function getActiveServerApiKey(): string {
  const key =
    process.env['GEMINI_API_KEY'] ||
    process.env['VITE_GEMINI_API_KEY'] ||
    process.env['GOOGLE_GENERATIVE_AI_API_KEY'] ||
    process.env['GOOGLE_API_KEY'] ||
    '';
  return key.trim();
}

export interface ChatMessageParam {
  sender?: string;
  role?: string;
  text?: string;
  content?: string;
}

export interface ChatRequestParams {
  message: string;
  history?: ChatMessageParam[];
  stateContext?: any;
  systemPrompt?: string;
}

/**
 * Executes a conversational AI chat call via Google Gemini REST API.
 */
export async function executeAiChat(params: ChatRequestParams): Promise<string> {
  const apiKey = getActiveServerApiKey();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment.'
    );
  }

  const userQuery = params.message?.trim();
  if (!userQuery) {
    throw new Error('Message cannot be empty.');
  }

  // Build system prompt with optional operational telemetry
  let systemInstruction = params.systemPrompt || RECQ_AI_SYSTEM_PROMPT;
  if (params.stateContext && Object.keys(params.stateContext).length > 0) {
    systemInstruction += `\n\nLIVE OPERATIONAL TELEMETRY STATE:\n${JSON.stringify(
      params.stateContext
    )}`;
  }

  // Format previous history into Gemini multi-turn format
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(params.history)) {
    const recentHistory = params.history.slice(-12);
    for (const h of recentHistory) {
      const text = (h.text || h.content || '').trim();
      if (!text) continue;
      const role =
        h.sender === 'user' || h.role === 'user' ? ('user' as const) : ('model' as const);
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userQuery }],
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  let lastError: Error | null = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText && responseText.trim()) {
          return responseText.trim();
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg =
          errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        lastError = new Error(`Google Gemini Error (${model}): ${errMsg}`);

        // If auth/key invalid, do not retry further models with the same broken key
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Google Gemini Authentication Error: ${errMsg}`);
        }
      }
    } catch (e: any) {
      if (e?.message?.includes('Authentication Error')) {
        throw e;
      }
      lastError = e;
    }
  }

  throw (
    lastError ||
    new Error('Google Gemini API request failed across all candidate models.')
  );
}

/**
 * Generates Executive Daily Readiness Summary via Google Gemini.
 */
export async function executeAiSummary(body: {
  zoneData?: any;
  alertData?: any;
  overallReadiness?: number;
}): Promise<string> {
  const apiKey = getActiveServerApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const prompt = `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body.overallReadiness ?? 'unknown'}%.
Zones: ${JSON.stringify(body.zoneData ?? [])}
Open alerts: ${JSON.stringify(body.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

  return executeAiChat({
    message: prompt,
    systemPrompt:
      'You are the Chief Disaster Operations Advisor for RECQ360 Command Center. Write executive briefing summaries directly, authoritatively, and concisely.',
  });
}
