'use client';

import { useTranslations } from 'next-intl';
import { Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { box: 'h-7 w-7',  icon: 'h-3.5 w-3.5', name: 'text-lg',  tagline: 'text-[9px]'  },
  md: { box: 'h-9 w-9',  icon: 'h-4 w-4',     name: 'text-2xl', tagline: 'text-[10px]' },
  lg: { box: 'h-12 w-12', icon: 'h-6 w-6',    name: 'text-3xl', tagline: 'text-xs'     },
};

export function Logo({ size = 'md', className }: LogoProps) {
  const t = useTranslations('Brand');
  const s = SIZES[size];

  return (
    <>
      <style>{`
        @keyframes orhun-fire-glow {
          0%, 100% {
            text-shadow:
              0 0 4px rgba(212, 165, 116, 0.4),
              0 0 8px rgba(212, 165, 116, 0.25);
            color: #c8a574;
            filter: brightness(0.92);
          }
          25% {
            text-shadow:
              0 0 10px rgba(245, 200, 130, 0.6),
              0 0 20px rgba(245, 200, 130, 0.4);
            color: #e0b87a;
            filter: brightness(1.1);
          }
          50% {
            text-shadow:
              0 0 16px rgba(255, 210, 130, 0.95),
              0 0 32px rgba(255, 200, 100, 0.65),
              0 0 48px rgba(255, 170, 60, 0.4),
              0 0 64px rgba(255, 130, 30, 0.25);
            color: #ffd28a;
            filter: brightness(1.35);
          }
          75% {
            text-shadow:
              0 0 10px rgba(245, 200, 130, 0.6),
              0 0 20px rgba(245, 200, 130, 0.4);
            color: #e0b87a;
            filter: brightness(1.1);
          }
        }

        @keyframes orhun-icon-glow {
          0%, 100% {
            box-shadow:
              0 0 6px rgba(212, 165, 116, 0.25),
              inset 0 0 4px rgba(212, 165, 116, 0.15);
          }
          50% {
            box-shadow:
              0 0 14px rgba(255, 200, 100, 0.6),
              0 0 28px rgba(255, 170, 60, 0.35),
              inset 0 0 8px rgba(255, 210, 130, 0.3);
          }
        }

        .orhun-fire-glow {
          animation: orhun-fire-glow 5s ease-in-out infinite;
          will-change: text-shadow, filter, color;
        }

        .orhun-icon-glow {
          animation: orhun-icon-glow 5s ease-in-out infinite;
        }
      `}</style>

      <div className={cn('flex items-center gap-3', className)}>
        <div
          className={cn(
            'rounded-full bg-gradient-gold-soft border border-gold-700/40',
            'flex items-center justify-center flex-shrink-0',
            'orhun-icon-glow',
            s.box
          )}
        >
          <Hexagon className={cn('text-gold-400', s.icon)} />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display font-light orhun-fire-glow tracking-wide',
              s.name
            )}
          >
            {t('name')}
          </span>
          <span
            className={cn(
              'uppercase tracking-[0.25em] text-gold-700/80 mt-1.5',
              s.tagline
            )}
          >
            {t('tagline')}
          </span>
        </div>
      </div>
    </>
  );
}
