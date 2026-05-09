'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ className, size = 'md', showTagline = true }: LogoProps) {
  const t = useTranslations('Brand');

  const sizes = {
    sm: { name: 'text-base', tagline: 'text-[10px]', mark: 'h-5 w-5' },
    md: { name: 'text-2xl', tagline: 'text-xs', mark: 'h-7 w-7' },
    lg: { name: 'text-4xl', tagline: 'text-sm', mark: 'h-10 w-10' },
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(sizes[size].mark, 'flex-shrink-0')}>
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6c068" />
            <stop offset="50%" stopColor="#c9a44c" />
            <stop offset="100%" stopColor="#a8842f" />
          </linearGradient>
        </defs>
        <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
        <path d="M16 8 L22 11.5 L22 18.5 L16 22 L10 18.5 L10 11.5 Z" stroke="url(#goldGrad)" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="16" cy="16" r="2" fill="url(#goldGrad)" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className={cn('font-display font-light tracking-wide text-gold-shine', sizes[size].name)}>
          {t('name')}
        </span>
        {showTagline && (
          <span className={cn('font-sans tracking-[0.2em] uppercase text-gold-700', sizes[size].tagline)}>
            {t('tagline')}
          </span>
        )}
      </div>
    </div>
  );
}
