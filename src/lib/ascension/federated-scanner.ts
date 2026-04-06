/**
 * CMPSBL® Federated Scanner Core
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Separates scanner intelligence into two layers:
 *   1. Spine Layer (24 universal primitives) — shared across all verticals
 *   2. Expansion Layer (16 per-vertical primitives) — domain-specific
 *
 * Cross-pollination: when a vertical confirms a Spine-primitive signal,
 * it propagates to the shared core. Expansion signals stay vertical-local.
 *
 * The federated model follows the existing symbiotic distillation pattern:
 * verticals learn from the parent brain, and the parent brain learns
 * from verticals — compounding intelligence across the ecosystem.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  recordConfirmedMatch,
  getLearnedSignals,
  getHighConfidenceSignals,
  getFeedbackStats,
  type FeedbackExtraction,
  type LearnedSignal,
} from './feedback-loop';
import {
  recordImplementation,
  type RegistryEntry,
} from './ecosystem-registry';
import { runVaultBridge, runReactorChainBridge } from './vault-glossary-bridge';
import type { VaultBridgeResult, ReactorChainBridgeResult } from './vault-glossary-bridge';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — SPINE PRIMITIVE SET
// ═══════════════════════════════════════════════════════════════════════════════

/** The 24 universal Spine primitives shared by every vertical */
const SPINE_PRIMITIVE_IDS = new Set([
  // 12 Organs
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
  // 12 Layers
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'BEACON', 'SHADOW',
]);

/** Check if a primitive belongs to the universal Spine */
export function isSpinePrimitive(primitiveId: string): boolean {
  return SPINE_PRIMITIVE_IDS.has(primitiveId.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — VERTICAL EXPANSION REGISTRIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Expansion primitives per vertical (16 each: 8 Engines + 8 Agents) */
const VERTICAL_EXPANSION_PRIMITIVES: Record<string, Set<string>> = {
  cyber: new Set([
    'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST',
    'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
  ]),
  robotics: new Set([
    'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER',
    'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
  ]),
  quantum: new Set([
    'HADRON', 'QUBIT', 'PHOTON', 'FERMION', 'ENTANGLE', 'LATTICE', 'PLASMA', 'CRYOGEN',
    'MUON', 'BOSON', 'NEUTRINO', 'GLUON', 'GRAVITON', 'TACHYON', 'MESON', 'PRISM',
  ]),
  llm: new Set([
    'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE',
    'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
  ]),
  agency: new Set([
    'MANDATE', 'DELEGATE', 'RECONN', 'UPLINK', 'SCRIBE', 'INCENTIVE', 'REASON', 'TOOLKIT',
    'OPERATOR', 'OVERSEER', 'LIAISON', 'SCHOLAR', 'ENVOY', 'WARDEN', 'ROGUE', 'ANCHOR',
  ]),
  media: new Set([
    'CANVAS', 'PALETTE', 'RHYTHM', 'LENS', 'STAGE', 'MUSE', 'RENDER', 'SCORE',
    'DIRECTOR', 'CURATOR', 'CRITIC', 'PUBLISHER', 'ARCHIVIST', 'MIXER', 'COMPOSER', 'NARRATOR',
  ]),
};

/** Get expansion primitive IDs for a vertical */
export function getExpansionPrimitives(verticalId: string): Set<string> {
  return VERTICAL_EXPANSION_PRIMITIVES[verticalId] ?? new Set();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — VERTICAL DOMAIN VOCABULARY
// ═══════════════════════════════════════════════════════════════════════════════
//
// Domain-specific vocabulary that augments the universal 25 archetype
// signatures when scanning within a specific vertical context.
// ═══════════════════════════════════════════════════════════════════════════════

const VERTICAL_DOMAIN_VOCABULARY: Record<string, Record<string, RegExp>> = {
  cyber: {
    'threat-intel': /\b(sigma.?rule|yara|stix|taxii|mitre|att&ck|cve|ioc|threat.?feed|indicator)\b/i,
    'incident-response': /\b(incident|playbook|containment|eradication|forensic|triage|escalat|siem)\b/i,
    'pen-testing': /\b(pentest|exploit|payload|shellcode|fuzzing|vuln.?scan|red.?team|ctf)\b/i,
  },
  robotics: {
    'motion-control': /\b(servo|actuator|pid|trajectory|kinematics|dynamics|jerk|torque|imu)\b/i,
    'perception': /\b(lidar|slam|point.?cloud|depth.?map|stereo|odometry|sensor.?fusion|voxel)\b/i,
    'planning': /\b(path.?plan|rrt|a.?star|motion.?plan|obstacle|collision|grasp|manipulat)\b/i,
  },
  quantum: {
    'circuit-design': /\b(qubit|gate|hadamard|cnot|toffoli|grover|shor|circuit|register|entangle)\b/i,
    'error-correction': /\b(surface.?code|stabilizer|syndrome|logical.?qubit|fault.?toleran|topolog)\b/i,
    'optimization': /\b(qaoa|vqe|annealing|hamiltonian|variational|eigensolv|ising|maxcut)\b/i,
  },
  llm: {
    'prompt-engineering': /\b(prompt|few.?shot|chain.?of.?thought|system.?message|template|instruct)\b/i,
    'guardrails': /\b(guardrail|safety|content.?filter|moderation|toxicity|hallucination|ground.?truth)\b/i,
    'rag': /\b(retrieval|embedding|vector.?store|chunk|semantic.?search|rerank|context.?window)\b/i,
  },
  agency: {
    'task-decomposition': /\b(decompos|sub.?task|work.?breakdown|delegation|assign|dispatch|queue)\b/i,
    'multi-agent': /\b(multi.?agent|swarm|consensus|negotiat|coordinat|collaborat|team|ensemble)\b/i,
    'tool-use': /\b(tool.?call|function.?call|plugin|action|executor|capability|skill|api.?call)\b/i,
  },
  media: {
    'content-generation': /\b(render|composit|transcode|encode|stream|frame|pixel|resolution|bitrate)\b/i,
    'creative-ai': /\b(diffusion|gan|style.?transfer|inpaint|upscale|denoise|super.?resolut|neural.?style)\b/i,
    'asset-management': /\b(asset|catalog|metadata|tag|archive|version|publish|distribute|cdn)\b/i,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — FEDERATED SIGNAL STORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Per-vertical learned signals (expansion primitives only).
 * Spine signals go to the shared feedback loop; expansion signals
 * are stored here and only visible within their vertical context.
 */
const verticalSignalStores = new Map<string, Map<string, LearnedSignal>>();
const MAX_VERTICAL_SIGNALS = 500;

function getVerticalStore(verticalId: string): Map<string, LearnedSignal> {
  let store = verticalSignalStores.get(verticalId);
  if (!store) {
    store = new Map();
    verticalSignalStores.set(verticalId, store);
  }
  return store;
}

/**
 * Record a confirmed match with federation awareness.
 * - Spine primitive signals → shared feedback loop (universal)
 * - Expansion primitive signals → vertical-local store
 */
export function recordFederatedMatch(
  extraction: FeedbackExtraction,
  verticalId: string,
): { spineSignals: number; expansionSignals: number } {
  const primitive = extraction.primitive.toUpperCase();

  if (isSpinePrimitive(primitive)) {
    // Spine signals go to the universal shared feedback loop
    const added = recordConfirmedMatch(extraction);
    return { spineSignals: added.length, expansionSignals: 0 };
  }

  // Expansion signals go to the vertical-local store
  const store = getVerticalStore(verticalId);
  const now = Date.now();
  let count = 0;

  for (const id of extraction.identifiers) {
    const key = `${primitive}::${id}`;
    const existing = store.get(key);
    if (existing) {
      existing.confirmations++;
      existing.weight = Math.min(1, existing.weight + 0.1);
      existing.lastConfirmed = now;
    } else {
      if (store.size >= MAX_VERTICAL_SIGNALS) {
        // Evict weakest
        let weakestKey = '';
        let weakestWeight = Infinity;
        for (const [k, s] of store) {
          if (s.weight < weakestWeight) { weakestWeight = s.weight; weakestKey = k; }
        }
        if (weakestKey) store.delete(weakestKey);
      }
      store.set(key, {
        term: id,
        primitive,
        archetypeId: extraction.archetypeId,
        confirmations: 1,
        weight: 0.3,
        firstSeen: now,
        lastConfirmed: now,
      });
      count++;
    }
  }

  return { spineSignals: 0, expansionSignals: count };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — VERTICAL SCANNER INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface VerticalScannerInstance {
  verticalId: string;
  /** Prime this vertical's scanner with shared Spine intelligence + domain vocabulary */
  prime(): VerticalPrimeResult;
  /** Record a confirmed match (auto-routes Spine vs Expansion) */
  recordMatch(extraction: FeedbackExtraction): { spineSignals: number; expansionSignals: number };
  /** Get combined signals: shared Spine + vertical-local expansion */
  getCombinedSignals(minWeight?: number): Map<string, string[]>;
  /** Get domain vocabulary patterns for this vertical */
  getDomainVocabulary(): Record<string, RegExp>;
  /** Get vertical-specific stats */
  getStats(): VerticalScannerStats;
}

export interface VerticalPrimeResult {
  /** Vault bridge signals injected (shared) */
  vaultSignals: number;
  /** Reactor chain signals injected (shared) */
  chainSignals: number;
  /** Domain vocabulary patterns loaded */
  domainPatterns: number;
  durationMs: number;
}

export interface VerticalScannerStats {
  verticalId: string;
  expansionSignals: number;
  sharedSpineSignals: number;
  domainPatterns: number;
  expansionPrimitives: number;
}

/**
 * Create a scanner instance for a specific vertical.
 * The instance:
 *   1. Shares the universal Spine glossary (read/write)
 *   2. Maintains its own expansion signal store
 *   3. Applies domain-specific vocabulary overlays
 */
export function createVerticalScanner(verticalId: string): VerticalScannerInstance {
  const expansionSet = getExpansionPrimitives(verticalId);
  const domainVocab = VERTICAL_DOMAIN_VOCABULARY[verticalId] ?? {};

  const prime = (): VerticalPrimeResult => {
    const start = performance.now();

    // Shared intelligence: vault bridge + reactor chain bridge
    // These prime the universal Spine glossary that all verticals share
    const vaultResult: VaultBridgeResult = runVaultBridge();
    const chainResult: ReactorChainBridgeResult = runReactorChainBridge();

    return {
      vaultSignals: vaultResult.signalsInjected,
      chainSignals: chainResult.signalsInjected,
      domainPatterns: Object.keys(domainVocab).length,
      durationMs: Math.round(performance.now() - start),
    };
  };

  const recordMatch = (extraction: FeedbackExtraction) => {
    return recordFederatedMatch(extraction, verticalId);
  };

  const getCombinedSignals = (minWeight = 0.4): Map<string, string[]> => {
    // Start with shared Spine signals
    const combined = getHighConfidenceSignals(minWeight);

    // Add vertical-local expansion signals
    const store = getVerticalStore(verticalId);
    for (const sig of store.values()) {
      if (sig.weight >= minWeight) {
        const existing = combined.get(sig.primitive) ?? [];
        existing.push(sig.term);
        combined.set(sig.primitive, existing);
      }
    }

    return combined;
  };

  const getDomainVocabulary = () => domainVocab;

  const getStats = (): VerticalScannerStats => {
    const store = getVerticalStore(verticalId);
    const spineStats = getFeedbackStats();

    return {
      verticalId,
      expansionSignals: store.size,
      sharedSpineSignals: spineStats.totalSignals,
      domainPatterns: Object.keys(domainVocab).length,
      expansionPrimitives: expansionSet.size,
    };
  };

  return { verticalId, prime, recordMatch, getCombinedSignals, getDomainVocabulary, getStats };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — SCANNER FACTORY (singleton instances per vertical)
// ═══════════════════════════════════════════════════════════════════════════════

const scannerInstances = new Map<string, VerticalScannerInstance>();

/**
 * Get or create a scanner instance for a vertical.
 * Instances are cached — calling this multiple times returns the same instance.
 */
export function getVerticalScanner(verticalId: string): VerticalScannerInstance {
  let instance = scannerInstances.get(verticalId);
  if (!instance) {
    instance = createVerticalScanner(verticalId);
    scannerInstances.set(verticalId, instance);
  }
  return instance;
}

/** All active vertical IDs with scanner instances */
const ACTIVE_VERTICAL_IDS = ['cyber', 'robotics', 'quantum', 'llm', 'agency', 'media'] as const;
export type ActiveVerticalId = typeof ACTIVE_VERTICAL_IDS[number];

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — CROSS-POLLINATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CrossPollinationResult {
  verticalsProcessed: number;
  totalSpineSignals: number;
  totalExpansionSignals: number;
  perVertical: Record<string, { spine: number; expansion: number; primeMs: number }>;
  durationMs: number;
}

/**
 * Run cross-pollination across all active verticals.
 * Each vertical:
 *   1. Primes its scanner from the shared Spine intelligence
 *   2. Any Spine signals it's learned propagate to the shared core
 *   3. Its domain vocabulary is ready for subsequent framework scans
 *
 * Call this during CDM cycles to ensure all verticals benefit
 * from the latest Spine discoveries.
 */
export function runCrossPollinationCycle(): CrossPollinationResult {
  const start = performance.now();
  let totalSpine = 0;
  let totalExpansion = 0;
  const perVertical: Record<string, { spine: number; expansion: number; primeMs: number }> = {};

  for (const verticalId of ACTIVE_VERTICAL_IDS) {
    const scanner = getVerticalScanner(verticalId);
    const primeResult = scanner.prime();
    const stats = scanner.getStats();

    perVertical[verticalId] = {
      spine: primeResult.vaultSignals + primeResult.chainSignals,
      expansion: stats.expansionSignals,
      primeMs: primeResult.durationMs,
    };

    totalSpine += primeResult.vaultSignals + primeResult.chainSignals;
    totalExpansion += stats.expansionSignals;
  }

  return {
    verticalsProcessed: ACTIVE_VERTICAL_IDS.length,
    totalSpineSignals: totalSpine,
    totalExpansionSignals: totalExpansion,
    perVertical,
    durationMs: Math.round(performance.now() - start),
  };
}

/**
 * Get a federated view of scanner intelligence across all verticals.
 */
export function getFederatedStats(): {
  sharedSpine: { totalSignals: number; uniquePrimitives: number };
  verticals: Record<string, VerticalScannerStats>;
  totalExpansionSignals: number;
} {
  const sharedSpine = getFeedbackStats();
  const verticals: Record<string, VerticalScannerStats> = {};
  let totalExpansion = 0;

  for (const verticalId of ACTIVE_VERTICAL_IDS) {
    const stats = getVerticalScanner(verticalId).getStats();
    verticals[verticalId] = stats;
    totalExpansion += stats.expansionSignals;
  }

  return {
    sharedSpine: {
      totalSignals: sharedSpine.totalSignals,
      uniquePrimitives: sharedSpine.uniquePrimitives,
    },
    verticals,
    totalExpansionSignals: totalExpansion,
  };
}

/** Reset all vertical signal stores (for testing) */
export function resetFederatedStores(): void {
  verticalSignalStores.clear();
  scannerInstances.clear();
}
