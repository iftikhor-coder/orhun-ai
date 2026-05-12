'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Sparkles, LogOut, Clock, Pencil, Crown, Calendar,
  User, AtSign, Mail, Check, X, Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
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

type EditableField = 'full_name' | 'username' | 'date_of_birth';

export function TopBar() {
  const t = useTranslations('Home');
  const tp = useTranslations('ProfileMenu');
  const te = useTranslations('ProfileEdit'); // inline edit labellar uchun (mavjud namespace)
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({});
  const [credits, setCredits] = useState<number>(4);
  const [resetAt, setResetAt] = useState<Date | null>(null);
  const [resetIn, setResetIn] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  // === YANGI: inline edit state'lari (modal o'rniga) ===
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState('');
  const [savingField, setSavingField] = useState<EditableField | null>(null);
  const [editError, setEditError] = useState('');

  // === Mavjud loadProfile — AYNAN SAQLANDI ===
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

  // === Mavjud handleSignOut — AYNAN SAQLANDI ===
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  // === Mavjud formatDob — AYNAN SAQLANDI ===
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

  // === YANGI: inline edit funksiyalari (eski profile-edit-modal logikasi shu yerga ko'chirildi) ===
  const startEdit = (field: EditableField) => {
    setEditingField(field);
    setDraft((profile[field] as string) || '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraft('');
    setEditError('');
  };

  const commitEdit = async () => {
    if (!editingField) return;
    let value: string | null = draft.trim();

    // Maydonga xos validatsiya (profile-edit-modal'dagi bilan bir xil)
    if (editingField === 'username') {
      if (!value) { setEditError(te('usernameRequired')); return; }
      if (value.length < 3) { setEditError(te('usernameTooShort')); return; }
      value = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    } else if (!value) {
      value = null;
    }

    if (value === (profile[editingField] ?? null)) {
      cancelEdit();
      return;
    }

    setSavingField(editingField);
    setEditError('');

    try {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        setEditError(te('saveFailed'));
        return;
      }

      const updates: any = { [editingField]: value };
      const { error: upErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', u.id);

      if (upErr) {
        if (upErr.code === '23505') {
          setEditError(te('usernameTaken'));
        } else {
          setEditError(te('saveFailed'));
        }
        return;
      }

      setProfile((p) => ({ ...p, ...updates }));
      setEditingField(null);
      setDraft('');
    } catch (e) {
      console.error(e);
      setEditError(te('saveFailed'));
    } finally {
      setSavingField(null);
    }
  };

  // === Mavjud computed values — AYNAN SAQLANDI ===
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
        {/* === Mavjud: mobile logo — SAQLANDI === */}
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {/* === Mavjud: credits display — SAQLANDI === */}
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

          {/* === Mavjud: NotificationBell + LanguageSwitcher — SAQLANDI === */}
          <NotificationBell />
          <LanguageSwitcher />

          {user && (
            <div className="relative">
              {/* === Mavjud: avatar tugmasi — SAQLANDI === */}
              <button
                onClick={() => {
                  const wasOpen = menuOpen;
                  setMenuOpen(!menuOpen);
                  if (wasOpen) cancelEdit(); // yopilganda edit ham tugaydi
                }}
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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setMenuOpen(false); cancelEdit(); }}
                  />
                  <div className="absolute right-0 mt-2 w-[340px] surface-glass-bright rounded-xl shadow-2xl shadow-black/50 z-50 animate-fade-in border border-gold-900/30 overflow-hidden">

                    {/* === Header (avatar + name + username) — SAQLANDI ===
                        Eskidan farq: DOB va Email endi pastdagi qatorlarda inline edit bilan,
                        shuning uchun header soddalashtirildi. */}
                    <div className="px-4 py-4 border-b border-gold-900/20 bg-gradient-to-b from-midnight-800/40 to-transparent">
                      <div className="flex items-center gap-3">
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
                    </div>

                    {/* === XATOLIK YECHIMI (2): har bir maydon yonida qalamcha === */}
                    <div className="px-2 py-2 space-y-0.5">
                      <FieldRow
                        icon={<User className="h-3 w-3" />}
                        label={te('fullName')}
                        value={profile.full_name}
                        isEditing={editingField === 'full_name'}
                        saving={savingField === 'full_name'}
                        draft={draft}
                        onStart={() => startEdit('full_name')}
                        onChange={setDraft}
                        onCancel={cancelEdit}
                        onCommit={commitEdit}
                        placeholder={te('fullNamePlaceholder')}
                        maxLength={60}
                      />
                      <FieldRow
                        icon={<AtSign className="h-3 w-3" />}
                        label={te('username')}
                        value={profile.username}
                        displayPrefix="@"
                        inputPrefix="@"
                        isEditing={editingField === 'username'}
                        saving={savingField === 'username'}
                        draft={draft}
                        onStart={() => startEdit('username')}
                        onChange={(v) => setDraft(v.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                        onCancel={cancelEdit}
                        onCommit={commitEdit}
                        placeholder="username"
                        maxLength={30}
                      />
                      {user?.email && (
                        <FieldRow
                          icon={<Mail className="h-3 w-3" />}
                          label="Email"
                          value={user.email}
                          readOnly
                        />
                      )}
                      <FieldRow
                        icon={<Calendar className="h-3 w-3" />}
                        label={te('dob')}
                        value={profile.date_of_birth}
                        displayValue={displayDob}
                        isEditing={editingField === 'date_of_birth'}
                        saving={savingField === 'date_of_birth'}
                        draft={draft}
                        onStart={() => startEdit('date_of_birth')}
                        onChange={setDraft}
                        onCancel={cancelEdit}
                        onCommit={commitEdit}
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Xato xabari (faqat saqlash xato bersa ko'rinadi) */}
                    {editError && (
                      <div className="mx-3 mb-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-2 py-1.5">
                        {editError}
                      </div>
                    )}

                    {/* === SUBSCRIPTION TUGMASI — AYNAN ESKI HOLATIDA SAQLANDI ===
                        Foydalanuvchi tegmaslikni so'radi (kelajak admin panel uchun). */}
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

                    {/* === SIGN OUT — AYNAN ESKI HOLATIDA SAQLANDI === */}
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

      {/* === SUBSCRIPTION PANEL — AYNAN ESKI HOLATIDA SAQLANDI === */}
      <SubscriptionPanel open={subOpen} onClose={() => setSubOpen(false)} />
    </header>
  );
}

/* ------------------------------------------------------------------
 *  FieldRow — har bir maydon (default: qiymat + qalamcha,
 *  qalamcha bosilganda: input + ✓ / ✕)
 *  Profile-edit-modal'dagi bilan bir xil mantiq, dropdown'ga moslashtirilgan.
 * ----------------------------------------------------------------- */

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  displayValue?: string | null;
  displayPrefix?: string;
  inputPrefix?: string;
  readOnly?: boolean;
  isEditing?: boolean;
  saving?: boolean;
  draft?: string;
  type?: 'text' | 'date';
  placeholder?: string;
  maxLength?: number;
  max?: string;
  onStart?: () => void;
  onChange?: (v: string) => void;
  onCancel?: () => void;
  onCommit?: () => void;
}

function FieldRow(props: FieldRowProps) {
  const shown = props.displayValue ?? props.value;

  return (
    <div className="group rounded-lg px-3 py-2 hover:bg-midnight-700/30 transition-colors">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-gold-700 mb-1">
        <span className="text-gold-500/70">{props.icon}</span>
        {props.label}
      </div>

      {props.isEditing ? (
        <form
          onSubmit={(e) => { e.preventDefault(); props.onCommit?.(); }}
          className="flex items-center gap-1.5"
        >
          {props.inputPrefix && (
            <span className="text-sm text-gold-700">{props.inputPrefix}</span>
          )}
          <input
            type={props.type || 'text'}
            value={props.draft ?? ''}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            max={props.max}
            autoFocus
            disabled={props.saving}
            onChange={(e) => props.onChange?.(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') props.onCancel?.(); }}
            className={cn(
              'flex-1 min-w-0 px-2 py-1 bg-midnight-900/70 border border-gold-700/40 rounded',
              'text-gold-100 text-sm placeholder:text-gold-700/40',
              'focus:outline-none focus:border-gold-500',
              'disabled:opacity-50',
              props.type === 'date' && '[color-scheme:dark]'
            )}
          />
          <button
            type="submit"
            disabled={props.saving}
            aria-label="Save"
            className="h-6 w-6 grid place-items-center rounded bg-gradient-gold text-midnight-950 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
          >
            {props.saving
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Check className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={props.onCancel}
            disabled={props.saving}
            aria-label="Cancel"
            className="h-6 w-6 grid place-items-center rounded bg-midnight-700/60 text-gold-300/70 hover:bg-midnight-700 hover:text-gold-100 transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gold-100/90 truncate">
            {shown
              ? <>{props.displayPrefix}{shown}</>
              : <span className="text-gold-700/50 italic">—</span>}
          </span>
          {!props.readOnly && (
            <button
              type="button"
              onClick={props.onStart}
              aria-label={`Edit ${props.label}`}
              className={cn(
                'h-6 w-6 grid place-items-center rounded flex-shrink-0',
                'text-gold-700 opacity-0 group-hover:opacity-100',
                'hover:bg-gold-900/30 hover:text-gold-300 transition-all',
                'focus:opacity-100'
              )}
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}