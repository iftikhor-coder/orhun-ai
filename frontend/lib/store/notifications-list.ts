'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title_en?: string | null;
  title_uz?: string | null;
  title_az?: string | null;
  title_tr?: string | null;
  message_en?: string | null;
  message_uz?: string | null;
  message_az?: string | null;
  message_tr?: string | null;
  action_url?: string | null;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationsListStore {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  load: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsList = create<NotificationsListStore>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  open: false,

  setOpen: (open) => set({ open }),

  load: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ items: [], unreadCount: 0, loading: false });
        return;
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const unread = data.filter((n: any) => !n.is_read).length;
        set({ items: data as NotificationItem[], unreadCount: unread });
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));

    try {
      const supabase = createClient();
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  },

  markAllRead: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set((s) => ({
      items: s.items.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));

    try {
      await supabase.rpc('mark_all_notifications_read', { p_user_id: user.id });
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  },
}));
