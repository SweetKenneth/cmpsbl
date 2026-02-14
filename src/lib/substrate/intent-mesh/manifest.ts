/**
 * Intent Mesh — Capability Manifest
 * v10.0.0 — Each module's advertised resolvers
 * 
 * This is the "phone book" of the mesh. Modules declare what they can do,
 * and the router matches intents to capable resolvers dynamically.
 * 
 * IMPORTANT: All resolvers default to 'read' risk. No mutations without governance.
 */

import type { MeshResolver } from './types';

export const MESH_MANIFEST: MeshResolver[] = [
  // ── DEFENSE ──
  {
    id: 'defense.threat_score',
    module: 'DEFENSE',
    description: 'Calculate threat score for an IP, actor, or session',
    domains: ['security', 'threat', 'ip'],
    accepts: ['ip', 'actor_id', 'session_id'],
    produces: ['threat_score', 'risk_level', 'blocked'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'defense.ip_reputation',
    module: 'DEFENSE',
    description: 'Lookup IP reputation and history',
    domains: ['security', 'ip', 'reputation'],
    accepts: ['ip'],
    produces: ['reputation_score', 'total_requests', 'blocked_count', 'last_seen'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'defense.anomaly_detect',
    module: 'DEFENSE',
    description: 'Detect behavioral anomalies for an actor',
    domains: ['security', 'anomaly', 'behavior'],
    accepts: ['actor_id', 'session_id', 'action_history'],
    produces: ['anomaly_score', 'anomaly_type', 'confidence'],
    risk: 'read',
    enabled: true,
  },

  // ── RELAY ──
  {
    id: 'relay.email_by_actor',
    module: 'RELAY',
    description: 'Resolve email address for an actor ID',
    domains: ['identity', 'email', 'contact'],
    accepts: ['actor_id', 'user_id'],
    produces: ['email', 'email_verified', 'last_contacted'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'relay.delivery_history',
    module: 'RELAY',
    description: 'Get webhook/notification delivery history for a target',
    domains: ['delivery', 'webhook', 'notification'],
    accepts: ['target_url', 'actor_id'],
    produces: ['delivery_count', 'success_rate', 'last_delivery'],
    risk: 'read',
    enabled: true,
  },

  // ── VISION ──
  {
    id: 'vision.last_login',
    module: 'VISION',
    description: 'Get last login details for a user/actor',
    domains: ['session', 'login', 'identity'],
    accepts: ['actor_id', 'user_id', 'ip'],
    produces: ['last_login_at', 'login_ip', 'device_fingerprint', 'geo_location'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'vision.session_timeline',
    module: 'VISION',
    description: 'Get session activity timeline for anomaly correlation',
    domains: ['session', 'timeline', 'behavior'],
    accepts: ['session_id', 'actor_id'],
    produces: ['events', 'page_views', 'duration_ms', 'actions'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'vision.anomaly_score',
    module: 'VISION',
    description: 'Calculate behavioral anomaly score from session patterns',
    domains: ['anomaly', 'behavior', 'session'],
    accepts: ['actor_id', 'session_id'],
    produces: ['anomaly_score', 'deviation_type', 'baseline_comparison'],
    risk: 'read',
    enabled: true,
  },

  // ── IDENTITY ──
  {
    id: 'identity.resolve_actor',
    module: 'IDENTITY',
    description: 'Resolve full actor profile from any identifier',
    domains: ['identity', 'actor', 'profile'],
    accepts: ['actor_id', 'user_id', 'email', 'ip'],
    produces: ['actor_id', 'display_name', 'role', 'trust_level', 'created_at'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'identity.trust_score',
    module: 'IDENTITY',
    description: 'Calculate trust score for an actor based on history',
    domains: ['identity', 'trust', 'security'],
    accepts: ['actor_id'],
    produces: ['trust_score', 'trust_factors', 'risk_flags'],
    risk: 'read',
    enabled: true,
  },

  // ── ECONOMY ──
  {
    id: 'economy.actor_value',
    module: 'ECONOMY',
    description: 'Get lifetime value and cost attribution for an actor',
    domains: ['economy', 'value', 'cost'],
    accepts: ['actor_id', 'user_id'],
    produces: ['lifetime_value_cents', 'total_cost_cents', 'roi', 'tier'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'economy.budget_check',
    module: 'ECONOMY',
    description: 'Check if an operation is within budget constraints',
    domains: ['economy', 'budget', 'cost'],
    accepts: ['operation', 'estimated_cost_cents'],
    produces: ['within_budget', 'remaining_budget_cents', 'daily_spend_cents'],
    risk: 'read',
    enabled: true,
  },

  // ── MEMORY ──
  {
    id: 'memory.recall_context',
    module: 'MEMORY',
    description: 'Recall relevant memories for a topic or entity',
    domains: ['memory', 'context', 'knowledge'],
    accepts: ['query', 'topic', 'entity_id'],
    produces: ['memories', 'relevance_scores', 'source_modules'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'memory.pattern_match',
    module: 'MEMORY',
    description: 'Find historical patterns matching current context',
    domains: ['memory', 'pattern', 'history'],
    accepts: ['pattern_signature', 'domain'],
    produces: ['matches', 'confidence', 'historical_outcomes'],
    risk: 'read',
    enabled: true,
  },

  // ── AUDIT ──
  {
    id: 'audit.actor_history',
    module: 'AUDIT',
    description: 'Get immutable audit trail for an actor or entity',
    domains: ['audit', 'history', 'compliance'],
    accepts: ['actor_id', 'entity_id', 'entity_type'],
    produces: ['audit_entries', 'total_actions', 'risk_actions'],
    risk: 'read',
    enabled: true,
  },

  // ── BRAIN ──
  {
    id: 'brain.reasoning_context',
    module: 'BRAIN',
    description: 'Get cognitive reasoning context for a decision',
    domains: ['reasoning', 'cognition', 'decision'],
    accepts: ['decision_type', 'context'],
    produces: ['reasoning_chain', 'confidence', 'alternatives'],
    risk: 'read',
    enabled: true,
  },

  // ── SANDBOX ──
  {
    id: 'sandbox.safe_eval',
    module: 'SANDBOX',
    description: 'Safely evaluate code or expressions in isolation',
    domains: ['execution', 'validation', 'code'],
    accepts: ['code', 'language', 'timeout_ms'],
    produces: ['result', 'stdout', 'exit_code', 'execution_ms'],
    risk: 'read',
    enabled: true,
  },

  // ── INCLUSIVE ──
  {
    id: 'inclusive.accessibility_score',
    module: 'INCLUSIVE',
    description: 'Get accessibility compliance score for a resource',
    domains: ['accessibility', 'compliance', 'wcag'],
    accepts: ['url', 'resource_id'],
    produces: ['score', 'violations', 'wcag_level', 'auto_fixable'],
    risk: 'read',
    enabled: true,
  },

  // ── CORTEX ──
  {
    id: 'cortex.orchestration_status',
    module: 'CORTEX',
    description: 'Get current orchestration pipeline status and capacity',
    domains: ['orchestration', 'pipeline', 'capacity'],
    accepts: ['pipeline_id'],
    produces: ['status', 'active_pipelines', 'queue_depth', 'capacity_pct'],
    risk: 'read',
    enabled: true,
  },
];

/** Get all resolvers for a specific module */
export function getModuleResolvers(module: string): MeshResolver[] {
  return MESH_MANIFEST.filter(r => r.module === module.toUpperCase());
}

/** Get all resolvers that can handle a specific domain */
export function getResolversByDomain(domain: string): MeshResolver[] {
  return MESH_MANIFEST.filter(r => r.enabled && r.domains.includes(domain));
}

/** Get all resolvers that produce a specific output key */
export function getResolversByOutput(outputKey: string): MeshResolver[] {
  return MESH_MANIFEST.filter(r => r.enabled && r.produces.includes(outputKey));
}

/** Get all unique modules in the manifest */
export function getMeshModules(): string[] {
  return [...new Set(MESH_MANIFEST.map(r => r.module))];
}
