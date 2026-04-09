/**
 * Phase A — Edge Function Introspection
 * Capability Auto-Adapt Integration
 * 
 * Scans deployed edge functions and cross-references against capability registry.
 * ⚠️ No source code exposed. Metadata only.
 */

import type { EdgeAnalysis, RepurposeCandidate, RiskFlag } from './types';
import { runScanAdapt, listCapabilities } from '@/lib/capabilities';

// ═══════════════════════════════════════════════════════════════
// ARCHIVED FUNCTION CATALOG
// ═══════════════════════════════════════════════════════════════

interface ArchivedFunction {
  name: string;
  deprecated_at: string;
  reason: string;
  replacement?: string;
  can_repurpose: boolean;
  deleted?: boolean;
}

// Known archived/deprecated functions (updated 2026-02-01)
const ARCHIVED_CATALOG: ArchivedFunction[] = [
  { name: 'pf-brain-reflect', deprecated_at: '2025-10', reason: 'Replaced by substrate brain module', can_repurpose: false },
  { name: 'pf-modernizer-v1', deprecated_at: '2025-11', reason: 'Replaced by evolution system', can_repurpose: true },
  { name: 'pf-decode-legacy', deprecated_at: '2025-10', reason: 'Replaced by substrate decode', can_repurpose: false },
  { name: 'agency-webhooks-v1', deprecated_at: '2025-09', reason: 'Replaced by agency-webhooks', can_repurpose: false },
  { name: 'dream-feeder-v1', deprecated_at: '2025-08', reason: 'Superseded by dream module', can_repurpose: true },
  { name: 'pf-ripple-image', deprecated_at: '2026-02', reason: 'Deleted - was 402 stub', can_repurpose: false, deleted: true },
];

// Expected active functions for substrate
// Maps expected name → acceptable deployed aliases
// Updated 2026-02-28: Removed phantom entries (agency-webhooks, pf-orchestrator, pf-stripe-webhook)
// agency work → pf-agency-execute-task, orchestration → pf-substrate, stripe → marketplace-fulfill
const EXPECTED_ACTIVE: Record<string, string[]> = {
  'pf-substrate': ['pf-substrate', 'substrate'],
  'evolution-receipts': ['evolution-receipts'],
  'evolution-control': ['evolution-control'],
  'pf-agency-execute-task': ['pf-agency-execute-task', 'agency-execute-task'],
  'pf-modernizer-rebuild': ['pf-modernizer-rebuild'],
  'pf-clm-engine': ['pf-clm-engine'],
  'passkey-auth': ['passkey-auth'],
  'marketplace-fulfill': ['marketplace-fulfill'],
  'pf-nexus-router': ['pf-nexus-router'],
};

// ═══════════════════════════════════════════════════════════════
// EDGE INTROSPECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Scan edge functions and analyze against archived catalog
 * Returns metadata only - no source code exposure
 */
export async function scanEdgeFunctions(): Promise<EdgeAnalysis> {
  const startTime = Date.now();
  
  // Use the new capability auto-loader for analysis
  const scanResult = runScanAdapt({ dryRun: true, verbose: false });
  
  const liveFunction = await detectLiveFunctions();
  const repurposeCandidates = analyzeRepurposeCandidates(liveFunction);
  const riskFlags = detectRiskFlags(liveFunction);
  
  // Merge capability scan findings
  for (const finding of scanResult.findings) {
    if (finding.overlap === 'FULL' && finding.deletionRecommended) {
      repurposeCandidates.push({
        function_name: finding.name,
        archived_name: finding.name,
        overlap_type: 'deprecated',
        confidence: 0.95,
        reason: `FULL overlap detected: ${finding.reason}`,
      });
    }
  }
  
  return {
    live_functions_count: liveFunction.length,
    archived_overlap_count: repurposeCandidates.length,
    repurpose_candidates: repurposeCandidates,
    risk_flags: riskFlags,
    scan_timestamp: new Date().toISOString(),
    capability_scan: scanResult,
  };
}

/**
 * Detect live deployed functions
 * Returns function names only - no source code
 */
async function detectLiveFunctions(): Promise<string[]> {
  // Deployed functions from supabase/functions directory
  // Excludes _shared and _archived directories
  const knownFunctions = [
    'pf-substrate',
    'evolution-receipts',
    'evolution-control',
    'pf-agency-execute-task',
    'pf-clm-engine',
    'passkey-auth',
    'pf-nexus-router',
    'pf-brain-sync-dispatch',
    'pf-distillation-engine',
    'pf-agency-chat',
    'pf-agency-daily-brief',
    'pf-agency-export',
    'pf-agency-global-dream',
    'pf-agency-local-dream',
    'pf-agency-scheduler',
    'pf-agency-send-email',
    'pf-auto-blog',
    'pf-autoblog-scheduler',
    'pf-core-admin',
    'pf-decode-search',
    'pf-nexus-image-gen',
    'pf-owner-report',
    'pf-radio-broadcast',
    'pf-substrate-coder',
    'pf-substrate-evolve',
    'pf-substrate-package',
    'pf-substrate-sandbox',
    'pf-substrate-upgrade',
    'pf-tsac-verify',
    'modernizer',
    'dream-feeder-api',
    'agent-mesh',
    'byok-proxy',
    'capability-checkout',
    'cascade-daily-seed',
    'cascade-dream-generator',
    'cascade-reflection-email',
    'check-engine-subscription',
    'cmpsbl-patch-download',
    'cmpsbl-patch-manifest',
    'cognitives-admin-upload',
    'cognitives-checkout',
    'cognitives-free-download',
    'cognitives-verify',
    'create-agency-checkout',
    'defense-check-subscription',
    'defense-create-checkout',
    'defense-customer-portal',
    'developer-learning',
    'developer-signup',
    'engine-checkout',
    'evolution-mesh-checkout',
    'extension-registry',
    'licensing-checkout',
    'licensing-verify',
    'marketplace-checkout',
    'marketplace-fulfill',
    'marketplace-generate-template',
    'marketplace-verify-license',
    'memory-playground',
    'nexus-budget-optimizer',
    'nexus-code-assistant',
    'nexus-provider-discovery',
    
    'stripe-price-lookup',
    'tier-checkout',
    'world-engine-checkout',
  ];
  
  return knownFunctions;
}

/**
 * Analyze for repurpose candidates
 */
function analyzeRepurposeCandidates(liveFunctions: string[]): RepurposeCandidate[] {
  const candidates: RepurposeCandidate[] = [];
  
  for (const archived of ARCHIVED_CATALOG) {
    // Check if archived function is still live
    const isStillLive = liveFunctions.some(f => 
      f === archived.name || f.includes(archived.name.split('-')[0])
    );
    
    if (isStillLive && archived.can_repurpose) {
      candidates.push({
        function_name: archived.name,
        archived_name: archived.name,
        overlap_type: 'deprecated',
        confidence: 0.8,
        reason: `Function ${archived.name} was deprecated: ${archived.reason}. Consider cleanup or repurposing.`,
      });
    }
    
    // Check for functions that should be active but aren't
    if (archived.replacement && !liveFunctions.includes(archived.replacement)) {
      candidates.push({
        function_name: archived.replacement,
        archived_name: archived.name,
        overlap_type: 'should_be_active',
        confidence: 0.7,
        reason: `Replacement function ${archived.replacement} may be missing.`,
      });
    }
  }
  
  // Check for orphaned functions (not in expected list)
  for (const func of liveFunctions) {
    const isExpected = Object.values(EXPECTED_ACTIVE).some(aliases => 
      aliases.some(a => func === a || func.includes(a) || a.includes(func))
    );
    const isArchived = ARCHIVED_CATALOG.some(a => func.includes(a.name));
    
    if (!isExpected && !isArchived) {
      // Could be orphaned - flag for review
      candidates.push({
        function_name: func,
        archived_name: '',
        overlap_type: 'orphaned',
        confidence: 0.5,
        reason: `Function ${func} not in expected catalog - may be orphaned or undocumented.`,
      });
    }
  }
  
  return candidates;
}

/**
 * Detect risk flags in edge functions
 */
function detectRiskFlags(liveFunctions: string[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  
  // Check for deprecated patterns
  for (const func of liveFunctions) {
    if (func.includes('-v1') && !func.includes('webhook')) {
      flags.push({
        function_name: func,
        risk_type: 'deprecated',
        severity: 'medium',
        description: `Function ${func} uses v1 naming - may need upgrade path.`,
      });
    }
    
    if (func.includes('legacy') || func.includes('old')) {
      flags.push({
        function_name: func,
        risk_type: 'stability',
        severity: 'high',
        description: `Function ${func} marked as legacy - should be reviewed for removal.`,
      });
    }
  }
  
  // Check expected functions are present (using alias matching)
  for (const [expectedName, aliases] of Object.entries(EXPECTED_ACTIVE)) {
    const found = liveFunctions.some(f => 
      aliases.some(a => f === a || f.includes(a) || a.includes(f))
    );
    if (!found) {
      flags.push({
        function_name: expectedName,
        risk_type: 'stability',
        severity: 'medium',
        description: `Expected function ${expectedName} not detected - may affect substrate functionality.`,
      });
    }
  }
  
  return flags;
}

export const phaseAEdge = {
  scan: scanEdgeFunctions,
};
