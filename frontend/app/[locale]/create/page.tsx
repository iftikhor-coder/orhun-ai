'use client';

import { useEffect, useState, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, Mic, MicOff, User, Users, Loader2, Music, Wand2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { SongCard } from '@/components/song-card';
import { GenrePill } from '@/components/genre-pill';
import { Song, usePlayerStore } from '@/lib/store/player';
import { generateSong } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Genre {
  id: number;
  slug: string;
  name_en?: string;
  name_uz?: string;
  name_az?: string;
  name_tr?: string;
}

function CreateContent() {
  const t = useTranslations('Create');
  const tg = useTranslations('Genres');
  const tErr = useTranslations('Errors');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSong } = usePlayerStore();

  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
  const [lyrics, setLyrics] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [voiceType, setVoiceType] = useState<'male' | 'female' | 'instrumental'>('female');
  const [duration, setDuration] = useState<60 | 120 | 240>(60);
  const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
  const [genres, setGenres] = useState<Genre[]>([]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySongs, setMySongs] = useState<Song[]>([]);
  const [credits, setCredits] = useState<number>(4);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Load genres
      const { data: g } = await supabase.from('genres').select('*').order('id');
      if (g) setGenres(g);
      else {
        const fallback: Genre[] = [
          'pop','rock','hiphop','electronic','jazz','classical','rnb','country',
          'folk','metal','reggae','blues','lofi','ambient','disco','funk',
          'house','techno','indie'
        ].map((slug, i) => ({ id: i + 1, slug }));
        setGenres(fallback);
      }

      // Load my songs
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: songs } = await supabase
          .from('songs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (songs) setMySongs(songs as Song[]);

        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', user.id)
          .single();
        if (profile?.credits_remaining !== undefined) setCredits(profile.credits_remaining);
      }
    };
    load();
  }, []);

  // When instrumental toggles, sync voice
  useEffect(() => {
    if (instrumental) setVoiceType('instrumental');
    else if (voiceType === 'instrumental') setVoiceType('female');
  }, [instrumental]);

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const getGenreName = (g: Genre) => {
    const keyMap: Record<string, string> = {
      en: 'name_en', uz: 'name_uz', az: 'name_az', tr: 'name_tr'
    };
    return (g as any)[keyMap[locale]] || tg(g.slug);
  };

  const handleGenerate = async () => {
    setError(null);
    if (prompt.trim().length < 3) {
      setError(tErr('promptTooShort'));
      return;
    }
    if (credits <= 0) {
      setError(tErr('noCredits'));
      return;
    }

    setGenerating(true);
    try {
      const genreNames = Array.from(selectedGenres)
        .map(id => genres.find(g => g.id === id))
        .filter(Boolean)
        .map(g => g!.slug)
        .join(', ');

      const result = await generateSong({
        prompt: prompt.trim(),
        lyrics: lyrics.trim() || undefined,
        genres: genreNames || undefined,
        voice_type: voiceType,
        duration,
      });

      // Add to my songs list
      const newSong: Song = {
        id: result.song_id,
        title: prompt.slice(0, 50),
        prompt: result.prompt,
        lyrics,
        audio_url: result.audio_url,
        duration_seconds: result.duration,
        voice_type: voiceType,
        is_published: false,
        created_at: new Date().toISOString(),
      };

      setMySongs(prev => [newSong, ...prev]);
      setSong(newSong); // auto-play
      setCredits(c => Math.max(0, c - 1));

      // Clear form
      setPrompt('');
      setLyrics('');
      setSelectedGenres(new Set());
    } catch (e: any) {
      setError(e.message || tErr('generic'));
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = prompt.trim().length >= 3 && credits > 0 && !generating;

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-midnight -z-10" />
      <div className="fixed inset-0 orhun-pattern -z-10" />

      <Sidebar />

      <main className="flex-1 min-w-0 pb-32">
        <TopBar />

        <div className="px-4 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 animate-fade-in-up">
            <h1 className="font-display text-4xl text-gold-100 mb-1">{t('title')}</h1>
            <p className="text-sm text-gold-300/60">{t('subtitle')}</p>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: form */}
            <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              {/* Prompt */}
              <div className="surface-glass-bright rounded-2xl p-5">
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2">
                  {t('promptLabel')}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('promptPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors resize-none"
                />
              </div>

              {/* Voice type */}
              <div className="surface-glass-bright rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-wider text-gold-300/70">
                    {t('voice')}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gold-300/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instrumental}
                      onChange={(e) => setInstrumental(e.target.checked)}
                      className="accent-gold-500"
                    />
                    {t('instrumental')}
                  </label>
                </div>
                <div className={cn('grid grid-cols-2 gap-2', instrumental && 'opacity-40 pointer-events-none')}>
                  <button
                    onClick={() => setVoiceType('male')}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all',
                      voiceType === 'male'
                        ? 'bg-gradient-gold-soft border-gold-700/50 text-gold-200'
                        : 'bg-midnight-800/40 border-gold-900/30 text-gold-300/70 hover:bg-midnight-700/40'
                    )}
                  >
                    <User className="h-4 w-4" />
                    {t('voiceMan')}
                  </button>
                  <button
                    onClick={() => setVoiceType('female')}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all',
                      voiceType === 'female'
                        ? 'bg-gradient-gold-soft border-gold-700/50 text-gold-200'
                        : 'bg-midnight-800/40 border-gold-900/30 text-gold-300/70 hover:bg-midnight-700/40'
                    )}
                  >
                    <Users className="h-4 w-4" />
                    {t('voiceWoman')}
                  </button>
                </div>
              </div>

              {/* Lyrics */}
              {!instrumental && (
                <div className="surface-glass-bright rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-gold-300/70">
                      {t('lyricsLabel')}
                    </label>
                    <span className="text-xs text-gold-700">{t('lyricsHint')}</span>
                  </div>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={t('lyricsPlaceholder')}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/40 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors resize-none font-mono text-sm"
                  />
                </div>
              )}

              {/* Genres */}
              <div className="surface-glass-bright rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-wider text-gold-300/70">
                    {t('genres')}
                  </label>
                  <span className="text-xs text-gold-700">
                    {selectedGenres.size}/3 — {t('genresHint')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <GenrePill
                      key={g.id}
                      label={getGenreName(g)}
                      selected={selectedGenres.has(g.id)}
                      onClick={() => toggleGenre(g.id)}
                      disabled={!selectedGenres.has(g.id) && selectedGenres.size >= 3}
                    />
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="surface-glass-bright rounded-2xl p-5">
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-3">
                  {t('duration')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 60, label: t('durationShort') },
                    { val: 120, label: t('durationMedium') },
                    { val: 240, label: t('durationLong') },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setDuration(opt.val as 60 | 120 | 240)}
                      className={cn(
                        'px-3 py-3 rounded-xl border transition-all text-sm',
                        duration === opt.val
                          ? 'bg-gradient-gold-soft border-gold-700/50 text-gold-200'
                          : 'bg-midnight-800/40 border-gold-900/30 text-gold-300/70 hover:bg-midnight-700/40'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400/90 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl',
                  'bg-gradient-gold text-midnight-950 font-semibold text-base',
                  'hover:scale-[1.01] active:scale-[0.99] transition-transform',
                  'glow-gold hover:glow-gold-strong',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('generating')}
                  </>
                ) : credits <= 0 ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    {t('noCredits')}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    {t('generate')}
                    <span className="text-xs opacity-70">· {t('creditsRequired')}</span>
                  </>
                )}
              </button>

              {generating && (
                <p className="text-center text-xs text-gold-700">{t('generatingHint')}</p>
              )}
            </div>

            {/* Right: songs list */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="surface-glass-bright rounded-2xl p-5 lg:sticky lg:top-24 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Music className="h-5 w-5 text-gold-400" />
                  <h2 className="font-display text-2xl text-gold-100">{t('yourSongs')}</h2>
                  <span className="ml-auto text-xs text-gold-700">{mySongs.length}</span>
                </div>

                {generating && (
                  <div className="surface-card rounded-xl p-4 mb-3 animate-pulse-gold border-gold-700/40">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-gold-soft flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gold-200 font-medium animate-shimmer">
                          {t('generating')}
                        </div>
                        <div className="text-xs text-gold-700 truncate">{prompt}</div>
                      </div>
                    </div>
                  </div>
                )}

                {mySongs.length > 0 ? (
                  <div className="space-y-2">
                    {mySongs.map(song => <SongCard key={song.id} song={song} />)}
                  </div>
                ) : !generating ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-8 w-8 text-gold-700 mx-auto mb-3" />
                    <p className="text-gold-700 italic mb-1">{t('noSongs')}</p>
                    <p className="text-xs text-gold-700/70">{t('noSongsHint')}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950" />}>
      <CreateContent />
    </Suspense>
  );
}
