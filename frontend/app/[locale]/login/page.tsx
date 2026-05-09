'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const result =
        mode === 'signin'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else {
        router.push('/onboarding/dob');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const locale = url.pathname.split('/')[1] || 'en';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch {
      setError('Google sign-in not yet configured');
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.04]">
        <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <text x="50" y="100" fontSize="80" fill="#c9a44c" fontFamily="serif">𐰀</text>
          <text x="650" y="200" fontSize="70" fill="#c9a44c" fontFamily="serif">𐰆</text>
          <text x="100" y="700" fontSize="90" fill="#c9a44c" fontFamily="serif">𐰢</text>
          <text x="600" y="650" fontSize="60" fill="#c9a44c" fontFamily="serif">𐰭</text>
          <text x="400" y="400" fontSize="120" fill="#c9a44c" fontFamily="serif">𐰍</text>
        </svg>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 flex justify-center">
        <span className="text-xs tracking-[0.3em] text-gold-700 uppercase">
          orhun-ai.vercel.app
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-center px-6 py-12 sm:py-20">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="font-display text-5xl sm:text-6xl font-light text-gold-100 mb-3">
              {t('welcome')}
            </h1>
            <p className="text-gold-300/60 text-sm sm:text-base italic font-display">
              {t('subtitle')}
            </p>
          </div>

          <div className="surface-glass-bright rounded-2xl p-8 shadow-2xl shadow-black/40 relative">
            <CornerOrnament className="top-3 left-3" />
            <CornerOrnament className="top-3 right-3 scale-x-[-1]" />
            <CornerOrnament className="bottom-3 left-3 scale-y-[-1]" />
            <CornerOrnament className="bottom-3 right-3 scale-[-1]" />

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl',
                'bg-gradient-to-b from-white to-gold-50',
                'text-midnight-900 font-semibold text-sm',
                'hover:scale-[1.02] active:scale-[0.98] transition-transform',
                'shadow-lg shadow-gold-900/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <GoogleIcon />
              {t('google')}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-700/30 to-gold-700/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-gold-700">{t('or')}</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold-700/30 to-gold-700/30" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-700" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-700" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400/90 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl',
                  'bg-gradient-gold text-midnight-950 font-semibold',
                  'hover:scale-[1.02] active:scale-[0.98] transition-transform',
                  'glow-gold hover:glow-gold-strong',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? t('signIn') : t('signUp')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gold-300/60">
              {mode === 'signin' ? t('noAccount') : t('hasAccount')}{' '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-gold-300 hover:text-gold-200 underline underline-offset-4 decoration-gold-700/50"
              >
                {mode === 'signin' ? t('createOne') : t('signIn')}
              </button>
            </p>
          </div>

          <p className="text-center mt-6 text-xs text-gold-700">{t('termsNote')}</p>
        </div>
      </div>
    </main>
  );
}

function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg className={cn('absolute h-4 w-4 text-gold-700/40', className)} viewBox="0 0 16 16" fill="none">
      <path d="M0 0 L8 0 M0 0 L0 8 M2 2 L2 6 M2 2 L6 2" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
