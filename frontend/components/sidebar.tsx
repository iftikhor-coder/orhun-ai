'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Sparkles, Compass, Music } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/home`, icon: Home, label: t('home') },
    { href: `/${locale}/create`, icon: Sparkles, label: t('create') },
    { href: `/${locale}/explore`, icon: Compass, label: t('explore') },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 surface-glass border-r border-gold-900/20">
      {/* Logo */}
      <div className="px-6 pt-6 pb-8">
        <button onClick={() => router.push(`/${locale}/home`)}>
          <Logo size="md" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1',
                'text-sm font-medium transition-all',
                active
                  ? 'bg-gradient-gold-soft text-gold-200 border border-gold-700/30'
                  : 'text-gold-100/60 hover:text-gold-100 hover:bg-midnight-700/40'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="px-6 py-6 border-t border-gold-900/20">
        <div className="flex items-center gap-2 text-xs text-gold-700">
          <Music className="h-3.5 w-3.5" />
          <span>orhun-ai.vercel.app</span>
        </div>
      </div>
    </aside>
  );
}
