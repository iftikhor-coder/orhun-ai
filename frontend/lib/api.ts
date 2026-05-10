/**
 * API client — calls Oracle backend with Supabase JWT
 */

import { createClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export type VoiceType = 'male' | 'female' | 'instrumental' | 'turkic_aura';

export interface GenerateRequest {
  prompt: string;
  lyrics?: string;
  genres?: string;
  voice_type: VoiceType;
  duration: number;
}

export interface GenerateResponse {
  song_id: string;
  status: 'generating' | 'ready' | 'failed';
  credits_remaining: number;
  // Legacy fields (no longer returned, kept for compatibility)
  audio_url?: string;
  duration?: number;
  prompt?: string;
}

export class GenerateError extends Error {
  status: number;
  noCredits: boolean;
  resetAt?: string;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.noCredits = body?.detail?.error === 'no_credits';
    this.resetAt = body?.detail?.reset_at;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function generateSong(req: GenerateRequest): Promise<GenerateResponse> {
  const headers = await getAuthHeader();

  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    let body: any = {};
    try { body = await response.json(); } catch {}
    throw new GenerateError(
      body?.detail?.error || body?.detail || `Generation failed: ${response.status}`,
      response.status,
      body
    );
  }

  const data = await response.json();

  // Notify topbar of credit change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('orhun:credits-updated', {
        detail: { credits_remaining: data.credits_remaining },
      })
    );
  }

  return data;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
