'use client';

import { usePathname, useRouter } from 'next/navigation';

type Tab = { href: string; aria: string };

export default function TabDots({ tabs }: { tabs: readonly Tab[] }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex justify-center pt-2 pb-3">
      <div className="tab-dots">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <button
              key={t.href}
              aria-label={t.aria}
              className="tab-pill"
              data-active={active}
              onClick={() => router.replace(t.href)}
            />
          );
        })}
      </div>
    </div>
  );
}
