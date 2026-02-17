/**
 * Marketing Facts — Single Source of Truth
 * v10.5.4 ARCHITECT Epoch
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
 * Claims marked as "estimated" should be periodically verified.
 */

// =============================================================================
// VERIFIED COUNTS (derived from source registries)
// =============================================================================

/** 21 modules in 6-layer architecture */
export const MODULES_COUNT = 21;

/** 6 architectural layers: Kernel, Cognitive, Operational, Administrative, Orchestrator, Infrastructure */
export const LAYERS_COUNT = 6;

/** 
 * Synergy pipelines defined in capabilities/synergies/registry.ts
 * 88 core + 27 discovery + 32 S-tier + 53 infrastructure-era = 200
 * + 50 crystallized crown jewel pipelines = 250 total
 */
export const SYNERGY_PIPELINES_COUNT = 250;

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
 * Registered capabilities (edge-adapted + native + archived + high-value v8.5.0 + infra v9.0.0 + apex)
 * 269 original + 56 high-value + 54 infrastructure + 21 apex = 400
 */
export const CAPABILITIES_COUNT = 400;

/**
 * Archived/legacy capabilities available for adaptation
 */
export const ARCHIVED_CAPABILITIES_COUNT = 136;

// =============================================================================
// TERMINAL COMMANDS
// =============================================================================

/**
 * Total terminal commands across all modules
 * Derived from TerminalCommands.ts ALL_COMMANDS array
 */
export const TERMINAL_COMMANDS_COUNT = 360;

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
 * Last verified: 2026-02
 */
export const LINES_OF_CODE = 175_000;

/**
 * Display-friendly version (175k+ for marketing)
 */
export const LINES_OF_CODE_DISPLAY = '175k+';

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
  'OpenAI',
  'Anthropic',
  'Google AI',
  'Mistral',
  'Groq',
  'Open Source (Ollama)',
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
    modules: MODULES_COUNT,
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
