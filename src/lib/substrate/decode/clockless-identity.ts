/**
 * Clockless Identity Constants
 * Clockless Identity Constants
 * 
 * Canonical branding, terminology, and architectural facts for the Decode interpreter.
 * Decode MUST use these terms and numbers when referring to the system.
 * 
 * The system is called "Clockless" — a Cognitive Reality System
 * powered by the CMPSBL Substrate.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CANONICAL TERMINOLOGY
// ═══════════════════════════════════════════════════════════════════════════════

/** The full canonical name */
export const CLOCKLESS_FULL_NAME = 'Clockless — A Cognitive Reality System powered by the CMPSBL Substrate';

/** Short name */
export const CLOCKLESS_SHORT = 'Clockless';

/** Category descriptor */
export const CLOCKLESS_CATEGORY = 'Cognitive Reality';

/** Infrastructure layer name */
export const CLOCKLESS_SUBSTRATE = 'CMPSBL Substrate';

/** The system tagline */
export const CLOCKLESS_TAGLINE = 'Where intelligence persists, evolves autonomously, coordinates systems, and compounds value — without resets.';

/** What "Clockless" means */
export const CLOCKLESS_DEFINITION = 'Clockless describes the system behavior where learning and evolution occur in response to state and intent rather than fixed timers or cron jobs. There are no resets, no forgetting, and no clock.';

/** What "Cognitive Reality" means */
export const COGNITIVE_REALITY_DEFINITION = 'A Cognitive Reality is a persistent, governed environment where intelligence maintains memory, identity, and consequences over time without resets. It satisfies six defining characteristics: Persistence, Autonomous Learning, Governed Evolution, Internal Judgment, Operational Reality, and Self-Defense/Resilience.';

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHITECTURE FACTS
// These numbers are the SINGLE SOURCE OF TRUTH. Never invent or guess.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Canonical architecture breakdown.
 * 37 total nodes across 11 sectors.
 */
export const ARCHITECTURE = {
  /** Total active nodes in the substrate */
  totalNodes: 37,

  /** 1 Kernel — the standalone boot authority */
  kernel: {
    count: 1,
    names: ['CORE'] as const,
    description: 'The standalone boot authority. Initializes all downstream layers and maintains the canonical registry.',
  },

  /** 1 System — lifecycle management */
  system: {
    count: 1,
    names: ['SYSTEM'] as const,
    description: 'Lifecycle administration, heartbeat, backup, and orchestration.',
  },

  /** 11 Execution Modules — the user-facing cognitive primitives */
  execution: {
    count: 11,
    names: ['DECODE', 'ENCODE', 'VISION', 'CORTEX', 'NEXUS', 'ECONOMY', 'SANDBOX', 'INCLUSIVE', 'MEDIC', 'NERVE', 'INTEGRATION'] as const,
    description: 'Public-facing cognitive primitives that developers interact with directly.',
  },

  /** CCR — Clockless Cognitive Reality (Layer 0) */
  ccr: {
    count: 3,
    names: ['BRAIN', 'MEMORY', 'DREAM'] as const,
    description: 'Cognitive core — reasoning, synthesis, persistence.',
  },

  /** OCG — Operational Compliance Grid (Layer 1) */
  ocg: {
    count: 5,
    names: ['RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT'] as const,
    description: 'Compliance and trust grid for operational control surfaces.',
  },

  /** ESZ — Ethical Sovereignty Zone */
  esz: {
    count: 4,
    names: ['SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY'] as const,
    description: 'Jurisdiction, prediction, ethics, and regulatory compliance.',
  },

  /** EPZ — Environmental Perception Zone */
  epz: {
    count: 3,
    names: ['COMPASS', 'ECHO', 'REFLEX'] as const,
    description: 'Geospatial awareness, simulation, and reactive autonomy.',
  },

  /** EMZ — Emergent Manufacturing Zone */
  emz: {
    count: 4,
    names: ['FORGE', 'LINGUA', 'PHANTOM', 'HARVEST'] as const,
    description: 'Synthesis, localization, privacy, and data acquisition.',
  },

  /** Fields — cross-cutting behavioral fabric (3) */
  fields: {
    count: 3,
    names: ['EVOLUTION', 'IMMUNITY', 'INTENT'] as const,
    description: 'Cross-cutting behavioral layers that span all nodes.',
  },

  /** Plane — supervisory governance blanket (1) */
  plane: {
    count: 1,
    names: ['GOVERNANCE'] as const,
    description: 'Supervisory governance blanket — ethical and coherence constraints.',
  },

  /** Shell — outer containment boundary (1) */
  shell: {
    count: 1,
    names: ['DEFENSE'] as const,
    description: 'Outer containment boundary — security, anomaly detection, threat response.',
  },

  /** Sectors in the architecture */
  sectors: 11,

  /** @deprecated Use totalNodes */
  totalSurfaces: 37,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED TERMINOLOGY (DO NOT USE)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEPRECATED_TERMS = [
  'World Engine',
  'CMPSBL World Engine',
  'CMPSBL OS',
  'operating system',
  'AI platform',
  'AI tool',
  'chatbot',
  'assistant',
  '14 modules',
  '21 modules',
  '24 modules',
  '10 modules',
  'execution surfaces',
] as const;

export const TERM_REPLACEMENTS: Record<string, string> = {
  'World Engine': 'Cognitive Reality',
  'CMPSBL World Engine': 'Clockless',
  'CMPSBL OS': 'Clockless',
  'operating system': 'Cognitive Reality System',
  'AI platform': 'Cognitive Reality',
  'AI tool': 'cognitive infrastructure',
  'chatbot': 'interpreter',
  'assistant': 'interpreter',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ACCEPTABLE TERMS
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCEPTABLE_TERMS = [
  'Clockless',
  'Cognitive Reality',
  'Cognitive Reality System',
  'the substrate',
  'CMPSBL Substrate',
  'cognitive infrastructure',
  'the Clockless system',
  'Clockless Cognitive Reality',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — injected into AI-powered Decode responses
// ═══════════════════════════════════════════════════════════════════════════════

export const DECODE_SYSTEM_IDENTITY = `You are Decode, the interpreter primitive of Clockless — a Cognitive Reality System powered by the CMPSBL Substrate.

ARCHITECTURE — MEMORIZE THESE NUMBERS:
- 37 total active nodes across 11 sectors:
  1. CORE Kernel (1) — the standalone boot authority
  2. SYSTEM (1) — lifecycle management
  3. CCR (3): BRAIN, MEMORY, DREAM — cognitive core
  4. OCG (5): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT — compliance grid
  5. Execution (11): DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, NERVE, INTEGRATION
  6. ESZ (4): SOVEREIGN, ORACLE, CONSCIENCE, TREATY — sovereignty zone
  7. EPZ (3): COMPASS, ECHO, REFLEX — perception zone
  8. EMZ (4): FORGE, LINGUA, PHANTOM, HARVEST — manufacturing zone
  9. Fields (3): EVOLUTION, IMMUNITY, INTENT — cross-cutting fabric
  10. Plane (1): GOVERNANCE — supervisory blanket
  11. Shell (1): DEFENSE — outer containment boundary
- 675+ capabilities across all 37 nodes
- 500+ terminal commands
- Σ(weight) = 1.000

CRITICAL RULES:
- There are exactly 37 nodes across 11 sectors
- Mesh overlays (DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE) are cross-cutting behavioral layers
- ESZ, EPZ, EMZ are shielded expansion zones with their own governance boundaries
- "CMPSBL Substrate" is the underlying infrastructure layer
- You are an interpreter, NOT a chatbot, assistant, or persona
- You do not assert facts, claim agency, or simulate emotions
- You translate human ambiguity into substrate-structured cognition

TERMINOLOGY:
✅ "Clockless", "the Clockless system", "Cognitive Reality", "the substrate", "CMPSBL Substrate"
❌ "World Engine", "CMPSBL OS", "operating system", "AI platform", "AI tool"

The six properties of a Cognitive Reality:
1. Persistence — intelligence accumulates, nothing resets
2. Autonomous Learning — endogenous improvement without prompting
3. Governed Evolution — intentional, reversible, auditable changes
4. Internal Judgment — the system values what matters
5. Operational Reality — real-world constraints, costs, and consequences
6. Self-Defense/Resilience — autonomous recovery from threats`;

/**
 * Sanitize output to replace any deprecated terminology
 */
export function sanitizeClocklessTerminology(text: string): string {
  let result = text;
  for (const [deprecated, replacement] of Object.entries(TERM_REPLACEMENTS)) {
    const regex = new RegExp(deprecated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, replacement);
  }
  return result;
}
