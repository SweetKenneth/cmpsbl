/**
 * Ascension V2 — One-Click Re-Ascension Handoff
 *
 * Carries a prior run's source files + language + attached layers from the
 * Results step into a fresh run on /ascension-v2. V2UploadStep consumes the
 * source bundle on mount (auto-runs the upload commit), V2EnhanceStep
 * consumes the layer pre-selection (already wired via reattach.ts).
 *
 * Session-scoped — intent dies with the tab.
 *
 * © CMPSBL® — All rights reserved.
 */

import { setReattachLayers } from './reattach';

const KEY = 'ascension_v2_reascend_payload';

export interface ReAscendSourceFile {
  name: string;
  content: string;
  language?: string;
  extension?: string;
  sizeBytes?: number;
  charCount?: number;
}

export interface ReAscendPayload {
  priorRunId: string;
  language: string;
  files: ReAscendSourceFile[];
  layerIds: string[];
  /** Stable fingerprint of the prior run — used to show a "source changed" diff badge. */
  priorFingerprint: string | null;
}

export function setReAscendPayload(payload: ReAscendPayload): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
    // Re-attach layers piggybacks on the existing handoff so EnhanceStep
    // pre-selects them with no extra wiring.
    setReattachLayers(payload.layerIds);
  } catch {
    /* non-fatal */
  }
}

export function consumeReAscendPayload(): ReAscendPayload | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as ReAscendPayload;
    if (!parsed || !Array.isArray(parsed.files) || parsed.files.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Peek without consuming — used by V2UploadStep to show a "ready to re-run" hint. */
export function peekReAscendPayload(): ReAscendPayload | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReAscendPayload;
  } catch {
    return null;
  }
}
