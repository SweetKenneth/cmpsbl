/**
 * CMPSBL® Registry Serializer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Serializes the in-memory feedback loop signals and ecosystem registry
 * to JSON for persistence between runs. The glossary compounds across
 * training sessions instead of being rebuilt from scratch each time.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  getHighConfidenceSignals,
  getFeedbackStats,
  type LearnedSignal,
} from './feedback-loop';
import {
  getRegistryStats,
  findImplementations,
  type RegistryEntry,
} from './ecosystem-registry';
import {
  getAllClusters,
  type SynonymCluster,
} from './semantic-drift';
import {
  getArchetypes,
  type StructuralSignature,
} from './structural-signatures';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SerializedRegistry {
  /** Schema version for forward compatibility */
  version: string;
  /** When this snapshot was taken */
  exportedAt: string;
  /** Total training sessions that contributed */
  sessionCount: number;
  /** Feedback loop: high-confidence learned signals keyed by primitive */
  learnedSignals: Record<string, string[]>;
  /** Feedback loop stats at export time */
  feedbackStats: {
    totalSignals: number;
    totalConfirmations: number;
    uniquePrimitives: number;
  };
  /** Ecosystem registry: confirmed implementations */
  implementations: SerializedImplementation[];
  /** Semantic drift: synonym clusters with learned expansions */
  synonymClusters: SerializedCluster[];
  /** Archetype coverage: which archetypes have been confirmed */
  archetypeCoverage: ArchetypeCoverageEntry[];
  /** Registry stats at export time */
  registryStats: {
    totalEntries: number;
    byEcosystem: Record<string, number>;
    byArchetype: Record<string, number>;
    avgQuality: number;
  };
}

export interface SerializedImplementation {
  archetypeId: string;
  name: string;
  ecosystem: string;
  qualityScore: number;
  primitives: string[];
  scanConfirmations: number;
  packages: string[];
  description: string;
}

export interface SerializedCluster {
  canonical: string;
  archetypeId: string;
  ecosystems: Record<string, string[]>;
  totalSynonyms: number;
}

export interface ArchetypeCoverageEntry {
  id: string;
  name: string;
  primitives: string[];
  weight: number;
  patternCount: number;
  coSignalCount: number;
  intentSignalCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/** Current schema version */
const REGISTRY_SCHEMA_VERSION = '1.0.0';

/** Track how many sessions have contributed (persisted across exports) */
let _sessionCount = 0;

/**
 * Export the full trained registry to a serializable JSON object.
 * This captures everything the feedback loop and ecosystem registry
 * have learned across all training passes.
 */
export function exportRegistry(): SerializedRegistry {
  _sessionCount++;

  // Learned signals (high-confidence only — the glossary expansion)
  const signals = getHighConfidenceSignals(0.3);
  const learnedSignals: Record<string, string[]> = {};
  for (const [primitive, terms] of signals) {
    learnedSignals[primitive] = terms;
  }

  // Feedback stats
  const fbStats = getFeedbackStats();

  // Ecosystem registry implementations
  const archetypes = getArchetypes();
  const implementations: SerializedImplementation[] = [];
  for (const arch of archetypes) {
    const impls = findImplementations(arch.id);
    for (const impl of impls) {
      if (impl.scanConfirmations > 0 || impl.lastSeen > 0) {
        implementations.push({
          archetypeId: impl.archetypeId,
          name: impl.name,
          ecosystem: impl.ecosystem,
          qualityScore: impl.qualityScore,
          primitives: impl.primitives,
          scanConfirmations: impl.scanConfirmations,
          packages: impl.packages,
          description: impl.description,
        });
      }
    }
  }

  // Synonym clusters
  const clusters = getAllClusters();
  const synonymClusters: SerializedCluster[] = clusters.map(c => ({
    canonical: c.canonical,
    archetypeId: c.archetypeId,
    ecosystems: { ...c.ecosystems },
    totalSynonyms: c.allSynonyms.length,
  }));

  // Archetype coverage
  const archetypeCoverage: ArchetypeCoverageEntry[] = archetypes.map(a => ({
    id: a.id,
    name: a.name,
    primitives: a.primitives,
    weight: a.weight,
    patternCount: a.patterns.length,
    coSignalCount: a.coSignals.length,
    intentSignalCount: a.intentSignals.length,
  }));

  // Registry stats
  const regStats = getRegistryStats();

  return {
    version: REGISTRY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    sessionCount: _sessionCount,
    learnedSignals,
    feedbackStats: {
      totalSignals: fbStats.totalSignals,
      totalConfirmations: fbStats.totalConfirmations,
      uniquePrimitives: fbStats.uniquePrimitives,
    },
    implementations,
    synonymClusters,
    archetypeCoverage,
    registryStats: {
      totalEntries: regStats.totalEntries,
      byEcosystem: regStats.byEcosystem,
      byArchetype: regStats.byArchetype,
      avgQuality: regStats.avgQuality,
    },
  };
}

/**
 * Serialize the registry to a JSON string.
 * Use this to persist to disk or database.
 */
export function serializeRegistry(): string {
  return JSON.stringify(exportRegistry(), null, 2);
}

/**
 * Get a compact summary suitable for logging or dashboards.
 */
export function getRegistrySummary(): {
  version: string;
  sessionCount: number;
  archetypeCount: number;
  learnedSignalCount: number;
  implementationCount: number;
  synonymClusterCount: number;
  avgQuality: number;
} {
  const archetypes = getArchetypes();
  const signals = getHighConfidenceSignals(0.3);
  const regStats = getRegistryStats();
  const clusters = getAllClusters();

  let signalCount = 0;
  for (const terms of signals.values()) signalCount += terms.length;

  return {
    version: REGISTRY_SCHEMA_VERSION,
    sessionCount: _sessionCount,
    archetypeCount: archetypes.length,
    learnedSignalCount: signalCount,
    implementationCount: regStats.totalEntries,
    synonymClusterCount: clusters.length,
    avgQuality: regStats.avgQuality,
  };
}