'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MODULES: Record<string, { label: string; sigil: string }> = {
  hope: { label: 'Hope', sigil: '✦' },
  tempus: { label: 'Tempus', sigil: '☉' },
  nexus: { label: 'Nexus', sigil: '◇' },
  wallet: { label: 'Wallet', sigil: '◈' },
  vitae: { label: 'Vitae', sigil: '✧' },
};

function moduleFromPath(pathname: string) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return MODULES[segment] ? segment : null;
}

function isModuleKey(value: unknown): value is keyof typeof MODULES {
  return typeof value === 'string' && value in MODULES;
}

export default function ModuleDeckReveal() {
  const pathname = usePathname();
  const previousModule = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const [moduleKey, setModuleKey] = useState<string | null>(null);

  const reveal = (key: string) => {
    if (!MODULES[key]) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setModuleKey(null);
    window.requestAnimationFrame(() => {
      setModuleKey(key);
      timerRef.current = window.setTimeout(() => setModuleKey(null), 760);
    });
  };

  useEffect(() => {
    const onReveal = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (isModuleKey(detail?.module)) reveal(detail.module);
    };

    window.addEventListener('arcanum:module-reveal', onReveal);
    return () => {
      window.removeEventListener('arcanum:module-reveal', onReveal);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const nextModule = moduleFromPath(pathname);
    const prevModule = previousModule.current;

    if (nextModule && prevModule && nextModule !== prevModule && moduleKey !== nextModule) {
      reveal(nextModule);
      previousModule.current = nextModule;
      return;
    }

    if (nextModule) previousModule.current = nextModule;
  }, [pathname, moduleKey]);

  if (!moduleKey) return null;

  const module = MODULES[moduleKey];

  return (
    <div className="module-deck-reveal pointer-events-none absolute inset-0 z-[60] grid place-items-center bg-black/20 backdrop-blur-[1px]" aria-hidden="true">
      <div className="module-deck-reveal__stage">
        <div className="module-deck-reveal__card module-deck-reveal__card--left" />
        <div className="module-deck-reveal__card module-deck-reveal__card--center">
          <div className="module-deck-reveal__sigil">{module.sigil}</div>
          <div className="module-deck-reveal__label">{module.label}</div>
        </div>
        <div className="module-deck-reveal__card module-deck-reveal__card--right" />
      </div>
    </div>
  );
}
