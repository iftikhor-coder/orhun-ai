'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { SongCard } from '@/components/song-card';
import { UserGenresWidget } from '@/components/user-genres-widget';
import { Song } from '@/lib/store/player';
import { getTimeOfDay, cn } from '@/lib/utils';

export default function HomePage() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [user, setUser] = useState<any>(null);
  const [mySongs, setMySongs] = useState<Song[]>([]);
  const [exploreSongs, setExploreSongs] = useState<Song[]>([]);
  const [tick, setTick] = useState(0);

  const timeOfDay = getTimeOfDay();
  const greeting =
    timeOfDay === 'morning' ? t('greetingMorning') :
    timeOfDay === 'day' ? t('greetingDay') :
    t('greetingEvening');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) return;

      // My recent songs (no is_ready filter — show all)
      const { data: my } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(4);
      if (my) setMySongs(my as Song[]);

      // Community feed
      const { data: pub } = await supabase
        .from('songs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (pub) setExploreSongs(pub as Song[]);
    };
    load();
  }, [tick]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    router.push(`/${locale}/create?prompt=${encodeURIComponent(prompt)}`);
  };

  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] || '';

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-midnight -z-10" />
      <div className="fixed inset-0 orhun-pattern -z-10" />

      <Sidebar />

      <main className="flex-1 min-w-0 pb-32">
        <TopBar />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-10 animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-5xl font-light text-gold-100 mb-2">
              {greeting}{userName && `, ${userName}`}
            </h1>
            <p className="text-gold-300/60 text-base sm:text-lg">{t('promptHint')}</p>
          </div>

          <form onSubmit={handleSubmit} className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-gold rounded-2xl opacity-30 blur" />
              <div className="relative surface-glass-bright rounded-2xl p-2 flex items-center gap-2">
                <div className="pl-4">
                  <Sparkles className="h-5 w-5 text-gold-400" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('promptPlaceholder')}
                  className="flex-1 bg-transparent text-gold-100 placeholder:text-gold-700/60 px-2 py-3 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={prompt.trim().length < 3}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl',
                    'bg-gradient-gold text-midnight-950 font-semibold text-sm',
                    'hover:scale-105 active:scale-95 transition-transform',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                  )}
                >
                  {t('createBtn')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <UserGenresWidget className="mb-12 animate-fade-in-up" variant="sidebar" />

          {mySongs.length > 0 && (
            <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-gold-100">{t('myLibrary')}</h2>
                <button
                  onClick={() => router.push(`/${locale}/create`)}
                  className="text-sm text-gold-300/70 hover:text-gold-200 flex items-center gap-1"
                >
                  {t('viewAll')} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {mySongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onUpdate={() => setTick((t) => t + 1)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl text-gold-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold-400" />
                  {t('exploreTitle')}
                </h2>
                <p className="text-sm text-gold-300/60 mt-1">{t('exploreSubtitle')}</p>
              </div>
              <button
                onClick={() => router.push(`/${locale}/explore`)}
                className="text-sm text-gold-300/70 hover:text-gold-200 flex items-center gap-1"
              >
                {t('viewAll')} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {exploreSongs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {exploreSongs.map((song) => (
                  <SongCard key={song.id} song={song} isOwner={false} showAuthor />
                ))}
              </div>
            ) : (
              <div className="surface-card rounded-xl p-12 text-center">
                <p className="text-gold-700 italic">{t('noSongsYet')}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
