/**
 * EVOLUTION Module — Self-Evolution & Code Intelligence
 * Substrate Evolution Engine (formerly MODERNIZER)
 * 
 * Provides:
 * - Code scanning and analysis
 * - Evolution proposal generation
 * - Pattern detection and suggestions
 * - Dependency auditing
 * - Performance optimization proposals
 * - Integration with SEBA for autonomous evolution
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export type EvolutionPhase = 'planning' | 'shadow_applied' | 'production_applied' | 'verified' | 'aborted' | 'failed';
export type ProposalPriority = 'critical' | 'high' | 'medium' | 'low';
export type ProposalCategory = 'security' | 'performance' | 'maintainability' | 'accessibility' | 'modernization';

export interface EvolutionProposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  priority: ProposalPriority;
  impact_score: number;
  risk_score: number;
  confidence: number;
  affected_files: string[];
  suggested_changes: SuggestedChange[];
  rationale: string;
  evidence: string[];
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
}

export interface SuggestedChange {
  file: string;
  type: 'add' | 'modify' | 'delete' | 'refactor';
  description: string;
  before?: string;
  after?: string;
  line_range?: [number, number];
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  files_scanned: number;
  issues_found: number;
  proposals_generated: number;
  categories: Record<ProposalCategory, number>;
  duration_ms: number;
}

export interface DependencyAudit {
  name: string;
  current_version: string;
  latest_version: string;
  is_outdated: boolean;
  has_vulnerabilities: boolean;
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  recommendation?: string;
}

export interface PatternMatch {
  pattern: string;
  description: string;
  occurrences: number;
  files: string[];
  suggestion?: string;
  auto_fixable: boolean;
}

// ============ Scan Operations ============

/**
 * Run a full code scan for evolution opportunities
 */
export async function runScan(options?: {
  categories?: ProposalCategory[];
  paths?: string[];
  depth?: 'shallow' | 'deep';
}): Promise<ScanResult> {
  const startTime = Date.now();
  const scan_id = `scan_${Date.now()}`;
  
  try {
    // In production, this would invoke an edge function
    const result: ScanResult = {
      scan_id,
      timestamp: new Date().toISOString(),
      files_scanned: 0,
      issues_found: 0,
      proposals_generated: 0,
      categories: {
        security: 0,
        performance: 0,
        maintainability: 0,
        accessibility: 0,
        modernization: 0,
      },
      duration_ms: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    console.error('Scan error:', error);
    return {
      scan_id,
      timestamp: new Date().toISOString(),
      files_scanned: 0,
      issues_found: 0,
      proposals_generated: 0,
      categories: {
        security: 0,
        performance: 0,
        maintainability: 0,
        accessibility: 0,
        modernization: 0,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * Get pending evolution proposals
 */
export async function getProposals(
  filter?: {
    category?: ProposalCategory;
    priority?: ProposalPriority;
    status?: 'pending' | 'approved' | 'rejected' | 'applied';
  }
): Promise<EvolutionProposal[]> {
  // Return empty array - proposals would be stored in a dedicated table
  return [];
}

/**
 * Create a new evolution proposal
 */
export async function createProposal(
  proposal: Omit<EvolutionProposal, 'id' | 'created_at' | 'status'>
): Promise<{ success: boolean; proposal_id?: string; error?: string }> {
  try {
    const proposalId = `prop_${Date.now()}`;
    return { success: true, proposal_id: proposalId };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Approve a proposal for application
 */
export async function approveProposal(proposalId: string): Promise<boolean> {
  console.log(`Approving proposal: ${proposalId}`);
  return true;
}

/**
 * Reject a proposal
 */
export async function rejectProposal(
  proposalId: string,
  reason?: string
): Promise<boolean> {
  console.log(`Rejecting proposal: ${proposalId}, reason: ${reason}`);
  return true;
}

// ============ Pattern Detection ============

const CODE_PATTERNS: Record<string, { regex: RegExp; description: string; suggestion: string; auto_fixable: boolean }> = {
  'console-log': {
    regex: /console\.log\(/g,
    description: 'Console.log statements in production code',
    suggestion: 'Replace with proper logging or remove',
    auto_fixable: true,
  },
  'any-type': {
    regex: /:\s*any\b/g,
    description: 'Usage of TypeScript any type',
    suggestion: 'Replace with specific types',
    auto_fixable: false,
  },
  'todo-comment': {
    regex: /\/\/\s*(TODO|FIXME|HACK|XXX)/gi,
    description: 'Unresolved TODO/FIXME comments',
    suggestion: 'Resolve or create tracking issue',
    auto_fixable: false,
  },
  'magic-number': {
    regex: /(?<![a-zA-Z0-9_])\d{3,}(?![a-zA-Z0-9_])/g,
    description: 'Magic numbers in code',
    suggestion: 'Extract to named constants',
    auto_fixable: false,
  },
  'empty-catch': {
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    description: 'Empty catch blocks',
    suggestion: 'Add error handling or logging',
    auto_fixable: false,
  },
};

/**
 * Detect patterns in code content
 */
export function detectPatterns(content: string, filename: string): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const [patternId, config] of Object.entries(CODE_PATTERNS)) {
    const found = content.match(config.regex);
    if (found && found.length > 0) {
      matches.push({
        pattern: patternId,
        description: config.description,
        occurrences: found.length,
        files: [filename],
        suggestion: config.suggestion,
        auto_fixable: config.auto_fixable,
      });
    }
  }

  return matches;
}

// ============ Dependency Auditing ============

/**
 * Audit project dependencies
 */
export async function auditDependencies(): Promise<DependencyAudit[]> {
  // In production, this would analyze package.json and check npm registry
  return [];
}

// ============ Evolution Run Management ============

export interface EvolutionRun {
  run_id: string;
  proposal_id: string;
  phase: EvolutionPhase;
  started_at: string;
  completed_at?: string;
  rollback_available: boolean;
  metrics: {
    changes_applied: number;
    tests_passed: boolean;
    performance_delta?: number;
  };
}

/**
 * Start an evolution run
 */
export async function startEvolutionRun(
  proposalId: string
): Promise<{ success: boolean; run_id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('evolution_runs')
      .insert([{
        plan_id: proposalId,
        phase: 'planning' as const,
        initiated_by: 'human' as const,
        metadata: { proposal_id: proposalId },
      }])
      .select('run_id')
      .single();

    if (error) throw error;

    return { success: true, run_id: data?.run_id };
  } catch (error) {
    console.error('Error starting evolution run:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get evolution run status
 */
export async function getEvolutionRun(runId: string): Promise<EvolutionRun | null> {
  try {
    const { data } = await supabase
      .from('evolution_runs')
      .select('*')
      .eq('run_id', runId)
      .single();

    if (!data) return null;

    return {
      run_id: data.run_id,
      proposal_id: (data.metadata as Record<string, unknown>)?.proposal_id as string || '',
      phase: data.phase as EvolutionPhase,
      started_at: data.created_at,
      completed_at: data.completed_at,
      rollback_available: true,
      metrics: {
        changes_applied: 0,
        tests_passed: true,
      },
    };
  } catch (error) {
    console.error('Error fetching evolution run:', error);
    return null;
  }
}

/**
 * Rollback an evolution run
 */
export async function rollbackEvolution(runId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('evolution_runs')
      .update({ 
        phase: 'aborted',
        completed_at: new Date().toISOString(),
      })
      .eq('run_id', runId);

    return !error;
  } catch (error) {
    console.error('Error rolling back evolution:', error);
    return false;
  }
}

// ============ Module Metadata ============

import { SUBSTRATE_VERSION as _MV } from '@/lib/substrate/versions';
export const EVOLUTION_VERSION = _MV;
export const EVOLUTION_CODENAME = 'Architect';
/** @deprecated Use EVOLUTION_VERSION */
export const MODERNIZER_VERSION = EVOLUTION_VERSION;
/** @deprecated Use EVOLUTION_CODENAME */
export const MODERNIZER_CODENAME = EVOLUTION_CODENAME;

export interface EvolutionStatus {
  version: string;
  last_scan?: ScanResult;
  pending_proposals: number;
  active_runs: number;
  patterns_available: number;
}
/** @deprecated Use EvolutionStatus */
export type ModernizerStatus = EvolutionStatus;

export async function getEvolutionModuleStatus(): Promise<EvolutionStatus> {
  try {
    const { count: runsCount } = await supabase
      .from('evolution_runs')
      .select('run_id', { count: 'exact' })
      .not('phase', 'in', '("verified","aborted","failed")');

    return {
      version: EVOLUTION_VERSION,
      pending_proposals: 0,
      active_runs: runsCount || 0,
      patterns_available: Object.keys(CODE_PATTERNS).length,
    };
  } catch (error) {
    console.error('Error fetching EVOLUTION status:', error);
    return {
      version: EVOLUTION_VERSION,
      pending_proposals: 0,
      active_runs: 0,
      patterns_available: Object.keys(CODE_PATTERNS).length,
    };
  }
}
/** @deprecated Use getEvolutionModuleStatus */
export const getModernizerStatus = getEvolutionModuleStatus;
 
 // Code analysis
 export * from './codeAnalysis';
 
 // Migration planner - explicit re-exports to avoid BreakingChange conflict
 export {
   analyzeDependencies,
   checkForUpdates,
   getBreakingChanges,
   createMigrationPlan,
   getMigrationPlan,
   getAllMigrationPlans,
   simulateUpgrade,
   generateCodemod,
   applyCodemod,
   type DependencyInfo,
   type MigrationPlan,
   type DependencyMigration,
   type MigrationPhase,
   type MigrationTask,
   type UpgradeSimulation,
   type SimulationIssue,
   type TypeChange,
   type BreakingChange as MigrationBreakingChange,
 } from './migrationPlanner';
 
 // Impact analysis - explicit re-exports
 export {
   predictImpact,
   validateImpact,
  getImpactStats,
  generateImpactReport,
   type ImpactPrediction,
   type BreakingChange as ImpactBreakingChange,
   type ImpactValidation,
 } from './impactAnalysis';
