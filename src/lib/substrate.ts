/**
 * promptfluid® Substrate Client
 * v2026.01 — Cognitive Orchestration Substrate for AI Systems
 * 
 * Unified API for all substrate modules:
 * - Brain: Memory, learning, reflection
 * - Decode: Intent decoding, cognitive interface (Interpreter Primitive)
 * - Defense: Security, bot detection, threats
 * - Nexus: AI routing, multi-provider
 * - Vision: Observability, metrics, health
 * 
 * Decode is the substrate's interpreter primitive. It translates human
 * ambiguity into substrate-structured cognition without asserting facts,
 * agency, or execution authority.
 */

import { supabase } from '@/integrations/supabase/client';

export type SubstrateModule = 'core' | 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'ripple' | 'access' | 'system' | 'modernizer';

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

      if (error) {
        return {
          success: false,
          module: request.module,
          action: request.action,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        module: request.module,
        action: request.action,
        data: data as T,
        timestamp: new Date().toISOString(),
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
    
    audit: () =>
      this.invoke({ module: 'system', action: 'audit' }),
    
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
    
    /** Apply an approved upgrade plan (requires human confirmation) */
    apply: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'apply', payload: { plan_id } }),
    
    /** Rollback an applied upgrade to pre-upgrade state */
    rollback: (plan_id: string) =>
      this.invoke({ module: 'modernizer', action: 'rollback', payload: { plan_id } }),
    
    /** Delete/reject an upgrade plan (cannot delete applied plans) */
    delete: (plan_id: string, reason?: string) =>
      this.invoke({ module: 'modernizer', action: 'delete', payload: { plan_id, reason } }),
    
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

}

export const substrate = SubstrateClient.getInstance();

// Quick access functions for all 11 modules
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
