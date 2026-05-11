'use client';

import { useTranslations } from 'next-intl';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Instrument } from '@/lib/api';

interface InstrumentsPickerProps {
  selected: Set<Instrument>;
  onChange: (s: Set<Instrument>) => void;
  disabled?: boolean;
  className?: string;
}

const INSTRUMENTS: Array<{ slug: Instrument; emoji: string }> = [
  { slug: 'saz', emoji: '🪕' },
  { slug: 'baglama', emoji: '🎻' },
  { slug: 'oud', emoji: '🎶' },
  { slug: 'kanun', emoji: '🎵' },
  { slug: 'ney', emoji: '🎼' },
  { slug: 'kemence', emoji: '🎻' },
  { slug: 'davul', emoji: '🥁' },
];

export function InstrumentsPicker({
  selected,
  onChange,
  disabled,
  className,
}: InstrumentsPickerProps) {
  const t = useTranslations('Instruments');

  const toggle = (slug: Instrument) => {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onChange(next);
  };

  return (
    <div className={cn('surface-card rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4 text-gold-400" />
          <h3 className="text-xs uppercase tracking-wider text-gold-700">
            {t('title')}
          </h3>
        </div>
        <span className="text-[10px] text-gold-700/60 italic">
          {t('optional')}
        </span>
      </div>
      <p className="text-xs text-gold-700/70 mb-3">{t('hint')}</p>

      <div className="flex flex-wrap gap-2">
        {INSTRUMENTS.map(({ slug, emoji }) => {
          const isSelected = selected.has(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => toggle(slug)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                'text-sm transition-all border',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'bg-gradient-gold-soft border-gold-500/60 text-gold-100 glow-gold'
                  : 'bg-midnight-800/40 border-gold-900/30 text-gold-300/80 hover:bg-midnight-700/60 hover:border-gold-700/40'
              )}
            >
              <span>{emoji}</span>
              <span>{t(slug)}</span>
              {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <p className="text-[11px] text-gold-500 mt-3">
          {t('selected', { count: selected.size })}
        </p>
      )}
    </div>
  );
}
