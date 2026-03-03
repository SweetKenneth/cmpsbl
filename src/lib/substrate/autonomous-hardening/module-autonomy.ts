/**
 * CMPSBL® Module Autonomous Action Framework v1.0.0
 * Safe, governed self-action for every substrate module
 * 
 * Each module gets a set of pre-approved autonomous actions
 * it can take without waiting for manual intervention.
 * All actions are bounded, reversible, and journaled.
 */

import { journalAction } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE AUTONOMY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

type ActionSafety = 'safe' | 'bounded' | 'supervised';

interface AutonomousAction {
  id: string;
  name: string;
  description: string;
  safety: ActionSafety;
  maxFrequency: number;     // max times per hour
  requiresHealthCheck: boolean;
  reversible: boolean;
}

interface ModuleAutonomy {
  module: string;
  enabled: boolean;
  actions: AutonomousAction[];
  executionLog: Array<{ actionId: string; ts: number; outcome: string }>;
  cooldownUntil: number;
}

const autonomyRegistry = new Map<string, ModuleAutonomy>();

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-APPROVED AUTONOMOUS ACTIONS PER MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_ACTIONS: Record<string, AutonomousAction[]> = {
  CORE: [
    { id: 'core_self_diagnostic', name: 'Self-Diagnostic', description: 'Run internal health check and report degradation', safety: 'safe', maxFrequency: 60, requiresHealthCheck: false, reversible: false },
    { id: 'core_cache_flush', name: 'Cache Flush', description: 'Clear stale caches when memory pressure is high', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: false },
    { id: 'core_priority_rebalance', name: 'Priority Rebalance', description: 'Adjust request queue priorities based on load', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: true },
  ],
  DECODE: [
    { id: 'decode_context_prune', name: 'Context Prune', description: 'Trim conversation context when token budget is exceeded', safety: 'safe', maxFrequency: 120, requiresHealthCheck: false, reversible: false },
    { id: 'decode_voice_recalibrate', name: 'Voice Recalibrate', description: 'Auto-adjust voice profile weights based on feedback', safety: 'bounded', maxFrequency: 12, requiresHealthCheck: true, reversible: true },
    { id: 'decode_guardrail_tighten', name: 'Guardrail Tighten', description: 'Increase epistemic scrutiny when confidence drops', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: true },
  ],
  ENCODE: [
    { id: 'encode_lint_autofix', name: 'Lint Auto-Fix', description: 'Auto-correct minor code style violations in proposals', safety: 'safe', maxFrequency: 60, requiresHealthCheck: false, reversible: true },
    { id: 'encode_complexity_gate', name: 'Complexity Gate', description: 'Block proposals exceeding cyclomatic complexity threshold', safety: 'safe', maxFrequency: 120, requiresHealthCheck: false, reversible: false },
  ],
  VISION: [
    { id: 'vision_anomaly_scan', name: 'Anomaly Scan', description: 'Proactively scan for statistical anomalies in metrics', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: false },
    { id: 'vision_alert_dedup', name: 'Alert Dedup', description: 'Suppress duplicate alerts within correlation window', safety: 'safe', maxFrequency: 120, requiresHealthCheck: false, reversible: false },
    { id: 'vision_baseline_refresh', name: 'Baseline Refresh', description: 'Recalculate health baselines from recent data', safety: 'bounded', maxFrequency: 4, requiresHealthCheck: true, reversible: true },
  ],
  CORTEX: [
    { id: 'cortex_reasoning_warmup', name: 'Reasoning Warmup', description: 'Pre-warm reasoning caches for anticipated tasks', safety: 'safe', maxFrequency: 20, requiresHealthCheck: false, reversible: false },
    { id: 'cortex_hypothesis_prune', name: 'Hypothesis Prune', description: 'Discard low-confidence hypotheses to free resources', safety: 'bounded', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  NEXUS: [
    { id: 'nexus_provider_failover', name: 'Provider Failover', description: 'Automatically switch to next healthy AI provider on failure', safety: 'safe', maxFrequency: 120, requiresHealthCheck: false, reversible: true },
    { id: 'nexus_budget_rebalance', name: 'Budget Rebalance', description: 'Reallocate token budgets based on utilization patterns', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: true },
    { id: 'nexus_cache_warmup', name: 'Cache Warmup', description: 'Pre-populate response cache for high-frequency queries', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  DEFENSE: [
    { id: 'defense_posture_adjust', name: 'Posture Adjust', description: 'Shift security posture based on threat indicators', safety: 'bounded', maxFrequency: 12, requiresHealthCheck: true, reversible: true },
    { id: 'defense_fingerprint_update', name: 'Fingerprint Update', description: 'Update behavioral fingerprint baselines', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
    { id: 'defense_auto_block', name: 'Auto-Block', description: 'Block IPs exceeding threat score threshold', safety: 'supervised', maxFrequency: 30, requiresHealthCheck: true, reversible: true },
  ],
  GOVERNANCE: [
    { id: 'gov_policy_refresh', name: 'Policy Refresh', description: 'Re-evaluate active policies for expiry or conflict', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
    { id: 'gov_drift_alert', name: 'Drift Alert', description: 'Emit governance drift warnings when thresholds exceeded', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: false },
    { id: 'gov_cooldown_enforce', name: 'Cooldown Enforce', description: 'Apply automatic cooldowns after rapid decision sequences', safety: 'safe', maxFrequency: 60, requiresHealthCheck: false, reversible: false },
  ],
  BRAIN: [
    { id: 'brain_embedding_refresh', name: 'Embedding Refresh', description: 'Recalculate stale embeddings in background', safety: 'bounded', maxFrequency: 4, requiresHealthCheck: true, reversible: false },
    { id: 'brain_drift_detect', name: 'Drift Detect', description: 'Monitor classifier drift and flag degradation', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  MEMORY: [
    { id: 'memory_gc_sweep', name: 'GC Sweep', description: 'Garbage collect expired or low-relevance memories', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: false },
    { id: 'memory_dedup_scan', name: 'Dedup Scan', description: 'Find and merge duplicate memory entries', safety: 'bounded', maxFrequency: 4, requiresHealthCheck: true, reversible: false },
    { id: 'memory_tier_promote', name: 'Tier Promote', description: 'Auto-promote frequently accessed memories to hot tier', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: true },
  ],
  DREAM: [
    { id: 'dream_synthesis_trigger', name: 'Synthesis Trigger', description: 'Initiate pattern synthesis when idle resources available', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: false },
    { id: 'dream_insight_archive', name: 'Insight Archive', description: 'Archive low-value dream insights to cold storage', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: true },
  ],
  ECONOMY: [
    { id: 'economy_cost_alert', name: 'Cost Alert', description: 'Alert when spending exceeds hourly budget threshold', safety: 'safe', maxFrequency: 60, requiresHealthCheck: false, reversible: false },
    { id: 'economy_budget_throttle', name: 'Budget Throttle', description: 'Reduce non-critical calls when budget is 80% consumed', safety: 'bounded', maxFrequency: 12, requiresHealthCheck: true, reversible: true },
  ],
  IMMUNITY: [
    { id: 'immunity_shadow_repair', name: 'Shadow Repair', description: 'Practice repair patterns in shadow mode', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
    { id: 'immunity_cascade_break', name: 'Cascade Break', description: 'Apply circuit breaks to stop cascading failures', safety: 'supervised', maxFrequency: 12, requiresHealthCheck: true, reversible: true },
  ],
  EVOLUTION: [
    { id: 'evo_scan_trigger', name: 'Scan Trigger', description: 'Initiate integrity scan when health score drops', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
    { id: 'evo_snapshot_create', name: 'Snapshot Create', description: 'Create pre-mutation rollback snapshot automatically', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: false },
  ],
  INTENT: [
    { id: 'intent_goal_reprioritize', name: 'Goal Reprioritize', description: 'Reorder pending goals based on urgency signals', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: true },
    { id: 'intent_stale_cleanup', name: 'Stale Cleanup', description: 'Archive goals older than 24h with no progress', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: false, reversible: true },
  ],
  ENGINEER: [
    { id: 'eng_debt_triage', name: 'Debt Triage', description: 'Auto-triage technical debt by severity and impact', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
    { id: 'eng_health_report', name: 'Health Report', description: 'Generate engine health report for degraded systems', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  ATLAS: [
    { id: 'atlas_intent_digest', name: 'Intent Digest', description: 'Compile pending intents into human-readable digest', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  AUDIT: [
    { id: 'audit_chain_verify', name: 'Chain Verify', description: 'Verify integrity of audit chain links', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
    { id: 'audit_retention_sweep', name: 'Retention Sweep', description: 'Archive audit entries past retention window', safety: 'bounded', maxFrequency: 4, requiresHealthCheck: true, reversible: false },
  ],
  RELAY: [
    { id: 'relay_dlq_retry', name: 'DLQ Retry', description: 'Retry failed webhook deliveries from dead letter queue', safety: 'bounded', maxFrequency: 12, requiresHealthCheck: true, reversible: false },
    { id: 'relay_health_failover', name: 'Health Failover', description: 'Switch to backup delivery provider on primary failure', safety: 'safe', maxFrequency: 30, requiresHealthCheck: false, reversible: true },
  ],
  RIPPLE: [
    { id: 'ripple_dedup_flush', name: 'Dedup Flush', description: 'Clear expired deduplication hashes', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  INCLUSIVE: [
    { id: 'inclusive_a11y_scan', name: 'Accessibility Scan', description: 'Run proactive accessibility audit on new components', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  SANDBOX: [
    { id: 'sandbox_resource_cleanup', name: 'Resource Cleanup', description: 'Clean up expired sandbox environments', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
  ],
  // Expansion modules
  SOVEREIGN: [
    { id: 'sov_jurisdiction_check', name: 'Jurisdiction Check', description: 'Re-evaluate data residency compliance on config change', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
  ],
  ORACLE: [
    { id: 'oracle_prediction_refresh', name: 'Prediction Refresh', description: 'Update predictive models with latest telemetry', safety: 'bounded', maxFrequency: 4, requiresHealthCheck: true, reversible: false },
  ],
  FORGE: [
    { id: 'forge_template_validate', name: 'Template Validate', description: 'Re-validate pipeline templates after registry changes', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
  ECHO: [
    { id: 'echo_distribution_optimize', name: 'Distribution Optimize', description: 'Rebalance content distribution weights', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: true },
  ],
  PHANTOM: [
    { id: 'phantom_simulation_cycle', name: 'Simulation Cycle', description: 'Run background what-if simulations on proposals', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
  ],
  REFLEX: [
    { id: 'reflex_response_tune', name: 'Response Tune', description: 'Auto-tune response latency thresholds based on P95', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: true },
  ],
  HARVEST: [
    { id: 'harvest_source_rotate', name: 'Source Rotate', description: 'Rotate data sources to maintain freshness', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: false, reversible: true },
  ],
  COMPASS: [
    { id: 'compass_alignment_check', name: 'Alignment Check', description: 'Verify module alignment with strategic objectives', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
  ],
  LINGUA: [
    { id: 'lingua_model_swap', name: 'Model Swap', description: 'Switch translation model on quality degradation', safety: 'bounded', maxFrequency: 6, requiresHealthCheck: true, reversible: true },
  ],
  CONSCIENCE: [
    { id: 'conscience_bias_scan', name: 'Bias Scan', description: 'Run proactive bias detection on active pipelines', safety: 'safe', maxFrequency: 6, requiresHealthCheck: false, reversible: false },
  ],
  IDENTITY: [
    { id: 'identity_session_cleanup', name: 'Session Cleanup', description: 'Expire stale identity sessions', safety: 'safe', maxFrequency: 12, requiresHealthCheck: false, reversible: false },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FRAMEWORK API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize autonomy for all modules with pre-approved actions.
 */
export function initializeModuleAutonomy(): void {
  for (const [module, actions] of Object.entries(MODULE_ACTIONS)) {
    autonomyRegistry.set(module, {
      module,
      enabled: true,
      actions,
      executionLog: [],
      cooldownUntil: 0,
    });
  }
}

/**
 * Execute an autonomous action for a module.
 * Returns true if the action was allowed and executed.
 */
export function executeAutonomousAction(
  module: string,
  actionId: string,
  executor: () => void | Promise<void>
): { allowed: boolean; reason?: string } {
  const autonomy = autonomyRegistry.get(module);
  if (!autonomy) return { allowed: false, reason: `Module '${module}' not registered` };
  if (!autonomy.enabled) return { allowed: false, reason: `Module '${module}' autonomy disabled` };
  
  const action = autonomy.actions.find(a => a.id === actionId);
  if (!action) return { allowed: false, reason: `Action '${actionId}' not found for ${module}` };
  
  // Check cooldown
  if (Date.now() < autonomy.cooldownUntil) {
    return { allowed: false, reason: 'Module in cooldown' };
  }
  
  // Check frequency
  const oneHourAgo = Date.now() - 3600_000;
  const recentExecutions = autonomy.executionLog.filter(l => l.actionId === actionId && l.ts > oneHourAgo);
  if (recentExecutions.length >= action.maxFrequency) {
    return { allowed: false, reason: `Frequency limit reached (${action.maxFrequency}/hr)` };
  }
  
  // Execute
  try {
    const result = executor();
    if (result instanceof Promise) result.catch(() => {});
    autonomy.executionLog.push({ actionId, ts: Date.now(), outcome: 'success' });
    journalAction(module, actionId, action.description, 'success');
    
    // Trim log
    if (autonomy.executionLog.length > 200) autonomy.executionLog.splice(0, autonomy.executionLog.length - 200);
    
    return { allowed: true };
  } catch (err) {
    autonomy.executionLog.push({ actionId, ts: Date.now(), outcome: 'failure' });
    journalAction(module, actionId, `Failed: ${err instanceof Error ? err.message : 'unknown'}`, 'failure');
    return { allowed: false, reason: `Execution failed: ${err instanceof Error ? err.message : 'unknown'}` };
  }
}

/**
 * Enable/disable autonomy for a specific module.
 */
export function setModuleAutonomy(module: string, enabled: boolean): void {
  const autonomy = autonomyRegistry.get(module);
  if (autonomy) {
    autonomy.enabled = enabled;
    journalAction(module, 'autonomy_toggle', `Autonomy ${enabled ? 'enabled' : 'disabled'}`, 'success');
  }
}

/**
 * Apply a cooldown to a module (e.g., after a failed action).
 */
export function applyModuleCooldown(module: string, durationMs: number): void {
  const autonomy = autonomyRegistry.get(module);
  if (autonomy) autonomy.cooldownUntil = Date.now() + durationMs;
}

/**
 * Get the full autonomy status for all modules.
 */
export function getAutonomyStatus(): Array<{
  module: string;
  enabled: boolean;
  actionCount: number;
  recentActions: number;
  inCooldown: boolean;
}> {
  const oneHourAgo = Date.now() - 3600_000;
  return [...autonomyRegistry.values()].map(a => ({
    module: a.module,
    enabled: a.enabled,
    actionCount: a.actions.length,
    recentActions: a.executionLog.filter(l => l.ts > oneHourAgo).length,
    inCooldown: Date.now() < a.cooldownUntil,
  }));
}

/**
 * Get available actions for a specific module.
 */
export function getModuleActions(module: string): AutonomousAction[] {
  return autonomyRegistry.get(module)?.actions ?? [];
}

/**
 * Get execution history for a module.
 */
export function getModuleExecutionLog(module: string, limit = 50): Array<{ actionId: string; ts: number; outcome: string }> {
  return autonomyRegistry.get(module)?.executionLog.slice(-limit) ?? [];
}

/**
 * Get total autonomous action count across all modules.
 */
export function getTotalAutonomousActions(): number {
  return [...autonomyRegistry.values()].reduce((sum, a) => sum + a.actions.length, 0);
}

// Initialize on import
initializeModuleAutonomy();
