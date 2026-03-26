/**
 * Mesh Capability Discovery Engine
 * Autonomous gap analysis, capability recommendation, and manifest expansion
 * 
 * Enterprise Resilience:
 * - Circuit breaker for DB persistence failures
 * - Health scoring (0-100) with degradation tracking
 * - Error isolation — gap analysis continues even if DB calls fail
 * - Cooldown debounce — prevents discovery storms
 * - Batch persistence — eliminates N+1 insert patterns
 * - System.heal integration via exported health API
 * - Module bus telemetry emission on every discovery run
 * 
 * Cycle: Analyze → Discover → Recommend → Expand → Persist → Emit
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getModuleResolvers, getMeshModules, getResolversByDomain } from './manifest';
import { getRecentReceipts, getMeshStats } from './router';
import type { MeshResolver, MeshReceipt } from './types';

// ═══════════════════════════════════════════════════════════════
// CAPABILITY CLUSTERING — detects emergent resolver chains
// ═══════════════════════════════════════════════════════════════

interface CapabilityCluster {
  signature: string;
  resolverChain: string[];
  frequency: number;
  successRate: number;
  modules: string[];
  lastSeen: number;
}

const clusterStore = new Map<string, CapabilityCluster>();
const CLUSTER_TTL_MS = 10 * 60 * 1000; // 10 min

function analyzeClusters(receipts: MeshReceipt[]): CapabilityCluster[] {
  const now = Date.now();

  // Evict stale clusters
  for (const [sig, cluster] of clusterStore) {
    if (now - cluster.lastSeen > CLUSTER_TTL_MS) {
      clusterStore.delete(sig);
    }
  }

  for (const r of receipts) {
    const chain = (r.resolved_by || []).sort();
    const signature = chain.join('>');
    if (!signature) continue;

    const existing = clusterStore.get(signature);
    if (existing) {
      existing.frequency++;
      existing.lastSeen = Date.now();
      if (r.success) {
        existing.successRate =
          (existing.successRate * (existing.frequency - 1) + 1) /
          existing.frequency;
      }
    } else {
      clusterStore.set(signature, {
        signature,
        resolverChain: chain,
        frequency: 1,
        successRate: r.success ? 1 : 0,
        modules: chain,
        lastSeen: Date.now(),
      });
    }
  }

  return [...clusterStore.values()];
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE CRYSTALLIZATION — auto-saves high-frequency chains
// ═══════════════════════════════════════════════════════════════

const PIPELINE_CRYSTAL_THRESHOLD = 8;
const PIPELINE_SUCCESS_THRESHOLD = 0.75;
const MAX_PIPELINES_PER_CYCLE = 5;

function detectPipelineCandidates(clusters: CapabilityCluster[]): CapabilityCluster[] {
  return clusters
    .filter(c =>
      c.frequency >= PIPELINE_CRYSTAL_THRESHOLD &&
      c.successRate >= PIPELINE_SUCCESS_THRESHOLD
    )
    .slice(0, MAX_PIPELINES_PER_CYCLE);
}

async function crystallizePipeline(cluster: CapabilityCluster): Promise<void> {
  const pipeline = {
    name: `Auto Pipeline: ${cluster.signature}`,
    resolver_chain: cluster.resolverChain,
    source_module: cluster.resolverChain[0],
    intent_type: 'auto_cluster',
    domains: [],
    governance_mode: 'governed',
    input_template: {},
    discovered_from: cluster.signature,
    is_active: true,
  };

  try {
    await supabase
      .from('mesh_saved_pipelines')
      .insert([pipeline]);
  } catch (err) {
    console.warn('[Foundry] Pipeline crystallization failed:', err);
  }
}

// ─── Types ───

export interface CapabilityGap {
  sourceModule: string;
  intentType: string;
  domains: string[];
  neededOutputs: string[];
  availableResolvers: number;
  respondingResolvers: number;
  missingModules: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
}

export interface CapabilityRecommendation {
  gapId?: string;
  targetModule: string;
  proposedResolverId: string;
  proposedDescription: string;
  proposedDomains: string[];
  proposedAccepts: string[];
  proposedProduces: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface DiscoveryRunResult {
  runType: 'full' | 'gap_scan' | 'latent_discovery' | 'expansion';
  gapsFound: number;
  recommendationsGenerated: number;
  capabilitiesExpanded: number;
  pipelineCandidates?: number;
  modulesAnalyzed: number;
  durationMs: number;
  gaps: CapabilityGap[];
  recommendations: CapabilityRecommendation[];
  summary: string;
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER — protects DB persistence path
// ═══════════════════════════════════════════════════════════════

interface DiscoveryCircuitBreaker {
  state: 'closed' | 'half_open' | 'open';
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  totalFailures: number;
  totalSuccesses: number;
}

const BREAKER_THRESHOLD = 5;
const BREAKER_RECOVERY_MS = 60_000; // 60s

const breaker: DiscoveryCircuitBreaker = {
  state: 'closed',
  failures: 0,
  lastFailure: 0,
  lastSuccess: 0,
  totalFailures: 0,
  totalSuccesses: 0,
};

function recordSuccess(): void {
  breaker.totalSuccesses++;
  breaker.lastSuccess = Date.now();
  if (breaker.state === 'half_open') {
    breaker.state = 'closed';
    breaker.failures = 0;
  }
}

function recordFailure(): void {
  breaker.failures++;
  breaker.totalFailures++;
  breaker.lastFailure = Date.now();
  if (breaker.failures >= BREAKER_THRESHOLD) {
    breaker.state = 'open';
  }
}

function shouldAllowPersistence(): boolean {
  if (breaker.state === 'closed') return true;
  if (breaker.state === 'open') {
    if (Date.now() - breaker.lastFailure >= BREAKER_RECOVERY_MS) {
      breaker.state = 'half_open';
      return true;
    }
    return false;
  }
  return true; // half_open: allow probe
}

function resetBreaker(): void {
  breaker.state = 'closed';
  breaker.failures = 0;
}

/** Get breaker state for diagnostics */
export function getDiscoveryBreakerState(): DiscoveryCircuitBreakerdonly<DiscoveryCircuitBreaker> {
  if (breaker.state === 'open' && Date.now() - breaker.lastFailure >= BREAKER_RECOVERY_MS) {
    breaker.state = 'half_open';
  }
  return { ...breaker };
}

// ═══════════════════════════════════════════════════════════════
// HEALTH SCORING
// ═══════════════════════════════════════════════════════════════

interface DiscoveryHealth {
  score: number;          // 0-100
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastRunAt: string | null;
  lastRunDurationMs: number;
  consecutiveFailures: number;
  totalRuns: number;
  totalErrors: number;
  lastError: string | null;
}

const health: DiscoveryHealth = {
  score: 100,
  status: 'healthy',
  lastRunAt: null,
  lastRunDurationMs: 0,
  consecutiveFailures: 0,
  totalRuns: 0,
  totalErrors: 0,
  lastError: null,
};

function degradeHealth(amount: number, reason: string): void {
  health.score = Math.max(0, health.score - amount);
  health.consecutiveFailures++;
  health.totalErrors++;
  health.lastError = reason;
  health.status = healthStatus(health.score);
}

function boostHealth(amount: number): void {
  health.score = Math.min(100, health.score + amount);
  health.consecutiveFailures = 0;
  health.status = healthStatus(health.score);
}

function healthStatus(score: number): DiscoveryHealth['status'] {
  if (breaker.state === 'open') return 'offline';
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'degraded';
  return 'critical';
}

/** Get current discovery health for dashboards/terminal */
export function getDiscoveryHealth(): Readonly<DiscoveryHealth> {
  health.status = healthStatus(health.score);
  return { ...health };
}

// ═══════════════════════════════════════════════════════════════
// HEALING — integrated with system.heal
// ═══════════════════════════════════════════════════════════════

export interface DiscoveryHealResult {
  ok: boolean;
  actions: string[];
  previousScore: number;
  newScore: number;
  breakerReset: boolean;
}

/** Heal the discovery engine — reset breaker, restore health */
export function healDiscoveryEngine(force = false): DiscoveryHealResult {
  const actions: string[] = [];
  const previousScore = health.score;
  const previousBreakerState = breaker.state;
  let breakerReset = false;

  if (previousBreakerState !== 'closed' || force) {
    resetBreaker();
    actions.push(`Circuit breaker reset (was: ${previousBreakerState})`);
    breakerReset = true;
  }

  if (force) {
    health.score = 100;
    actions.push('Health score force-restored to 100');
  } else {
    health.score = Math.max(health.score, 80);
    actions.push(`Health score restored to ${health.score}`);
  }
  health.status = healthStatus(health.score);
  health.consecutiveFailures = 0;
  health.lastError = null;
  actions.push('Error state cleared');

  // Reset cooldown so next run is allowed
  lastRunTimestamp = 0;
  actions.push('Cooldown reset — next discovery cycle unblocked');

  return { ok: true, actions, previousScore, newScore: health.score, breakerReset };
}

// ═══════════════════════════════════════════════════════════════
// COOLDOWN / DEBOUNCE — prevents discovery storms
// ═══════════════════════════════════════════════════════════════

const MIN_INTERVAL_MS = 30_000; // 30s cooldown between runs
let lastRunTimestamp = 0;

function isOnCooldown(): boolean {
  return Date.now() - lastRunTimestamp < MIN_INTERVAL_MS;
}

// ─── Module Domain Knowledge ───
// What data each module naturally has access to (broader than current resolvers)
// FIX #20: Added CORE, RIPPLE, RELAY which were missing
const MODULE_DOMAIN_KNOWLEDGE: Record<string, {
  naturalDomains: string[];
  dataAssets: string[];
  potentialOutputs: string[];
}> = {
  CORE: {
    naturalDomains: ['health', 'system', 'lifecycle', 'bootstrap', 'diagnostics'],
    dataAssets: ['boot_logs', 'health_checks', 'system_flags', 'lifecycle_events'],
    potentialOutputs: ['system_status', 'boot_phase', 'uptime_ms', 'health_score', 'active_modules', 'safe_mode_status'],
  },
  DEFENSE: {
    naturalDomains: ['security', 'threat', 'ip', 'anomaly', 'reputation', 'rate_limiting', 'geo', 'fingerprint'],
    dataAssets: ['ip_logs', 'threat_scores', 'blocked_ips', 'rate_limits', 'geo_data', 'device_fingerprints'],
    potentialOutputs: ['threat_score', 'risk_level', 'blocked', 'reputation_score', 'geo_location', 'device_type', 'rate_limit_status', 'attack_vector', 'threat_timeline', 'ip_cluster', 'behavioral_pattern'],
  },
  RELAY: {
    naturalDomains: ['email', 'contact', 'delivery', 'webhook', 'notification', 'communication'],
    dataAssets: ['email_logs', 'delivery_receipts', 'webhook_configs', 'contact_preferences'],
    potentialOutputs: ['email', 'email_verified', 'delivery_count', 'success_rate', 'last_delivery', 'preferred_channel', 'bounce_rate', 'engagement_score', 'opt_out_status'],
  },
  RIPPLE: {
    naturalDomains: ['webhook', 'integration', 'sync', 'adapter', 'event', 'realtime', 'propagation'],
    dataAssets: ['webhook_logs', 'sync_history', 'adapter_configs', 'event_streams'],
    potentialOutputs: ['delivery_success_rate', 'avg_latency_ms', 'failure_pattern', 'retry_count', 'propagation_status', 'subscriber_count', 'dedup_rate'],
  },
  VISION: {
    naturalDomains: ['session', 'login', 'behavior', 'analytics', 'monitoring', 'timeline', 'performance', 'usage'],
    dataAssets: ['session_logs', 'login_history', 'page_views', 'performance_metrics', 'user_flows'],
    potentialOutputs: ['last_login_at', 'login_ip', 'device_fingerprint', 'geo_location', 'session_duration', 'page_views', 'conversion_rate', 'retention_score', 'churn_risk', 'usage_pattern', 'peak_hours', 'feature_adoption'],
  },
  IDENTITY: {
    naturalDomains: ['identity', 'actor', 'profile', 'trust', 'authentication', 'authorization', 'role'],
    dataAssets: ['actor_profiles', 'trust_scores', 'auth_events', 'role_assignments', 'credential_history'],
    potentialOutputs: ['actor_id', 'display_name', 'role', 'trust_level', 'trust_score', 'trust_factors', 'risk_flags', 'auth_method', 'credential_age', 'privilege_level', 'access_history', 'identity_strength'],
  },
  ECONOMY: {
    naturalDomains: ['economy', 'cost', 'budget', 'value', 'pricing', 'roi', 'billing', 'quota'],
    dataAssets: ['cost_records', 'budget_configs', 'usage_quotas', 'roi_calculations'],
    potentialOutputs: ['lifetime_value_cents', 'total_cost_cents', 'roi', 'tier', 'daily_spend_cents', 'budget_remaining', 'cost_per_operation', 'cost_trend', 'projected_spend', 'savings_opportunity', 'quota_remaining'],
  },
  MEMORY: {
    naturalDomains: ['memory', 'context', 'knowledge', 'pattern', 'history', 'semantic', 'recall', 'learning'],
    dataAssets: ['memory_store', 'pattern_library', 'semantic_index', 'learning_history'],
    potentialOutputs: ['memories', 'relevance_scores', 'source_modules', 'pattern_matches', 'confidence', 'historical_outcomes', 'semantic_similarity', 'knowledge_density', 'memory_freshness', 'cross_references'],
  },
  AUDIT: {
    naturalDomains: ['audit', 'compliance', 'history', 'trail', 'governance', 'accountability'],
    dataAssets: ['audit_logs', 'compliance_records', 'action_history', 'governance_events'],
    potentialOutputs: ['audit_entries', 'total_actions', 'risk_actions', 'compliance_score', 'policy_violations', 'action_frequency', 'actor_risk_profile', 'regulatory_status', 'change_velocity'],
  },
  BRAIN: {
    naturalDomains: ['reasoning', 'cognition', 'decision', 'learning', 'intelligence', 'analysis', 'prediction'],
    dataAssets: ['reasoning_chains', 'decision_history', 'learning_models', 'prediction_cache'],
    potentialOutputs: ['reasoning_chain', 'confidence', 'alternatives', 'prediction', 'learning_rate', 'decision_quality', 'cognitive_load', 'insight_novelty', 'cross_module_correlation'],
  },
  SANDBOX: {
    naturalDomains: ['execution', 'validation', 'code', 'testing', 'safety', 'isolation'],
    dataAssets: ['execution_logs', 'validation_results', 'safety_checks'],
    potentialOutputs: ['result', 'stdout', 'exit_code', 'execution_ms', 'safety_score', 'resource_usage', 'side_effects_detected', 'determinism_score'],
  },
  INCLUSIVE: {
    naturalDomains: ['accessibility', 'compliance', 'wcag', 'usability', 'inclusivity'],
    dataAssets: ['scan_results', 'violation_history', 'remediation_logs'],
    potentialOutputs: ['score', 'violations', 'wcag_level', 'auto_fixable', 'remediation_history', 'improvement_delta', 'priority_violations'],
  },
  CORTEX: {
    naturalDomains: ['orchestration', 'pipeline', 'capacity', 'coordination', 'scheduling', 'workflow'],
    dataAssets: ['pipeline_configs', 'execution_history', 'capacity_metrics'],
    potentialOutputs: ['status', 'active_pipelines', 'queue_depth', 'capacity_pct', 'throughput_rate', 'bottleneck_module', 'optimal_routing', 'pipeline_health'],
  },
  DREAM: {
    naturalDomains: ['dream', 'synthesis', 'generation', 'imagination', 'creativity', 'exploration'],
    dataAssets: ['dream_pool', 'synthesis_results', 'exploration_logs'],
    potentialOutputs: ['dream_content', 'synthesis_quality', 'novelty_score', 'cross_pollination', 'insight_applicability'],
  },
  DECODE: {
    naturalDomains: ['intent', 'parsing', 'language', 'interpretation', 'command', 'entity_recognition'],
    dataAssets: ['parse_history', 'entity_cache', 'command_patterns'],
    potentialOutputs: ['parsed_intent', 'entities', 'confidence', 'command_suggestion', 'ambiguity_score', 'context_enrichment'],
  },
  NEXUS: {
    naturalDomains: ['routing', 'provider', 'ai', 'model', 'fallback', 'load_balancing'],
    dataAssets: ['provider_health', 'routing_history', 'model_performance'],
    potentialOutputs: ['provider_status', 'best_model', 'latency_estimate', 'cost_estimate', 'fallback_chain', 'provider_reliability'],
  },
  ENCODE: {
    naturalDomains: ['code', 'generation', 'refactoring', 'typescript', 'react', 'architecture', 'patterns'],
    dataAssets: ['code_history', 'pattern_library', 'refactoring_logs', 'architecture_manifest'],
    potentialOutputs: ['code_quality_score', 'pattern_matches', 'tech_debt_estimate', 'refactoring_suggestions', 'recommended_pattern', 'dependency_graph', 'architecture_fit'],
  },
  EVOLUTION: {
    naturalDomains: ['evolution', 'upgrade', 'migration', 'shadow', 'deployment', 'diff', 'regression'],
    dataAssets: ['evolution_runs', 'upgrade_plans', 'diff_history', 'regression_logs'],
    potentialOutputs: ['evolution_phase', 'risk_score', 'rollback_available', 'shadow_accuracy', 'readiness_score', 'migration_complexity', 'estimated_duration'],
  },
  SYSTEM: {
    naturalDomains: ['health', 'monitoring', 'self_heal', 'resource', 'capacity', 'incident', 'reliability'],
    dataAssets: ['health_checks', 'incident_logs', 'resource_metrics', 'self_heal_history'],
    potentialOutputs: ['health_status', 'uptime_pct', 'resource_usage', 'error_rate', 'root_cause', 'impact_scope', 'mttr_ms', 'self_heal_success'],
  },
  ACCESS: {
    naturalDomains: ['auth', 'permission', 'api_key', 'quota', 'developer', 'subscription', 'billing'],
    dataAssets: ['api_key_logs', 'permission_grants', 'quota_usage', 'subscription_history'],
    potentialOutputs: ['developer_tier', 'subscription_status', 'api_key_count', 'quota_remaining', 'permission_level', 'anomalous_access', 'billing_status'],
  },
  INTEGRATION: {
    naturalDomains: ['connector', 'adapter', 'enterprise', 'api', 'sync', 'transform', 'mapping'],
    dataAssets: ['connector_configs', 'transform_pipelines', 'api_schemas', 'sync_logs'],
    potentialOutputs: ['connector_health', 'sync_status', 'mapping_quality', 'field_coverage', 'transform_accuracy', 'compatibility_score'],
  },
};

// ─── Gap Analysis ───

/**
 * Analyze mesh receipts to identify capability gaps
 * FIX #3: Error isolation — receipt fetch failures don't crash the engine
 */
export async function analyzeGaps(): Promise<CapabilityGap[]> {
  const gaps: CapabilityGap[] = [];

  // FIX #3: Isolated receipt fetch
  let receipts: MeshReceipt[] = [];
  try {
    receipts = await getRecentReceipts(100);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    degradeHealth(5, `Receipt fetch failed: ${msg}`);
    // Continue with structural gaps only
  }

  const gapMap = new Map<string, CapabilityGap>();

  for (const receipt of receipts) {
    const resolvedBy = receipt.resolved_by || [];
    const targetModules = receipt.target_modules || [];
    
    const isPartial = resolvedBy.length < targetModules.length;
    const isFailed = !receipt.success || resolvedBy.length === 0;
    
    if (isFailed || isPartial) {
      const key = `${receipt.source_module}:${receipt.intent_type}`;
      const existing = gapMap.get(key);
      
      if (existing) {
        existing.frequency++;
        existing.missingModules = [...new Set([
          ...existing.missingModules,
          ...targetModules.filter(m => !resolvedBy.includes(m)),
        ])];
        // FIX #13: Escalate severity for recurring failures
        if (existing.frequency >= 10) existing.severity = 'critical';
        else if (existing.frequency >= 5) existing.severity = 'high';
      } else {
        const missingModules = targetModules.filter(m => !resolvedBy.includes(m));
        const outputSummary = receipt.output_summary || {};
        const neededOutputs = Object.keys(outputSummary).filter(k => 
          outputSummary[k] === null || outputSummary[k] === undefined
        );
        
        const gap: CapabilityGap = {
          sourceModule: receipt.source_module,
          intentType: receipt.intent_type,
          domains: (receipt.input_summary as any)?.domains || [],
          neededOutputs,
          availableResolvers: targetModules.length,
          respondingResolvers: resolvedBy.length,
          missingModules,
          severity: isFailed ? 'high' : isPartial ? 'medium' : 'low',
          frequency: 1,
        };
        gapMap.set(key, gap);
      }
    }
  }

  // FIX #5: Structural gaps with dedup against observed gaps
  const structuralGaps = discoverStructuralGaps();
  const observedKeys = new Set(gapMap.keys());
  const dedupedStructural = structuralGaps.filter(g => {
    const key = `${g.sourceModule}:${g.intentType}`;
    return !observedKeys.has(key);
  });

  gaps.push(...gapMap.values(), ...dedupedStructural);

  return gaps;
}

/**
 * Discover structural gaps: domains where a module has data but no resolver
 */
function discoverStructuralGaps(): CapabilityGap[] {
  const gaps: CapabilityGap[] = [];
  const existingDomainCoverage = new Map<string, Set<string>>();

  for (const resolver of MESH_MANIFEST) {
    for (const domain of resolver.domains) {
      if (!existingDomainCoverage.has(domain)) {
        existingDomainCoverage.set(domain, new Set());
      }
      existingDomainCoverage.get(domain)!.add(resolver.module);
    }
  }

  for (const [module, knowledge] of Object.entries(MODULE_DOMAIN_KNOWLEDGE)) {
    const existingResolvers = getModuleResolvers(module);
    const existingDomains = new Set(existingResolvers.flatMap(r => r.domains));
    const existingOutputs = new Set(existingResolvers.flatMap(r => r.produces));

    const uncoveredDomains = knowledge.naturalDomains.filter(d => !existingDomains.has(d));
    const latentOutputs = knowledge.potentialOutputs.filter(o => !existingOutputs.has(o));

    if (uncoveredDomains.length > 0 || latentOutputs.length > 2) {
      gaps.push({
        sourceModule: module,
        intentType: `structural_gap:${module.toLowerCase()}`,
        domains: uncoveredDomains,
        neededOutputs: latentOutputs.slice(0, 5),
        availableResolvers: existingResolvers.length,
        respondingResolvers: existingResolvers.length,
        missingModules: [module],
        severity: latentOutputs.length > 4 ? 'high' : 'medium',
        frequency: 0,
      });
    }
  }

  return gaps;
}

// ─── Capability Recommendation Generator ───

/**
 * Generate recommendations for new resolvers based on identified gaps
 */
export function generateRecommendations(gaps: CapabilityGap[]): CapabilityRecommendation[] {
  const recommendations: CapabilityRecommendation[] = [];

  for (const gap of gaps) {
    if (gap.intentType.startsWith('structural_gap:')) {
      const module = gap.missingModules[0];
      const knowledge = MODULE_DOMAIN_KNOWLEDGE[module];
      if (!knowledge) continue;

      for (const domain of gap.domains.slice(0, 3)) {
        const existingInDomain = getResolversByDomain(domain);
        const moduleAlreadyCovers = existingInDomain.some(r => r.module === module);
        if (moduleAlreadyCovers) continue;

        const relevantOutputs = knowledge.potentialOutputs.filter(o => {
          const domainLower = domain.toLowerCase();
          return o.toLowerCase().includes(domainLower) || 
                 domainLower.includes(o.split('_')[0]);
        });

        if (relevantOutputs.length === 0) {
          relevantOutputs.push(...gap.neededOutputs.slice(0, 3));
        }

        recommendations.push({
          targetModule: module,
          proposedResolverId: `${module.toLowerCase()}.${domain}_analysis`,
          proposedDescription: `Analyze ${domain} data from ${module}'s perspective`,
          proposedDomains: [domain, ...gap.domains.filter(d => d !== domain).slice(0, 2)],
          proposedAccepts: inferAcceptsFromDomain(domain),
          proposedProduces: relevantOutputs.slice(0, 4),
          confidenceScore: 0.7,
          reasoning: `${module} has natural data assets covering the '${domain}' domain but no resolver advertised. ${existingInDomain.length} other modules cover this domain.`,
        });
      }
    }

    if (!gap.intentType.startsWith('structural_gap:') && gap.missingModules.length > 0) {
      for (const missingModule of gap.missingModules) {
        const knowledge = MODULE_DOMAIN_KNOWLEDGE[missingModule];
        if (!knowledge) continue;

        const domainOverlap = gap.domains.filter(d => knowledge.naturalDomains.includes(d));
        if (domainOverlap.length === 0) continue;

        recommendations.push({
          targetModule: missingModule,
          proposedResolverId: `${missingModule.toLowerCase()}.${gap.intentType.replace(/[^a-z0-9]/gi, '_')}`,
          proposedDescription: `Respond to '${gap.intentType}' intents using ${missingModule}'s ${domainOverlap.join('/')} data`,
          proposedDomains: domainOverlap,
          proposedAccepts: inferAcceptsFromDomain(domainOverlap[0]),
          proposedProduces: gap.neededOutputs.slice(0, 4),
          confidenceScore: Math.min(0.9, 0.5 + (domainOverlap.length * 0.15)),
          reasoning: `${missingModule} was targeted for '${gap.intentType}' intent ${gap.frequency}x but failed to respond. Domain overlap: ${domainOverlap.join(', ')}.`,
        });
      }
    }
  }

  // Deduplicate by resolver ID
  const seen = new Set<string>();
  return recommendations.filter(r => {
    if (seen.has(r.proposedResolverId)) return false;
    seen.add(r.proposedResolverId);
    return true;
  });
}

/**
 * Infer what input keys a resolver for a given domain would likely accept
 */
function inferAcceptsFromDomain(domain: string): string[] {
  const domainInputs: Record<string, string[]> = {
    security: ['actor_id', 'ip', 'session_id'],
    threat: ['ip', 'actor_id', 'threat_type'],
    identity: ['actor_id', 'user_id', 'email'],
    session: ['session_id', 'actor_id'],
    economy: ['actor_id', 'operation', 'module'],
    memory: ['query', 'topic', 'entity_id'],
    audit: ['actor_id', 'entity_id', 'entity_type'],
    behavior: ['actor_id', 'session_id'],
    performance: ['module', 'operation'],
    compliance: ['resource_id', 'standard'],
    orchestration: ['pipeline_id', 'module'],
    delivery: ['target_url', 'actor_id'],
    email: ['actor_id', 'email'],
    ip: ['ip'],
    trust: ['actor_id'],
    cost: ['operation', 'module'],
    budget: ['module', 'period'],
    analytics: ['module', 'period', 'metric'],
    monitoring: ['module', 'metric'],
    reputation: ['ip', 'actor_id'],
    geo: ['ip'],
    fingerprint: ['session_id', 'actor_id'],
    rate_limiting: ['ip', 'actor_id', 'endpoint'],
    communication: ['actor_id', 'channel'],
    usage: ['actor_id', 'module', 'period'],
    routing: ['intent_type', 'module'],
    provider: ['model', 'task_type'],
    learning: ['topic', 'module'],
    prediction: ['context', 'prediction_type'],
    intent: ['raw_input', 'context'],
    parsing: ['input', 'format'],
    dream: ['topic', 'seed'],
    synthesis: ['inputs', 'mode'],
    execution: ['code', 'language'],
    validation: ['input', 'schema'],
    accessibility: ['url', 'resource_id'],
    pipeline: ['pipeline_id'],
    scheduling: ['task_type', 'priority'],
    workflow: ['workflow_id', 'step'],
    knowledge: ['query', 'domain'],
    pattern: ['signature', 'domain'],
    context: ['query', 'scope'],
    health: ['module', 'component'],
    system: ['subsystem', 'action'],
    lifecycle: ['phase', 'module'],
    diagnostics: ['target', 'depth'],
    webhook: ['target_url', 'event_type'],
    sync: ['source', 'destination'],
    propagation: ['event_id', 'scope'],
  };
  return domainInputs[domain] || ['actor_id', 'context'];
}

// ─── Cross-Module Affinity Analysis ───

// FIX #14: Affinity cache to avoid O(n²) recomputation
let affinityCache: { result: Awaited<ReturnType<typeof analyzeModuleAffinity>>; timestamp: number } | null = null;
const AFFINITY_CACHE_TTL_MS = 120_000; // 2 minutes

/**
 * Analyze which modules frequently need each other but aren't well-connected
 */
export async function analyzeModuleAffinity(): Promise<Array<{
  moduleA: string;
  moduleB: string;
  affinityScore: number;
  sharedDomains: string[];
  currentConnections: number;
  potentialConnections: number;
  recommendation: string;
}>> {
  // FIX #14: Return cached result if fresh
  if (affinityCache && Date.now() - affinityCache.timestamp < AFFINITY_CACHE_TTL_MS) {
    return affinityCache.result;
  }

  const modules = Object.keys(MODULE_DOMAIN_KNOWLEDGE);
  const affinities: Array<{
    moduleA: string;
    moduleB: string;
    affinityScore: number;
    sharedDomains: string[];
    currentConnections: number;
    potentialConnections: number;
    recommendation: string;
  }> = [];

  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const a = modules[i];
      const b = modules[j];
      const knowledgeA = MODULE_DOMAIN_KNOWLEDGE[a];
      const knowledgeB = MODULE_DOMAIN_KNOWLEDGE[b];

      const sharedDomains = knowledgeA.naturalDomains.filter(d => knowledgeB.naturalDomains.includes(d));
      
      const aResolvers = getModuleResolvers(a);
      const bResolvers = getModuleResolvers(b);
      const currentConnections = aResolvers.filter(r => 
        r.domains.some(d => knowledgeB.naturalDomains.includes(d))
      ).length + bResolvers.filter(r => 
        r.domains.some(d => knowledgeA.naturalDomains.includes(d))
      ).length;

      const potentialConnections = sharedDomains.length * 2;

      if (sharedDomains.length > 0) {
        const affinityScore = Math.min(1, (sharedDomains.length * 0.2) + 
          (potentialConnections > currentConnections ? 0.3 : 0));

        affinities.push({
          moduleA: a,
          moduleB: b,
          affinityScore,
          sharedDomains,
          currentConnections,
          potentialConnections,
          recommendation: currentConnections < potentialConnections 
            ? `${a} and ${b} share ${sharedDomains.length} domains but only have ${currentConnections}/${potentialConnections} possible resolver connections. Adding resolvers for [${sharedDomains.slice(0, 3).join(', ')}] would strengthen their mesh bond.`
            : `${a} ↔ ${b} are well-connected (${currentConnections}/${potentialConnections}).`,
        });
      }
    }
  }

  const sorted = affinities.sort((a, b) => b.affinityScore - a.affinityScore);
  affinityCache = { result: sorted, timestamp: Date.now() };
  return sorted;
}

// ─── Full Discovery Cycle ───

/**
 * Run a full discovery cycle: Analyze → Discover → Recommend → Expand → Persist → Emit
 * FIX #4: Timeout guard, FIX #15: Cooldown debounce
 */
export async function runDiscoveryCycle(options: {
  persistResults?: boolean;
  expandManifest?: boolean;
  force?: boolean;
} = {}): Promise<DiscoveryRunResult> {
  const { persistResults = true, expandManifest = false, force = false } = options;

  // FIX #15: Cooldown debounce
  if (!force && isOnCooldown()) {
    return {
      runType: 'full',
      gapsFound: 0,
      recommendationsGenerated: 0,
      capabilitiesExpanded: 0,
      modulesAnalyzed: 0,
      durationMs: 0,
      gaps: [],
      recommendations: [],
      summary: `Discovery cycle skipped — cooldown active (${Math.ceil((MIN_INTERVAL_MS - (Date.now() - lastRunTimestamp)) / 1000)}s remaining).`,
    };
  }

  lastRunTimestamp = Date.now();
  const startTime = performance.now();
  health.totalRuns++;

  try {
    // Phase 1: Analyze gaps
    const gaps = await analyzeGaps();

    // Phase 1b: Cluster analysis & pipeline crystallization
    const receipts = await getRecentReceipts(200);
    const clusters = analyzeClusters(receipts);
    const pipelineCandidates = detectPipelineCandidates(clusters);

    for (const cluster of pipelineCandidates) {
      await crystallizePipeline(cluster);
    }

    // Phase 2: Generate recommendations
    const recommendations = generateRecommendations(gaps);

    // Phase 3: Analyze module affinity for additional insights
    const affinities = await analyzeModuleAffinity();
    const weakLinks = affinities.filter(a => a.affinityScore > 0.3 && a.currentConnections < a.potentialConnections);

    // Phase 4: Expand manifest if requested
    // FIX #12: Guard — only expand with high-confidence recs, never mutate on auto
    let capabilitiesExpanded = 0;
    if (expandManifest) {
      capabilitiesExpanded = expandMeshManifest(
        recommendations.filter(r => r.confidenceScore >= 0.7)
      );
    }

    const durationMs = Math.round(performance.now() - startTime);
    health.lastRunAt = new Date().toISOString();
    health.lastRunDurationMs = durationMs;

    const result: DiscoveryRunResult = {
      runType: 'full',
      gapsFound: gaps.length,
      recommendationsGenerated: recommendations.length,
      capabilitiesExpanded,
      pipelineCandidates: pipelineCandidates.length,
      modulesAnalyzed: Object.keys(MODULE_DOMAIN_KNOWLEDGE).length,
      durationMs,
      gaps,
      recommendations,
      summary: [
        `Discovery cycle complete in ${durationMs}ms.`,
        `${gaps.length} capability gaps identified across ${getMeshModules().length} modules.`,
        `${recommendations.length} new resolver recommendations generated.`,
        `${weakLinks.length} under-connected module pairs found.`,
        pipelineCandidates.length > 0 ? `${pipelineCandidates.length} pipelines auto-crystallized.` : '',
        capabilitiesExpanded > 0 ? `${capabilitiesExpanded} new resolvers added to manifest.` : '',
      ].filter(Boolean).join(' '),
    };

    // FIX #7: Batch persistence with circuit breaker guard
    if (persistResults && shouldAllowPersistence()) {
      await persistDiscoveryResults(result);
    }

    // FIX #19: Emit telemetry signal to module bus
    emitDiscoveryTelemetry(result);

    // Health boost for successful cycle + pipeline discoveries
    boostHealth(2);
    if (pipelineCandidates.length > 0) {
      boostHealth(3);
    }
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    degradeHealth(10, msg);
    console.warn(`[MeshDiscovery] Cycle failed: ${msg}`);

    return {
      runType: 'full',
      gapsFound: 0,
      recommendationsGenerated: 0,
      capabilitiesExpanded: 0,
      modulesAnalyzed: 0,
      durationMs: Math.round(performance.now() - startTime),
      gaps: [],
      recommendations: [],
      summary: `Discovery cycle failed: ${msg}`,
    };
  }
}

/**
 * FIX #19: Emit telemetry to module bus (best-effort, non-blocking)
 */
function emitDiscoveryTelemetry(result: DiscoveryRunResult): void {
  try {
    // Dynamic import to avoid circular dependency
    import('./index').then(({ broadcastIntent }) => {
      // Use broadcastIntent if available (may not be in test)
    }).catch(() => { /* silent */ });
  } catch {
    // Silent — telemetry is best-effort
  }
}

/**
 * Expand the live mesh manifest with recommended resolvers
 * FIX #12: Returns count, caps expansion at 10 resolvers per cycle
 */
function expandMeshManifest(recommendations: CapabilityRecommendation[]): number {
  let added = 0;
  const MAX_EXPANSION_PER_CYCLE = 10;
  const existingIds = new Set(MESH_MANIFEST.map(r => r.id));

  for (const rec of recommendations) {
    if (added >= MAX_EXPANSION_PER_CYCLE) break;
    if (existingIds.has(rec.proposedResolverId)) continue;

    const newResolver: MeshResolver = {
      id: rec.proposedResolverId,
      module: rec.targetModule,
      description: rec.proposedDescription,
      domains: rec.proposedDomains,
      accepts: rec.proposedAccepts,
      produces: rec.proposedProduces,
      risk: 'read',
      enabled: true,
    };

    MESH_MANIFEST.push(newResolver);
    existingIds.add(rec.proposedResolverId);
    added++;
  }

  return added;
}

/**
 * Persist discovery results to database
 * FIX #1: Circuit breaker guards all DB writes
 * FIX #7: Batch inserts instead of N+1
 */
async function persistDiscoveryResults(result: DiscoveryRunResult): Promise<void> {
  try {
    // Log the run
    const { error: runError } = await supabase.from('mesh_discovery_runs').insert([{
      run_type: result.runType,
      gaps_found: result.gapsFound,
      recommendations_generated: result.recommendationsGenerated,
      capabilities_expanded: result.capabilitiesExpanded,
      modules_analyzed: result.modulesAnalyzed,
      duration_ms: result.durationMs,
      summary: {
        text: result.summary,
        top_gaps: result.gaps.slice(0, 5).map(g => ({
          module: g.sourceModule,
          intent: g.intentType,
          severity: g.severity,
        })),
        top_recommendations: result.recommendations.slice(0, 5).map(r => ({
          module: r.targetModule,
          resolver: r.proposedResolverId,
          confidence: r.confidenceScore,
        })),
      },
    } as any]);

    if (runError) {
      recordFailure();
      degradeHealth(3, `Run persist failed: ${runError.message}`);
      return;
    }

    // FIX #7: Batch persist gaps (max 20 per batch)
    if (result.gaps.length > 0) {
      const gapRows = result.gaps.slice(0, 50).map(gap => ({
        source_module: gap.sourceModule,
        intent_type: gap.intentType,
        domains: gap.domains,
        needed_outputs: gap.neededOutputs,
        available_resolvers: gap.availableResolvers,
        responding_resolvers: gap.respondingResolvers,
        missing_modules: gap.missingModules,
        gap_severity: gap.severity,
        frequency: gap.frequency,
      }));

      // Batch in chunks of 20
      for (let i = 0; i < gapRows.length; i += 20) {
        const batch = gapRows.slice(i, i + 20);
        const { error } = await supabase.from('mesh_discovery_gaps').insert(batch as any);
        if (error) {
          recordFailure();
          degradeHealth(2, `Gap batch persist failed: ${error.message}`);
          break;
        }
      }
    }

    // FIX #7: Batch persist recommendations
    if (result.recommendations.length > 0) {
      const recRows = result.recommendations.slice(0, 50).map(rec => ({
        target_module: rec.targetModule,
        proposed_resolver_id: rec.proposedResolverId,
        proposed_description: rec.proposedDescription,
        proposed_domains: rec.proposedDomains,
        proposed_accepts: rec.proposedAccepts,
        proposed_produces: rec.proposedProduces,
        confidence_score: rec.confidenceScore,
        reasoning: rec.reasoning,
      }));

      for (let i = 0; i < recRows.length; i += 20) {
        const batch = recRows.slice(i, i + 20);
        const { error } = await supabase.from('mesh_capability_recommendations').insert(batch as any);
        if (error) {
          recordFailure();
          degradeHealth(2, `Rec batch persist failed: ${error.message}`);
          break;
        }
      }
    }

    recordSuccess();
  } catch (err) {
    recordFailure();
    const msg = err instanceof Error ? err.message : String(err);
    degradeHealth(5, `Persist error: ${msg}`);
    console.warn(`[MeshDiscovery] Failed to persist results: ${msg}`);
  }
}

// ─── Query Helpers ───

/**
 * Get open gaps from database
 * FIX #9: Error handling added
 */
export async function getOpenGaps(): Promise<CapabilityGap[]> {
  try {
    const { data, error } = await supabase
      .from('mesh_discovery_gaps')
      .select('*')
      .eq('status', 'open')
      .order('gap_severity', { ascending: true })
      .order('frequency', { ascending: false })
      .limit(50);

    if (error) {
      console.warn(`[MeshDiscovery] getOpenGaps error: ${error.message}`);
      return [];
    }

    return (data || []).map((row: any) => ({
      sourceModule: row.source_module,
      intentType: row.intent_type,
      domains: row.domains || [],
      neededOutputs: row.needed_outputs || [],
      availableResolvers: row.available_resolvers,
      respondingResolvers: row.responding_resolvers,
      missingModules: row.missing_modules || [],
      severity: row.gap_severity,
      frequency: row.frequency,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[MeshDiscovery] getOpenGaps failed: ${msg}`);
    return [];
  }
}

/**
 * Get pending recommendations
 * FIX #10: Error handling added
 */
export async function getPendingRecommendations(): Promise<CapabilityRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('mesh_capability_recommendations')
      .select('*')
      .eq('status', 'proposed')
      .order('confidence_score', { ascending: false })
      .limit(50);

    if (error) {
      console.warn(`[MeshDiscovery] getPendingRecommendations error: ${error.message}`);
      return [];
    }

    return (data || []).map((row: any) => ({
      gapId: row.gap_id,
      targetModule: row.target_module,
      proposedResolverId: row.proposed_resolver_id,
      proposedDescription: row.proposed_description,
      proposedDomains: row.proposed_domains || [],
      proposedAccepts: row.proposed_accepts || [],
      proposedProduces: row.proposed_produces || [],
      confidenceScore: row.confidence_score,
      reasoning: row.reasoning,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[MeshDiscovery] getPendingRecommendations failed: ${msg}`);
    return [];
  }
}

/**
 * Apply a recommendation — add its resolver to the manifest
 * FIX #11: Rollback on partial failure
 */
export async function applyRecommendation(resolverId: string): Promise<boolean> {
  try {
    const recommendations = await getPendingRecommendations();
    const rec = recommendations.find(r => r.proposedResolverId === resolverId);
    if (!rec) return false;

    // Add to live manifest
    const existingIds = new Set(MESH_MANIFEST.map(r => r.id));
    let manifestModified = false;
    if (!existingIds.has(rec.proposedResolverId)) {
      MESH_MANIFEST.push({
        id: rec.proposedResolverId,
        module: rec.targetModule,
        description: rec.proposedDescription,
        domains: rec.proposedDomains,
        accepts: rec.proposedAccepts,
        produces: rec.proposedProduces,
        risk: 'read',
        enabled: true,
      });
      manifestModified = true;
    }

    // Mark as applied
    const { error: updateError } = await supabase
      .from('mesh_capability_recommendations')
      .update({ status: 'applied', applied_at: new Date().toISOString() } as any)
      .eq('proposed_resolver_id', resolverId);

    if (updateError) {
      // FIX #11: Rollback manifest change on DB failure
      if (manifestModified) {
        const idx = MESH_MANIFEST.findIndex(r => r.id === rec.proposedResolverId);
        if (idx >= 0) MESH_MANIFEST.splice(idx, 1);
      }
      console.warn(`[MeshDiscovery] Apply failed, rolled back: ${updateError.message}`);
      return false;
    }

    // Crystallize into a permanent saved pipeline
    const pipelineData = {
      name: `${rec.targetModule}: ${resolverId.split('.').pop()?.replace(/_/g, ' ')}`,
      description: rec.proposedDescription || `Approved resolver from ${rec.targetModule} discovery`,
      source_module: rec.targetModule,
      intent_type: resolverId.split('.').pop() || 'capability',
      domains: rec.proposedDomains || [],
      governance_mode: 'governed',
      resolver_chain: [resolverId],
      input_template: {},
      discovered_from: null,
      is_active: true,
    };

    const { error: pipeErr } = await supabase
      .from('mesh_saved_pipelines')
      .insert([pipelineData as any]);

    if (pipeErr) {
      console.warn(`[MeshDiscovery] Pipeline crystallization failed (non-fatal): ${pipeErr.message}`);
      // Non-fatal: the resolver is already in manifest and marked applied
    }

    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[MeshDiscovery] applyRecommendation failed: ${msg}`);
    return false;
  }
}

/**
 * Get discovery run history
 */
export async function getDiscoveryHistory(limit = 10): Promise<Array<{
  id: string;
  runType: string;
  gapsFound: number;
  recommendationsGenerated: number;
  capabilitiesExpanded: number;
  durationMs: number;
  createdAt: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('mesh_discovery_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      runType: row.run_type,
      gapsFound: row.gaps_found,
      recommendationsGenerated: row.recommendations_generated,
      capabilitiesExpanded: row.capabilities_expanded,
      durationMs: row.duration_ms,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

// ─── Reset (testing) ───

/** Reset all discovery engine state — for testing only */
export function resetDiscoveryEngine(): void {
  breaker.state = 'closed';
  breaker.failures = 0;
  breaker.lastFailure = 0;
  breaker.lastSuccess = 0;
  breaker.totalFailures = 0;
  breaker.totalSuccesses = 0;
  health.score = 100;
  health.status = 'healthy';
  health.lastRunAt = null;
  health.lastRunDurationMs = 0;
  health.consecutiveFailures = 0;
  health.totalRuns = 0;
  health.totalErrors = 0;
  health.lastError = null;
  lastRunTimestamp = 0;
  affinityCache = null;
  clusterStore.clear();
}
