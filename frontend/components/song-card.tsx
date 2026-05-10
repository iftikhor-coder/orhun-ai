'use client';

import { useState } from 'react';
import { Play, Pause, Music, Globe } from 'lucide-react';
import { usePlayerStore, Song } from '@/lib/store/player';
import { formatDuration, cn, timeAgo } from '@/lib/utils';
import { SongMenu } from './song-menu';
import { LikeButton } from './like-button';
import { SongDetailsModal } from './song-details-modal';
import { CommentButton } from './comment-button';
import { CommentsDrawer } from './comments-drawer';

interface SongCardProps {
  song: Song;
  showMenu?: boolean;
  showLikes?: boolean;
  showAuthor?: boolean;
  isOwner?: boolean;
  onUpdate?: () => void;
  className?: string;
}

export function SongCard({
  song,
  showMenu = true,
  showLikes = true,
  showAuthor = false,
  isOwner = true,
  onUpdate,
  className,
}: SongCardProps) {
  const { currentSong, isPlaying, setSong, togglePlay } = usePlayerStore();
  const [detailsSong, setDetailsSong] = useState<Song | null>(null);
  const [removed, setRemoved] = useState(false);
  const [localPublished, setLocalPublished] = useState(song.is_published);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number>((song as any).comment_count || 0);

  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      setSong(song);
    }
  };

  const handleDelete = (id: string) => {
    setRemoved(true);
    setTimeout(() => onUpdate?.(), 300);
  };

  const handlePublishToggle = (id: string, isPublished: boolean) => {
    setLocalPublished(isPublished);
    onUpdate?.();
  };

  if (removed) return null;

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center gap-3 p-3 rounded-xl surface-card transition-all',
          isCurrent && 'border-gold-700/40',
          className
        )}
      >
        {/* Play button */}
        <button
          onClick={handlePlay}
          className={cn(
            'relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden',
            'bg-gradient-gold-soft border border-gold-700/30',
            'flex items-center justify-center',
            'group-hover:bg-gradient-gold transition-all'
          )}
        >
          <Music
            className={cn(
              'h-6 w-6 transition-opacity',
              'text-gold-400 group-hover:opacity-0',
              isThisPlaying && 'opacity-0'
            )}
          />

          {isThisPlaying && (
            <div className="absolute inset-0 flex items-center justify-center gap-0.5">
              <div className="wave-bar h-4" />
              <div className="wave-bar h-4" />
              <div className="wave-bar h-4" />
              <div className="wave-bar h-4" />
            </div>
          )}

          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-midnight-950/60',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isThisPlaying && 'group-hover:opacity-100'
            )}
          >
            {isThisPlaying ? (
              <Pause className="h-5 w-5 text-midnight-950 fill-midnight-950" />
            ) : (
              <Play className="h-5 w-5 text-midnight-950 fill-midnight-950 ml-0.5" />
            )}
          </div>
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handlePlay}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'text-sm font-medium truncate',
                isCurrent ? 'text-gold-200' : 'text-gold-100'
              )}
            >
              {song.title}
            </div>
            {localPublished && (
              <Globe className="h-3 w-3 text-gold-500 flex-shrink-0" />
            )}
          </div>
          <div className="text-xs text-gold-700 truncate flex items-center gap-2 mt-0.5">
            <span>{formatDuration(song.duration_seconds)}</span>
            {song.created_at && (
              <>
                <span>·</span>
                <span>{timeAgo(song.created_at)}</span>
              </>
            )}
            {showAuthor && song.user?.username && (
              <>
                <span>·</span>
                <span className="text-gold-300/70">@{song.user.username}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side: like + comment + menu */}
        <div className="flex items-center gap-1">
          {showLikes && (
            <LikeButton
              songId={song.id}
              initialCount={(song as any).like_count || 0}
              className="px-2 py-1.5 rounded-lg hover:bg-midnight-700/40"
            />
          )}

          <CommentButton
            count={commentCount}
            onClick={() => setCommentsOpen(true)}
            className="px-2 py-1.5 rounded-lg hover:bg-midnight-700/40"
          />

          {showMenu && (
            <SongMenu
              song={{ ...song, is_published: localPublished }}
              isOwner={isOwner}
              onDelete={handleDelete}
              onPublishToggle={handlePublishToggle}
              onShowDetails={(s) => setDetailsSong(s)}
            />
          )}
        </div>
      </div>

      <SongDetailsModal song={detailsSong} onClose={() => setDetailsSong(null)} />

      <CommentsDrawer
        songId={song.id}
        songTitle={song.title}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCountChange={setCommentCount}
      />
    </>
  );
}
