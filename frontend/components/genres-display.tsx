'use client';

import { useTranslations } from 'next-intl';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenresDisplayProps {
  genreSlugs?: string | null;  // comma-separated slugs from songs.genres
  variant?: 'pills' | 'inline';
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function GenresDisplay({
  genreSlugs,
  variant = 'pills',
  size = 'sm',
  showIcon = false,
  className,
}: GenresDisplayProps) {
  const tg = useTranslations('Genres');

  if (!genreSlugs) return null;

  const slugs = genreSlugs
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) return null;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const translate = (slug: string): string => {
    try {
      return tg(slug as any) || slug;
    } catch {
      return slug;
    }
  };

  if (variant === 'inline') {
    return (
      <span className={cn('text-gold-300/70', className)}>
        {showIcon && <Tag className="inline h-3 w-3 mr-1 -mt-0.5" />}
        {slugs.map(translate).join(' · ')}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5 items-center', className)}>
      {showIcon && <Tag className="h-3.5 w-3.5 text-gold-400" />}
      {slugs.map((slug) => (
        <span
          key={slug}
          className={cn(
            'rounded-full bg-gradient-gold-soft border border-gold-700/30 text-gold-200 font-medium',
            sizeClasses[size]
          )}
        >
          {translate(slug)}
        </span>
      ))}
    </div>
  );
}
