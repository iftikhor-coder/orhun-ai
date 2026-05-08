'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

export default function DobPage() {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const handleContinue = () => {
    // TODO: save to Supabase
    router.push('/onboarding/profile');
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <span className="h-1.5 w-12 rounded-full bg-gold-900/40" />
            <span className="h-1.5 w-12 rounded-full bg-gold-900/40" />
          </div>

          <div className="text-center mb-10">
            <h1 className="font-display text-4xl sm:text-5xl font-light text-gold-100 mb-3">
              {t('dob.title')}
            </h1>
            <p className="text-gold-300/60 text-sm">{t('dob.subtitle')}</p>
          </div>

          <div className="surface-glass-bright rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-3 gap-4">
              <DateField label={t('dob.day')} value={day} setValue={setDay} max={2} placeholder="01" />
              <DateField label={t('dob.month')} value={month} setValue={setMonth} max={2} placeholder="01" />
              <DateField label={t('dob.year')} value={year} setValue={setYear} max={4} placeholder="2000" />
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => router.back()}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl',
                  'border border-gold-900/40 text-gold-300/70',
                  'hover:bg-midnight-700/50 hover:text-gold-200',
                  'transition-colors'
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </button>
              <button
                onClick={handleContinue}
                disabled={!day || !month || !year}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl',
                  'bg-gradient-gold text-midnight-950 font-semibold',
                  'hover:scale-[1.02] active:scale-[0.98] transition-transform',
                  'glow-gold hover:glow-gold-strong',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                {t('continue')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DateField({
  label,
  value,
  setValue,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  max: number;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2 text-center">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={max}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 rounded-xl text-center text-lg font-medium',
          'bg-midnight-800/50 border border-gold-900/30',
          'text-gold-100 placeholder:text-gold-700/50',
          'focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80',
          'transition-colors'
        )}
      />
    </div>
  );
}
