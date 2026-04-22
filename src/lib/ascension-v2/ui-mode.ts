/**
 * Ascension V2 UI Mode — Simple vs Advanced
 *
 * Simple is the default for first-time users: shows only the calm path
 * (upload, mode, layers, download, activation guide). Advanced surfaces the
 * full set of expert panels (contract proof, per-finding policy overrides,
 * capability provenance, harness details, language status notice).
 *
 * Choice persists in localStorage so power users flip it once and forget.
 *
 * © CMPSBL® — All rights reserved.
 */
import { useEffect, useState, useCallback } from 'react';

export type V2UiMode = 'simple' | 'advanced';

const STORAGE_KEY = 'cmpsbl_v2_ui_mode';
export const DEFAULT_V2_UI_MODE: V2UiMode = 'simple';

export function readV2UiMode(): V2UiMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'advanced' ? 'advanced' : 'simple';
  } catch {
    return DEFAULT_V2_UI_MODE;
  }
}

export function writeV2UiMode(mode: V2UiMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* non-fatal — user just doesn't get persistence */
  }
}

export function useV2UiMode(): {
  mode: V2UiMode;
  setMode: (next: V2UiMode) => void;
  isAdvanced: boolean;
} {
  const [mode, setModeState] = useState<V2UiMode>(DEFAULT_V2_UI_MODE);

  // Hydrate after mount so SSR/first paint stays deterministic.
  useEffect(() => {
    setModeState(readV2UiMode());
  }, []);

  const setMode = useCallback((next: V2UiMode) => {
    setModeState(next);
    writeV2UiMode(next);
  }, []);

  return { mode, setMode, isAdvanced: mode === 'advanced' };
}
