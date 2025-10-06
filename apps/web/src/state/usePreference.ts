'use client';

import { useEffect, useState } from 'react';

export type Preferences = {
  reducedMotion: boolean;
};

const KEY = 'prefs';

export default function usePreference(): [Preferences, (p: Partial<Preferences>) => void] {
  const [prefs, setPrefs] = useState<Preferences>({ reducedMotion: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  const update = (p: Partial<Preferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...p };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return [prefs, update];
}
