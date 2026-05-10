'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { cn } from '@/lib/utils';

export function TopBar() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number>(4);
  const [resetAt, setResetAt] = useState<Date | null>(null);
  const [resetIn, setResetIn] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);

      // Refresh credits if reset is due, then read latest
      try {
        const { data } = await supabase.rpc('refresh_credits_if_due', { p_user_id: u.id });
        if (data) {
          setCredits(data.credits_remaining ?? 4);
          if (data.reset_at) setResetAt(new Date(data.reset_at));
        }
      } catch {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_remaining, credits_reset_at')
          .eq('id', u.id)
          .maybeSingle();
        if (profile) {
          setCredits(profile.credits_remaining ?? 4);
          if (profile.credits_reset_at) setResetAt(new Date(profile.credits_reset_at));
        }
      }
    };
    load();

    // Listen for credit updates
    const handler = (e: any) => {
      if (typeof e.detail?.credits_remaining === 'number') {
        setCredits(e.detail.credits_remaining);
      }
      if (e.detail?.reset_at) {
        setResetAt(new Date(e.detail.reset_at));
      }
    };
    window.addEventListener('orhun:credits-updated', handler as any);
    return () => window.removeEventListener('orhun:credits-updated', handler as any);
  }, []);

  // Live countdown
  useEffect(() => {
    if (!resetAt || credits > 0) {
      setResetIn('');
      return;
    }
    const update = () => {
      const ms = resetAt.getTime() - Date.now();
      if (ms <= 0) {
        setResetIn('');
        return;
      }
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setResetIn(`${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [resetAt, credits]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="sticky top-0 z-40 surface-glass border-b border-gold-900/20">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              credits > 0
                ? 'bg-gradient-gold-soft border border-gold-700/30 text-gold-200'
                : 'bg-amber-950/30 border border-amber-700/40 text-amber-200'
            )}
          >
            {credits > 0 ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                <span className="font-medium">{t('credits', { count: credits })}</span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">
                  {resetIn ? `${resetIn}` : t('credits', { count: 0 })}
                </span>
              </>
            )}
          </div>

          <NotificationBell />

          <LanguageSwitcher />

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-9 w-9 rounded-full overflow-hidden border-2 border-gold-700/40 hover:border-gold-500/60 transition-colors"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-midnight-950 font-semibold">
                    {(user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 surface-glass-bright rounded-xl py-2 shadow-2xl shadow-black/50 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gold-900/20">
                      <div className="text-sm text-gold-200 font-medium">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                      <div className="text-xs text-gold-700 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gold-100/70 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
