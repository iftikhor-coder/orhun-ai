'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Play, Pause, Volume2, VolumeX, Download, X, Music } from 'lucide-react';
import { usePlayerStore } from '@/lib/store/player';
import { formatDuration, cn } from '@/lib/utils';

export function AudioPlayer() {
  const { currentSong, isPlaying, progress, volume, setPlaying, setProgress, setDuration, setVolume, clear } = usePlayerStore();
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(false);

  // Load song into Howl
  useEffect(() => {
    if (!currentSong) {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
      return;
    }

    if (howlRef.current) {
      howlRef.current.unload();
    }

    const howl = new Howl({
      src: [currentSong.audio_url],
      html5: true,
      volume: muted ? 0 : volume,
      onload: () => {
        setDuration(howl.duration());
      },
      onplay: () => {
        setPlaying(true);
        const tick = () => {
          if (howlRef.current && howlRef.current.playing()) {
            const seek = howlRef.current.seek() as number;
            const dur = howlRef.current.duration();
            setProgress(dur > 0 ? seek / dur : 0);
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        tick();
      },
      onpause: () => {
        setPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onend: () => {
        setPlaying(false);
        setProgress(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
    });

    howlRef.current = howl;
    howl.play();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      howl.unload();
    };
  }, [currentSong?.id]);

  // Sync play/pause from store
  useEffect(() => {
    if (!howlRef.current) return;
    if (isPlaying && !howlRef.current.playing()) {
      howlRef.current.play();
    } else if (!isPlaying && howlRef.current.playing()) {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  // Volume sync
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(muted ? 0 : volume);
    }
  }, [volume, muted]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howlRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const dur = howlRef.current.duration();
    howlRef.current.seek(dur * percent);
    setProgress(percent);
  };

  const handleDownload = () => {
    if (!currentSong) return;
    window.open(currentSong.audio_url, '_blank');
  };

  if (!currentSong) return null;

  const dur = howlRef.current?.duration() || currentSong.duration_seconds || 0;
  const currentTime = progress * dur;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 surface-glass-bright border-t border-gold-900/30">
      {/* Progress bar (top edge) */}
      <div
        onClick={handleSeek}
        className="h-1 bg-midnight-700/50 cursor-pointer group hover:h-1.5 transition-all"
      >
        <div
          className="h-full bg-gradient-gold transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
        {/* Song info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-gold-soft border border-gold-700/30 flex items-center justify-center">
            <Music className="h-5 w-5 text-gold-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gold-100 truncate">{currentSong.title}</div>
            <div className="text-xs text-gold-700 truncate hidden sm:block">
              {currentSong.prompt?.slice(0, 60) || ''}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Time */}
          <div className="hidden md:block text-xs text-gold-700 tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(dur)}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            className={cn(
              'h-10 w-10 rounded-full bg-gradient-gold text-midnight-950',
              'flex items-center justify-center',
              'hover:scale-105 active:scale-95 transition-transform',
              'glow-gold'
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="text-gold-300/70 hover:text-gold-200 transition-colors"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
              className="w-20 accent-gold-500"
            />
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            title="Download"
            className="hidden md:block text-gold-300/70 hover:text-gold-200 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Close */}
          <button
            onClick={() => clear()}
            className="text-gold-300/50 hover:text-gold-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
