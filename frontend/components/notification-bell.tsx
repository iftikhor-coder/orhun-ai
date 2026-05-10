'use client';

import { useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsList } from '@/lib/store/notifications-list';
import { NotificationsPanel } from './notifications-panel';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { unreadCount, open, setOpen, load } = useNotificationsList();
  const ref = useRef<HTMLDivElement>(null);

  // Initial load + poll every 30s
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        className={cn(
          'relative h-10 w-10 rounded-lg flex items-center justify-center',
          'text-gold-300/70 hover:text-gold-200 hover:bg-midnight-700/40 transition-all'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1',
              'h-4 min-w-[16px] px-1',
              'rounded-full bg-red-500 text-white',
              'text-[10px] font-bold leading-none',
              'flex items-center justify-center',
              'shadow-md shadow-red-500/40',
              'animate-pulse'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationsPanel />}
    </div>
  );
}
