/**
 * Pipeline Description Utility
 * Maps module chains to human-readable functional descriptions.
 * Used across all pipeline/discovery card renderers site-wide.
 */

/** Module capability registry for generating rich descriptions */
const MODULE_CAPABILITIES: Record<string, { verb: string; noun: string; domain: string }> = {
  AUDIT: { verb: 'audits', noun: 'compliance trails', domain: 'governance' },
  GOVERNANCE: { verb: 'enforces', noun: 'policy constraints', domain: 'governance' },
  DEFENSE: { verb: 'hardens', noun: 'security boundaries', domain: 'security' },
  BRAIN: { verb: 'reasons', noun: 'decision logic', domain: 'intelligence' },
  CORTEX: { verb: 'analyzes', noun: 'pattern structures', domain: 'intelligence' },
  DREAM: { verb: 'simulates', noun: 'hypothetical configurations', domain: 'intelligence' },
  MEMORY: { verb: 'persists', noun: 'state signals', domain: 'data' },
  NEXUS: { verb: 'routes', noun: 'cross-system signals', domain: 'routing' },
  EVOLUTION: { verb: 'optimizes', noun: 'adaptive strategies', domain: 'optimization' },
  VISION: { verb: 'inspects', noun: 'structural patterns', domain: 'analysis' },
  SYSTEM: { verb: 'orchestrates', noun: 'lifecycle operations', domain: 'orchestration' },
  RIPPLE: { verb: 'propagates', noun: 'state transitions', domain: 'events' },
  DECODE: { verb: 'deciphers', noun: 'encoded structures', domain: 'analysis' },
  ANALYTICS: { verb: 'measures', noun: 'telemetry streams', domain: 'observability' },
  IDENTITY: { verb: 'authenticates', noun: 'identity claims', domain: 'security' },
  ACCESS: { verb: 'authorizes', noun: 'access grants', domain: 'security' },
  MEDIC: { verb: 'diagnoses', noun: 'system health', domain: 'resilience' },
  INCLUSIVE: { verb: 'validates', noun: 'accessibility standards', domain: 'compliance' },
  PHANTOM: { verb: 'obfuscates', noun: 'covert pathways', domain: 'security' },
  FORGE: { verb: 'fabricates', noun: 'runtime artifacts', domain: 'generation' },
  ORACLE: { verb: 'predicts', noun: 'future states', domain: 'intelligence' },
  SOVEREIGN: { verb: 'governs', noun: 'autonomous policies', domain: 'governance' },
  CONSCIENCE: { verb: 'evaluates', noun: 'ethical constraints', domain: 'governance' },
  INTEGRATION: { verb: 'unifies', noun: 'external interfaces', domain: 'integration' },
  COMPASS: { verb: 'navigates', noun: 'decision pathways', domain: 'routing' },
  HARVEST: { verb: 'extracts', noun: 'data yields', domain: 'data' },
  REFLEX: { verb: 'responds', noun: 'reactive triggers', domain: 'events' },
  ECHO: { verb: 'replays', noun: 'event histories', domain: 'events' },
  LINGUA: { verb: 'translates', noun: 'language constructs', domain: 'translation' },
  TREATY: { verb: 'negotiates', noun: 'inter-system agreements', domain: 'governance' },
};

/** Known combo patterns for richer descriptions */
const COMBO_PATTERNS: Array<{ modules: string[]; description: string }> = [
  { modules: ['DEFENSE', 'GOVERNANCE', 'AUDIT'], description: 'Enforces hardened security policies with full audit trail coverage and governance oversight.' },
  { modules: ['BRAIN', 'CORTEX', 'DREAM'], description: 'Combines reasoning, pattern analysis, and speculative simulation for deep inference.' },
  { modules: ['EVOLUTION', 'VISION'], description: 'Explores solution spaces and adapts strategies using visual pattern recognition.' },
  { modules: ['MEMORY', 'NEXUS'], description: 'Routes and stores persistent signals across the substrate network.' },
  { modules: ['DEFENSE', 'GOVERNANCE'], description: 'Enforces security constraints and policy compliance across system operations.' },
  { modules: ['BRAIN', 'GOVERNANCE'], description: 'Coordinates intelligent decision-making with governance oversight.' },
  { modules: ['BRAIN', 'CORTEX'], description: 'Combines reasoning and pattern analysis for intelligent processing.' },
  { modules: ['CORTEX', 'EVOLUTION'], description: 'Applies pattern recognition to guide evolutionary optimization.' },
  { modules: ['DREAM', 'EVOLUTION'], description: 'Uses speculative simulation to explore and evolve system configurations.' },
  { modules: ['RIPPLE', 'SYSTEM'], description: 'Propagates state changes through interconnected system components.' },
  { modules: ['IDENTITY', 'ACCESS', 'DEFENSE'], description: 'Secures identity verification, access control, and threat hardening in a unified pipeline.' },
  { modules: ['AUDIT', 'ANALYTICS', 'GOVERNANCE'], description: 'Provides comprehensive compliance monitoring with telemetry-backed governance reporting.' },
  { modules: ['MEDIC', 'SYSTEM', 'DEFENSE'], description: 'Diagnoses system health, orchestrates recovery, and hardens against recurrence.' },
  { modules: ['DECODE', 'AUDIT'], description: 'Deciphers encoded data structures and logs findings to the audit chain.' },
  { modules: ['PHANTOM', 'DEFENSE'], description: 'Operates covert security probes that harden defenses without exposing attack surface.' },
  { modules: ['ORACLE', 'BRAIN'], description: 'Combines predictive modeling with reasoning to anticipate and pre-empt system events.' },
];

/** Generate a human-readable description of what a pipeline does based on its module chain */
export function getFunctionalDescription(name: string, modules: string[]): string {
  const upperModules = modules.map(m => m.toUpperCase());
  const moduleSet = new Set(upperModules);

  // Check known combos (longest match first)
  const sortedCombos = [...COMBO_PATTERNS].sort((a, b) => b.modules.length - a.modules.length);
  for (const combo of sortedCombos) {
    if (combo.modules.every(m => moduleSet.has(m))) {
      return combo.description;
    }
  }

  // Single module fallbacks
  for (const m of upperModules) {
    const cap = MODULE_CAPABILITIES[m];
    if (cap) {
      if (upperModules.length === 1) {
        return `${cap.verb.charAt(0).toUpperCase() + cap.verb.slice(1)} ${cap.noun} across system operations.`;
      }
    }
  }

  // Dynamic multi-module description
  if (upperModules.length >= 2) {
    const caps = upperModules.map(m => MODULE_CAPABILITIES[m]).filter(Boolean);
    if (caps.length >= 2) {
      const primary = caps[0];
      const secondary = caps[1];
      return `${primary.verb.charAt(0).toUpperCase() + primary.verb.slice(1)} ${primary.noun} while ${secondary.verb}ing ${secondary.noun} across the substrate.`;
    }
  }

  // Fallback
  return `Autonomous pipeline combining ${modules.length} substrate system${modules.length !== 1 ? 's' : ''} into a unified capability.`;
}

/**
 * Generate a rich description replacing old boilerplate DB descriptions.
 * Detects the old pattern and replaces with a module-chain-aware description.
 */
export function getEnrichedDescription(dbDescription: string, name: string, modules: string[]): string {
  // Detect old boilerplate pattern: "X pipeline combining A, B, C for cross-module verb1 and verb2 operations"
  const isOldBoilerplate = /pipeline combining .+ for cross-module .+ operations/i.test(dbDescription);

  if (!isOldBoilerplate) return dbDescription;

  // Generate a rich replacement
  const functional = getFunctionalDescription(name, modules);
  const upperModules = modules.map(m => m.toUpperCase());

  // Build a category-aware lead
  const domains = new Set(
    upperModules
      .map(m => MODULE_CAPABILITIES[m]?.domain)
      .filter(Boolean)
  );
  const domainList = [...domains];
  const domainLabel = domainList.length > 0
    ? domainList.slice(0, 2).join(' & ')
    : 'autonomous';

  return `${domainLabel.charAt(0).toUpperCase() + domainLabel.slice(1)} pipeline spanning ${upperModules.join(', ')}. ${functional}`;
}
