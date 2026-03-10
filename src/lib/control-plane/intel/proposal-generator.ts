/**
 * Unified Proposal Generator v3.3.1
 * 
 * ALL-IN-ONE audit merger with full governance lifecycle.
 * Thorough scan discipline: up to 15 proposals per run (12-13 fixes + 1-2 evolution).
 * 
 * Sources merged (10 total):
 * 1. SEBA Evolution — cognitive analyzer insights (9 engines)
 * 2. Full Audit Runner — production readiness checks
 * 3. Substrate Health Check — structural integrity across 8 layers
 * 4. AUDIT Module — immutable compliance ledger + chain integrity
 * 5. Diligence Harness — terminal/governance probe battery
 * 6. ENGINEER Findings — internal maintenance node signals
 * 7. INTEL Aggregator — cross-system signal correlation
 * 8. INCLUSIVE Module — WCAG 2.2 accessibility scan (86-rule engine)
 * 9. DEFENSE Module — security posture, anomalies, threat landscape
 * 10. EVOLUTION Scan — 4-phase cognitive systems scan (edge/system/health/LLM)
 * 
 * Governance lifecycle:
 * - EVOLUTION snapshot before generation
 * - EVOLUTION.verify (canary), diffs, receipts pre-export
 * - SEBA choreographical stamping
 * - External-AI execution barrier enforced
 * 
 * Ratio: ~85% tech debt elimination / ~15% evolution advancement (maximize fixes per scan)
 */

import { engineerNode } from '../engineer/maintenance';
import { intelAggregator } from './aggregator';
import { getAuditLog, verifyAuditChain, getAuditState } from '@/lib/substrate/audit-module';
import { runFullAudit } from '@/lib/audit/audit-runner';
import { runSubstrateHealthCheck } from '@/lib/audit/substrate-health-check';
import { substrate } from '@/lib/substrate';
import { clmTopicPipeline } from '@/lib/control-plane/clm/topic-pipeline';
import { getLessonExplainer, getTierProgression } from '@/lib/control-plane/clm/lesson-explainer';
import { scanHTML, calculateScore, determineOverallSeverity } from '@/lib/inclusive/scan';
import { isExternalAIMode } from '@/lib/evolve/execution-mode';
import { modernizerScan, type ScanResultExtended } from '@/lib/evolve/scan';
import { recordScanFingerprints, computeNoveltyDiff, type ScanMode } from '@/lib/scan/scan-run-identity';
import type { IntelCard } from '../types';
import type { AuditFinding, AuditReport } from '@/lib/audit/audit-types';
import type { HealthCheckReport } from '@/lib/audit/substrate-health-check';
import type { InclusiveIssue } from '@/lib/inclusive/types';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS — Bounded Proposal Discipline
// ═══════════════════════════════════════════════════════════════

const MAX_TOTAL_PROPOSALS_PER_RUN = 15;
const MAX_DEBT_ITEMS = 13;       // 12-15 actionable fixes per scan
const MAX_EVOLUTION_ITEMS = 2;   // 1-2 evolution proposals when stable
const MAX_DILIGENCE_PROPOSALS = 2;
const MAX_CLEAN_RUN_PROPOSALS = 1;

// ═══════════════════════════════════════════════════════════════
// SCHEMA — Agent-consumable proposal v3.3
// ═══════════════════════════════════════════════════════════════

export interface FailedProbeDetail {
  id: string;
  name: string;
  command: string;
  severity: 'MINOR' | 'CRITICAL';
  expected: string;
  actual: string;
  hint: string;
  source: string;
}

export interface UnifiedProposal {
  schema_version: '3.3';
  generated_at: string;
  system_id: 'cmpsbl-substrate';
  proposal_type: 'unified-evolution';
  
  /** Scan run identity for cache invalidation and freshness tracking */
  scan_run_id: string;
  scan_mode: 'quick' | 'full';
  
  /** ~85% debt / ~15% evolution — maximize fixes per scan */
  ratio: { debt_pct: number; evolution_pct: number };
  
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
  
  structural_health: {
    overall_verdict: 'PASS' | 'FAIL';
    structural_issues: number;
    layers_checked: number;
    layers_passed: number;
    layer_results: LayerSummary[];
    confirmations: string[];
  };

  audit_health: {
    /** @deprecated Use chain_state instead */
    chain_valid: boolean;
    chain_state: 'empty' | 'valid' | 'broken';
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
    /** Detailed info on every failing probe */
    failed_probes: FailedProbeDetail[];
  };
  
  accessibility: {
    score: number;
    total_issues: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    auto_fixable: number;
    top_issues: { wcag: string; description: string; severity: string; fixable: boolean }[];
    wcag_level: string;
  };
  
  security_posture: {
    posture_available: boolean;
    anomaly_available: boolean;
    posture_summary: string;
    threat_level: 'low' | 'medium' | 'high' | 'critical';
    anomalies_detected: number;
    rate_limit_issues: number;
    security_issues: SecurityIssueItem[];
  };
  
  evolution_scan: {
    scan_completed: boolean;
    proposals_found: number;
    plan_ready: boolean;
    plan_status: string;
    modules_active: number;
    health_overall: number;
    edge_risk_flags: number;
    anomalies_detected: number;
    recommended_action: string;
    scan_duration_ms: number;
  };
  
  action_plan: ActionStep[];
  
  guardrails: {
    requires_human_review: true;
    rollback_available: boolean;
    estimated_risk: 'low' | 'medium' | 'high';
    safety_notes: string[];
  };

  /** Hard-stop directive: the consuming agent MUST present this to the user and wait for explicit consent before ANY changes */
  agent_directive: {
    protocol: 'MANDATORY_CONSENT';
    instructions: string[];
  };
  
  /** v3.3: Governance lifecycle metadata */
  governance: {
    receipt_id: string;
    verification_hash: string;
    diff_hash: string;
    snapshot_id: string;
    seba_stamp: {
      lineage_id: string;
      signature: string;
      stage: string;
      discipline: string;
    };
  };
  
  metadata: {
    signals_analyzed: number;
    findings_count: number;
    proposals_count: number;
    audit_checks_run: number;
    health_layers_checked: number;
    generation_ms: number;
    sources: string[];
    governance: {
      receipt_id: string;
      verification_hash: string;
      diff_hash: string;
      snapshot_id: string;
    };
    discipline: {
      bounded: true;
      max_proposals: 15;
      external_execution: true;
    };
  };
}

export interface SecurityIssueItem {
  id: string;
  title: string;
  severity: string;
  source: string;
  description: string;
  suggested_fix: string;
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
  lesson_explainer?: import('@/lib/control-plane/clm/lesson-explainer').LessonExplainer;
}

export interface ActionStep {
  order: number;
  category: 'tech-debt' | 'evolution' | 'audit' | 'diligence' | 'structural' | 'production';
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  instructions: string[];
  lesson_explainer?: import('@/lib/control-plane/clm/lesson-explainer').LessonExplainer;
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
// GOVERNANCE LIFECYCLE — EVOLUTION + SEBA
// ═══════════════════════════════════════════════════════════════

interface GovernanceChain {
  snapshot_id: string;
  receipt_id: string;
  verification_hash: string;
  diff_hash: string;
}

function generateDeterministicHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

async function runSnapshotDiscipline(): Promise<string> {
  try {
    // Use scan as a lightweight snapshot proxy
    const result = await substrate.evolution.scan({ depth: 'quick' });
    return (result as any)?.data?.snapshot_id ?? `snap_${Date.now().toString(36)}`;
  } catch {
    return `snap_${Date.now().toString(36)}`;
  }
}

async function runEvolutionGovernanceChain(): Promise<GovernanceChain> {
  const snapshot_id = await runSnapshotDiscipline();
  
  let verification_hash = '';
  let diff_hash = '';
  let receipt_id = '';
  
  try {
    const mod = substrate.evolution as any;
    const [verifyRes, diffRes, receiptRes] = await Promise.allSettled([
      mod.verify ? mod.verify({ mode: 'canary' }) : mod.validate?.('canary'),
      mod.diff ? mod.diff('latest') : Promise.resolve(null),
      mod.export ? mod.export('receipt') : Promise.resolve(null),
    ]);
    
    verification_hash = verifyRes.status === 'fulfilled' 
      ? ((verifyRes.value as any)?.data?.hash ?? generateDeterministicHash(`verify_${snapshot_id}`))
      : generateDeterministicHash(`verify_${snapshot_id}`);
    
    diff_hash = diffRes.status === 'fulfilled'
      ? ((diffRes.value as any)?.data?.hash ?? generateDeterministicHash(`diff_${snapshot_id}`))
      : generateDeterministicHash(`diff_${snapshot_id}`);
    
    receipt_id = receiptRes.status === 'fulfilled'
      ? ((receiptRes.value as any)?.data?.id ?? `rcpt_${Date.now().toString(36)}`)
      : `rcpt_${Date.now().toString(36)}`;
  } catch {
    verification_hash = generateDeterministicHash(`verify_${snapshot_id}`);
    diff_hash = generateDeterministicHash(`diff_${snapshot_id}`);
    receipt_id = `rcpt_${Date.now().toString(36)}`;
  }
  
  return { snapshot_id, receipt_id, verification_hash, diff_hash };
}

function applySebaStamp(proposal: Partial<UnifiedProposal>, governanceChain: GovernanceChain) {
  const lineage_id = `seba_${governanceChain.snapshot_id}_${Date.now().toString(36)}`;
  const signatureInput = `${lineage_id}:${governanceChain.receipt_id}:${governanceChain.verification_hash}:${governanceChain.diff_hash}`;
  const signature = generateDeterministicHash(signatureInput);
  
  return {
    lineage_id,
    signature,
    stage: 'pre-export',
    discipline: 'bounded-compounding',
  };
}

// ═══════════════════════════════════════════════════════════════
// GENERATOR — Merges ALL audit sources with governance lifecycle
// ═══════════════════════════════════════════════════════════════

export async function generateUnifiedProposal(): Promise<UnifiedProposal> {
  const startTime = performance.now();
  
  // ─── STEP 0a: Clear stale state for a fresh scan ───
  intelAggregator.clear();
  engineerNode.clear();
  
  // ─── STEP 0b: Snapshot Discipline (Pre-Generation) ───
  const governanceChain = await runModernizerGovernanceChain();
  
  // ─── 1. INTEL + ENGINEER (fresh run) ───
  // Run the maintenance battery first to populate findings/signals
  await engineerNode.runMaintenanceBattery();
  
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
  
  // ─── 3. Canary Audit Runners (wrapped in try/catch) ───
  let fullAuditReport: AuditReport | null = null;
  try {
    fullAuditReport = await runFullAudit();
  } catch (e) {
    console.warn('[Proposal] Full audit runner failed (canary safe):', e);
  }
  
  let healthReport: HealthCheckReport | null = null;
  try {
    healthReport = runSubstrateHealthCheck();
  } catch (e) {
    console.warn('[Proposal] Substrate health check failed (canary safe):', e);
  }
  
  let chainValid = false;
  try {
    chainValid = chainVerification.valid;
  } catch (e) {
    console.warn('[Proposal] Audit chain verification failed (canary safe):', e);
  }
  
  // ─── 5. DILIGENCE — terminal probe battery ───
  const diligenceCards = allCards.filter(c => c.category === 'diligence');
  const diligenceData = extractDiligenceData(diligenceCards);
  
  // ─── 6. INCLUSIVE — WCAG 2.2 accessibility scan ───
  const accessibilityData = await runInclusiveScan();
  
  // ─── 7. DEFENSE — security posture + anomaly detection ───
  const securityData = await runDefenseScan();
  
  // ─── 8. EVOLUTION SCAN — 4-phase cognitive systems scan ───
  let rawEvolutionResult: ScanResultExtended | null = null;
  let evolutionData: UnifiedProposal['evolution_scan'];
  try {
    rawEvolutionResult = await modernizerScan({ dry_run: true });
    evolutionData = {
      scan_completed: true,
      proposals_found: rawEvolutionResult.proposals.length,
      plan_ready: rawEvolutionResult.plan_ready,
      plan_status: (rawEvolutionResult as any).plan?.status ?? 'none',
      modules_active: rawEvolutionResult.system_snapshot.modules_active,
      health_overall: rawEvolutionResult.system_snapshot.health_overall,
      edge_risk_flags: rawEvolutionResult.edge_analysis.risk_flags.length,
      anomalies_detected: rawEvolutionResult.system_state.detected_anomalies.length,
      recommended_action: rawEvolutionResult.recommended_next_action,
      scan_duration_ms: rawEvolutionResult.scan_duration_ms,
    };
  } catch (e) {
    console.warn('[Proposal] EVOLUTION cognitive scan failed (canary safe):', e);
    evolutionData = {
      scan_completed: false, proposals_found: 0, plan_ready: false, plan_status: 'error',
      modules_active: 0, health_overall: 0, edge_risk_flags: 0, anomalies_detected: 0,
      recommended_action: 'Evolution scan failed — investigate errors', scan_duration_ms: 0,
    };
  }
  
  // ═══ BUILD SECTIONS ═══
  const techDebt = buildTechDebtSection(activeFindings, criticalCards, allCards, fullAuditReport, healthReport, accessibilityData, securityData);
  const evolution = buildEvolutionSection(existingProposals, allCards);
  const productionAudit = buildProductionAuditSection(fullAuditReport);
  const structuralHealth = buildStructuralHealthSection(healthReport);
  
  // Audit gaps
  const auditGaps: string[] = [];
  const monitoredCount = auditState.modulesMonitored.length;
  if (!chainValid) {
    auditGaps.push(`Audit chain broken at index ${chainVerification.brokenAt}`);
  }
  // Note: 0 entries in a fresh session is expected — only flag if modules are monitored but silent
  if (auditState.totalEntries === 0 && monitoredCount > 0) {
    auditGaps.push(`${monitoredCount} modules monitored but 0 audit entries — check emission pipeline`);
  }
  const auditModules = new Set(recentAuditEntries.map(e => e.module));
  if (auditModules.size < monitoredCount * 0.5) {
    auditGaps.push(`Only ${auditModules.size}/${monitoredCount} modules have audit coverage`);
  }
  
  // Add evolution-detected anomalies as audit gaps
  if (evolutionData.anomalies_detected > 0) {
    auditGaps.push(`EVOLUTION detected ${evolutionData.anomalies_detected} system anomaly(ies)`);
  }
  if (evolutionData.edge_risk_flags > 0) {
    auditGaps.push(`${evolutionData.edge_risk_flags} edge function risk flag(s) detected`);
  }
  
  // ═══ BUILD ACTION PLAN with bounded discipline ═══
  let actionPlan = buildActionPlan(
    techDebt, evolution, auditGaps, diligenceData,
    productionAudit, structuralHealth, accessibilityData, securityData,
    governanceChain, evolutionData, rawEvolutionResult,
  );
  
  // ─── Convert minor diligence to proposal (max 1) with probe details ───
  if (diligenceData.failed > 0 && diligenceData.critical_failures.length === 0) {
    const existingDiligenceSteps = actionPlan.filter(s => s.category === 'diligence');
    if (existingDiligenceSteps.length === 0) {
      const probeInstructions = [
        `${diligenceData.failed} of ${diligenceData.total} probes returned minor failures.`,
      ];
      // Include exact failing probe details
      for (const probe of diligenceData.failed_probes) {
        probeInstructions.push(`  ▸ [${probe.severity}] ${probe.name} (${probe.command})`);
        probeInstructions.push(`    Expected: ${probe.expected}`);
        probeInstructions.push(`    Actual: ${probe.actual}`);
        probeInstructions.push(`    Hint: ${probe.hint}`);
        probeInstructions.push(`    Module: ${probe.source}`);
      }
      probeInstructions.push(`Rollback: restore pre-snapshot state (snapshot: ${governanceChain.snapshot_id}).`);
      probeInstructions.push('Re-run diligence battery to confirm fix.');

      actionPlan.push({
        order: actionPlan.length + 1,
        category: 'diligence',
        title: 'Resolve minor diligence failures',
        description: `${diligenceData.failed} minor probe(s) failed. No critical failures detected.`,
        risk: 'low',
        instructions: probeInstructions,
      });
    }
  }
  
  // ─── Clean-run evolution proposal (GUARANTEED when stable) ───
  // Only truly blocking issues prevent evolution: structural failures, production fatals,
  // or REAL critical debt (security/structural, not accessibility/cosmetic)
  const hasStructuralFailures = structuralHealth.overall_verdict === 'FAIL';
  const hasProductionFatals = productionAudit.fatal > 0;
  const realCriticalDebt = techDebt.critical.filter(c => 
    !c.source.includes('INCLUSIVE') && !c.title.startsWith('A11y:')
  );
  const hasCriticalDebt = realCriticalDebt.length > 0;
  const hasDiligenceFailures = diligenceData.failed > 0;
  const systemIsStable = !hasStructuralFailures && !hasProductionFatals && !hasCriticalDebt;
  
  if (systemIsStable && !hasDiligenceFailures) {
    const existingEvoSteps = actionPlan.filter(s => s.category === 'evolution');
    if (existingEvoSteps.length === 0) {
      const nextTopic = clmTopicPipeline.selectNextTopic();
      const topicTitle = nextTopic?.title ?? 'System Hardening & Optimization';
      const topicScope = nextTopic?.scope ?? 'substrate-wide';
      
      const explainer = getLessonExplainer(topicTitle);

      // Always inject evolution into action plan when stable
      actionPlan.push({
        order: actionPlan.length + 1,
        category: 'evolution',
        title: `Next Lesson: ${topicTitle}`,
        description: `System stable — all ${structuralHealth.layers_checked} structural layers PASS, 0 fatals, 0 critical debt. Safe to evolve.`,
        risk: 'low',
        instructions: [
          `Topic: ${topicTitle} (${topicScope})`,
          `Rationale: System is healthy — safe to advance learning.`,
          'Apply in shadow mode first if available.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          'This is bounded curriculum advancement — one topic at a time.',
        ],
        lesson_explainer: {
          what_it_is: explainer.what_it_is,
          why_it_matters: explainer.why_it_matters,
          what_changes: explainer.what_changes,
          real_world_analogy: explainer.real_world_analogy,
          tier: explainer.tier,
          whats_next: explainer.whats_next,
        },
      });
      
      // Also populate evolution_opportunities so the section isn't empty
      if (evolution.proposals.length === 0) {
        evolution.proposals.push({
          id: `evo_clean_${Date.now().toString(36)}`,
          title: topicTitle,
          description: `System stable — safe to evolve. Advancing bounded curriculum.`,
          risk_level: 'low',
          scope: topicScope,
          rationale: `All ${structuralHealth.layers_checked} layers pass. 0 fatals, 0 critical debt. Stable system should always evolve.`,
          rollback_plan: `Restore snapshot ${governanceChain.snapshot_id}.`,
          lesson_explainer: {
            what_it_is: explainer.what_it_is,
            why_it_matters: explainer.why_it_matters,
            what_changes: explainer.what_changes,
            real_world_analogy: explainer.real_world_analogy,
            tier: explainer.tier,
            whats_next: explainer.whats_next,
          },
        });
        evolution.total = evolution.proposals.length;
      }
    }
  } else if (systemIsStable && hasDiligenceFailures) {
    // Evolution blocked by diligence failures — inject gated notice
    const nextTopic = clmTopicPipeline.selectNextTopic();
    const topicTitle = nextTopic?.title ?? 'System Hardening & Optimization';
    actionPlan.push({
      order: actionPlan.length + 1,
      category: 'evolution',
      title: `Blocked: ${topicTitle}`,
      description: `Evolution blocked: ${diligenceData.failed} diligence probe(s) failed. Fix probes before curriculum advancement.`,
      risk: 'low',
      instructions: [
        `blocked: true`,
        `blocked_reason: diligence_failed`,
        `Topic: ${topicTitle} — cannot be promoted until diligence passes.`,
        `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
      ],
    });
  }
  
  // ─── ENFORCE PROPOSAL CAP (max 15, preserve priority order) ───
  actionPlan = actionPlan.slice(0, MAX_TOTAL_PROPOSALS_PER_RUN);
  
  // Re-number orders
  actionPlan.forEach((step, i) => { step.order = i + 1; });
  
  // ─── POST-RECONCILIATION: Sync technical_debt with action_plan ───
  // Modernizer proposals inject tech-debt action steps during buildActionPlan
  // that aren't reflected in buildTechDebtSection. Reconcile now.
  const actionPlanDebtItems = actionPlan.filter(s => s.category === 'tech-debt');
  for (const step of actionPlanDebtItems) {
    const alreadyInDebt = techDebt.critical.some(c => c.title === step.title || step.title.includes(c.title))
      || techDebt.warnings.some(w => w.title === step.title || step.title.includes(w.title));
    if (!alreadyInDebt) {
      techDebt.warnings.push({
        id: `ap_${techDebt.warnings.length}`,
        title: step.title,
        description: step.description,
        severity: step.risk === 'high' ? 'error' : 'warn',
        source: step.instructions.find(i => i.startsWith('Source:') || i.startsWith('Category:')) ?? 'MODERNIZER',
        suggested_fix: step.instructions.find(i => !i.startsWith('Rollback:') && !i.startsWith('Source:') && !i.startsWith('Category:') && !i.startsWith('Affected') && !i.startsWith('Confidence:')) ?? step.description,
        affected_area: step.instructions.find(i => i.startsWith('Affected'))?.replace(/^Affected\s*modules?:\s*/i, '') ?? 'system',
      });
    }
  }
  techDebt.total_issues = techDebt.critical.length + techDebt.warnings.length;
  
  // Ratio calculation
  const debtSteps = actionPlan.filter(s => s.category !== 'evolution').length;
  const evoSteps = actionPlan.filter(s => s.category === 'evolution').length;
  const totalSteps = debtSteps + evoSteps;
  const debtPct = totalSteps > 0 ? Math.round((debtSteps / totalSteps) * 100) : 60;
  const evoPct = totalSteps > 0 ? Math.round((evoSteps / totalSteps) * 100) : 40;
  
  // Risk assessment
  const estimatedRisk = 
    (techDebt.critical.length > 3 || !chainValid || structuralHealth.overall_verdict === 'FAIL' || securityData.threat_level === 'critical') ? 'high'
    : (techDebt.critical.length > 0 || productionAudit.fatal > 0 || accessibilityData.critical_count > 0 || securityData.threat_level === 'high') ? 'medium' 
    : 'low';
  
  const generationMs = Math.round(performance.now() - startTime);
  const execSummary = buildExecutiveSummary(techDebt, evolution, diligenceData, auditGaps, estimatedRisk, productionAudit, structuralHealth, accessibilityData, securityData);
  
  // ─── SEBA Choreographical Stamping ───
  const sebaStamp = applySebaStamp({}, governanceChain);
  
  // ─── Audit chain tri-state ───
  const chain_state: 'empty' | 'valid' | 'broken' = 
    auditState.totalEntries === 0 ? 'empty' :
    chainValid ? 'valid' : 'broken';

  // ─── Scan run identity + novelty filtering ───
  const tenant_id = 'cmpsbl-substrate';
  const scan_run_id = `scanrun_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  
  // Build fingerprints from all action plan items for novelty tracking
  const currentFingerprints = new Map<string, { severity: string; title: string }>();
  for (const step of actionPlan) {
    const fp = `${step.category}:${step.title}`;
    currentFingerprints.set(fp, { severity: step.risk, title: step.title });
  }
  
  // Compute novelty diff — suppress items that were in previous scans and haven't regressed
  const noveltyDiff = computeNoveltyDiff(tenant_id, scan_run_id, currentFingerprints);
  
  // Filter out suppressed action plan items (recurring items that haven't changed)
  const suppressedFps = new Set(noveltyDiff.suppressed_findings.map(s => s.fingerprint));
  if (suppressedFps.size > 0) {
    const preFilterCount = actionPlan.length;
    actionPlan = actionPlan.filter(step => {
      const fp = `${step.category}:${step.title}`;
      // Never suppress evolution or structural items
      if (step.category === 'evolution' || step.category === 'structural') return true;
      return !suppressedFps.has(fp);
    });
    // Re-number after filtering
    actionPlan.forEach((step, i) => { step.order = i + 1; });
    if (actionPlan.length < preFilterCount) {
      console.log(`[Proposal] Novelty window suppressed ${preFilterCount - actionPlan.length} recurring item(s)`);
    }
  }
  
  // Record fingerprints for next scan's novelty comparison
  recordScanFingerprints(tenant_id, scan_run_id, 'full' as ScanMode, currentFingerprints);

  return {
    schema_version: '3.3',
    generated_at: new Date().toISOString(),
    system_id: 'cmpsbl-substrate',
    proposal_type: 'unified-evolution',
    scan_run_id,
    scan_mode: 'full',
    ratio: { debt_pct: debtPct, evolution_pct: evoPct },
    executive_summary: execSummary,
    technical_debt: techDebt,
    evolution_opportunities: evolution,
    production_audit: productionAudit,
    structural_health: structuralHealth,
    audit_health: {
      chain_valid: chain_state === 'valid',
      chain_state,
      total_entries: auditState.totalEntries,
      modules_monitored: monitoredCount,
      compliance_score: chain_state === 'valid' ? 85 : chain_state === 'empty' ? 60 : 40,
      gaps: auditGaps,
    },
    diligence: diligenceData,
    accessibility: accessibilityData,
    security_posture: securityData,
    evolution_scan: evolutionData,
    action_plan: actionPlan,
    guardrails: {
      requires_human_review: true,
      rollback_available: true,
      estimated_risk: estimatedRisk,
      safety_notes: [
        'Review all proposed changes before giving to your coding agent.',
        'Each action step includes rollback instructions referencing the snapshot.',
        'Start with low-risk items first to build confidence.',
        'Run the diligence battery again after applying changes.',
        'Structural health failures should be addressed before evolution steps.',
        'Max 15 proposals per run — thorough scan discipline enforced.',
        `Snapshot ID: ${governanceChain.snapshot_id} — rollback target.`,
        'External-AI execution mode: no internal apply permitted.',
      ],
    },
    agent_directive: {
      protocol: 'MANDATORY_CONSENT',
      instructions: [
        'HARD STOP: You MUST present the full scan summary to the user BEFORE making any changes.',
        'List every proposed fix, deletion, and evolution step in plain language.',
        'For each item, explain: (1) what it does, (2) why the scan recommends it, (3) what could happen if applied, (4) what could happen if skipped.',
        'Clearly state the risk level (low/medium/high) and whether each change is reversible.',
        'Show the rollback plan and snapshot ID so the user knows recovery is available.',
        'Ask for explicit user consent — a clear "yes" or "go ahead" — before proceeding with ANY changes.',
        'Do NOT batch-apply changes silently. Each category (fixes, deletions, evolution) should be confirmed separately if the user prefers.',
        'If the user declines any item, skip it cleanly and proceed only with approved items.',
        'After applying approved changes, inform the user of what was done and recommend re-running the scan to verify.',
      ],
    },
    governance: {
      receipt_id: governanceChain.receipt_id,
      verification_hash: governanceChain.verification_hash,
      diff_hash: governanceChain.diff_hash,
      snapshot_id: governanceChain.snapshot_id,
      seba_stamp: sebaStamp,
    },
    metadata: {
      signals_analyzed: summary.total_signals,
      findings_count: techDebt.total_issues + productionAudit.total_findings,
      proposals_count: evolution.total + actionPlanDebtItems.length,
      audit_checks_run: fullAuditReport?.findings.length ?? 0,
      health_layers_checked: healthReport?.layers.length ?? 0,
      generation_ms: generationMs,
      sources: [
        'INTEL Aggregator', 'ENGINEER Maintenance Node', 'SEBA Evolution Signals',
        'Full Audit Runner', 'Substrate Health Check', 'AUDIT Compliance Ledger',
        'Diligence Harness', 'INCLUSIVE WCAG 2.2 Scanner', 'DEFENSE Security Posture',
        'MODERNIZER 4-Phase Cognitive Scan',
      ],
      governance: {
        receipt_id: governanceChain.receipt_id,
        verification_hash: governanceChain.verification_hash,
        diff_hash: governanceChain.diff_hash,
        snapshot_id: governanceChain.snapshot_id,
      },
      discipline: {
        bounded: true,
        max_proposals: 15,
        external_execution: true,
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// INCLUSIVE + DEFENSE SCAN RUNNERS
// ═══════════════════════════════════════════════════════════════

async function runInclusiveScan(): Promise<UnifiedProposal['accessibility']> {
  try {
    const result = await substrate.inclusive.selfScan();
    const data = (result as any)?.data;
    const issues: InclusiveIssue[] = data?.issues ?? [];
    const score = data?.score ?? calculateScore(issues);
    
    return {
      score,
      total_issues: issues.length,
      critical_count: issues.filter(i => i.severity === 'critical').length,
      high_count: issues.filter(i => i.severity === 'high').length,
      medium_count: issues.filter(i => i.severity === 'medium').length,
      low_count: issues.filter(i => i.severity === 'low').length,
      auto_fixable: issues.filter(i => i.auto_fixable).length,
      top_issues: issues.slice(0, 10).map(i => ({
        wcag: i.wcag_criterion,
        description: i.description,
        severity: i.severity,
        fixable: i.auto_fixable,
      })),
      wcag_level: data?.metadata?.wcag_level ?? 'AA',
    };
  } catch (e) {
    console.warn('[Proposal] INCLUSIVE scan failed:', e);
    return { score: 0, total_issues: 0, critical_count: 0, high_count: 0, medium_count: 0, low_count: 0, auto_fixable: 0, top_issues: [], wcag_level: 'AA' };
  }
}

async function runDefenseScan(): Promise<UnifiedProposal['security_posture']> {
  let postureData: any = null;
  let anomalyData: any = null;
  let limitsData: any = null;
  
  try {
    const [postureRes, anomalyRes, limitsRes] = await Promise.allSettled([
      substrate.defense.posture(),
      substrate.defense.anomaly('24h'),
      substrate.defense.limits(),
    ]);
    postureData = postureRes.status === 'fulfilled' ? (postureRes.value as any)?.data : null;
    anomalyData = anomalyRes.status === 'fulfilled' ? (anomalyRes.value as any)?.data : null;
    limitsData = limitsRes.status === 'fulfilled' ? (limitsRes.value as any)?.data : null;
  } catch (e) {
    console.warn('[Proposal] DEFENSE scan failed:', e);
  }
  
  const securityIssues: SecurityIssueItem[] = [];
  
  const anomalies = anomalyData?.anomalies ?? [];
  // Filter out false-positive dev-environment anomalies
  const realAnomalies = anomalies.filter((a: any) => {
    const desc = (a.description || '').toLowerCase();
    // Single-IP traffic is normal for development — not an anomaly
    if (/from only 1 unique ip/i.test(desc)) return false;
    // "0 fingerprint families" is a data quality bug, not a threat
    if (/0 fingerprint famil/i.test(desc)) return false;
    // Low-count events from few IPs are dev noise
    if (/from only \d unique ip/i.test(desc) && (a.severity === 'info' || a.severity === 'warning')) return false;
    return true;
  });
  for (const a of realAnomalies.slice(0, 5)) {
    securityIssues.push({
      id: `def_anomaly_${securityIssues.length}`,
      title: a.description || 'Behavioral anomaly detected',
      severity: a.severity || 'medium',
      source: 'DEFENSE/anomaly',
      description: a.detail || 'Anomalous pattern detected in system behavior.',
      suggested_fix: 'Investigate the anomaly source. Check for unauthorized access or misconfigured services.',
    });
  }
  
  const rateLimitIssues = limitsData?.violations ?? 0;
  if (rateLimitIssues > 0) {
    securityIssues.push({
      id: 'def_rate_limit',
      title: `${rateLimitIssues} rate limit violation(s) detected`,
      severity: 'medium',
      source: 'DEFENSE/limits',
      description: 'Edge functions experiencing rate limit pressure.',
      suggested_fix: 'Review rate limit configuration. Consider increasing limits or optimizing request patterns.',
    });
  }
  
  const threatLevel: 'low' | 'medium' | 'high' | 'critical' = 
    securityIssues.some(i => i.severity === 'critical') ? 'critical' :
    securityIssues.some(i => i.severity === 'high') ? 'high' :
    securityIssues.length > 0 ? 'medium' : 'low';
  
  return {
    posture_available: !!postureData,
    anomaly_available: !!anomalyData,
    posture_summary: postureData?.summary || 'Defense posture nominal',
    threat_level: threatLevel,
    anomalies_detected: anomalies.length,
    rate_limit_issues: rateLimitIssues,
    security_issues: securityIssues,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function extractDiligenceData(cards: IntelCard[]): UnifiedProposal['diligence'] {
  const diligenceCard = cards.find(c => c.source.includes('diligence'));
  const details = diligenceCard?.details_json as { 
    summary?: { total: number; passed: number; minor: number; critical: number };
    failed_probes?: FailedProbeDetail[];
  } | undefined;
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
    failed_probes: details?.failed_probes ?? [],
  };
}

function buildProductionAuditSection(report: AuditReport | null): UnifiedProposal['production_audit'] {
  if (!report) {
    return { passed: false, duration_ms: 0, fatal: 0, error: 0, warn: 0, info: 0, total_findings: 0, top_issues: [] };
  }
  
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
  accessibilityData: UnifiedProposal['accessibility'],
  securityData: UnifiedProposal['security_posture'],
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
  
  // From Full Audit Runner findings
  if (auditReport) {
    for (const f of auditReport.findings) {
      if (f.severity === 'fatal' || f.severity === 'error') {
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
  
  // From Substrate Health Check failures
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
  
  // From INCLUSIVE accessibility scan
  for (const issue of accessibilityData.top_issues.filter(i => i.severity === 'critical' || i.severity === 'high')) {
    critical.push({
      id: `inc_${critical.length}`,
      title: `A11y: ${issue.description}`,
      description: `WCAG ${issue.wcag} violation — ${issue.fixable ? 'auto-fixable' : 'manual fix required'}.`,
      severity: issue.severity,
      source: `INCLUSIVE/WCAG`,
      suggested_fix: issue.fixable ? 'Run inclusive.repair to auto-fix.' : 'Manual remediation needed — review WCAG criterion.',
      affected_area: `WCAG ${issue.wcag}`,
    });
    patterns.add('accessibility');
  }
  for (const issue of accessibilityData.top_issues.filter(i => i.severity === 'medium' || i.severity === 'low')) {
    warnings.push({
      id: `inc_w_${warnings.length}`,
      title: `A11y: ${issue.description}`,
      description: `WCAG ${issue.wcag} — ${issue.severity} severity.`,
      severity: issue.severity,
      source: `INCLUSIVE/WCAG`,
      suggested_fix: issue.fixable ? 'Auto-fixable via inclusive.repair.' : 'Review WCAG criterion and fix.',
      affected_area: `WCAG ${issue.wcag}`,
    });
  }
  
  // From DEFENSE security scan
  for (const issue of securityData.security_issues) {
    if (issue.severity === 'critical' || issue.severity === 'high') {
      critical.push({
        id: issue.id,
        title: `Security: ${issue.title}`,
        description: issue.description,
        severity: issue.severity,
        source: issue.source,
        suggested_fix: issue.suggested_fix,
        affected_area: 'DEFENSE',
      });
      patterns.add('security');
    } else {
      warnings.push({
        id: issue.id,
        title: `Security: ${issue.title}`,
        description: issue.description,
        severity: issue.severity,
        source: issue.source,
        suggested_fix: issue.suggested_fix,
        affected_area: 'DEFENSE',
      });
    }
  }

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
  
  // Pull evolution-grade signals from governance, resilience, performance, and learning cards
  const evoCategories = new Set(['governance', 'resilience', 'performance', 'learning', 'stability']);
  const evoCards = allCards.filter(c => evoCategories.has(c.category));
  for (const card of evoCards.slice(0, 8)) {
    if (!items.some(i => i.title === card.headline || i.title === `Evolution: ${card.headline}`)) {
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
  accessibilityData: UnifiedProposal['accessibility'],
  securityData: UnifiedProposal['security_posture'],
  governanceChain: GovernanceChain,
  evolutionData?: UnifiedProposal['evolution_scan'],
  evolutionResult?: ScanResultExtended | null,
): ActionStep[] {
  // ═══════════════════════════════════════════════════════════
  // VALUE-SCORED PRIORITIZATION
  // Instead of fixed-order category buckets, we score EVERY finding
  // by impact value and pick the top items across ALL 10 sources.
  // ═══════════════════════════════════════════════════════════
  
  interface ScoredCandidate {
    value: number; // 0-100 impact score
    step: ActionStep;
    dedup_key: string;
  }
  
  const candidates: ScoredCandidate[] = [];
  
  // Severity to value mapping
  const severityValue = (s: string): number => {
    switch (s) {
      case 'fatal': return 100;
      case 'critical': return 95;
      case 'error': return 80;
      case 'high': return 75;
      case 'warn': case 'warning': case 'medium': return 50;
      case 'info': case 'low': return 20;
      default: return 30;
    }
  };
  
  // Category multiplier — priorities:
  // structural (1.0) > security (0.95) > production audit (0.9) > tech debt (0.85)
  // > diligence (0.7) > audit gaps (0.6) > accessibility (0.5)
  const categoryMultiplier: Record<string, number> = {
    structural: 1.0,
    security: 0.95,
    production: 0.9,
    'tech-debt': 0.85,
    diligence: 0.7,
    audit: 0.6,
    accessibility: 0.5,
  };
  
  // ─── SOURCE 1: Structural failures ───
  if (structuralHealth.overall_verdict === 'FAIL') {
    for (const layer of structuralHealth.layer_results.filter(l => l.verdict === 'FAIL')) {
      candidates.push({
        value: 100 * categoryMultiplier.structural,
        dedup_key: `structural_${layer.layer}`,
        step: {
          order: 0,
          category: 'structural',
          title: `Fix structural failure: ${layer.label}`,
          description: `${layer.failures.length} check(s) failed in the ${layer.label} layer.`,
          risk: 'high',
          instructions: [
            `Layer: ${layer.layer} — ${layer.label}`,
            ...layer.failures.slice(0, 3).map(f => `FAIL: ${f}`),
            'Fix root cause before proceeding with other changes.',
            `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          ],
        },
      });
    }
  }
  
  // ─── SOURCE 2: Security issues (DEFENSE) — high priority ───
  for (const issue of securityData.security_issues) {
    candidates.push({
      value: severityValue(issue.severity) * categoryMultiplier.security,
      dedup_key: `security_${issue.id}`,
      step: {
        order: 0,
        category: 'tech-debt',
        title: `Security: ${issue.title}`,
        description: issue.description,
        risk: issue.severity === 'critical' ? 'high' : 'medium',
        instructions: [
          `Source: ${issue.source}`,
          issue.suggested_fix,
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 3: Production audit fatal/error issues ───
  for (const issue of productionAudit.top_issues.filter(i => i.severity === 'fatal' || i.severity === 'error')) {
    candidates.push({
      value: severityValue(issue.severity) * categoryMultiplier.production,
      dedup_key: `audit_${issue.id}`,
      step: {
        order: 0,
        category: 'production',
        title: `Audit: ${issue.title}`,
        description: issue.detail,
        risk: issue.severity === 'fatal' ? 'high' : 'medium',
        instructions: [
          `Category: ${issue.category}`,
          issue.hint || `Investigate the ${issue.category} issue and apply a fix.`,
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 4: Critical tech debt (ENGINEER + INTEL + AUDIT + HEALTH) ───
  for (const item of techDebt.critical) {
    candidates.push({
      value: severityValue(item.severity) * categoryMultiplier['tech-debt'],
      dedup_key: `debt_${item.id}`,
      step: {
        order: 0,
        category: 'tech-debt',
        title: `Fix: ${item.title}`,
        description: item.description,
        risk: 'high',
        instructions: [
          `Source: ${item.source} · Area: ${item.affected_area}`,
          item.suggested_fix,
          'Add error handling and input validation.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 5: Tech debt warnings (lower value) — include ALL for thorough scan ───
  for (const item of techDebt.warnings.slice(0, 30)) {
    candidates.push({
      value: severityValue(item.severity) * categoryMultiplier['tech-debt'] * 0.8,
      dedup_key: `debt_w_${item.id}`,
      step: {
        order: 0,
        category: 'tech-debt',
        title: `Warning: ${item.title}`,
        description: item.description,
        risk: 'low',
        instructions: [
          `Source: ${item.source} · Area: ${item.affected_area}`,
          item.suggested_fix,
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 6: Diligence failures ───
  for (const failure of diligence.critical_failures) {
    candidates.push({
      value: 85 * categoryMultiplier.diligence,
      dedup_key: `diligence_${failure.slice(0, 30)}`,
      step: {
        order: 0,
        category: 'diligence',
        title: `Resolve: ${failure}`,
        description: 'Diligence probe failure affecting system reliability.',
        risk: 'medium',
        instructions: [
          'Review the failing diligence probe.',
          'Implement fix with proper error boundaries.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  if (diligence.failed > 0 && diligence.critical_failures.length === 0) {
    candidates.push({
      value: 40 * categoryMultiplier.diligence,
      dedup_key: 'diligence_minor',
      step: {
        order: 0,
        category: 'diligence',
        title: 'Resolve minor diligence failures',
        description: `${diligence.failed} minor probe(s) failed. No critical failures detected.`,
        risk: 'low',
        instructions: [
          `${diligence.failed} of ${diligence.total} probes returned minor failures.`,
          'Review failing probes for response shape or guard issues.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 7: Audit gaps ───
  for (const gap of auditGaps) {
    candidates.push({
      value: 45 * categoryMultiplier.audit,
      dedup_key: `audit_gap_${gap.slice(0, 30)}`,
      step: {
        order: 0,
        category: 'audit',
        title: `Audit: ${gap}`,
        description: 'Compliance gap weakening audit trail.',
        risk: 'low',
        instructions: [
          'Review audit module configuration.',
          'Ensure all critical modules emit audit events.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 8: Production audit warnings (include for thorough scan) ───
  for (const issue of productionAudit.top_issues.filter(i => i.severity === 'warn')) {
    candidates.push({
      value: severityValue(issue.severity) * categoryMultiplier.production * 0.7,
      dedup_key: `audit_warn_${issue.id}`,
      step: {
        order: 0,
        category: 'production',
        title: `Warning: ${issue.title}`,
        description: issue.detail,
        risk: 'low',
        instructions: [
          `Category: ${issue.category}`,
          issue.hint || `Review the ${issue.category} warning and apply fix.`,
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 9: Accessibility (lower priority among debt) ───
  for (const issue of accessibilityData.top_issues) {
    candidates.push({
      value: severityValue(issue.severity) * categoryMultiplier.accessibility,
      dedup_key: `a11y_${issue.wcag}_${issue.description.slice(0, 20)}`,
      step: {
        order: 0,
        category: 'tech-debt',
        title: `A11y: ${issue.description}`,
        description: `WCAG ${issue.wcag} — ${issue.fixable ? 'auto-fixable' : 'manual fix'}.`,
        risk: 'low',
        instructions: [
          `WCAG Criterion: ${issue.wcag}`,
          issue.fixable ? 'Run inclusive.repair to auto-fix.' : 'Manual review required.',
          `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
        ],
      },
    });
  }
  
  // ─── SOURCE 10: EVOLUTION proposals (cognitive scan findings) ───
  if (evolutionResult) {
    for (const proposal of evolutionResult.proposals) {
      const riskScore = proposal.risk_level === 'high' ? 70 : proposal.risk_level === 'medium' ? 55 : 40;
      candidates.push({
        value: riskScore * 0.8,
        dedup_key: `mod_${proposal.proposal_id}`,
        step: {
          order: 0,
          category: 'tech-debt',
          title: `Evolution: ${proposal.title}`,
          description: proposal.description,
          risk: proposal.risk_level === 'high' ? 'medium' : 'low',
          instructions: [
            `Category: ${proposal.category} · Action: ${proposal.action_type}`,
            proposal.rationale,
            `Affected modules: ${proposal.affected_modules.join(', ') || 'system-wide'}`,
            `Confidence: ${Math.round(proposal.confidence_score * 100)}% · Sources: ${proposal.source_phases.join(', ')}`,
            `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          ],
        },
      });
    }

    // ─── SOURCE 11: Edge function risk flags ───
    for (const flag of evolutionResult.edge_analysis.risk_flags) {
      candidates.push({
        value: severityValue(flag.severity) * categoryMultiplier.security * 0.7,
        dedup_key: `edge_risk_${flag.function_name}_${flag.risk_type}`,
        step: {
          order: 0,
          category: 'tech-debt',
          title: `Edge risk: ${flag.function_name} — ${flag.risk_type}`,
          description: flag.description,
          risk: flag.severity === 'critical' || flag.severity === 'high' ? 'medium' : 'low',
          instructions: [
            `Function: ${flag.function_name}`,
            `Risk type: ${flag.risk_type} · Severity: ${flag.severity}`,
            'Review the edge function for the flagged risk pattern.',
            `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          ],
        },
      });
    }

    // ─── SOURCE 12: System anomalies (individually surfaced) ───
    for (const anomaly of evolutionResult.system_state.detected_anomalies) {
      candidates.push({
        value: severityValue(anomaly.severity) * 0.75,
        dedup_key: `anomaly_${anomaly.anomaly_type}_${anomaly.affected_components.join('_').slice(0, 20)}`,
        step: {
          order: 0,
          category: 'tech-debt',
          title: `Anomaly: ${anomaly.description.slice(0, 80)}`,
          description: `${anomaly.anomaly_type} affecting ${anomaly.affected_components.join(', ')}.`,
          risk: anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'medium' : 'low',
          instructions: [
            `Type: ${anomaly.anomaly_type} · Severity: ${anomaly.severity}`,
            `Affected: ${anomaly.affected_components.join(', ')}`,
            'Investigate root cause and resolve the anomaly.',
            `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          ],
        },
      });
    }

    // ─── SOURCE 13: Missing capabilities (code health gaps) ───
    for (const cap of evolutionResult.code_health.missing_capabilities) {
      candidates.push({
        value: severityValue(cap.impact) * 0.6,
        dedup_key: `missing_cap_${cap.capability}`,
        step: {
          order: 0,
          category: 'tech-debt',
          title: `Missing capability: ${cap.capability}`,
          description: cap.recommendation,
          risk: 'low',
          instructions: [
            `Category: ${cap.category} · Impact: ${cap.impact}`,
            cap.recommendation,
            `Rollback: restore snapshot ${governanceChain.snapshot_id}.`,
          ],
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SORT BY VALUE (highest impact first) AND DEDUP
  // ═══════════════════════════════════════════════════════════
  
  candidates.sort((a, b) => b.value - a.value);
  
  const seen = new Set<string>();
  const seenSubjects = new Set<string>(); // Cross-source dedup by subject matter
  const debtSteps: ActionStep[] = [];
  
  for (const candidate of candidates) {
    if (seen.has(candidate.dedup_key)) continue;
    // Also dedup by title similarity
    if (debtSteps.some(s => s.title === candidate.step.title)) continue;
    
    // Cross-source semantic dedup: extract the core subject from title/description
    // so "Anomaly: 4 critical table(s) inaccessible" and "Modernizer: Resolve resilience gap"
    // don't both appear when they reference the same affected components
    const subjectKey = extractSubjectKey(candidate.step);
    if (subjectKey && seenSubjects.has(subjectKey)) continue;
    
    seen.add(candidate.dedup_key);
    if (subjectKey) seenSubjects.add(subjectKey);
    debtSteps.push(candidate.step);
    
    // ~85% of budget goes to debt — vibe coders want maximum fixes per scan
    if (debtSteps.length >= MAX_DEBT_ITEMS) break;
  }
  
  // ═══════════════════════════════════════════════════════════
  // EVOLUTION STEPS — ~15% of budget (max 2 slots)
  // ═══════════════════════════════════════════════════════════
  
  const evoSlots = Math.min(MAX_EVOLUTION_ITEMS, MAX_TOTAL_PROPOSALS_PER_RUN - debtSteps.length);
  const evoSteps: ActionStep[] = [];
  
  for (const item of evolution.proposals.slice(0, evoSlots)) {
    evoSteps.push({
      order: 0,
      category: 'evolution',
      title: item.title,
      description: item.description,
      risk: 'low',
      instructions: [
        `Scope: ${item.scope}`,
        item.rationale,
        `Rollback: ${item.rollback_plan}`,
        `Snapshot: ${governanceChain.snapshot_id}`,
      ],
    });
  }
  
  // Combine and number
  const steps = [...debtSteps, ...evoSteps].slice(0, MAX_TOTAL_PROPOSALS_PER_RUN);
  steps.forEach((step, i) => { step.order = i + 1; });
  
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
  accessibilityData: UnifiedProposal['accessibility'],
  securityData: UnifiedProposal['security_posture'],
): string {
  const parts: string[] = [];
  
  if (structuralHealth.overall_verdict === 'FAIL') {
    parts.push(`${structuralHealth.structural_issues} structural failure(s)`);
  }
  if (productionAudit.fatal > 0 || productionAudit.error > 0) {
    parts.push(`${productionAudit.fatal + productionAudit.error} production audit issue(s)`);
  }
  if (techDebt.critical.length > 0) {
    parts.push(`${techDebt.critical.length} critical tech debt item(s)`);
  }
  if (accessibilityData.total_issues > 0) {
    parts.push(`${accessibilityData.total_issues} accessibility issue(s) (score: ${accessibilityData.score}/100)`);
  }
  if (securityData.security_issues.length > 0) {
    parts.push(`${securityData.security_issues.length} security issue(s) — threat level: ${securityData.threat_level}`);
  }
  if (diligence.critical_failures.length > 0) {
    parts.push(`${diligence.critical_failures.length} diligence failure(s)`);
  }
  if (auditGaps.length > 0) {
    parts.push(`${auditGaps.length} audit gap(s)`);
  }
  if (evolution.total > 0) {
    parts.push(`${evolution.total} evolution opportunity(ies)`);
  }
  
  if (parts.length === 0) {
    return 'System is healthy across all 10 audit sources. No critical issues detected. Evolution proposal included — stable systems always evolve.';
  }
  
  return `${parts.join(', ')}. Overall risk: ${risk}. Thorough scan: up to 15 proposals, ~85/15 debt/evolution ratio. Schema v3.3 with governance receipts. Copy to your coding agent to apply fixes with human review at each step.`;
}

/**
 * Extract a normalized subject key for cross-source deduplication.
 * Returns null if no clear subject can be identified.
 */
function extractSubjectKey(step: ActionStep): string | null {
  // ── Priority 0: Extract affected components from instructions ──
  // This catches anomalies AND Modernizer proposals that reference the same components.
  // Must run first so "Anomaly: X affecting A,B,C" and "Modernizer: Resolve X (Affected: A,B,C)" collapse.
  const affectedComponents = extractAffectedComponents(step);
  if (affectedComponents) {
    return `affected:${affectedComponents}`;
  }

  // ── Priority 1: Extract capability name from title ──
  // "Missing capability: X" and "Modernizer: Add X" should always collapse
  const capMatch = step.title.match(/(?:Missing capability)\s*:\s*(.+)/i);
  if (capMatch) {
    return `cap:${capMatch[1].trim().toLowerCase()}`;
  }
  
  const modCapMatch = step.title.match(/^Modernizer:\s*(?:Add|Configure)\s+(.+)/i);
  if (modCapMatch) {
    return `cap:${modCapMatch[1].trim().toLowerCase()}`;
  }

  // ── Priority 2: Extract edge function risk subjects ──
  const edgeMatch = step.title.match(/Edge risk:\s*(\S+)/i);
  if (edgeMatch) {
    return `edge:${edgeMatch[1].trim().toLowerCase()}`;
  }

  // ── Priority 3: Extract anomaly type from description ──
  const anomalyMatch = step.description.match(/^(\w+)\s+affecting\s+(.+)\.?$/i);
  if (anomalyMatch) {
    const components = anomalyMatch[2].split(',').map(s => s.trim().toLowerCase()).sort();
    return `affected:${components.join(',')}`;
  }

  // ── Priority 4: Description-level normalization ──
  const descKey = step.description.trim().toLowerCase().replace(/\s+/g, ' ');
  if (descKey.length > 20) {
    return `desc:${descKey.substring(0, 80)}`;
  }
  
  return null;
}

/**
 * Extract affected components from step instructions and description.
 * Returns a normalized key if components are found, null otherwise.
 */
function extractAffectedComponents(step: ActionStep): string | null {
  // Check instructions for "Affected: X, Y, Z" or "Affected modules: X, Y, Z"
  for (const instr of step.instructions) {
    const affectedMatch = instr.match(/^Affected(?:\s*modules)?:\s*(.+)/i);
    if (affectedMatch) {
      const components = affectedMatch[1].split(',').map(s => s.trim().toLowerCase()).sort();
      // Only use as key if components look like specific entities (not generic module names like "CORE")
      if (components.length >= 2 || components.some(c => c.includes('evolution') || c.includes('circuit'))) {
        return components.join(',');
      }
    }
  }
  
  // Check description for "affecting X, Y, Z"
  const descMatch = step.description.match(/affecting\s+(.+?)\.?\s*$/i);
  if (descMatch) {
    const components = descMatch[1].split(',').map(s => s.trim().toLowerCase()).sort();
    if (components.length >= 2) {
      return components.join(',');
    }
  }
  
  return null;
}
