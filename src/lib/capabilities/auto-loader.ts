/**
 * Capability Auto-Loader
 * Filesystem Scanner for Drop-In Capabilities
 */

import type { 
  CapabilityMetadata, 
  EdgeFunctionAudit, 
  OverlapClassification,
  ScanAdaptResult 
} from './types';
import { registerCapability, deprecateCapability, listCapabilities } from './registry';

// Known substrate mappings (all 40 primitives)
const SUBSTRATE_MODULES: Record<string, string[]> = {
  // Kernel layer
  CORE: ['kernel', 'scheduler', 'lifecycle'],
  RIPPLE: ['message', 'bus', 'pub-sub', 'event', 'queue'],
  ACCESS: ['api-key', 'billing', 'metering', 'quota'],
  // Cognitive layer
  BRAIN: ['memory', 'learning', 'reflection', 'knowledge', 'synthesis', 'cognitive'],
  VISION: ['observability', 'metrics', 'monitoring', 'telemetry'],
  CORTEX: ['agency', 'proposal', 'evaluation', 'execution', 'autonomous'],
  // Operational layer
  EVOLUTION: ['upgrade', 'improvement', 'evolution', 'self-improve'],
  DECODE: ['chat', 'intent', 'generation', 'user-facing', 'interpreter'],
  DEFENSE: ['bot', 'threat', 'security', 'ip-reputation', 'rate-limit'],
  NEXUS: ['routing', 'ai-provider', 'text', 'image', 'video'],
  DREAM: ['dream-eater', 'metabolic', 'ingestion'],
  // Administrative layer
  INTEGRATION: ['adapter', 'enterprise', 'discovery'],
  INCLUSIVE: ['accessibility', 'wcag', 'a11y', 'scan'],
  SYSTEM: ['admin', 'diagnostic', 'resilience', 'status', 'health'],
  // Infrastructure layer
  MEMORY: ['vector', 'rag', 'semantic-recall', 'embedding'],
  RELAY: ['webhook', 'outbound', 'side-effect', 'delivery'],
  AUDIT: ['compliance', 'immutable-log', 'chain', 'ledger'],
  IDENTITY: ['actor', 'attribution', 'human-agent', 'fingerprint'],
  ECONOMY: ['cost', 'budget', 'marketplace', 'pricing'],
  SANDBOX: ['isolated', 'execution', 'speculative', 'safe-run'],
  // Orchestrator layer
  ENCODE: ['encode', 'transform', 'pipeline', 'orchestrate'],
};

// Edge functions that were FULLY migrated to substrate and DELETED
// History: pf-clarity-scan → INCLUSIVE.scan (deleted 2026-02-01)
// History: pf-defense-security-report → DEFENSE.security_report (deleted 2026-02-01)
// History: pf-ripple-image → was 402 stub (deleted 2026-01-28)
const FULL_OVERLAP_FUNCTIONS = [
  'pf-marketing-strategy',     // → Uses free-tier router, standalone OK
  'pf-modernizer-export',      // → EVOLUTION.export (has active usage - EvolutionJobStatus)
];

// Edge functions with partial overlap (DO NOT DELETE)
const PARTIAL_OVERLAP_FUNCTIONS = [
  'pf-brain-reflect',          // Logic split across BRAIN engines
  'pf-cascade-improvement-engine', // Shared with CORTEX
];

/**
 * Parse capability metadata from edge function comment
 */
export function parseCapabilityMetadata(source: string): CapabilityMetadata | null {
  const metadataRegex = /\/\*[\s\S]*?@capability\s+(\S+)[\s\S]*?@modules\s+([^\n]+)[\s\S]*?@risk\s+(low|medium|high)[\s\S]*?@reversible\s+(true|false)[\s\S]*?@description\s+([^\n]+)[\s\S]*?\*\//;
  
  const match = source.match(metadataRegex);
  if (!match) return null;
  
  return {
    name: match[1],
    modules: match[2].split(/[,\s]+/).filter(Boolean),
    risk: match[3] as 'low' | 'medium' | 'high',
    reversible: match[4] === 'true',
    description: match[5].trim(),
  };
}

/**
 * Classify overlap between edge function and substrate
 */
export function classifyOverlap(edgeFunctionName: string): OverlapClassification {
  if (FULL_OVERLAP_FUNCTIONS.includes(edgeFunctionName)) {
    return 'FULL';
  }
  if (PARTIAL_OVERLAP_FUNCTIONS.includes(edgeFunctionName)) {
    return 'PARTIAL';
  }
  return 'NONE';
}

/**
 * Detect which substrate modules an edge function maps to
 */
export function detectModuleMapping(edgeFunctionName: string): string[] {
  const modules: string[] = [];
  const nameLower = edgeFunctionName.toLowerCase();
  
  for (const [module, keywords] of Object.entries(SUBSTRATE_MODULES)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      modules.push(module);
    }
  }
  
  return modules;
}

/**
 * Audit a single edge function
 */
export function auditEdgeFunction(name: string, path: string, source?: string): EdgeFunctionAudit {
  const overlap = classifyOverlap(name);
  const modules = detectModuleMapping(name);
  const metadata = source ? parseCapabilityMetadata(source) : undefined;
  
  let reason = '';
  let deletionRecommended = false;
  
  switch (overlap) {
    case 'FULL':
      reason = `Logic fully migrated to substrate modules: ${modules.join(', ')}`;
      deletionRecommended = true;
      break;
    case 'PARTIAL':
      reason = `Logic split across substrate. Requires TODO markers for missing pieces.`;
      deletionRecommended = false;
      break;
    case 'NONE':
      reason = `Edge-only function. Can be adapted as drop-in capability.`;
      deletionRecommended = false;
      break;
  }
  
  return {
    name,
    path,
    mergedLocations: modules,
    overlap,
    deletionRecommended,
    reason,
    hasMetadata: !!metadata,
    metadata,
  };
}

/**
 * Auto-adapt safe candidates with valid metadata
 */
export function adaptCapability(audit: EdgeFunctionAudit): boolean {
  if (audit.overlap === 'FULL') {
    // Don't adapt, should be deleted
    return false;
  }
  
  if (!audit.hasMetadata || !audit.metadata) {
    console.warn(`[AutoLoader] Skipping ${audit.name}: missing metadata`);
    return false;
  }
  
  if (audit.metadata.risk === 'high') {
    console.warn(`[AutoLoader] Skipping ${audit.name}: high risk, requires manual review`);
    return false;
  }
  
  // Register the capability
  registerCapability(
    audit.name,
    audit.metadata,
    'edge-adapted',
    audit.path
  );
  
  return true;
}

/**
 * Run full scan and adapt cycle
 */
export function runScanAdapt(options: {
  dryRun?: boolean;
  confirm?: boolean;
  pruneUnused?: boolean;
  verbose?: boolean;
}): ScanAdaptResult {
  const { dryRun = true, confirm = false, pruneUnused = false, verbose = false } = options;
  
  const findings: EdgeFunctionAudit[] = [];
  const errors: string[] = [];
  let adaptedCount = 0;
  let deletedCount = 0;
  let blockedCount = 0;
  
  // Audit remaining edge functions (post v7.0.3 cleanup)
  const edgeFunctionsToAudit = [
    { name: 'pf-marketing-strategy', path: 'supabase/functions/pf-marketing-strategy/index.ts' },
    { name: 'pf-modernizer-export', path: 'supabase/functions/pf-modernizer-export/index.ts' },
    // DELETED 2026-02-01: pf-clarity-scan → INCLUSIVE.scan
    // DELETED 2026-02-01: pf-defense-security-report → DEFENSE.security_report
  ];
  
  for (const ef of edgeFunctionsToAudit) {
    try {
      const audit = auditEdgeFunction(ef.name, ef.path);
      findings.push(audit);
      
      if (verbose) {
        console.log(`[ScanAdapt] ${ef.name}: ${audit.overlap} - ${audit.reason}`);
      }
      
      if (!dryRun && confirm) {
        if (audit.deletionRecommended) {
          // Mark for deletion (actual deletion happens externally)
          deletedCount++;
        } else if (audit.hasMetadata) {
          if (adaptCapability(audit)) {
            adaptedCount++;
          } else {
            blockedCount++;
          }
        }
      }
    } catch (err) {
      errors.push(`Failed to audit ${ef.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }
  
  // Prune unused if requested
  if (pruneUnused && !dryRun) {
    const allCapabilities = listCapabilities();
    for (const cap of allCapabilities) {
      if (cap.invokeCount === 0 && cap.source === 'edge-adapted') {
        deprecateCapability(cap.id);
        if (verbose) {
          console.log(`[ScanAdapt] Deprecated unused: ${cap.id}`);
        }
      }
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : (pruneUnused ? 'prune-unused' : 'confirm'),
    findings,
    adaptedCount,
    deletedCount,
    blockedCount,
    errors,
  };
}
