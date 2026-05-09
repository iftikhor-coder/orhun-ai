'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

export default function DobPage() {
  const t = useTranslations('Onboarding');
  const locale = useLocale();
  const router = useRouter();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);

  const months = t.raw('dob.months') as string[];
  const valid = day && month && year && parseInt(year) >= 1900 && parseInt(year) <= 2020 && parseInt(day) >= 1 && parseInt(day) <= 31;

  const handleContinue = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const dobStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        await supabase.from('profiles').upsert({
          id: user.id,
          date_of_birth: dobStr,
        }, { onConflict: 'id' });
      }
      router.push(`/${locale}/onboarding/profile`);
    } catch (e) {
      console.error(e);
      router.push(`/${locale}/onboarding/profile`);
    } finally {
      setSaving(false);
    }
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
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <div className="h-1.5 w-12 rounded-full bg-gold-900/40" />
            <div className="h-1.5 w-12 rounded-full bg-gold-900/40" />
          </div>

          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold-soft border border-gold-700/30 mb-5">
              <Calendar className="h-6 w-6 text-gold-400" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-gold-100 mb-3">
              {t('dob.title')}
            </h1>
            <p className="text-gold-300/60 text-sm">{t('dob.subtitle')}</p>
          </div>

          <div className="surface-glass-bright rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2 text-center">
                  {t('dob.day')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={day}
                  onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))}
                  placeholder="01"
                  className="w-full px-4 py-3 rounded-xl text-center text-lg font-medium bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2 text-center">
                  {t('dob.month')}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={cn(
                    'w-full px-3 py-3 rounded-xl text-center text-sm font-medium',
                    'bg-midnight-800/50 border border-gold-900/30',
                    'text-gold-100 focus:outline-none focus:border-gold-600/50',
                    'transition-colors cursor-pointer'
                  )}
                >
                  <option value="" className="bg-midnight-900">--</option>
                  {months.map((m, i) => (
                    <option key={i} value={(i + 1).toString()} className="bg-midnight-900">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2 text-center">
                  {t('dob.year')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                  placeholder="2000"
                  className="w-full px-4 py-3 rounded-xl text-center text-lg font-medium bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleContinue}
                disabled={!valid || saving}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl',
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
