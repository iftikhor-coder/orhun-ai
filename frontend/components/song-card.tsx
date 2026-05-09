'use client';

import { Play, Pause, MoreHorizontal, Music } from 'lucide-react';
import { usePlayerStore, Song } from '@/lib/store/player';
import { formatDuration, cn, timeAgo } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export function SongCard({ song, showMenu = true, onMenuClick, className }: SongCardProps) {
  const { currentSong, isPlaying, setSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      setSong(song);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 p-3 rounded-xl surface-card transition-all cursor-pointer',
        isCurrent && 'border-gold-700/40',
        className
      )}
    >
      {/* Cover / Play button */}
      <button
        onClick={handlePlay}
        className={cn(
          'relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden',
          'bg-gradient-gold-soft border border-gold-700/30',
          'flex items-center justify-center',
          'group-hover:bg-gradient-gold transition-all'
        )}
      >
        {/* Default music icon */}
        <Music className={cn(
          'h-6 w-6 transition-opacity',
          'text-gold-400 group-hover:opacity-0',
          isThisPlaying && 'opacity-0'
        )} />

        {/* Playing animation */}
        {isThisPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-0.5">
            <div className="wave-bar h-4" />
            <div className="wave-bar h-4" />
            <div className="wave-bar h-4" />
            <div className="wave-bar h-4" />
          </div>
        )}

        {/* Hover Play/Pause */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-midnight-950/60',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isThisPlaying && 'group-hover:opacity-100'
        )}>
          {isThisPlaying ? (
            <Pause className="h-5 w-5 text-midnight-950 fill-midnight-950" />
          ) : (
            <Play className="h-5 w-5 text-midnight-950 fill-midnight-950 ml-0.5" />
          )}
        </div>
      </button>

      {/* Title + meta */}
      <div className="flex-1 min-w-0" onClick={handlePlay}>
        <div className={cn(
          'text-sm font-medium truncate',
          isCurrent ? 'text-gold-200' : 'text-gold-100'
        )}>
          {song.title}
        </div>
        <div className="text-xs text-gold-700 truncate flex items-center gap-2 mt-0.5">
          <span>{formatDuration(song.duration_seconds)}</span>
          {song.created_at && (
            <>
              <span>·</span>
              <span>{timeAgo(song.created_at)}</span>
            </>
          )}
          {song.is_published === false && (
            <>
              <span>·</span>
              <span className="text-gold-700/70">Private</span>
            </>
          )}
        </div>
      </div>

      {/* Menu button */}
      {showMenu && (
        <button
          onClick={(e) => { e.stopPropagation(); onMenuClick?.(); }}
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            'text-gold-300/50 hover:text-gold-200 hover:bg-midnight-700/40',
            'transition-all opacity-0 group-hover:opacity-100'
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
