'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Music, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { GenrePill } from '@/components/genre-pill';
import { cn } from '@/lib/utils';

interface Genre {
  id: number;
  slug: string;
  name_en?: string;
  name_uz?: string;
  name_az?: string;
  name_tr?: string;
}

export default function GenresPage() {
  const t = useTranslations('Onboarding');
  const tg = useTranslations('Genres');
  const locale = useLocale();
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('genres').select('*').order('id');
        if (data) {
          setGenres(data);
        } else {
          // fallback: use translation keys
          const fallback: Genre[] = [
            'pop','rock','hiphop','electronic','jazz','classical','rnb','country',
            'folk','metal','reggae','blues','lofi','ambient','disco','funk',
            'house','techno','indie'
          ].map((slug, i) => ({ id: i + 1, slug }));
          setGenres(fallback);
        }
      } catch {
        const fallback: Genre[] = [
          'pop','rock','hiphop','electronic','jazz','classical','rnb','country',
          'folk','metal','reggae','blues','lofi','ambient','disco','funk',
          'house','techno','indie'
        ].map((slug, i) => ({ id: i + 1, slug }));
        setGenres(fallback);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleGenre = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getGenreName = (g: Genre) => {
    const keyMap: Record<string, string> = {
      en: 'name_en', uz: 'name_uz', az: 'name_az', tr: 'name_tr'
    };
    return (g as any)[keyMap[locale]] || tg(g.slug);
  };

  const handleFinish = async () => {
    if (selected.size < 3) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save selected genres
        await supabase.from('user_genres').delete().eq('user_id', user.id);
        const rows = Array.from(selected).map(genre_id => ({
          user_id: user.id,
          genre_id,
        }));
        await supabase.from('user_genres').insert(rows);
      }
      router.push(`/${locale}/home`);
    } catch (e) {
      console.error(e);
      router.push(`/${locale}/home`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
          </div>

          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold-soft border border-gold-700/30 mb-5">
              <Music className="h-6 w-6 text-gold-400" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-gold-100 mb-3">
              {t('genres.title')}
            </h1>
            <p className="text-gold-300/60 text-sm">
              {selected.size >= 3 ? t('genres.subtitle') : t('genres.minSelected', { count: selected.size })}
            </p>
          </div>

          <div className="surface-glass-bright rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {genres.map((g) => (
                  <GenrePill
                    key={g.id}
                    label={getGenreName(g)}
                    selected={selected.has(g.id)}
                    onClick={() => toggleGenre(g.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gold-900/40 text-gold-300/70 hover:bg-midnight-700/50 hover:text-gold-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </button>
              <button
                onClick={handleFinish}
                disabled={selected.size < 3 || saving}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl',
                  'bg-gradient-gold text-midnight-950 font-semibold',
                  'hover:scale-[1.02] active:scale-[0.98] transition-transform',
                  'glow-gold hover:glow-gold-strong',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>{t('finish')} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
