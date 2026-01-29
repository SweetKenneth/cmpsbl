/**
 * Phase A — Edge Function Introspection
 * v0.7.7 — Archived Technique Analysis
 * 
 * Scans deployed edge functions and cross-references against archived catalog.
 * ⚠️ No source code exposed. Metadata only.
 */

import type { EdgeAnalysis, RepurposeCandidate, RiskFlag } from './types';

// ═══════════════════════════════════════════════════════════════
// ARCHIVED FUNCTION CATALOG
// ═══════════════════════════════════════════════════════════════

interface ArchivedFunction {
  name: string;
  deprecated_at: string;
  reason: string;
  replacement?: string;
  can_repurpose: boolean;
}

// Known archived/deprecated functions (from custom knowledge)
const ARCHIVED_CATALOG: ArchivedFunction[] = [
  { name: 'pf-brain-reflect', deprecated_at: '2025-10', reason: 'Replaced by substrate brain module', can_repurpose: false },
  { name: 'pf-modernizer-v1', deprecated_at: '2025-11', reason: 'Replaced by evolution system', can_repurpose: true },
  { name: 'pf-decode-legacy', deprecated_at: '2025-10', reason: 'Replaced by substrate decode', can_repurpose: false },
  { name: 'agency-webhooks-v1', deprecated_at: '2025-09', reason: 'Replaced by agency-webhooks', can_repurpose: false },
  { name: 'dream-feeder-v1', deprecated_at: '2025-08', reason: 'Superseded by dream module', can_repurpose: true },
];

// Expected active functions for substrate
const EXPECTED_ACTIVE: string[] = [
  'substrate',
  'evolution-receipts',
  'agency-execute-task',
  'agency-webhooks',
  'pf-modernizer-rebuild',
  'pf-orchestrator',
  'pf-stripe-webhook',
];

// ═══════════════════════════════════════════════════════════════
// EDGE INTROSPECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Scan edge functions and analyze against archived catalog
 * Returns metadata only - no source code exposure
 */
export async function scanEdgeFunctions(): Promise<EdgeAnalysis> {
  const startTime = Date.now();
  
  // In a real implementation, this would call Supabase Management API
  // For now, we simulate based on known project structure
  const liveFunction = await detectLiveFunctions();
  const repurposeCandidates = analyzeRepurposeCandidates(liveFunction);
  const riskFlags = detectRiskFlags(liveFunction);
  
  return {
    live_functions_count: liveFunction.length,
    archived_overlap_count: repurposeCandidates.length,
    repurpose_candidates: repurposeCandidates,
    risk_flags: riskFlags,
    scan_timestamp: new Date().toISOString(),
  };
}

/**
 * Detect live deployed functions
 * Returns function names only - no source code
 */
async function detectLiveFunctions(): Promise<string[]> {
  // Known deployed functions based on project structure
  // In production, this would query the Supabase API
  const knownFunctions = [
    'substrate',
    'evolution-receipts',
    'agency-execute-task',
    'agency-webhooks',
    'pf-modernizer-rebuild',
    'pf-orchestrator',
    'pf-stripe-webhook',
    'stripe-webhook-minimal',
    'check-scheduled-scans',
    'execute-scheduled-task',
    'generate-sitemap',
    'send-agency-email',
    'submit-agency-contact',
    'validate-access-key',
    // Add more as needed
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
    const isExpected = EXPECTED_ACTIVE.some(e => func.includes(e) || e.includes(func));
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
  
  // Check expected functions are present
  for (const expected of EXPECTED_ACTIVE) {
    if (!liveFunctions.some(f => f.includes(expected))) {
      flags.push({
        function_name: expected,
        risk_type: 'stability',
        severity: 'medium',
        description: `Expected function ${expected} not detected - may affect substrate functionality.`,
      });
    }
  }
  
  return flags;
}

export const phaseAEdge = {
  scan: scanEdgeFunctions,
};
