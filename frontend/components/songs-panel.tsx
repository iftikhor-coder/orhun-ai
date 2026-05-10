'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Music, Sparkles, History, Trash2, RotateCcw, X, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/lib/store/player';
import { SongCard } from './song-card';
import { cn } from '@/lib/utils';

type Tab = 'active' | 'history';

interface SongsPanelProps {
  className?: string;
}

export function SongsPanel({ className }: SongsPanelProps) {
  const t = useTranslations('SongsPanel');
  const [tab, setTab] = useState<Tab>('active');
  const [active, setActive] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Active: not deleted
      const { data: activeData } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // History: soft-deleted, not yet auto-deleted
      const { data: historyData } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      setActive((activeData as Song[]) || []);
      setHistory((historyData as Song[]) || []);
    } catch (e) {
      console.error('Failed to load songs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // Auto-poll while any song is generating
  useEffect(() => {
    const hasGenerating = active.some(
      (s: any) => s.status === 'generating' || (!s.is_ready && !s.status)
    );

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (hasGenerating) {
      pollIntervalRef.current = setInterval(() => {
        loadSongs();
      }, 4000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [active, loadSongs]);

  // Listen for song-changed events from create page
  useEffect(() => {
    const handler = () => loadSongs();
    window.addEventListener('orhun:songs-updated', handler);
    return () => window.removeEventListener('orhun:songs-updated', handler);
  }, [loadSongs]);

  const handleSoftDelete = async (songId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    setActive((prev) => prev.filter((s) => s.id !== songId));

    try {
      await supabase.rpc('soft_delete_song', {
        p_user_id: user.id,
        p_song_id: songId,
      });
      await loadSongs();
    } catch (e) {
      console.error(e);
      await loadSongs();
    }
  };

  const handleRestore = async (songId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setHistory((prev) => prev.filter((s) => s.id !== songId));

    try {
      await supabase.rpc('restore_song', {
        p_user_id: user.id,
        p_song_id: songId,
      });
      await loadSongs();
    } catch (e) {
      console.error(e);
      await loadSongs();
    }
  };

  const handleDeleteForever = async (songId: string) => {
    if (!confirm(t('deleteForeverConfirm'))) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setHistory((prev) => prev.filter((s) => s.id !== songId));

    try {
      await supabase.rpc('delete_song_forever', {
        p_user_id: user.id,
        p_song_id: songId,
      });
      await loadSongs();
    } catch (e) {
      console.error(e);
      await loadSongs();
    }
  };

  const daysUntilAutoDelete = (autoDeleteAt: string | null | undefined): number => {
    if (!autoDeleteAt) return 15;
    const ms = new Date(autoDeleteAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const visibleList = tab === 'active' ? active : history;

  return (
    <div className={cn('surface-card rounded-2xl p-5', className)}>
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-gold-400" />
          <h2 className="text-lg font-display text-gold-100">{t('yourSongs')}</h2>
          <span className="text-xs text-gold-700 ml-1">
            ({tab === 'active' ? active.length : history.length})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-midnight-900/40 rounded-lg">
        <button
          onClick={() => setTab('active')}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all',
            'flex items-center justify-center gap-1.5',
            tab === 'active'
              ? 'bg-gradient-gold-soft text-gold-100 border border-gold-700/30'
              : 'text-gold-700 hover:text-gold-400 hover:bg-midnight-800/40'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t('active')}
          {active.length > 0 && (
            <span className="text-[10px] opacity-70">({active.length})</span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all',
            'flex items-center justify-center gap-1.5',
            tab === 'history'
              ? 'bg-gradient-gold-soft text-gold-100 border border-gold-700/30'
              : 'text-gold-700 hover:text-gold-400 hover:bg-midnight-800/40'
          )}
        >
          <History className="h-3.5 w-3.5" />
          {t('history')}
          {history.length > 0 && (
            <span className="text-[10px] opacity-70">({history.length})</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-gold-700 text-sm">
            <Music className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
            {t('loading')}
          </div>
        ) : visibleList.length === 0 ? (
          <div className="py-12 text-center">
            {tab === 'active' ? (
              <>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold-soft border border-gold-700/30 mb-3">
                  <Sparkles className="h-5 w-5 text-gold-400" />
                </div>
                <p className="text-sm text-gold-300 italic">{t('noSongs')}</p>
                <p className="text-xs text-gold-700 mt-1">{t('noSongsHint')}</p>
              </>
            ) : (
              <>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-midnight-800/60 border border-gold-900/30 mb-3">
                  <History className="h-5 w-5 text-gold-700" />
                </div>
                <p className="text-sm text-gold-300 italic">{t('historyEmpty')}</p>
                <p className="text-xs text-gold-700 mt-1">{t('historyEmptyHint')}</p>
              </>
            )}
          </div>
        ) : tab === 'active' ? (
          visibleList.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isOwner={true}
              onUpdate={loadSongs}
            />
          ))
        ) : (
          // History view: each song with big trash + days remaining
          visibleList.map((song) => {
            const days = daysUntilAutoDelete((song as any).auto_delete_at);
            return (
              <div
                key={song.id}
                className="surface-card p-3 rounded-xl border border-gold-900/30 bg-midnight-900/40"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-midnight-800/60 border border-gold-900/30 flex items-center justify-center">
                    <Music className="h-5 w-5 text-gold-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gold-200/70 truncate">
                      {song.title}
                    </div>
                    <div className="text-[11px] text-gold-700 truncate mt-0.5">
                      {song.prompt?.slice(0, 80)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400/80">
                      <Clock className="h-3 w-3" />
                      <span>
                        {days > 0
                          ? t('autoDeleteIn', { days })
                          : t('autoDeleteSoon')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Big delete + restore buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleRestore(song.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gold-900/20 border border-gold-700/40 text-gold-300 hover:bg-gold-900/40 hover:text-gold-200 transition-colors text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('restore')}
                  </button>
                  <button
                    onClick={() => handleDeleteForever(song.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-rose-950/30 border border-rose-700/40 text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History footer hint */}
      {tab === 'history' && history.length > 0 && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
          <p className="text-[11px] text-amber-300/80 flex items-start gap-1.5">
            <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{t('historyHint')}</span>
          </p>
        </div>
      )}
    </div>
  );
}
