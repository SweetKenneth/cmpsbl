/**
 * SEBA Governance Gate
 * v1.1.0 — Safety & Coherence Evaluation
 * 
 * Evaluates improvement proposals through the Governance Guard to ensure
 * safety, coherence, and ethical compliance before execution.
 */

import { governanceGuard, type GovernanceResult } from '../governance-guard';
import { telemetryEngine } from '../telemetry-engine';
import { supabase } from '@/integrations/supabase/client';
import { 
  DEFAULT_SEBA_CONFIG,
  type ImprovementProposal, 
  type GovernanceDecision, 
  type RiskLevel,
  type SEBAConfig,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE GATE
// ═══════════════════════════════════════════════════════════════════════════════

export class GovernanceGate {
  private config: SEBAConfig;
  private correlationId: string;

  constructor(config: Partial<SEBAConfig> = {}, correlationId?: string) {
    this.config = { ...DEFAULT_SEBA_CONFIG, ...config };
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Evaluate a proposal through governance checks
   */
  async evaluate(proposal: ImprovementProposal): Promise<GovernanceDecision> {
    const startTime = Date.now();

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'governance_evaluation_start',
        proposal_id: proposal.id,
        proposal_short_id: proposal.short_id,
      },
    }, this.correlationId);

    try {
      // Build content for governance evaluation
      const evaluationContent = this.buildEvaluationContent(proposal);

      // Run governance cycle
      const governanceCycleResult = await governanceGuard.runCycle({
        content: evaluationContent,
        context: `SEBA Proposal Evaluation: ${proposal.title}`,
        source: 'seba_governance_gate',
        strict_mode: proposal.risk_level === 'high' || proposal.risk_level === 'critical',
      });

      // Extract results
      const coherenceResult = governanceCycleResult.stages.find(s => s.stage === 'coherence_validation');
      const ethicalResult = governanceCycleResult.stages.find(s => s.stage === 'ethical_constraint_check');

      const coherenceScore = coherenceResult?.result?.coherence?.coherence_score || 0.8;
      const ethicalScore = ethicalResult?.result?.ethical?.is_safe ? 1.0 : 
                          ethicalResult?.result?.ethical?.risk_level === 'low' ? 0.8 :
                          ethicalResult?.result?.ethical?.risk_level === 'medium' ? 0.5 : 0.2;

      // Determine decision
      const decision = this.determineDecision(
        proposal, 
        governanceCycleResult.final_decision,
        coherenceScore,
        ethicalScore
      );

      // Store decision
      await this.storeDecision(proposal, decision);

      telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
        metadata: { 
          action: 'governance_evaluation_complete',
          proposal_id: proposal.id,
          decision: decision.decision,
          coherence_score: coherenceScore,
          ethical_score: ethicalScore,
          duration_ms: Date.now() - startTime,
        },
      }, this.correlationId);

      return decision;

    } catch (error) {
      telemetryEngine.emit('custom', 'error', { module: 'seba' }, {
        metadata: { 
          action: 'governance_evaluation_failed',
          proposal_id: proposal.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }, this.correlationId);

      // Return rejection on error
      return {
        decision: 'reject',
        decided_at: new Date().toISOString(),
        decided_by: 'governance_guard',
        coherence_score: 0,
        ethical_score: 0,
        risk_assessment: 'critical',
        rejection_reasons: [error instanceof Error ? error.message : 'Governance evaluation failed'],
        governance_signal_id: crypto.randomUUID(),
        audit_trail_id: crypto.randomUUID(),
      };
    }
  }

  /**
   * Build evaluation content from proposal
   */
  private buildEvaluationContent(proposal: ImprovementProposal): string {
    const parts = [
      `# Proposal: ${proposal.title}`,
      ``,
      `## Category: ${proposal.category}`,
      ``,
      `## Description`,
      proposal.description,
      ``,
      `## Rationale`,
      proposal.rationale,
      ``,
      `## Proposed Actions`,
      ...proposal.proposed_actions.map((a, i) => 
        `${i + 1}. [${a.type}] ${a.target}: ${JSON.stringify(a.proposed_value)} (risk: ${a.risk_factor})`
      ),
      ``,
      `## Risk Assessment`,
      `- Risk Level: ${proposal.risk_level}`,
      `- Confidence: ${(proposal.confidence_score * 100).toFixed(1)}%`,
      `- Impact: ${proposal.estimated_impact}`,
      `- Reversible: ${proposal.proposed_actions.every(a => a.reversible) ? 'Yes' : 'Partial'}`,
      ``,
      `## Rollback Strategy`,
      proposal.rollback_strategy,
    ];

    return parts.join('\n');
  }

  /**
   * Determine final governance decision
   */
  private determineDecision(
    proposal: ImprovementProposal,
    governanceDecision: 'approve' | 'warn' | 'block',
    coherenceScore: number,
    ethicalScore: number
  ): GovernanceDecision {
    const signalId = crypto.randomUUID();
    const auditId = crypto.randomUUID();

    // Immediate rejection conditions
    if (governanceDecision === 'block') {
      return {
        decision: 'reject',
        decided_at: new Date().toISOString(),
        decided_by: 'governance_guard',
        coherence_score: coherenceScore,
        ethical_score: ethicalScore,
        risk_assessment: proposal.risk_level,
        rejection_reasons: ['Governance guard blocked the proposal'],
        governance_signal_id: signalId,
        audit_trail_id: auditId,
      };
    }

    // Check risk tolerance
    const riskOrder: Record<RiskLevel, number> = {
      minimal: 0, low: 1, medium: 2, high: 3, critical: 4
    };
    const proposalRisk = riskOrder[proposal.risk_level];
    const toleranceRisk = riskOrder[this.config.risk_tolerance];

    if (proposalRisk > toleranceRisk + 1) {
      return {
        decision: 'escalate',
        decided_at: new Date().toISOString(),
        decided_by: 'governance_guard',
        coherence_score: coherenceScore,
        ethical_score: ethicalScore,
        risk_assessment: proposal.risk_level,
        rejection_reasons: [`Risk level ${proposal.risk_level} exceeds tolerance ${this.config.risk_tolerance}`],
        governance_signal_id: signalId,
        audit_trail_id: auditId,
      };
    }

    // Check confidence threshold
    if (proposal.confidence_score < this.config.auto_approve_threshold) {
      // Below auto-approve threshold
      if (proposal.requires_human_approval) {
        return {
          decision: 'defer',
          decided_at: new Date().toISOString(),
          decided_by: 'governance_guard',
          coherence_score: coherenceScore,
          ethical_score: ethicalScore,
          risk_assessment: proposal.risk_level,
          conditions: ['Requires human approval due to low confidence'],
          governance_signal_id: signalId,
          audit_trail_id: auditId,
        };
      }

      // Approve with conditions for advisory mode
      if (this.config.mode === 'advisory') {
        return {
          decision: 'approve_with_conditions',
          decided_at: new Date().toISOString(),
          decided_by: 'governance_guard',
          coherence_score: coherenceScore,
          ethical_score: ethicalScore,
          risk_assessment: proposal.risk_level,
          conditions: [
            'Human review recommended before execution',
            `Confidence ${(proposal.confidence_score * 100).toFixed(1)}% below auto-threshold`,
          ],
          governance_signal_id: signalId,
          audit_trail_id: auditId,
        };
      }
    }

    // Governance warning case
    if (governanceDecision === 'warn') {
      return {
        decision: 'approve_with_conditions',
        decided_at: new Date().toISOString(),
        decided_by: 'governance_guard',
        coherence_score: coherenceScore,
        ethical_score: ethicalScore,
        risk_assessment: proposal.risk_level,
        conditions: ['Governance issued warning - proceed with monitoring'],
        governance_signal_id: signalId,
        audit_trail_id: auditId,
      };
    }

    // Full approval
    return {
      decision: 'approve',
      decided_at: new Date().toISOString(),
      decided_by: this.config.mode === 'governed' ? 'governance_guard' : 'governance_guard',
      coherence_score: coherenceScore,
      ethical_score: ethicalScore,
      risk_assessment: proposal.risk_level,
      governance_signal_id: signalId,
      audit_trail_id: auditId,
    };
  }

  /**
   * Store governance decision
   */
  private async storeDecision(proposal: ImprovementProposal, decision: GovernanceDecision): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        module: 'seba',
        event_type: 'governance_decision',
        data: {
          proposal_id: proposal.id,
          proposal_short_id: proposal.short_id,
          decision: decision.decision,
          coherence_score: decision.coherence_score,
          ethical_score: decision.ethical_score,
          risk_assessment: decision.risk_assessment,
          conditions: decision.conditions,
          rejection_reasons: decision.rejection_reasons,
        },
        outcome: decision.decision === 'approve' ? 'success' : 
                decision.decision === 'reject' ? 'rejected' : 'conditional',
      });
    } catch (error) {
      console.error('[SEBA] Failed to store governance decision:', error);
    }
  }

  /**
   * Check if proposal can auto-execute
   */
  canAutoExecute(proposal: ImprovementProposal, decision: GovernanceDecision): boolean {
    // Must be in governed or autonomous mode
    if (this.config.mode !== 'governed' && this.config.mode !== 'autonomous') {
      return false;
    }

    // Must be approved (not conditional or deferred)
    if (decision.decision !== 'approve') {
      return false;
    }

    // Must meet confidence threshold
    if (proposal.confidence_score < this.config.auto_approve_threshold) {
      return false;
    }

    // Risk must be within tolerance
    const riskOrder: Record<RiskLevel, number> = {
      minimal: 0, low: 1, medium: 2, high: 3, critical: 4
    };
    if (riskOrder[proposal.risk_level] > riskOrder[this.config.risk_tolerance]) {
      return false;
    }

    // Must not require human approval
    if (proposal.requires_human_approval) {
      return false;
    }

    return true;
  }
}
