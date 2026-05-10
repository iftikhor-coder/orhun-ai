'use client';

import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  notify: (n: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  notify: (n) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = n.duration ?? 5000;
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) }));
      }, duration);
    }
  },
  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
  clear: () => set({ notifications: [] }),
}));
