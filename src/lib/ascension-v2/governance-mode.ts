/**
 * Governance Mode — types, copy, and tier-gating for the Ascension export
 * mode picker (OBSERVE / SOFT / ENFORCE).
 *
 * This module is metadata-only. It does NOT touch Layer 2 internals or the
 * runtime wrapper. The chosen mode is captured at export time and applied
 * later via a Layer 2 init constant + CMPSBL_MODE env override (Step 3 —
 * pending governor approval).
 *
 * © CMPSBL® — All rights reserved.
 */

export type GovernanceMode = 'observe' | 'soft' | 'enforce';

export interface GovernanceModeMeta {
  readonly id: GovernanceMode;
  readonly label: string;
  readonly tagline: string;
  readonly summary: string;
  readonly bullets: ReadonlyArray<string>;
  readonly footnote: string;
  readonly accent: 'emerald' | 'amber' | 'rose';
}

/**
 * Marketing-warm copy. Never says "changes your code" — always:
 * governs / influences / wraps / oversees / protects.
 */
export const GOVERNANCE_MODES: ReadonlyArray<GovernanceModeMeta> = [
  {
    id: 'observe',
    label: 'Observe',
    tagline: 'Watches and learns. Governs silently.',
    summary:
      'Ascension keeps a quiet eye on your code. Nothing is ever blocked — your app behaves exactly as it always has, and we learn what protection it would benefit from.',
    bullets: [
      'Your code runs identically to before',
      'Governance is in listening mode only',
      'Insights collected for later upgrade',
    ],
    footnote: 'Recommended for first-time installs.',
    accent: 'emerald',
  },
  {
    id: 'soft',
    label: 'Soft',
    tagline: 'Influences with friendly warnings.',
    summary:
      'Ascension watches and warns. When something looks risky, you see a clear console note explaining what would have happened in full enforcement — but your code keeps running.',
    bullets: [
      'Console warnings on risky activity',
      'Nothing is ever blocked',
      'Great for staging environments',
    ],
    footnote: 'A gentle on-ramp before going fully protected.',
    accent: 'amber',
  },
  {
    id: 'enforce',
    label: 'Enforce',
    tagline: 'Full governance. Production-grade protection.',
    summary:
      'Ascension actively protects. Risky calls can be paused, rate-limited, or denied based on the rules wrapped around your functions. Built for production hardening.',
    bullets: [
      'Active protection on risky surfaces',
      'Full audit trail with reasons',
      'Tunable per-rule via your dashboard',
    ],
    footnote: 'For teams ready to lock down production.',
    accent: 'rose',
  },
];

/**
 * Tier ceiling for mode selection.
 * Free (Builder) → OBSERVE only.
 * Pro → SOFT + ENFORCE (and OBSERVE).
 * Enterprise / Governor → all modes.
 */
export function isModeAllowed(
  mode: GovernanceMode,
  effectiveTier: 'builder' | 'pro' | 'enterprise',
  isGovernor: boolean,
): boolean {
  if (isGovernor) return true;
  if (mode === 'observe') return true;
  // soft + enforce both unlock at Pro
  return effectiveTier === 'pro' || effectiveTier === 'enterprise';
}

/**
 * Default mode for first paint — always the safest option.
 */
export const DEFAULT_GOVERNANCE_MODE: GovernanceMode = 'observe';

/**
 * SessionStorage key used by V2UploadStep to stash a source-code snippet
 * for the preview panel. Ephemeral, never persisted server-side.
 */
export const SOURCE_PREVIEW_STORAGE_KEY = 'cmpsbl:v2:source-preview';

/**
 * SessionStorage key for the captured mode + per-finding adjustments.
 * Read by the export pipeline (Step 3) when injecting the Layer 2
 * mode constant.
 */
export const MODE_SELECTION_STORAGE_KEY = 'cmpsbl:v2:mode-selection';

export interface ModeSelectionPayload {
  readonly mode: GovernanceMode;
  /** Function names the user explicitly excluded from governance. */
  readonly excludedFunctions: ReadonlyArray<string>;
  readonly chosenAt: string; // ISO timestamp
}

/** Safely read the source preview snippet stashed by the upload step. */
export function readSourcePreview(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(SOURCE_PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist the chosen mode + adjustments for the export pipeline. */
export function writeModeSelection(payload: ModeSelectionPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(MODE_SELECTION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* non-fatal */
  }
}

/** Read the most recent mode selection (for export pipeline / debugging). */
export function readModeSelection(): ModeSelectionPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(MODE_SELECTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ModeSelectionPayload) : null;
  } catch {
    return null;
  }
}
