'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, Check, Pencil, User, AtSign, Mail, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProfileData {
  username?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  email?: string | null; // ixtiyoriy — agar parent yuborsa koʻrsatamiz
}

interface Props {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSaved: (updated: ProfileData) => void;
}

type EditableField = 'username' | 'full_name' | 'date_of_birth';

export function ProfileEditModal({ open, onClose, profile, onSaved }: Props) {
  const t = useTranslations('ProfileEdit');

  // === XATOLIK YECHIMI (2): har bir maydon alohida edit state ===
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState<EditableField | null>(null);
  const [error, setError] = useState('');
  const [localProfile, setLocalProfile] = useState<ProfileData>(profile);

  useEffect(() => {
    if (open) {
      setLocalProfile(profile);
      setEditing(null);
      setDraft('');
      setError('');
    }
  }, [open, profile]);

  if (!open) return null;

  const startEdit = (field: EditableField) => {
    setEditing(field);
    setDraft((localProfile[field] as string) || '');
    setError('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
    setError('');
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // === Faqat shu maydonni saqlash ===
  const commitEdit = async () => {
    if (!editing) return;

    let value: string | null = draft.trim();

    // Maydonga xos validatsiya
    if (editing === 'username') {
      if (!value) { setError(t('usernameRequired')); return; }
      if (value.length < 3) { setError(t('usernameTooShort')); return; }
      value = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    } else if (editing === 'full_name') {
      if (!value) value = null;
    } else if (editing === 'date_of_birth') {
      if (!value) value = null;
    }

    // O'zgarmagan boʻlsa — saqlamaymiz
    if (value === (localProfile[editing] ?? null)) {
      cancelEdit();
      return;
    }

    setSaving(editing);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t('saveFailed'));
        return;
      }

      const updates: any = { [editing]: value };
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

      const next = { ...localProfile, ...updates };
      setLocalProfile(next);
      onSaved(updates);
      setEditing(null);
      setDraft('');
    } catch (e) {
      console.error(e);
      setError(t('saveFailed'));
    } finally {
      setSaving(null);
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
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display text-gold-100">{t('title')}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gold-300/70 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* === XATOLIK YECHIMI (2): har bir maydon yonida qalamcha === */}
          <div className="space-y-2.5">
            <FieldRow
              icon={<User className="h-3.5 w-3.5" />}
              label={t('fullName')}
              value={localProfile.full_name}
              isEditing={editing === 'full_name'}
              saving={saving === 'full_name'}
              draft={draft}
              onStart={() => startEdit('full_name')}
              onChange={setDraft}
              onCancel={cancelEdit}
              onCommit={commitEdit}
              placeholder={t('fullNamePlaceholder')}
              maxLength={60}
              editLabel={t('save')}
            />

            <FieldRow
              icon={<AtSign className="h-3.5 w-3.5" />}
              label={t('username')}
              value={localProfile.username}
              displayPrefix="@"
              inputPrefix="@"
              isEditing={editing === 'username'}
              saving={saving === 'username'}
              draft={draft}
              onStart={() => startEdit('username')}
              onChange={(v) => setDraft(v.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              onCancel={cancelEdit}
              onCommit={commitEdit}
              placeholder="username"
              maxLength={30}
              editLabel={t('save')}
            />

            {profile.email && (
              <FieldRow
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Email"
                value={profile.email}
                readOnly
              />
            )}

            <FieldRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              label={t('dob')}
              value={localProfile.date_of_birth}
              displayValue={formatDate(localProfile.date_of_birth)}
              isEditing={editing === 'date_of_birth'}
              saving={saving === 'date_of_birth'}
              draft={draft}
              onStart={() => startEdit('date_of_birth')}
              onChange={setDraft}
              onCancel={cancelEdit}
              onCommit={commitEdit}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              editLabel={t('save')}
            />
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-gold-100/80 bg-midnight-700/40 hover:bg-midnight-700/60 transition-colors text-sm"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
 *  FieldRow — har bir maydon (default: ko'rinish + qalamcha,
 *  qalamcha bosilganda: input + ✓ / ✕)
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
  editLabel?: string;
  onStart?: () => void;
  onChange?: (v: string) => void;
  onCancel?: () => void;
  onCommit?: () => void;
}

function FieldRow(props: FieldRowProps) {
  const shown = props.displayValue ?? props.value;

  return (
    <div className="group rounded-xl px-3 py-2.5 bg-midnight-800/40 border border-gold-900/20 hover:border-gold-900/50 transition-colors">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-700 mb-1.5">
        <span className="text-gold-500/70">{props.icon}</span>
        {props.label}
      </div>

      {props.isEditing ? (
        <form
          onSubmit={(e) => { e.preventDefault(); props.onCommit?.(); }}
          className="flex items-center gap-2"
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
              'flex-1 px-2.5 py-1.5 bg-midnight-900/70 border border-gold-700/40 rounded-md',
              'text-gold-100 text-sm placeholder:text-gold-700/40',
              'focus:outline-none focus:border-gold-500',
              'disabled:opacity-50',
              props.type === 'date' && '[color-scheme:dark]'
            )}
          />
          <button
            type="submit"
            disabled={props.saving}
            aria-label={props.editLabel || 'Save'}
            className="h-7 w-7 grid place-items-center rounded-md bg-gradient-gold text-midnight-950 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            {props.saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={props.onCancel}
            disabled={props.saving}
            aria-label="Cancel"
            className="h-7 w-7 grid place-items-center rounded-md bg-midnight-700/60 text-gold-300/70 hover:bg-midnight-700 hover:text-gold-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
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
                'h-7 w-7 grid place-items-center rounded-md flex-shrink-0',
                'text-gold-700 opacity-0 group-hover:opacity-100',
                'hover:bg-gold-900/30 hover:text-gold-300 transition-all',
                'focus:opacity-100'
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
