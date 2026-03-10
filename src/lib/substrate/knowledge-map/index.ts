/**
 * Knowledge Graph Engine — v1.0.0
 * Maps knowledge flow, expertise gaps, and module interconnections.
 * Provides computed views of how knowledge moves through the substrate.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ModuleName =
  | 'core' | 'ripple' | 'access'
  | 'brain' | 'decode' | 'dream'
  | 'defense' | 'nexus' | 'vision' | 'encode'
  | 'system' | 'evolution' | 'integration' | 'inclusive'
  | 'cortex' | 'atlas'
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox';

export interface KnowledgeNode {
  module: ModuleName;
  total_patterns: number;
  hot_patterns: number;
  avg_priority: number;
  expertise_score: number; // 0-100
  coverage_pct: number;   // How much of its domain is covered
  gaps: string[];
  strengths: string[];
}

export interface KnowledgeEdge {
  from: ModuleName;
  to: ModuleName;
  patterns_shared: number;
  flow_strength: number; // 0-1
  last_transfer: string | null;
}

export interface ExpertiseGap {
  module: ModuleName;
  domain: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  suggested_sources: ModuleName[];
}

export interface KnowledgeMap {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  gaps: ExpertiseGap[];
  overall_coverage: number;
  strongest_module: ModuleName;
  weakest_module: ModuleName;
  generated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN EXPECTATIONS (what each module should know)
// ═══════════════════════════════════════════════════════════════

const EXPECTED_DOMAINS: Record<ModuleName, string[]> = {
  // Kernel
  core:        ['memory', 'storage', 'persistence', 'cache', 'optimization'],
  ripple:      ['events', 'propagation', 'pub-sub', 'streaming', 'ordering'],
  access:      ['auth', 'permissions', 'api-keys', 'quotas', 'rbac'],
  // Cognitive
  brain:       ['recall', 'learning', 'consolidation', 'tiering', 'search'],
  decode:      ['conversation', 'personality', 'formatting', 'context'],
  dream:       ['synthesis', 'creativity', 'association', 'novelty'],
  // Operational
  defense:     ['security', 'threats', 'rate-limiting', 'anomaly'],
  nexus:       ['routing', 'providers', 'fallback', 'cost', 'health'],
  vision:      ['observability', 'metrics', 'tracing', 'alerting'],
  encode:      ['codegen', 'filesystem', 'structural-awareness', 'scoring'],
  // Administrative
  system:      ['health', 'governance', 'configuration', 'audit'],
  modernizer:  ['evolution', 'upgrades', 'diffs', 'rollback'],
  integration: ['webhooks', 'transforms', 'connectors', 'schemas'],
  inclusive:   ['accessibility', 'wcag', 'aria', 'focus-management'],
  // Orchestrator
  cortex:      ['architecture', 'proposals', 'orchestration', 'design'],
  atlas:       ['topology', 'capability-mapping', 'gap-analysis', 'discovery'],
  // Infrastructure
  memory:      ['vector-recall', 'rag', 'tiering', 'embeddings'],
  relay:       ['outbound-routing', 'channel-selection', 'delivery'],
  audit:       ['compliance', 'immutable-logging', 'retention', 'soc2'],
  identity:    ['actor-attribution', 'webauthn', 'device-trust', 'sessions'],
  economy:     ['cost-tracking', 'budgets', 'forecasting', 'roi', 'consensus-pricing', 'pricing-governance', 'pricing-anomaly-detection'],
  sandbox:     ['code-execution', 'isolation', 'safety', 'rollback'],
};

// ═══════════════════════════════════════════════════════════════
// MAP BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the complete knowledge map of the substrate
 */
export async function buildKnowledgeMap(): Promise<KnowledgeMap> {
  const modules: ModuleName[] = Object.keys(EXPECTED_DOMAINS) as ModuleName[];
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const gaps: ExpertiseGap[] = [];

  // Build nodes: check each module's knowledge coverage
  for (const module of modules) {
    const node = await analyzeModuleKnowledge(module);
    nodes.push(node);
    gaps.push(...node.gaps.map(g => ({
      module,
      domain: g,
      severity: 'moderate' as const,
      description: `${module} lacks expertise in: ${g}`,
      suggested_sources: findKnowledgeSources(g, modules, module),
    })));
  }

  // Build edges: check transfer activity between modules
  for (const from of modules) {
    for (const to of modules) {
      if (from === to) continue;
      const edge = await checkTransferFlow(from, to);
      if (edge.patterns_shared > 0) {
        edges.push(edge);
      }
    }
  }

  // Compute overall metrics
  const overallCoverage = nodes.reduce((s, n) => s + n.coverage_pct, 0) / nodes.length;
  const sorted = [...nodes].sort((a, b) => b.expertise_score - a.expertise_score);

  const map: KnowledgeMap = {
    nodes,
    edges,
    gaps: gaps.filter(g => g.severity !== 'minor'), // Only significant gaps
    overall_coverage: overallCoverage,
    strongest_module: sorted[0]?.module || 'brain',
    weakest_module: sorted[sorted.length - 1]?.module || 'core',
    generated_at: new Date().toISOString(),
  };

  // Persist map snapshot
  await supabase.from('brain_events').insert({
    module: 'system',
    event_type: 'knowledge_map_generated',
    data: {
      overall_coverage: overallCoverage,
      strongest: map.strongest_module,
      weakest: map.weakest_module,
      total_gaps: gaps.length,
      total_edges: edges.length,
    } as any,
    outcome: 'success',
  });

  return map;
}

/**
 * Analyze a single module's knowledge coverage
 */
async function analyzeModuleKnowledge(module: ModuleName): Promise<KnowledgeNode> {
  const expected = EXPECTED_DOMAINS[module] || [];

  // Check hot memory patterns for this module
  const { data: hotPatterns } = await supabase
    .from('brain_memory_hot')
    .select('content, priority, context')
    .ilike('context', `%${module}%`)
    .limit(200);

  // Check general brain_memories
  const { data: allPatterns } = await supabase
    .from('brain_memories')
    .select('content, confidence')
    .or(expected.map(d => `content.ilike.%${d}%`).join(','))
    .limit(100);

  const hot = hotPatterns || [];
  const all = allPatterns || [];

  // Calculate coverage: what % of expected domains have patterns
  const coveredDomains = expected.filter(domain => {
    const domainLower = domain.toLowerCase();
    return hot.some(p => p.content?.toLowerCase().includes(domainLower))
      || all.some(p => p.content?.toLowerCase().includes(domainLower));
  });

  const uncovered = expected.filter(d => !coveredDomains.includes(d));
  const coveragePct = expected.length > 0
    ? (coveredDomains.length / expected.length) * 100
    : 0;

  const avgPriority = hot.length > 0
    ? hot.reduce((s, p) => s + (p.priority || 5), 0) / hot.length
    : 0;

  // Expertise score: combo of coverage + pattern count + priority
  const expertiseScore = Math.min(100, Math.round(
    coveragePct * 0.5 + Math.min(50, hot.length) * 0.3 + avgPriority * 2
  ));

  return {
    module,
    total_patterns: all.length,
    hot_patterns: hot.length,
    avg_priority: Math.round(avgPriority * 10) / 10,
    expertise_score: expertiseScore,
    coverage_pct: Math.round(coveragePct),
    gaps: uncovered,
    strengths: coveredDomains,
  };
}

/**
 * Check knowledge transfer flow between two modules
 */
async function checkTransferFlow(from: ModuleName, to: ModuleName): Promise<KnowledgeEdge> {
  const { data: transfers } = await supabase
    .from('brain_events')
    .select('created_at')
    .eq('module', 'brain')
    .eq('event_type', 'transfer_feedback')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    .limit(50);

  // Simplified: count events as proxy for flow
  const count = transfers?.length || 0;

  return {
    from,
    to,
    patterns_shared: count,
    flow_strength: Math.min(1, count / 20), // Normalize: 20+ = max strength
    last_transfer: transfers?.[0]?.created_at || null,
  };
}

/**
 * Find which modules could provide knowledge for a given domain
 */
function findKnowledgeSources(
  domain: string,
  allModules: ModuleName[],
  exclude: ModuleName
): ModuleName[] {
  return allModules.filter(m => {
    if (m === exclude) return false;
    const domains = EXPECTED_DOMAINS[m] || [];
    return domains.some(d => d.includes(domain) || domain.includes(d));
  });
}

/**
 * Get a quick expertise summary without building the full map
 */
export async function getExpertiseSummary(): Promise<Array<{
  module: ModuleName;
  score: number;
  hot_count: number;
  gap_count: number;
}>> {
  const modules = Object.keys(EXPECTED_DOMAINS) as ModuleName[];
  const results: Array<{ module: ModuleName; score: number; hot_count: number; gap_count: number }> = [];

  for (const module of modules) {
    const { count: hotCount } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true })
      .ilike('context', `%${module}%`);

    const expected = EXPECTED_DOMAINS[module];
    const gapCount = Math.max(0, expected.length - Math.floor((hotCount || 0) / 3));
    const score = Math.min(100, Math.round(((hotCount || 0) / expected.length) * 20));

    results.push({ module, score, hot_count: hotCount || 0, gap_count: gapCount });
  }

  return results.sort((a, b) => b.score - a.score);
}
