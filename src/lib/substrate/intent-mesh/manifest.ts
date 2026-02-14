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
  {
    id: 'defense.geo_analysis',
    module: 'DEFENSE',
    description: 'Geo-location analysis and impossible travel detection',
    domains: ['geo', 'security', 'ip'],
    accepts: ['ip', 'actor_id'],
    produces: ['geo_location', 'country', 'impossible_travel', 'vpn_detected'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'defense.rate_limit_status',
    module: 'DEFENSE',
    description: 'Check current rate limit state for an actor or IP',
    domains: ['rate_limiting', 'security'],
    accepts: ['ip', 'actor_id', 'endpoint'],
    produces: ['rate_limit_status', 'remaining_requests', 'reset_at', 'throttled'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'defense.threat_timeline',
    module: 'DEFENSE',
    description: 'Historical threat activity timeline for forensic analysis',
    domains: ['threat', 'security', 'history'],
    accepts: ['ip', 'actor_id', 'time_range'],
    produces: ['threat_timeline', 'attack_vector', 'escalation_pattern'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'defense.fingerprint_analysis',
    module: 'DEFENSE',
    description: 'Device fingerprint analysis and consistency checking',
    domains: ['fingerprint', 'security', 'identity'],
    accepts: ['session_id', 'actor_id'],
    produces: ['device_type', 'fingerprint_hash', 'fingerprint_consistency', 'spoofing_risk'],
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
  {
    id: 'relay.engagement_score',
    module: 'RELAY',
    description: 'Calculate communication engagement score for an actor',
    domains: ['communication', 'email', 'behavior'],
    accepts: ['actor_id'],
    produces: ['engagement_score', 'open_rate', 'bounce_rate', 'preferred_channel', 'opt_out_status'],
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
  {
    id: 'vision.usage_analytics',
    module: 'VISION',
    description: 'Aggregate usage analytics and feature adoption metrics',
    domains: ['analytics', 'usage', 'monitoring', 'performance'],
    accepts: ['module', 'period', 'metric'],
    produces: ['conversion_rate', 'retention_score', 'churn_risk', 'usage_pattern', 'peak_hours', 'feature_adoption'],
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
  {
    id: 'identity.auth_strength',
    module: 'IDENTITY',
    description: 'Assess authentication strength and credential health',
    domains: ['authentication', 'identity', 'security'],
    accepts: ['actor_id', 'user_id'],
    produces: ['auth_method', 'credential_age', 'identity_strength', 'mfa_enabled', 'passkey_registered'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'identity.access_history',
    module: 'IDENTITY',
    description: 'Get access and authorization history for an actor',
    domains: ['authorization', 'identity', 'audit'],
    accepts: ['actor_id'],
    produces: ['access_history', 'privilege_level', 'role_changes', 'permission_anomalies'],
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
  {
    id: 'economy.cost_forecast',
    module: 'ECONOMY',
    description: 'Forecast costs and identify savings opportunities',
    domains: ['cost', 'budget', 'pricing'],
    accepts: ['module', 'period'],
    produces: ['projected_spend', 'cost_trend', 'savings_opportunity', 'cost_per_operation'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'economy.quota_status',
    module: 'ECONOMY',
    description: 'Check quota usage and remaining allocation',
    domains: ['quota', 'economy', 'usage'],
    accepts: ['actor_id', 'module'],
    produces: ['quota_remaining', 'quota_used_pct', 'reset_date', 'overage_risk'],
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
  {
    id: 'memory.semantic_search',
    module: 'MEMORY',
    description: 'Semantic similarity search across the knowledge base',
    domains: ['semantic', 'knowledge', 'recall'],
    accepts: ['query', 'domain', 'limit'],
    produces: ['semantic_similarity', 'knowledge_density', 'cross_references', 'memory_freshness'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'memory.learning_context',
    module: 'MEMORY',
    description: 'Provide learning context and historical insights for a module',
    domains: ['learning', 'context', 'history'],
    accepts: ['module', 'topic'],
    produces: ['learning_history', 'improvement_trajectory', 'key_discoveries', 'related_memories'],
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
  {
    id: 'audit.compliance_score',
    module: 'AUDIT',
    description: 'Calculate compliance posture score across governance domains',
    domains: ['compliance', 'governance', 'audit'],
    accepts: ['module', 'standard'],
    produces: ['compliance_score', 'policy_violations', 'regulatory_status', 'remediation_needed'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'audit.change_velocity',
    module: 'AUDIT',
    description: 'Measure rate of changes and detect anomalous modification patterns',
    domains: ['audit', 'behavior', 'accountability'],
    accepts: ['actor_id', 'entity_type', 'time_range'],
    produces: ['change_velocity', 'action_frequency', 'actor_risk_profile', 'unusual_patterns'],
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
  {
    id: 'brain.prediction',
    module: 'BRAIN',
    description: 'Generate predictive analysis based on historical patterns and learning',
    domains: ['prediction', 'intelligence', 'analysis'],
    accepts: ['context', 'prediction_type', 'module'],
    produces: ['prediction', 'confidence', 'supporting_evidence', 'risk_factors'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'brain.cross_module_insight',
    module: 'BRAIN',
    description: 'Synthesize cross-module insights and correlations',
    domains: ['intelligence', 'learning', 'cognition'],
    accepts: ['topic', 'modules'],
    produces: ['cross_module_correlation', 'insight_novelty', 'cognitive_load', 'decision_quality'],
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
  {
    id: 'sandbox.safety_assessment',
    module: 'SANDBOX',
    description: 'Assess safety and determinism of a proposed operation',
    domains: ['safety', 'validation', 'testing'],
    accepts: ['operation', 'context'],
    produces: ['safety_score', 'side_effects_detected', 'determinism_score', 'resource_usage'],
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
  {
    id: 'inclusive.usability_assessment',
    module: 'INCLUSIVE',
    description: 'Assess overall usability and inclusivity metrics',
    domains: ['usability', 'inclusivity', 'accessibility'],
    accepts: ['resource_id', 'context'],
    produces: ['usability_score', 'improvement_delta', 'priority_violations', 'remediation_history'],
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
  {
    id: 'cortex.bottleneck_analysis',
    module: 'CORTEX',
    description: 'Identify bottlenecks and optimal routing in pipeline execution',
    domains: ['orchestration', 'performance', 'scheduling'],
    accepts: ['pipeline_id', 'module'],
    produces: ['bottleneck_module', 'optimal_routing', 'throughput_rate', 'pipeline_health'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'cortex.workflow_coordination',
    module: 'CORTEX',
    description: 'Coordinate multi-step workflows across modules',
    domains: ['workflow', 'coordination', 'orchestration'],
    accepts: ['workflow_id', 'step', 'modules'],
    produces: ['workflow_status', 'next_step', 'dependency_graph', 'estimated_completion'],
    risk: 'read',
    enabled: true,
  },

  // ── DECODE ──
  {
    id: 'decode.intent_analysis',
    module: 'DECODE',
    description: 'Analyze and enrich raw intents with context and entity recognition',
    domains: ['intent', 'parsing', 'entity_recognition'],
    accepts: ['raw_input', 'context'],
    produces: ['parsed_intent', 'entities', 'confidence', 'ambiguity_score'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'decode.context_enrichment',
    module: 'DECODE',
    description: 'Enrich a request with contextual signals from parse history',
    domains: ['language', 'interpretation', 'context'],
    accepts: ['query', 'session_id'],
    produces: ['context_enrichment', 'command_suggestion', 'related_intents'],
    risk: 'read',
    enabled: true,
  },

  // ── NEXUS ──
  {
    id: 'nexus.provider_health',
    module: 'NEXUS',
    description: 'Get health and reliability metrics for AI providers',
    domains: ['provider', 'routing', 'ai'],
    accepts: ['model', 'task_type'],
    produces: ['provider_status', 'provider_reliability', 'latency_estimate', 'cost_estimate'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'nexus.optimal_routing',
    module: 'NEXUS',
    description: 'Determine optimal model/provider for a given task',
    domains: ['routing', 'ai', 'load_balancing'],
    accepts: ['task_type', 'priority', 'budget_cents'],
    produces: ['best_model', 'fallback_chain', 'estimated_latency', 'estimated_cost'],
    risk: 'read',
    enabled: true,
  },

  // ── DREAM ──
  {
    id: 'dream.synthesis_context',
    module: 'DREAM',
    description: 'Provide dream synthesis context and creative exploration results',
    domains: ['dream', 'synthesis', 'creativity'],
    accepts: ['topic', 'seed', 'mode'],
    produces: ['dream_content', 'synthesis_quality', 'novelty_score', 'cross_pollination'],
    risk: 'read',
    enabled: true,
  },
  {
    id: 'dream.exploration_insights',
    module: 'DREAM',
    description: 'Extract actionable insights from dream exploration cycles',
    domains: ['exploration', 'imagination', 'intelligence'],
    accepts: ['domain', 'depth'],
    produces: ['insight_applicability', 'exploration_depth', 'serendipity_score', 'applied_discoveries'],
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
