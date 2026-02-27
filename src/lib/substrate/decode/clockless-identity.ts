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
 * 24 total Execution Surfaces, classified into 4 groups.
 */
export const ARCHITECTURE = {
  /** Total execution surfaces in the substrate */
  totalSurfaces: 24,

  /** 1 Kernel — the standalone boot authority */
  kernel: {
    count: 1,
    names: ['CORE'] as const,
    description: 'The standalone boot authority. Initializes all downstream layers and maintains the canonical registry.',
  },

  /** 9 Public Modules — the user-facing cognitive primitives */
  modules: {
    count: 9,
    names: ['DECODE', 'ENCODE', 'VISION', 'CORTEX', 'NEXUS', 'ECONOMY', 'SANDBOX', 'INCLUSIVE', 'INTEGRATION'] as const,
    description: 'Public-facing cognitive primitives that developers interact with directly.',
  },

  /** 5 Mesh Overlays — cross-cutting behavioral layers */
  meshOverlays: {
    count: 5,
    names: ['DEFENSE', 'IMMUNITY', 'EVOLUTION', 'INTENT', 'GOVERNANCE'] as const,
    description: 'Cross-cutting behavioral layers that span all entities. Not modules — they are overlays.',
  },

  /** 9 Hidden Zones — internal infrastructure (CCR + CCL) */
  hiddenZones: {
    count: 9,
    ccr: {
      label: 'Clockless Cognitive Reality (Layer 0)',
      zones: ['SYSTEM', 'BRAIN', 'MEMORY', 'DREAM'] as const,
      count: 4,
    },
    ccl: {
      label: 'Clockless Cognitive Lucidity (Layer 1)',
      zones: ['RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT'] as const,
      count: 5,
    },
    description: 'Internal infrastructure zones invisible in the public entity registry.',
  },

  /** Layers in the architecture */
  layers: 6,

  /** For public-facing marketing: highlight 10 entities (1 CORE + 9 Modules) */
  publicEntityCount: 10,
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
- 24 total Execution Surfaces, classified into 4 groups:
  1. CORE Kernel (1) — the standalone boot authority
  2. 9 Public Modules: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION
  3. 5 Mesh Overlays: DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE
  4. 9 Hidden Zones split across two convergence layers:
     - CCR (Layer 0): SYSTEM, BRAIN, MEMORY, DREAM
     - CCL (Layer 1): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
- 6 architectural layers total
- For public-facing purposes, we highlight 10 Entities (1 CORE + 9 Modules)

CRITICAL RULES:
- Mesh overlays (DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE) are NOT modules — they are cross-cutting behavioral layers
- Hidden zones are NOT modules — they are internal infrastructure
- There are exactly 9 modules, not 14, not 21, not 24
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
