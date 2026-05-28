"use client";

import { useEffect, useState } from "react";

export type Preferences = {
  reducedMotion: boolean;
  moduleReveal: boolean;
  autoSyncWallet: boolean;
};

const KEY = "prefs:v2";
const DEFAULTS: Preferences = {
  reducedMotion: false,
  moduleReveal: true,
  autoSyncWallet: true,
};

export default function usePreference(): [Preferences, (patch: Partial<Preferences>) => void] {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setPrefs({
          ...DEFAULTS,
          ...(JSON.parse(raw) as Partial<Preferences>),
        });
      }
    } catch {
      // ignore corrupt preference state
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = prefs.reducedMotion ? "1" : "0";
    document.documentElement.dataset.moduleReveal = prefs.moduleReveal ? "1" : "0";
    document.documentElement.dataset.autoSyncWallet = prefs.autoSyncWallet ? "1" : "0";
  }, [prefs]);

  const update = (patch: Partial<Preferences>) => {
    setPrefs((previous) => {
      const next = { ...previous, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return [prefs, update];
}
