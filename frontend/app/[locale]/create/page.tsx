'use client';

import { useEffect, useState, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles, User, Users, Loader2, Music, Wand2, AlertCircle, Wand,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { SongCard } from '@/components/song-card';
import { GenrePill } from '@/components/genre-pill';
import { Song, usePlayerStore } from '@/lib/store/player';
import { generateSong, GenerateError, VoiceType } from '@/lib/api';
import { useNotifications } from '@/lib/store/notifications';
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
  const tn = useTranslations('Notify');
  const tErr = useTranslations('Errors');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSong } = usePlayerStore();
  const { notify } = useNotifications();

  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
  const [lyrics, setLyrics] = useState('');
  const [voiceType, setVoiceType] = useState<VoiceType>('female');
  const [duration, setDuration] = useState<60 | 120 | 240>(60);
  const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
  const [genres, setGenres] = useState<Genre[]>([]);

  const [generating, setGenerating] = useState(false);
  const [mySongs, setMySongs] = useState<Song[]>([]);
  const [credits, setCredits] = useState<number>(4);
  const [resetAt, setResetAt] = useState<Date | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const reload = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: songs } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (songs) setMySongs(songs as Song[]);
  };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: g } = await supabase.from('genres').select('*').order('id');
      if (g && g.length > 0) {
        setGenres(g);
      } else {
        const fallback: Genre[] = [
          'pop','rock','hiphop','electronic','jazz','classical','rnb','country',
          'folk','metal','reggae','blues','lofi','ambient','disco','funk',
          'house','techno','indie',
        ].map((slug, i) => ({ id: i + 1, slug }));
        setGenres(fallback);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: songs } = await supabase
          .from('songs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (songs) setMySongs(songs as Song[]);

        try {
          const { data: cr } = await supabase.rpc('refresh_credits_if_due', { p_user_id: user.id });
          if (cr) {
            setCredits(cr.credits_remaining ?? 4);
            if (cr.reset_at) setResetAt(new Date(cr.reset_at));
          }
        } catch {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits_remaining, credits_reset_at')
            .eq('id', user.id)
            .maybeSingle();
          if (profile) {
            setCredits(profile.credits_remaining ?? 4);
            if (profile.credits_reset_at) setResetAt(new Date(profile.credits_reset_at));
          }
        }
      }
    };
    load();
  }, [refreshTick]);

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const getGenreName = (g: Genre) => {
    const keyMap: Record<string, string> = {
      en: 'name_en', uz: 'name_uz', az: 'name_az', tr: 'name_tr',
    };
    return (g as any)[keyMap[locale]] || tg(g.slug as any);
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) {
      notify({ type: 'warning', title: tErr('promptTooShort') });
      return;
    }
    if (credits <= 0) {
      notify({
        type: 'warning',
        title: tn('noCreditsTitle'),
        message: resetAt ? tn('noCreditsResetIn', { hours: hoursUntil(resetAt) }) : tErr('noCredits'),
      });
      return;
    }

    setGenerating(true);
    try {
      const genreNames = Array.from(selectedGenres)
        .map((id) => genres.find((g) => g.id === id))
        .filter(Boolean)
        .map((g) => g!.slug)
        .join(', ');

      notify({
        type: 'info',
        title: tn('generatingTitle'),
        message: tn('generatingMessage'),
        duration: 4000,
      });

      const result = await generateSong({
        prompt: prompt.trim(),
        lyrics: lyrics.trim() || undefined,
        genres: genreNames || undefined,
        voice_type: voiceType,
        duration,
      });

      // Update local state
      setCredits(result.credits_remaining);

      // Reload songs from DB to get fresh data
      await reload();

      // Auto-play
      const playable: Song = {
        id: result.song_id,
        title: prompt.slice(0, 60),
        prompt: result.prompt,
        lyrics,
        audio_url: result.audio_url,
        duration_seconds: result.duration,
        voice_type: voiceType,
        is_published: false,
        created_at: new Date().toISOString(),
      };
      setSong(playable);

      notify({
        type: 'success',
        title: tn('successTitle'),
        message: tn('successMessage', { credits: result.credits_remaining }),
      });

      // Clear form
      setPrompt('');
      setLyrics('');
      setSelectedGenres(new Set());
    } catch (e: any) {
      if (e instanceof GenerateError && e.noCredits) {
        const reset = e.resetAt ? new Date(e.resetAt) : null;
        if (reset) setResetAt(reset);
        setCredits(0);
        notify({
          type: 'warning',
          title: tn('noCreditsTitle'),
          message: reset ? tn('noCreditsResetIn', { hours: hoursUntil(reset) }) : tErr('noCredits'),
        });
      } else {
        notify({
          type: 'error',
          title: tn('errorTitle'),
          message: e.message || tErr('generic'),
        });
      }
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
          <div className="mb-6 animate-fade-in-up">
            <h1 className="font-display text-4xl text-gold-100 mb-1">{t('title')}</h1>
            <p className="text-sm text-gold-300/60">{t('subtitle')}</p>
          </div>

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

              {/* Voice type — 4 options including Turkic Aura */}
              <div className="surface-glass-bright rounded-2xl p-5">
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-3">
                  {t('voice')}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <VoiceButton
                    icon={User}
                    label={t('voiceMan')}
                    active={voiceType === 'male'}
                    onClick={() => setVoiceType('male')}
                  />
                  <VoiceButton
                    icon={Users}
                    label={t('voiceWoman')}
                    active={voiceType === 'female'}
                    onClick={() => setVoiceType('female')}
                  />
                  <VoiceButton
                    icon={Music}
                    label={t('voiceInstrumental')}
                    active={voiceType === 'instrumental'}
                    onClick={() => setVoiceType('instrumental')}
                  />
                  <button
                    onClick={() => setVoiceType('turkic_aura')}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all relative overflow-hidden',
                      voiceType === 'turkic_aura'
                        ? 'bg-gradient-gold text-midnight-950 border-transparent font-semibold shadow-lg shadow-gold-900/40'
                        : 'bg-gradient-gold-soft border-gold-700/40 text-gold-200 hover:bg-midnight-600/40'
                    )}
                  >
                    <Wand className="h-4 w-4" />
                    <span>Turkic Aura</span>
                    <span className="text-xs opacity-70">✦</span>
                  </button>
                </div>
                {voiceType === 'turkic_aura' && (
                  <div className="text-xs text-gold-300/60 italic mt-2 px-1">
                    {t('turkicAuraHint')}
                  </div>
                )}
              </div>

              {/* Lyrics */}
              {voiceType !== 'instrumental' && (
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
                  ].map((opt) => (
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
                    {mySongs.map((song) => (
                      <SongCard key={song.id} song={song} onUpdate={() => setRefreshTick((t) => t + 1)} />
                    ))}
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

function VoiceButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all',
        active
          ? 'bg-gradient-gold-soft border-gold-700/50 text-gold-200'
          : 'bg-midnight-800/40 border-gold-900/30 text-gold-300/70 hover:bg-midnight-700/40'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function hoursUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 3_600_000));
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950" />}>
      <CreateContent />
    </Suspense>
  );
}
