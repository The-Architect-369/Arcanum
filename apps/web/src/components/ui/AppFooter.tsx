'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    TABS.forEach((tab) => router.prefetch(tab.href));
  }, [router]);

  const isActive = (tab: Tab) =>
    pathname === tab.root || pathname.startsWith(tab.root + '/') || (pathname === '/app' && tab.module === 'hope');

  const primeTransition = (tab: Tab, active: boolean) => {
    router.prefetch(tab.href);
    if (active) return;
    window.dispatchEvent(new CustomEvent('arcanum:module-reveal', { detail: { module: tab.module } }));
  };

  return (
    <nav
      className="arcanum-app-footer absolute inset-x-0 z-50 border-t border-white/5 bg-black/78 shadow-[0_-10px_28px_rgba(0,0,0,0.62)] backdrop-blur-md"
      role="navigation"
      aria-label="Main"
    >
      <div className="arcanum-app-footer-row mx-auto grid max-w-5xl grid-cols-5 px-1.5">
        {TABS.map((t) => {
          const active = isActive(t);
          return (
            <a
              key={t.href}
              href={t.href}
              onPointerDown={() => primeTransition(t, active)}
              onFocus={() => router.prefetch(t.href)}
              className={cn(
                'global-tab-link arcanum-app-footer-tab relative grid w-full place-items-center rounded-2xl transition-[background,color,box-shadow] duration-150 ease-out',
                active
                  ? 'global-tab-active text-amber-300'
                  : 'text-zinc-400 hover:bg-white/5'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={t.label}
              title={t.label}
            >
              <span className="global-tab-icon relative z-10 grid place-items-center">{t.icon}</span>
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
        className="absolute right-4 top-3 z-10 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(246,196,83,.6)]"
        aria-hidden="true"
      />
    );
  }

  if (t.badge === 'count' && (t.count ?? 0) > 0) {
    const n = t.count!;
    return (
      <span className="absolute right-3 top-2 z-10 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-amber-400 px-1 text-[11px] font-semibold text-black">
        {n > 99 ? '99+' : n}
      </span>
    );
  }

  return null;
}
