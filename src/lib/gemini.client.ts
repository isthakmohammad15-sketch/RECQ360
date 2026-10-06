import {
  Zone,
  Shelter,
  Asset,
  AlertItem,
  DepartmentProgress,
  EmergencyContact,
  DisasterCity,
} from '../types';

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

export interface ChatMessageHistoryItem {
  sender: string;
  text: string;
}

/**
 * Sends user prompt to the real AI model via server-side /api/ai/chat endpoint.
 * Zero keys are exposed to the browser. Works seamlessly on localhost and Vercel.
 */
export async function askGemini(
  query: string,
  stateContext?: TacticalStateContext,
  history?: ChatMessageHistoryItem[]
): Promise<string> {
  const cleanQuery = query?.trim();
  if (!cleanQuery) {
    throw new Error('Message cannot be empty.');
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: cleanQuery,
      history: history || [],
      stateContext: stateContext || {},
    }),
  });

  const rawText = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {}

  if (!response.ok || data?.error) {
    const errorMsg =
      data?.error ||
      (rawText && rawText.length < 300 && !rawText.includes('<!DOCTYPE')
        ? rawText.trim()
        : `AI server returned an error (HTTP ${response.status}${
            response.statusText ? ' ' + response.statusText : ''
          })`);
    throw new Error(errorMsg);
  }

  if (!data?.text || typeof data.text !== 'string' || !data.text.trim()) {
    throw new Error('AI returned an empty response.');
  }

  return data.text.trim();
}

/**
 * Generates Executive Daily Readiness Summary from the real AI model via /api/ai/summary.
 */
export async function askGeminiSummary(body: {
  zoneData: unknown;
  alertData: unknown;
  overallReadiness: number;
  stateContext?: TacticalStateContext;
}): Promise<string> {
  const response = await fetch('/api/ai/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {}

  if (!response.ok || data?.error) {
    const errorMsg =
      data?.error ||
      (rawText && rawText.length < 300 && !rawText.includes('<!DOCTYPE')
        ? rawText.trim()
        : `AI summary service returned an error (HTTP ${response.status}${
            response.statusText ? ' ' + response.statusText : ''
          })`);
    throw new Error(errorMsg);
  }

  if (!data?.summary || typeof data.summary !== 'string' || !data.summary.trim()) {
    throw new Error('AI summary returned an empty response.');
  }

  return data.summary.trim();
}

/** Legacy stub for backwards compatibility */
export function getGeminiApiKey(): string {
  return '';
}
export function setGeminiApiKey(_key: string): void {}
export function removeGeminiApiKey(): void {}
