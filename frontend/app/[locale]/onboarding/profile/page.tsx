'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ProfilePage() {
  const t = useTranslations('Onboarding');
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg animate-fade-in-up text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <span className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <span className="h-1.5 w-12 rounded-full bg-gold-900/40" />
          </div>

          <h1 className="font-display text-4xl text-gold-100 mb-3">{t('profile.title')}</h1>
          <p className="text-gold-300/60 mb-10">Coming in Hafta 2 — placeholder</p>

          <button
            onClick={() => router.push('/onboarding/genres')}
            className="px-8 py-3 rounded-xl bg-gradient-gold text-midnight-950 font-semibold glow-gold"
          >
            {t('continue')}
          </button>
        </div>
      </div>
    </main>
  );
}
