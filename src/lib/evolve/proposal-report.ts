/**
 * Evolution Proposal Report — Agent-Consumable JSON Export
 * 
 * Deterministic, machine-readable, self-contained report schema
 * for external AI execution of evolution proposals.
 * 
 * The report includes structured `agent_briefing` instructions
 * that tell the consuming agent exactly how to present findings,
 * fixes, deletions, and evolution recommendations to the user.
 * 
 * No logs. No side effects. No mutations. Strict JSON only.
 */

import { engineerNode } from '@/lib/control-plane/engineer/maintenance';
import { intelAggregator } from '@/lib/control-plane/intel/aggregator';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// AGENT BRIEFING SCHEMA
// ═══════════════════════════════════════════════════════════════

export interface AgentAction {
  id: string;
  label: string;
  description: string;
  scope: string;
  reversible: boolean;
  risk_level: 'low' | 'medium' | 'high';
  affected_modules: string[];
  rollback_hint?: string;
}

export interface AgentBriefing {
  /** Opening statement the agent should use when presenting the report */
  preamble: string;

  /** Critical fixes the system requires — these resolve errors or degraded state */
  fixes: AgentAction[];

  /** Artifacts, dead code, or deprecated items to remove */
  deletions: AgentAction[];

  /** Evolution recommendations from the scan — system-suggested improvements */
  evolution_suggestions: AgentAction[];

  /** Agent's own evaluation — synthesized insight beyond raw scan data */
  agent_evaluation: {
    summary: string;
    benefits: string[];
    risks: string[];
    confidence: number;
  };

  /** Closing prompt the agent should use to request user consent */
  consent_prompt: string;

  /** Presentation template — how to structure the message to the user */
  presentation_template: string;
}

// ═══════════════════════════════════════════════════════════════
// REPORT SCHEMA
// ═══════════════════════════════════════════════════════════════

export interface EvolutionProposalReport {
  schema_version: '2.0';
  generated_at: string;
  system_id: 'cmpsbl-substrate';
  proposal: {
    id: string;
    title: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high';
    scope: string;
    rationale: string;
    affected_areas: string[];
    suggested_files?: string[];
    suggested_actions: string[];
    rollback_plan: string;
    test_requirements: string[];
  };
  context: {
    originating_findings: string[];
    related_signals: string[];
    mastery_state?: Record<string, unknown>;
  };
  guardrails: {
    destructive: boolean;
    requires_backup: boolean;
    requires_manual_review: true;
  };
  /** Structured instructions for the consuming agent */
  agent_briefing: AgentBriefing;
}

// ═══════════════════════════════════════════════════════════════
// SNAPSHOT DISCIPLINE
// ═══════════════════════════════════════════════════════════════

interface SnapshotCheck {
  exists: boolean;
  snapshot_id?: string;
  timestamp?: string;
}

function checkSystemSnapshot(): SnapshotCheck {
  const summary = intelAggregator.getSummary();
  const hasSignals = summary.total_signals > 0;
  
  if (hasSignals) {
    return {
      exists: true,
      snapshot_id: `snapshot-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
  
  return { exists: false };
}

// ═══════════════════════════════════════════════════════════════
// AGENT BRIEFING BUILDER
// ═══════════════════════════════════════════════════════════════

function buildAgentBriefing(
  proposal: { id: string; title: string; description: string; risk_level: string; scope: string; rollback_plan: string },
  findings: { id: string; title: string; description: string; severity: string; category: string; resolved: boolean }[],
  relatedSignals: string[],
): AgentBriefing {
  // Separate findings into fixes vs deletions vs evolution
  const unresolvedFindings = findings.filter(f => !f.resolved);
  
  const fixes: AgentAction[] = unresolvedFindings
    .filter(f => ['critical', 'high'].includes(f.severity) || ['engine', 'breaker', 'error-pattern'].includes(f.category))
    .map((f, i) => ({
      id: `fix-${i + 1}`,
      label: f.title,
      description: f.description,
      scope: f.category,
      reversible: f.category !== 'breaker',
      risk_level: f.severity === 'critical' ? 'high' as const : f.severity === 'high' ? 'medium' as const : 'low' as const,
      affected_modules: [f.category.toUpperCase()],
      rollback_hint: f.category === 'breaker' ? 'Circuit state can be manually reset' : 'Revert the specific file changes',
    }));

  const deletions: AgentAction[] = unresolvedFindings
    .filter(f => ['dependency', 'regression'].includes(f.category) || f.title.toLowerCase().includes('deprecated'))
    .map((f, i) => ({
      id: `delete-${i + 1}`,
      label: f.title,
      description: f.description,
      scope: f.category,
      reversible: true,
      risk_level: 'low' as const,
      affected_modules: [f.category.toUpperCase()],
      rollback_hint: 'Restore from version control',
    }));

  const evolutionSuggestions: AgentAction[] = [
    {
      id: 'evolve-primary',
      label: proposal.title,
      description: proposal.description,
      scope: proposal.scope,
      reversible: proposal.risk_level !== 'high',
      risk_level: proposal.risk_level as 'low' | 'medium' | 'high',
      affected_modules: [proposal.scope.toUpperCase()],
      rollback_hint: proposal.rollback_plan,
    },
  ];

  // Add evolution suggestions from remaining findings
  unresolvedFindings
    .filter(f => !fixes.some(fix => fix.label === f.title) && !deletions.some(del => del.label === f.title))
    .forEach((f, i) => {
      evolutionSuggestions.push({
        id: `evolve-${i + 2}`,
        label: f.title,
        description: f.description,
        scope: f.category,
        reversible: true,
        risk_level: f.severity === 'critical' ? 'high' : f.severity === 'high' ? 'medium' : 'low',
        affected_modules: [f.category.toUpperCase()],
        rollback_hint: 'Revert changes and re-run scan',
      });
    });

  const allReversible = [...fixes, ...deletions, ...evolutionSuggestions].every(a => a.reversible);
  const highRiskCount = [...fixes, ...deletions, ...evolutionSuggestions].filter(a => a.risk_level === 'high').length;

  const benefits: string[] = [];
  if (fixes.length > 0) benefits.push(`Resolves ${fixes.length} active issue${fixes.length > 1 ? 's' : ''} affecting system stability`);
  if (deletions.length > 0) benefits.push(`Removes ${deletions.length} deprecated or dead artifact${deletions.length > 1 ? 's' : ''}, reducing attack surface`);
  if (evolutionSuggestions.length > 0) benefits.push(`Implements ${evolutionSuggestions.length} evolution improvement${evolutionSuggestions.length > 1 ? 's' : ''} strengthening the substrate`);
  if (relatedSignals.length > 0) benefits.push(`Addresses ${relatedSignals.length} INTEL signal${relatedSignals.length > 1 ? 's' : ''} flagged by the control plane`);

  const risks: string[] = [];
  if (highRiskCount > 0) risks.push(`${highRiskCount} change${highRiskCount > 1 ? 's carry' : ' carries'} elevated risk — review carefully`);
  if (!allReversible) risks.push('Some changes are not easily reversible — ensure backups are current');
  if (risks.length === 0) risks.push('All proposed changes are low-risk and reversible');

  const confidence = Math.min(0.95, 0.6 + (fixes.length * 0.05) + (relatedSignals.length * 0.02));

  const reversibilityNote = allReversible
    ? 'All changes are reversible if you change your mind.'
    : 'Most changes are reversible, but some high-risk items should be reviewed carefully before proceeding.';

  return {
    preamble: `⛔ MANDATORY CONSENT PROTOCOL: Before I make any changes, here is the full scan summary. I need your explicit approval before proceeding with ANY of these items.`,

    fixes,
    deletions,
    evolution_suggestions: evolutionSuggestions,

    agent_evaluation: {
      summary: `The scan identified ${fixes.length} fix${fixes.length !== 1 ? 'es' : ''}, ${deletions.length} cleanup${deletions.length !== 1 ? 's' : ''}, and ${evolutionSuggestions.length} evolution opportunity${evolutionSuggestions.length !== 1 ? 'ies' : 'y'}. ${confidence >= 0.8 ? 'Confidence is high — the recommendations are well-supported by multiple signals.' : 'Confidence is moderate — some recommendations may benefit from manual review.'}`,
      benefits,
      risks,
      confidence: Math.round(confidence * 100) / 100,
    },

    consent_prompt: `⛔ I will NOT make any changes until you explicitly approve. ${reversibilityNote} Do you want me to proceed with all items, or would you like to approve them individually?`,

    presentation_template: [
      `⛔ **MANDATORY CONSENT — READ BEFORE I TOUCH ANYTHING**`,
      ``,
      `I've analyzed the evolution scan. Here is exactly what it recommends and what each action means for your system.`,
      ``,
      fixes.length > 0 ? `### 🔧 Fixes (${fixes.length})` : null,
      ...fixes.map(f => `- **${f.label}** — ${f.description}\n  - Risk: ${f.risk_level} | Reversible: ${f.reversible ? 'Yes' : '⚠️ No'} | Affects: ${f.affected_modules.join(', ')}\n  - If applied: resolves degraded behavior. If skipped: issue persists.`),
      fixes.length > 0 ? `` : null,
      deletions.length > 0 ? `### 🗑️ Removals (${deletions.length})` : null,
      ...deletions.map(d => `- **${d.label}** — ${d.description}\n  - Risk: ${d.risk_level} | Reversible: ${d.reversible ? 'Yes' : '⚠️ No'} | Affects: ${d.affected_modules.join(', ')}\n  - If applied: reduces attack surface and dead weight. If skipped: stale artifacts remain.`),
      deletions.length > 0 ? `` : null,
      `### 🧬 Evolution Recommendations (${evolutionSuggestions.length})`,
      ...evolutionSuggestions.map(e => `- **${e.label}** — ${e.description}\n  - Risk: ${e.risk_level} | Reversible: ${e.reversible ? 'Yes' : '⚠️ No'} | Scope: ${e.scope}\n  - If applied: strengthens the substrate. If skipped: system stays at current capability level.`),
      ``,
      `### 📊 My Evaluation`,
      `**Benefits:**`,
      ...benefits.map(b => `- ✅ ${b}`),
      ``,
      `**Risks:**`,
      ...risks.map(r => `- ⚠️ ${r}`),
      ``,
      `**Rollback:** ${proposal.rollback_plan}`,
      ``,
      `${reversibilityNote}`,
      ``,
      `---`,
      `⛔ **I will NOT proceed until you say "yes" or "go ahead."**`,
      `You can approve all items, pick specific ones, or decline entirely.`,
    ].filter(Boolean).join('\n'),
  };
}

// ═══════════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

export interface GenerateReportResult {
  success: boolean;
  report?: EvolutionProposalReport;
  error?: string;
}

/**
 * Generate a strict JSON EvolutionProposalReport for a given proposal ID.
 * 
 * Includes a full `agent_briefing` section with structured presentation
 * instructions so the consuming agent knows exactly what to say and do.
 */
export function generateEvolutionReport(proposalId: string): GenerateReportResult {
  // 1. Load proposal
  const allProposals = engineerNode.getProposals();
  const proposal = allProposals.find(p => p.id === proposalId);

  if (!proposal) {
    return { success: false, error: `Proposal not found: ${proposalId}` };
  }

  // 2. Snapshot discipline guard
  const snapshotCheck = checkSystemSnapshot();
  if (!snapshotCheck.exists) {
    return {
      success: false,
      error: 'System snapshot required before export. Run ENGINEER maintenance battery first to capture system state.',
    };
  }

  // 3. Gather related findings
  const allFindings = engineerNode.getFindings(true);
  const originatingFinding = allFindings.find(f => f.id === proposal.finding_id);

  // 4. Gather related INTEL signals
  const recentCards = intelAggregator.getCards({ limit: 10 });
  const relatedSignals = recentCards
    .filter(c => c.source.includes('ENGINEER'))
    .map(c => c.id);

  // 5. Determine destructiveness
  const isDestructive = proposal.risk_level === 'high';

  // 6. Build agent briefing
  const agentBriefing = buildAgentBriefing(
    proposal,
    allFindings.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      severity: f.severity,
      category: f.category,
      resolved: f.resolved,
    })),
    relatedSignals,
  );

  // 7. Compile report
  const report: EvolutionProposalReport = {
    schema_version: '2.0',
    generated_at: new Date().toISOString(),
    system_id: 'cmpsbl-substrate',
    proposal: {
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      risk_level: proposal.risk_level,
      scope: proposal.scope,
      rationale: originatingFinding
        ? `Finding: ${originatingFinding.title} — ${originatingFinding.description}`
        : 'Generated by ENGINEER maintenance battery.',
      affected_areas: [proposal.scope],
      suggested_actions: [
        `Review: ${proposal.description}`,
        `Scope: ${proposal.scope}`,
        `Rollback: ${proposal.rollback_plan}`,
      ],
      rollback_plan: proposal.rollback_plan,
      test_requirements: [
        'Verify no regression in affected scope',
        'Confirm rollback path is functional',
        'Run substrate health check post-apply',
      ],
    },
    context: {
      originating_findings: originatingFinding ? [originatingFinding.id] : [],
      related_signals: relatedSignals,
    },
    guardrails: {
      destructive: isDestructive,
      requires_backup: !snapshotCheck.exists || isDestructive,
      requires_manual_review: true,
    },
    agent_briefing: agentBriefing,
  };

  // 8. Mark proposal as exported
  engineerNode.updateProposalStatus(proposalId, 'exported' as any);

  // 9. Emit telemetry
  emitEvolveEvent('evolution_report_exported' as any, {
    proposal_id: proposalId,
    report_schema_version: '2.0',
  });

  return { success: true, report };
}

/**
 * Generate reports for all exportable proposals.
 */
export function generateAllExportableReports(): {
  reports: EvolutionProposalReport[];
  errors: string[];
} {
  const exportable = engineerNode.getProposals().filter(
    p => p.status === 'draft' || p.status === 'reviewed'
  );
  
  const reports: EvolutionProposalReport[] = [];
  const errors: string[] = [];

  for (const proposal of exportable) {
    const result = generateEvolutionReport(proposal.id);
    if (result.success && result.report) {
      reports.push(result.report);
    } else if (result.error) {
      errors.push(`${proposal.id}: ${result.error}`);
    }
  }

  return { reports, errors };
}
