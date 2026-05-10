'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  songId: string;
  initialCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function LikeButton({ songId, initialCount = 0, size = 'sm', className }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .maybeSingle();
      if (data) setLiked(true);
    };
    check();
  }, [songId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      return;
    }

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? Math.max(0, count - 1) : count + 1);

    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        p_user_id: user.id,
        p_song_id: songId,
      });

      if (error) throw error;
      if (data) {
        setLiked(data.liked);
        setCount(data.like_count);
      }
    } catch {
      // Rollback on error
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        'flex items-center gap-1.5 transition-colors',
        liked ? 'text-rose-400' : 'text-gold-300/60 hover:text-gold-200',
        className
      )}
    >
      <Heart className={cn(iconSize, liked && 'fill-rose-400')} />
      {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
    </button>
  );
}
