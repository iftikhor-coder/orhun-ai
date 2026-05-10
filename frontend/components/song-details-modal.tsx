'use client';

import { useTranslations } from 'next-intl';
import { X, Music, Sparkles, Mic, Clock, Tag, Calendar } from 'lucide-react';
import { Song } from '@/lib/store/player';
import { formatDuration, timeAgo } from '@/lib/utils';
import { GenresDisplay } from './genres-display';

interface SongDetailsModalProps {
  song: Song | null;
  onClose: () => void;
}

export function SongDetailsModal({ song, onClose }: SongDetailsModalProps) {
  const t = useTranslations('Song');

  if (!song) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center px-4 py-8 bg-midnight-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto surface-glass-bright rounded-2xl shadow-2xl shadow-black/60 animate-fade-in-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 surface-glass-bright border-b border-gold-900/30 px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-gold-soft border border-gold-700/30 flex items-center justify-center flex-shrink-0">
            <Music className="h-5 w-5 text-gold-400" />
          </div>
          <h2 className="font-display text-2xl text-gold-100 flex-1 truncate">
            {song.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gold-300/60 hover:text-gold-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs">
            <MetaPill icon={Clock} label={formatDuration(song.duration_seconds)} />
            {song.voice_type && (
              <MetaPill
                icon={Mic}
                label={
                  song.voice_type === 'turkic_aura'
                    ? 'Turkic Aura ✦'
                    : t(`voice${song.voice_type.charAt(0).toUpperCase() + song.voice_type.slice(1)}` as any) || song.voice_type
                }
              />
            )}
            {song.created_at && (
              <MetaPill icon={Calendar} label={timeAgo(song.created_at)} />
            )}
            <MetaPill
              icon={song.is_published ? Tag : Tag}
              label={song.is_published ? t('public') : t('private')}
            />
          </div>

          {/* Prompt */}
          <Section icon={Sparkles} title={t('prompt')}>
            <div className="text-gold-100/90 leading-relaxed">
              {song.prompt || <span className="italic text-gold-700">—</span>}
            </div>
          </Section>

          {/* Genres */}
          {(song as any).genres && (
            <Section icon={Tag} title={t('genres') || 'Genres'}>
              <GenresDisplay genreSlugs={(song as any).genres} size="sm" />
            </Section>
          )}

          {/* Lyrics */}
          {song.lyrics && song.lyrics.trim() && (
            <Section icon={Music} title={t('lyrics')}>
              <pre className="whitespace-pre-wrap font-sans text-gold-100/90 text-sm leading-relaxed bg-midnight-800/40 rounded-lg p-4 border border-gold-900/30">
                {song.lyrics}
              </pre>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-midnight-700/40 border border-gold-900/30 text-gold-200">
      <Icon className="h-3.5 w-3.5 text-gold-400" />
      <span>{label}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-gold-300/70">
        <Icon className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
