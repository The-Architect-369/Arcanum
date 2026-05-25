'use client';

import { usePathname } from 'next/navigation';
import { BookMarked, Wallet, Globe, Clock, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = {
  label: string;
  href: string;
  root: string;
  module: string;
  icon: React.ReactNode;
  badge?: 'dot' | 'count';
  count?: number;
};

const TABS: Tab[] = [
  { label: 'Hope', href: '/hope/reflection', root: '/hope', module: 'hope', icon: <UserRound size={22} />, badge: 'dot' },
  { label: 'Tempus', href: '/tempus/clock', root: '/tempus', module: 'tempus', icon: <Clock size={22} />, badge: 'dot' },
  { label: 'Nexus', href: '/nexus/current', root: '/nexus', module: 'nexus', icon: <Globe size={22} />, badge: 'dot' },
  { label: 'Wallet', href: '/wallet/receipts', root: '/wallet', module: 'wallet', icon: <Wallet size={22} />, badge: 'dot' },
  { label: 'Vitae', href: '/vitae/path', root: '/vitae', module: 'vitae', icon: <BookMarked size={22} />, badge: 'dot' },
];

export default function AppFooter() {
  const pathname = usePathname();

  const isActive = (root: string) =>
    pathname === root || pathname.startsWith(root + '/');

  const triggerDeck = (module: string, active: boolean) => {
    if (active) return;
    window.dispatchEvent(new CustomEvent('arcanum:module-reveal', { detail: { module } }));
  };

  return (
    <nav
      className="arcanum-app-footer absolute inset-x-0 z-50 border-t border-zinc-800 bg-black/75 shadow-[0_-10px_28px_rgba(0,0,0,0.62)] backdrop-blur-md"
      role="navigation"
      aria-label="Main"
    >
      <div className="arcanum-app-footer-row mx-auto grid max-w-5xl grid-cols-5">
        {TABS.map((t) => {
          const active = isActive(t.root);
          return (
            <a
              key={t.href}
              href={t.href}
              onClick={() => triggerDeck(t.module, active)}
              className={cn(
                'arcanum-app-footer-tab relative grid w-full place-items-center rounded-xl transition-colors',
                active
                  ? 'tile-3d-active text-amber-300 shadow-[0_0_10px_rgba(246,196,83,0.6)]'
                  : 'text-zinc-400 hover:bg-white/5 active:bg-white/10'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={t.label}
              title={t.label}
            >
              <span className="grid place-items-center">{t.icon}</span>
              {renderBadge(t)}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function renderBadge(t: Tab) {
  if (t.badge === 'dot') {
    return (
      <span
        className="absolute right-4 top-3 h-2 w-2 rounded-full bg-amber-400"
        aria-hidden="true"
      />
    );
  }

  if (t.badge === 'count' && (t.count ?? 0) > 0) {
    const n = t.count!;
    return (
      <span className="absolute right-3 top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-amber-400 px-1 text-[11px] font-semibold text-black">
        {n > 99 ? '99+' : n}
      </span>
    );
  }

  return null;
}
