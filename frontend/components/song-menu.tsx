'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal, Download, Share2, Trash2, Globe, Lock, Eye, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/lib/store/notifications';
import { Song } from '@/lib/store/player';
import { cn } from '@/lib/utils';

interface SongMenuProps {
  song: Song;
  onDelete?: (id: string) => void;
  onPublishToggle?: (id: string, isPublished: boolean) => void;
  onShowDetails?: (song: Song) => void;
  isOwner?: boolean;
  className?: string;
}

export function SongMenu({ song, onDelete, onPublishToggle, onShowDetails, isOwner = true, className }: SongMenuProps) {
  const t = useTranslations('Song');
  const tn = useTranslations('Notify');
  const { notify } = useNotifications();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    try {
      const response = await fetch(song.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title || 'orhun-song'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify({ type: 'success', title: tn('downloadStarted') });
    } catch {
      notify({ type: 'error', title: tn('downloadFailed') });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = song.audio_url;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      notify({ type: 'success', title: tn('linkCopied') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ type: 'error', title: tn('copyFailed') });
    }
  };

  const handlePublishToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    const supabase = createClient();
    const newPublished = !song.is_published;

    const { error } = await supabase
      .from('songs')
      .update({ is_published: newPublished })
      .eq('id', song.id);

    if (error) {
      notify({ type: 'error', title: tn('updateFailed'), message: error.message });
      return;
    }

    notify({
      type: 'success',
      title: newPublished ? tn('publishedTitle') : tn('unpublishedTitle'),
      message: newPublished ? tn('publishedMessage') : tn('unpublishedMessage'),
    });
    onPublishToggle?.(song.id, newPublished);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    if (!confirm(t('deleteConfirm'))) return;

    const supabase = createClient();
    const { error } = await supabase.from('songs').delete().eq('id', song.id);

    if (error) {
      notify({ type: 'error', title: tn('deleteFailed'), message: error.message });
      return;
    }

    notify({ type: 'success', title: tn('deletedTitle') });
    onDelete?.(song.id);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onShowDetails?.(song);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-gold-300/60 hover:text-gold-200 hover:bg-midnight-700/40 transition-all"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl py-2 shadow-2xl shadow-black/50 z-50 surface-glass-bright animate-fade-in">
          <MenuItem icon={Eye} label={t('details')} onClick={handleDetails} />
          <MenuItem icon={Download} label={t('download')} onClick={handleDownload} />
          <MenuItem
            icon={copied ? Check : Share2}
            label={copied ? tn('copied') : t('share')}
            onClick={handleShare}
          />

          {isOwner && (
            <>
              <div className="my-1 mx-3 h-px bg-gold-900/30" />
              <MenuItem
                icon={song.is_published ? Lock : Globe}
                label={song.is_published ? t('unpublish') : t('publish')}
                onClick={handlePublishToggle}
              />
              <MenuItem
                icon={Trash2}
                label={t('delete')}
                onClick={handleDelete}
                danger
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        danger
          ? 'text-red-400/80 hover:text-red-300 hover:bg-red-950/20'
          : 'text-gold-100/70 hover:text-gold-100 hover:bg-midnight-700/40'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
