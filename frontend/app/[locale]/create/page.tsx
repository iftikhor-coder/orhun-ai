'use client';

import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function CreatePage() {
  const t = useTranslations('Create');

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="font-display text-5xl text-gold-100 mb-3">{t('title')}</h1>
        <p className="text-gold-300/60">Coming in Hafta 3</p>
      </div>
    </main>
  );
}
