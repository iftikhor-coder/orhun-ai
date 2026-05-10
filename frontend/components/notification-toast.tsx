'use client';

import { useNotifications } from '@/lib/store/notifications';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'border-emerald-700/40 bg-emerald-950/30 text-emerald-200',
  error: 'border-red-700/40 bg-red-950/30 text-red-200',
  info: 'border-gold-700/40 bg-midnight-700/60 text-gold-200',
  warning: 'border-amber-700/40 bg-amber-950/30 text-amber-200',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-gold-400',
  warning: 'text-amber-400',
};

export function NotificationToast() {
  const { notifications, dismiss } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/40',
              'animate-fade-in-up',
              COLORS[n.type]
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', ICON_COLORS[n.type])} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{n.title}</div>
              {n.message && (
                <div className="text-xs opacity-80 mt-0.5">{n.message}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
