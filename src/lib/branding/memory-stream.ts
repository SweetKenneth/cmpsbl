/**
 * Memory Stream — Branding constants
 * UI copy only. No backend logic.
 * 
 * Import these in any component that references the Memory Stream experience.
 * Keeps terminology consistent and easy to update in one place.
 */

// ── Core events ─────────────────────────────────────────────────
export const MEMORY_STREAM_EVENT =
  "Memory Crystallized from Memory Stream";

export const MEMORY_STREAM_ACTION =
  "Crystallize Memory";

export const MEMORY_STREAM_EMPTY =
  "No viable memories crystallized from Memory Stream";

// ── Descriptions ────────────────────────────────────────────────
export const MEMORY_STREAM_TAGLINE =
  "The Memory Stream is a continuous substrate of evolving software systems.";

export const MEMORY_STREAM_SUBTITLE =
  "Discover crystallized memories from the Memory Stream — real, scored software you can export and use.";

export const MEMORY_STREAM_QUALITY_NOTE =
  "Quality floor: 68+ · Every pull is real software";

export const MEMORY_STREAM_PROVENANCE =
  "Crystallized Memory Stream Artifact";

// ── Actions ─────────────────────────────────────────────────────
export const MEMORY_STREAM_CTA_AUTH =
  "Sign in to Start Crystallizing";

export const MEMORY_STREAM_CTA_EXPLORE =
  "Explore the Memory Stream";

export const MEMORY_STREAM_MATERIALIZE =
  "Materialize Memory";

// ── Packs & Slots (Memory-branded) ────────────────────────────
export const PIPELINE_PACK_LABEL = "Memory Pack";
export const PIPELINE_PACKS_LABEL = "Memory Packs";
export const PIPELINE_SLOT_LABEL = "Memory Slot";
export const PIPELINE_SLOTS_LABEL = "Memory Slots";

export const PIPELINE_PACK_DESCRIPTION =
  "24 memory packs. 6 strategic domains. Every pack = 1 slot. Choose capabilities that match your workload — swap anytime.";

export const PIPELINE_PACK_GATE_MESSAGE =
  "This feature requires an active memory pack.";

export const PIPELINE_SLOT_TOOLTIP = (activeCount: number, capacity: number, remaining: number, atCapacity: boolean) =>
  `${activeCount} of ${capacity} slots active. Every memory pack uses exactly 1 slot.${
    atCapacity
      ? " Deactivate a pack or upgrade to unlock more slots."
      : ` ${remaining} slot${remaining !== 1 ? "s" : ""} remaining.`
  }`;

// ── How It Works Steps ──────────────────────────────────────────
export const PIPELINE_STEPS = [
  { title: "Start free", description: "Create an account and get 3 memory slots immediately. No credit card. Full runtime access." },
  { title: "Activate packs", description: "Choose from 24 memory packs across 6 strategic domains. Each pack unlocks a specific set of capabilities." },
  { title: "Slots create structure", description: "Every pack uses exactly one slot. Your plan controls how many slots you have — not which packs you can see." },
  { title: "Governance enforces boundaries", description: "Activation is atomic and server-enforced. No race conditions, no overflows, no ungoverned capability sprawl." },
] as const;

// ── Phases ──────────────────────────────────────────────────────
export const CRYSTALLIZATION_PHASES = [
  { key: "sampling",      label: "Sampling Memory Stream...",  color: "sky" },
  { key: "condensing",    label: "Condensing topology...",     color: "amber" },
  { key: "crystallizing", label: "Crystallizing memory...",    color: "primary" },
] as const;
