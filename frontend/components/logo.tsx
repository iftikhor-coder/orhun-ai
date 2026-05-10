'use client';

import { useTranslations } from 'next-intl';
import { Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { box: 'h-7 w-7', icon: 'h-3.5 w-3.5', name: 'text-lg', tagline: 'text-[9px]' },
  md: { box: 'h-9 w-9', icon: 'h-4 w-4', name: 'text-2xl', tagline: 'text-[10px]' },
  lg: { box: 'h-12 w-12', icon: 'h-6 w-6', name: 'text-3xl', tagline: 'text-xs' },
};

export function Logo({ size = 'md', className }: LogoProps) {
  const t = useTranslations('Brand');
  const s = SIZES[size];

  return (
    <>
      <style>{`
        /* === REAL FIRE TEXT GLOW === */
        @keyframes orhun-fire-text {
          0% {
            text-shadow:
              0 0 4px rgba(255, 180, 80, 0.5),
              0 0 8px rgba(255, 140, 40, 0.3),
              0 -2px 6px rgba(255, 100, 20, 0.2);
            color: #d4a574;
            filter: brightness(0.95) hue-rotate(-5deg);
          }
          15% {
            text-shadow:
              0 0 6px rgba(255, 200, 100, 0.7),
              0 0 14px rgba(255, 160, 50, 0.5),
              0 -3px 10px rgba(255, 110, 30, 0.4);
            color: #e8b878;
            filter: brightness(1.05) hue-rotate(0deg);
          }
          30% {
            text-shadow:
              0 0 12px rgba(255, 220, 130, 0.85),
              0 0 24px rgba(255, 180, 70, 0.65),
              0 -5px 18px rgba(255, 130, 40, 0.55),
              0 -8px 24px rgba(255, 90, 20, 0.35);
            color: #ffc88c;
            filter: brightness(1.2);
          }
          48%, 52% {
            text-shadow:
              0 0 20px rgba(255, 240, 180, 1),
              0 0 40px rgba(255, 200, 100, 0.95),
              0 0 60px rgba(255, 160, 50, 0.7),
              0 -6px 30px rgba(255, 120, 30, 0.6),
              0 -12px 40px rgba(255, 80, 10, 0.45);
            color: #ffe8b0;
            filter: brightness(1.5) saturate(1.3);
          }
          70% {
            text-shadow:
              0 0 10px rgba(255, 210, 120, 0.7),
              0 0 20px rgba(255, 170, 60, 0.5),
              0 -4px 14px rgba(255, 120, 30, 0.35);
            color: #f0c080;
            filter: brightness(1.08);
          }
          85% {
            text-shadow:
              0 0 6px rgba(255, 190, 90, 0.55),
              0 0 12px rgba(255, 150, 45, 0.35),
              0 -2px 8px rgba(255, 110, 25, 0.25);
            color: #e0b478;
            filter: brightness(0.98);
          }
          100% {
            text-shadow:
              0 0 4px rgba(255, 180, 80, 0.5),
              0 0 8px rgba(255, 140, 40, 0.3),
              0 -2px 6px rgba(255, 100, 20, 0.2);
            color: #d4a574;
            filter: brightness(0.95) hue-rotate(-5deg);
          }
        }

        @keyframes orhun-fire-icon {
          0% {
            box-shadow:
              0 0 6px rgba(255, 160, 60, 0.3),
              inset 0 0 4px rgba(255, 170, 70, 0.2);
          }
          30% {
            box-shadow:
              0 0 12px rgba(255, 190, 80, 0.5),
              0 0 24px rgba(255, 150, 50, 0.25),
              inset 0 0 8px rgba(255, 200, 100, 0.35);
          }
          48%, 52% {
            box-shadow:
              0 0 18px rgba(255, 230, 150, 0.9),
              0 0 36px rgba(255, 190, 80, 0.6),
              0 0 60px rgba(255, 140, 40, 0.4),
              inset 0 0 14px rgba(255, 230, 160, 0.6);
          }
          70% {
            box-shadow:
              0 0 10px rgba(255, 180, 70, 0.45),
              0 0 20px rgba(255, 150, 50, 0.2),
              inset 0 0 6px rgba(255, 190, 90, 0.3);
          }
          100% {
            box-shadow:
              0 0 6px rgba(255, 160, 60, 0.3),
              inset 0 0 4px rgba(255, 170, 70, 0.2);
          }
        }

        @keyframes orhun-fire-icon-inner {
          0%, 100% {
            color: #d4a574;
            filter: drop-shadow(0 0 2px rgba(255, 160, 60, 0.4));
          }
          48%, 52% {
            color: #ffe8b0;
            filter: drop-shadow(0 0 8px rgba(255, 220, 130, 0.9))
                    drop-shadow(0 0 16px rgba(255, 180, 70, 0.6));
          }
        }

        @keyframes orhun-spark-1 {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
          5% { opacity: 1; transform: translate(-2px, -3px) scale(1); }
          50% { opacity: 0.4; transform: translate(-6px, -16px) scale(0.6); }
          70% { opacity: 0; transform: translate(-8px, -22px) scale(0.2); }
        }
        @keyframes orhun-spark-2 {
          0%, 30%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
          35% { opacity: 1; transform: translate(3px, -2px) scale(1); }
          75% { opacity: 0.3; transform: translate(7px, -18px) scale(0.5); }
          90% { opacity: 0; transform: translate(9px, -24px) scale(0.15); }
        }
        @keyframes orhun-spark-3 {
          0%, 60%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
          65% { opacity: 1; transform: translate(0, -2px) scale(1); }
          90% { opacity: 0.2; transform: translate(2px, -20px) scale(0.4); }
        }

        .orhun-fire-text {
          animation: orhun-fire-text 5s ease-in-out infinite;
          will-change: text-shadow, filter, color;
        }
        .orhun-fire-icon-bg {
          animation: orhun-fire-icon 5s ease-in-out infinite;
          will-change: box-shadow;
        }
        .orhun-fire-icon-inner {
          animation: orhun-fire-icon-inner 5s ease-in-out infinite;
          will-change: color, filter;
        }
        .orhun-spark {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffe8b0 0%, #ffaa40 50%, transparent 100%);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .orhun-spark-1 { animation: orhun-spark-1 5s ease-out infinite; }
        .orhun-spark-2 { animation: orhun-spark-2 5s ease-out infinite; }
        .orhun-spark-3 { animation: orhun-spark-3 5s ease-out infinite; }
      `}</style>

      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'rounded-full bg-gradient-gold-soft border border-gold-700/40',
              'flex items-center justify-center',
              'orhun-fire-icon-bg',
              s.box
            )}
          >
            <Hexagon className={cn('orhun-fire-icon-inner', s.icon)} />
          </div>
          <span className="orhun-spark orhun-spark-1" style={{ left: '20%', bottom: '15%' }} />
          <span className="orhun-spark orhun-spark-2" style={{ right: '15%', bottom: '20%' }} />
          <span className="orhun-spark orhun-spark-3" style={{ left: '45%', bottom: '10%' }} />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display font-light orhun-fire-text tracking-wide',
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
