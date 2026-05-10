'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { SongCard } from '@/components/song-card';
import { UserGenresWidget } from '@/components/user-genres-widget';
import { Song } from '@/lib/store/player';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const t = useTranslations('Explore');
  const [songs, setSongs] = useState<Song[]>([]);
  const [filter, setFilter] = useState<'newest' | 'trending'>('newest');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      let query = supabase
        .from('songs')
        .select('*')
        .eq('is_published', true)
        .eq('is_ready', true)
        .is('deleted_at', null);

      query = filter === 'trending'
        ? query.order('like_count', { ascending: false })
        : query.order('created_at', { ascending: false });

      const { data } = await query.limit(50);
      if (data) setSongs(data as Song[]);
    };
    load();
  }, [filter]);

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-midnight -z-10" />
      <div className="fixed inset-0 orhun-pattern -z-10" />

      <Sidebar />

      <main className="flex-1 min-w-0 pb-32">
        <TopBar />

        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="font-display text-4xl text-gold-100 mb-2 flex items-center gap-3">
              <Compass className="h-7 w-7 text-gold-400" />
              {t('title')}
            </h1>
            <p className="text-sm text-gold-300/60">{t('subtitle')}</p>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: 'newest', label: t('newest') },
              { key: 'trending', label: t('trending') },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filter === f.key
                    ? 'bg-gradient-gold text-midnight-950'
                    : 'bg-midnight-700/40 text-gold-300/70 hover:bg-midnight-600/40 border border-gold-900/30'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <UserGenresWidget className="mb-6" variant="horizontal" />

          {songs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {songs.map((song) => (
                <SongCard key={song.id} song={song} isOwner={false} showAuthor />
              ))}
            </div>
          ) : (
            <div className="surface-card rounded-2xl p-16 text-center">
              <TrendingUp className="h-10 w-10 text-gold-700 mx-auto mb-4" />
              <p className="text-gold-300/70 italic">{t('noSongs')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
