'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Wand, Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StyleMode } from '@/lib/api';

interface StyleModePickerProps {
  value: StyleMode;
  onChange: (mode: StyleMode) => void;
  disabled?: boolean;
  className?: string;
}

const MODES: Array<{
  slug: StyleMode;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'plain' | 'turkic' | 'fusion';
}> = [
  { slug: 'standard', icon: Sparkles, variant: 'plain' },
  { slug: 'turkic_aura', icon: Wand, variant: 'turkic' },
  { slug: 'turkic_fusion', icon: Globe2, variant: 'fusion' },
];

export function StyleModePicker({
  value,
  onChange,
  disabled,
  className,
}: StyleModePickerProps) {
  const t = useTranslations('StyleMode');

  return (
    <div className={cn('surface-card rounded-2xl p-5', className)}>
      <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-3">
        {t('title')}
      </label>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ slug, icon: Icon, variant }) => {
          const isActive = value === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onChange(slug)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl border transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive && variant === 'plain' &&
                  'bg-midnight-700/60 border-gold-700/60 text-gold-100',
                isActive && variant === 'turkic' &&
                  'bg-gradient-gold text-midnight-950 border-transparent font-semibold shadow-lg shadow-gold-900/40',
                isActive && variant === 'fusion' &&
                  'bg-gradient-to-r from-purple-700 via-gold-500 to-amber-600 text-midnight-950 border-transparent font-semibold shadow-lg shadow-purple-900/40',
                !isActive && variant === 'plain' &&
                  'bg-midnight-800/40 border-gold-900/30 text-gold-300/80 hover:bg-midnight-700/40',
                !isActive && variant === 'turkic' &&
                  'bg-gradient-gold-soft border-gold-700/40 text-gold-200 hover:bg-midnight-600/40',
                !isActive && variant === 'fusion' &&
                  'bg-gradient-to-r from-purple-900/30 via-gold-900/30 to-amber-900/30 border-purple-700/40 text-gold-200 hover:from-purple-800/40 hover:to-amber-800/40'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs leading-tight text-center">
                {t(`modes.${slug}`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {value !== 'standard' && (
        <p className="text-xs text-gold-300/60 italic mt-3 px-1">
          {t(`hints.${value}`)}
        </p>
      )}
    </div>
  );
}
