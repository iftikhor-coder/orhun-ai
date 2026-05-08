'use client';

import { useTranslations } from 'next-intl';
import { Music, Sparkles } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gold-300/70 hidden sm:inline">
            {t('credits', { count: 4 })}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-display text-5xl text-gold-100 mb-3">{t('hi')}</h1>
          <p className="text-gold-300/60">Coming in Hafta 3 — full experience</p>
        </div>

        <div className="surface-glass-bright rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-gold-300" />
            <h2 className="font-display text-2xl text-gold-100">{t('create')}</h2>
          </div>
          <input
            type="text"
            placeholder={t('promptPlaceholder')}
            className="w-full px-5 py-4 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/60 focus:outline-none focus:border-gold-600/50 transition-colors"
          />
        </div>

        <div className="surface-glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-5 w-5 text-gold-300" />
            <h2 className="font-display text-2xl text-gold-100">{t('exploreTitle')}</h2>
          </div>
          <p className="text-gold-300/60 text-sm">{t('exploreSubtitle')}</p>
          <p className="text-gold-700 text-sm mt-4 italic">Songs from community will appear here</p>
        </div>
      </div>
    </main>
  );
}
