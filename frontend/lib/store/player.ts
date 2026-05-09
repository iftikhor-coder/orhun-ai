'use client';

import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  prompt?: string;
  lyrics?: string;
  audio_url: string;
  duration_seconds: number;
  voice_type?: string;
  created_at?: string;
  is_published?: boolean;
  user?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;     // 0-1
  duration: number;     // seconds
  volume: number;       // 0-1
  
  setSong: (song: Song) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  
  setSong: (song) => set({ currentSong: song, isPlaying: true, progress: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  clear: () => set({ currentSong: null, isPlaying: false, progress: 0 }),
}));
