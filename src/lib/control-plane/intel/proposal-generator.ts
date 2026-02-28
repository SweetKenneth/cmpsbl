/**
 * Unified Proposal Generator v3.0
 * 
 * ALL-IN-ONE audit merger: combines signals from every audit subsystem
 * into a single, comprehensive, agent-consumable proposal.
 * 
 * Sources merged:
 * 1. SEBA Evolution — cognitive analyzer insights (9 engines)
 * 2. Full Audit Runner — production readiness checks (system manifest, routes, modules, SEO, hooks, UI, branding, backend)
 * 3. Substrate Health Check — structural integrity across 8 layers
 * 4. AUDIT Module — immutable compliance ledger + chain integrity
 * 5. Diligence Harness — terminal/governance probe battery
 * 6. ENGINEER Findings — internal maintenance node signals
 * 7. INTEL Aggregator — cross-system signal correlation
 * 
 * Goals:
 * 1. Eliminate ALL technical debt from vibe-coded mistakes
 * 2. Propose safe, governed evolution improvements
 * 3. Human-in-the-loop: user reviews before giving to their agent
 */

import { engineerNode } from '../engineer/maintenance';
import { intelAggregator } from './aggregator';
import { getAuditLog, verifyAuditChain, getAuditState } from '@/lib/substrate/audit-module';
import { runFullAudit } from '@/lib/audit/audit-runner';
import { runSubstrateHealthCheck } from '@/lib/audit/substrate-health-check';
import type { IntelCard } from '../types';
import type { AuditFinding, AuditReport } from '@/lib/audit/audit-types';
import type { HealthCheckReport } from '@/lib/audit/substrate-health-check';

// ═══════════════════════════════════════════════════════════════
// SCHEMA — Agent-consumable proposal v3.0
// ═══════════════════════════════════════════════════════════════

export interface UnifiedProposal {
  schema_version: '3.0';
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
  
  // Full Audit Runner results
  production_audit: {
    passed: boolean;
    duration_ms: number;
    fatal: number;
    error: number;
    warn: number;
    info: number;
    total_findings: number;
    top_issues: AuditSummaryItem[];
  };
  
  // Substrate Health Check results
  structural_health: {
    overall_verdict: 'PASS' | 'FAIL';
    structural_issues: number;
    layers_checked: number;
    layers_passed: number;
    layer_results: LayerSummary[];
    confirmations: string[];
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
    audit_checks_run: number;
    health_layers_checked: number;
    generation_ms: number;
    sources: string[];
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
  category: 'tech-debt' | 'evolution' | 'audit' | 'diligence' | 'structural' | 'production';
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  instructions: string[];
}

export interface AuditSummaryItem {
  id: string;
  category: string;
  severity: string;
  title: string;
  detail: string;
  hint?: string;
}

export interface LayerSummary {
  layer: string;
  label: string;
  verdict: 'PASS' | 'FAIL';
  check_count: number;
  failures: string[];
}

// ═══════════════════════════════════════════════════════════════
// GENERATOR — Merges ALL audit sources
// ═══════════════════════════════════════════════════════════════

export async function generateUnifiedProposal(): Promise<UnifiedProposal> {
  const startTime = performance.now();
  
  // ─── 1. INTEL + ENGINEER (existing) ───
  const allCards = intelAggregator.getCards({ limit: 100 });
  const criticalCards = intelAggregator.getCriticals(20);
  const summary = intelAggregator.getSummary();
  const findings = engineerNode.getFindings(true);
  const activeFindings = engineerNode.getFindings(false);
  const existingProposals = engineerNode.getProposals();
  
  // ─── 2. AUDIT MODULE — compliance ledger ───
  const auditState = getAuditState();
  const chainVerification = verifyAuditChain();
  const recentAuditEntries = getAuditLog(50);
  
  // ─── 3. FULL AUDIT RUNNER — production readiness checks ───
  let fullAuditReport: AuditReport | null = null;
  try {
    fullAuditReport = await runFullAudit();
  } catch (e) {
    console.warn('[Proposal] Full audit runner failed:', e);
  }
  
  // ─── 4. SUBSTRATE HEALTH CHECK — structural integrity ───
  let healthReport: HealthCheckReport | null = null;
  try {
    healthReport = runSubstrateHealthCheck();
  } catch (e) {
    console.warn('[Proposal] Substrate health check failed:', e);
  }
  
  // ─── 5. DILIGENCE — terminal probe battery ───
  const diligenceCards = allCards.filter(c => c.category === 'diligence');
  const diligenceData = extractDiligenceData(diligenceCards);
  
  // ═══ BUILD SECTIONS ═══
  
  // Tech Debt — merge ENGINEER findings + audit findings + health failures
  const techDebt = buildTechDebtSection(activeFindings, criticalCards, allCards, fullAuditReport, healthReport);
  
  // Evolution opportunities
  const evolution = buildEvolutionSection(existingProposals, allCards);
  
  // Production Audit results
  const productionAudit = buildProductionAuditSection(fullAuditReport);
  
  // Structural Health results
  const structuralHealth = buildStructuralHealthSection(healthReport);
  
  // Audit gaps
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
  
  // ═══ BUILD ACTION PLAN (priority-ordered across ALL sources) ═══
  const actionPlan = buildActionPlan(techDebt, evolution, auditGaps, diligenceData, productionAudit, structuralHealth);
  
  // Risk assessment
  const estimatedRisk = 
    (techDebt.critical.length > 3 || !chainVerification.valid || structuralHealth.overall_verdict === 'FAIL') ? 'high'
    : (techDebt.critical.length > 0 || productionAudit.fatal > 0) ? 'medium' 
    : 'low';
  
  const generationMs = Math.round(performance.now() - startTime);
  
  const execSummary = buildExecutiveSummary(techDebt, evolution, diligenceData, auditGaps, estimatedRisk, productionAudit, structuralHealth);
  
  return {
    schema_version: '3.0',
    generated_at: new Date().toISOString(),
    system_id: 'cmpsbl-substrate',
    proposal_type: 'unified-evolution',
    executive_summary: execSummary,
    technical_debt: techDebt,
    evolution_opportunities: evolution,
    production_audit: productionAudit,
    structural_health: structuralHealth,
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
        'Structural health failures should be addressed before evolution steps.',
        'Production audit findings indicate real code issues — prioritize these.',
      ],
    },
    metadata: {
      signals_analyzed: summary.total_signals,
      findings_count: findings.length,
      proposals_count: existingProposals.length,
      audit_checks_run: fullAuditReport?.findings.length ?? 0,
      health_layers_checked: healthReport?.layers.length ?? 0,
      generation_ms: generationMs,
      sources: [
        'INTEL Aggregator',
        'ENGINEER Maintenance Node',
        'SEBA Evolution Signals',
        'Full Audit Runner',
        'Substrate Health Check',
        'AUDIT Compliance Ledger',
        'Diligence Harness',
      ],
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

function buildProductionAuditSection(report: AuditReport | null): UnifiedProposal['production_audit'] {
  if (!report) {
    return { passed: false, duration_ms: 0, fatal: 0, error: 0, warn: 0, info: 0, total_findings: 0, top_issues: [] };
  }
  
  // Surface the most actionable findings (fatal → error → warn)
  const topIssues: AuditSummaryItem[] = report.findings
    .filter(f => f.severity === 'fatal' || f.severity === 'error' || f.severity === 'warn')
    .sort((a, b) => {
      const order = { fatal: 0, error: 1, warn: 2, info: 3 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    })
    .slice(0, 15)
    .map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      title: f.title,
      detail: f.detail,
      hint: f.hint,
    }));
  
  return {
    passed: report.summary.passed,
    duration_ms: report.duration_ms,
    fatal: report.summary.fatal,
    error: report.summary.error,
    warn: report.summary.warn,
    info: report.summary.info,
    total_findings: report.summary.total,
    top_issues: topIssues,
  };
}

function buildStructuralHealthSection(report: HealthCheckReport | null): UnifiedProposal['structural_health'] {
  if (!report) {
    return { overall_verdict: 'FAIL', structural_issues: 0, layers_checked: 0, layers_passed: 0, layer_results: [], confirmations: ['Health check unavailable'] };
  }
  
  const layerResults: LayerSummary[] = report.layers.map(l => ({
    layer: l.layer,
    label: l.label,
    verdict: l.verdict,
    check_count: l.checks.length,
    failures: l.checks.filter(c => !c.pass).map(c => c.message),
  }));
  
  return {
    overall_verdict: report.overall_verdict,
    structural_issues: report.structural_issues,
    layers_checked: report.layers.length,
    layers_passed: report.layers.filter(l => l.verdict === 'PASS').length,
    layer_results: layerResults,
    confirmations: report.confirmation,
  };
}

function buildTechDebtSection(
  activeFindings: ReturnType<typeof engineerNode.getFindings>,
  criticalCards: IntelCard[],
  allCards: IntelCard[],
  auditReport: AuditReport | null,
  healthReport: HealthCheckReport | null,
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
  
  // From critical INTEL cards
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
  
  // ─── NEW: From Full Audit Runner findings ───
  if (auditReport) {
    for (const f of auditReport.findings) {
      if (f.severity === 'fatal' || f.severity === 'error') {
        // Don't duplicate items already captured from ENGINEER
        if (!critical.some(c => c.title === f.title)) {
          critical.push({
            id: f.id,
            title: f.title,
            description: f.detail,
            severity: f.severity,
            source: `AUDIT/${f.category}`,
            suggested_fix: f.hint || `Investigate and fix ${f.category} issue.`,
            affected_area: f.file || f.category,
          });
          patterns.add(f.category);
        }
      } else if (f.severity === 'warn') {
        if (!warnings.some(w => w.title === f.title)) {
          warnings.push({
            id: f.id,
            title: f.title,
            description: f.detail,
            severity: 'warn',
            source: `AUDIT/${f.category}`,
            suggested_fix: f.hint || `Review ${f.category} warning.`,
            affected_area: f.file || f.category,
          });
          patterns.add(f.category);
        }
      }
    }
  }
  
  // ─── NEW: From Substrate Health Check failures ───
  if (healthReport) {
    for (const layer of healthReport.layers) {
      for (const check of layer.checks) {
        if (!check.pass) {
          const existing = critical.some(c => c.title.includes(check.message));
          if (!existing) {
            critical.push({
              id: check.id,
              title: `Structural: ${check.message}`,
              description: check.detail || `Structural integrity failure in ${layer.label}.`,
              severity: 'error',
              source: `HEALTH/${layer.layer}`,
              suggested_fix: `Investigate structural issue in ${layer.label}. Fix root cause to restore integrity.`,
              affected_area: layer.label,
            });
            patterns.add(`structural-${layer.layer}`);
          }
        }
      }
    }
  }
  
  // Patterns from warning cards
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
  productionAudit: UnifiedProposal['production_audit'],
  structuralHealth: UnifiedProposal['structural_health'],
): ActionStep[] {
  const steps: ActionStep[] = [];
  let order = 1;
  
  // Priority 0: Structural failures (foundation must be stable)
  if (structuralHealth.overall_verdict === 'FAIL') {
    for (const layer of structuralHealth.layer_results.filter(l => l.verdict === 'FAIL')) {
      steps.push({
        order: order++,
        category: 'structural',
        title: `Fix structural failure: ${layer.label}`,
        description: `${layer.failures.length} check(s) failed in the ${layer.label} layer.`,
        risk: 'high',
        instructions: [
          `Layer: ${layer.layer} — ${layer.label}`,
          ...layer.failures.map(f => `FAIL: ${f}`),
          'Fix root cause before proceeding with other changes.',
          'Re-run substrate health check to verify fix.',
        ],
      });
    }
  }
  
  // Priority 1: Production audit fatal/error issues
  for (const issue of productionAudit.top_issues.filter(i => i.severity === 'fatal' || i.severity === 'error').slice(0, 5)) {
    steps.push({
      order: order++,
      category: 'production',
      title: `Audit: ${issue.title}`,
      description: issue.detail,
      risk: issue.severity === 'fatal' ? 'high' : 'medium',
      instructions: [
        `Category: ${issue.category}`,
        issue.hint || `Investigate the ${issue.category} issue and apply a fix.`,
        'Run the full audit again after fixing.',
        'If the fix is risky, test in isolation first.',
      ],
    });
  }
  
  // Priority 2: Critical tech debt (from ENGINEER + merged sources)
  for (const item of techDebt.critical.slice(0, 5)) {
    // Skip if already covered by structural or production steps
    if (steps.some(s => s.title.includes(item.title))) continue;
    steps.push({
      order: order++,
      category: 'tech-debt',
      title: `Fix: ${item.title}`,
      description: item.description,
      risk: 'high',
      instructions: [
        `Source: ${item.source} · Area: ${item.affected_area}`,
        item.suggested_fix,
        'Add error handling and input validation',
        'Run diligence battery to verify fix',
        'If regression occurs, revert the change immediately',
      ],
    });
  }
  
  // Priority 3: Diligence failures
  for (const failure of diligence.critical_failures.slice(0, 3)) {
    steps.push({
      order: order++,
      category: 'diligence',
      title: `Resolve: ${failure}`,
      description: `Diligence probe failure that must be addressed for system reliability.`,
      risk: 'medium',
      instructions: [
        'Review the failing diligence probe',
        'Identify root cause (missing handler, incorrect response shape, crash)',
        'Implement fix with proper error boundaries',
        'Re-run diligence to confirm resolution',
      ],
    });
  }
  
  // Priority 4: Production audit warnings
  for (const issue of productionAudit.top_issues.filter(i => i.severity === 'warn').slice(0, 3)) {
    steps.push({
      order: order++,
      category: 'production',
      title: `Warning: ${issue.title}`,
      description: issue.detail,
      risk: 'low',
      instructions: [
        `Category: ${issue.category}`,
        issue.hint || `Review and address the warning.`,
        'These are non-blocking but improve system quality.',
      ],
    });
  }
  
  // Priority 5: Audit gaps
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
  
  // Priority 6: Evolution opportunities (low risk first)
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
  
  // Priority 7: Medium-risk evolution
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
  productionAudit: UnifiedProposal['production_audit'],
  structuralHealth: UnifiedProposal['structural_health'],
): string {
  const parts: string[] = [];
  
  if (structuralHealth.overall_verdict === 'FAIL') {
    parts.push(`${structuralHealth.structural_issues} structural integrity failure(s)`);
  }
  if (productionAudit.fatal > 0 || productionAudit.error > 0) {
    parts.push(`${productionAudit.fatal + productionAudit.error} production audit issue(s)`);
  }
  if (techDebt.critical.length > 0) {
    parts.push(`${techDebt.critical.length} critical tech debt item(s)`);
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
    return 'System is healthy across all audit layers. No critical issues detected. Minor optimizations may be available.';
  }
  
  return `${parts.join(', ')}. Overall risk: ${risk}. This proposal merges 7 audit sources (SEBA, Full Audit, Substrate Health, Compliance Ledger, Diligence, ENGINEER, INTEL). Copy to your coding agent to apply fixes with human review at each step.`;
}
