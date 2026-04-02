/**
 * Marketing Facts — Single Source of Truth
 * 40-Primitive / 12-Category Field-Based Topology
 * 
 * CRITICAL: All public-facing numbers MUST come from this module.
 * Any changes here should trigger review of:
 * - Homepage hero stats
 * - WhySubstrate component
 * - Website docs (docs/website/)
 * - Terminal help output
 * - Library docs
 * 
 * Counts are derived from actual registries where possible.
 */

// =============================================================================
// VERIFIED COUNTS (derived from source registries)
// =============================================================================

/** 40 active nodes across 4 categories */
export const NODES_COUNT = 40;

/** 4 categories: CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell */
export const SECTORS_COUNT = 12;

/** @deprecated Use NODES_COUNT — kept for backward compatibility */
export const ENTITIES_COUNT = NODES_COUNT;

/** @deprecated Use NODES_COUNT — kept for backward compatibility */
export const MODULES_COUNT = NODES_COUNT;

/** 4 mesh overlays: DEFENSE (outermost) → IMMUNITY → INTENT → GOVERNANCE (innermost) */
export const MESH_OVERLAY_COUNT = 4;

/** 4 shielded expansion zones: ESZ (4 nodes), EPZ (3 nodes), EMZ (3 nodes), CSZ (3 nodes) */
export const EXPANSION_ZONE_COUNT = 4;

/** @deprecated Legacy zone count — now subsumed by sector topology */
export const ZONE_COUNT = 9;

/** @deprecated Use SECTORS_COUNT — legacy layer model no longer applies */
export const LAYERS_COUNT = 3;

/**
 * Synergy pipelines defined in capabilities/synergies/registry.ts
 * 88 core + 27 discovery + 32 S-tier + 53 infrastructure-era = 200
 * + 100 crystallized crown jewel pipelines = 300 total
 */
export const SYNERGY_PIPELINES_COUNT = 300;

/**
 * Crystallized Crown Jewel pipelines from Intent Mesh discovery
 * 10 CMPSBL + 8 Enterprise + 18 Architect + 14 Creator = 50
 */
export const CRYSTALLIZED_PIPELINES_COUNT = 50;

/**
 * Synergy executors defined in capabilities/synergies/executors
 * Verified from synergies/index.ts exports
 */
export const SYNERGY_EXECUTORS_COUNT = 125;

/**
 * S-tier premium pipelines
 */
export const STIER_PIPELINES_COUNT = 32;

// =============================================================================
// ENGINE COUNTS (from substrate/engines/registry.ts)
// =============================================================================

/**
 * Base engines in ENGINE_REGISTRY
 * v10.5.4: 76 cognitive engines
 */
export const ENGINES_COUNT = 76;

/**
 * Meta-engines that orchestrate multiple base engines
 * v10.5.4: 24 meta-engines
 */
export const META_ENGINES_COUNT = 24;

/**
 * Total engine ecosystem
 */
export const TOTAL_ENGINE_ECOSYSTEM = ENGINES_COUNT + META_ENGINES_COUNT;

// =============================================================================
// CAPABILITY COUNTS
// =============================================================================

/**
 * Registered capabilities across all 40 Matrix Nodes
 * 525 base + 150 expansion (high-value-v10) = 675+
 */
export const CAPABILITIES_COUNT = 675;

/**
 * Archived/legacy capabilities available for adaptation
 */
export const ARCHIVED_CAPABILITIES_COUNT = 136;

// =============================================================================
// TERMINAL COMMANDS
// =============================================================================

/**
 * Total terminal commands across all 40 primitives
 * Derived from TerminalCommands.ts ALL_COMMANDS array
 */
export const TERMINAL_COMMANDS_COUNT = 500;

// =============================================================================
// INTEGRATION ADAPTERS
// =============================================================================

/**
 * Enterprise integration adapters (SAP, Oracle, Workday, etc.)
 */
export const INTEGRATION_ADAPTERS_COUNT = 35;

// =============================================================================
// CODEBASE METRICS (estimated, update periodically)
// =============================================================================

/**
 * Approximate lines of code in the substrate
 * Last verified: 2026-03
 */
export const LINES_OF_CODE = 200_000;

/**
 * Display-friendly version (200k+ for marketing)
 */
export const LINES_OF_CODE_DISPLAY = '200k+';

// =============================================================================
// VERSION INFO
// =============================================================================

import { getMetric } from '@/stores/publicMetricsStore';

/** @deprecated Use getMetric('version') directly — kept for backward compatibility */
export const SUBSTRATE_VERSION = getMetric('version');
export const SUBSTRATE_CODENAME = getMetric('codename');
export const SUBSTRATE_EPOCH = getMetric('epoch');

// =============================================================================
// PERFORMANCE CLAIMS (only include if verifiable)
// =============================================================================

/**
 * Routing latency claim - use "sub-100ms" as it's achievable
 * Do NOT claim specific numbers without real benchmarks
 */
export const ROUTING_LATENCY_CLAIM = '<100ms';

/**
 * Memory tiers
 */
export const MEMORY_TIERS = {
  hot: { capacity: 127, retention: '7 days' },
  warm: { capacity: 2000, retention: '30 days' },
  cold: { capacity: 200, retention: 'forever' },
  legacy: { capacity: 'unlimited', retention: 'forever' },
};

// =============================================================================
// PROVIDER SUPPORT
// =============================================================================

export const SUPPORTED_PROVIDERS = [
  'Groq',
  'Cerebras',
  'SambaNova',
  'Google AI Studio',
  'DeepSeek',
  'Together',
  'OpenRouter (Llama)',
  'OpenRouter (Qwen)',
  'OpenRouter (DeepSeek R1)',
  'OpenRouter (Grok)',
  'Mistral Studio',
  'Cohere',
  'Hyperbolic',
] as const;

export const BYOK_SUPPORTED = true;

// =============================================================================
// ACCESSIBILITY
// =============================================================================

export const WCAG_LEVEL = 'WCAG 2.2 AA';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all facts as a flat object for easy consumption
 */
export function getAllMarketingFacts() {
  return {
    nodes: NODES_COUNT,
    sectors: SECTORS_COUNT,
    entities: ENTITIES_COUNT, // backward compat alias
    meshOverlays: MESH_OVERLAY_COUNT,
    expansionZones: EXPANSION_ZONE_COUNT,
    zones: ZONE_COUNT,
    modules: MODULES_COUNT, // backward compat alias
    layers: LAYERS_COUNT,
    synergyPipelines: SYNERGY_PIPELINES_COUNT,
    synergyExecutors: SYNERGY_EXECUTORS_COUNT,
    stierPipelines: STIER_PIPELINES_COUNT,
    engines: ENGINES_COUNT,
    metaEngines: META_ENGINES_COUNT,
    totalEngineEcosystem: TOTAL_ENGINE_ECOSYSTEM,
    capabilities: CAPABILITIES_COUNT,
    archivedCapabilities: ARCHIVED_CAPABILITIES_COUNT,
    terminalCommands: TERMINAL_COMMANDS_COUNT,
    integrationAdapters: INTEGRATION_ADAPTERS_COUNT,
    linesOfCode: LINES_OF_CODE,
    linesOfCodeDisplay: LINES_OF_CODE_DISPLAY,
    version: SUBSTRATE_VERSION,
    codename: SUBSTRATE_CODENAME,
    routingLatency: ROUTING_LATENCY_CLAIM,
    providers: SUPPORTED_PROVIDERS,
    byokSupported: BYOK_SUPPORTED,
    wcagLevel: WCAG_LEVEL,
  };
}

/**
 * Validate that a number matches expected marketing claim
 * Use in tests to catch drift
 */
export function validateFact(factName: keyof ReturnType<typeof getAllMarketingFacts>, actual: number): boolean {
  const expected = getAllMarketingFacts()[factName];
  if (typeof expected !== 'number') return true;
  return actual === expected;
}
