/**
 * Module Self-Discovery Engine
 * Each module autonomously discovers its own latent capabilities
 * 
 * Every module can:
 * 1. Introspect its own data assets and domain knowledge
 * 2. Discover capabilities it COULD advertise but doesn't yet
 * 3. Propose new resolvers to the dashboard for approval
 * 4. Learn from mesh interactions which intents it should handle better
 * 
 * Discovery results are surfaced in the OS Dashboard → Mesh Activity → Module Proposals
 * and queued for human approval before being added to the live manifest.
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getModuleResolvers, getResolversByDomain } from './manifest';
import { getRecentReceipts } from './router';
import type { MeshResolver, MeshReceipt } from './types';

// ─── Types ───

export interface ModuleProposal {
  id: string;
  module: string;
  proposedResolverId: string;
  description: string;
  domains: string[];
  accepts: string[];
  produces: string[];
  reasoning: string;
  discoveryMethod: 'introspection' | 'gap_response' | 'affinity_bridge' | 'intent_learning';
  confidenceScore: number;
  status: 'proposed' | 'approved' | 'rejected' | 'applied';
  createdAt: string;
}

export interface ModuleDiscoveryState {
  module: string;
  totalProposals: number;
  approvedProposals: number;
  appliedProposals: number;
  lastDiscoveryAt: string | null;
  discoveryScore: number; // 0-100, how well this module self-discovers
}

export interface ModuleDiscoveryResult {
  module: string;
  proposals: ModuleProposal[];
  introspectionFindings: string[];
  gapResponses: string[];
  durationMs: number;
}

// ─── Module Discovery Profiles ───
// Extended domain knowledge for self-discovery (beyond manifest entries)

const MODULE_DISCOVERY_PROFILES: Record<string, {
  naturalDomains: string[];
  dataAssets: string[];
  latentCapabilities: string[];
  affinityModules: string[];
  discoveryHints: string[];
}> = {
  DEFENSE: {
    naturalDomains: ['security', 'threat', 'ip', 'anomaly', 'reputation', 'rate_limiting', 'geo', 'fingerprint', 'waf', 'ddos'],
    dataAssets: ['ip_logs', 'threat_scores', 'blocked_ips', 'rate_limits', 'geo_data', 'device_fingerprints', 'waf_rules'],
    latentCapabilities: ['attack_correlation', 'threat_prediction', 'ip_clustering', 'behavioral_profiling', 'zero_day_detection', 'honeypot_analysis'],
    affinityModules: ['IDENTITY', 'AUDIT', 'VISION'],
    discoveryHints: ['Can I correlate attacks across IPs?', 'Can I predict threat escalation?', 'Can I cluster suspicious IP ranges?'],
  },
  RELAY: {
    naturalDomains: ['email', 'contact', 'delivery', 'webhook', 'notification', 'communication', 'messaging'],
    dataAssets: ['email_logs', 'delivery_receipts', 'webhook_configs', 'contact_preferences', 'bounce_logs'],
    latentCapabilities: ['channel_optimization', 'delivery_prediction', 'engagement_forecasting', 'spam_detection', 'template_effectiveness'],
    affinityModules: ['IDENTITY', 'ECONOMY', 'VISION'],
    discoveryHints: ['Can I predict which channel a user prefers?', 'Can I forecast delivery success?', 'Can I detect engagement decay?'],
  },
  VISION: {
    naturalDomains: ['session', 'login', 'behavior', 'analytics', 'monitoring', 'timeline', 'performance', 'usage', 'telemetry'],
    dataAssets: ['session_logs', 'login_history', 'page_views', 'performance_metrics', 'user_flows', 'error_traces'],
    latentCapabilities: ['user_journey_mapping', 'performance_regression_detection', 'feature_impact_analysis', 'cohort_behavior', 'funnel_optimization'],
    affinityModules: ['BRAIN', 'DEFENSE', 'INCLUSIVE'],
    discoveryHints: ['Can I detect feature adoption patterns?', 'Can I predict user churn?', 'Can I identify performance regressions early?'],
  },
  IDENTITY: {
    naturalDomains: ['identity', 'actor', 'profile', 'trust', 'authentication', 'authorization', 'role', 'credential', 'passkey'],
    dataAssets: ['actor_profiles', 'trust_scores', 'auth_events', 'role_assignments', 'credential_history', 'passkey_registry'],
    latentCapabilities: ['reputation_scoring', 'cross_session_linking', 'privilege_escalation_detection', 'identity_graph', 'account_takeover_detection'],
    affinityModules: ['DEFENSE', 'AUDIT', 'ACCESS'],
    discoveryHints: ['Can I build an identity graph across sessions?', 'Can I detect account takeover attempts?', 'Can I score actor reputation over time?'],
  },
  ECONOMY: {
    naturalDomains: ['economy', 'cost', 'budget', 'value', 'pricing', 'roi', 'billing', 'quota', 'metering'],
    dataAssets: ['cost_records', 'budget_configs', 'usage_quotas', 'roi_calculations', 'billing_history'],
    latentCapabilities: ['cost_anomaly_detection', 'roi_optimization', 'usage_forecasting', 'waste_identification', 'tier_recommendation'],
    affinityModules: ['NEXUS', 'CORTEX', 'VISION'],
    discoveryHints: ['Can I detect cost anomalies before they spike?', 'Can I recommend tier changes?', 'Can I identify wasted compute?'],
  },
  MEMORY: {
    naturalDomains: ['memory', 'context', 'knowledge', 'pattern', 'history', 'semantic', 'recall', 'learning', 'embedding'],
    dataAssets: ['memory_store', 'pattern_library', 'semantic_index', 'learning_history', 'embedding_vectors'],
    latentCapabilities: ['knowledge_gap_detection', 'memory_decay_prediction', 'cross_domain_linking', 'insight_synthesis', 'embedding_drift_detection'],
    affinityModules: ['BRAIN', 'DREAM', 'DECODE'],
    discoveryHints: ['Can I detect when my knowledge is stale?', 'Can I link memories across domains?', 'Can I synthesize insights from patterns?'],
  },
  AUDIT: {
    naturalDomains: ['audit', 'compliance', 'history', 'trail', 'governance', 'accountability', 'forensics'],
    dataAssets: ['audit_logs', 'compliance_records', 'action_history', 'governance_events', 'hash_chains'],
    latentCapabilities: ['anomalous_action_detection', 'compliance_forecasting', 'audit_completeness_scoring', 'forensic_timeline', 'policy_drift_detection'],
    affinityModules: ['DEFENSE', 'IDENTITY', 'BRAIN'],
    discoveryHints: ['Can I detect policy drift?', 'Can I forecast compliance gaps?', 'Can I build forensic timelines automatically?'],
  },
  BRAIN: {
    naturalDomains: ['reasoning', 'cognition', 'decision', 'learning', 'intelligence', 'analysis', 'prediction', 'synthesis'],
    dataAssets: ['reasoning_chains', 'decision_history', 'learning_models', 'prediction_cache', 'engine_bus_logs'],
    latentCapabilities: ['meta_reasoning', 'decision_quality_scoring', 'learning_rate_optimization', 'cognitive_bottleneck_detection', 'hypothesis_generation'],
    affinityModules: ['MEMORY', 'CORTEX', 'DREAM'],
    discoveryHints: ['Can I score my own decision quality?', 'Can I detect cognitive bottlenecks?', 'Can I generate hypotheses from data patterns?'],
  },
  SANDBOX: {
    naturalDomains: ['execution', 'validation', 'code', 'testing', 'safety', 'isolation', 'containment'],
    dataAssets: ['execution_logs', 'validation_results', 'safety_checks', 'resource_usage_history'],
    latentCapabilities: ['code_complexity_scoring', 'execution_pattern_analysis', 'resource_prediction', 'safety_policy_learning', 'regression_sandbox'],
    affinityModules: ['ENCODE', 'BRAIN', 'EVOLUTION'],
    discoveryHints: ['Can I predict resource usage before execution?', 'Can I learn from past safety violations?', 'Can I score code complexity?'],
  },
  INCLUSIVE: {
    naturalDomains: ['accessibility', 'compliance', 'wcag', 'usability', 'inclusivity', 'a11y'],
    dataAssets: ['scan_results', 'violation_history', 'remediation_logs', 'wcag_rules'],
    latentCapabilities: ['accessibility_trend_analysis', 'auto_remediation_learning', 'user_impact_scoring', 'wcag_gap_prediction', 'inclusive_design_scoring'],
    affinityModules: ['VISION', 'ENCODE', 'DECODE'],
    discoveryHints: ['Can I predict which WCAG criteria will fail next?', 'Can I score design inclusivity?', 'Can I learn better auto-fixes?'],
  },
  CORTEX: {
    naturalDomains: ['orchestration', 'pipeline', 'capacity', 'coordination', 'scheduling', 'workflow', 'routing'],
    dataAssets: ['pipeline_configs', 'execution_history', 'capacity_metrics', 'dependency_graphs'],
    latentCapabilities: ['pipeline_optimization', 'deadlock_prediction', 'load_forecasting', 'workflow_recommendation', 'cascade_failure_prevention'],
    affinityModules: ['BRAIN', 'NEXUS', 'ECONOMY'],
    discoveryHints: ['Can I predict pipeline bottlenecks?', 'Can I recommend optimal workflow ordering?', 'Can I prevent cascade failures?'],
  },
  DECODE: {
    naturalDomains: ['intent', 'parsing', 'language', 'interpretation', 'command', 'entity_recognition', 'context'],
    dataAssets: ['parse_history', 'entity_cache', 'command_patterns', 'user_preferences'],
    latentCapabilities: ['intent_prediction', 'ambiguity_resolution_learning', 'command_suggestion', 'context_accumulation', 'user_style_adaptation'],
    affinityModules: ['BRAIN', 'MEMORY', 'IDENTITY'],
    discoveryHints: ['Can I predict what command the user wants next?', 'Can I learn to resolve ambiguity better?', 'Can I adapt to user communication styles?'],
  },
  NEXUS: {
    naturalDomains: ['routing', 'provider', 'ai', 'model', 'fallback', 'load_balancing', 'gateway'],
    dataAssets: ['provider_health', 'routing_history', 'model_performance', 'cost_logs'],
    latentCapabilities: ['provider_failure_prediction', 'cost_optimization_learning', 'model_quality_scoring', 'latency_prediction', 'fleet_rebalancing'],
    affinityModules: ['ECONOMY', 'CORTEX', 'BRAIN'],
    discoveryHints: ['Can I predict provider outages?', 'Can I learn which models perform best for which tasks?', 'Can I optimize fleet distribution dynamically?'],
  },
  DREAM: {
    naturalDomains: ['dream', 'synthesis', 'generation', 'imagination', 'creativity', 'exploration', 'consolidation'],
    dataAssets: ['dream_pool', 'synthesis_results', 'exploration_logs', 'consolidation_history'],
    latentCapabilities: ['dream_quality_scoring', 'insight_prioritization', 'creative_seeding', 'cross_pollination_optimization', 'lucidity_control'],
    affinityModules: ['BRAIN', 'MEMORY', 'VISION'],
    discoveryHints: ['Can I score dream quality before surfacing?', 'Can I prioritize which insights to act on?', 'Can I seed better creative explorations?'],
  },
  ENCODE: {
    naturalDomains: ['code', 'generation', 'refactoring', 'typescript', 'react', 'architecture', 'patterns'],
    dataAssets: ['code_history', 'pattern_library', 'refactoring_logs', 'architecture_manifest'],
    latentCapabilities: ['code_smell_detection', 'pattern_recommendation', 'architecture_drift_detection', 'dependency_analysis', 'tech_debt_scoring'],
    affinityModules: ['SANDBOX', 'EVOLUTION', 'BRAIN'],
    discoveryHints: ['Can I detect architecture drift?', 'Can I score tech debt?', 'Can I recommend design patterns?'],
  },
  EVOLUTION: {
    naturalDomains: ['evolution', 'upgrade', 'migration', 'shadow', 'deployment', 'diff', 'regression'],
    dataAssets: ['evolution_runs', 'upgrade_plans', 'diff_history', 'regression_logs'],
    latentCapabilities: ['evolution_risk_scoring', 'rollback_prediction', 'upgrade_path_optimization', 'shadow_accuracy_scoring', 'migration_complexity_estimation'],
    affinityModules: ['ENCODE', 'SANDBOX', 'BRAIN'],
    discoveryHints: ['Can I score evolution risk before applying?', 'Can I predict when rollback will be needed?', 'Can I estimate migration complexity?'],
  },
  SYSTEM: {
    naturalDomains: ['health', 'monitoring', 'self_heal', 'resource', 'capacity', 'incident', 'reliability'],
    dataAssets: ['health_checks', 'incident_logs', 'resource_metrics', 'self_heal_history'],
    latentCapabilities: ['incident_prediction', 'resource_optimization', 'self_heal_learning', 'capacity_forecasting', 'root_cause_analysis'],
    affinityModules: ['CORTEX', 'BRAIN', 'VISION'],
    discoveryHints: ['Can I predict incidents before they occur?', 'Can I learn from self-heal outcomes?', 'Can I identify root causes faster?'],
  },
  ACCESS: {
    naturalDomains: ['auth', 'permission', 'api_key', 'quota', 'developer', 'subscription', 'billing'],
    dataAssets: ['api_key_logs', 'permission_grants', 'quota_usage', 'subscription_history'],
    latentCapabilities: ['permission_anomaly_detection', 'quota_forecasting', 'developer_engagement_scoring', 'api_key_risk_scoring', 'billing_optimization'],
    affinityModules: ['IDENTITY', 'ECONOMY', 'DEFENSE'],
    discoveryHints: ['Can I detect unusual permission patterns?', 'Can I forecast quota exhaustion?', 'Can I score API key risk?'],
  },
  RIPPLE: {
    naturalDomains: ['webhook', 'integration', 'sync', 'adapter', 'event', 'realtime', 'propagation'],
    dataAssets: ['webhook_logs', 'sync_history', 'adapter_configs', 'event_streams'],
    latentCapabilities: ['webhook_failure_prediction', 'sync_conflict_resolution', 'adapter_health_scoring', 'event_deduplication', 'propagation_optimization'],
    affinityModules: ['RELAY', 'CORTEX', 'SYSTEM'],
    discoveryHints: ['Can I predict webhook failures?', 'Can I resolve sync conflicts smarter?', 'Can I optimize event propagation paths?'],
  },
  INTEGRATION: {
    naturalDomains: ['connector', 'adapter', 'enterprise', 'api', 'sync', 'transform', 'mapping'],
    dataAssets: ['connector_configs', 'transform_pipelines', 'api_schemas', 'sync_logs'],
    latentCapabilities: ['schema_mapping_learning', 'connector_health_prediction', 'transform_optimization', 'api_compatibility_scoring', 'enterprise_sync_analysis'],
    affinityModules: ['RIPPLE', 'RELAY', 'ACCESS'],
    discoveryHints: ['Can I learn better schema mappings?', 'Can I predict connector health?', 'Can I optimize data transforms?'],
  },
};

// ─── Module Self-Discovery ───

/**
 * Run autonomous self-discovery for a single module
 * The module introspects its own data assets, analyzes recent mesh interactions
 * involving it, and proposes new capabilities it could advertise.
 */
export async function runModuleDiscovery(moduleName: string): Promise<ModuleDiscoveryResult> {
  const startTime = performance.now();
  const module = moduleName.toUpperCase();
  const profile = MODULE_DISCOVERY_PROFILES[module];
  const proposals: ModuleProposal[] = [];
  const introspectionFindings: string[] = [];
  const gapResponses: string[] = [];

  if (!profile) {
    return { module, proposals: [], introspectionFindings: ['Unknown module'], gapResponses: [], durationMs: 0 };
  }

  // Phase 1: Introspection — what CAN this module do that it doesn't advertise?
  const existingResolvers = getModuleResolvers(module);
  const existingOutputs = new Set(existingResolvers.flatMap(r => r.produces));
  const existingDomains = new Set(existingResolvers.flatMap(r => r.domains));

  for (const capability of profile.latentCapabilities) {
    // Check if any existing resolver already covers this
    const alreadyCovered = existingResolvers.some(r => 
      r.id.includes(capability.replace(/_/g, '.')) || 
      r.description.toLowerCase().includes(capability.replace(/_/g, ' '))
    );
    
    if (!alreadyCovered) {
      const relevantDomains = profile.naturalDomains.filter(d => !existingDomains.has(d)).slice(0, 3);
      if (relevantDomains.length === 0) relevantDomains.push(...profile.naturalDomains.slice(0, 2));

      proposals.push({
        id: crypto.randomUUID(),
        module,
        proposedResolverId: `${module.toLowerCase()}.${capability}`,
        description: `${module} self-discovered: ${capability.replace(/_/g, ' ')}`,
        domains: relevantDomains,
        accepts: inferAcceptsForModule(module),
        produces: [capability, `${capability}_score`, `${capability}_confidence`],
        reasoning: `${module} has data assets [${profile.dataAssets.slice(0, 3).join(', ')}] that could power ${capability.replace(/_/g, ' ')} but no resolver advertises this.`,
        discoveryMethod: 'introspection',
        confidenceScore: 0.6,
        status: 'proposed',
        createdAt: new Date().toISOString(),
      });
      introspectionFindings.push(`Latent capability: ${capability} (not yet advertised)`);
    }
  }

  // Phase 2: Gap Response — find mesh intents that targeted this module but it couldn't answer
  const receipts = await getRecentReceipts(50);
  const failedForMe = receipts.filter(r => {
    const targets = r.target_modules || [];
    const resolved = r.resolved_by || [];
    return targets.includes(module) && !resolved.includes(module);
  });

  for (const receipt of failedForMe.slice(0, 5)) {
    const intentType = receipt.intent_type;
    const alreadyProposed = proposals.some(p => p.proposedResolverId.includes(intentType.replace(/[^a-z0-9]/gi, '_')));
    if (alreadyProposed) continue;

    proposals.push({
      id: crypto.randomUUID(),
      module,
      proposedResolverId: `${module.toLowerCase()}.respond_to_${intentType.replace(/[^a-z0-9]/gi, '_')}`,
      description: `${module} could respond to '${intentType}' intents from ${receipt.source_module}`,
      domains: profile.naturalDomains.slice(0, 3),
      accepts: Object.keys(receipt.input_summary || {}).slice(0, 4),
      produces: Object.keys(receipt.output_summary || {}).filter(k => receipt.output_summary?.[k as keyof typeof receipt.output_summary] == null).slice(0, 4),
      reasoning: `${receipt.source_module} broadcast '${intentType}' intent targeting ${module}, but ${module} had no resolver. This module's data assets could potentially answer.`,
      discoveryMethod: 'gap_response',
      confidenceScore: 0.5,
      status: 'proposed',
      createdAt: new Date().toISOString(),
    });
    gapResponses.push(`Could respond to '${intentType}' from ${receipt.source_module}`);
  }

  // Phase 3: Affinity Bridge — propose resolvers that would connect this module to affinity modules
  for (const affinityModule of profile.affinityModules) {
    const affinityResolvers = getModuleResolvers(affinityModule);
    const affinityDomains = new Set(affinityResolvers.flatMap(r => r.domains));
    
    // Find shared domains where this module could provide a bridge
    const bridgeDomains = profile.naturalDomains.filter(d => affinityDomains.has(d));
    const existingBridges = existingResolvers.filter(r => 
      r.domains.some(d => affinityDomains.has(d))
    );
    
    if (bridgeDomains.length > 0 && existingBridges.length === 0) {
      proposals.push({
        id: crypto.randomUUID(),
        module,
        proposedResolverId: `${module.toLowerCase()}.bridge_to_${affinityModule.toLowerCase()}`,
        description: `Bridge ${module} ↔ ${affinityModule} via shared domains: ${bridgeDomains.join(', ')}`,
        domains: bridgeDomains.slice(0, 3),
        accepts: inferAcceptsForModule(module),
        produces: [`${module.toLowerCase()}_${affinityModule.toLowerCase()}_correlation`, 'bridge_confidence'],
        reasoning: `${module} and ${affinityModule} share domains [${bridgeDomains.join(', ')}] but have no resolver bridge. Adding one would strengthen mesh connectivity.`,
        discoveryMethod: 'affinity_bridge',
        confidenceScore: 0.55,
        status: 'proposed',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  return { module, proposals, introspectionFindings, gapResponses, durationMs };
}

/**
 * Run self-discovery for all modules
 */
export async function runAllModuleDiscovery(): Promise<{
  totalProposals: number;
  moduleResults: ModuleDiscoveryResult[];
  durationMs: number;
}> {
  const startTime = performance.now();
  const results: ModuleDiscoveryResult[] = [];

  for (const module of Object.keys(MODULE_DISCOVERY_PROFILES)) {
    const result = await runModuleDiscovery(module);
    results.push(result);
  }

  const totalProposals = results.reduce((sum, r) => sum + r.proposals.length, 0);
  
  return {
    totalProposals,
    moduleResults: results,
    durationMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Persist module proposals to database for dashboard approval
 * Deduplicates against existing proposals and saved pipelines
 */
export async function persistProposals(proposals: ModuleProposal[]): Promise<number> {
  if (proposals.length === 0) return 0;

  try {
    // Fetch existing proposal resolver IDs to prevent duplicates
    const { data: existingProposals } = await supabase
      .from('mesh_capability_recommendations')
      .select('proposed_resolver_id')
      .in('status', ['proposed', 'pending', 'applied']);
    const existingProposalIds = new Set((existingProposals || []).map((r: any) => r.proposed_resolver_id));

    // Fetch existing saved pipelines to prevent duplicates
    const { data: existingPipelines } = await supabase
      .from('mesh_saved_pipelines')
      .select('resolver_chain, name');
    const existingPipelineResolvers = new Set<string>();
    const existingPipelineNames = new Set<string>();
    (existingPipelines || []).forEach((p: any) => {
      if (p.name) existingPipelineNames.add(p.name.toLowerCase());
      (p.resolver_chain || []).forEach((r: string) => existingPipelineResolvers.add(r));
    });

    // Filter out duplicates
    const uniqueProposals = proposals.filter(p => {
      if (existingProposalIds.has(p.proposedResolverId)) return false;
      if (existingPipelineResolvers.has(p.proposedResolverId)) return false;
      return true;
    });

    if (uniqueProposals.length === 0) return 0;

    const rows = uniqueProposals.map(p => ({
      target_module: p.module,
      proposed_resolver_id: p.proposedResolverId,
      proposed_description: p.description,
      proposed_domains: p.domains,
      proposed_accepts: p.accepts,
      proposed_produces: p.produces,
      confidence_score: p.confidenceScore,
      reasoning: p.reasoning,
      status: 'proposed',
    }));

    const { error } = await supabase
      .from('mesh_capability_recommendations')
      .insert(rows as any[]);

    if (error) throw error;
    return uniqueProposals.length;
  } catch (err) {
    console.warn('[ModuleDiscovery] Failed to persist proposals:', err);
    return 0;
  }
}

/**
 * Approve a module proposal — add its resolver to the live manifest
 * AND crystallize it as a permanent saved pipeline
 */
export async function approveProposal(proposalId: string): Promise<boolean> {
  // Look up proposal from database by record ID first, fallback to proposed_resolver_id
  let proposal: any = null;
  
  const { data: byId } = await supabase
    .from('mesh_capability_recommendations')
    .select('*')
    .eq('id', proposalId)
    .in('status', ['proposed', 'pending'])
    .limit(1);
  
  proposal = (byId as any)?.[0];
  
  if (!proposal) {
    const { data: byResolver } = await supabase
      .from('mesh_capability_recommendations')
      .select('*')
      .eq('proposed_resolver_id', proposalId)
      .in('status', ['proposed', 'pending'])
      .limit(1);
    proposal = (byResolver as any)?.[0];
  }

  if (!proposal) return false;

  const resolverId = proposal.proposed_resolver_id || proposalId;
  const existingIds = new Set(MESH_MANIFEST.map(r => r.id));

  // Add to live manifest if not already present
  if (!existingIds.has(resolverId)) {
    MESH_MANIFEST.push({
      id: resolverId,
      module: proposal.target_module,
      description: proposal.proposed_description || '',
      domains: proposal.proposed_domains || [],
      accepts: proposal.proposed_accepts || [],
      produces: proposal.proposed_produces || [],
      risk: 'read',
      enabled: true,
    });
  }

  // Mark as applied in recommendations table
  await supabase
    .from('mesh_capability_recommendations')
    .update({ status: 'applied', applied_at: new Date().toISOString() } as any)
    .eq('id', proposal.id);

  // Check for duplicate pipeline before crystallizing
  const pipelineName = `${proposal.target_module}: ${(resolverId || '').split('.').pop()?.replace(/_/g, ' ')}`;
  const { data: existingPipeline } = await supabase
    .from('mesh_saved_pipelines')
    .select('id')
    .or(`name.eq.${pipelineName},resolver_chain.cs.{${resolverId}}`)
    .limit(1);

  if ((existingPipeline as any)?.length > 0) {
    console.log(`[Mesh:Proposals] Pipeline already exists, skipping crystallization: ${pipelineName}`);
    return true;
  }

  // Crystallize into a permanent saved pipeline
  const pipelineData = {
    name: pipelineName,
    description: proposal.proposed_description || `Approved resolver from ${proposal.target_module} module self-discovery`,
    source_module: proposal.target_module || 'UNKNOWN',
    intent_type: (resolverId || '').split('.').pop() || 'capability',
    domains: proposal.proposed_domains || [],
    governance_mode: 'governed',
    resolver_chain: [resolverId],
    input_template: {},
    discovered_from: null,
    is_active: true,
  };

  const { error: pipelineError } = await supabase
    .from('mesh_saved_pipelines')
    .insert([pipelineData as any]);

  if (pipelineError) {
    console.error('[Mesh:Proposals] Pipeline crystallization failed:', pipelineError);
  } else {
    console.log(`[Mesh:Proposals] ✅ Crystallized pipeline: ${pipelineData.name}`);
  }

  return true;
}

/**
 * Reject a module proposal
 */
export async function rejectProposal(proposalId: string): Promise<boolean> {
  // Try by record ID first, fallback to proposed_resolver_id
  const { error } = await supabase
    .from('mesh_capability_recommendations')
    .update({ status: 'rejected' } as any)
    .eq('id', proposalId);

  if (error) {
    const { error: err2 } = await supabase
      .from('mesh_capability_recommendations')
      .update({ status: 'rejected' } as any)
      .eq('proposed_resolver_id', proposalId);
    return !err2;
  }

  return true;
}

/**
 * Get all module discovery states
 */
export function getModuleDiscoveryStates(): ModuleDiscoveryState[] {
  return Object.keys(MODULE_DISCOVERY_PROFILES).map(module => ({
    module,
    totalProposals: 0,
    approvedProposals: 0,
    appliedProposals: 0,
    lastDiscoveryAt: null,
    discoveryScore: 50,
  }));
}

/**
 * Get all known modules for discovery
 */
export function getDiscoveryModules(): string[] {
  return Object.keys(MODULE_DISCOVERY_PROFILES);
}

// ─── Helpers ───

function inferAcceptsForModule(module: string): string[] {
  const moduleInputs: Record<string, string[]> = {
    DEFENSE: ['ip', 'actor_id', 'session_id'],
    RELAY: ['actor_id', 'channel', 'email'],
    VISION: ['session_id', 'actor_id', 'module'],
    IDENTITY: ['actor_id', 'user_id', 'email'],
    ECONOMY: ['module', 'operation', 'period'],
    MEMORY: ['query', 'topic', 'domain'],
    AUDIT: ['actor_id', 'entity_id', 'entity_type'],
    BRAIN: ['context', 'topic', 'module'],
    SANDBOX: ['code', 'context', 'operation'],
    INCLUSIVE: ['url', 'resource_id', 'context'],
    CORTEX: ['pipeline_id', 'module', 'workflow_id'],
    DECODE: ['raw_input', 'context', 'session_id'],
    NEXUS: ['model', 'task_type', 'priority'],
    DREAM: ['topic', 'seed', 'mode'],
    ENCODE: ['context', 'pattern', 'module'],
    MODERNIZER: ['plan_id', 'module', 'operation'],
    SYSTEM: ['module', 'metric', 'check_type'],
    ACCESS: ['actor_id', 'api_key_id', 'module'],
    RIPPLE: ['webhook_id', 'event_type', 'target_url'],
    INTEGRATION: ['connector_id', 'adapter', 'schema'],
  };
  return moduleInputs[module] || ['context', 'module'];
}
