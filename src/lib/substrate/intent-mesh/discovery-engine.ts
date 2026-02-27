/**
 * Mesh Capability Discovery Engine
 * Autonomous gap analysis, capability recommendation, and manifest expansion
 * 
 * Analyzes mesh receipts to find:
 * 1. GAPS: Intents that failed or partially resolved (modules asking questions nobody could answer)
 * 2. LATENT CAPABILITIES: Outputs a module could theoretically produce based on its data domain
 * 3. RECOMMENDATIONS: New resolvers that would close identified gaps
 * 
 * Cycle: Analyze → Discover → Recommend → Expand → Repeat
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getModuleResolvers, getMeshModules, getResolversByDomain } from './manifest';
import { getRecentReceipts, getMeshStats } from './router';
import type { MeshResolver, MeshReceipt } from './types';

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
  modulesAnalyzed: number;
  durationMs: number;
  gaps: CapabilityGap[];
  recommendations: CapabilityRecommendation[];
  summary: string;
}

// ─── Module Domain Knowledge ───
// What data each module naturally has access to (broader than current resolvers)
const MODULE_DOMAIN_KNOWLEDGE: Record<string, {
  naturalDomains: string[];
  dataAssets: string[];
  potentialOutputs: string[];
}> = {
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
  MODERNIZER: {
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
  RIPPLE: {
    naturalDomains: ['webhook', 'integration', 'sync', 'adapter', 'event', 'realtime', 'propagation'],
    dataAssets: ['webhook_logs', 'sync_history', 'adapter_configs', 'event_streams'],
    potentialOutputs: ['delivery_success_rate', 'avg_latency_ms', 'failure_pattern', 'retry_count', 'propagation_status', 'subscriber_count', 'dedup_rate'],
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
 * Gaps = intents where no resolvers matched, or resolvers partially answered
 */
export async function analyzeGaps(): Promise<CapabilityGap[]> {
  const receipts = await getRecentReceipts(100);
  const gaps: CapabilityGap[] = [];
  const gapMap = new Map<string, CapabilityGap>();

  for (const receipt of receipts) {
    const resolvedBy = receipt.resolved_by || [];
    const targetModules = receipt.target_modules || [];
    
    // Gap: intent was broadcast but got no/partial resolution
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

  // Also discover structural gaps — modules that SHOULD be able to answer but have no resolver
  const structuralGaps = discoverStructuralGaps();
  gaps.push(...gapMap.values(), ...structuralGaps);

  return gaps;
}

/**
 * Discover structural gaps: domains where a module has data but no resolver
 */
function discoverStructuralGaps(): CapabilityGap[] {
  const gaps: CapabilityGap[] = [];
  const existingDomainCoverage = new Map<string, Set<string>>();

  // Map which domains are currently covered by which modules
  for (const resolver of MESH_MANIFEST) {
    for (const domain of resolver.domains) {
      if (!existingDomainCoverage.has(domain)) {
        existingDomainCoverage.set(domain, new Set());
      }
      existingDomainCoverage.get(domain)!.add(resolver.module);
    }
  }

  // For each module, check if its natural domains are covered
  for (const [module, knowledge] of Object.entries(MODULE_DOMAIN_KNOWLEDGE)) {
    const existingResolvers = getModuleResolvers(module);
    const existingDomains = new Set(existingResolvers.flatMap(r => r.domains));
    const existingOutputs = new Set(existingResolvers.flatMap(r => r.produces));

    // Find domains this module naturally covers but has no resolver for
    const uncoveredDomains = knowledge.naturalDomains.filter(d => !existingDomains.has(d));
    // Find outputs this module could produce but doesn't
    const latentOutputs = knowledge.potentialOutputs.filter(o => !existingOutputs.has(o));

    if (uncoveredDomains.length > 0 || latentOutputs.length > 2) {
      gaps.push({
        sourceModule: module,
        intentType: `structural_gap:${module.toLowerCase()}`,
        domains: uncoveredDomains,
        neededOutputs: latentOutputs.slice(0, 5), // Top 5 most useful
        availableResolvers: existingResolvers.length,
        respondingResolvers: existingResolvers.length,
        missingModules: [module], // The module itself is the one that should expand
        severity: latentOutputs.length > 4 ? 'high' : 'medium',
        frequency: 0, // Structural, not observed
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
    // For structural gaps, recommend new resolvers for the module's latent capabilities
    if (gap.intentType.startsWith('structural_gap:')) {
      const module = gap.missingModules[0];
      const knowledge = MODULE_DOMAIN_KNOWLEDGE[module];
      if (!knowledge) continue;

      // Generate resolver recommendations for uncovered domains
      for (const domain of gap.domains.slice(0, 3)) {
        const existingInDomain = getResolversByDomain(domain);
        const moduleAlreadyCovers = existingInDomain.some(r => r.module === module);
        if (moduleAlreadyCovers) continue;

        const relevantOutputs = knowledge.potentialOutputs.filter(o => {
          // Find outputs semantically related to this domain
          const domainLower = domain.toLowerCase();
          return o.toLowerCase().includes(domainLower) || 
                 domainLower.includes(o.split('_')[0]);
        });

        if (relevantOutputs.length === 0) {
          // Use the first few latent outputs as a fallback
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

    // For observed gaps (failed/partial intents), recommend which module should fill
    if (!gap.intentType.startsWith('structural_gap:') && gap.missingModules.length > 0) {
      for (const missingModule of gap.missingModules) {
        const knowledge = MODULE_DOMAIN_KNOWLEDGE[missingModule];
        if (!knowledge) continue;

        // Check if this module's data assets could answer the intent
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
  };
  return domainInputs[domain] || ['actor_id', 'context'];
}

// ─── Cross-Module Affinity Analysis ───

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

      // Shared domains = natural affinity
      const sharedDomains = knowledgeA.naturalDomains.filter(d => knowledgeB.naturalDomains.includes(d));
      
      // Current connections = resolvers that reference each other's domains
      const aResolvers = getModuleResolvers(a);
      const bResolvers = getModuleResolvers(b);
      const currentConnections = aResolvers.filter(r => 
        r.domains.some(d => knowledgeB.naturalDomains.includes(d))
      ).length + bResolvers.filter(r => 
        r.domains.some(d => knowledgeA.naturalDomains.includes(d))
      ).length;

      // Potential connections = how many new resolvers could link them
      const potentialConnections = sharedDomains.length * 2; // Both directions

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

  return affinities.sort((a, b) => b.affinityScore - a.affinityScore);
}

// ─── Full Discovery Cycle ───

/**
 * Run a full discovery cycle: Analyze → Discover → Recommend → Persist
 */
export async function runDiscoveryCycle(options: {
  persistResults?: boolean;
  expandManifest?: boolean;
} = {}): Promise<DiscoveryRunResult> {
  const startTime = performance.now();
  const { persistResults = true, expandManifest = false } = options;

  // Phase 1: Analyze gaps
  const gaps = await analyzeGaps();

  // Phase 2: Generate recommendations
  const recommendations = generateRecommendations(gaps);

  // Phase 3: Analyze module affinity for additional insights
  const affinities = await analyzeModuleAffinity();
  const weakLinks = affinities.filter(a => a.affinityScore > 0.3 && a.currentConnections < a.potentialConnections);

  // Phase 4: Expand manifest if requested
  let capabilitiesExpanded = 0;
  if (expandManifest) {
    capabilitiesExpanded = expandMeshManifest(
      recommendations.filter(r => r.confidenceScore >= 0.7)
    );
  }

  const durationMs = Math.round(performance.now() - startTime);

  const result: DiscoveryRunResult = {
    runType: 'full',
    gapsFound: gaps.length,
    recommendationsGenerated: recommendations.length,
    capabilitiesExpanded,
    modulesAnalyzed: Object.keys(MODULE_DOMAIN_KNOWLEDGE).length,
    durationMs,
    gaps,
    recommendations,
    summary: [
      `Discovery cycle complete in ${durationMs}ms.`,
      `${gaps.length} capability gaps identified across ${getMeshModules().length} modules.`,
      `${recommendations.length} new resolver recommendations generated.`,
      `${weakLinks.length} under-connected module pairs found.`,
      capabilitiesExpanded > 0 ? `${capabilitiesExpanded} new resolvers added to manifest.` : '',
    ].filter(Boolean).join(' '),
  };

  // Persist to database
  if (persistResults) {
    await persistDiscoveryResults(result);
  }

  return result;
}

/**
 * Expand the live mesh manifest with recommended resolvers
 * Returns count of new resolvers added
 */
function expandMeshManifest(recommendations: CapabilityRecommendation[]): number {
  let added = 0;
  const existingIds = new Set(MESH_MANIFEST.map(r => r.id));

  for (const rec of recommendations) {
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
 */
async function persistDiscoveryResults(result: DiscoveryRunResult): Promise<void> {
  try {
    // Log the run
    await supabase.from('mesh_discovery_runs').insert([{
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

    // Persist gaps
    for (const gap of result.gaps) {
      try {
        await supabase.from('mesh_discovery_gaps').insert([{
          source_module: gap.sourceModule,
          intent_type: gap.intentType,
          domains: gap.domains,
          needed_outputs: gap.neededOutputs,
          available_resolvers: gap.availableResolvers,
          responding_resolvers: gap.respondingResolvers,
          missing_modules: gap.missingModules,
          gap_severity: gap.severity,
          frequency: gap.frequency,
        } as any]);
      } catch { /* ignore duplicates */ }
    }

    // Persist recommendations
    for (const rec of result.recommendations) {
      try {
        await supabase.from('mesh_capability_recommendations').insert([{
          target_module: rec.targetModule,
          proposed_resolver_id: rec.proposedResolverId,
          proposed_description: rec.proposedDescription,
          proposed_domains: rec.proposedDomains,
          proposed_accepts: rec.proposedAccepts,
          proposed_produces: rec.proposedProduces,
          confidence_score: rec.confidenceScore,
          reasoning: rec.reasoning,
        } as any]);
      } catch { /* ignore */ }
    }
  } catch (err) {
    console.warn('[MeshDiscovery] Failed to persist results:', err);
  }
}

// ─── Query Helpers ───

/**
 * Get open gaps from database
 */
export async function getOpenGaps(): Promise<CapabilityGap[]> {
  const { data } = await supabase
    .from('mesh_discovery_gaps')
    .select('*')
    .eq('status', 'open')
    .order('gap_severity', { ascending: true })
    .order('frequency', { ascending: false })
    .limit(50);

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
}

/**
 * Get pending recommendations
 */
export async function getPendingRecommendations(): Promise<CapabilityRecommendation[]> {
  const { data } = await supabase
    .from('mesh_capability_recommendations')
    .select('*')
    .eq('status', 'proposed')
    .order('confidence_score', { ascending: false })
    .limit(50);

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
}

/**
 * Apply a recommendation — add its resolver to the manifest
 */
export async function applyRecommendation(resolverId: string): Promise<boolean> {
  const recommendations = await getPendingRecommendations();
  const rec = recommendations.find(r => r.proposedResolverId === resolverId);
  if (!rec) return false;

  // Add to live manifest
  const existingIds = new Set(MESH_MANIFEST.map(r => r.id));
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
  }

  // Mark as applied
  await supabase
    .from('mesh_capability_recommendations')
    .update({ status: 'applied', applied_at: new Date().toISOString() } as any)
    .eq('proposed_resolver_id', resolverId);

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
    discovered_from: null, // FK to mesh_intents — set null for discovery-originated pipelines
    is_active: true,
  };

  const { error: pipeErr } = await supabase
    .from('mesh_saved_pipelines')
    .insert([pipelineData as any]);

  if (pipeErr) {
    console.error('[Mesh:Discovery] Pipeline crystallization failed:', pipeErr);
  }

  return true;
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
  const { data } = await supabase
    .from('mesh_discovery_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data || []).map((row: any) => ({
    id: row.id,
    runType: row.run_type,
    gapsFound: row.gaps_found,
    recommendationsGenerated: row.recommendations_generated,
    capabilitiesExpanded: row.capabilities_expanded,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  }));
}
