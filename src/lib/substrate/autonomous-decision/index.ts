/**
 * Autonomous Decision Authority (ADA) v1.0.0
 * 
 * Grants substrate nodes scoped, enterprise-grade autonomous
 * decision-making within their specialty domains.
 * 
 * Invariants:
 *  - Evolution is ALWAYS blocked
 *  - DREAM synthesis is allowed per-domain
 *  - Trust calibrates over time via outcome feedback
 *  - All decisions produce tamper-evident audit hashes
 *  - Rate limits prevent runaway autonomy
 *  - Governance can suspend/reinstate any node
 */

export type {
  DecisionDomain,
  DecisionUrgency,
  DecisionOutcome,
  DecisionScope,
  DecisionRequest,
  DecisionVerdict,
  NodeAutonomy,
  ADAMetrics,
} from './types';

export {
  evaluateDecision,
  reportOutcome,
  getNodeAutonomy,
  getAuditLog,
  getMetrics,
  suspendNode,
  reinstateNode,
  resetAll,
} from './engine';

export {
  DECISION_SCOPES,
  getScopeForDomain,
  getDomainsForNode,
  isActionAllowed,
} from './scopes';
