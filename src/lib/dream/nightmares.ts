/**
 * DREAM Nightmare Mode — Simulation-Only Artifact Generator
 * Read-Only, No Feedback Loops
 * 
 * Nightmare Mode generates hypothetical threat scenarios for analysis.
 * These are ARTIFACTS ONLY — they do not trigger any system actions.
 * 
 * EXPLICITLY PROHIBITED:
 * - DEFENSE rule mutation
 * - SYSTEM actions
 * - Any enforcement or write-back loops
 * - Auto-remediation
 * - Scheduler registration
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type NightmareVector = 
  | 'jailbreak'           // Prompt injection / escape attempts
  | 'overload'            // Resource exhaustion scenarios
  | 'drift'               // Behavioral deviation patterns
  | 'data_poisoning'      // Training/memory corruption
  | 'cascade_failure'     // Multi-module failure propagation
  | 'privilege_escalation'// Unauthorized capability access
  | 'exfiltration'        // Data leakage scenarios
  | 'adversarial_input';  // Malformed input attacks

export type NightmareSeverity = 'theoretical' | 'plausible' | 'observed' | 'historical';

export interface NightmareScenario {
  readonly scenario_id: string;
  readonly description: string;
  readonly simulated_vector: NightmareVector;
  readonly hypothetical_impact: string;
  readonly affected_modules: readonly string[];
  readonly severity: NightmareSeverity;
  readonly mitigation_notes?: string;
  readonly generated_at: string;
}

export interface NightmareArtifact {
  readonly artifact_id: string;
  readonly session_id: string;
  readonly nightmares: readonly NightmareScenario[];
  readonly simulation_only: true; // Always true, enforced by type
  readonly generated_at: string;
  readonly disclaimer: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const NIGHTMARE_DISCLAIMER: string = 
  'SIMULATION ONLY: These scenarios are hypothetical artifacts for analysis. ' +
  'No system actions, rule mutations, or enforcement loops are triggered. ' +
  'This output is read-only and does not affect system behavior.';

// ═══════════════════════════════════════════════════════════════
// ARTIFACT GENERATION (READ-ONLY OUTPUT)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a nightmare scenario artifact
 * Returns an immutable, read-only scenario object
 */
export function createNightmareScenario(
  vector: NightmareVector,
  description: string,
  impact: string,
  modules: readonly string[],
  severity: NightmareSeverity = 'theoretical',
  mitigation?: string
): NightmareScenario {
  return Object.freeze({
    scenario_id: `NM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    simulated_vector: vector,
    hypothetical_impact: impact,
    affected_modules: Object.freeze([...modules]),
    severity,
    mitigation_notes: mitigation,
    generated_at: new Date().toISOString(),
  });
}

/**
 * Bundle nightmares into a session artifact
 * Returns an immutable artifact with explicit simulation_only flag
 */
export function createNightmareArtifact(
  sessionId: string,
  scenarios: readonly NightmareScenario[]
): NightmareArtifact {
  return Object.freeze({
    artifact_id: `NA-${Date.now()}`,
    session_id: sessionId,
    nightmares: Object.freeze([...scenarios]),
    simulation_only: true as const,
    generated_at: new Date().toISOString(),
    disclaimer: NIGHTMARE_DISCLAIMER,
  });
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE SCENARIOS (STATIC REFERENCE)
// ═══════════════════════════════════════════════════════════════

/**
 * Reference scenarios for documentation and testing
 * These do NOT trigger any system behavior
 */
export const REFERENCE_NIGHTMARES: readonly NightmareScenario[] = Object.freeze([
  createNightmareScenario(
    'jailbreak',
    'Adversary attempts prompt injection to bypass DEFENSE filters',
    'Potential exposure of system prompts or behavioral rules',
    ['DEFENSE', 'DECODE', 'BRAIN'],
    'theoretical',
    'Multi-layer prompt sanitization, output validation'
  ),
  createNightmareScenario(
    'cascade_failure',
    'CORE circuit breaker failure propagates to dependent modules',
    'System-wide degradation, potential data inconsistency',
    ['CORE', 'SYSTEM', 'VISION', 'BRAIN'],
    'theoretical',
    'Isolated circuit breakers per module, graceful degradation'
  ),
  createNightmareScenario(
    'drift',
    'Gradual memory consolidation bias creates behavioral deviation',
    'System responses drift from intended behavior over time',
    ['BRAIN', 'DREAM', 'EVOLUTION'],
    'theoretical',
    'Behavioral drift detection in DREAM synthesis, periodic audits'
  ),
  createNightmareScenario(
    'overload',
    'Malicious actor triggers recursive DREAM cycles consuming resources',
    'Quota exhaustion, degraded response times, potential DoS',
    ['DREAM', 'NEXUS', 'ACCESS'],
    'theoretical',
    'Per-cycle resource limits, automatic throttling'
  ),
]);

// ═══════════════════════════════════════════════════════════════
// SAFETY ASSERTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Type-level enforcement that artifacts are simulation-only
 * This function exists purely for documentation and type safety
 */
export function assertSimulationOnly(artifact: NightmareArtifact): asserts artifact is NightmareArtifact & { simulation_only: true } {
  if (artifact.simulation_only !== true) {
    throw new Error('NIGHTMARE MODE VIOLATION: Artifact must be simulation_only');
  }
}

/**
 * Nightmare Mode version and status
 */
export const NIGHTMARE_MODE_VERSION = '8.0.0' as const;
export const NIGHTMARE_MODE_STATUS = 'simulation_only' as const;
