'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Bell, BellOff, Sparkles, Heart, MessageCircle, Megaphone, CheckCheck,
} from 'lucide-react';
import {
  useNotificationsList,
  NotificationItem,
} from '@/lib/store/notifications-list';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  like_received: Heart,
  comment_received: MessageCircle,
  song_ready: Sparkles,
  admin_announcement: Megaphone,
  credits_refreshed: Sparkles,
  welcome: Bell,
  general: Bell,
};

const ICON_COLORS: Record<string, string> = {
  like_received: 'text-rose-400',
  comment_received: 'text-blue-400',
  song_ready: 'text-gold-400',
  admin_announcement: 'text-amber-400',
  credits_refreshed: 'text-emerald-400',
  welcome: 'text-gold-400',
  general: 'text-gold-300',
};

export function NotificationsPanel() {
  const t = useTranslations('Notifications');
  const locale = useLocale();
  const { items, unreadCount, markRead, markAllRead, loading } = useNotificationsList();

  const getTitle = (n: NotificationItem): string => {
    const key = `title_${locale}` as keyof NotificationItem;
    return ((n[key] as string) || n.title_en || '').trim();
  };

  const getMessage = (n: NotificationItem): string => {
    const key = `message_${locale}` as keyof NotificationItem;
    return ((n[key] as string) || n.message_en || '').trim();
  };

  const handleClick = (n: NotificationItem) => {
    if (!n.is_read) markRead(n.id);
    if (n.action_url) {
      try {
        if (n.action_url.startsWith('/')) {
          window.location.href = n.action_url;
        } else {
          window.open(n.action_url, '_blank', 'noopener,noreferrer');
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className={cn(
        'absolute right-0 top-full mt-2',
        'w-[380px] max-w-[calc(100vw-2rem)]',
        'surface-glass-bright rounded-2xl',
        'shadow-2xl shadow-black/60',
        'z-50 animate-fade-in',
        'border border-gold-900/30 overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gold-900/30">
        <div className="flex items-center gap-2 min-w-0">
          <Bell className="h-4 w-4 text-gold-400 flex-shrink-0" />
          <h3 className="font-medium text-gold-100 text-sm truncate">
            {t('title')}
          </h3>
          {unreadCount > 0 && (
            <span className="text-xs text-gold-700 flex-shrink-0">
              · {unreadCount} {t('unread')}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-gold-400 hover:text-gold-200 flex items-center gap-1 transition-colors flex-shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t('markAllRead')}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="animate-pulse text-gold-700 text-sm">···</div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <BellOff className="h-8 w-8 text-gold-700/50 mx-auto mb-3" />
            <p className="text-sm text-gold-700 italic">{t('empty')}</p>
            <p className="text-xs text-gold-700/70 mt-1">{t('emptyHint')}</p>
          </div>
        ) : (
          <ul>
            {items.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              const iconColor = ICON_COLORS[n.type] || 'text-gold-300';
              const title = getTitle(n);
              const message = getMessage(n);
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3',
                      'hover:bg-midnight-700/40 transition-colors text-left',
                      'border-l-2',
                      !n.is_read ? 'border-gold-500 bg-midnight-800/30' : 'border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 mt-0.5 flex-shrink-0',
                        iconColor
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'text-sm leading-tight',
                          !n.is_read
                            ? 'text-gold-100 font-medium'
                            : 'text-gold-300/80'
                        )}
                      >
                        {title}
                      </div>
                      {message && (
                        <div className="text-xs text-gold-700 mt-1 line-clamp-2 break-words">
                          {message}
                        </div>
                      )}
                      <div className="text-[10px] text-gold-700/60 mt-1.5">
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                    {!n.is_read && (
                      <span
                        className="h-2 w-2 rounded-full bg-gold-400 mt-1.5 flex-shrink-0 shadow-sm shadow-gold-500/40"
                        aria-label="unread"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
