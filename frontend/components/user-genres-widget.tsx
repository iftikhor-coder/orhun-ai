'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface UserGenresWidgetProps {
  variant?: 'sidebar' | 'horizontal';
  className?: string;
}

interface GenreRow {
  id: number;
  slug: string;
  name_en?: string;
  name_uz?: string;
  name_az?: string;
  name_tr?: string;
}

export function UserGenresWidget({ variant = 'sidebar', className }: UserGenresWidgetProps) {
  const t = useTranslations('UserGenres');
  const tg = useTranslations('Genres');
  const locale = useLocale();
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_genres')
        .select('genre:genres(*)')
        .eq('user_id', user.id);

      if (data) {
        const rows = (data as any[])
          .map((r) => r.genre)
          .filter(Boolean) as GenreRow[];
        setGenres(rows);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getName = (g: GenreRow): string => {
    const map: Record<string, string> = {
      en: 'name_en',
      uz: 'name_uz',
      az: 'name_az',
      tr: 'name_tr',
    };
    const dbName = (g as any)[map[locale]];
    if (dbName) return dbName;
    try {
      return tg(g.slug as any) || g.slug;
    } catch {
      return g.slug;
    }
  };

  if (loading || genres.length === 0) return null;

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {genres.map((g) => (
          <span
            key={g.id}
            className="px-3 py-1.5 rounded-full bg-gradient-gold-soft border border-gold-700/30 text-xs text-gold-200 font-medium"
          >
            {getName(g)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'surface-glass-bright rounded-2xl p-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-gold-400" />
        <h3 className="text-sm font-medium text-gold-200">
          {t('title')}
        </h3>
        <span className="ml-auto text-xs text-gold-700">{genres.length}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {genres.map((g) => (
          <span
            key={g.id}
            className="px-2.5 py-1 rounded-full bg-midnight-700/40 border border-gold-900/30 text-xs text-gold-200 hover:bg-midnight-600/40 transition-colors"
          >
            {getName(g)}
          </span>
        ))}
      </div>
    </div>
  );
}
