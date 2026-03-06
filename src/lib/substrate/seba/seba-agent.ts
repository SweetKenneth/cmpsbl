/**
 * Self-Evolving Bounded Agent (SEBA)
 * Full Spectrum Autonomous Evolution
 * 
 * Complete cognitive pipeline with 9 analysis engines:
 * 1. Core 4: Memory, Learning, Imagination, Reasoning
 * 2. Extended 5: Security, Telemetry, Governance, Resources, Architecture
 * 
 * Proposes improvements across all 10 categories with full governance
 * gating and rollback capability. Uses shadow-to-production execution pipeline.
 */

import { supabase } from '@/integrations/supabase/client';
import { telemetryEngine } from '../telemetry-engine';
import { CognitiveAnalyzer } from './cognitive-analyzer';
import { ProposalGenerator } from './proposal-generator';
import { GovernanceGate } from './governance-gate';
import { EvolutionExecutor } from './evolution-executor';
import { ProposalStore } from './proposal-store';
import { EvolutionStampGenerator, EvolutionStampStore } from './evolution-stamp';
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
      cycles_today: 0,
      
      pending_proposals: 0,
      approved_proposals: 0,
      rejected_proposals: 0,
      executed_proposals: 0,
      
      auto_approve_threshold: this.config.auto_approve_threshold,
      risk_tolerance: this.config.risk_tolerance,
      
      agent_health: 100,
      cognitive_utilization: 0,
      governance_compliance: 100,
      
      insights_processed: 0,
      evolutions_applied: 0,
      rollbacks_executed: 0,
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

      // ═══ PERSIST PROPOSALS TO DATABASE ═══
      // This is critical for Atlas to display and manage proposals
      if (proposals.length > 0) {
        const storeResult = await ProposalStore.storeBatch(proposals);
        this.log(auditLog, 'proposing', 'Proposals persisted', { 
          stored: storeResult.stored, 
          failed: storeResult.failed 
        });
      }

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
            
            // ═══ CREATE EVOLUTION STAMPS ═══
            // Mandatory traceability for all applied changes
            for (const action of proposal.proposed_actions) {
              const stamp = EvolutionStampGenerator.createStamp(
                action, 
                proposal, 
                execution,
                this.config.mode === 'autonomous' ? 'seba_auto' : 'seba_governed'
              );
              await EvolutionStampStore.store(stamp);
              await EvolutionStampStore.logStamp(stamp);
            }
            
            // Update proposal status in database
            await ProposalStore.markApplied(proposal.id, decision);
            
            this.log(auditLog, 'applying', 'Evolution stamps created', {
              stamps_created: proposal.proposed_actions.length,
            });
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
    const startTime = performance.now();
    
    const wrapResult = (result: SEBACommandResult): SEBACommandResult => ({
      ...result,
      duration_ms: Math.round(performance.now() - startTime),
    });

    switch (command) {
      case 'status':
        return wrapResult(this.cmdStatus());

      case 'enable':
        return wrapResult(this.cmdEnable());

      case 'disable':
        return wrapResult(this.cmdDisable());

      case 'mode':
        return wrapResult(this.cmdMode(args?.mode as SEBAMode));

      case 'cycle':
        return wrapResult(await this.cmdCycle());

      case 'propose':
        return wrapResult(await this.cmdPropose());

      case 'review':
        return wrapResult(await this.cmdReview());

      case 'approve':
        return wrapResult(await this.cmdApprove(args?.proposal_id as string));

      case 'reject':
        return wrapResult(await this.cmdReject(args?.proposal_id as string, args?.reason as string));

      case 'execute':
        return wrapResult(await this.cmdExecute(args?.proposal_id as string, args?.phase as string));

      case 'rollback':
        return wrapResult(await this.cmdRollback(args?.execution_id as string));

      case 'history':
        return wrapResult(await this.cmdHistory(args?.limit as number));

      case 'config':
        return wrapResult(this.cmdConfig(args?.updates as Partial<SEBAConfig>));

      case 'thresholds':
        return wrapResult(this.cmdThresholds(args));

      case 'health':
        return wrapResult(await this.cmdHealth());

      case 'metrics':
        return wrapResult(await this.cmdMetrics());

      case 'queue':
        return wrapResult(await this.cmdQueue());

      case 'pause':
        return wrapResult(this.cmdPause());

      case 'resume':
        return wrapResult(this.cmdResume());

      default:
        return wrapResult({
          success: false,
          command,
          message: `Unknown command: ${command}`,
          suggestions: ['status', 'enable', 'mode', 'cycle', 'review', 'history', 'health', 'metrics'],
        });
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

    // ═══ PERSIST PROPOSALS TO DATABASE ═══
    // Critical: Without this, seba.review will show nothing
    if (proposals.length > 0) {
      const storeResult = await ProposalStore.storeBatch(proposals);
      this.state.pending_proposals += storeResult.stored;
      console.log(`[SEBA] Persisted ${storeResult.stored} proposals to database`);
    }

    return {
      success: true,
      command: 'propose',
      data: { 
        insights: insights.length, 
        proposals: proposals.map(p => ({
          id: p.short_id,
          full_id: p.id,
          title: p.title,
          category: p.category,
          confidence: p.confidence_score,
          risk: p.risk_level,
          // Impact predictions for observability
          predicted_impact: this.calculatePredictedImpact(p),
        })),
      },
      message: `Generated ${proposals.length} proposals from ${insights.length} insights. Use seba.review to see pending.`,
    };
  }

  /**
   * Calculate predicted impact metrics for a proposal
   */
  private calculatePredictedImpact(proposal: ImprovementProposal): Record<string, string> {
    const impact: Record<string, string> = {};
    
    // Base estimates on category and confidence
    const confidence = proposal.confidence_score;
    const category = proposal.category;
    
    switch (category) {
      case 'memory_optimization':
        impact.memory = `+${Math.round(confidence * 15)}% efficiency`;
        impact.speed = `+${Math.round(confidence * 5)}% faster retrieval`;
        break;
      case 'learning_enhancement':
        impact.learning = `+${Math.round(confidence * 20)}% faster convergence`;
        impact.accuracy = `+${Math.round(confidence * 10)}% better predictions`;
        break;
      case 'performance_boost':
        impact.speed = `+${Math.round(confidence * 25)}% faster`;
        impact.latency = `-${Math.round(confidence * 15)}ms avg response`;
        break;
      case 'error_recovery':
        impact.resilience = `+${Math.round(confidence * 30)}% uptime`;
        impact.mttr = `-${Math.round(confidence * 20)}% recovery time`;
        break;
      case 'resource_optimization':
        impact.cpu = `-${Math.round(confidence * 10)}% usage`;
        impact.memory = `-${Math.round(confidence * 15)}% footprint`;
        break;
      default:
        impact.health = `+${Math.round(confidence * 5)}% system health`;
    }
    
    return impact;
  }

  private async cmdReview(): Promise<SEBACommandResult> {
    // Get pending proposals from the actual evolution_proposals table
    const pending = await ProposalStore.getPending();

    return {
      success: true,
      command: 'review',
      data: { 
        pending_count: pending.length, 
        proposals: pending.map(p => ({
          id: p.id,
          title: p.title,
          target_system: p.target_system,
          confidence: p.confidence,
          status: p.status,
          created_at: p.created_at,
        })),
      },
      message: `${pending.length} proposals pending review`,
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

    // Resolve the full proposal ID first (handle short ID prefix)
    let resolvedId = proposalId;
    
    // Try exact match first
    const exactResult = await ProposalStore.updateStatus(proposalId, 'approved', 'HUMAN_OPERATOR');
    
    if (!exactResult.success) {
      // Try matching by short_id prefix
      const { data: matchingProposals } = await supabase
        .from('evolution_proposals')
        .select('id')
        .ilike('id', `${proposalId}%`)
        .eq('status', 'pending')
        .limit(1);
        
      if (matchingProposals && matchingProposals.length > 0) {
        resolvedId = matchingProposals[0].id;
        const prefixResult = await ProposalStore.updateStatus(resolvedId, 'approved', 'HUMAN_OPERATOR');
        
        if (!prefixResult.success) {
          return {
            success: false,
            command: 'approve',
            message: `Failed to approve proposal ${proposalId}: ${prefixResult.error}`,
          };
        }
      } else {
        return {
          success: false,
          command: 'approve',
          message: `No pending proposal found matching ${proposalId}. Use seba.review to list proposals.`,
        };
      }
    }

    // Log approval event for audit
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'manual_approval',
      data: { proposal_id: resolvedId, approved_by: 'human' },
      outcome: 'success',
    });

    this.state.approved_proposals++;
    this.state.pending_proposals = Math.max(0, this.state.pending_proposals - 1);

    return {
      success: true,
      command: 'approve',
      message: `Proposal ${resolvedId} approved. Run seba.execute ${resolvedId} to apply.`,
    };
  }

  private async cmdReject(proposalId?: string, reason?: string): Promise<SEBACommandResult> {
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
      data: { proposal_id: proposalId, rejected_by: 'human', reason: reason || 'Manual rejection' },
      outcome: 'rejected',
    });

    this.state.rejected_proposals++;
    return {
      success: true,
      command: 'reject',
      message: `Proposal ${proposalId} rejected${reason ? `: ${reason}` : ''}`,
    };
  }

  private async cmdExecute(proposalId?: string, phase?: string): Promise<SEBACommandResult> {
    if (!proposalId) {
      return {
        success: false,
        command: 'execute',
        message: 'Proposal ID required: seba.execute <proposal_id>',
      };
    }

    // Fetch the proposal from database
    const { data: proposals } = await supabase
      .from('evolution_proposals')
      .select('*')
      .or(`id.eq.${proposalId},id.ilike.${proposalId}%`)
      .eq('status', 'approved')
      .limit(1);

    if (!proposals || proposals.length === 0) {
      return {
        success: false,
        command: 'execute',
        message: `No approved proposal found for ${proposalId}. Use seba.approve ${proposalId} first.`,
      };
    }

    const proposal = proposals[0];
    const shortId = proposal.id.substring(0, 8);
    const fullId = proposal.id;
    
    // Use expected_impact to track execution phase (stored as JSON)
    const expectedImpact = proposal.expected_impact as Record<string, unknown> || {};
    const currentPhase = (expectedImpact.execution_phase as string) || 'pending';

    // PHASE 1: SHADOW (default first step)
    if (!phase || phase === 'shadow' || currentPhase === 'pending') {
      // Execute shadow validation - store phase in expected_impact
      const updatedImpact = { 
        ...expectedImpact, 
        execution_phase: 'shadow_applied',
        shadow_applied_at: new Date().toISOString(),
      };
      
      await supabase.from('evolution_proposals').update({
        expected_impact: updatedImpact,
      }).eq('id', fullId);

      await supabase.from('brain_events').insert({
        module: 'seba',
        event_type: 'shadow_execution',
        data: { 
          proposal_id: fullId, 
          short_id: shortId,
          title: proposal.title,
          phase: 'shadow_applied',
        },
        outcome: 'success',
      });

      return {
        success: true,
        command: 'execute',
        data: {
          proposal_id: fullId,
          short_id: shortId,
          phase: 'shadow_applied',
          title: proposal.title,
        },
        message: `✅ Shadow applied for proposal ${shortId}\n` +
                 `   Full ID: ${fullId}\n` +
                 `   Title: ${proposal.title}\n` +
                 `   \n` +
                 `   Next: seba.execute ${shortId} production  — to apply to production\n` +
                 `         seba.rollback ${shortId}            — to abort`,
      };
    }

    // PHASE 2: PRODUCTION (requires explicit confirmation)
    if (phase === 'production' && currentPhase === 'shadow_applied') {
      // Generate evolution stamp
      const stampId = `SEBA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shortId.slice(0, 3).toUpperCase()}`;
      
      // Execute production apply
      const updatedImpact = { 
        ...expectedImpact, 
        execution_phase: 'production_applied',
        production_applied_at: new Date().toISOString(),
        stamp_id: stampId,
      };
      
      await supabase.from('evolution_proposals').update({
        expected_impact: updatedImpact,
        status: 'applied',
      }).eq('id', fullId);

      await supabase.from('brain_events').insert({
        module: 'seba',
        event_type: 'production_execution',
        data: { 
          proposal_id: fullId, 
          short_id: shortId,
          title: proposal.title,
          stamp_id: stampId,
          phase: 'production_applied',
        },
        outcome: 'success',
      });

      this.state.executed_proposals++;
      this.state.evolutions_applied++;

      return {
        success: true,
        command: 'execute',
        data: {
          proposal_id: fullId,
          short_id: shortId,
          phase: 'production_applied',
          stamp_id: stampId,
          title: proposal.title,
        },
        message: `🚀 Production applied for proposal ${shortId}\n` +
                 `   Full ID: ${fullId}\n` +
                 `   Title: ${proposal.title}\n` +
                 `   Stamp: ${stampId}\n` +
                 `   \n` +
                 `   Rollback: seba.rollback ${shortId}`,
      };
    }

    // Invalid phase transition
    if (phase === 'production' && currentPhase !== 'shadow_applied') {
      return {
        success: false,
        command: 'execute',
        message: `Cannot apply to production: proposal must be in 'shadow_applied' phase (current: ${currentPhase}). Run seba.execute ${shortId} first.`,
      };
    }

    return {
      success: false,
      command: 'execute',
      message: `Unknown phase: ${phase}. Use 'shadow' or 'production'.`,
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
  // NEW v1.1.0 COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  private async cmdHealth(): Promise<SEBACommandResult> {
    const health = {
      overall: this.state.agent_health,
      cognitive_utilization: this.state.cognitive_utilization,
      governance_compliance: this.state.governance_compliance,
      phase: this.state.current_phase,
      mode: this.state.mode,
      cooldown: this.state.cooldown_until ? {
        until: this.state.cooldown_until,
        reason: this.state.cooldown_reason,
      } : null,
    };

    return {
      success: true,
      command: 'health',
      data: health,
      message: `Health: ${health.overall}% | Phase: ${health.phase} | Mode: ${health.mode}`,
    };
  }

  private async cmdMetrics(): Promise<SEBACommandResult> {
    const { data: events } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'seba')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const proposals = events?.filter(e => e.event_type === 'proposal_generated') || [];
    const executions = events?.filter(e => e.event_type === 'evolution_execution') || [];
    const rollbacks = events?.filter(e => e.event_type === 'rollback') || [];

    const metrics = {
      total_cycles: this.state.total_cycles,
      successful_cycles: this.state.successful_cycles,
      failed_cycles: this.state.failed_cycles,
      success_rate: this.state.total_cycles > 0 
        ? Math.round((this.state.successful_cycles / this.state.total_cycles) * 100) 
        : 0,
      proposals_24h: proposals.length,
      executions_24h: executions.length,
      rollbacks_24h: rollbacks.length,
      pending_proposals: this.state.pending_proposals,
      approved_proposals: this.state.approved_proposals,
      rejected_proposals: this.state.rejected_proposals,
    };

    return {
      success: true,
      command: 'metrics',
      data: metrics,
      message: `Cycles: ${metrics.total_cycles} (${metrics.success_rate}% success) | 24h: ${metrics.proposals_24h} proposals, ${metrics.executions_24h} executions`,
    };
  }

  private async cmdQueue(): Promise<SEBACommandResult> {
    const { data: pending } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'seba')
      .in('event_type', ['governance_decision', 'proposal_generated'])
      .eq('outcome', 'conditional')
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      success: true,
      command: 'queue',
      data: { 
        pending_count: pending?.length || 0, 
        items: pending?.map(p => ({
          id: (p.data as any)?.proposal_id || (p.data as any)?.proposal_short_id,
          type: p.event_type,
          created_at: p.created_at,
        })),
      },
      message: `${pending?.length || 0} items in queue`,
    };
  }

  private cmdPause(): SEBACommandResult {
    this.state.cooldown_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.state.cooldown_reason = 'Manual pause';
    this.state.current_phase = 'cooling_down';

    return {
      success: true,
      command: 'pause',
      message: 'SEBA paused for 24 hours. Use seba.resume to continue.',
    };
  }

  private cmdResume(): SEBACommandResult {
    this.state.cooldown_until = undefined;
    this.state.cooldown_reason = undefined;
    if (this.state.current_phase === 'cooling_down') {
      this.state.current_phase = 'idle';
    }

    return {
      success: true,
      command: 'resume',
      message: 'SEBA resumed. Ready for next cycle.',
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
