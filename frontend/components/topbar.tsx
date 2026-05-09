'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function TopBar() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number>(4);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        // Try to load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', u.id)
          .single();
        if (profile?.credits_remaining !== undefined) {
          setCredits(profile.credits_remaining);
        }
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="sticky top-0 z-40 surface-glass border-b border-gold-900/20">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        {/* Mobile logo (hidden on desktop where sidebar shows it) */}
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <div className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'bg-gradient-gold-soft border border-gold-700/30',
            'text-sm text-gold-200'
          )}>
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span className="font-medium">{t('credits', { count: credits })}</span>
          </div>

          <LanguageSwitcher />

          {/* User avatar */}
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
