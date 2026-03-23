/**
 * ADA — Decision Scope Registry
 * Defines what each node is allowed to decide autonomously.
 * No evolution actions permitted anywhere.
 */

import type { DecisionScope } from './types';

/** Canonical scope definitions — one per domain */
export const DECISION_SCOPES: DecisionScope[] = [
  {
    domain: 'threat-response',
    authorizedNodes: ['DEFENSE', 'IMMUNITY'],
    autonomyThreshold: 0.75,
    allowedActions: [
      'block-ip', 'throttle-actor', 'quarantine-request',
      'escalate-threat', 'update-reputation', 'activate-honeypot',
      'rotate-challenge', 'flag-anomaly', 'trigger-circuit-breaker',
    ],
    blockedActions: ['drop-table', 'delete-user', 'disable-auth', 'evolve'],
    rateLimit: 120,
    dreamAllowed: false,
  },
  {
    domain: 'memory-management',
    authorizedNodes: ['MEMORY', 'BRAIN'],
    autonomyThreshold: 0.70,
    allowedActions: [
      'promote-tier', 'demote-tier', 'consolidate-memories',
      'prune-expired', 'reindex-embeddings', 'compress-cold',
      'strengthen-pathway', 'archive-glacier', 'defragment',
    ],
    blockedActions: ['delete-all-memories', 'reset-brain', 'evolve'],
    rateLimit: 60,
    dreamAllowed: true,
  },
  {
    domain: 'signal-routing',
    authorizedNodes: ['NERVE', 'INTENT'],
    autonomyThreshold: 0.80,
    allowedActions: [
      'reroute-signal', 'adjust-priority', 'activate-backpressure',
      'open-circuit', 'close-circuit', 'replay-dead-letter',
      'rebalance-lanes', 'classify-intent', 'decompose-goal',
    ],
    blockedActions: ['drop-all-signals', 'bypass-governance', 'evolve'],
    rateLimit: 200,
    dreamAllowed: false,
  },
  {
    domain: 'resource-allocation',
    authorizedNodes: ['SYSTEM', 'ENGINEER'],
    autonomyThreshold: 0.80,
    allowedActions: [
      'scale-resource', 'tune-parameter', 'schedule-maintenance',
      'activate-degradation', 'rebalance-budget', 'restart-service',
      'adjust-heartbeat', 'resolve-contention', 'predict-failure',
    ],
    blockedActions: ['shutdown-system', 'delete-data', 'evolve'],
    rateLimit: 40,
    dreamAllowed: false,
  },
  {
    domain: 'data-synthesis',
    authorizedNodes: ['DREAM', 'ORACLE'],
    autonomyThreshold: 0.65,
    allowedActions: [
      'synthesize-insight', 'generate-forecast', 'consolidate-dreams',
      'detect-drift', 'propose-heuristic', 'score-coherence',
      'run-lucid-session', 'build-timeline', 'correlate-signals',
    ],
    blockedActions: ['mutate-source', 'alter-governance', 'evolve'],
    rateLimit: 30,
    dreamAllowed: true,
  },
  {
    domain: 'governance-enforcement',
    authorizedNodes: ['GOVERNANCE', 'CONSCIENCE'],
    autonomyThreshold: 0.90,
    allowedActions: [
      'enforce-policy', 'veto-action', 'flag-ethical-concern',
      'adjust-threshold', 'audit-compliance', 'restrict-scope',
      'approve-routine', 'deny-violation', 'log-decision',
    ],
    blockedActions: ['disable-governance', 'bypass-ethics', 'evolve'],
    rateLimit: 100,
    dreamAllowed: false,
  },
  {
    domain: 'access-control',
    authorizedNodes: ['ACCESS', 'IDENTITY'],
    autonomyThreshold: 0.85,
    allowedActions: [
      'revoke-key', 'throttle-developer', 'enforce-quota',
      'flag-abuse', 'validate-entitlement', 'rotate-token',
      'suspend-account', 'score-reputation', 'cache-entitlement',
    ],
    blockedActions: ['grant-admin', 'delete-keys-all', 'evolve'],
    rateLimit: 80,
    dreamAllowed: false,
  },
  {
    domain: 'code-quality',
    authorizedNodes: ['ENCODE', 'SHADOW'],
    autonomyThreshold: 0.70,
    allowedActions: [
      'lint-patch', 'score-quality', 'run-shadow-test',
      'validate-ast', 'detect-antipattern', 'suggest-fix',
      'measure-coverage', 'compare-verdicts', 'template-capture',
    ],
    blockedActions: ['auto-deploy', 'force-merge', 'evolve'],
    rateLimit: 50,
    dreamAllowed: true,
  },
  {
    domain: 'pattern-detection',
    authorizedNodes: ['HARVEST', 'OBSERVER'],
    autonomyThreshold: 0.65,
    allowedActions: [
      'extract-pattern', 'classify-trend', 'emit-observation',
      'score-novelty', 'index-discovery', 'correlate-events',
      'track-regression', 'snapshot-state', 'alert-anomaly',
    ],
    blockedActions: ['mutate-data', 'alter-schema', 'evolve'],
    rateLimit: 60,
    dreamAllowed: true,
  },
  {
    domain: 'communication',
    authorizedNodes: ['ECHO', 'LINGUA', 'RELAY'],
    autonomyThreshold: 0.75,
    allowedActions: [
      'translate-message', 'route-webhook', 'format-output',
      'retry-delivery', 'adjust-voice', 'queue-notification',
      'validate-payload', 'sign-message', 'buffer-broadcast',
    ],
    blockedActions: ['send-to-external-unverified', 'expose-secrets', 'evolve'],
    rateLimit: 100,
    dreamAllowed: false,
  },
  {
    domain: 'resilience',
    authorizedNodes: ['IMMUNITY', 'REFLEX'],
    autonomyThreshold: 0.80,
    allowedActions: [
      'trigger-reflex', 'isolate-failure', 'activate-fallback',
      'heal-node', 'quarantine-module', 'restore-checkpoint',
      'calibrate-threshold', 'run-diagnostic', 'patch-runtime',
    ],
    blockedActions: ['disable-immunity', 'skip-validation', 'evolve'],
    rateLimit: 60,
    dreamAllowed: false,
  },
  {
    domain: 'operational',
    authorizedNodes: ['CORTEX', 'FORGE', 'ATLAS', 'COMPASS'],
    autonomyThreshold: 0.75,
    allowedActions: [
      'orchestrate-task', 'assign-capability', 'map-dependency',
      'seal-artifact', 'navigate-intent', 'prioritize-queue',
      'calibrate-compass', 'index-capability', 'resolve-conflict',
    ],
    blockedActions: ['unseal-artifact', 'bypass-forge', 'evolve'],
    rateLimit: 80,
    dreamAllowed: true,
  },
  {
    domain: 'simulation',
    authorizedNodes: ['SIMULATE', 'SANDBOX'],
    autonomyThreshold: 0.60,
    allowedActions: [
      'run-simulation', 'snapshot-scenario', 'compare-outcomes',
      'stress-test', 'model-failure', 'validate-hypothesis',
      'sandbox-execute', 'measure-impact', 'replay-scenario',
    ],
    blockedActions: ['apply-to-production', 'mutate-live-state', 'evolve'],
    rateLimit: 20,
    dreamAllowed: true,
  },
  {
    domain: 'diplomatic',
    authorizedNodes: ['TREATY', 'SOVEREIGN'],
    autonomyThreshold: 0.85,
    allowedActions: [
      'negotiate-boundary', 'enforce-treaty', 'validate-sovereignty',
      'mediate-conflict', 'establish-protocol', 'audit-compliance',
      'propose-amendment', 'ratify-agreement', 'escalate-dispute',
    ],
    blockedActions: ['dissolve-treaty', 'override-sovereignty', 'evolve'],
    rateLimit: 30,
    dreamAllowed: false,
  },
  {
    domain: 'edge-compute',
    authorizedNodes: ['EDGE', 'PHANTOM'],
    autonomyThreshold: 0.70,
    allowedActions: [
      'cache-at-edge', 'route-to-nearest', 'compress-payload',
      'prefetch-resource', 'shed-load', 'replicate-state',
      'ghost-execute', 'measure-latency', 'failover-region',
    ],
    blockedActions: ['expose-internal', 'bypass-auth', 'evolve'],
    rateLimit: 150,
    dreamAllowed: false,
  },
];

/** O(1) lookup: domain → scope */
const scopeMap = new Map<string, DecisionScope>();
for (const s of DECISION_SCOPES) scopeMap.set(s.domain, s);

/** O(1) lookup: nodeId → domains */
const nodeDomainMap = new Map<string, string[]>();
for (const s of DECISION_SCOPES) {
  for (const n of s.authorizedNodes) {
    const existing = nodeDomainMap.get(n) || [];
    existing.push(s.domain);
    nodeDomainMap.set(n, existing);
  }
}

export function getScopeForDomain(domain: string): DecisionScope | undefined {
  return scopeMap.get(domain);
}

export function getDomainsForNode(nodeId: string): string[] {
  return nodeDomainMap.get(nodeId) || [];
}

export function isActionAllowed(domain: string, action: string): boolean {
  const scope = scopeMap.get(domain);
  if (!scope) return false;
  if (scope.blockedActions.includes(action)) return false;
  return scope.allowedActions.includes(action);
}
