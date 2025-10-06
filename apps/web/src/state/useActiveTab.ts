'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type UseActiveTabOpts = {
  tabs: string[];
  defaultTab?: string;
  pushHistory?: boolean;
  param?: string;
};

export type ActiveTab = {
  tab: string;
  index: number;
  set: (key: string) => void;
  next: () => void;
  prev: () => void;
  href: (key: string) => string;
};

export function useActiveTab({
  tabs,
  defaultTab = tabs[0],
  pushHistory = false,
  param = 'tab',
}: UseActiveTabOpts): ActiveTab {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();

  const current = React.useMemo(() => {
    const q = sp?.get(param) ?? '';
    return tabs.includes(q) ? q : defaultTab;
  }, [sp, param, tabs, defaultTab]);

  const index = React.useMemo(() => Math.max(0, tabs.indexOf(current)), [tabs, current]);

  const href = React.useCallback(
    (key: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, tabs.includes(key) ? key : defaultTab);
      url.pathname = pathname || url.pathname;
      return url.pathname + '?' + url.searchParams.toString();
    },
    [defaultTab, param, pathname, tabs]
  );

  const navigate = React.useCallback(
    (key: string) => {
      const target = tabs.includes(key) ? key : defaultTab;
      const url = href(target);
      pushHistory ? router.push(url) : router.replace(url);
    },
    [defaultTab, href, pushHistory, router, tabs]
  );

  const set = React.useCallback((key: string) => navigate(key), [navigate]);

  const next = React.useCallback(() => {
    const i = (index + 1) % tabs.length;
    navigate(tabs[i]);
  }, [index, navigate, tabs]);

  const prev = React.useCallback(() => {
    const i = (index - 1 + tabs.length) % tabs.length;
    navigate(tabs[i]);
  }, [index, navigate, tabs]);

  return { tab: current, index, set, next, prev, href };
}
