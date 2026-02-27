/**
 * Inter-Node Bridges — Unified Exports
 * High-Value Connective Tissue Between Matrix Nodes
 * 
 * These bridges fill the gaps between nodes that a senior developer
 * would immediately identify as missing:
 * 
 * 1. Health → Governance: Auto-escalate governance mode on cascading failures
 * 2. Confidence → Evolution: Feed degraded capability signals into evolution pipeline
 * 3. Event → Audit: Auto-persist critical events to immutable audit trail
 * 4. Intent Mesh → Capability: Route mesh resolutions through governed adapter
 * 5. Synergy → Memory: Persist pipeline outcomes for learning and optimization
 */

// Health → Governance auto-escalation
export {
  evaluateEscalation,
  runEscalationBridge,
  onGovernanceEscalation,
  resetEscalation,
  type EscalationRule,
  type EscalationCallback,
} from './health-governance-bridge';

// Confidence → Evolution feedback
export {
  generateEvolutionSignals,
  runConfidenceEvolutionBridge,
  getEvolutionPriorities,
  type EvolutionSignal,
} from './confidence-evolution-bridge';

// Event → Audit persistence
export {
  bridgeEventToAudit,
  bridgeEventsToAudit,
} from './event-audit-bridge';

// Intent Mesh → Capability adapter routing
export {
  resolveViaCapability,
  hasCapabilityRoute,
  getResolverGovernanceStatus,
} from './mesh-capability-bridge';

// Synergy → Memory persistence
export {
  recordSynergyOutcome,
  getSynergyStats,
  getTopSynergies,
  getDegradingSynergies,
  getSynergyMemorySummary,
  type SynergyOutcome,
  type SynergyStats,
} from './synergy-memory-bridge';
