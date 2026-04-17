/**
 * Ascension V2 — Mode Flag
 *
 * Lets shared orchestrator / registry / step components branch on
 * 'prod' vs 'beta' without forking the engine.
 *
 * The /beta page sets mode='beta' for its lifecycle; the public
 * /ascension-v2 page leaves it at 'prod'. Detection is session-scoped
 * so navigation between routes flips the mode automatically.
 *
 * Usage in shared code:
 *   import { isBetaMode } from '@/lib/ascension-v2/mode';
 *   if (isBetaMode()) { /* experimental branch */ /* }
 *
 * © CMPSBL® — All rights reserved.
 */

const SESSION_KEY = 'ascension_v2_mode';

export type AscensionMode = 'prod' | 'beta';

/** Set the active mode (called by the page on mount). */
export function setAscensionMode(mode: AscensionMode): void {
  try {
    sessionStorage.setItem(SESSION_KEY, mode);
  } catch {
    /* non-fatal: SSR or storage disabled */
  }
}

/** Read the current mode. Defaults to 'prod' when unset. */
export function getAscensionMode(): AscensionMode {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'beta' ? 'beta' : 'prod';
  } catch {
    return 'prod';
  }
}

/** Convenience: branch on beta mode in shared engine code. */
export function isBetaMode(): boolean {
  return getAscensionMode() === 'beta';
}

/** Reset to prod (called by the prod page on mount to clear stale state). */
export function clearAscensionMode(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* non-fatal */
  }
}
