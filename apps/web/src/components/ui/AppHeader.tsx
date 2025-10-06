'use client';

import { useState } from 'react';
import { Gem, Menu, UserCog, Wallet, ArrowLeftRight, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BadgeCounter from '@/components/ui/BadgeCounter';
import ACCOnboardingModal from '@/components/ui/ACCOnboardingModal';
import { useAccount } from '@/state/useAccount';

export default function AppHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const acc = useAccount(); // trusted, mana, notifCount, showOnboarding (via modal)
  const mana = acc.mana;
  const notifCount = acc.notifCount;

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-md border-b border-zinc-800" role="banner">
        <div className="mx-auto max-w-5xl px-3 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 select-none">
            <div className="h-7 w-7 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-100/70" />
            <span className="sr-only">The Arcanum</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => go('/wallet')}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors"
            aria-label="Open Wallet"
          >
            <span className="text-sm font-semibold tabular-nums">{mana.toLocaleString()}</span>
            <Gem size={18} aria-hidden="true" />
          </button>

          <BadgeCounter count={notifCount} max={9}>
            <button
              onClick={() => go('/notifications')}
              className="p-2 rounded-md hover:bg-white/5 active:bg-white/10"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
          </BadgeCounter>

          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 rounded-md hover:bg-white/5 active:bg-white/10"
            aria-expanded={open}
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/60" aria-label="Close Menu" onClick={() => setOpen(false)} />
          <aside className="absolute top-14 right-0 bottom-0 w-80 max-w-[88vw] bg-black/90 backdrop-blur-md border-l border-zinc-800 shadow-2xl">
            <nav className="p-3 space-y-1">
              <DrawerItem icon={<UserCog size={18} />} label="Account" onClick={() => go('/account')} />
              <DrawerItem icon={<Wallet size={18} />}   label="Wallet"  onClick={() => go('/wallet')} />
              <DrawerItem icon={<ArrowLeftRight size={18} />} label="Exchange" onClick={() => go('/exchange')} />
              <DrawerItem icon={<Bell size={18} />}    label="Notifications" onClick={() => go('/notifications')} />
              <DrawerItem icon={<Settings size={18} />} label="Preferences"   onClick={() => go('/preferences')} />
            </nav>
          </aside>
        </div>
      )}

      <ACCOnboardingModal />
    </>
  );
}

function DrawerItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 active:bg:white/10"
    >
      <span className="shrink-0 text-zinc-200">{icon}</span>
      <span className="text-sm text-zinc-100">{label}</span>
      <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
    </button>
  );
}
