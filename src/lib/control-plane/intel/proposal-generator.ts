/**
 * Unified Proposal Generator
 * 
 * Combines signals from SEBA evolution, AUDIT module, diligence harness,
 * and ENGINEER findings to produce a comprehensive, agent-consumable
 * improvement proposal JSON.
 * 
 * Goals:
 * 1. Eliminate technical debt from vibe-coded mistakes
 * 2. Propose safe, governed evolution improvements
 * 3. Human-in-the-loop: user reviews before giving to their agent
 */

import { engineerNode } from '../engineer/maintenance';
import { intelAggregator } from './aggregator';
import { getAuditLog, verifyAuditChain, getAuditState } from '@/lib/substrate/audit-module';
import type { IntelCard } from '../types';

// ═══════════════════════════════════════════════════════════════
// SCHEMA — Agent-consumable proposal
// ═══════════════════════════════════════════════════════════════

export interface UnifiedProposal {
  schema_version: '2.0';
  generated_at: string;
  system_id: 'cmpsbl-substrate';
  proposal_type: 'unified-evolution';
  
  executive_summary: string;
  
  technical_debt: {
    total_issues: number;
    critical: TechDebtItem[];
    warnings: TechDebtItem[];
    patterns: string[];
  };
  
  evolution_opportunities: {
    total: number;
    proposals: EvolutionItem[];
  };
  
  audit_health: {
    chain_valid: boolean;
    total_entries: number;
    modules_monitored: number;
    compliance_score: number;
    gaps: string[];
  };
  
  diligence: {
    passed: number;
    failed: number;
    total: number;
    critical_failures: string[];
  };
  
  action_plan: ActionStep[];
  
  guardrails: {
    requires_human_review: true;
    rollback_available: boolean;
    estimated_risk: 'low' | 'medium' | 'high';
    safety_notes: string[];
  };
  
  metadata: {
    signals_analyzed: number;
    findings_count: number;
    proposals_count: number;
    generation_ms: number;
  };
}

export interface TechDebtItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  suggested_fix: string;
  affected_area: string;
}

export interface EvolutionItem {
  id: string;
  title: string;
  description: string;
  risk_level: string;
  scope: string;
  rationale: string;
  rollback_plan: string;
}

export interface ActionStep {
  order: number;
  category: 'tech-debt' | 'evolution' | 'audit' | 'diligence';
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  instructions: string[];
}

// ═══════════════════════════════════════════════════════════════
// GENERATOR
// ═══════════════════════════════════════════════════════════════

export function generateUnifiedProposal(): UnifiedProposal {
  const startTime = performance.now();
  
  // 1. Gather all INTEL signals
  const allCards = intelAggregator.getCards({ limit: 100 });
  const criticalCards = intelAggregator.getCriticals(20);
  const summary = intelAggregator.getSummary();
  
  // 2. Gather ENGINEER findings & proposals
  const findings = engineerNode.getFindings(true);
  const activeFindings = engineerNode.getFindings(false);
  const existingProposals = engineerNode.getProposals();
  const engineerStats = engineerNode.getStats();
  
  // 3. Gather AUDIT state
  const auditState = getAuditState();
  const chainVerification = verifyAuditChain();
  const recentAuditEntries = getAuditLog(50);
  
  // 4. Extract diligence data from INTEL cards
  const diligenceCards = allCards.filter(c => c.category === 'diligence');
  const diligenceData = extractDiligenceData(diligenceCards);
  
  // 5. Build technical debt items from findings + critical signals
  const techDebt = buildTechDebtSection(activeFindings, criticalCards, allCards);
  
  // 6. Build evolution opportunities from existing proposals + SEBA insights
  const evolution = buildEvolutionSection(existingProposals, allCards);
  
  // 7. Build audit health
  const auditGaps: string[] = [];
  if (!chainVerification.valid) {
    auditGaps.push(`Audit chain broken at index ${chainVerification.brokenAt}`);
  }
  if (auditState.totalEntries === 0) {
    auditGaps.push('No audit entries recorded this session');
  }
  const monitoredCount = auditState.modulesMonitored.length;
  const auditModules = new Set(recentAuditEntries.map(e => e.module));
  if (auditModules.size < monitoredCount * 0.5) {
    auditGaps.push(`Only ${auditModules.size}/${monitoredCount} modules have audit coverage`);
  }
  
  // 8. Build action plan
  const actionPlan = buildActionPlan(techDebt, evolution, auditGaps, diligenceData);
  
  // 9. Calculate risk
  const estimatedRisk = techDebt.critical.length > 3 || !chainVerification.valid ? 'high'
    : techDebt.critical.length > 0 ? 'medium' : 'low';
  
  const generationMs = Math.round(performance.now() - startTime);
  
  // 10. Executive summary
  const execSummary = buildExecutiveSummary(techDebt, evolution, diligenceData, auditGaps, estimatedRisk);
  
  return {
    schema_version: '2.0',
    generated_at: new Date().toISOString(),
    system_id: 'cmpsbl-substrate',
    proposal_type: 'unified-evolution',
    executive_summary: execSummary,
    technical_debt: techDebt,
    evolution_opportunities: evolution,
    audit_health: {
      chain_valid: chainVerification.valid,
      total_entries: auditState.totalEntries,
      modules_monitored: monitoredCount,
      compliance_score: chainVerification.valid ? 85 : 40,
      gaps: auditGaps,
    },
    diligence: diligenceData,
    action_plan: actionPlan,
    guardrails: {
      requires_human_review: true,
      rollback_available: true,
      estimated_risk: estimatedRisk,
      safety_notes: [
        'Review all proposed changes before giving to your coding agent.',
        'Each action step includes rollback instructions.',
        'Start with low-risk items first to build confidence.',
        'Run the diligence battery again after applying changes.',
      ],
    },
    metadata: {
      signals_analyzed: summary.total_signals,
      findings_count: findings.length,
      proposals_count: existingProposals.length,
      generation_ms: generationMs,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function extractDiligenceData(cards: IntelCard[]) {
  const diligenceCard = cards.find(c => c.source.includes('diligence'));
  const details = diligenceCard?.details_json as { summary?: { total: number; passed: number; minor: number; critical: number } } | undefined;
  const s = details?.summary;
  
  const criticalFailures: string[] = [];
  for (const card of cards) {
    if (card.severity === 'critical' && card.source.includes('DILIGENCE')) {
      criticalFailures.push(card.headline);
    }
  }
  
  return {
    passed: s?.passed ?? 0,
    failed: (s?.minor ?? 0) + (s?.critical ?? 0),
    total: s?.total ?? 0,
    critical_failures: criticalFailures,
  };
}

function buildTechDebtSection(
  activeFindings: ReturnType<typeof engineerNode.getFindings>,
  criticalCards: IntelCard[],
  allCards: IntelCard[],
) {
  const critical: TechDebtItem[] = [];
  const warnings: TechDebtItem[] = [];
  const patterns = new Set<string>();
  
  // From ENGINEER findings
  for (const f of activeFindings) {
    const item: TechDebtItem = {
      id: f.id,
      title: f.title,
      description: f.description,
      severity: f.severity,
      source: `ENGINEER/${f.source_node}`,
      suggested_fix: `Address ${f.category} issue in ${f.source_node}. Review evidence and apply targeted fix.`,
      affected_area: f.source_node,
    };
    
    if (f.severity === 'critical' || f.severity === 'high') {
      critical.push(item);
    } else {
      warnings.push(item);
    }
    patterns.add(f.category);
  }
  
  // From critical INTEL cards not already covered
  for (const card of criticalCards) {
    if (!activeFindings.some(f => card.headline.includes(f.title))) {
      critical.push({
        id: card.id,
        title: card.headline,
        description: card.what_changed,
        severity: 'critical',
        source: card.source,
        suggested_fix: card.suggested_next_step,
        affected_area: card.category,
      });
    }
  }
  
  // Detect patterns from warning cards
  const warnCards = allCards.filter(c => c.severity === 'warn');
  for (const card of warnCards) {
    patterns.add(card.category);
  }
  
  return {
    total_issues: critical.length + warnings.length,
    critical,
    warnings,
    patterns: [...patterns],
  };
}

function buildEvolutionSection(
  proposals: ReturnType<typeof engineerNode.getProposals>,
  allCards: IntelCard[],
) {
  const items: EvolutionItem[] = [];
  
  // Existing ENGINEER proposals
  for (const p of proposals) {
    if (p.status === 'draft' || p.status === 'reviewed') {
      items.push({
        id: p.id,
        title: p.title,
        description: p.description,
        risk_level: p.risk_level,
        scope: p.scope,
        rationale: `Finding-driven proposal from ENGINEER maintenance battery.`,
        rollback_plan: p.rollback_plan,
      });
    }
  }
  
  // Synthesize evolution opportunities from governance/health signals
  const governanceCards = allCards.filter(c => c.category === 'governance' || c.category === 'resilience');
  for (const card of governanceCards.slice(0, 5)) {
    if (!items.some(i => i.title === card.headline)) {
      items.push({
        id: card.id,
        title: `Evolution: ${card.headline}`,
        description: card.what_changed,
        risk_level: card.severity === 'critical' ? 'high' : card.severity === 'warn' ? 'medium' : 'low',
        scope: card.category,
        rationale: card.why_it_matters,
        rollback_plan: 'Revert changes in affected scope. Re-run diligence to confirm stability.',
      });
    }
  }
  
  return { total: items.length, proposals: items };
}

function buildActionPlan(
  techDebt: UnifiedProposal['technical_debt'],
  evolution: UnifiedProposal['evolution_opportunities'],
  auditGaps: string[],
  diligence: UnifiedProposal['diligence'],
): ActionStep[] {
  const steps: ActionStep[] = [];
  let order = 1;
  
  // Priority 1: Critical tech debt
  for (const item of techDebt.critical.slice(0, 5)) {
    steps.push({
      order: order++,
      category: 'tech-debt',
      title: `Fix: ${item.title}`,
      description: item.description,
      risk: 'high',
      instructions: [
        `Locate the issue in: ${item.affected_area}`,
        item.suggested_fix,
        'Add error handling and input validation',
        'Run diligence battery to verify fix',
        'If regression occurs, revert the change immediately',
      ],
    });
  }
  
  // Priority 2: Diligence failures
  for (const failure of diligence.critical_failures.slice(0, 3)) {
    steps.push({
      order: order++,
      category: 'diligence',
      title: `Resolve: ${failure}`,
      description: `Diligence probe failure that must be addressed for system reliability.`,
      risk: 'medium',
      instructions: [
        'Review the failing diligence probe',
        'Identify the root cause (missing handler, incorrect response shape, crash)',
        'Implement fix with proper error boundaries',
        'Re-run diligence to confirm resolution',
      ],
    });
  }
  
  // Priority 3: Audit gaps
  for (const gap of auditGaps) {
    steps.push({
      order: order++,
      category: 'audit',
      title: `Audit: ${gap}`,
      description: 'Compliance gap that weakens the system audit trail.',
      risk: 'low',
      instructions: [
        'Review the audit module configuration',
        'Ensure all critical modules emit audit events',
        'Verify chain integrity after changes',
      ],
    });
  }
  
  // Priority 4: Evolution opportunities (low risk)
  for (const item of evolution.proposals.filter(p => p.risk_level === 'low').slice(0, 3)) {
    steps.push({
      order: order++,
      category: 'evolution',
      title: item.title,
      description: item.description,
      risk: 'low',
      instructions: [
        `Scope: ${item.scope}`,
        item.rationale,
        `Rollback: ${item.rollback_plan}`,
        'Apply in shadow/test mode first if possible',
      ],
    });
  }
  
  // Priority 5: Medium-risk evolution
  for (const item of evolution.proposals.filter(p => p.risk_level === 'medium').slice(0, 2)) {
    steps.push({
      order: order++,
      category: 'evolution',
      title: item.title,
      description: item.description,
      risk: 'medium',
      instructions: [
        `Scope: ${item.scope}`,
        item.rationale,
        `Rollback: ${item.rollback_plan}`,
        'Review carefully before applying — medium risk',
      ],
    });
  }
  
  return steps;
}

function buildExecutiveSummary(
  techDebt: UnifiedProposal['technical_debt'],
  evolution: UnifiedProposal['evolution_opportunities'],
  diligence: UnifiedProposal['diligence'],
  auditGaps: string[],
  risk: string,
): string {
  const parts: string[] = [];
  
  if (techDebt.critical.length > 0) {
    parts.push(`${techDebt.critical.length} critical technical debt issue(s) found`);
  }
  if (techDebt.warnings.length > 0) {
    parts.push(`${techDebt.warnings.length} warning(s)`);
  }
  if (diligence.critical_failures.length > 0) {
    parts.push(`${diligence.critical_failures.length} diligence probe failure(s)`);
  }
  if (auditGaps.length > 0) {
    parts.push(`${auditGaps.length} audit gap(s)`);
  }
  if (evolution.total > 0) {
    parts.push(`${evolution.total} evolution opportunity(ies)`);
  }
  
  if (parts.length === 0) {
    return 'System is healthy. No critical issues detected. Minor optimizations may be available.';
  }
  
  return `${parts.join(', ')}. Overall risk: ${risk}. Copy this proposal to your coding agent to apply fixes with human review at each step.`;
}
