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

// ── Packs & Slots (Pipeline-branded) ────────────────────────────
export const PIPELINE_PACK_LABEL = "Pipeline Pack";
export const PIPELINE_PACKS_LABEL = "Pipeline Packs";
export const PIPELINE_SLOT_LABEL = "Pipeline Slot";
export const PIPELINE_SLOTS_LABEL = "Pipeline Slots";

export const PIPELINE_PACK_DESCRIPTION =
  "24 pipeline packs. 6 strategic domains. Every pack = 1 slot. Choose capabilities that match your workload — swap anytime.";

export const PIPELINE_PACK_GATE_MESSAGE =
  "This feature requires an active pipeline pack.";

export const PIPELINE_SLOT_TOOLTIP = (activeCount: number, capacity: number, remaining: number, atCapacity: boolean) =>
  `${activeCount} of ${capacity} slots active. Every pipeline pack uses exactly 1 slot.${
    atCapacity
      ? " Deactivate a pack or upgrade to unlock more slots."
      : ` ${remaining} slot${remaining !== 1 ? "s" : ""} remaining.`
  }`;

// ── How It Works Steps ──────────────────────────────────────────
export const PIPELINE_STEPS = [
  { title: "Start free", description: "Create an account and get 3 pipeline slots immediately. No credit card. Full runtime access." },
  { title: "Activate packs", description: "Choose from 24 pipeline packs across 6 strategic domains. Each pack unlocks a specific set of capabilities." },
  { title: "Slots create structure", description: "Every pack uses exactly one slot. Your plan controls how many slots you have — not which packs you can see." },
  { title: "Governance enforces boundaries", description: "Activation is atomic and server-enforced. No race conditions, no overflows, no ungoverned capability sprawl." },
] as const;

// ── Phases ──────────────────────────────────────────────────────
export const CRYSTALLIZATION_PHASES = [
  { key: "sampling",      label: "Sampling Memory Stream...",  color: "sky" },
  { key: "condensing",    label: "Condensing topology...",     color: "amber" },
  { key: "crystallizing", label: "Crystallizing pipeline...",  color: "primary" },
] as const;
