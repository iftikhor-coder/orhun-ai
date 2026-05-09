'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'uz', flag: '🇺🇿' },
  { code: 'az', flag: '🇦🇿' },
  { code: 'tr', flag: '🇹🇷' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Languages');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
          'text-gold-200 hover:text-gold-100',
          'border border-gold-900/40 hover:border-gold-700/60',
          'bg-midnight-700/40 hover:bg-midnight-600/60',
          'transition-all duration-200'
        )}
      >
        <Globe className="h-4 w-4" />
        <span>{current?.flag}</span>
        <span className="hidden sm:inline">{t(locale)}</span>
      </button>

      {open && (
        <div className={cn(
          'absolute top-full right-0 mt-2 w-48 py-2 rounded-xl z-50',
          'surface-glass-bright animate-fade-in shadow-2xl shadow-black/50'
        )}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors',
                lang.code === locale
                  ? 'text-gold-300'
                  : 'text-gold-100/70 hover:text-gold-100 hover:bg-midnight-600/40'
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span>{t(lang.code)}</span>
              </span>
              {lang.code === locale && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
