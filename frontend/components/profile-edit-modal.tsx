'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, Check, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProfileData {
  username?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSaved: (updated: ProfileData) => void;
}

export function ProfileEditModal({ open, onClose, profile, onSaved }: Props) {
  const t = useTranslations('ProfileEdit');
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [dob, setDob] = useState(profile.date_of_birth || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setDob(profile.date_of_birth || '');
      setError('');
    }
  }, [open, profile]);

  if (!open) return null;

  const handleSave = async () => {
    setError('');
    if (!username.trim()) {
      setError(t('usernameRequired'));
      return;
    }
    if (username.length < 3) {
      setError(t('usernameTooShort'));
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t('saveFailed'));
        return;
      }

      const updates: any = {
        username: username.trim(),
        full_name: fullName.trim() || null,
      };
      if (dob) updates.date_of_birth = dob;

      const { error: upErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (upErr) {
        if (upErr.code === '23505') {
          setError(t('usernameTaken'));
        } else {
          setError(t('saveFailed'));
        }
        return;
      }

      onSaved(updates);
      onClose();
    } catch (e) {
      console.error(e);
      setError(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="surface-glass-bright rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/60 border border-gold-900/30 pointer-events-auto animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display text-gold-100">{t('title')}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gold-300/70 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-700 mb-1.5">
                @{t('username')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-700 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="username"
                  maxLength={30}
                  className="w-full pl-7 pr-3 py-2.5 bg-midnight-800/60 border border-gold-900/30 rounded-lg text-gold-100 placeholder:text-gold-700/40 focus:outline-none focus:border-gold-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-700 mb-1.5">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                maxLength={60}
                className="w-full px-3 py-2.5 bg-midnight-800/60 border border-gold-900/30 rounded-lg text-gold-100 placeholder:text-gold-700/40 focus:outline-none focus:border-gold-500/60 transition-colors"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-700 mb-1.5">
                {t('dob')}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-700 pointer-events-none" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2.5 bg-midnight-800/60 border border-gold-900/30 rounded-lg text-gold-100 focus:outline-none focus:border-gold-500/60 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg text-gold-100/80 bg-midnight-700/40 hover:bg-midnight-700/60 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold',
                'bg-gradient-gold text-midnight-950',
                'hover:scale-[1.02] active:scale-[0.98] transition-transform',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {t('save')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
