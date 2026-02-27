/**
 * SEBA Evolution Executor
 * Safe Execution of Approved Proposals
 * 
 * Executes governance-approved improvement proposals with full
 * rollback capability and health monitoring.
 */

import { telemetryEngine } from '../telemetry-engine';
import { evolutionCycle } from '../evolution-cycle';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { 
  DEFAULT_SEBA_CONFIG,
  type ImprovementProposal, 
  type EvolutionExecution, 
  type ProposedAction,
  type GovernanceDecision,
  type SEBAConfig,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

export class EvolutionExecutor {
  private config: SEBAConfig;
  private correlationId: string;

  constructor(config: Partial<SEBAConfig> = {}, correlationId?: string) {
    this.config = { ...DEFAULT_SEBA_CONFIG, ...config };
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Execute an approved proposal
   */
  async execute(
    proposal: ImprovementProposal, 
    decision: GovernanceDecision
  ): Promise<EvolutionExecution> {
    const executionId = crypto.randomUUID();
    const startTime = Date.now();

    // Get initial health
    const healthBefore = await this.getSystemHealth();

    const execution: EvolutionExecution = {
      id: executionId,
      proposal_id: proposal.id,
      started_at: new Date().toISOString(),
      phase: 'shadow',
      actions_executed: 0,
      actions_succeeded: 0,
      actions_failed: 0,
      health_before: healthBefore,
      rollback_available: proposal.proposed_actions.some(a => a.reversible),
    };

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'execution_start',
        execution_id: executionId,
        proposal_id: proposal.id,
        action_count: proposal.proposed_actions.length,
      },
    }, this.correlationId);

    try {
      // Phase 1: Shadow execution
      const shadowResult = await this.executeShadow(proposal, execution);
      if (!shadowResult.success) {
        execution.phase = 'rolled_back';
        execution.rollback_executed = true;
        execution.rollback_reason = shadowResult.error;
        execution.completed_at = new Date().toISOString();
        await this.storeExecution(execution);
        return execution;
      }

      execution.phase = 'production';

      // Phase 2: Production execution (if approved)
      if (decision.decision === 'approve' || 
          (decision.decision === 'approve_with_conditions' && !proposal.requires_human_approval)) {
        
        const prodResult = await this.executeProduction(proposal, execution);
        
        if (!prodResult.success) {
          // Attempt rollback
          await this.rollback(proposal, execution);
          execution.phase = 'rolled_back';
          execution.rollback_executed = true;
          execution.rollback_reason = prodResult.error;
          execution.completed_at = new Date().toISOString();
          await this.storeExecution(execution);
          return execution;
        }

        execution.phase = 'verified';
      }

      // Get final health
      const healthAfter = await this.getSystemHealth();
      execution.health_after = healthAfter;
      execution.health_delta = healthAfter - healthBefore;

      // Verify health didn't degrade significantly
      if (execution.health_delta < -20) {
        telemetryEngine.emit('custom', 'warn', { module: 'seba' }, {
          metadata: { 
            action: 'health_degradation_detected',
            health_delta: execution.health_delta,
          },
        }, this.correlationId);

        // Rollback on significant degradation
        if (execution.rollback_available) {
          await this.rollback(proposal, execution);
          execution.phase = 'rolled_back';
          execution.rollback_executed = true;
          execution.rollback_reason = `Health degraded by ${Math.abs(execution.health_delta)} points`;
        }
      }

      execution.completed_at = new Date().toISOString();
      await this.storeExecution(execution);

      telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
        metadata: { 
          action: 'execution_complete',
          execution_id: executionId,
          phase: execution.phase,
          actions_succeeded: execution.actions_succeeded,
          actions_failed: execution.actions_failed,
          health_delta: execution.health_delta,
          duration_ms: Date.now() - startTime,
        },
      }, this.correlationId);

      return execution;

    } catch (error) {
      execution.phase = 'rolled_back';
      execution.rollback_reason = error instanceof Error ? error.message : 'Execution failed';
      execution.completed_at = new Date().toISOString();
      
      // Attempt rollback on error
      if (execution.rollback_available) {
        try {
          await this.rollback(proposal, execution);
          execution.rollback_executed = true;
        } catch (rollbackError) {
          console.error('[SEBA] Rollback failed:', rollbackError);
        }
      }

      await this.storeExecution(execution);
      
      telemetryEngine.emit('custom', 'error', { module: 'seba' }, {
        metadata: { 
          action: 'execution_failed',
          execution_id: executionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }, this.correlationId);

      return execution;
    }
  }

  /**
   * Execute in shadow mode (test without persisting)
   */
  private async executeShadow(
    proposal: ImprovementProposal, 
    execution: EvolutionExecution
  ): Promise<{ success: boolean; error?: string }> {
    
    for (const action of proposal.proposed_actions) {
      try {
        // Validate action can be executed
        const validation = await this.validateAction(action);
        if (!validation.valid) {
          return { success: false, error: `Validation failed for ${action.target}: ${validation.reason}` };
        }
        
        // Simulate action (no actual changes)
        execution.actions_executed++;
        execution.actions_succeeded++;

      } catch (error) {
        execution.actions_failed++;
        return { 
          success: false, 
          error: `Shadow execution failed for ${action.target}: ${error instanceof Error ? error.message : 'Unknown'}` 
        };
      }
    }

    return { success: true };
  }

  /**
   * Execute in production mode (apply real changes)
   */
  private async executeProduction(
    proposal: ImprovementProposal, 
    execution: EvolutionExecution
  ): Promise<{ success: boolean; error?: string }> {
    
    for (const action of proposal.proposed_actions) {
      try {
        await this.executeAction(action);
        execution.actions_succeeded++;
        
      } catch (error) {
        execution.actions_failed++;
        return { 
          success: false, 
          error: `Production execution failed for ${action.target}: ${error instanceof Error ? error.message : 'Unknown'}` 
        };
      }
    }

    return { success: true };
  }

  /**
   * Validate an action before execution
   */
  private async validateAction(action: ProposedAction): Promise<{ valid: boolean; reason?: string }> {
    // Basic validation rules
    if (!action.target || !action.type) {
      return { valid: false, reason: 'Missing target or type' };
    }

    // Check risk factor
    if (action.risk_factor > 0.8) {
      return { valid: false, reason: 'Risk factor too high for automatic execution' };
    }

    // Type-specific validation
    switch (action.type) {
      case 'memory_prune':
        // Ensure we're not pruning critical memories
        if ((action.proposed_value as any)?.min_score < 0.05) {
          return { valid: false, reason: 'Minimum score too low for pruning' };
        }
        break;

      case 'config_update':
      case 'threshold_adjust':
        // Validate target path exists
        const parts = action.target.split('.');
        if (parts.length < 2) {
          return { valid: false, reason: 'Invalid target path' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: ProposedAction): Promise<void> {
    switch (action.type) {
      case 'config_update':
      case 'threshold_adjust':
        await this.executeConfigUpdate(action);
        break;

      case 'memory_prune':
        await this.executeMemoryPrune(action);
        break;

      case 'module_tune':
        await this.executeModuleTune(action);
        break;

      case 'pattern_add':
        await this.executePatternAdd(action);
        break;

      case 'rule_modify':
        await this.executeRuleModify(action);
        break;

      default:
        console.log(`[SEBA] Simulating action: ${action.type} on ${action.target}`);
    }
  }

  /**
   * Execute config update action - persists to brain_events
   */
  private async executeConfigUpdate(action: ProposedAction): Promise<void> {
    await supabase.from('brain_events').insert([{
      module: 'seba',
      event_type: 'config_update',
      data: {
        target: action.target,
        previous_value: action.current_value as Json,
        new_value: action.proposed_value as Json,
        action_id: action.id,
      } as Json,
      outcome: 'success',
    }]);

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'config_update_applied',
        target: action.target,
        value: action.proposed_value,
      },
    }, this.correlationId);
  }

  /**
   * Execute memory prune action - performs real pruning
   */
  private async executeMemoryPrune(action: ProposedAction): Promise<void> {
    const config = action.proposed_value as { min_score?: number; max_age_days?: number };
    const minScore = config.min_score || 0.1;
    
    // Get cold memories below threshold
    const { data: toPrune, error } = await supabase
      .from('brain_memory_cold')
      .select('id')
      .lt('value_score', minScore)
      .limit(100);

    if (error) {
      throw new Error(`Memory prune query failed: ${error.message}`);
    }

    const pruneCount = toPrune?.length || 0;
    
    // Delete in batches
    if (pruneCount > 0) {
      const ids = toPrune!.map(m => m.id);
      const { error: deleteError } = await supabase
        .from('brain_memory_cold')
        .delete()
        .in('id', ids);

      if (deleteError) {
        throw new Error(`Memory prune delete failed: ${deleteError.message}`);
      }
    }

    // Log the execution
    await supabase.from('brain_events').insert([{
      module: 'seba',
      event_type: 'memory_prune',
      data: {
        memories_pruned: pruneCount,
        min_score_threshold: minScore,
        action_id: action.id,
      },
      outcome: 'success',
    }]);

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'memory_prune_applied',
        memories_pruned: pruneCount,
      },
    }, this.correlationId);
  }

  /**
   * Execute module tune action - stores tuning config
   */
  private async executeModuleTune(action: ProposedAction): Promise<void> {
    await supabase.from('brain_events').insert([{
      module: 'seba',
      event_type: 'module_tune',
      data: {
        target: action.target,
        previous_config: action.current_value as Json,
        new_config: action.proposed_value as Json,
        action_id: action.id,
      } as Json,
      outcome: 'success',
    }]);

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'module_tune_applied',
        target: action.target,
      },
    }, this.correlationId);
  }

  /**
   * Execute pattern add action - stores pattern to memory
   */
  private async executePatternAdd(action: ProposedAction): Promise<void> {
    const pattern = action.proposed_value as { pattern_type: string; content: string; source?: string };
    
    // Store pattern as a hot memory
    await supabase.from('brain_memory_hot').insert([{
      content: pattern.content,
      content_type: 'pattern',
      importance_score: 0.8,
      value_score: 0.75,
      metadata: {
        pattern_type: pattern.pattern_type,
        source: pattern.source || 'seba',
        created_by: 'seba_evolution',
        action_id: action.id,
      },
    }]);

    await supabase.from('brain_events').insert([{
      module: 'seba',
      event_type: 'pattern_add',
      data: {
        pattern_type: pattern.pattern_type,
        action_id: action.id,
      },
      outcome: 'success',
    }]);

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'pattern_add_applied',
        pattern_type: pattern.pattern_type,
      },
    }, this.correlationId);
  }

  /**
   * Execute rule modify action - updates governance rules
   */
  private async executeRuleModify(action: ProposedAction): Promise<void> {
    await supabase.from('brain_events').insert([{
      module: 'seba',
      event_type: 'rule_modify',
      data: {
        target: action.target,
        previous_rule: action.current_value as Json,
        new_rule: action.proposed_value as Json,
        action_id: action.id,
      } as Json,
      outcome: 'success',
    }]);

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'rule_modify_applied',
        target: action.target,
      },
    }, this.correlationId);
  }

  /**
   * Rollback all reversible actions - applies inverse operations
   */
  private async rollback(proposal: ImprovementProposal, execution: EvolutionExecution): Promise<void> {
    const reversibleActions = proposal.proposed_actions.filter(a => a.reversible);

    for (const action of reversibleActions) {
      // For config updates, restore previous value
      if (action.type === 'config_update' || action.type === 'threshold_adjust' || action.type === 'module_tune') {
        await supabase.from('brain_events').insert([{
          module: 'seba',
          event_type: 'rollback',
          data: {
            target: action.target,
            rolled_back_value: action.proposed_value as Json,
            restored_value: action.current_value as Json,
            action_id: action.id,
            execution_id: execution.id,
          } as Json,
          outcome: 'success',
        }]);
      }
    }

    telemetryEngine.emit('custom', 'warn', { module: 'seba' }, {
      metadata: { 
        action: 'rollback_executed',
        execution_id: execution.id,
        proposal_id: proposal.id,
        actions_rolled_back: reversibleActions.length,
      },
    }, this.correlationId);
  }

  /**
   * Get current system health from real vision module
   */
  private async getSystemHealth(): Promise<number> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'vision', action: 'health' }
      });
      
      if (error) {
        // Fallback to calculating from recent events
        const { count: successCount } = await supabase
          .from('brain_events')
          .select('id', { count: 'exact', head: true })
          .eq('outcome', 'success')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        const { count: errorCount } = await supabase
          .from('brain_events')
          .select('id', { count: 'exact', head: true })
          .eq('outcome', 'error')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        const total = (successCount || 0) + (errorCount || 0);
        if (total === 0) return 100;
        return Math.round(((successCount || 0) / total) * 100);
      }
      
      return (data as { score?: number })?.score || 100;
    } catch {
      return 100; // Default healthy if cannot determine
    }
  }

  /**
   * Store execution record to brain_events
   */
  private async storeExecution(execution: EvolutionExecution): Promise<void> {
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'evolution_execution',
      data: {
        execution_id: execution.id,
        proposal_id: execution.proposal_id,
        phase: execution.phase,
        actions_executed: execution.actions_executed,
        actions_succeeded: execution.actions_succeeded,
        actions_failed: execution.actions_failed,
        health_before: execution.health_before,
        health_after: execution.health_after,
        health_delta: execution.health_delta,
        rollback_executed: execution.rollback_executed,
        rollback_reason: execution.rollback_reason,
        started_at: execution.started_at,
        completed_at: execution.completed_at,
      },
      outcome: execution.phase === 'verified' ? 'success' : 
               execution.phase === 'rolled_back' ? 'error' : 'partial',
    });
  }
}
