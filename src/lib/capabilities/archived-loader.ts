/**
 * Archived Edge Function Loader
 * v7.0.0 — Scans ONLY _archived edge functions for capability ingestion
 * 
 * This loader explicitly ignores:
 * - /edge/ (live functions)
 * - /edge/live/
 * - /api/edge/
 * - Any active production routes
 * 
 * It ONLY processes: supabase/functions/_archived/
 */

import type { 
  CapabilityMetadata, 
  EdgeFunctionAudit, 
  ScanAdaptResult,
  CapabilityRisk 
} from './types';
import { registerCapability, deprecateCapability, listCapabilities, getCapability } from './registry';
import { setCapabilityEnabled, isCapabilityEnabled } from './state';

// ============================================================================
// ARCHIVED CAPABILITIES CATALOG
// ============================================================================
// These are the 10 high-value archived functions integrated into the substrate
// via archived-adapters.ts (v6.9.1 → v7.0.0)

export interface ArchivedCapabilityDef {
  id: string;
  name: string;
  edgeFunction: string;
  modules: string[];
  risk: CapabilityRisk;
  reversible: boolean;
  description: string;
  valueScore: number; // 0-100, higher = more valuable
  overlap: 'NONE' | 'PARTIAL' | 'FULL';
}

export const ARCHIVED_CAPABILITIES: ArchivedCapabilityDef[] = [
  {
    id: 'hypothesis-test',
    name: 'Hypothesis Validation',
    edgeFunction: 'pf-brain-hypothesis-test',
    modules: ['BRAIN', 'DECODE'],
    risk: 'low',
    reversible: true,
    description: 'Tests claims with IF-THEN scenarios and counter-evidence',
    valueScore: 95,
    overlap: 'NONE',
  },
  {
    id: 'systems-reasoning',
    name: 'Systems Causal Analysis',
    edgeFunction: 'pf-brain-systems-reasoning',
    modules: ['BRAIN', 'CORTEX'],
    risk: 'low',
    reversible: true,
    description: 'Maps multi-layer dependencies and identifies bottlenecks',
    valueScore: 92,
    overlap: 'NONE',
  },
  {
    id: 'self-critique',
    name: 'Autonomous Quality Review',
    edgeFunction: 'pf-brain-self-critique',
    modules: ['BRAIN', 'DECODE'],
    risk: 'low',
    reversible: true,
    description: 'Self-critiques outputs for clarity, accuracy, and completeness',
    valueScore: 90,
    overlap: 'NONE',
  },
  {
    id: 'pattern-fusion',
    name: 'Cross-Domain Pattern Fusion',
    edgeFunction: 'pf-brain-pattern-fusion',
    modules: ['BRAIN', 'DREAM'],
    risk: 'low',
    reversible: true,
    description: 'Merges insights from two domains to generate novel solutions',
    valueScore: 88,
    overlap: 'NONE',
  },
  {
    id: 'anomaly-detection',
    name: 'Behavioral Drift Detection',
    edgeFunction: 'pf-defense-anomaly-detection',
    modules: ['DEFENSE', 'VISION'],
    risk: 'medium',
    reversible: true,
    description: 'Statistical anomaly analysis for security events',
    valueScore: 93,
    overlap: 'NONE',
  },
  {
    id: 'resilience-monitor',
    name: 'Resilience Orchestration',
    edgeFunction: 'pf-resilience-monitor',
    modules: ['SYSTEM', 'CORE'],
    risk: 'medium',
    reversible: true,
    description: 'Auto-heal failures with graceful recovery',
    valueScore: 96,
    overlap: 'NONE',
  },
  {
    id: 'temporal-score',
    name: 'Temporal Memory Scoring',
    edgeFunction: 'pf-brain-temporal-score',
    modules: ['BRAIN', 'DREAM'],
    risk: 'low',
    reversible: true,
    description: 'Time-weighted relevance scoring for memory retrieval',
    valueScore: 85,
    overlap: 'NONE',
  },
  {
    id: 'ethical-boundary',
    name: 'Ethical Guardrails',
    edgeFunction: 'pf-brain-ethical-boundary',
    modules: ['BRAIN', 'CORTEX', 'DEFENSE'],
    risk: 'low',
    reversible: true,
    description: 'Risk evaluation and compliance checking before actions',
    valueScore: 97,
    overlap: 'NONE',
  },
  {
    id: 'improvement-engine',
    name: 'Continuous Improvement Engine',
    edgeFunction: 'pf-cascade-improvement-engine',
    modules: ['MODERNIZER', 'CORTEX'],
    risk: 'medium',
    reversible: true,
    description: 'Generates and prioritizes upgrade proposals',
    valueScore: 91,
    overlap: 'PARTIAL', // Shared with CORTEX
  },
  {
    id: 'curiosity-reflect',
    name: 'Active Learning Triggers',
    edgeFunction: 'pf-brain-curiosity-reflect',
    modules: ['BRAIN', 'DREAM'],
    risk: 'low',
    reversible: true,
    description: 'Curiosity-driven exploration and learning triggers',
    valueScore: 84,
    overlap: 'NONE',
  },
];

// ============================================================================
// SCAN & ADAPT FUNCTIONS
// ============================================================================

/**
 * Scan archived capabilities and generate audit report
 */
export function scanArchivedCapabilities(options: {
  verbose?: boolean;
} = {}): EdgeFunctionAudit[] {
  const { verbose = false } = options;
  const findings: EdgeFunctionAudit[] = [];
  
  for (const cap of ARCHIVED_CAPABILITIES) {
    const audit: EdgeFunctionAudit = {
      name: cap.id,
      path: `supabase/functions/${cap.edgeFunction}/index.ts`,
      mergedLocations: cap.modules,
      overlap: cap.overlap,
      deletionRecommended: cap.overlap === 'FULL',
      reason: getOverlapReason(cap),
      hasMetadata: true,
      metadata: {
        name: cap.name,
        modules: cap.modules,
        risk: cap.risk,
        reversible: cap.reversible,
        description: cap.description,
      },
    };
    
    findings.push(audit);
    
    if (verbose) {
      console.log(`[ArchivedLoader] ${cap.id}: ${cap.overlap} - value=${cap.valueScore}`);
    }
  }
  
  // Sort by value score (highest first)
  findings.sort((a, b) => {
    const capA = ARCHIVED_CAPABILITIES.find(c => c.id === a.name);
    const capB = ARCHIVED_CAPABILITIES.find(c => c.id === b.name);
    return (capB?.valueScore ?? 0) - (capA?.valueScore ?? 0);
  });
  
  return findings;
}

function getOverlapReason(cap: ArchivedCapabilityDef): string {
  switch (cap.overlap) {
    case 'FULL':
      return `Logic fully migrated to ${cap.modules.join(' + ')}. Safe to delete.`;
    case 'PARTIAL':
      return `Logic shared with ${cap.modules.join(' + ')}. Requires TODO markers.`;
    case 'NONE':
      return `Edge-only capability. Ready for governed adaptation.`;
  }
}

/**
 * Adapt archived capabilities into the registry
 */
export function adaptArchivedCapabilities(options: {
  dryRun?: boolean;
  verbose?: boolean;
  minValueScore?: number;
}): ScanAdaptResult {
  const { dryRun = true, verbose = false, minValueScore = 0 } = options;
  
  const findings = scanArchivedCapabilities({ verbose });
  const errors: string[] = [];
  let adaptedCount = 0;
  let blockedCount = 0;
  let deletedCount = 0;
  
  for (const audit of findings) {
    const capDef = ARCHIVED_CAPABILITIES.find(c => c.id === audit.name);
    if (!capDef) continue;
    
    // Skip if below value threshold
    if (capDef.valueScore < minValueScore) {
      if (verbose) {
        console.log(`[ArchivedLoader] Skipping ${audit.name}: value ${capDef.valueScore} < ${minValueScore}`);
      }
      blockedCount++;
      continue;
    }
    
    // Skip FULL overlap (should be deleted, not adapted)
    if (audit.overlap === 'FULL') {
      if (verbose) {
        console.log(`[ArchivedLoader] Skipping ${audit.name}: FULL overlap, deletion recommended`);
      }
      deletedCount++;
      continue;
    }
    
    if (!dryRun && audit.metadata) {
      try {
        // Check if already registered
        const existing = getCapability(capDef.id);
        
        // Register capability
        registerCapability(
          capDef.id,
          {
            name: capDef.name,
            modules: capDef.modules,
            risk: capDef.risk,
            reversible: capDef.reversible,
            description: capDef.description,
          },
          'edge-adapted',
          audit.path
        );
        
        // Initialize enabled state (default to enabled for new, preserve for existing)
        if (!existing) {
          setCapabilityEnabled(capDef.id, true, 'auto-adapt');
        }
        
        adaptedCount++;
        
        if (verbose) {
          console.log(`[ArchivedLoader] Adapted: ${capDef.id} (value=${capDef.valueScore})`);
        }
      } catch (err) {
        errors.push(`Failed to adapt ${capDef.id}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } else if (dryRun) {
      // In dry-run, count as would-be-adapted
      adaptedCount++;
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'confirm',
    findings,
    adaptedCount,
    deletedCount,
    blockedCount,
    errors,
  };
}

/**
 * Terminal command: system.scan_archived
 */
export function runScanArchived(options: {
  dryRun?: boolean;
  confirm?: boolean;
  pruneMerged?: boolean;
  verbose?: boolean;
}): ScanAdaptResult {
  const { dryRun = true, confirm = false, pruneMerged = false, verbose = false } = options;
  
  if (verbose) {
    console.log('[ArchivedLoader] Starting archived edge function scan...');
    console.log('[ArchivedLoader] Scope: supabase/functions/_archived/ ONLY');
    console.log('[ArchivedLoader] Ignoring: /edge/, /edge/live/, /api/edge/, production routes');
  }
  
  // Run adaptation
  const result = adaptArchivedCapabilities({
    dryRun: dryRun && !confirm,
    verbose,
    minValueScore: 80, // Only adapt high-value capabilities
  });
  
  // Handle prune-merged flag
  if (pruneMerged && !dryRun) {
    const fullOverlap = ARCHIVED_CAPABILITIES.filter(c => c.overlap === 'FULL');
    for (const cap of fullOverlap) {
      // Deprecate capability if registered
      deprecateCapability(cap.id);
      if (verbose) {
        console.log(`[ArchivedLoader] Deprecated (FULL overlap): ${cap.id}`);
      }
    }
    result.deletedCount = fullOverlap.length;
  }
  
  if (verbose) {
    console.log(`[ArchivedLoader] Scan complete:
      Adapted: ${result.adaptedCount}
      Blocked: ${result.blockedCount}
      Deleted: ${result.deletedCount}
      Errors: ${result.errors.length}`);
  }
  
  return result;
}

/**
 * Get archived capability by ID
 */
export function getArchivedCapability(id: string): ArchivedCapabilityDef | undefined {
  return ARCHIVED_CAPABILITIES.find(c => c.id === id);
}

/**
 * Get all archived capabilities sorted by value
 */
export function getArchivedCapabilitiesByValue(): ArchivedCapabilityDef[] {
  return [...ARCHIVED_CAPABILITIES].sort((a, b) => b.valueScore - a.valueScore);
}

/**
 * Check if an archived capability is enabled
 */
export function isArchivedCapabilityEnabled(id: string): boolean {
  return isCapabilityEnabled(id);
}
