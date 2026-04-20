/**
 * Ascension V2 — Re-attach handoff
 *
 * Lets "My Layers" (or the future Re-Ascension button) hand a set of
 * layer IDs to the next V2 run. V2EnhanceStep reads + clears this on
 * mount so the user lands on the Enhance step with their layers already
 * checked.
 *
 * Session-scoped (not persisted) so the intent dies with the tab.
 *
 * © CMPSBL® — All rights reserved.
 */

const KEY = 'ascension_v2_reattach_layers';

export function setReattachLayers(layerIds: string[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(layerIds));
  } catch {
    /* non-fatal */
  }
}

export function consumeReattachLayers(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
