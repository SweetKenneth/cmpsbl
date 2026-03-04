/**
 * Memory Stream — Branding constants
 * UI copy only. No backend logic.
 * 
 * Import these in any component that references the Memory Stream experience.
 * Keeps terminology consistent and easy to update in one place.
 */

// ── Core events ─────────────────────────────────────────────────
export const MEMORY_STREAM_EVENT =
  "Pipeline Crystallized from Memory Stream";

export const MEMORY_STREAM_ACTION =
  "Crystallize Pipeline";

export const MEMORY_STREAM_EMPTY =
  "No viable pipelines crystallized from Memory Stream";

// ── Descriptions ────────────────────────────────────────────────
export const MEMORY_STREAM_TAGLINE =
  "The Memory Stream is a continuous substrate of evolving software systems.";

export const MEMORY_STREAM_SUBTITLE =
  "Discover crystallized pipelines from the Memory Stream — real, scored software you can export and use.";

export const MEMORY_STREAM_QUALITY_NOTE =
  "Quality floor: 68+ · Every pull is real software";

export const MEMORY_STREAM_PROVENANCE =
  "Crystallized Memory Stream Pipeline";

// ── Actions ─────────────────────────────────────────────────────
export const MEMORY_STREAM_CTA_AUTH =
  "Sign in to Start Crystallizing";

export const MEMORY_STREAM_CTA_EXPLORE =
  "Explore the Memory Stream";

export const MEMORY_STREAM_MATERIALIZE =
  "Materialize Pipeline";

// ── Phases ──────────────────────────────────────────────────────
export const CRYSTALLIZATION_PHASES = [
  { key: "sampling",      label: "Sampling Memory Stream...",  color: "sky" },
  { key: "condensing",    label: "Condensing topology...",     color: "amber" },
  { key: "crystallizing", label: "Crystallizing pipeline...",  color: "primary" },
] as const;
