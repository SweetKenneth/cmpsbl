/**
 * Live Gap Execution Engine
 * Run discovery against real DB data, surface unresolved intents,
 * and auto-propose new resolvers to fill gaps
 * 
 * Unlike structural gap analysis (which compares manifest vs domain knowledge),
 * this engine queries actual mesh_intents receipts to find:
 * 1. Intents that consistently fail or partially resolve
 * 2. Domains that get traffic but have no resolvers
 * 3. Modules that are frequently targeted but never respond
 * 4. Auto-generated resolver proposals based on failure patterns
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getModuleResolvers } from './manifest';
import type { MeshReceipt, MeshResolver } from './types';

// ─── Types ───

export interface LiveGap {
  intentType: string;
  sourceModule: string;
  failureCount: number;
  partialCount: number;
  successCount: number;
  failureRate: number;
  avgDurationMs: number;
  missingModules: string[];
  unrespondingResolvers: string[];
  lastOccurred: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoProposal: ResolverProposal | null;
}

export interface ResolverProposal {
  resolverId: string;
  module: string;
  description: string;
  domains: string[];
  accepts: string[];
  produces: string[];
  confidence: number;
  reasoning: string;
}

export interface LiveGapReport {
  totalIntentsAnalyzed: number;
  uniqueIntentTypes: number;
  gapsFound: number;
  criticalGaps: number;
  proposalsGenerated: number;
  gaps: LiveGap[];
  domainCoverage: Array<{ domain: string; resolverCount: number; trafficCount: number; gap: boolean }>;
  moduleResponseRates: Array<{ module: string; targeted: number; responded: number; rate: number }>;
  durationMs: number;
  runAt: string;
}

// ─── Live Execution ───

/**
 * Run live gap execution against real DB receipt data
 */
export async function runLiveGapExecution(): Promise<LiveGapReport> {
  const startTime = performance.now();

  // Fetch recent receipts from DB
  const { data: receipts } = await supabase
    .from('mesh_intents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  const rows = (receipts || []) as any[];

  if (rows.length === 0) {
    return {
      totalIntentsAnalyzed: 0, uniqueIntentTypes: 0, gapsFound: 0,
      criticalGaps: 0, proposalsGenerated: 0, gaps: [],
      domainCoverage: buildDomainCoverage([]),
      moduleResponseRates: [],
      durationMs: Math.round(performance.now() - startTime),
      runAt: new Date().toISOString(),
    };
  }

  // 1. Group by intent_type + source_module
  const intentGroups = new Map<string, any[]>();
  for (const row of rows) {
    const key = `${row.source_module}:${row.intent_type}`;
    if (!intentGroups.has(key)) intentGroups.set(key, []);
    intentGroups.get(key)!.push(row);
  }

  // 2. Analyze each group for failure patterns
  const gaps: LiveGap[] = [];

  for (const [key, group] of intentGroups) {
    const [sourceModule, intentType] = key.split(':');
    const failures = group.filter((r: any) => !r.success);
    const partials = group.filter((r: any) => {
      const resolved = (r.resolved_by as string[]) || [];
      const targeted = (r.target_modules as string[]) || [];
      return r.success && resolved.length < targeted.length;
    });
    const successes = group.filter((r: any) => r.success);
    const failureRate = (failures.length + partials.length * 0.5) / group.length;

    if (failureRate < 0.2 && partials.length < 2) continue; // Skip healthy intents

    // Identify which modules were targeted but didn't respond
    const allTargeted = new Set<string>();
    const allResolved = new Set<string>();
    for (const r of group) {
      for (const t of (r.target_modules as string[]) || []) allTargeted.add(t);
      for (const t of (r.resolved_by as string[]) || []) allResolved.add(t);
    }
    const missingModules = [...allTargeted].filter(m => !allResolved.has(m));

    const avgDuration = group.reduce((s: number, r: any) => s + (r.duration_ms || 0), 0) / group.length;
    const lastOccurred = group[0]?.created_at || new Date().toISOString();

    const severity: LiveGap['severity'] =
      failureRate >= 0.8 ? 'critical' :
      failureRate >= 0.5 ? 'high' :
      failureRate >= 0.3 ? 'medium' : 'low';

    // Auto-propose a resolver if we can identify what's missing
    const proposal = generateAutoProposal(intentType, sourceModule, missingModules, group);

    gaps.push({
      intentType,
      sourceModule,
      failureCount: failures.length,
      partialCount: partials.length,
      successCount: successes.length,
      failureRate: Math.round(failureRate * 100) / 100,
      avgDurationMs: Math.round(avgDuration),
      missingModules,
      unrespondingResolvers: findUnrespondingResolvers(intentType, missingModules),
      lastOccurred,
      severity,
      autoProposal: proposal,
    });
  }

  // 3. Module response rates
  const moduleStats = new Map<string, { targeted: number; responded: number }>();
  for (const row of rows) {
    for (const t of (row.target_modules as string[]) || []) {
      if (!moduleStats.has(t)) moduleStats.set(t, { targeted: 0, responded: 0 });
      moduleStats.get(t)!.targeted++;
    }
    for (const r of (row.resolved_by as string[]) || []) {
      if (!moduleStats.has(r)) moduleStats.set(r, { targeted: 0, responded: 0 });
      moduleStats.get(r)!.responded++;
    }
  }
  const moduleResponseRates = [...moduleStats.entries()]
    .map(([module, s]) => ({ module, ...s, rate: Math.round((s.responded / Math.max(1, s.targeted)) * 100) / 100 }))
    .sort((a, b) => a.rate - b.rate);

  // 4. Domain coverage
  const domainCoverage = buildDomainCoverage(rows);

  const sortedGaps = gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity] || b.failureCount - a.failureCount;
  });

  const report: LiveGapReport = {
    totalIntentsAnalyzed: rows.length,
    uniqueIntentTypes: intentGroups.size,
    gapsFound: sortedGaps.length,
    criticalGaps: sortedGaps.filter(g => g.severity === 'critical').length,
    proposalsGenerated: sortedGaps.filter(g => g.autoProposal).length,
    gaps: sortedGaps,
    domainCoverage,
    moduleResponseRates,
    durationMs: Math.round(performance.now() - startTime),
    runAt: new Date().toISOString(),
  };

  // Persist report
  await persistLiveGapReport(report);

  return report;
}

// ─── Helpers ───

function generateAutoProposal(
  intentType: string,
  sourceModule: string,
  missingModules: string[],
  receipts: any[],
): ResolverProposal | null {
  if (missingModules.length === 0) return null;

  const targetModule = missingModules[0];
  const existingResolvers = getModuleResolvers(targetModule);

  // Infer what outputs were expected from the intent's output_summary
  const expectedOutputs = new Set<string>();
  for (const r of receipts) {
    const summary = r.output_summary || {};
    for (const k of Object.keys(summary)) {
      if (!k.startsWith('_')) expectedOutputs.add(k);
    }
  }

  // Infer domains from intent type — Compound Signal Preservation
  const KNOWN_DOMAINS = ['security', 'identity', 'session', 'economy', 'memory', 'audit', 'behavior',
     'threat', 'trust', 'cost', 'analytics', 'pattern', 'context'];
  const intentParts = intentType.split('_');
  const possibleDomains: string[] = [];
  // Check compound intent first (e.g. 'threat_detection' as a domain)
  if (KNOWN_DOMAINS.some(d => intentType.includes(d))) {
    possibleDomains.push(intentType);
  }
  // Then add individual token matches
  possibleDomains.push(...intentParts.filter(p => KNOWN_DOMAINS.includes(p)));
  const uniqueDomains = [...new Set(possibleDomains)];

  if (uniqueDomains.length === 0 && expectedOutputs.size === 0) return null;

  const existingDomains = new Set(existingResolvers.flatMap(r => r.domains));
  const newDomains = uniqueDomains.filter(d => !existingDomains.has(d));
  const domains = newDomains.length > 0 ? newDomains : uniqueDomains;

  return {
    resolverId: `${targetModule.toLowerCase()}.${intentType.replace(/[^a-z0-9]/gi, '_')}_auto`,
    module: targetModule,
    description: `Auto-proposed: Respond to '${intentType}' intents from ${sourceModule}`,
    domains: domains.slice(0, 4),
    accepts: ['actor_id', 'context'],
    produces: [...expectedOutputs].slice(0, 5),
    confidence: Math.min(0.8, 0.4 + (receipts.length * 0.05)),
    reasoning: `${targetModule} was targeted ${receipts.length}x for '${intentType}' but never responded. ${missingModules.length} module(s) missing.`,
  };
}

function findUnrespondingResolvers(intentType: string, missingModules: string[]): string[] {
  const unresponding: string[] = [];
  for (const mod of missingModules) {
    const resolvers = getModuleResolvers(mod);
    for (const r of resolvers) {
      unresponding.push(r.id);
    }
  }
  return unresponding.slice(0, 10);
}

function buildDomainCoverage(receipts: any[]): LiveGapReport['domainCoverage'] {
  const domainResolverCount = new Map<string, number>();
  for (const r of MESH_MANIFEST) {
    for (const d of r.domains) {
      domainResolverCount.set(d, (domainResolverCount.get(d) || 0) + 1);
    }
  }

  // Count domain traffic from receipts
  const domainTraffic = new Map<string, number>();
  for (const row of receipts) {
    const targets = (row.target_modules as string[]) || [];
    // Approximate domains from target module resolvers
    for (const t of targets) {
      const resolvers = MESH_MANIFEST.filter(r => r.module === t);
      for (const r of resolvers) {
        for (const d of r.domains) {
          domainTraffic.set(d, (domainTraffic.get(d) || 0) + 1);
        }
      }
    }
  }

  const allDomains = new Set([...domainResolverCount.keys(), ...domainTraffic.keys()]);
  return [...allDomains].map(domain => ({
    domain,
    resolverCount: domainResolverCount.get(domain) || 0,
    trafficCount: domainTraffic.get(domain) || 0,
    gap: (domainTraffic.get(domain) || 0) > 0 && (domainResolverCount.get(domain) || 0) === 0,
  })).sort((a, b) => (b.trafficCount - a.trafficCount));
}

async function persistLiveGapReport(report: LiveGapReport): Promise<void> {
  try {
    await supabase.from('mesh_discovery_runs').insert([{
      run_type: 'live_gap_execution',
      gaps_found: report.gapsFound,
      recommendations_generated: report.proposalsGenerated,
      capabilities_expanded: 0,
      modules_analyzed: report.moduleResponseRates.length,
      duration_ms: report.durationMs,
      summary: {
        text: `Live gap execution: ${report.gapsFound} gaps (${report.criticalGaps} critical), ${report.proposalsGenerated} auto-proposals from ${report.totalIntentsAnalyzed} receipts`,
        critical_gaps: report.gaps.filter(g => g.severity === 'critical').map(g => ({
          intent: g.intentType, source: g.sourceModule, failureRate: g.failureRate,
        })),
        module_response_rates: report.moduleResponseRates.slice(0, 5),
      },
    } as any]);
  } catch { /* non-blocking */ }
}
