'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, User, Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const t = useTranslations('Onboarding');
  const locale = useLocale();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const valid = username.length >= 3 && fullName.length >= 2;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let avatarUrl: string | undefined;
        
        // Upload avatar to storage
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${user.id}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });
          
          if (!uploadError) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = data.publicUrl;
          }
        }
        
        // Save profile
        await supabase.from('profiles').upsert({
          id: user.id,
          username: username.toLowerCase().replace(/\s/g, '_'),
          full_name: fullName,
          avatar_url: avatarUrl,
        }, { onConflict: 'id' });
      }
      
      router.push(`/${locale}/onboarding/genres`);
    } catch (e) {
      console.error(e);
      router.push(`/${locale}/onboarding/genres`);
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
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <div className="h-1.5 w-12 rounded-full bg-gradient-gold" />
            <div className="h-1.5 w-12 rounded-full bg-gold-900/40" />
          </div>

          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold-soft border border-gold-700/30 mb-5">
              <User className="h-6 w-6 text-gold-400" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-gold-100 mb-3">
              {t('profile.title')}
            </h1>
            <p className="text-gold-300/60 text-sm">{t('profile.subtitle')}</p>
          </div>

          <div className="surface-glass-bright rounded-2xl p-8 shadow-2xl shadow-black/40">
            {/* Avatar upload */}
            <div className="flex flex-col items-center mb-6">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={() => fileInput.current?.click()}
                className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gold-700/40 hover:border-gold-500/60 transition-all group bg-midnight-800/50"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-7 w-7 text-gold-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-midnight-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-gold-100 font-medium">
                    {avatarPreview ? t('profile.changeAvatar') : t('profile.uploadAvatar')}
                  </span>
                </div>
              </button>
              <span className="text-xs text-gold-700 mt-3">{t('profile.avatar')}</span>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2">
                  {t('profile.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('profile.usernamePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-300/70 mb-2">
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('profile.fullNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-midnight-800/50 border border-gold-900/30 text-gold-100 placeholder:text-gold-700/50 focus:outline-none focus:border-gold-600/50 focus:bg-midnight-800/80 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gold-900/40 text-gold-300/70 hover:bg-midnight-700/50 hover:text-gold-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </button>
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>{t('continue')} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
