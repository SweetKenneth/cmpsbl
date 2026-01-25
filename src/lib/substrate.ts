/**
 * promptfluid® Substrate Client
 * v4.2.0 — Cognitive Orchestration Substrate (12-Module Architecture)
 * 
 * Unified API for all 12 substrate modules:
 * - Core: Kernel (scheduler, lifecycle, routing)
 * - Ripple: Message bus (queues, pub/sub, events)
 * - Access: Identity (API keys, quotas, usage)
 * - Brain: Three-tier memory, learning, knowledge graph
 * - Decode: Intent decoding, cognitive interface
 * - Defense: Security, bot detection, threats
 * - Nexus: AI routing, multi-provider
 * - Vision: Observability, metrics, health
 * - Dream: Nocturnal processing, mutation
 * - System: Administration, backup, healing
 * - Modernizer: Self-upgrade, proposals
 * - Integration: Enterprise adapters, auto-discovery, LLM governance
 */

import { supabase } from '@/integrations/supabase/client';

export type SubstrateModule = 'core' | 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'ripple' | 'access' | 'system' | 'modernizer' | 'integration' | 'cortex';

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
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: request,
      });

      const now = new Date().toISOString();

      if (error) {
        return {
          success: false,
          module: request.module,
          action: request.action,
          error: error.message,
          timestamp: now,
        };
      }

      // Many substrate actions return HTTP 200 with a JSON body containing { success: false, ... }.
      // Treat that as a failure so the terminal/UI doesn't show confusing “2xx but error” states.
      const payload = data as any;
      if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
        const message =
          payload.error_message ||
          payload.error ||
          payload.message ||
          'Command failed';

        return {
          success: false,
          module: request.module,
          action: request.action,
          error: String(message),
          data: payload as T,
          timestamp: now,
        };
      }

      return {
        success: true,
        module: request.module,
        action: request.action,
        data: data as T,
        timestamp: now,
      };
    } catch (err) {
      return {
        success: false,
        module: request.module,
        action: request.action,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Brain Module — Memory, Learning, Reflection, Intelligence
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    /** Cross-domain cognitive synthesis - connects patterns across memory tiers */
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
    
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
    
    // NEW: Advanced Intelligence Methods
    /** Memory optimization - compress old memories, clean duplicates */
    optimize: () =>
      this.invoke({ module: 'brain', action: 'optimize' }),
    
    /** Deep thinking mode - extended reasoning with chain of thought */
    deepThink: (query: string, depth?: number) =>
      this.invoke({ module: 'brain', action: 'deep_think', payload: { query, depth } }),
    
    /** Test a hypothesis against the knowledge graph */
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
    
    /** v3.11.0: Memory coherence validation - cross-tier coherence check (read-only) */
    coherenceCheck: (depth?: 'standard' | 'deep') =>
      this.invoke({ module: 'brain', action: 'coherence_check', payload: { depth } }),
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
    diagnostics: () =>
      this.invoke({ module: 'system', action: 'diagnostics' }),
    
    /** Restart a specific service or all services */
    restart: (service?: string) =>
      this.invoke({ module: 'system', action: 'restart', payload: { service } }),
    
    /** v3.2.0: Create a validated backup snapshot with optional data export */
    backup: (options?: { include_data?: boolean; tables?: string[] }) =>
      this.invoke({ module: 'system', action: 'backup', payload: options }),
    
    /** v3.2.0: Restore from backup with validation */
    restore: (backup_id: string, validate_only?: boolean) =>
      this.invoke({ module: 'system', action: 'restore', payload: { backup_id, validate_only } }),
    
    /** List available backups */
    listBackups: () =>
      this.invoke({ module: 'system', action: 'list_backups' }),
    
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

  // Modernizer Module — Substrate Codebase Analysis & Improvement Engine (v3.13.0)
  // Scans the substrate architecture for improvements, NOT external websites
  modernizer = {
    /** Get modernizer service status with substrate health metrics */
    status: () =>
      this.invoke({ module: 'modernizer', action: 'status' }),
    
    /** List recent substrate scans and improvement proposals */
    jobs: (limit?: number) =>
      this.invoke({ module: 'modernizer', action: 'jobs', payload: { limit } }),
    
    /** Scan the substrate codebase for architecture improvements */
    scan: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'modernizer', action: 'scan', payload: options }),
    
    /** Alias for scan - submit a substrate analysis request */
    submit: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'modernizer', action: 'scan', payload: options }),
    
    /** Get a specific scan/job by ID */
    job: (job_id: string) =>
      this.invoke({ module: 'modernizer', action: 'job', payload: { job_id } }),
    
    /** Check usage quota for scans */
    quota: () =>
      this.invoke({ module: 'modernizer', action: 'quota' }),
    
    /** Quick analysis of a specific substrate module */
    analyze: (module?: string) =>
      this.invoke({ module: 'modernizer', action: 'analyze', payload: { module } }),
    
    /** Export improvement proposals */
    export: (job_id: string) =>
      this.invoke({ module: 'modernizer', action: 'export', payload: { job_id } }),
    
    /** Lightweight heartbeat */
    pulse: () =>
      this.invoke({ module: 'modernizer', action: 'pulse' }),
    
    // ═══ NEW: Shadow-mode upgrade workflow ═══
    
    /** Generate an upgrade proposal (shadow mode - requires human approval) */
    propose: (options?: { scope?: string; notes?: string; max_changes?: number }) =>
      this.invoke({ module: 'modernizer', action: 'propose', payload: options }),
    
    /** List all upgrade plans */
    plans: () =>
      this.invoke({ module: 'modernizer', action: 'plans' }),
    
    /** Review a specific upgrade plan */
    review: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'review', payload: { plan_id } }),
    
    /** Validate plan readiness (checks health, modules, backup) */
    validate: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'validate_plan', plan_id }
      }),
    
    /** View plan diff and health comparison */
    diff: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'diff_view', plan_id }
      }),
    
    /** Apply an approved upgrade plan (auto-routes shadow→production) */
    apply: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_plan', plan_id }
      }),
    
    /** Apply plan to shadow mode only */
    applyShadow: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_shadow', plan_id }
      }),
    
    /** Test shadow mode changes before production */
    testShadow: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'test_shadow', plan_id }
      }),
    
    /** Promote shadow changes to production */
    applyProduction: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_production', plan_id }
      }),
    
    /** Rollback an applied upgrade to pre-upgrade state */
    rollback: (plan_id: string) =>
      supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'rollback_plan', plan_id }
      }),
    
    /** Delete/reject an upgrade plan (cannot delete applied plans) */
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
    events: (options?: { topic?: string; limit?: number; unprocessed_only?: boolean }) =>
      this.invoke({ module: 'ripple', action: 'events', payload: options }),
    
    /** View dead letter queue (failed jobs) */
    deadLetter: () =>
      this.invoke({ module: 'ripple', action: 'dead_letter' }),
    
    /** Retry a failed job */
    retry: (job_id: string) =>
      this.invoke({ module: 'ripple', action: 'retry', payload: { job_id } }),
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
    
    /** Create a new API key */
    createKey: (options: { developer_id: string; name?: string; scopes?: string[]; rate_limit_per_minute?: number; rate_limit_per_day?: number }) =>
      this.invoke({ module: 'access', action: 'create_key', payload: options }),
    
    /** Validate an API key */
    validateKey: (api_key: string) =>
      this.invoke({ module: 'access', action: 'validate_key', payload: { api_key } }),
    
    /** Revoke an API key */
    revokeKey: (key_id: string) =>
      this.invoke({ module: 'access', action: 'revoke_key', payload: { key_id } }),
    
    /** List API keys for a developer */
    listKeys: (developer_id: string) =>
      this.invoke({ module: 'access', action: 'list_keys', payload: { developer_id } }),
    
    /** Get usage statistics */
    getUsage: (options?: { api_key_id?: string; developer_id?: string; start_date?: string; end_date?: string }) =>
      this.invoke({ module: 'access', action: 'usage', payload: options }),
    
    /** Check quota remaining for an API key */
    checkQuota: (api_key_id: string) =>
      this.invoke({ module: 'access', action: 'quota', payload: { api_key_id } }),
    
    /** Record usage for metering */
    recordUsage: (options: { api_key_id?: string; developer_id?: string; module: string; action: string; tokens_used?: number; compute_ms?: number; cost_millicents?: number }) =>
      this.invoke({ module: 'access', action: 'record_usage', payload: options }),
    
    /** Get subscription info for a developer */
    subscription: (developer_id: string) =>
      this.invoke({ module: 'access', action: 'subscription', payload: { developer_id } }),
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
  };
}

export const substrate = SubstrateClient.getInstance();

// Quick access functions for all 13 modules (12 core + cortex orchestrator)
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
export const cortex = substrate.cortex;
