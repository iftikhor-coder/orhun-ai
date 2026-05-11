'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

export function SongMenu({
  song, onDelete, onPublishToggle, onShowDetails, isOwner = true, className,
}: SongMenuProps) {
  const t = useTranslations('Song');
  const tn = useTranslations('Notify');
  const { notify } = useNotifications();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position on open
  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 208; // w-52
    const menuHeight = 280; // rough
    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;
    // Flip up if not enough space below
    if (top + menuHeight > window.innerHeight - 16) {
      top = rect.top - menuHeight - 8;
    }
    // Keep within viewport
    if (left < 8) left = 8;
    setPos({ top, left });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

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
      notify({ type: 'error', title: 'Failed to update' });
      return;
    }
    onPublishToggle?.(song.id, newPublished);
    notify({
      type: 'success',
      title: newPublished ? tn('publishedTitle') : tn('unpublishedTitle'),
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    if (!confirm(t('deleteConfirm'))) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      // Soft delete (goes to history)
      const { data } = await supabase.rpc('soft_delete_song', {
        p_user_id: user.id,
        p_song_id: song.id,
      });
      if (data?.success) {
        onDelete?.(song.id);
        notify({ type: 'success', title: tn('deletedTitle') });
        // Notify songs panel to reload
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('orhun:songs-updated'));
        }
      } else {
        notify({ type: 'error', title: 'Failed to delete' });
      }
    } catch {
      notify({ type: 'error', title: 'Failed to delete' });
    }
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onShowDetails?.(song);
  };

  const dropdown = open && pos && mounted ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 10000,
      }}
      className="w-52 rounded-xl py-2 shadow-2xl shadow-black/70 surface-glass-bright animate-fade-in border border-gold-900/40"
    >
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
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center',
          'text-gold-300/60 hover:text-gold-200 hover:bg-midnight-700/40 transition-all',
          className
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {dropdown}
    </>
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
          : 'text-gold-100/80 hover:text-gold-100 hover:bg-midnight-700/40'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
