/**
 * Scan Merger & Validation Layer
 * Proposal Generation
 * 
 * Merges phase results and generates validated proposals.
 * A recommendation becomes a PLAN ITEM only if:
 * - Supported by ≥2 data sources
 * - risk_level is allowed
 * - confidence_score meets threshold
 * - not blocked by evolution circuit
 */

import type {
  EdgeAnalysis,
  SystemState,
  CodeHealth,
  LLMRecommendation,
  ScanProposal,
  ScanConfig,
} from './types';
import { DEFAULT_SCAN_CONFIG } from './types';
import { circuitBreaker } from '../circuit-breaker';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface MergeInput {
  edge_analysis: EdgeAnalysis;
  system_state: SystemState;
  code_health: CodeHealth;
  llm_recommendations: LLMRecommendation[];
  config?: Partial<ScanConfig>;
}

interface MergeResult {
  proposals: ScanProposal[];
  blocked_reasons: string[];
  validation_summary: {
    total_recommendations: number;
    validated: number;
    rejected_confidence: number;
    rejected_risk: number;
    rejected_evidence: number;
    blocked_circuit: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// MERGER
// ═══════════════════════════════════════════════════════════════

/**
 * Merge all phase results into validated proposals
 */
export async function mergeAndValidate(input: MergeInput): Promise<MergeResult> {
  const config: ScanConfig = { ...DEFAULT_SCAN_CONFIG, ...input.config };
  const blockedReasons: string[] = [];
  
  // Check circuit state first
  const circuitStatus = await circuitBreaker.getStatus();
  if (!circuitStatus.can_evolve) {
    blockedReasons.push(`Evolution circuit is OPEN: ${circuitStatus.trip_reason}`);
  }
  
  // Build evidence map from phases
  const evidenceMap = buildEvidenceMap(input);
  
  // Process LLM recommendations
  const proposals: ScanProposal[] = [];
  let rejectedConfidence = 0;
  let rejectedRisk = 0;
  let rejectedEvidence = 0;
  
  for (const rec of input.llm_recommendations) {
    // Check confidence threshold
    if (rec.confidence_score < config.min_confidence_for_plan) {
      rejectedConfidence++;
      continue;
    }
    
    // Check risk level
    if (!config.allowed_risk_levels.includes(rec.risk_level)) {
      rejectedRisk++;
      continue;
    }
    
    // Count supporting sources
    const supportingSources = countSupportingSources(rec, evidenceMap);
    if (supportingSources.count < config.min_validation_sources) {
      rejectedEvidence++;
      continue;
    }
    
    // Create validated proposal with enriched metadata (v6.3.1)
    proposals.push({
      proposal_id: generateProposalId(),
      title: rec.title,
      category: rec.category,
      description: rec.rationale,
      rationale: rec.expected_impact,
      risk_level: rec.risk_level,
      confidence_score: rec.confidence_score,
      requires_human: rec.requires_human,
      source_phases: supportingSources.phases,
      validation_sources: supportingSources.count,
      action_type: inferActionType(rec.category, rec.title),
      affected_modules: inferAffectedModules(rec.title, rec.rationale),
      reversible: rec.risk_level !== 'high',
      metadata_version: '6.3.1',
    });
  }
  
  // Add phase-derived proposals (from anomalies and missing capabilities)
  const derivedProposals = deriveProposals(input, config);
  for (const dp of derivedProposals) {
    if (!proposals.some(p => p.title === dp.title)) {
      proposals.push(dp);
    }
  }
  
  // Sort by confidence and limit
  proposals.sort((a, b) => b.confidence_score - a.confidence_score);
  const limitedProposals = proposals.slice(0, config.max_proposals);
  
  return {
    proposals: limitedProposals,
    blocked_reasons: blockedReasons,
    validation_summary: {
      total_recommendations: input.llm_recommendations.length,
      validated: limitedProposals.length,
      rejected_confidence: rejectedConfidence,
      rejected_risk: rejectedRisk,
      rejected_evidence: rejectedEvidence,
      blocked_circuit: !circuitStatus.can_evolve,
    },
  };
}

/**
 * Build evidence map from all phases
 */
function buildEvidenceMap(input: MergeInput): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  
  // Add edge evidence
  for (const flag of input.edge_analysis.risk_flags) {
    addEvidence(map, flag.risk_type, 'edge');
    addEvidence(map, flag.description.toLowerCase(), 'edge');
  }
  // Repurpose candidates are archived functions that have been intentionally
  // preserved or repurposed. They are NOT orphaned — do not inject orphan/deprecated
  // evidence which triggers false-positive cleanup proposals in the LLM phase.
  for (const candidate of input.edge_analysis.repurpose_candidates) {
    addEvidence(map, candidate.overlap_type, 'edge');
  }
  
  // Add system state evidence
  if (input.system_state.evolution_state.stuck_in_shadow) {
    addEvidence(map, 'shadow', 'system');
    addEvidence(map, 'stuck', 'system');
  }
  if (input.system_state.evolution_state.failed_runs_24h > 0) {
    addEvidence(map, 'failed', 'system');
    addEvidence(map, 'failure', 'system');
  }
  for (const anomaly of input.system_state.detected_anomalies) {
    addEvidence(map, anomaly.anomaly_type, 'system');
    addEvidence(map, anomaly.description.toLowerCase(), 'system');
  }
  
  // Add code health evidence
  if (input.code_health.security_posture === 'weak') {
    addEvidence(map, 'security', 'health');
    addEvidence(map, 'weak', 'health');
  }
  if (input.code_health.upgrade_pressure === 'high') {
    addEvidence(map, 'upgrade', 'health');
    addEvidence(map, 'maintenance', 'health');
  }
  for (const cap of input.code_health.missing_capabilities) {
    addEvidence(map, cap.capability.toLowerCase(), 'health');
    addEvidence(map, cap.category, 'health');
  }
  
  return map;
}

function addEvidence(map: Map<string, Set<string>>, key: string, phase: string): void {
  const normalized = key.toLowerCase();
  if (!map.has(normalized)) {
    map.set(normalized, new Set());
  }
  map.get(normalized)!.add(phase);
}

/**
 * Count how many phase sources support a recommendation
 */
function countSupportingSources(
  rec: LLMRecommendation, 
  evidenceMap: Map<string, Set<string>>
): { count: number; phases: ('edge' | 'system' | 'health' | 'llm')[] } {
  const phases = new Set<'edge' | 'system' | 'health' | 'llm'>();
  phases.add('llm'); // Always from LLM
  
  // Check title and rationale against evidence
  const keywords = extractKeywords(rec.title + ' ' + rec.rationale);
  
  for (const keyword of keywords) {
    const sources = evidenceMap.get(keyword);
    if (sources) {
      for (const source of sources) {
        if (source === 'edge') phases.add('edge');
        if (source === 'system') phases.add('system');
        if (source === 'health') phases.add('health');
      }
    }
  }
  
  // Check supporting evidence references
  for (const evidence of rec.supporting_evidence) {
    const lower = evidence.toLowerCase();
    if (lower.includes('edge') || lower.includes('function')) phases.add('edge');
    if (lower.includes('state') || lower.includes('circuit') || lower.includes('run')) phases.add('system');
    if (lower.includes('health') || lower.includes('security') || lower.includes('capability')) phases.add('health');
  }
  
  return {
    count: phases.size,
    phases: Array.from(phases),
  };
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);
}

/**
 * Infer action type from category and title
 */
function inferActionType(
  category: string, 
  title: string
): 'code_change' | 'config_change' | 'cleanup' | 'monitoring' | 'manual_review' {
  const lower = title.toLowerCase();
  
  if (category === 'cleanup') return 'cleanup';
  if (lower.includes('review') || lower.includes('investigate')) return 'manual_review';
  if (lower.includes('monitor') || lower.includes('observe')) return 'monitoring';
  if (lower.includes('config') || lower.includes('setting') || lower.includes('enable')) return 'config_change';
  return 'code_change';
}

/**
 * Infer affected modules from proposal content (v6.3.1)
 */
function inferAffectedModules(title: string, description: string): string[] {
  const modules: string[] = [];
  const text = `${title} ${description}`.toLowerCase();
  
  const moduleMap: Record<string, string> = {
    'brain': 'BRAIN', 'memory': 'BRAIN', 'recall': 'BRAIN',
    'decode': 'DECODE', 'explain': 'DECODE', 'interpret': 'DECODE',
    'dream': 'DREAM', 'learning': 'DREAM', 'synthesis': 'DREAM',
    'core': 'CORE', 'circuit': 'CORE', 'boot': 'CORE',
    'ripple': 'RIPPLE', 'event': 'RIPPLE', 'emit': 'RIPPLE',
    'access': 'ACCESS', 'quota': 'ACCESS', 'rate': 'ACCESS',
    'defense': 'DEFENSE', 'security': 'DEFENSE', 'threat': 'DEFENSE',
    'nexus': 'NEXUS', 'router': 'NEXUS', 'provider': 'NEXUS',
    'vision': 'VISION', 'metric': 'VISION', 'anomaly': 'VISION',
    'system': 'SYSTEM', 'health': 'SYSTEM', 'heal': 'SYSTEM',
    'modernizer': 'EVOLUTION', 'evolve': 'EVOLUTION', 'evolution': 'EVOLUTION',
    'integration': 'INTEGRATION', 'webhook': 'INTEGRATION',
    'inclusive': 'INCLUSIVE', 'accessibility': 'INCLUSIVE',
    'cortex': 'CORTEX', 'orchestrat': 'CORTEX',
  };
  
  for (const [keyword, module] of Object.entries(moduleMap)) {
    if (text.includes(keyword) && !modules.includes(module)) {
      modules.push(module);
    }
  }
  
  return modules.length > 0 ? modules : ['SYSTEM'];
}

/**
 * Derive proposals directly from phase data
 */
function deriveProposals(input: MergeInput, config: ScanConfig): ScanProposal[] {
  const proposals: ScanProposal[] = [];
  
  // Derive from anomalies
  for (const anomaly of input.system_state.detected_anomalies) {
    if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
      proposals.push({
        proposal_id: generateProposalId(),
        title: `Resolve ${anomaly.anomaly_type.replace('_', ' ')}`,
        category: 'resilience',
        description: anomaly.description,
        rationale: `Detected anomaly affecting: ${anomaly.affected_components.join(', ')}`,
        risk_level: anomaly.severity === 'critical' ? 'high' : 'medium',
        confidence_score: 0.9,
        requires_human: true,
        source_phases: ['system'],
        validation_sources: 1,
        action_type: 'manual_review',
        affected_modules: anomaly.affected_components,
        reversible: anomaly.severity !== 'critical',
        metadata_version: '6.3.1',
      });
    }
  }
  
  // Derive from missing capabilities
  for (const cap of input.code_health.missing_capabilities) {
    if (cap.impact === 'high') {
      proposals.push({
        proposal_id: generateProposalId(),
        title: `Add ${cap.capability}`,
        category: cap.category === 'security' ? 'security' : 'capability',
        description: cap.recommendation,
        rationale: `Missing capability with high impact on ${cap.category}`,
        risk_level: 'low',
        confidence_score: 0.8,
        requires_human: false,
        source_phases: ['health'],
        validation_sources: 1,
        action_type: 'code_change',
        affected_modules: inferAffectedModules(cap.capability, cap.recommendation),
        reversible: true,
        metadata_version: '6.3.1',
      });
    }
  }
  
  return proposals;
}

function generateProposalId(): string {
  return `prop_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export const scanMerger = {
  merge: mergeAndValidate,
};
