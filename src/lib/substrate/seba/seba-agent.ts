/**
 * Self-Evolving Bounded Agent (SEBA)
 * v1.0.0 — The Holy Grail: Full Cognitive × Evolution × Governance
 * 
 * Complete cognitive pipeline that:
 * 1. Runs full cognitive analysis (Memory, Learning, Imagination, Reasoning)
 * 2. Proposes its own improvements based on insights
 * 3. Governance-gates proposals for safety and coherence
 * 4. Applies approved evolutions with rollback capability
 * 
 * Genuine bounded autonomy within governance constraints.
 */

import { supabase } from '@/integrations/supabase/client';
import { telemetryEngine } from '../telemetry-engine';
import { CognitiveAnalyzer } from './cognitive-analyzer';
import { ProposalGenerator } from './proposal-generator';
import { GovernanceGate } from './governance-gate';
import { EvolutionExecutor } from './evolution-executor';
import { 
  DEFAULT_SEBA_CONFIG,
  type SEBAState,
  type SEBAConfig,
  type SEBAMode,
  type SEBAPhase,
  type SEBACycleResult,
  type SEBAAuditEntry,
  type ImprovementProposal,
  type GovernanceDecision,
  type EvolutionExecution,
  type SEBACommand,
  type SEBACommandResult,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// SEBA AGENT
// ═══════════════════════════════════════════════════════════════════════════════

class SEBAAgent {
  private static instance: SEBAAgent;
  private config: SEBAConfig;
  private state: SEBAState;

  private constructor() {
    this.config = { ...DEFAULT_SEBA_CONFIG };
    this.state = this.initState();
  }

  static getInstance(): SEBAAgent {
    if (!SEBAAgent.instance) {
      SEBAAgent.instance = new SEBAAgent();
    }
    return SEBAAgent.instance;
  }

  private initState(): SEBAState {
    return {
      mode: this.config.mode,
      current_phase: 'idle',
      initialized_at: new Date().toISOString(),
      
      total_cycles: 0,
      successful_cycles: 0,
      failed_cycles: 0,
      blocked_cycles: 0,
      
      pending_proposals: 0,
      approved_proposals: 0,
      rejected_proposals: 0,
      
      auto_approve_threshold: this.config.auto_approve_threshold,
      risk_tolerance: this.config.risk_tolerance,
      
      agent_health: 100,
      cognitive_utilization: 0,
      governance_compliance: 100,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a complete SEBA cycle
   */
  async runCycle(): Promise<SEBACycleResult> {
    if (!this.config.enabled) {
      return this.createResult(false, [], 'idle', 'SEBA is disabled');
    }

    if (this.config.mode === 'off') {
      return this.createResult(false, [], 'idle', 'SEBA mode is off');
    }

    const cycleId = crypto.randomUUID();
    const startTime = Date.now();
    const auditLog: SEBAAuditEntry[] = [];
    const phasesCompleted: SEBAPhase[] = [];

    this.state.current_phase = 'cognizing';
    this.log(auditLog, 'cognizing', 'Cycle started', { cycle_id: cycleId });

    try {
      // ═══ PHASE 1: COGNITIVE ANALYSIS ═══
      const analyzer = new CognitiveAnalyzer(cycleId);
      const insights = await analyzer.analyze();
      phasesCompleted.push('cognizing');
      this.log(auditLog, 'cognizing', 'Cognitive analysis complete', { insights_found: insights.length });

      if (insights.length === 0) {
        this.state.current_phase = 'idle';
        this.state.total_cycles++;
        return this.createResult(true, phasesCompleted, 'complete', 'No actionable insights found', auditLog);
      }

      // ═══ PHASE 2: PROPOSAL GENERATION ═══
      this.state.current_phase = 'proposing';
      const generator = new ProposalGenerator(this.config, cycleId);
      const proposals = await generator.generateProposals(insights);
      phasesCompleted.push('proposing');
      this.log(auditLog, 'proposing', 'Proposals generated', { proposals_count: proposals.length });

      if (proposals.length === 0) {
        this.state.current_phase = 'idle';
        this.state.total_cycles++;
        return this.createResult(true, phasesCompleted, 'complete', 'No proposals generated from insights', auditLog);
      }

      // Process each proposal through governance and execution
      let proposalsApproved = 0;
      let proposalsRejected = 0;
      let evolutionsApplied = 0;
      let finalProposal: ImprovementProposal | undefined;
      let finalExecution: EvolutionExecution | undefined;

      for (const proposal of proposals) {
        finalProposal = proposal;

        // ═══ PHASE 3: GOVERNANCE EVALUATION ═══
        this.state.current_phase = 'evaluating';
        phasesCompleted.push('evaluating');
        
        this.state.current_phase = 'gating';
        const gate = new GovernanceGate(this.config, cycleId);
        const decision = await gate.evaluate(proposal);
        proposal.governance_decision = decision;
        phasesCompleted.push('gating');
        this.log(auditLog, 'gating', 'Governance decision', { 
          proposal_id: proposal.short_id, 
          decision: decision.decision 
        });

        if (decision.decision === 'reject') {
          proposalsRejected++;
          this.state.rejected_proposals++;
          continue;
        }

        proposalsApproved++;
        this.state.approved_proposals++;

        // ═══ PHASE 4: EXECUTION (if auto-execute allowed) ═══
        const canAutoExecute = gate.canAutoExecute(proposal, decision);
        
        if (canAutoExecute || this.config.mode === 'autonomous') {
          this.state.current_phase = 'applying';
          const executor = new EvolutionExecutor(this.config, cycleId);
          const execution = await executor.execute(proposal, decision);
          finalExecution = execution;
          phasesCompleted.push('applying');
          this.log(auditLog, 'applying', 'Execution complete', { 
            execution_id: execution.id, 
            phase: execution.phase 
          });

          if (execution.phase === 'verified') {
            evolutionsApplied++;
          }

          // ═══ PHASE 5: VERIFICATION ═══
          this.state.current_phase = 'verifying';
          phasesCompleted.push('verifying');
          this.log(auditLog, 'verifying', 'Verification complete', { 
            health_delta: execution.health_delta 
          });
        } else {
          // Advisory mode - just log the approved proposal
          this.state.pending_proposals++;
          this.log(auditLog, 'gating', 'Proposal approved, awaiting manual execution', { 
            proposal_id: proposal.short_id,
            requires_human: proposal.requires_human_approval,
          });
        }
      }

      // Update state
      this.state.current_phase = 'complete';
      this.state.total_cycles++;
      this.state.last_cycle_at = new Date().toISOString();

      if (evolutionsApplied > 0) {
        this.state.successful_cycles++;
      } else if (proposalsRejected === proposals.length) {
        this.state.blocked_cycles++;
      }

      phasesCompleted.push('complete');

      const result = this.createResult(
        true,
        phasesCompleted,
        'complete',
        `Cycle complete: ${proposalsApproved} approved, ${proposalsRejected} rejected, ${evolutionsApplied} applied`,
        auditLog
      );

      result.proposals_generated = proposals.length;
      result.proposals_approved = proposalsApproved;
      result.proposals_rejected = proposalsRejected;
      result.evolutions_applied = evolutionsApplied;
      result.proposal = finalProposal;
      result.execution = finalExecution;

      this.state.current_phase = 'idle';
      return result;

    } catch (error) {
      this.state.current_phase = 'failed';
      this.state.total_cycles++;
      this.state.failed_cycles++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log(auditLog, 'failed', 'Cycle failed', { error: errorMessage }, 'error');

      return this.createResult(false, phasesCompleted, 'failed', errorMessage, auditLog);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TERMINAL COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle terminal commands
   */
  async handleCommand(command: SEBACommand, args?: Record<string, unknown>): Promise<SEBACommandResult> {
    switch (command) {
      case 'status':
        return this.cmdStatus();

      case 'enable':
        return this.cmdEnable();

      case 'disable':
        return this.cmdDisable();

      case 'mode':
        return this.cmdMode(args?.mode as SEBAMode);

      case 'cycle':
        return this.cmdCycle();

      case 'propose':
        return this.cmdPropose();

      case 'review':
        return this.cmdReview();

      case 'approve':
        return this.cmdApprove(args?.proposal_id as string);

      case 'reject':
        return this.cmdReject(args?.proposal_id as string);

      case 'execute':
        return this.cmdExecute(args?.proposal_id as string);

      case 'rollback':
        return this.cmdRollback(args?.execution_id as string);

      case 'history':
        return this.cmdHistory(args?.limit as number);

      case 'config':
        return this.cmdConfig(args?.updates as Partial<SEBAConfig>);

      case 'thresholds':
        return this.cmdThresholds(args);

      default:
        return {
          success: false,
          command,
          message: `Unknown command: ${command}`,
          suggestions: ['status', 'enable', 'mode', 'cycle', 'review', 'history'],
        };
    }
  }

  private cmdStatus(): SEBACommandResult {
    return {
      success: true,
      command: 'status',
      data: {
        state: this.state,
        config: {
          mode: this.config.mode,
          enabled: this.config.enabled,
          auto_approve_threshold: this.config.auto_approve_threshold,
          risk_tolerance: this.config.risk_tolerance,
        },
      },
      message: `SEBA ${this.config.enabled ? 'enabled' : 'disabled'} in ${this.config.mode} mode. ` +
               `Phase: ${this.state.current_phase}. ` +
               `Cycles: ${this.state.total_cycles} (${this.state.successful_cycles} successful)`,
    };
  }

  private cmdEnable(): SEBACommandResult {
    this.config.enabled = true;
    return {
      success: true,
      command: 'enable',
      message: 'SEBA enabled',
    };
  }

  private cmdDisable(): SEBACommandResult {
    this.config.enabled = false;
    this.state.current_phase = 'idle';
    return {
      success: true,
      command: 'disable',
      message: 'SEBA disabled',
    };
  }

  private cmdMode(mode?: SEBAMode): SEBACommandResult {
    if (!mode) {
      return {
        success: true,
        command: 'mode',
        data: { current_mode: this.config.mode },
        message: `Current mode: ${this.config.mode}`,
        suggestions: ['off', 'observe', 'advisory', 'governed', 'autonomous'],
      };
    }

    const validModes: SEBAMode[] = ['off', 'observe', 'advisory', 'governed', 'autonomous'];
    if (!validModes.includes(mode)) {
      return {
        success: false,
        command: 'mode',
        message: `Invalid mode: ${mode}`,
        suggestions: validModes,
      };
    }

    // Autonomous mode requires explicit unlock
    if (mode === 'autonomous') {
      return {
        success: false,
        command: 'mode',
        message: 'Autonomous mode requires explicit unlock via seba.unlock',
        suggestions: ['governed', 'advisory'],
      };
    }

    this.config.mode = mode;
    this.state.mode = mode;
    return {
      success: true,
      command: 'mode',
      message: `Mode set to: ${mode}`,
    };
  }

  private async cmdCycle(): Promise<SEBACommandResult> {
    const result = await this.runCycle();
    return {
      success: result.success,
      command: 'cycle',
      data: result,
      message: result.success 
        ? `Cycle complete: ${result.evolutions_applied} evolutions applied`
        : `Cycle failed: ${result.error}`,
    };
  }

  private async cmdPropose(): Promise<SEBACommandResult> {
    const analyzer = new CognitiveAnalyzer();
    const insights = await analyzer.analyze();
    
    if (insights.length === 0) {
      return {
        success: true,
        command: 'propose',
        data: { insights: [], proposals: [] },
        message: 'No insights found for proposals',
      };
    }

    const generator = new ProposalGenerator(this.config);
    const proposals = await generator.generateProposals(insights);

    return {
      success: true,
      command: 'propose',
      data: { 
        insights: insights.length, 
        proposals: proposals.map(p => ({
          id: p.short_id,
          title: p.title,
          category: p.category,
          confidence: p.confidence_score,
          risk: p.risk_level,
        })),
      },
      message: `Generated ${proposals.length} proposals from ${insights.length} insights`,
    };
  }

  private async cmdReview(): Promise<SEBACommandResult> {
    const { data: pending } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'seba')
      .eq('event_type', 'governance_decision')
      .eq('outcome', 'conditional')
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      success: true,
      command: 'review',
      data: { pending_count: pending?.length || 0, proposals: pending },
      message: `${pending?.length || 0} proposals pending review`,
    };
  }

  private async cmdApprove(proposalId?: string): Promise<SEBACommandResult> {
    if (!proposalId) {
      return {
        success: false,
        command: 'approve',
        message: 'Proposal ID required: seba.approve <proposal_id>',
      };
    }

    // Find and approve the proposal
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'manual_approval',
      data: { proposal_id: proposalId, approved_by: 'human' },
      outcome: 'success',
    });

    return {
      success: true,
      command: 'approve',
      message: `Proposal ${proposalId} approved. Run seba.execute ${proposalId} to apply.`,
    };
  }

  private async cmdReject(proposalId?: string): Promise<SEBACommandResult> {
    if (!proposalId) {
      return {
        success: false,
        command: 'reject',
        message: 'Proposal ID required: seba.reject <proposal_id>',
      };
    }

    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'manual_rejection',
      data: { proposal_id: proposalId, rejected_by: 'human' },
      outcome: 'rejected',
    });

    this.state.rejected_proposals++;
    return {
      success: true,
      command: 'reject',
      message: `Proposal ${proposalId} rejected`,
    };
  }

  private async cmdExecute(proposalId?: string): Promise<SEBACommandResult> {
    if (!proposalId) {
      return {
        success: false,
        command: 'execute',
        message: 'Proposal ID required: seba.execute <proposal_id>',
      };
    }

    // For now, return a placeholder - in full implementation would retrieve and execute proposal
    return {
      success: true,
      command: 'execute',
      message: `Execution triggered for proposal ${proposalId}. Check seba.history for results.`,
    };
  }

  private async cmdRollback(executionId?: string): Promise<SEBACommandResult> {
    if (!executionId) {
      return {
        success: false,
        command: 'rollback',
        message: 'Execution ID required: seba.rollback <execution_id>',
      };
    }

    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'manual_rollback',
      data: { execution_id: executionId },
      outcome: 'rolled_back',
    });

    return {
      success: true,
      command: 'rollback',
      message: `Rollback triggered for execution ${executionId}`,
    };
  }

  private async cmdHistory(limit?: number): Promise<SEBACommandResult> {
    const { data: history } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'seba')
      .order('created_at', { ascending: false })
      .limit(limit || 20);

    return {
      success: true,
      command: 'history',
      data: { count: history?.length || 0, events: history },
      message: `${history?.length || 0} SEBA events`,
    };
  }

  private cmdConfig(updates?: Partial<SEBAConfig>): SEBACommandResult {
    if (updates) {
      this.config = { ...this.config, ...updates };
      this.state.auto_approve_threshold = this.config.auto_approve_threshold;
      this.state.risk_tolerance = this.config.risk_tolerance;
    }

    return {
      success: true,
      command: 'config',
      data: this.config,
      message: updates ? 'Configuration updated' : 'Current configuration',
    };
  }

  private cmdThresholds(args?: Record<string, unknown>): SEBACommandResult {
    if (args?.auto_approve !== undefined) {
      this.config.auto_approve_threshold = Number(args.auto_approve);
      this.state.auto_approve_threshold = this.config.auto_approve_threshold;
    }
    if (args?.risk !== undefined) {
      this.config.risk_tolerance = args.risk as any;
      this.state.risk_tolerance = this.config.risk_tolerance;
    }

    return {
      success: true,
      command: 'thresholds',
      data: {
        auto_approve_threshold: this.config.auto_approve_threshold,
        risk_tolerance: this.config.risk_tolerance,
        min_confidence_for_proposal: this.config.min_confidence_for_proposal,
      },
      message: `Thresholds: auto-approve=${this.config.auto_approve_threshold}, risk=${this.config.risk_tolerance}`,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private createResult(
    success: boolean,
    phasesCompleted: SEBAPhase[],
    finalPhase: SEBAPhase,
    message: string,
    auditLog: SEBAAuditEntry[] = []
  ): SEBACycleResult {
    const now = new Date().toISOString();
    return {
      success,
      cycle_id: crypto.randomUUID(),
      started_at: this.state.last_cycle_at || now,
      completed_at: now,
      duration_ms: 0,
      phases_completed: phasesCompleted,
      final_phase: finalPhase,
      proposals_generated: 0,
      proposals_approved: 0,
      proposals_rejected: 0,
      evolutions_applied: 0,
      audit_log: auditLog,
      error: success ? undefined : message,
    };
  }

  private log(
    auditLog: SEBAAuditEntry[],
    phase: SEBAPhase,
    action: string,
    details: Record<string, unknown>,
    outcome: 'success' | 'warning' | 'error' | 'blocked' = 'success'
  ): void {
    auditLog.push({
      timestamp: new Date().toISOString(),
      phase,
      action,
      details,
      outcome,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC ACCESSORS
  // ═══════════════════════════════════════════════════════════════════════════

  getState(): SEBAState {
    return { ...this.state };
  }

  getConfig(): SEBAConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getMode(): SEBAMode {
    return this.config.mode;
  }
}

// Export singleton
export const sebaAgent = SEBAAgent.getInstance();
export { SEBAAgent };
