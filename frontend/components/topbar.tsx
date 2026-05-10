'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, Clock, Pencil, Crown, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { ProfileEditModal } from './profile-edit-modal';
import { SubscriptionPanel } from './subscription-panel';
import { cn } from '@/lib/utils';

interface Profile {
  username?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  credits_remaining?: number;
  credits_reset_at?: string | null;
}

export function TopBar() {
  const t = useTranslations('Home');
  const tp = useTranslations('ProfileMenu');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({});
  const [credits, setCredits] = useState<number>(4);
  const [resetAt, setResetAt] = useState<Date | null>(null);
  const [resetIn, setResetIn] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setUser(u);

    const { data: prof } = await supabase
      .from('profiles')
      .select('username, full_name, date_of_birth, avatar_url, credits_remaining, credits_reset_at')
      .eq('id', u.id)
      .maybeSingle();

    if (prof) {
      setProfile(prof);
      setCredits(prof.credits_remaining ?? 4);
      if (prof.credits_reset_at) setResetAt(new Date(prof.credits_reset_at));
    }

    try {
      const { data } = await supabase.rpc('refresh_credits_if_due', { p_user_id: u.id });
      if (data) {
        setCredits(data.credits_remaining ?? 4);
        if (data.reset_at) setResetAt(new Date(data.reset_at));
      }
    } catch {}
  };

  useEffect(() => {
    loadProfile();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const formatDob = (dob?: string | null) => {
    if (!dob) return null;
    try {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const displayName =
    profile.full_name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    '';
  const displayUsername = profile.username || null;
  const displayDob = formatDob(profile.date_of_birth);
  const avatarUrl = profile.avatar_url || user?.user_metadata?.avatar_url || null;
  const avatarInitial = (displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 surface-glass border-b border-gold-900/20">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
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
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-midnight-950 font-semibold">
                    {avatarInitial}
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 surface-glass-bright rounded-xl shadow-2xl shadow-black/50 z-50 animate-fade-in border border-gold-900/30 overflow-hidden">
                    <div className="px-4 py-4 border-b border-gold-900/20 bg-gradient-to-b from-midnight-800/40 to-transparent">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gold-700/40 flex-shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-midnight-950 font-bold text-lg">
                              {avatarInitial}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gold-100 truncate">
                            {displayName || tp('noName')}
                          </div>
                          {displayUsername && (
                            <div className="text-xs text-gold-400 truncate">
                              @{displayUsername}
                            </div>
                          )}
                        </div>
                      </div>

                      {displayDob && (
                        <div className="flex items-center gap-2 text-[11px] text-gold-700 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{displayDob}</span>
                        </div>
                      )}

                      <div className="text-[11px] text-gold-700/80 truncate mt-1">
                        {user.email}
                      </div>
                    </div>

                    <button
                      onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-100/80 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-gold-400" />
                      {tp('editProfile')}
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); setSubOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-100/80 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors border-t border-gold-900/20"
                    >
                      <Crown className="h-4 w-4 text-gold-400" />
                      <span className="flex-1 text-left">{tp('subscription')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-semibold uppercase tracking-wider">
                        {tp('upgrade')}
                      </span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/20 transition-colors border-t border-gold-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      {tp('signOut')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={(u) => setProfile((p) => ({ ...p, ...u }))}
      />
      <SubscriptionPanel open={subOpen} onClose={() => setSubOpen(false)} />
    </header>
  );
}
