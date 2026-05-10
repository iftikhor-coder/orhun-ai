'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/lib/store/notifications';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  user_id: string;
  song_id: string;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

interface CommentsDrawerProps {
  songId: string;
  songTitle: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export function CommentsDrawer({
  songId,
  songTitle,
  open,
  onClose,
  onCountChange,
}: CommentsDrawerProps) {
  const t = useTranslations('Comments');
  const { notify } = useNotifications();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load on open
  useEffect(() => {
    if (!open) return;
    loadComments();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [open, songId]);

  const loadComments = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    const { data } = await supabase
      .from('comments')
      .select('id, user_id, song_id, content, created_at, user:profiles(username, avatar_url, full_name)')
      .eq('song_id', songId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setComments(data as any);
    setLoading(false);
  };

  const handlePost = async () => {
    const text = content.trim();
    if (!text || posting) return;

    setPosting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      notify({ type: 'warning', title: t('loginRequired') });
      setPosting(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('add_comment', {
        p_user_id: user.id,
        p_song_id: songId,
        p_content: text,
      });

      if (error || !data?.success) {
        notify({ type: 'error', title: t('postFailed') });
        return;
      }

      setContent('');
      await loadComments();
      if (typeof data.comment_count === 'number') {
        onCountChange?.(data.comment_count);
      }
    } catch (e: any) {
      notify({ type: 'error', title: t('postFailed'), message: e?.message });
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.rpc('delete_comment', {
      p_user_id: user.id,
      p_comment_id: commentId,
    });

    if (error || !data?.success) {
      notify({ type: 'error', title: t('deleteFailed') });
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (typeof data.comment_count === 'number') {
      onCountChange?.(data.comment_count);
    }
    notify({ type: 'success', title: t('deleted') });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[58] bg-midnight-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[59] w-full sm:w-[440px] max-w-full',
          'surface-glass-bright border-l border-gold-900/30',
          'flex flex-col shadow-2xl shadow-black/60',
          'animate-slide-in-right'
        )}
      >
        {/* Header */}
        <div className="border-b border-gold-900/30 px-5 py-4 flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-gold-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl text-gold-100 leading-tight">
              {t('title')}
            </h2>
            <p className="text-xs text-gold-700 truncate mt-0.5">
              {songTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gold-300/60 hover:text-gold-200 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-10 w-10 text-gold-700 mx-auto mb-3 opacity-50" />
              <p className="text-gold-700 text-sm italic">{t('empty')}</p>
              <p className="text-xs text-gold-700/70 mt-1">{t('beTheFirst')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => {
                const isMine = c.user_id === currentUserId;
                const displayName =
                  c.user?.username || c.user?.full_name || 'Anonymous';
                const initials = (displayName[0] || 'U').toUpperCase();
                return (
                  <li
                    key={c.id}
                    className="surface-card rounded-xl p-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-gold-700/30 flex-shrink-0">
                        {c.user?.avatar_url ? (
                          <img
                            src={c.user.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-midnight-950 text-xs font-semibold">
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gold-100 truncate">
                            {displayName}
                            {isMine && (
                              <span className="text-xs text-gold-700 ml-1.5">
                                ({t('you')})
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gold-700">
                            {timeAgo(c.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gold-200/90 break-words whitespace-pre-wrap">
                          {c.content}
                        </p>
                      </div>

                      {isMine && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/70 hover:text-red-300 flex-shrink-0"
                          aria-label={t('delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gold-900/30 p-4 surface-glass">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              rows={2}
              maxLength={1000}
              className="flex-1 px-3 py-2 rounded-xl bg-midnight-800/60 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 resize-none text-sm"
            />
            <button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className={cn(
                'h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center',
                'bg-gradient-gold text-midnight-950',
                'hover:scale-105 active:scale-95 transition-transform',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
              aria-label={t('post')}
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[10px] text-gold-700">
              {t('hint')}
            </span>
            <span className="text-[10px] text-gold-700 tabular-nums">
              {content.length}/1000
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
