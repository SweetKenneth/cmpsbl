/**
 * Autonomous Decision Authority (ADA) — Type Definitions
 * Grants nodes scoped, enterprise-grade decision-making power
 * within their specialty domain. No evolution. DREAM allowed.
 */

export type DecisionDomain =
  | 'threat-response'      // DEFENSE
  | 'memory-management'    // MEMORY, BRAIN
  | 'signal-routing'       // NERVE, INTENT
  | 'resource-allocation'  // SYSTEM, ENGINEER
  | 'data-synthesis'       // DREAM, ORACLE
  | 'governance-enforcement' // GOVERNANCE, CONSCIENCE
  | 'access-control'       // ACCESS, IDENTITY
  | 'code-quality'         // ENCODE, SHADOW
  | 'pattern-detection'    // HARVEST, OBSERVER
  | 'communication'        // ECHO, LINGUA, RELAY
  | 'resilience'           // IMMUNITY, REFLEX
  | 'operational'          // CORTEX, FORGE, ATLAS, COMPASS
  | 'simulation'           // SIMULATE, SANDBOX
  | 'diplomatic'           // TREATY, SOVEREIGN
  | 'edge-compute';        // EDGE, PHANTOM

export type DecisionUrgency = 'routine' | 'elevated' | 'urgent' | 'critical';

export type DecisionOutcome = 'approved' | 'denied' | 'deferred' | 'escalated';

export interface DecisionScope {
  /** Which domain this authority covers */
  domain: DecisionDomain;
  /** Node IDs that hold this authority */
  authorizedNodes: string[];
  /** Maximum confidence threshold before escalation required (0-1) */
  autonomyThreshold: number;
  /** Actions this scope permits */
  allowedActions: string[];
  /** Actions explicitly blocked (overrides allowed) */
  blockedActions: string[];
  /** Max decisions per hour before cooldown */
  rateLimit: number;
  /** Whether DREAM synthesis is allowed in this domain */
  dreamAllowed: boolean;
}

export interface DecisionRequest {
  id: string;
  nodeId: string;
  domain: DecisionDomain;
  action: string;
  urgency: DecisionUrgency;
  confidence: number;
  reasoning: string;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface DecisionVerdict {
  requestId: string;
  outcome: DecisionOutcome;
  nodeId: string;
  domain: DecisionDomain;
  action: string;
  confidence: number;
  reasoning: string;
  governanceCheck: boolean;
  auditHash: string;
  timestamp: number;
  cooldownUntil?: number;
}

export interface NodeAutonomy {
  nodeId: string;
  domains: DecisionDomain[];
  /** Overall trust score 0-100, affects threshold */
  trustScore: number;
  /** Decisions made in current window */
  decisionsThisHour: number;
  /** Successful decisions (used for trust calibration) */
  successCount: number;
  /** Failed/reverted decisions */
  failureCount: number;
  /** Last decision timestamp */
  lastDecisionAt: number;
  /** Temporary suspension */
  suspended: boolean;
  suspendedUntil?: number;
}

export interface ADAMetrics {
  totalDecisions: number;
  approvedCount: number;
  deniedCount: number;
  deferredCount: number;
  escalatedCount: number;
  avgConfidence: number;
  trustScoreDistribution: Record<string, number>;
  domainActivity: Record<DecisionDomain, number>;
  hourlyRate: number;
}
