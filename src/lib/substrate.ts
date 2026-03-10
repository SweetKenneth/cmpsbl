/**
 * CMPSBL® Substrate Client
 * 40-Node / 12-Sector Field-Based Topology
 *
 * CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM)
 *   → OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE)
 *   → Execution (DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION)
 *   → ESZ (SOVEREIGN, ORACLE, CONSCIENCE, TREATY) → EPZ (COMPASS, ECHO, REFLEX)
 *   → EMZ (FORGE, LINGUA, HARVEST)
 *   → CSZ (EVOLUTION, SHADOW, PHANTOM)
 *   → Fields (IMMUNITY, INTENT) → Plane (GOVERNANCE) → Shell (DEFENSE)
 *
 * All nodes expose: status(), pulse(), and domain-specific methods
 * All nodes wired into: terminal, CLM, parity, events, health, BRAIN writeback
 */

import { supabase } from '@/integrations/supabase/client';
import { recordSuccess as cbRecordSuccess, recordFailure as cbRecordFailure, canExecute as cbCanExecute } from '@/lib/substrate/circuit-breaker';
import { recordSample } from '@/lib/substrate/predictive-failure';

export type SubstrateModule = 'core' | 'brain' | 'decode' | 'encode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'ripple' | 'access' | 'system' | 'evolution' | 'integration' | 'inclusive' | 'cortex' | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox' | 'immunity' | 'intent' | 'governance' | 'medic' | 'nerve' | 'shadow' | 'sovereign' | 'oracle' | 'conscience' | 'phantom' | 'forge' | 'lingua' | 'compass' | 'echo' | 'treaty' | 'harvest' | 'reflex' | 'engineer' | 'atlas';

export interface SubstrateRequest {
  module: SubstrateModule;
  action: string;
  payload?: Record<string, unknown>;
}

export interface SubstrateResponse<T = unknown> {
  success: boolean;
  module: SubstrateModule;
  action: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC TIMEOUT CONFIGURATION
// Long-running commands get extended timeouts (60s); status/pulse get short ones (15s).
// Hard ceiling of 60s prevents runaway processes.
// ═══════════════════════════════════════════════════════════════════════════════

const LONG_RUNNING_ACTIONS = new Set([
  'optimize', 'tier', 'prune', 'cognitive_cycle', 'deep_think',
  'graph_build', 'synthesize', 'dream', 'reflect', 'continuous_learn',
  'reinforce_cycle', 'scan', 'evolve', 'heal', 'backup', 'restore',
  'cycle', 'propose', 'execute', 'pattern_fusion', 'insight_synthesize',
  'insight_aggregate', 'coherence_check', 'scan_adapt', 'run_all',
]);

const QUICK_ACTIONS = new Set([
  'status', 'pulse', 'health', 'version', 'config', 'list',
  'providers', 'rules', 'limits', 'posture', 'mood',
]);

function getTimeoutForAction(action: string): number {
  if (LONG_RUNNING_ACTIONS.has(action)) return 60000;
  if (QUICK_ACTIONS.has(action)) return 15000;
  return 30000;
}

class SubstrateClient {
  private static instance: SubstrateClient;

  private constructor() {}

  static getInstance(): SubstrateClient {
    if (!SubstrateClient.instance) {
      SubstrateClient.instance = new SubstrateClient();
    }
    return SubstrateClient.instance;
  }

  async invoke<T = unknown>(request: SubstrateRequest): Promise<SubstrateResponse<T>> {
    const timeoutMs = getTimeoutForAction(request.action);
    const circuitKey = `module:${request.module}`;
    const invokeStart = Date.now();

    // Circuit breaker pre-check — reject if module circuit is open
    if (!cbCanExecute(circuitKey)) {
      return {
        success: false,
        module: request.module,
        action: request.action,
        error: `Module ${request.module} circuit is OPEN — request rejected. Will auto-recover.`,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Use AbortController for proper timeout that cancels the underlying fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const { data, error } = await supabase.functions.invoke('pf-substrate', {
          body: request,
        });

        clearTimeout(timeoutId);
        const now = new Date().toISOString();
        const latency = Date.now() - invokeStart;

        // Feed latency into predictive failure engine
        recordSample({ moduleId: request.module, metric: 'latency_ms', value: latency, timestamp: Date.now() });

        if (error) {
          cbRecordFailure(circuitKey);
          recordSample({ moduleId: request.module, metric: 'error_rate', value: 1, timestamp: Date.now() });
          return {
            success: false,
            module: request.module,
            action: request.action,
            error: error.message,
            timestamp: now,
          };
        }

        // Many substrate actions return HTTP 200 with a JSON body containing { success: false, ... }.
        const payload = data as any;
        if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
          const message =
            payload.error_message ||
            payload.error ||
            payload.message ||
            'Command failed';

          // Soft failure — don't trip circuit for business-logic failures
          recordSample({ moduleId: request.module, metric: 'error_rate', value: 0.5, timestamp: Date.now() });

          return {
            success: false,
            module: request.module,
            action: request.action,
            error: String(message),
            data: payload as T,
            timestamp: now,
          };
        }

        // Success — record to circuit breaker
        cbRecordSuccess(circuitKey);
        recordSample({ moduleId: request.module, metric: 'error_rate', value: 0, timestamp: Date.now() });

        return {
          success: true,
          module: request.module,
          action: request.action,
          data: data as T,
          timestamp: now,
        };
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      cbRecordFailure(circuitKey);
      recordSample({ moduleId: request.module, metric: 'error_rate', value: 1, timestamp: Date.now() });
      return {
        success: false,
        module: request.module,
        action: request.action,
        error: isTimeout
          ? `Command timed out after ${timeoutMs / 1000}s. The operation may still be running on the server.`
          : (err instanceof Error ? err.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Brain Module — Memory, Learning Engine, Imagination Engine, Reasoning Engine, Governance Guard
  // NOTE: memory_core provides unified lifecycle (ingest → store → index → reflect → retrieve)
  // NOTE: learning_engine provides unified learning lifecycle (input → feedback → adjustment → reinforcement → stabilization)
  // NOTE: imagination_engine provides unified imagination lifecycle (latent_extraction → recombination → simulation → synthesis)
  // NOTE: reasoning_engine provides unified reasoning lifecycle (causal_mapping → dependency_analysis → hypothesis_generation → hypothesis_validation → impact_projection)
  // NOTE: governance_guard provides unified governance lifecycle (coherence_validation → ethical_constraint_check → governance_signal_emission)
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    /** @deprecated Use imaginationEngine.runCycle() - Cross-domain cognitive synthesis */
    synthesize: () =>
      this.invoke({ module: 'brain', action: 'synthesize' }),
    
    /** Probabilistic forecasting engine */
    forecast: (metric?: string, window?: string) =>
      this.invoke({ module: 'brain', action: 'forecast', payload: { metric, window } }),
    
    status: () =>
      this.invoke({ module: 'brain', action: 'status' }),
    
    // Extended Brain methods
    query: (query_text: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'query', payload: { query_text, limit } }),
    
    remember: (content: string, memory_type: string, confidence?: number, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'brain', action: 'remember', payload: { content, memory_type, confidence, metadata } }),
    
    /** @deprecated Use learningEngine.reinforcement() - Strengthen memory weights */
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    /** @deprecated Use imaginationEngine.dream() - Autonomous dream processing */
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
    
    /** Memory optimization - prune, decay, and rebalance tiers */
    optimize: (mode?: 'standard' | 'aggressive' | 'deep') =>
      this.invoke({ module: 'brain', action: 'optimize', payload: { mode: mode || 'standard' } }),
    
    /** Run hot→warm→cold tiering cycle */
    tier: (mode?: 'standard' | 'aggressive' | 'deep') =>
      this.invoke({ module: 'brain', action: 'tier', payload: { mode: mode || 'standard' } }),
    
    /** Prune low-value memories */
    prune: (threshold?: number) =>
      this.invoke({ module: 'brain', action: 'prune', payload: { threshold: threshold || 0.1 } }),
    
    /** Deep thinking mode - extended reasoning with chain of thought */
    deepThink: (query: string, depth?: number) =>
      this.invoke({ module: 'brain', action: 'deep_think', payload: { query, depth } }),
    
    /** @deprecated Use reasoningEngine.hypothesisValidation() - Test a hypothesis against the knowledge graph */
    hypothesisTest: (hypothesis: string) =>
      this.invoke({ module: 'brain', action: 'hypothesis_test', payload: { hypothesis } }),
    
    /** Full cognitive cycle - learn, reflect, dream, synthesize */
    cognitiveCycle: () =>
      this.invoke({ module: 'brain', action: 'cognitive_cycle' }),
    
    /** Toggle continuous learning mode */
    continuousLearn: (enabled: boolean) =>
      this.invoke({ module: 'brain', action: 'continuous_learn', payload: { enabled } }),
    
    /** Build/update knowledge graph connections */
    graphBuild: () =>
      this.invoke({ module: 'brain', action: 'graph_build' }),
    
    /** v3.6.0: Knowledge graph summary - nodes, edges, connectivity (read-only) */
    graphSummary: () =>
      this.invoke({ module: 'brain', action: 'graph_summary' }),
    
    /** v5.6.0: Knowledge graph surfaces (read-only) */
    graph: (options?: { inspect?: boolean; stats?: boolean; export?: boolean; page?: number }) =>
      this.invoke({ module: 'brain', action: 'graph', payload: options }),
    
    /** Get curiosity log - exploration queries */
    curiosity: () =>
      this.invoke({ module: 'brain', action: 'curiosity' }),
    
    /** Trigger active research based on curiosity */
    explore: (query: string) =>
      this.invoke({ module: 'brain', action: 'explore', payload: { query } }),
    
    /** Get learning patterns and insights */
    patterns: () =>
      this.invoke({ module: 'brain', action: 'patterns' }),
    
    /** v3.5.0: Session reflection - cross-module activity summary (read-only, Observer-eligible) */
    sessionReflection: (hours?: number) =>
      this.invoke({ module: 'brain', action: 'session_reflection', payload: { hours } }),
    
    /** @deprecated Use governanceGuard.coherenceValidation() - Memory coherence validation */
    coherenceCheck: (depth?: 'standard' | 'deep') =>
      this.invoke({ module: 'brain', action: 'coherence_check', payload: { depth } }),
    
    // ═══ v6.1.0: MEMORY CORE LIFECYCLE ═══
    
    /** Unified memory ingest - routes through memory_core lifecycle */
    memoryIngest: (content: string, options?: { type?: string; source?: string; confidence?: number; tags?: string[] }) =>
      this.invoke({ module: 'brain', action: 'memory_ingest', payload: { content, ...options } }),
    
    /** Unified memory retrieve - multi-strategy recall */
    memoryRetrieve: (query: string, options?: { tier?: string; type?: string; limit?: number; strategy?: string }) =>
      this.invoke({ module: 'brain', action: 'memory_retrieve', payload: { query, ...options } }),
    
    /** Get memory state schema (short-term/long-term/latent) */
    memoryState: () =>
      this.invoke({ module: 'brain', action: 'memory_state' }),
    
    /** Run full cognitive memory cycle */
    memoryCycle: (content: string, options?: { autoIndex?: boolean; autoReflect?: boolean }) =>
      this.invoke({ module: 'brain', action: 'memory_cycle', payload: { content, ...options } }),
    
    // ═══ v6.3.0: REASONING ENGINE (Phase 3) ═══
    
    /** @deprecated Use reasoningEngine.causalMapping() - Map causal relationships */
    causal: (context: string) =>
      this.invoke({ module: 'brain', action: 'causal', payload: { context } }),
    
    /** @deprecated Use reasoningEngine.dependencyAnalysis() - Analyze system dependencies */
    systemsReason: (context: string) =>
      this.invoke({ module: 'brain', action: 'systems_reason', payload: { context } }),
    
    /** v6.3.0: Reasoning Engine - run full reasoning cycle */
    reasoningCycle: (context: string, options?: { domain?: string; depth?: 'shallow' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'brain', action: 'reasoning_cycle', payload: { context, ...options } }),
    
    // ═══ v6.3.0: GOVERNANCE GUARD (Phase 3) ═══
    
    /** @deprecated Use governanceGuard.ethicalConstraintCheck() - Ethical validation */
    ethical: (content: string) =>
      this.invoke({ module: 'brain', action: 'ethical', payload: { content } }),
    
    /** v6.3.0: Governance Guard - run full governance cycle */
    governanceCycle: (content: string, options?: { context?: string; strict_mode?: boolean }) =>
      this.invoke({ module: 'brain', action: 'governance_cycle', payload: { content, ...options } }),
  };

  // Decode Module — Interpreter Primitive (NOT a chatbot, persona, or agent)
  decode = {
    /** 
     * Primary chat interface for cognitive interpretation
     * NOTE: Decode is an interpreter, not an assistant
     */
    chat: (message: string, sessionId?: string) =>
      this.invoke({ module: 'decode', action: 'chat', payload: { message, sessionId } }),
    
    /** Initiate a dream cycle */
    dream: () =>
      this.invoke({ module: 'decode', action: 'dream' }),
    
    /** Submit a proposal for substrate consideration */
    propose: (idea: string) =>
      this.invoke({ module: 'decode', action: 'propose', payload: { idea } }),
    
    /** Learn from interaction */
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'decode', action: 'learn', payload: { content, source } }),
    
    /** Get Decode module status */
    status: () =>
      this.invoke({ module: 'decode', action: 'status' }),
    
    /** v3.2.0: Extract structured intent from a message */
    intent: (message: string) =>
      this.invoke({ module: 'decode', action: 'intent', payload: { message } }),
    
    // ═══ v7.1.0: PERSONALITY SUBSYSTEM ═══
    // Interpretive filters only — do NOT affect execution, permissions, or memory
    
    /** Personality subsystem - access via personalityEngine for full API */
    personality: {
      /** List all personality profiles */
      list: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.list() };
      },
      /** Get current personality state */
      get: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.get() };
      },
      /** Set personality profile */
      set: async (profile: string) => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.set(profile as any) };
      },
      /** Enable auto-detection */
      auto: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.enableAuto() };
      },
      /** Lock current profile */
      lock: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.lock() };
      },
      /** Unlock profile */
      unlock: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.unlock() };
      },
      /** Detect personality from text */
      detect: async (text: string) => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.detect(text) };
      },
      /** Interpret with personality lens */
      interpret: async (text: string) => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.interpret(text) };
      },
      /** Reset to neutral */
      reset: async () => {
        const { personalityEngine } = await import('@/lib/substrate/decode');
        return { success: true, data: personalityEngine.reset() };
      },
    },
  };

  // Defense Module — Security & Threat Analysis
  defense = {
    analyze: (fingerprint: Record<string, unknown>, ip?: string) =>
      this.invoke({ module: 'defense', action: 'analyze', payload: { fingerprint, ip } }),
    
    report: (threatId: string) =>
      this.invoke({ module: 'defense', action: 'report', payload: { threatId } }),
    
    rules: () =>
      this.invoke({ module: 'defense', action: 'rules' }),
    
    reputation: (ip_address: string) =>
      this.invoke({ module: 'defense', action: 'reputation', payload: { ip_address } }),
    
    status: () =>
      this.invoke({ module: 'defense', action: 'status' }),
    
    /** v3.1.0: Real anomaly detection with pattern analysis */
    anomaly: (timeWindow: '1h' | '6h' | '24h' = '1h') =>
      this.invoke({ module: 'defense', action: 'anomaly', payload: { timeWindow } }),
    
    /** v3.4.0: Statistical anomaly probe with z-score analysis (read-only, Observer-eligible) */
    anomalyProbe: (lookbackHours?: number) =>
      this.invoke({ module: 'defense', action: 'anomaly_probe', payload: { lookbackHours } }),
    
    /** v3.6.0: Unified rate limit status across edge functions (read-only) */
    limits: () =>
      this.invoke({ module: 'defense', action: 'limits' }),

    /** v3.7.0: Consolidated security posture summary (read-only) */
    posture: () =>
      this.invoke({ module: 'defense', action: 'posture' }),
    
    /** v3.11.0: IP intelligence with reputation analysis (read-only) */
    ipIntel: (ip_address: string, include_history?: boolean) =>
      this.invoke({ module: 'defense', action: 'ip_intel', payload: { ip_address, include_history } }),
  };

  // Nexus Module — Multi-Provider AI Routing
  nexus = {
    text: (prompt: string, model?: string) =>
      this.invoke({ module: 'nexus', action: 'text', payload: { prompt, model } }),
    
    image: (prompt: string, model?: string) =>
      this.invoke({ module: 'nexus', action: 'image', payload: { prompt, model } }),
    
    route: (task: string) =>
      this.invoke({ module: 'nexus', action: 'route', payload: { task } }),
    
    status: () =>
      this.invoke({ module: 'nexus', action: 'status' }),
    
    /** v3.5.0: Provider availability matrix (read-only, Observer-eligible) */
    providers: () =>
      this.invoke({ module: 'nexus', action: 'providers' }),
    
    /** v3.8.0: AI routing analytics - 24h call/token/cost breakdown (read-only) */
    routeStats: () =>
      this.invoke({ module: 'nexus', action: 'route_stats' }),
  };

  // Vision Module — Observability & Metrics
  vision = {
    metrics: () =>
      this.invoke({ module: 'vision', action: 'metrics' }),
    
    health: () =>
      this.invoke({ module: 'vision', action: 'health' }),
    
    logs: (module?: SubstrateModule, limit?: number) =>
      this.invoke({ module: 'vision', action: 'logs', payload: { module, limit } }),
    
    /** Create an alert with severity level */
    alert: (severity: 'info' | 'warn' | 'error' | 'critical', message: string, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'vision', action: 'alert', payload: { severity, message, metadata } }),
    
    /** Get audit log entries */
    audit: (entity?: string, action?: string) =>
      this.invoke({ module: 'vision', action: 'audit', payload: { entity, action } }),
    
    status: () =>
      this.invoke({ module: 'vision', action: 'status' }),
    
    /** v3.1.0: Real dashboard data with orchestrator, metrics, AI usage */
    dashboard: () =>
      this.invoke({ module: 'vision', action: 'dashboard' }),
    
    /** v3.2.0: Distributed tracing - create or query traces */
    trace: (traceId?: string, options?: { create?: boolean; module?: string; action?: string; duration_ms?: number }) =>
      this.invoke({ module: 'vision', action: 'trace', payload: { traceId, ...options } }),
    
    /** v3.3.0: Ecosystem health monitoring - comprehensive subsystem check */
    monitor: () =>
      this.invoke({ module: 'vision', action: 'monitor' }),
    
    /** v3.3.0: Resilience framework - error analysis with auto-fix proposals */
    resilience: () =>
      this.invoke({ module: 'vision', action: 'resilience' }),
    
    /** v3.3.0: Threat analytics - 24h defense event rollup */
    analytics: () =>
      this.invoke({ module: 'vision', action: 'analytics' }),
    
    /** v3.4.0: Quick health snapshot (read-only, Observer-eligible) */
    healthSnapshot: () =>
      this.invoke({ module: 'vision', action: 'health_snapshot' }),
    
    /** v3.6.0: Deep substrate introspection - internals, modules, cognition (read-only) */
    introspection: () =>
      this.invoke({ module: 'vision', action: 'introspection' }),

    /** v3.7.0: Ultra-lightweight heartbeat - zero DB queries, pure in-memory (read-only) */
    pulse: () =>
      this.invoke({ module: 'vision', action: 'pulse' }),
    
    /** v3.8.0: AI usage quota observability - daily limits, pressure, cost (read-only) */
    quota: () =>
      this.invoke({ module: 'vision', action: 'quota' }),
    
    /** v3.11.0: Module dependency map with health correlation (read-only) */
    dependencyMap: () =>
      this.invoke({ module: 'vision', action: 'dependency_map' }),
    
    /** v5.6.0: Inspect observability state */
    inspect: (options?: { links?: boolean }) =>
      this.invoke({ module: 'vision', action: 'inspect', payload: options }),
    
    /** v5.6.0: Diagnostics for observability */
    diagnostics: (options?: { full?: boolean }) =>
      this.invoke({ module: 'vision', action: 'diagnostics', payload: options }),
  };

  // System Module — Administration & Configuration
  system = {
    status: () =>
      this.invoke({ module: 'system', action: 'status' }),
    
    version: () =>
      this.invoke({ module: 'system', action: 'version' }),
    
    config: (key?: string) =>
      this.invoke({ module: 'system', action: 'config', payload: { key } }),
    
    audit: (since?: string, type?: string) =>
      this.invoke({ module: 'system', action: 'audit', payload: { since, type } }),
    
    /** v4.8.0: Resilience snapshot surface - circuit breakers, health, heals */
    resilience: (role?: 'observer' | 'operator') =>
      this.invoke({ module: 'system', action: 'resilience', payload: { role } }),
    
    /** v3.1.0: Full system heal - restores all modules to 100% health */
    heal: (target?: string, force?: boolean) =>
      this.invoke({ module: 'system', action: 'heal', payload: { target, force } }),
    
    /** v3.1.0: Comprehensive health diagnostics with circuit breaker status */
    health: () =>
      this.invoke({ module: 'system', action: 'health' }),
    
    /** v3.1.0: Full system diagnostics including orchestrator, providers, modules */
    diagnostics: (options?: { full?: boolean }) =>
      this.invoke({ module: 'system', action: 'diagnostics', payload: options }),
    
    /** Restart a specific service or all services */
    restart: (service?: string) =>
      this.invoke({ module: 'system', action: 'restart', payload: { service } }),
    
    /** v3.2.0: Create a validated backup snapshot with optional data export */
    backup: (options?: { include_data?: boolean; tables?: string[] }) =>
      this.invoke({ module: 'system', action: 'backup', payload: options }),
    
    /** v3.2.0: Restore from backup with validation */
    restore: (backup_id: string, validate_only?: boolean) =>
      this.invoke({ module: 'system', action: 'restore', payload: { backup_id, validate_only } }),
    
    /** v5.5.1: Restore from portable JSON backup (governor only) */
    restorePortable: (options: { export_package: Record<string, unknown>; dry_run?: boolean; mode?: 'merge' | 'replace' }) =>
      supabase.functions.invoke('pf-backup-import', { body: options }),
    
    /** List available backups */
    listBackups: () =>
      this.invoke({ module: 'system', action: 'list_backups' }),
    
    /** v5.6.0: List all registered modules */
    modules: (options?: { full?: boolean; health?: boolean; dag?: boolean; roles?: boolean; boot?: boolean; inventory?: boolean }) =>
      this.invoke({ module: 'system', action: 'modules', payload: options }),
    
    /** v5.6.0: Get specific module details */
    module: (name: string) =>
      this.invoke({ module: 'system', action: 'module', payload: { name } }),
    
    // ═══ v3.12.0: UPGRADE ENGINE ═══
    
    /** Propose an upgrade with analysis and backup */
    upgrade: {
      /** Generate an upgrade proposal in shadow mode */
      propose: (options?: { scope?: string; notes?: string; max_changes?: number }) =>
        supabase.functions.invoke('pf-substrate-upgrade', {
          body: { action: 'propose', ...options }
        }),
      
      /** List all upgrade plans */
      listPlans: () =>
        supabase.functions.invoke('pf-substrate-upgrade', {
          body: { action: 'list_plans' }
        }),
      
      /** Get a specific upgrade plan with runs */
      getPlan: (planId: string) =>
        supabase.functions.invoke('pf-substrate-upgrade', {
          body: { action: 'get_plan', plan_id: planId }
        }),
      
      /** Apply an upgrade plan (requires confirmation) */
      applyPlan: (planId: string) =>
        supabase.functions.invoke('pf-substrate-upgrade', {
          body: { action: 'apply_plan', plan_id: planId }
        }),
      
      /** Rollback an applied plan to its backup */
      rollbackPlan: (planId: string) =>
        supabase.functions.invoke('pf-substrate-upgrade', {
          body: { action: 'rollback_plan', plan_id: planId }
        }),
  },
  };

  // Dream Module — Dream-Eater Operations  
  dream = {
    status: () =>
      this.invoke({ module: 'dream', action: 'status' }),
    
    mood: (mood?: string) =>
      this.invoke({ module: 'dream', action: 'mood', payload: { mood } }),
    
    cycle: () =>
      this.invoke({ module: 'dream', action: 'cycle' }),
    
    // NEW: Enhanced Dream Operations
    /** Consume and process a dream */
    consume: (dream_id: string) =>
      this.invoke({ module: 'dream', action: 'consume', payload: { dream_id } }),
    
    /** Interpret a dream text */
    interpret: (dream_text: string) =>
      this.invoke({ module: 'dream', action: 'interpret', payload: { dream_text } }),
    
    /** Trigger mutation/evolution */
    mutate: () =>
      this.invoke({ module: 'dream', action: 'mutation' }),
    
    /** Dream reflection */
    reflect: () =>
      this.invoke({ module: 'dream', action: 'reflect' }),
  };

  // EVOLUTION Node — Substrate Self-Improvement Engine (formerly Modernizer)
  // Unified Evolution Cycle for substrate self-improvement
  evolution = {
    /** Get EVOLUTION node status with substrate health metrics */
    status: () =>
      this.invoke({ module: 'evolution', action: 'status' }),
    
    /** List recent substrate scans and improvement proposals */
    jobs: (limit?: number) =>
      this.invoke({ module: 'evolution', action: 'jobs', payload: { limit } }),
    
    /** 
     * @deprecated Use evolve() instead - Unified Evolution Cycle
     * Scan the substrate codebase for architecture improvements 
     */
    scan: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'evolution', action: 'scan', payload: options }),
    
    /** Alias for scan - submit a substrate analysis request */
    submit: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'evolution', action: 'scan', payload: options }),
    
    /** Get a specific scan/job by ID */
    job: (job_id: string) =>
      this.invoke({ module: 'evolution', action: 'job', payload: { job_id } }),
    
    /** Check usage quota for scans */
    quota: () =>
      this.invoke({ module: 'evolution', action: 'quota' }),
    
    /** Quick analysis of a specific substrate module */
    analyze: (module?: string) =>
      this.invoke({ module: 'evolution', action: 'analyze', payload: { module } }),
    
    /** Export improvement proposals */
    export: (job_id: string) =>
      this.invoke({ module: 'evolution', action: 'export', payload: { job_id } }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'evolution', action: 'pulse' }),
    
    // ═══ EVOLUTION CYCLE v6.5.0 ═══
    // Unified engine replacing scan, plans, review, verify, analyze
    
    /**
     * Unified Evolution Cycle - Single authoritative modernizer workflow
     * Replaces: scan, plans, review, verify, analyze
     * 
     * Usage:
     *   evolve()                    - Start new scan (prompts if plan exists)
     *   evolve({ target: 'shadow' }) - Apply to shadow
     *   evolve({ target: 'production' }) - Apply to production (requires shadow first)
     *   evolve({ target: 'verify' })  - Verify current cycle
     *   evolve({ target: 'abort' })   - Abort current plan
     *   evolve({ target: 'status' })  - Get current evolution status
     *   evolve({ confirm_override: true }) - Override existing plan
     */
    evolve: async (options?: {
      depth?: 'quick' | 'standard' | 'deep';
      confirm_override?: boolean;
      target?: 'scan' | 'shadow' | 'production' | 'verify' | 'abort' | 'status';
    }) => {
      const { evolutionCycle } = await import('./substrate/evolution-cycle');
      return evolutionCycle.evolve(options);
    },
    
    /** Get current evolution cycle state */
    evolutionStatus: async () => {
      const { evolutionCycle } = await import('./substrate/evolution-cycle');
      return evolutionCycle.status();
    },
    
    // ═══ LEGACY COMMANDS (forwarded to Evolution Cycle) ═══
    
    /** @deprecated Use evolve() - Generate an upgrade proposal */
    propose: (options?: { scope?: string; notes?: string; max_changes?: number }) =>
      this.invoke({ module: 'evolution', action: 'propose', payload: options }),
    
    /** @deprecated Use evolve({ target: 'status' }) - List all upgrade plans */
    plans: async () => {
      const { evolutionCycle } = await import('./substrate/evolution-cycle');
      const state = await evolutionCycle.getState();
      if (state.has_active_plan && state.current_plan) {
        return {
          success: true,
          plans: [{
            id: state.current_plan.plan_id,
            short_id: state.current_plan.short_id,
            phase: state.current_plan.phase,
            status: state.current_plan.phase,
            created_at: state.current_plan.created_at,
          }],
          message: 'Use `modernizer.evolve` for the unified Evolution Cycle workflow.',
        };
      }
      return {
        success: true,
        plans: [],
        message: 'No active evolution plan. Run `modernizer.evolve` to start.',
      };
    },
    
    /** @deprecated Use evolve({ target: 'status' }) - Review a specific upgrade plan */
    review: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'review', payload: { plan_id } }),
    
    /** Validate plan readiness (Evolution Cycle) */
    validate: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'validate', payload: { plan_id } }),
    
    /** View plan diff and health comparison (Evolution Cycle) */
    diff: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'diff', payload: { plan_id } }),
    
    /** @deprecated Use evolve({ target: 'shadow' }) then evolve({ target: 'production' }) */
    apply: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_plan', plan_id }
      }),
    
    /** @deprecated Use evolve({ target: 'shadow' }) */
    applyShadow: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_shadow', plan_id }
      }),
    
    /** Test shadow mode changes before production */
    testShadow: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'test_shadow', plan_id }
      }),
    
    /** @deprecated Use evolve({ target: 'production' }) */
    applyProduction: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_production', plan_id }
      }),
    
    /** Rollback an applied upgrade to pre-upgrade state */
    rollback: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'rollback_plan', plan_id }
      }),
    
    /** @deprecated Use evolve({ target: 'abort' }) - Delete/reject an upgrade plan */
    delete: (plan_id: string, reason?: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'delete_plan', plan_id, reason }
      }),
    
    /** List all applied improvements */
    applied: () =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'list_applied' }
      }),
    
    /** Scan archived edge functions for repurposing opportunities */
    archived: () =>
      this.invoke({ module: 'modernizer', action: 'archived' }),
    
    /** Generate code to implement an archived function repurposing */
    implement: (archived_function: string, target_action: string) =>
      this.invoke({ module: 'modernizer', action: 'implement_archived', payload: { archived_function, target_action } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // CORE MODULE — The Kernel (Scheduler, Router, Lifecycle)
  // ═══════════════════════════════════════════════════════════════
  
  core = {
    /** Get kernel status with uptime and module health */
    status: () =>
      this.invoke({ module: 'core', action: 'status' }),
    
    /** Lightweight heartbeat check */
    pulse: () =>
      this.invoke({ module: 'core', action: 'pulse' }),
    
    /** Initialize boot sequence for all modules */
    boot: () =>
      this.invoke({ module: 'core', action: 'boot' }),
    
    /** Schedule a job for delayed/async execution */
    schedule: (options: { module: SubstrateModule; action: string; payload?: Record<string, unknown>; delay?: string; priority?: number }) =>
      this.invoke({ module: 'core', action: 'schedule', payload: options }),
    
    /** List scheduled/pending jobs */
    jobs: (status?: 'queued' | 'processing' | 'completed' | 'failed', limit?: number) =>
      this.invoke({ module: 'core', action: 'jobs', payload: { status, limit } }),
    
    /** Process the next queued job */
    process: () =>
      this.invoke({ module: 'core', action: 'process' }),
    
    /** Get or set system configuration */
    config: (key?: string, value?: unknown) =>
      this.invoke({ module: 'core', action: 'config', payload: { key, value } }),
    
    /** Initiate graceful system shutdown */
    shutdown: () =>
      this.invoke({ module: 'core', action: 'shutdown' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // RIPPLE MODULE — Message Bus (Queues, Pub/Sub, Events)
  // ═══════════════════════════════════════════════════════════════
  
  ripple = {
    /** Get message bus status */
    status: () =>
      this.invoke({ module: 'ripple', action: 'status' }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'ripple', action: 'pulse' }),
    
    /** Get bus metrics for Vision integration */
    metrics: () =>
      this.invoke({ module: 'ripple', action: 'metrics' }),
    
    /** Add a job to a named queue */
    enqueue: (queue: string, payload: Record<string, unknown>, options?: { priority?: number; delay?: string }) =>
      this.invoke({ module: 'ripple', action: 'enqueue', payload: { queue, payload, ...options } }),
    
    /** Get next job from a queue */
    dequeue: (queue: string) =>
      this.invoke({ module: 'ripple', action: 'dequeue', payload: { queue } }),
    
    /** Publish an event to a topic */
    publish: (topic: string, event_type: string, payload?: Record<string, unknown>, correlation_id?: string) =>
      this.invoke({ module: 'ripple', action: 'publish', payload: { topic, event_type, payload, correlation_id } }),
    
    /** Subscribe a module/action to a topic */
    subscribe: (topic: string, subscriber_module: SubstrateModule, subscriber_action: string, filter?: Record<string, unknown>) =>
      this.invoke({ module: 'ripple', action: 'subscribe', payload: { topic, subscriber_module, subscriber_action, filter } }),
    
    /** List all available topics */
    topics: () =>
      this.invoke({ module: 'ripple', action: 'topics' }),
    
    /** Get event log */
    events: (options?: { topic?: string; limit?: number; unprocessed_only?: boolean; status?: string }) =>
      this.invoke({ module: 'ripple', action: 'events', payload: options }),
    
    /** Re-process events on a topic */
    replay: (topic: string, limit?: number) =>
      this.invoke({ module: 'ripple', action: 'replay', payload: { topic, limit } }),
    
    /** List jobs with filtering */
    jobs: (options?: { queue?: string; status?: string; limit?: number }) =>
      this.invoke({ module: 'ripple', action: 'jobs', payload: options }),
    
    /** Process job(s) from queue */
    work: (queue?: string, once?: boolean) =>
      this.invoke({ module: 'ripple', action: 'work', payload: { queue, once } }),
    
    /** Process all pending jobs in queue */
    drain: (queue?: string) =>
      this.invoke({ module: 'ripple', action: 'drain', payload: { queue } }),
    
    /** Acknowledge job as succeeded */
    ack: (job_id: string) =>
      this.invoke({ module: 'ripple', action: 'ack', payload: { job_id } }),
    
    /** Reject job (increment attempts) */
    nack: (job_id: string, reason?: string) =>
      this.invoke({ module: 'ripple', action: 'nack', payload: { job_id, reason } }),
    
    /** View dead letter queue (failed jobs) */
    deadLetter: (queue?: string, limit?: number) =>
      this.invoke({ module: 'ripple', action: 'dead_letter', payload: { queue, limit } }),
    
    /** Retry a failed job */
    retry: (job_id: string) =>
      this.invoke({ module: 'ripple', action: 'retry', payload: { job_id } }),
    
    /** View subscriber circuit breakers */
    circuits: () =>
      this.invoke({ module: 'ripple', action: 'circuits' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // ACCESS MODULE — Identity & Billing (API Keys, Quotas, Usage)
  // ═══════════════════════════════════════════════════════════════
  
  access = {
    /** Get access module status */
    status: () =>
      this.invoke({ module: 'access', action: 'status' }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'access', action: 'pulse' }),
    
    /** Register as developer (auto-creates from auth) */
    register: (display_name?: string) =>
      this.invoke({ module: 'access', action: 'register', payload: { display_name } }),
    
    /** 
     * Bootstrap developer identity and roles
     * Creates developer profile, assigns default roles, auto-seeds governor if first user
     */
    bootstrap: (display_name?: string) =>
      this.invoke({ module: 'access', action: 'bootstrap', payload: { display_name } }),
    
    /** Get developer profile */
    developer: (developer_id?: string) =>
      this.invoke({ module: 'access', action: 'developer', payload: { developer_id } }),
    
    /** List all developers (admin) */
    developers: () =>
      this.invoke({ module: 'access', action: 'developers' }),
    
    /** Get identity info for current session (roles, developer status) */
    identity: () =>
      this.invoke({ module: 'access', action: 'identity' }),
    
    /** Create a new API key */
    createKey: (options: { developer_id?: string; name?: string; scopes?: string[]; rate_limit_per_minute?: number; rate_limit_per_day?: number }) =>
      this.invoke({ module: 'access', action: 'create_key', payload: options }),
    
    /** Validate an API key */
    validateKey: (api_key: string) =>
      this.invoke({ module: 'access', action: 'validate_key', payload: { api_key } }),
    
    /** Revoke an API key */
    revokeKey: (key_id: string) =>
      this.invoke({ module: 'access', action: 'revoke_key', payload: { key_id } }),
    
    /** List API keys for current user or developer */
    listKeys: (developer_id?: string) =>
      this.invoke({ module: 'access', action: 'list_keys', payload: { developer_id } }),
    
    /** Get usage statistics */
    getUsage: (options?: { api_key_id?: string; developer_id?: string; product_code?: string; days?: number }) =>
      this.invoke({ module: 'access', action: 'usage', payload: options }),
    
    /** Check quota remaining for an API key */
    checkQuota: (api_key_id?: string) =>
      this.invoke({ module: 'access', action: 'quota', payload: { api_key_id } }),
    
    /** Record usage for metering */
    recordUsage: (options: { api_key_id?: string; developer_id?: string; module: string; action: string; tokens_used?: number; compute_ms?: number; cost_millicents?: number }) =>
      this.invoke({ module: 'access', action: 'record_usage', payload: options }),
    
    /** Get subscription info for current user */
    subscription: (developer_id?: string) =>
      this.invoke({ module: 'access', action: 'subscription', payload: { developer_id } }),
    
    /** List your entitlements */
    entitlements: () =>
      this.invoke({ module: 'access', action: 'entitlements' }),
    
    /** List available products/entitlements */
    products: (category?: string) =>
      this.invoke({ module: 'access', action: 'products', payload: { category } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATION MODULE — Enterprise Adapters, Auto-Discovery, LLM Governance
  // ═══════════════════════════════════════════════════════════════
  
  integration = {
    /** Get integration module status */
    status: () =>
      this.invoke({ module: 'integration', action: 'status' }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'integration', action: 'pulse' }),
    
    // === ADAPTER MANAGEMENT ===
    
    /** List all available adapters (ERP, CRM, HR, etc.) */
    adapters: () =>
      this.invoke({ module: 'integration', action: 'adapters' }),
    
    /** Connect an enterprise system adapter */
    connect: (options: { 
      adapter_type: 'erp' | 'crm' | 'hr' | 'payroll' | 'calendar' | 'email' | 'helpdesk' | 'analytics' | 'devops' | 'game_engine' | 'custom';
      name: string;
      config: Record<string, unknown>;
      credentials?: Record<string, string>;
    }) =>
      this.invoke({ module: 'integration', action: 'connect', payload: options }),
    
    /** Disconnect an adapter */
    disconnect: (adapter_id: string) =>
      this.invoke({ module: 'integration', action: 'disconnect', payload: { adapter_id } }),
    
    /** Test adapter connectivity */
    test: (adapter_id: string) =>
      this.invoke({ module: 'integration', action: 'test', payload: { adapter_id } }),
    
    /** List connected adapters */
    connections: () =>
      this.invoke({ module: 'integration', action: 'connections' }),
    
    // === AUTO-DISCOVERY ===
    
    /** Start auto-discovery mode to scan client systems */
    discover: (options?: { 
      target?: string;
      depth?: 'shallow' | 'deep';
      include_functions?: boolean;
    }) =>
      this.invoke({ module: 'integration', action: 'discover', payload: options }),
    
    /** Get discovered endpoints and function signatures */
    discovered: (adapter_id?: string) =>
      this.invoke({ module: 'integration', action: 'discovered', payload: { adapter_id } }),
    
    /** Map a discovered function to a terminal command */
    mapCommand: (options: {
      discovered_function: string;
      terminal_command: string;
      description: string;
      parameters?: Array<{ name: string; type: string; required: boolean }>;
    }) =>
      this.invoke({ module: 'integration', action: 'map_command', payload: options }),
    
    /** List mapped terminal commands */
    mappedCommands: (adapter_id?: string) =>
      this.invoke({ module: 'integration', action: 'mapped_commands', payload: { adapter_id } }),
    
    // === LLM GOVERNANCE ===
    
    /** Execute a governed LLM action through an adapter */
    execute: (options: {
      adapter_id: string;
      action: string;
      parameters: Record<string, unknown>;
      governance?: {
        require_approval?: boolean;
        audit_level?: 'none' | 'basic' | 'full';
        timeout_ms?: number;
        max_retries?: number;
      };
    }) =>
      this.invoke({ module: 'integration', action: 'execute', payload: options }),
    
    /** Get governance policies */
    policies: () =>
      this.invoke({ module: 'integration', action: 'policies' }),
    
    /** Set governance policy for an adapter or action */
    setPolicy: (options: {
      adapter_id?: string;
      action_pattern?: string;
      policy: {
        require_approval?: boolean;
        allowed_actions?: string[];
        blocked_actions?: string[];
        rate_limit_per_hour?: number;
        audit_retention_days?: number;
      };
    }) =>
      this.invoke({ module: 'integration', action: 'set_policy', payload: options }),
    
    /** Get governance audit log */
    auditLog: (options?: {
      adapter_id?: string;
      action?: string;
      since?: string;
      limit?: number;
    }) =>
      this.invoke({ module: 'integration', action: 'audit_log', payload: options }),
    
    // === INDUSTRY-SPECIFIC HELPERS ===
    
    /** Game engine integration helpers */
    gameEngine: {
      /** Discover game engine APIs (Unity, Unreal, Godot) */
      discover: (engine_type: 'unity' | 'unreal' | 'godot' | 'custom', endpoint?: string) =>
        substrate.invoke({ module: 'integration', action: 'game_discover', payload: { engine_type, endpoint } }),
      
      /** Sync NPC memory states with game engine */
      syncNpcMemory: (npc_id: string, adapter_id: string) =>
        substrate.invoke({ module: 'integration', action: 'game_sync_npc', payload: { npc_id, adapter_id } }),
      
      /** Register a game world state callback */
      registerWorldCallback: (adapter_id: string, event_types: string[]) =>
        substrate.invoke({ module: 'integration', action: 'game_world_callback', payload: { adapter_id, event_types } }),
    },
    
    /** Enterprise system helpers */
    enterprise: {
      /** Discover enterprise APIs (SAP, Salesforce, Workday, etc.) */
      discover: (system_type: 'sap' | 'salesforce' | 'workday' | 'servicenow' | 'dynamics' | 'custom', credentials?: Record<string, string>) =>
        substrate.invoke({ module: 'integration', action: 'enterprise_discover', payload: { system_type, credentials } }),
      
      /** Execute payroll operation */
      payroll: (adapter_id: string, operation: 'calculate' | 'schedule' | 'status', params: Record<string, unknown>) =>
        substrate.invoke({ module: 'integration', action: 'enterprise_payroll', payload: { adapter_id, operation, params } }),
      
      /** Execute HR operation */
      hr: (adapter_id: string, operation: 'schedule' | 'onboard' | 'offboard' | 'lookup', params: Record<string, unknown>) =>
        substrate.invoke({ module: 'integration', action: 'enterprise_hr', payload: { adapter_id, operation, params } }),
      
      /** Execute customer service operation */
      customerService: (adapter_id: string, operation: 'respond' | 'escalate' | 'summarize', params: Record<string, unknown>) =>
        substrate.invoke({ module: 'integration', action: 'enterprise_customer', payload: { adapter_id, operation, params } }),
    },
    
    /** Developer platform helpers */
    devPlatform: {
      /** Discover dev platform APIs (GitHub, GitLab, Jira, etc.) */
      discover: (platform_type: 'github' | 'gitlab' | 'jira' | 'confluence' | 'linear' | 'notion' | 'custom', credentials?: Record<string, string>) =>
        substrate.invoke({ module: 'integration', action: 'dev_discover', payload: { platform_type, credentials } }),
      
      /** Execute repository operation */
      repo: (adapter_id: string, operation: 'list' | 'create' | 'pr' | 'issue', params: Record<string, unknown>) =>
        substrate.invoke({ module: 'integration', action: 'dev_repo', payload: { adapter_id, operation, params } }),
      
      /** Execute project management operation */
      project: (adapter_id: string, operation: 'tasks' | 'sprint' | 'backlog' | 'report', params: Record<string, unknown>) =>
        substrate.invoke({ module: 'integration', action: 'dev_project', payload: { adapter_id, operation, params } }),
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // CORTEX MODULE v2.0 — Agency-class Orchestrator
  // ═══════════════════════════════════════════════════════════════
  
  cortex = {
    /** Get full cortex status with capabilities and circuits */
    status: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'status' }),
    
    /** Get health with connected modules and circuit states */
    health: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'health' }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'pulse' }),
    
    /** Deep self-analysis */
    diagnostics: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'diagnostics' }),
    
    /** Get or set cortex mode (manual|shadow|auto) */
    mode: (newMode?: 'manual' | 'shadow' | 'auto') =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'mode', payload: { mode: newMode } }),
    
    /** Soft reload cortex state */
    restart: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'restart' }),
    
    /** Panic mode controls */
    panic: (action: 'freeze' | 'resume' | 'status', reason?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'panic', payload: { panic_action: action, reason } }),
    
    /** Execute module.action with governance */
    dispatch: (targetModule: string, targetAction: string, args?: Record<string, unknown>) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'dispatch', payload: { target_module: targetModule, target_action: targetAction, args } }),
    
    /** Subscribe to module events */
    observe: (module?: string, eventTypes?: string[]) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'observe', payload: { module, event_types: eventTypes } }),
    
    /** Generate improvement proposal */
    propose: (goal: string, context?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'propose', payload: { goal, context } }),
    
    /** Score and assess proposal */
    evaluate: (proposalId?: string, criteria?: Record<string, unknown>) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'evaluate', payload: { proposal_id: proposalId, criteria } }),
    
    /** Execute approved changes */
    apply: (proposalId: string, targetModule?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'apply', payload: { proposal_id: proposalId, target_module: targetModule } }),
    
    /** Rollback applied changes */
    rollback: (applyId: string, reason?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'rollback', payload: { apply_id: applyId, reason } }),
    
    /** Query decisions and deltas */
    audit: (since?: string, type?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'audit', payload: { since, type } }),
    
    /** Ingest outcome for reinforcement learning */
    learn: (outcome: string, proposalId?: string, feedback?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'learn', payload: { outcome, proposal_id: proposalId, feedback } }),
    
    /** Human-readable context dump */
    summary: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'summary' }),
    
    /** Rank evolution sequences by priority */
    plan: (sequenceId?: string) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'plan', payload: { sequence_id: sequenceId } }),
    
    /** Execute sequence in shadow mode */
    run: (sequenceId: string, mode?: 'shadow' | 'production') =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'run', payload: { sequence_id: sequenceId, mode } }),
    
    /** v5.6.0: Get full module registry snapshot (world model) */
    world: (options?: { dag?: boolean; roles?: boolean; eligible?: boolean }) =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'world', payload: options }),
    
    /** v5.6.0: Get module inventory with eligibility */
    inventory: () =>
      this.invoke({ module: 'cortex' as SubstrateModule, action: 'inventory' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // INCLUSIVE MODULE v9.1.0 — Human Compatibility Pipeline
  // @origin(cmptbl) — 14th Substrate Module
  // Position: Between SYSTEM and DEFENSE in lifecycle
  // Developed by CMPSBL® as part of the cognitive orchestration substrate.
  // ═══════════════════════════════════════════════════════════════
  
  inclusive = {
    /** Get module status with global score and violations */
    status: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'status' }),
    
    /** Health check */
    health: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'health' }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'pulse' }),
    
    /** Scan target URL or HTML for accessibility issues */
    scan: (target: string, options?: { wcag_level?: 'A' | 'AA' | 'AAA'; scan_depth?: 'quick' | 'standard' | 'deep'; auto_repair?: boolean }) =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'scan', payload: { target, ...options } }),
    
    /** Scan and automatically repair accessibility issues in one operation */
    scanAndRepair: async (target: string, options?: { wcag_level?: 'A' | 'AA' | 'AAA'; scan_depth?: 'quick' | 'standard' | 'deep' }) => {
      // Phase 1: Scan
      const scanResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'scan', 
        payload: { target, ...options } 
      });
      
      if (!scanResult.success) {
        return scanResult;
      }
      
      const scanData = scanResult.data as any;
      const issues = scanData?.issues || scanData?.violations || [];
      
      // If no issues or score is perfect, return scan result
      if (issues.length === 0 || (scanData?.score >= 100)) {
        return {
          ...scanResult,
          data: {
            ...scanData,
            auto_repair: { skipped: true, reason: 'No issues to repair' }
          }
        };
      }
      
      // Phase 2: Auto-repair
      const repairResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'repair', 
        payload: { target, issues: issues.map((i: any) => i.id || i.type) } 
      });
      
      const repairData = repairResult.data as any;
      
      // Phase 3: Validate repairs
      const validateResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'validate', 
        payload: { target } 
      });
      
      const validateData = validateResult.data as any;
      
      return {
        success: true,
        module: 'inclusive' as SubstrateModule,
        action: 'scan_and_repair',
        data: {
          scan: scanData,
          repair: {
            applied: true,
            fixes_count: repairData?.fixes_applied || repairData?.repairs?.length || 0,
            repairs: repairData?.repairs || [],
          },
          validation: validateData,
          final_score: validateData?.new_score || validateData?.score || scanData?.score,
          improvement: (validateData?.score_improvement) || 0,
        },
        timestamp: new Date().toISOString(),
      };
    },
    
    /** Self-scan the substrate UI */
    selfScan: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'self_scan' }),
    
    /** Self-scan and auto-repair the substrate UI */
    selfScanAndRepair: async () => {
      // Phase 1: Self-scan
      const scanResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'self_scan' 
      });
      
      if (!scanResult.success) {
        return scanResult;
      }
      
      const scanData = scanResult.data as any;
      const issues = scanData?.issues || scanData?.violations || [];
      
      // If no issues, return scan result
      if (issues.length === 0 || (scanData?.score >= 100)) {
        return {
          ...scanResult,
          data: {
            ...scanData,
            auto_repair: { skipped: true, reason: 'No issues to repair' }
          }
        };
      }
      
      // Phase 2: Auto-repair using current document
      const repairResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'repair', 
        payload: { target: 'self', issues: issues.map((i: any) => i.id || i.type) } 
      });
      
      const repairData = repairResult.data as any;
      
      // Phase 3: Validate
      const validateResult = await this.invoke({ 
        module: 'inclusive' as SubstrateModule, 
        action: 'validate', 
        payload: { target: 'self' } 
      });
      
      const validateData = validateResult.data as any;
      
      return {
        success: true,
        module: 'inclusive' as SubstrateModule,
        action: 'self_scan_and_repair',
        data: {
          scan: scanData,
          repair: {
            applied: true,
            fixes_count: repairData?.fixes_applied || repairData?.repairs?.length || 0,
            repairs: repairData?.repairs || [],
          },
          validation: validateData,
          final_score: validateData?.new_score || validateData?.score || scanData?.score,
          improvement: (validateData?.score_improvement) || 0,
        },
        timestamp: new Date().toISOString(),
      };
    },
    
    /** Repair accessibility issues */
    repair: (target: string, issues?: string[]) =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'repair', payload: { target, issues } }),
    
    /** Validate repairs and ensure no regressions */
    validate: (target: string, originalHtml?: string, repairedHtml?: string) =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'validate', payload: { target, original_html: originalHtml, repaired_html: repairedHtml } }),
    
    /** Build user profile for adaptive experiences */
    profile: (context: string) =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'profile', payload: { context } }),
    
    /** Generate accessibility report */
    report: (target: string, format?: 'json' | 'markdown') =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'report', payload: { target, format } }),
    
    /** Scan all marketplace templates */
    scanAllTemplates: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'scan_all_templates' }),
    
    /** Get regressions in last 24h */
    regressions: (hours?: number) =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'regressions', payload: { hours } }),
    
    /** Get template coverage stats */
    coverage: () =>
      this.invoke({ module: 'inclusive' as SubstrateModule, action: 'coverage' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // MEMORY MODULE — Vector/RAG Orchestration (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  memory = {
    status: async () => {
      const { getMemoryModuleState, getMemoryModuleHealth } = await import('./substrate/memory-module/index');
      const state = getMemoryModuleState();
      return { success: true, module: 'memory' as SubstrateModule, action: 'status', data: { ...state, health: getMemoryModuleHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'memory', action: 'pulse' }),
    ingest: (source: string, format: string, options?: { chunkSize?: number }) =>
      this.invoke({ module: 'memory', action: 'ingest', payload: { source, format, ...options } }),
    search: (query: string, options?: { limit?: number; threshold?: number }) =>
      this.invoke({ module: 'memory', action: 'search', payload: { query, ...options } }),
    state: async () => {
      const { getMemoryModuleState } = await import('./substrate/memory-module/index');
      return { success: true, module: 'memory' as SubstrateModule, action: 'state', data: getMemoryModuleState(), timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // RELAY MODULE — Outbound Webhook Dispatch (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  relay = {
    status: async () => {
      const { getRelayState, getRelayHealth } = await import('./substrate/relay-module/index');
      const state = getRelayState();
      return { success: true, module: 'relay' as SubstrateModule, action: 'status', data: { ...state, health: getRelayHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'relay', action: 'pulse' }),
    dispatch: (target: string, payload: unknown, options?: { retries?: number }) =>
      this.invoke({ module: 'relay', action: 'dispatch', payload: { target, payload, ...options } }),
    deliveries: async (limit?: number) => {
      const { getRelayState } = await import('./substrate/relay-module/index');
      const state = getRelayState();
      return { success: true, module: 'relay' as SubstrateModule, action: 'deliveries', data: { deliveries: state.deliveries.slice(-(limit ?? 20)) }, timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // AUDIT MODULE — Immutable Compliance Ledger (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  audit = {
    status: async () => {
      const { getAuditState, getAuditHealth } = await import('./substrate/audit-module/index');
      const state = getAuditState();
      return { success: true, module: 'audit' as SubstrateModule, action: 'status', data: { ...state, health: getAuditHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'audit', action: 'pulse' }),
    log: async (limit?: number) => {
      const { getAuditLog } = await import('./substrate/audit-module/index');
      return { success: true, module: 'audit' as SubstrateModule, action: 'log', data: { entries: getAuditLog(limit ?? 50) }, timestamp: new Date().toISOString() };
    },
    record: async (module: string, action: string, resource: string, resourceId: string) => {
      const { recordAuditEntry } = await import('./substrate/audit-module/index');
      const entry = recordAuditEntry({ id: 'system', type: 'system' }, module, action, resource, resourceId);
      return { success: true, module: 'audit' as SubstrateModule, action: 'record', data: entry, timestamp: new Date().toISOString() };
    },
    verify: async () => {
      const { verifyAuditChain } = await import('./substrate/audit-module/index');
      return { success: true, module: 'audit' as SubstrateModule, action: 'verify', data: verifyAuditChain(), timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // IDENTITY MODULE — Universal Actor Attribution (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  identity = {
    status: async () => {
      const { getIdentityState, getIdentityHealth } = await import('./substrate/identity-module/index');
      const state = getIdentityState();
      return { success: true, module: 'identity' as SubstrateModule, action: 'status', data: { ...state, health: getIdentityHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'identity', action: 'pulse' }),
    whoami: async () => {
      const { whoami } = await import('./substrate/identity-module/index');
      return { success: true, module: 'identity' as SubstrateModule, action: 'whoami', data: whoami(), timestamp: new Date().toISOString() };
    },
    register: async (id: string, type: 'human' | 'agent' | 'system', displayName: string) => {
      const { registerActor } = await import('./substrate/identity-module/index');
      return { success: true, module: 'identity' as SubstrateModule, action: 'register', data: registerActor(id, type, displayName), timestamp: new Date().toISOString() };
    },
    sign: async (actorId: string, action: string) => {
      const { signAction } = await import('./substrate/identity-module/index');
      return { success: true, module: 'identity' as SubstrateModule, action: 'sign', data: signAction(actorId, action), timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // ECONOMY MODULE — Cost Attribution & Budget Engine (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  economy = {
    status: async () => {
      const { getEconomyState, getEconomyHealth } = await import('./substrate/economy-module/index');
      const state = getEconomyState();
      return { success: true, module: 'economy' as SubstrateModule, action: 'status', data: { ...state, health: getEconomyHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'economy', action: 'pulse' }),
    recordCost: (module: string, action: string, tokenCount: number, computeMs: number, costMillicents: number) =>
      this.invoke({ module: 'economy', action: 'record_cost', payload: { module, action, tokenCount, computeMs, costMillicents } }),
    setBudget: async (module: string, dailyLimitMillicents: number) => {
      const { setBudget } = await import('./substrate/economy-module/index');
      setBudget(module, dailyLimitMillicents);
      return { success: true, module: 'economy' as SubstrateModule, action: 'set_budget', data: { module, dailyLimitMillicents }, timestamp: new Date().toISOString() };
    },
    spend: async (module?: string) => {
      const { getEconomyState, getCostsByModule } = await import('./substrate/economy-module/index');
      const data = module ? { module, costMillicents: getCostsByModule(module) } : getEconomyState();
      return { success: true, module: 'economy' as SubstrateModule, action: 'spend', data, timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SANDBOX MODULE — Isolated Execution Environments (Infrastructure)
  // ═══════════════════════════════════════════════════════════════

  sandboxMod = {
    status: async () => {
      const { getSandboxState, getSandboxHealth } = await import('./substrate/sandbox-module/index');
      const state = getSandboxState();
      return { success: true, module: 'sandbox' as SubstrateModule, action: 'status', data: { ...state, health: getSandboxHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'sandbox', action: 'pulse' }),
    create: async (options?: { ttl?: string; isolation?: 'standard' | 'strict' | 'hermetic' }) => {
      const { createSandbox } = await import('./substrate/sandbox-module/index');
      return { success: true, module: 'sandbox' as SubstrateModule, action: 'create', data: createSandbox(options), timestamp: new Date().toISOString() };
    },
    execute: async (sandboxId: string, code: string) => {
      const { execute } = await import('./substrate/sandbox-module/index');
      return { success: true, module: 'sandbox' as SubstrateModule, action: 'execute', data: execute(sandboxId, code), timestamp: new Date().toISOString() };
    },
    teardown: async (sandboxId: string) => {
      const { teardown } = await import('./substrate/sandbox-module/index');
      teardown(sandboxId);
      return { success: true, module: 'sandbox' as SubstrateModule, action: 'teardown', data: { id: sandboxId }, timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // ENCODE MODULE — Code Execution Intelligence (Orchestrator)
  // ═══════════════════════════════════════════════════════════════

  encode = {
    status: async () => {
      const { getEncodeState, getEncodeHealth } = await import('./substrate/encode-module/index');
      const state = getEncodeState();
      return { success: true, module: 'encode' as SubstrateModule, action: 'status', data: { ...state, health: getEncodeHealth() }, timestamp: new Date().toISOString() };
    },
    pulse: () => this.invoke({ module: 'encode', action: 'pulse' }),
    queue: async () => {
      const { getTaskQueue } = await import('./substrate/encode-module/index');
      return { success: true, module: 'encode' as SubstrateModule, action: 'queue', data: { tasks: getTaskQueue() }, timestamp: new Date().toISOString() };
    },
    receipts: async (limit?: number) => {
      const { getReceipts } = await import('./substrate/encode-module/index');
      return { success: true, module: 'encode' as SubstrateModule, action: 'receipts', data: { receipts: getReceipts(limit ?? 20) }, timestamp: new Date().toISOString() };
    },
    init: async () => {
      const { initEncode } = await import('./substrate/encode-module/index');
      initEncode();
      return { success: true, module: 'encode' as SubstrateModule, action: 'init', data: { initialized: true }, timestamp: new Date().toISOString() };
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SEBA MODULE — Self-Evolving Bounded Agent (v7.0.0)
  // ═══════════════════════════════════════════════════════════════
  
  seba = {
    /** Get SEBA agent status with state and config */
    status: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('status');
    },
    
    /** Enable SEBA agent */
    enable: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('enable');
    },
    
    /** Disable SEBA agent */
    disable: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('disable');
    },
    
    /** Get or set SEBA mode (off, observe, advisory, governed, autonomous) */
    mode: async (newMode?: 'off' | 'observe' | 'advisory' | 'governed' | 'autonomous') => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('mode', { mode: newMode });
    },
    
    /** Run a complete SEBA cognitive-evolution cycle */
    cycle: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.runCycle();
    },
    
    /** Generate improvement proposals from cognitive analysis */
    propose: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('propose');
    },
    
    /** Review pending proposals awaiting approval */
    review: async () => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('review');
    },
    
    /** Approve a proposal */
    approve: async (proposalId: string) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('approve', { proposal_id: proposalId });
    },
    
    /** Reject a proposal */
    reject: async (proposalId: string) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('reject', { proposal_id: proposalId });
    },
    
    /** Execute an approved proposal */
    execute: async (proposalId: string) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('execute', { proposal_id: proposalId });
    },
    
    /** Rollback an executed evolution */
    rollback: async (executionId: string) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('rollback', { execution_id: executionId });
    },
    
    /** Get SEBA evolution history */
    history: async (limit = 20) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('history', { limit });
    },
    
    /** Get or update SEBA config */
    config: async (updates?: Record<string, unknown>) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('config', updates ? { updates } : undefined);
    },
    
    /** Get or set thresholds (auto_approve, risk_tolerance) */
    thresholds: async (updates?: { auto_approve?: number; risk_tolerance?: string }) => {
      const { sebaAgent } = await import('./substrate/seba');
      return sebaAgent.handleCommand('thresholds', updates);
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // ESZ — Expansion Sovereignty Zone
  // ═══════════════════════════════════════════════════════════════

  sovereign = {
    status: () => this.invoke({ module: 'sovereign', action: 'status' }),
    pulse: () => this.invoke({ module: 'sovereign', action: 'pulse' }),
    jurisdictions: () => this.invoke({ module: 'sovereign', action: 'jurisdictions' }),
    classify: (subject: string) => this.invoke({ module: 'sovereign', action: 'classify', payload: { subject } }),
  };

  oracle = {
    status: () => this.invoke({ module: 'oracle', action: 'status' }),
    pulse: () => this.invoke({ module: 'oracle', action: 'pulse' }),
    predict: (query: string, options?: Record<string, unknown>) => this.invoke({ module: 'oracle', action: 'predict', payload: { query, ...options } }),
    forecast: (metric: string, horizon?: string) => this.invoke({ module: 'oracle', action: 'forecast', payload: { metric, horizon } }),
  };

  conscience = {
    status: () => this.invoke({ module: 'conscience', action: 'status' }),
    pulse: () => this.invoke({ module: 'conscience', action: 'pulse' }),
    evaluate: (content: string) => this.invoke({ module: 'conscience', action: 'evaluate', payload: { content } }),
    biasCheck: (content: string) => this.invoke({ module: 'conscience', action: 'bias_check', payload: { content } }),
  };

  treaty = {
    status: () => this.invoke({ module: 'treaty', action: 'status' }),
    pulse: () => this.invoke({ module: 'treaty', action: 'pulse' }),
    contracts: () => this.invoke({ module: 'treaty', action: 'contracts' }),
    verify: (contractId: string) => this.invoke({ module: 'treaty', action: 'verify', payload: { contract_id: contractId } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // EPZ — Expansion Perception Zone
  // ═══════════════════════════════════════════════════════════════

  compass = {
    status: () => this.invoke({ module: 'compass', action: 'status' }),
    pulse: () => this.invoke({ module: 'compass', action: 'pulse' }),
    bearing: () => this.invoke({ module: 'compass', action: 'bearing' }),
    scan: (horizon?: string) => this.invoke({ module: 'compass', action: 'scan', payload: { horizon } }),
  };

  echoMod = {
    status: () => this.invoke({ module: 'echo', action: 'status' }),
    pulse: () => this.invoke({ module: 'echo', action: 'pulse' }),
    simulate: (scenario: string) => this.invoke({ module: 'echo', action: 'simulate', payload: { scenario } }),
    replay: (eventId: string) => this.invoke({ module: 'echo', action: 'replay', payload: { event_id: eventId } }),
  };

  reflex = {
    status: () => this.invoke({ module: 'reflex', action: 'status' }),
    pulse: () => this.invoke({ module: 'reflex', action: 'pulse' }),
    latency: () => this.invoke({ module: 'reflex', action: 'latency' }),
    trigger: (signal: string) => this.invoke({ module: 'reflex', action: 'trigger', payload: { signal } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // EMZ — Expansion Manufacturing Zone
  // ═══════════════════════════════════════════════════════════════

  forge = {
    status: () => this.invoke({ module: 'forge', action: 'status' }),
    pulse: () => this.invoke({ module: 'forge', action: 'pulse' }),
    generate: (template: string, params?: Record<string, unknown>) => this.invoke({ module: 'forge', action: 'generate', payload: { template, ...params } }),
    templates: () => this.invoke({ module: 'forge', action: 'templates' }),
  };

  lingua = {
    status: () => this.invoke({ module: 'lingua', action: 'status' }),
    pulse: () => this.invoke({ module: 'lingua', action: 'pulse' }),
    translate: (text: string, targetLang: string) => this.invoke({ module: 'lingua', action: 'translate', payload: { text, target_lang: targetLang } }),
    detect: (text: string) => this.invoke({ module: 'lingua', action: 'detect', payload: { text } }),
  };

  harvest = {
    status: () => this.invoke({ module: 'harvest', action: 'status' }),
    pulse: () => this.invoke({ module: 'harvest', action: 'pulse' }),
    ingest: (source: string, format?: string) => this.invoke({ module: 'harvest', action: 'ingest', payload: { source, format } }),
    pipelines: () => this.invoke({ module: 'harvest', action: 'pipelines' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // CSZ — Covert/Shadow Zone
  // ═══════════════════════════════════════════════════════════════

  evolutionMod = {
    status: () => this.invoke({ module: 'evolution', action: 'status' }),
    pulse: () => this.invoke({ module: 'evolution', action: 'pulse' }),
    mutations: () => this.invoke({ module: 'evolution', action: 'mutations' }),
    shadowRun: (proposalId: string) => this.invoke({ module: 'evolution', action: 'shadow_run', payload: { proposal_id: proposalId } }),
  };

  shadowMod = {
    status: () => this.invoke({ module: 'shadow', action: 'status' }),
    pulse: () => this.invoke({ module: 'shadow', action: 'pulse' }),
    validate: (target: string) => this.invoke({ module: 'shadow', action: 'validate', payload: { target } }),
    compare: (variantA: string, variantB: string) => this.invoke({ module: 'shadow', action: 'compare', payload: { variant_a: variantA, variant_b: variantB } }),
  };

  phantom = {
    status: () => this.invoke({ module: 'phantom', action: 'status' }),
    pulse: () => this.invoke({ module: 'phantom', action: 'pulse' }),
    anonymize: (data: Record<string, unknown>) => this.invoke({ module: 'phantom', action: 'anonymize', payload: data }),
    piiScan: (content: string) => this.invoke({ module: 'phantom', action: 'pii_scan', payload: { content } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // Fields, Plane & Execution Additions
  // ═══════════════════════════════════════════════════════════════

  immunityMod = {
    status: () => this.invoke({ module: 'immunity', action: 'status' }),
    pulse: () => this.invoke({ module: 'immunity', action: 'pulse' }),
    threats: () => this.invoke({ module: 'immunity', action: 'threats' }),
    heal: (nodeId: string) => this.invoke({ module: 'immunity', action: 'heal', payload: { node_id: nodeId } }),
  };

  intentMod = {
    status: () => this.invoke({ module: 'intent', action: 'status' }),
    pulse: () => this.invoke({ module: 'intent', action: 'pulse' }),
    classify: (message: string) => this.invoke({ module: 'intent', action: 'classify', payload: { message } }),
    routes: () => this.invoke({ module: 'intent', action: 'routes' }),
  };

  governanceMod = {
    status: () => this.invoke({ module: 'governance', action: 'status' }),
    pulse: () => this.invoke({ module: 'governance', action: 'pulse' }),
    policies: () => this.invoke({ module: 'governance', action: 'policies' }),
    veto: (proposalId: string, reason: string) => this.invoke({ module: 'governance', action: 'veto', payload: { proposal_id: proposalId, reason } }),
  };

  medic = {
    status: () => this.invoke({ module: 'medic', action: 'status' }),
    pulse: () => this.invoke({ module: 'medic', action: 'pulse' }),
    diagnose: (nodeId?: string) => this.invoke({ module: 'medic', action: 'diagnose', payload: { node_id: nodeId } }),
    repair: (nodeId: string) => this.invoke({ module: 'medic', action: 'repair', payload: { node_id: nodeId } }),
  };

  nerve = {
    status: () => this.invoke({ module: 'nerve', action: 'status' }),
    pulse: () => this.invoke({ module: 'nerve', action: 'pulse' }),
    signals: () => this.invoke({ module: 'nerve', action: 'signals' }),
    broadcast: (signal: string, payload?: Record<string, unknown>) => this.invoke({ module: 'nerve', action: 'broadcast', payload: { signal, ...payload } }),
  };

  // ═══════════════════════════════════════════════════════════════
  // ENGINEER — Engine & Meta-Engine Maintenance Intelligence (Node 39)
  // ═══════════════════════════════════════════════════════════════

  engineer = {
    status: () => this.invoke({ module: 'engineer', action: 'status' }),
    pulse: () => this.invoke({ module: 'engineer', action: 'pulse' }),
    health: () => this.invoke({ module: 'engineer', action: 'health' }),
    cycle: () => this.invoke({ module: 'engineer', action: 'cycle' }),
    proposals: (status?: string) => this.invoke({ module: 'engineer', action: 'proposals', payload: { status } }),
    engines: () => this.invoke({ module: 'engineer', action: 'engines' }),
    degraded: () => this.invoke({ module: 'engineer', action: 'degraded' }),
    studyQueue: () => this.invoke({ module: 'engineer', action: 'study_queue' }),
  };

  // ═══════════════════════════════════════════════════════════════
  // ATLAS — Governance Authority & System Control (Node 40)
  // ═══════════════════════════════════════════════════════════════

  atlas = {
    status: () => this.invoke({ module: 'atlas', action: 'status' }),
    pulse: () => this.invoke({ module: 'atlas', action: 'pulse' }),
    health: () => this.invoke({ module: 'atlas', action: 'health' }),
    state: () => this.invoke({ module: 'atlas', action: 'state' }),
    proposals: () => this.invoke({ module: 'atlas', action: 'proposals' }),
    decide: (proposalId: string, decision: 'approve' | 'reject', reason?: string) =>
      this.invoke({ module: 'atlas', action: 'decide', payload: { proposal_id: proposalId, decision, reason } }),
    setMode: (mode: string) => this.invoke({ module: 'atlas', action: 'set_mode', payload: { mode } }),
    controls: () => this.invoke({ module: 'atlas', action: 'controls' }),
  };
}

export const substrate = SubstrateClient.getInstance();

// ═══════════════════════════════════════════════════════════════
// MATRIX.* ALIASES — Read-only Matrix Node introspection
// ═══════════════════════════════════════════════════════════════

export const matrix = {
  /** List all 24 Matrix Nodes with sector, weight, and health */
  nodes: async () => {
    const { buildMatrixNodes, getNodeDefinitions } = await import('./core/matrixNodeRegistry');
    const healthData: Record<string, number> = {};
    getNodeDefinitions().forEach(n => { healthData[n.id] = 100; });
    const nodes = buildMatrixNodes(healthData);
    return { success: true, module: 'matrix' as const, action: 'nodes', data: { nodes, count: nodes.length }, timestamp: new Date().toISOString() };
  },
  /** Get Matrix Integrity report (operational + structural) */
  integrity: async () => {
    const { buildMatrixNodes, calculateIntegrity, getNodeDefinitions } = await import('./core/matrixNodeRegistry');
    const healthData: Record<string, number> = {};
    getNodeDefinitions().forEach(n => { healthData[n.id] = 100; });
    const nodes = buildMatrixNodes(healthData);
    const report = calculateIntegrity(nodes);
    return { success: true, module: 'matrix' as const, action: 'integrity', data: report, timestamp: new Date().toISOString() };
  },
  /** Get breaker state for all Matrix Nodes */
  breakers: async () => {
    const { buildMatrixNodes, getNodeDefinitions } = await import('./core/matrixNodeRegistry');
    const healthData: Record<string, number> = {};
    getNodeDefinitions().forEach(n => { healthData[n.id] = 100; });
    const nodes = buildMatrixNodes(healthData);
    const breakers = nodes.map(n => ({ id: n.id, label: n.label, sector: n.sector, breakerState: n.breakerState, failureCount: n.failureCount, lastRecovery: n.lastRecovery }));
    return { success: true, module: 'matrix' as const, action: 'breakers', data: { breakers, open: breakers.filter(b => b.breakerState === 'open').length }, timestamp: new Date().toISOString() };
  },
};

// Quick access — 40 nodes across 12 sectors
export const core = substrate.core;
export const brain = substrate.brain;
export const decode = substrate.decode;
export const defense = substrate.defense;
export const nexus = substrate.nexus;
export const vision = substrate.vision;
export const dream = substrate.dream;
export const ripple = substrate.ripple;
export const access = substrate.access;
export const system = substrate.system;
export const modernizer = substrate.modernizer;
export const integration = substrate.integration;
export const inclusive = substrate.inclusive;
export const cortex = substrate.cortex;
export const seba = substrate.seba;
// Infrastructure Six + Encode
export const memoryMod = substrate.memory;
export const relayMod = substrate.relay;
export const auditMod = substrate.audit;
export const identityMod = substrate.identity;
export const economyMod = substrate.economy;
export const sandboxMod = substrate.sandboxMod;
export const encodeMod = substrate.encode;
// ESZ — Expansion Sovereignty Zone
export const sovereignMod = substrate.sovereign;
export const oracleMod = substrate.oracle;
export const conscienceMod = substrate.conscience;
export const treatyMod = substrate.treaty;
// EPZ — Expansion Perception Zone
export const compassMod = substrate.compass;
export const echoMod = substrate.echoMod;
export const reflexMod = substrate.reflex;
// EMZ — Expansion Manufacturing Zone
export const forgeMod = substrate.forge;
export const linguaMod = substrate.lingua;
export const harvestMod = substrate.harvest;
// CSZ — Covert/Shadow Zone
export const evolutionMod = substrate.evolutionMod;
export const shadowMod = substrate.shadowMod;
export const phantomMod = substrate.phantom;
// Fields + Plane + Execution additions
export const immunityMod = substrate.immunityMod;
export const intentMod = substrate.intentMod;
export const governanceMod = substrate.governanceMod;
export const medicMod = substrate.medic;
export const nerveMod = substrate.nerve;
// Plane & Maintenance additions (Nodes 39-40)
export const engineerMod = substrate.engineer;
export const atlasMod = substrate.atlas;
