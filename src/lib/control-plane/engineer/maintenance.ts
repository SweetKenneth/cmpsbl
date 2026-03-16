/**
 * ENGINEER — Internal Maintenance Node
 * 
 * Polls/queries the system for engine health, breaker state,
 * fallback coverage, error patterns, and regression signals.
 * 
 * Generates EngineerFindings and EngineerProposals.
 * Never directly modifies production behavior without human approval.
 * Sends findings to INTEL as IntelSignals.
 * 
 * NO user UI surface — feeds INTEL only.
 */

import type { EngineerFinding, EngineerProposal, ProposalStatus, FindingSeverity } from '../types';
import { intelAggregator } from '../intel/aggregator';

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY PERSISTENCE (session-scoped)
// ═══════════════════════════════════════════════════════════════════════════════

const findings: EngineerFinding[] = [];
const proposals: EngineerProposal[] = [];
let lastCheckTimestamp: string | null = null;
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINDING MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function addFinding(finding: Omit<EngineerFinding, 'id' | 'timestamp' | 'resolved'>): EngineerFinding {
  const full: EngineerFinding = {
    ...finding,
    id: genId('finding'),
    timestamp: new Date().toISOString(),
    resolved: false,
  };
  findings.push(full);
  
  // Emit to INTEL
  intelAggregator.ingest({
    source: `ENGINEER/${finding.source_node}`,
    category: mapFindingCategory(finding.category),
    severity: mapFindingSeverity(finding.severity),
    headline: finding.title,
    detail: finding.description,
    timestamp: full.timestamp,
    suggested_action: 'Review ENGINEER finding in INTEL Panel.',
    data: finding.evidence,
    fingerprint: `engineer:${finding.category}:${finding.title}`,
  });
  
  return full;
}

function resolveFinding(id: string): void {
  const f = findings.find(f => f.id === id);
  if (f) f.resolved = true;
}

function mapFindingCategory(cat: EngineerFinding['category']): 'health' | 'stability' | 'reliability' | 'resilience' {
  switch (cat) {
    case 'engine': return 'stability';
    case 'breaker': return 'resilience';
    case 'fallback': return 'resilience';
    case 'health': return 'health';
    case 'regression': return 'reliability';
    case 'error-pattern': return 'stability';
    case 'dependency': return 'reliability';
    default: return 'health';
  }
}

function mapFindingSeverity(sev: FindingSeverity): 'info' | 'warn' | 'critical' {
  switch (sev) {
    case 'critical': return 'critical';
    case 'high': return 'critical';
    case 'medium': return 'warn';
    case 'low': return 'info';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function createProposal(proposal: Omit<EngineerProposal, 'id' | 'status' | 'created_at'>): EngineerProposal {
  const full: EngineerProposal = {
    ...proposal,
    id: genId('proposal'),
    status: 'draft',
    created_at: new Date().toISOString(),
  };
  proposals.push(full);
  
  intelAggregator.ingest({
    source: 'ENGINEER',
    category: 'governance',
    severity: 'info',
    headline: `Proposal: ${proposal.title}`,
    detail: proposal.description,
    timestamp: full.created_at,
    suggested_action: `Review proposal (risk: ${proposal.risk_level}). Rollback: ${proposal.rollback_plan}`,
    data: { proposal_id: full.id, scope: proposal.scope },
    fingerprint: `proposal:${proposal.title}`,
  });
  
  return full;
}

function updateProposalStatus(id: string, status: ProposalStatus): void {
  const p = proposals.find(p => p.id === id);
  if (p) {
    // GOVERNANCE BARRIER: Block transition to 'applied' when in external-ai mode
    if (status === 'applied') {
      try {
        const { enforceExecutionBarrier, isExternalAIMode } = require('@/lib/evolve/execution-mode');
        if (isExternalAIMode()) {
          enforceExecutionBarrier('proposal_apply');
          return;
        }
      } catch { /* execution-mode not loaded yet */ }
    }
    p.status = status;
    if (status === 'reviewed') p.reviewed_at = new Date().toISOString();
    if (status === 'applied') p.applied_at = new Date().toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE BATTERY (non-destructive checks)
// ═══════════════════════════════════════════════════════════════════════════════

async function runMaintenanceBattery(): Promise<{
  findings_count: number;
  proposals_count: number;
  timestamp: string;
}> {
  const now = new Date().toISOString();
  lastCheckTimestamp = now;
  let newFindings = 0;
  let newProposals = 0;
  
  // Check 1: System health snapshot
  try {
    const { getCLMStatus } = await import('@/lib/substrate/clm');
    const clmStatus = getCLMStatus();
    
    if (clmStatus.kill_switch) {
      addFinding({
        category: 'health',
        severity: 'high',
        title: 'CLM Kill Switch Active',
        description: 'The Constant Learning Mode kill switch is engaged. No learning cycles are executing.',
        source_node: 'CLM',
        evidence: { kill_switch: true, budget_used: clmStatus.budget_used },
      });
      newFindings++;
      
      createProposal({
        finding_id: findings[findings.length - 1].id,
        title: 'Deactivate CLM Kill Switch',
        description: 'The kill switch may have been engaged during an incident. Verify system stability and deactivate.',
        risk_level: 'low',
        scope: 'CLM budget governor',
        rollback_plan: 'Re-engage kill switch via deactivateKillSwitch()',
      });
      newProposals++;
    }
    
    if (clmStatus.budget_total > 0 && clmStatus.budget_used >= clmStatus.budget_total * 0.9) {
      const pct = Math.round((clmStatus.budget_used / clmStatus.budget_total) * 100);
      addFinding({
        category: 'health',
        severity: 'medium',
        title: 'CLM Budget Nearly Exhausted',
        description: `Budget usage at ${pct}%.`,
        source_node: 'CLM',
        evidence: { used: clmStatus.budget_used, total: clmStatus.budget_total },
      });
      newFindings++;
    }
  } catch { /* CLM may not be initialized */ }
  
  // Check 2: Crown Jewel gate integrity
  try {
    const { getCrownJewelStats } = await import('@/lib/capabilities/crown-jewel-release-gate');
    const stats = getCrownJewelStats();
    
    intelAggregator.ingest({
      source: 'ENGINEER',
      category: 'crown-jewels',
      severity: 'info',
      headline: `Crown Jewels: ${stats.released} released, ${stats.gatekept} reserved`,
      detail: `${stats.packCount} packs with ${stats.totalPackComponents} total components.`,
      timestamp: now,
      data: stats,
      fingerprint: 'engineer:crown-jewel-status',
    });
  } catch { /* */ }
  
  // Check 3: Run diligence harness
  try {
    const { runDiligence } = await import('@/lib/diligence/run-diligence');
    const report = await runDiligence();
    
    intelAggregator.ingest({
      source: 'ENGINEER/diligence',
      category: 'diligence',
      severity: report.summary.critical > 0 ? 'critical' : 'info',
      headline: `Diligence: ${report.summary.passed}/${report.summary.total} passed`,
      detail: `${report.summary.critical} critical, ${report.summary.minor} minor issues.`,
      timestamp: now,
      data: { summary: report.summary },
      fingerprint: 'engineer:diligence-run',
    });
    
    if (report.summary.critical > 0) {
      for (const r of report.results.filter(r => r.severity === 'CRITICAL')) {
        addFinding({
          category: 'regression',
          severity: 'critical',
          title: `Diligence Failure: ${r.name}`,
          description: r.notes ?? `Command ${r.command} failed.`,
          source_node: 'DILIGENCE',
          evidence: { command: r.command, duration_ms: r.durationMs, response: r.responseShape },
        });
        newFindings++;
      }
    }
  } catch { /* diligence may fail gracefully */ }
  
  return { findings_count: newFindings, proposals_count: newProposals, timestamp: now };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════════

function startScheduler(intervalMs = 600_000): void {
  if (schedulerInterval) return;
  schedulerInterval = setInterval(() => {
    runMaintenanceBattery().catch(() => {});
  }, intervalMs);
}

function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export const engineerNode = {
  runMaintenanceBattery,
  addFinding,
  resolveFinding,
  createProposal,
  updateProposalStatus,
  startScheduler,
  stopScheduler,
  getFindings: (includeResolved = false) =>
    includeResolved ? [...findings] : findings.filter(f => !f.resolved),
  getProposals: (status?: ProposalStatus) =>
    status ? proposals.filter(p => p.status === status) : [...proposals],
  getStats: () => ({
    active_findings: findings.filter(f => !f.resolved).length,
    pending_proposals: proposals.filter(p => p.status === 'draft' || p.status === 'reviewed').length,
    resolved_this_period: findings.filter(f => f.resolved).length,
    last_check: lastCheckTimestamp,
  }),
  /** Clear all accumulated findings and proposals for a fresh scan */
  clear: () => {
    findings.length = 0;
    proposals.length = 0;
    lastCheckTimestamp = null;
  },
};
