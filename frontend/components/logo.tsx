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
        /* ============================================================
         *  XATOLIK YECHIMI (3): HAQIQIY OLOV ANIMATSIYASI
         *  ============================================================
         *  Eski versiyada color/text-shadow zaif edi va olov koʻrinmasdi.
         *  Yangi yondashuv:
         *    1) Matn — gradient (sariq → toʻq qizil), background-clip: text
         *    2) Ustidan koʻp qatlamli drop-shadow filter (8+ qatlam)
         *    3) Hexagon icon — radial gradient olov fon + glow box-shadow
         *    4) 8 ta uchqun (oldindagi 3 ta o'rniga) turli yoʻnalishlarda
         *    5) Engil skewX/scale tebranish — alanga harakati
         *  Tsikl: 5 soniya. 50% da maksimum portlash.
         * =========================================================== */

        @keyframes orhun-flame-text {
          0%, 100% {
            filter:
              drop-shadow(0 0 3px rgba(255, 200, 100, 0.55))
              drop-shadow(0 0 8px rgba(255, 150, 50, 0.45))
              drop-shadow(0 -2px 10px rgba(255, 100, 20, 0.35));
            transform: translateY(0) skewX(0deg);
          }
          15% {
            filter:
              drop-shadow(0 0 4px rgba(255, 220, 130, 0.75))
              drop-shadow(0 0 14px rgba(255, 170, 60, 0.6))
              drop-shadow(0 -3px 16px rgba(255, 120, 30, 0.5));
            transform: translateY(-0.5px) skewX(-0.4deg);
          }
          30% {
            filter:
              drop-shadow(0 0 6px rgba(255, 240, 180, 0.95))
              drop-shadow(0 0 18px rgba(255, 200, 100, 0.75))
              drop-shadow(0 -4px 22px rgba(255, 140, 40, 0.65))
              drop-shadow(0 -8px 30px rgba(255, 80, 20, 0.45));
            transform: translateY(-1px) skewX(0.5deg) scale(1.012);
          }
          50% {
            filter:
              drop-shadow(0 0 8px rgba(255, 250, 220, 1))
              drop-shadow(0 0 24px rgba(255, 220, 130, 0.9))
              drop-shadow(0 -5px 28px rgba(255, 160, 50, 0.8))
              drop-shadow(0 -10px 38px rgba(255, 100, 30, 0.6))
              drop-shadow(0 -16px 52px rgba(200, 30, 10, 0.4));
            transform: translateY(-1.5px) skewX(-0.5deg) scale(1.018);
          }
          70% {
            filter:
              drop-shadow(0 0 5px rgba(255, 230, 140, 0.75))
              drop-shadow(0 0 16px rgba(255, 180, 70, 0.6))
              drop-shadow(0 -4px 20px rgba(255, 130, 35, 0.5))
              drop-shadow(0 -8px 28px rgba(200, 50, 10, 0.32));
            transform: translateY(-1px) skewX(0.3deg);
          }
          85% {
            filter:
              drop-shadow(0 0 4px rgba(255, 210, 120, 0.62))
              drop-shadow(0 0 10px rgba(255, 160, 55, 0.42))
              drop-shadow(0 -3px 14px rgba(255, 110, 25, 0.36));
            transform: translateY(-0.5px) skewX(-0.2deg);
          }
        }

        @keyframes orhun-flame-icon-bg {
          0%, 100% {
            background: radial-gradient(circle at 50% 65%,
              rgba(255, 170, 60, 0.4) 0%,
              rgba(220, 110, 30, 0.28) 40%,
              rgba(140, 60, 20, 0.18) 70%,
              rgba(60, 30, 15, 0.45) 100%);
            box-shadow:
              0 0 6px rgba(255, 160, 60, 0.32),
              0 0 12px rgba(255, 100, 30, 0.15),
              inset 0 0 6px rgba(255, 170, 70, 0.22);
          }
          30% {
            background: radial-gradient(circle at 50% 60%,
              rgba(255, 200, 100, 0.6) 0%,
              rgba(255, 140, 50, 0.42) 40%,
              rgba(180, 80, 30, 0.26) 70%,
              rgba(80, 30, 15, 0.48) 100%);
            box-shadow:
              0 0 14px rgba(255, 190, 80, 0.55),
              0 0 28px rgba(255, 130, 40, 0.32),
              inset 0 0 10px rgba(255, 210, 110, 0.42);
          }
          50% {
            background: radial-gradient(circle at 50% 55%,
              rgba(255, 240, 180, 0.85) 0%,
              rgba(255, 180, 70, 0.65) 40%,
              rgba(220, 100, 30, 0.42) 70%,
              rgba(100, 40, 20, 0.52) 100%);
            box-shadow:
              0 0 24px rgba(255, 230, 140, 1),
              0 0 48px rgba(255, 180, 70, 0.72),
              0 0 80px rgba(255, 120, 30, 0.48),
              inset 0 0 18px rgba(255, 240, 180, 0.7);
          }
          70% {
            background: radial-gradient(circle at 50% 60%,
              rgba(255, 210, 130, 0.55) 0%,
              rgba(255, 150, 50, 0.38) 40%,
              rgba(180, 80, 25, 0.24) 70%,
              rgba(70, 30, 15, 0.48) 100%);
            box-shadow:
              0 0 12px rgba(255, 180, 70, 0.48),
              0 0 22px rgba(255, 120, 30, 0.24),
              inset 0 0 8px rgba(255, 190, 90, 0.34);
          }
        }

        @keyframes orhun-flame-icon-inner {
          0%, 100% {
            color: #ffb674;
            filter: drop-shadow(0 0 3px rgba(255, 170, 60, 0.5));
          }
          50% {
            color: #fff5d0;
            filter:
              drop-shadow(0 0 6px rgba(255, 240, 180, 0.95))
              drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))
              drop-shadow(0 0 22px rgba(255, 140, 50, 0.5));
          }
        }

        /* === 8 ta uchqun, har biri turli yo'nalishda === */
        @keyframes orhun-spark-a {
          0%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          10% { opacity: 1; transform: translate(-2px,-4px) scale(1); }
          60% { opacity: 0.6; transform: translate(-8px,-22px) scale(0.55); }
          85% { opacity: 0; transform: translate(-10px,-30px) scale(0.15); }
        }
        @keyframes orhun-spark-b {
          0%, 20%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          28% { opacity: 1; transform: translate(3px,-3px) scale(1); }
          70% { opacity: 0.5; transform: translate(9px,-24px) scale(0.5); }
          92% { opacity: 0; transform: translate(12px,-32px) scale(0.1); }
        }
        @keyframes orhun-spark-c {
          0%, 40%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          48% { opacity: 1; transform: translate(0,-3px) scale(1); }
          85% { opacity: 0.4; transform: translate(2px,-26px) scale(0.4); }
        }
        @keyframes orhun-spark-d {
          0%, 55%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          63% { opacity: 1; transform: translate(-4px,-2px) scale(1); }
          90% { opacity: 0.3; transform: translate(-10px,-28px) scale(0.28); }
        }
        @keyframes orhun-spark-e {
          0%, 70%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          77% { opacity: 1; transform: translate(5px,-3px) scale(1); }
          96% { opacity: 0; transform: translate(11px,-24px) scale(0.18); }
        }
        @keyframes orhun-spark-f {
          0%, 15%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          22% { opacity: 1; transform: translate(1px,-2px) scale(1); }
          65% { opacity: 0.4; transform: translate(3px,-20px) scale(0.38); }
        }
        @keyframes orhun-spark-g {
          0%, 45%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          52% { opacity: 1; transform: translate(-3px,-3px) scale(1); }
          82% { opacity: 0.3; transform: translate(-8px,-25px) scale(0.32); }
        }
        @keyframes orhun-spark-h {
          0%, 32%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          40% { opacity: 1; transform: translate(2px,-3px) scale(1); }
          75% { opacity: 0.5; transform: translate(6px,-22px) scale(0.48); }
        }

        .orhun-flame-text {
          background: linear-gradient(180deg,
            #fff5d0 0%,
            #ffd270 22%,
            #ff9a30 55%,
            #ff4815 85%,
            #b8200a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: orhun-flame-text 5s ease-in-out infinite;
          will-change: filter, transform;
        }
        .orhun-flame-icon-bg {
          animation: orhun-flame-icon-bg 5s ease-in-out infinite;
          will-change: background, box-shadow;
        }
        .orhun-flame-icon-inner {
          animation: orhun-flame-icon-inner 5s ease-in-out infinite;
          will-change: color, filter;
        }
        .orhun-spark {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff8d0 0%, #ffb850 50%, #ff5020 80%, transparent 100%);
          pointer-events: none;
          box-shadow: 0 0 4px #ffaa40, 0 0 8px #ff7020;
          will-change: transform, opacity;
        }
        .orhun-spark-a { animation: orhun-spark-a 5s ease-out infinite; }
        .orhun-spark-b { animation: orhun-spark-b 5s ease-out infinite; }
        .orhun-spark-c { animation: orhun-spark-c 5s ease-out infinite; }
        .orhun-spark-d { animation: orhun-spark-d 5s ease-out infinite; }
        .orhun-spark-e { animation: orhun-spark-e 5s ease-out infinite; }
        .orhun-spark-f { animation: orhun-spark-f 5s ease-out infinite; }
        .orhun-spark-g { animation: orhun-spark-g 5s ease-out infinite; }
        .orhun-spark-h { animation: orhun-spark-h 5s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .orhun-flame-text,
          .orhun-flame-icon-bg,
          .orhun-flame-icon-inner,
          .orhun-spark { animation: none !important; }
        }
      `}</style>

      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'rounded-full border border-gold-700/40',
              'flex items-center justify-center',
              'orhun-flame-icon-bg',
              s.box
            )}
          >
            <Hexagon className={cn('orhun-flame-icon-inner', s.icon)} />
          </div>
          {/* 8 ta uchqun, atrofdagi turli pozitsiyalardan koʻtariladi */}
          <span className="orhun-spark orhun-spark-a" style={{ left: '15%', bottom: '20%' }} />
          <span className="orhun-spark orhun-spark-b" style={{ right: '10%', bottom: '25%' }} />
          <span className="orhun-spark orhun-spark-c" style={{ left: '50%', bottom: '5%' }} />
          <span className="orhun-spark orhun-spark-d" style={{ left: '25%', top: '10%' }} />
          <span className="orhun-spark orhun-spark-e" style={{ right: '20%', top: '15%' }} />
          <span className="orhun-spark orhun-spark-f" style={{ left: '8%', bottom: '50%' }} />
          <span className="orhun-spark orhun-spark-g" style={{ right: '5%', bottom: '40%' }} />
          <span className="orhun-spark orhun-spark-h" style={{ left: '60%', top: '0%' }} />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display font-light orhun-flame-text tracking-wide',
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
