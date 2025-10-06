'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BookMarked, MessageSquareMore, Globe, Clock, UserRound } from 'lucide-react';
import { cn } from './cn';

type Tab = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: 'dot' | 'count';
  count?: number;
};

const TABS: Tab[] = [
  { label: 'Hope',   href: '/hope',   icon: <UserRound size={22} />,         badge: 'dot' },
  { label: 'Tempus', href: '/tempus', icon: <Clock size={22} />,             badge: 'dot' },
  { label: 'Nexus',  href: '/nexus',  icon: <Globe size={22} />,             badge: 'dot' },
  { label: 'Text',   href: '/text',   icon: <MessageSquareMore size={22} />, badge: 'count', count: 0 },
  { label: 'Vitae',  href: '/vitae',  icon: <BookMarked size={22} />,        badge: 'dot' },
];

export default function AppFooter() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-md border-t border-zinc-800 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
      role="navigation"
      aria-label="Main"
    >
      <div className="mx-auto max-w-5xl grid grid-cols-5">
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <button
              key={t.href}
              onClick={() => router.push(t.href)}
              className={cn(
                'relative h-14 w-full grid place-items-center transition-colors rounded-xl',
                active
                  ? 'tile-3d-active text-amber-300 shadow-[0_0_10px_rgba(246,196,83,0.6)]'
                  : 'hover:bg-white/5 active:bg-white/10 text-zinc-400'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={t.label}
            >
              <span className="grid place-items-center">{t.icon}</span>
              {renderBadge(t)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function renderBadge(t: Tab) {
  if (t.badge === 'dot') {
    return <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />;
  }
  if (t.badge === 'count' && (t.count ?? 0) > 0) {
    const n = t.count!;
    return (
      <span className="absolute top-1.5 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black text-[11px] font-semibold grid place-items-center">
        {n > 99 ? '99+' : n}
      </span>
    );
  }
  return null;
}
