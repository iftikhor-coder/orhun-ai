/**
 * API client — calls Oracle backend with Supabase JWT
 */

import { createClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface GenerateRequest {
  prompt: string;
  lyrics?: string;
  genres?: string;
  voice_type: 'male' | 'female' | 'instrumental';
  duration: number;
}

export interface GenerateResponse {
  song_id: string;
  audio_url: string;
  duration: number;
  prompt: string;
  status: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
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
    const error = await response.text();
    throw new Error(error || `Generation failed: ${response.status}`);
  }
  
  return response.json();
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
