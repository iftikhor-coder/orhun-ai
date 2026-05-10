'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/lib/store/notifications';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  currentUrl?: string;
  onUploaded?: (url: string) => void;
  size?: number; // in pixels
  className?: string;
}

export function AvatarUploader({
  currentUrl,
  onUploaded,
  size = 96,
  className,
}: AvatarUploaderProps) {
  const t = useTranslations('Avatar');
  const { notify } = useNotifications();
  const [url, setUrl] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify({ type: 'error', title: t('invalidFile') });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify({ type: 'error', title: t('tooLarge') });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      const newUrl = pub.publicUrl;

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl })
        .eq('id', user.id);
      if (updErr) throw updErr;

      setUrl(newUrl);
      onUploaded?.(newUrl);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);

      notify({ type: 'success', title: t('uploaded') });
    } catch (e: any) {
      notify({
        type: 'error',
        title: t('uploadFailed'),
        message: e?.message,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative rounded-full overflow-hidden border-2 border-gold-700/40 hover:border-gold-500/70 transition-colors shadow-lg"
        style={{ width: size, height: size }}
      >
        {url ? (
          <img src={url} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-gold-soft flex items-center justify-center">
            <Camera
              className="text-gold-400"
              style={{ width: size / 3, height: size / 3 }}
            />
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 bg-midnight-950/65 flex items-center justify-center transition-opacity',
            uploading || justSaved
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {uploading ? (
            <Loader2 className="text-gold-200" style={{ width: size / 4, height: size / 4 }} />
          ) : justSaved ? (
            <Check className="text-emerald-400" style={{ width: size / 4, height: size / 4 }} />
          ) : (
            <Camera className="text-gold-200" style={{ width: size / 4, height: size / 4 }} />
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-gold-300/70 hover:text-gold-200 transition-colors disabled:opacity-40"
      >
        {url ? t('change') : t('upload')}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
