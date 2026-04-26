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

  const acc = useAccount();
  const mana = acc.mana;
  const notifCount = acc.notifCount;

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-black/60 pt-[env(safe-area-inset-top)] backdrop-blur-md"
        role="banner"
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-3">
          <div className="flex select-none items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-100/70" />
            <span className="sr-only">The Arcanum</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => go('/wallet')}
            className="flex items-center gap-1.5 text-amber-300 transition-colors hover:text-amber-200"
            aria-label="Open Wallet"
          >
            <span className="text-sm font-semibold tabular-nums">{mana.toLocaleString()}</span>
            <Gem size={18} aria-hidden="true" />
          </button>

          <BadgeCounter count={notifCount} max={9}>
            <button
              onClick={() => go('/notifications')}
              className="rounded-md p-2 hover:bg-white/5 active:bg-white/10"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
          </BadgeCounter>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 hover:bg-white/5 active:bg-white/10"
            aria-expanded={open}
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Close Menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-14 bottom-0 w-80 max-w-[88vw] border-l border-zinc-800 bg-black/90 shadow-2xl backdrop-blur-md">
            <nav className="space-y-1 p-3">
              <DrawerItem icon={<UserCog size={18} />} label="Account" onClick={() => go('/account')} />
              <DrawerItem icon={<Wallet size={18} />} label="Wallet" onClick={() => go('/wallet')} />
              <DrawerItem icon={<ArrowLeftRight size={18} />} label="Exchange" onClick={() => go('/exchange')} />
              <DrawerItem icon={<Bell size={18} />} label="Notifications" onClick={() => go('/notifications')} />
              <DrawerItem icon={<Settings size={18} />} label="Preferences" onClick={() => go('/preferences')} />
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 active:bg-white/10"
    >
      <span className="shrink-0 text-zinc-200">{icon}</span>
      <span className="text-sm text-zinc-100">{label}</span>
      <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
    </button>
  );
}
