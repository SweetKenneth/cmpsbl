/**
 * promptfluid® Substrate Client SDK
 * v2026.02 — Cognitive Orchestration Substrate with BYOK
 * 
 * Standalone TypeScript SDK for integrating with the promptfluid substrate.
 * 
 * IMPORTANT: This is a BYOK (Bring Your Own Keys) architecture.
 * Developers pay their own LLM compute costs directly to providers.
 * 
 * Installation:
 * 1. Copy this file to your project
 * 2. Install @supabase/supabase-js
 * 3. Configure your endpoint and keys
 * 
 * Usage:
 * const substrate = new SubstrateClient({
 *   url: 'https://YOUR_PROJECT.supabase.co',
 *   anonKey: 'YOUR_ANON_KEY',
 *   developerId: 'YOUR_DEV_ID',
 *   appId: 'YOUR_APP_ID'
 * });
 * 
 * // Register your API keys (BYOK)
 * await substrate.keys.register('openai', 'sk-...');
 * 
 * // Use AI with your own keys
 * await substrate.ai.chat([{ role: 'user', content: 'Hello!' }], { provider: 'openai', model: 'gpt-4' });
 */

export type SubstrateModule = 'core' | 'ripple' | 'access' | 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'modernizer';

export interface SubstrateConfig {
  url: string;
  anonKey: string;
  authToken?: string;
  developerId?: string;
  appId?: string;
}

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

// BYOK Types
export interface BYOKMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BYOKOptions {
  provider: 'openai' | 'anthropic' | 'groq' | 'together' | 'deepseek' | 'mistral' | 'cohere' | 'fireworks' | 'hyperbolic' | 'cerebras';
  model: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Extension Types
export type ExtensionType = 'brain_hook' | 'nexus_hook' | 'defense_hook' | 'dream_hook' | 'vision_hook' | 'custom';

export interface ExtensionConfig {
  name: string;
  version: string;
  description?: string;
  extension_type: ExtensionType;
  hook_point?: string;
  config?: Record<string, unknown>;
  endpoint_url?: string;
  schema?: Record<string, unknown>;
}

// Integration Types
export type IntegrationType = 'stripe' | 'twilio' | 'shopify' | 'n8n' | 'webhook' | 'custom';

export interface IntegrationConfig {
  name: string;
  integration_type: IntegrationType;
  config: Record<string, unknown>;
  credentials?: Record<string, string>;
  webhook_url?: string;
}

// Agent Types
export type AgentPattern = 'chain' | 'parallel' | 'supervisor' | 'debate' | 'swarm';

export interface AgentConfig {
  name: string;
  description?: string;
  system_prompt: string;
  provider: string;
  model: string;
  tools?: string[];
  temperature?: number;
  max_tokens?: number;
}

export class SubstrateClient {
  private config: SubstrateConfig;

  constructor(config: SubstrateConfig) {
    this.config = config;
  }

  private async invoke<T = unknown>(request: SubstrateRequest): Promise<SubstrateResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': this.config.anonKey,
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }

      const response = await fetch(`${this.config.url}/functions/v1/pf-substrate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

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

  private async invokeEdge<T = unknown>(
    functionName: string, 
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': this.config.anonKey,
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }
      if (this.config.developerId) {
        headers['x-developer-id'] = this.config.developerId;
      }
      if (this.config.appId) {
        headers['x-app-id'] = this.config.appId;
      }

      const response = await fetch(`${this.config.url}/functions/v1/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }

      return { success: true, data: data as T };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string) {
    this.config.authToken = token;
  }

  // Set developer credentials for BYOK
  setDeveloper(developerId: string, appId: string) {
    this.config.developerId = developerId;
    this.config.appId = appId;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BYOK API KEYS MODULE — Bring Your Own Keys
  // ═══════════════════════════════════════════════════════════════════════════

  keys = {
    /**
     * Register an API key for a provider (encrypted server-side)
     */
    register: (provider: string, apiKey: string, options?: { rateLimitRpm?: number }) =>
      this.invokeEdge('byok-proxy', {
        action: 'register_key',
        provider,
        api_key: apiKey,
        rate_limit_rpm: options?.rateLimitRpm || 60,
      }),

    /**
     * List registered API keys (keys are masked)
     */
    list: () =>
      this.invokeEdge('byok-proxy', { action: 'list_keys' }),

    /**
     * Rotate an API key
     */
    rotate: (provider: string, newApiKey: string) =>
      this.invokeEdge('byok-proxy', {
        action: 'rotate_key',
        provider,
        api_key: newApiKey,
      }),

    /**
     * Revoke an API key
     */
    revoke: (provider: string) =>
      this.invokeEdge('byok-proxy', { action: 'revoke_key', provider }),

    /**
     * Get usage statistics for a provider
     */
    usage: (provider?: string, days?: number) =>
      this.invokeEdge('byok-proxy', { action: 'usage', provider, days: days || 30 }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AI MODULE — BYOK AI Calls
  // ═══════════════════════════════════════════════════════════════════════════

  ai = {
    /**
     * Send a chat completion request using your own API key
     */
    chat: (messages: BYOKMessage[], options: BYOKOptions) =>
      this.invokeEdge('byok-proxy', {
        provider: options.provider,
        model: options.model,
        messages,
        max_tokens: options.max_tokens || 1024,
        temperature: options.temperature || 0.7,
        stream: options.stream || false,
      }),

    /**
     * Send a single prompt (convenience method)
     */
    prompt: (prompt: string, options: BYOKOptions) =>
      this.invokeEdge('byok-proxy', {
        provider: options.provider,
        model: options.model,
        prompt,
        max_tokens: options.max_tokens || 1024,
        temperature: options.temperature || 0.7,
      }),

    /**
     * Get supported providers
     */
    providers: () => ({
      success: true,
      data: {
        providers: [
          { name: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
          { name: 'anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
          { name: 'groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
          { name: 'together', models: ['meta-llama/Llama-3-70b-chat-hf'] },
          { name: 'deepseek', models: ['deepseek-chat', 'deepseek-coder'] },
          { name: 'mistral', models: ['mistral-large-latest', 'mistral-medium'] },
          { name: 'cohere', models: ['command-r-plus', 'command-r'] },
          { name: 'fireworks', models: ['accounts/fireworks/models/llama-v3p1-70b-instruct'] },
          { name: 'hyperbolic', models: ['meta-llama/Llama-3.2-3B-Instruct'] },
          { name: 'cerebras', models: ['llama3.1-8b', 'llama3.1-70b'] },
        ],
      },
    }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTENSIONS MODULE — Plugin Registry
  // ═══════════════════════════════════════════════════════════════════════════

  extensions = {
    /**
     * Register a new extension
     */
    register: (extension: ExtensionConfig) =>
      this.invokeEdge('extension-registry', { action: 'register', extension }),

    /**
     * List all extensions
     */
    list: (filters?: { type?: ExtensionType; is_enabled?: boolean; author?: string }) =>
      this.invokeEdge('extension-registry', { action: 'list', filters }),

    /**
     * Get extension by ID
     */
    get: (extensionId: string) =>
      this.invokeEdge('extension-registry', { action: 'get', extension_id: extensionId }),

    /**
     * Enable an extension
     */
    enable: (extensionId: string) =>
      this.invokeEdge('extension-registry', { action: 'enable', extension_id: extensionId }),

    /**
     * Disable an extension
     */
    disable: (extensionId: string) =>
      this.invokeEdge('extension-registry', { action: 'disable', extension_id: extensionId }),

    /**
     * Unregister an extension
     */
    unregister: (extensionId: string) =>
      this.invokeEdge('extension-registry', { action: 'unregister', extension_id: extensionId }),

    /**
     * Invoke an extension
     */
    invoke: (extensionId: string, payload: Record<string, unknown>) =>
      this.invokeEdge('extension-registry', { 
        action: 'invoke', 
        extension_id: extensionId, 
        invoke_payload: payload 
      }),

    /**
     * Get all registered hooks by type
     */
    hooks: (type?: ExtensionType) =>
      this.invokeEdge('extension-registry', { action: 'hooks', filters: { type } }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATIONS MODULE — External Service Connections
  // ═══════════════════════════════════════════════════════════════════════════

  integrations = {
    /**
     * Connect a new integration
     */
    connect: (integration: IntegrationConfig) =>
      this.invokeEdge('integration-bus', { action: 'connect', integration }),

    /**
     * List all integrations
     */
    list: (filters?: { type?: IntegrationType; is_active?: boolean }) =>
      this.invokeEdge('integration-bus', { action: 'list', filters }),

    /**
     * Get integration by ID
     */
    get: (integrationId: string) =>
      this.invokeEdge('integration-bus', { action: 'get', integration_id: integrationId }),

    /**
     * Update integration configuration
     */
    update: (integrationId: string, config: Record<string, unknown>) =>
      this.invokeEdge('integration-bus', { 
        action: 'update', 
        integration_id: integrationId, 
        config 
      }),

    /**
     * Disconnect an integration
     */
    disconnect: (integrationId: string) =>
      this.invokeEdge('integration-bus', { action: 'disconnect', integration_id: integrationId }),

    /**
     * Call an integration's API
     */
    call: (integrationId: string, method: string, params?: Record<string, unknown>) =>
      this.invokeEdge('integration-bus', { 
        action: 'call', 
        integration_id: integrationId, 
        method, 
        params 
      }),

    /**
     * Handle incoming webhook
     */
    webhook: (integrationId: string, payload: Record<string, unknown>) =>
      this.invokeEdge('integration-bus', { 
        action: 'webhook', 
        integration_id: integrationId, 
        payload 
      }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTS MODULE — Multi-Agent Orchestration
  // ═══════════════════════════════════════════════════════════════════════════

  agents = {
    /**
     * Create a new agent
     */
    create: (agent: AgentConfig) =>
      this.invokeEdge('agent-mesh', { action: 'create', agent }),

    /**
     * List all agents
     */
    list: (filters?: { is_active?: boolean }) =>
      this.invokeEdge('agent-mesh', { action: 'list', filters }),

    /**
     * Get agent by ID
     */
    get: (agentId: string) =>
      this.invokeEdge('agent-mesh', { action: 'get', agent_id: agentId }),

    /**
     * Update an agent
     */
    update: (agentId: string, updates: Partial<AgentConfig>) =>
      this.invokeEdge('agent-mesh', { action: 'update', agent_id: agentId, updates }),

    /**
     * Delete an agent
     */
    delete: (agentId: string) =>
      this.invokeEdge('agent-mesh', { action: 'delete', agent_id: agentId }),

    /**
     * Run agent(s) with a task using a coordination pattern
     */
    run: (
      agentIds: string[], 
      task: string, 
      options?: { pattern?: AgentPattern; context?: Record<string, unknown> }
    ) =>
      this.invokeEdge('agent-mesh', { 
        action: 'run', 
        agent_ids: agentIds, 
        task, 
        pattern: options?.pattern || 'chain',
        context: options?.context,
      }),

    /**
     * Get agent event history
     */
    events: (agentId?: string, limit?: number) =>
      this.invokeEdge('agent-mesh', { action: 'events', agent_id: agentId, limit: limit || 50 }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // APPS MODULE — Application Management
  // ═══════════════════════════════════════════════════════════════════════════

  apps = {
    /**
     * Register a new application
     */
    register: (name: string, description?: string) =>
      this.invokeEdge('byok-proxy', { 
        action: 'register_app', 
        name, 
        description 
      }),

    /**
     * List all applications
     */
    list: () =>
      this.invokeEdge('byok-proxy', { action: 'list_apps' }),

    /**
     * Get app by ID
     */
    get: (appId: string) =>
      this.invokeEdge('byok-proxy', { action: 'get_app', app_id: appId }),

    /**
     * Update app settings
     */
    update: (appId: string, updates: { name?: string; description?: string; is_active?: boolean }) =>
      this.invokeEdge('byok-proxy', { action: 'update_app', app_id: appId, ...updates }),

    /**
     * Get comprehensive usage metrics for an app
     */
    metrics: (appId: string, days?: number) =>
      this.invokeEdge('byok-proxy', { action: 'app_metrics', app_id: appId, days: days || 30 }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ORIGINAL MODULES — Brain, Decode, Defense, Nexus, Vision, Dream, System
  // ═══════════════════════════════════════════════════════════════════════════

  // Brain Module — Memory, Learning, Reflection
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    query: (query_text: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'query', payload: { query_text, limit } }),
    
    remember: (content: string, memory_type: string, confidence?: number, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'brain', action: 'remember', payload: { content, memory_type, confidence, metadata } }),
    
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
    
    synthesize: () =>
      this.invoke({ module: 'brain', action: 'synthesize' }),
    
    forecast: (metric?: string, window?: string) =>
      this.invoke({ module: 'brain', action: 'forecast', payload: { metric, window } }),
    
    status: () =>
      this.invoke({ module: 'brain', action: 'status' }),
    
    graphSummary: () =>
      this.invoke({ module: 'brain', action: 'graph_summary' }),
    
    sessionReflection: (hours?: number) =>
      this.invoke({ module: 'brain', action: 'session_reflection', payload: { hours } }),
    
    patterns: () =>
      this.invoke({ module: 'brain', action: 'patterns' }),
    
    curiosity: () =>
      this.invoke({ module: 'brain', action: 'curiosity' }),
    
    explore: (query: string) =>
      this.invoke({ module: 'brain', action: 'explore', payload: { query } }),
  };

  // Decode Module — Intent Decoding, Chat
  decode = {
    chat: (message: string, sessionId?: string) =>
      this.invoke({ module: 'decode', action: 'chat', payload: { message, sessionId } }),
    
    dream: () =>
      this.invoke({ module: 'decode', action: 'dream' }),
    
    propose: (idea: string) =>
      this.invoke({ module: 'decode', action: 'propose', payload: { idea } }),
    
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'decode', action: 'learn', payload: { content, source } }),
    
    status: () =>
      this.invoke({ module: 'decode', action: 'status' }),
    
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
    
    anomaly: (timeWindow: '1h' | '6h' | '24h' = '1h') =>
      this.invoke({ module: 'defense', action: 'anomaly', payload: { timeWindow } }),
    
    anomalyProbe: (lookbackHours?: number) =>
      this.invoke({ module: 'defense', action: 'anomaly_probe', payload: { lookbackHours } }),
    
    limits: () =>
      this.invoke({ module: 'defense', action: 'limits' }),
    
    posture: () =>
      this.invoke({ module: 'defense', action: 'posture' }),
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
    
    providers: () =>
      this.invoke({ module: 'nexus', action: 'providers' }),
    
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
    
    alert: (severity: 'info' | 'warn' | 'error' | 'critical', message: string, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'vision', action: 'alert', payload: { severity, message, metadata } }),
    
    audit: (entity?: string, action?: string) =>
      this.invoke({ module: 'vision', action: 'audit', payload: { entity, action } }),
    
    status: () =>
      this.invoke({ module: 'vision', action: 'status' }),
    
    dashboard: () =>
      this.invoke({ module: 'vision', action: 'dashboard' }),
    
    trace: (traceId?: string, options?: { create?: boolean; module?: string; action?: string; duration_ms?: number }) =>
      this.invoke({ module: 'vision', action: 'trace', payload: { traceId, ...options } }),
    
    monitor: () =>
      this.invoke({ module: 'vision', action: 'monitor' }),
    
    resilience: () =>
      this.invoke({ module: 'vision', action: 'resilience' }),
    
    analytics: () =>
      this.invoke({ module: 'vision', action: 'analytics' }),
    
    healthSnapshot: () =>
      this.invoke({ module: 'vision', action: 'health_snapshot' }),
    
    introspection: () =>
      this.invoke({ module: 'vision', action: 'introspection' }),
    
    pulse: () =>
      this.invoke({ module: 'vision', action: 'pulse' }),
    
    quota: () =>
      this.invoke({ module: 'vision', action: 'quota' }),
  };

  // System Module — Administration
  system = {
    status: () =>
      this.invoke({ module: 'system', action: 'status' }),
    
    version: () =>
      this.invoke({ module: 'system', action: 'version' }),
    
    config: (key?: string) =>
      this.invoke({ module: 'system', action: 'config', payload: { key } }),
    
    audit: () =>
      this.invoke({ module: 'system', action: 'audit' }),
    
    heal: (target?: string, force?: boolean) =>
      this.invoke({ module: 'system', action: 'heal', payload: { target, force } }),
    
    health: () =>
      this.invoke({ module: 'system', action: 'health' }),
    
    diagnostics: () =>
      this.invoke({ module: 'system', action: 'diagnostics' }),
    
    restart: (service?: string) =>
      this.invoke({ module: 'system', action: 'restart', payload: { service } }),
    
    backup: (options?: { include_data?: boolean; tables?: string[] }) =>
      this.invoke({ module: 'system', action: 'backup', payload: options }),
    
    restore: (backup_id: string, validate_only?: boolean) =>
      this.invoke({ module: 'system', action: 'restore', payload: { backup_id, validate_only } }),
    
    listBackups: () =>
      this.invoke({ module: 'system', action: 'list_backups' }),
  };

  // Dream Module — Dream-Eater Operations
  dream = {
    status: () =>
      this.invoke({ module: 'dream', action: 'status' }),
    
    mood: (mood?: string) =>
      this.invoke({ module: 'dream', action: 'mood', payload: { mood } }),
    
    cycle: () =>
      this.invoke({ module: 'dream', action: 'cycle' }),
    
    consume: (dream_id: string) =>
      this.invoke({ module: 'dream', action: 'consume', payload: { dream_id } }),
    
    interpret: (dream_text: string) =>
      this.invoke({ module: 'dream', action: 'interpret', payload: { dream_text } }),
    
    mutate: () =>
      this.invoke({ module: 'dream', action: 'mutation' }),
    
    reflect: () =>
      this.invoke({ module: 'dream', action: 'reflect' }),
    
    feed: (dream_content: string, dream_type?: string) =>
      this.invoke({ module: 'dream', action: 'feed', payload: { dream_content, dream_type } }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0.0 KERNEL MODULES — Core, Ripple, Access
  // ═══════════════════════════════════════════════════════════════════════════

  // Core Module — Kernel & Scheduler
  core = {
    status: () =>
      this.invoke({ module: 'core', action: 'status' }),
    
    pulse: () =>
      this.invoke({ module: 'core', action: 'pulse' }),
    
    boot: () =>
      this.invoke({ module: 'core', action: 'boot' }),
    
    schedule: (options: { module: SubstrateModule; action: string; payload?: Record<string, unknown>; delay?: string; priority?: number }) =>
      this.invoke({ module: 'core', action: 'schedule', payload: options }),
    
    jobs: (status?: 'queued' | 'processing' | 'completed' | 'failed', limit?: number) =>
      this.invoke({ module: 'core', action: 'jobs', payload: { status, limit } }),
    
    process: () =>
      this.invoke({ module: 'core', action: 'process' }),
    
    config: (key?: string, value?: unknown) =>
      this.invoke({ module: 'core', action: 'config', payload: { key, value } }),
    
    shutdown: () =>
      this.invoke({ module: 'core', action: 'shutdown' }),
  };

  // Ripple Module — Message Bus
  ripple = {
    status: () =>
      this.invoke({ module: 'ripple', action: 'status' }),
    
    pulse: () =>
      this.invoke({ module: 'ripple', action: 'pulse' }),
    
    enqueue: (queue: string, payload: Record<string, unknown>, options?: { priority?: number; delay?: string }) =>
      this.invoke({ module: 'ripple', action: 'enqueue', payload: { queue, payload, ...options } }),
    
    dequeue: (queue: string) =>
      this.invoke({ module: 'ripple', action: 'dequeue', payload: { queue } }),
    
    publish: (topic: string, event_type: string, payload?: Record<string, unknown>, correlation_id?: string) =>
      this.invoke({ module: 'ripple', action: 'publish', payload: { topic, event_type, payload, correlation_id } }),
    
    subscribe: (topic: string, subscriber_module: SubstrateModule, subscriber_action: string, filter?: Record<string, unknown>) =>
      this.invoke({ module: 'ripple', action: 'subscribe', payload: { topic, subscriber_module, subscriber_action, filter } }),
    
    topics: () =>
      this.invoke({ module: 'ripple', action: 'topics' }),
    
    events: (options?: { topic?: string; limit?: number; unprocessed_only?: boolean }) =>
      this.invoke({ module: 'ripple', action: 'events', payload: options }),
    
    deadLetter: () =>
      this.invoke({ module: 'ripple', action: 'dead_letter' }),
    
    retry: (job_id: string) =>
      this.invoke({ module: 'ripple', action: 'retry', payload: { job_id } }),
  };

  // Access Module — Identity & Billing
  access = {
    status: () =>
      this.invoke({ module: 'access', action: 'status' }),
    
    pulse: () =>
      this.invoke({ module: 'access', action: 'pulse' }),
    
    createKey: (options: { developer_id: string; name?: string; scopes?: string[]; rate_limit_per_minute?: number; rate_limit_per_day?: number }) =>
      this.invoke({ module: 'access', action: 'create_key', payload: options }),
    
    validateKey: (api_key: string) =>
      this.invoke({ module: 'access', action: 'validate_key', payload: { api_key } }),
    
    revokeKey: (key_id: string) =>
      this.invoke({ module: 'access', action: 'revoke_key', payload: { key_id } }),
    
    listKeys: (developer_id: string) =>
      this.invoke({ module: 'access', action: 'list_keys', payload: { developer_id } }),
    
    getUsage: (options?: { api_key_id?: string; developer_id?: string; start_date?: string; end_date?: string }) =>
      this.invoke({ module: 'access', action: 'usage', payload: options }),
    
    checkQuota: (api_key_id: string) =>
      this.invoke({ module: 'access', action: 'quota', payload: { api_key_id } }),
    
    recordUsage: (options: { api_key_id?: string; developer_id?: string; module: string; action: string; tokens_used?: number; compute_ms?: number; cost_millicents?: number }) =>
      this.invoke({ module: 'access', action: 'record_usage', payload: options }),
    
    subscription: (developer_id: string) =>
      this.invoke({ module: 'access', action: 'subscription', payload: { developer_id } }),
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION NODE — Self-Improvement Engine
  // ═══════════════════════════════════════════════════════════════════════════

  evolution = {
    status: () =>
      this.invoke({ module: 'evolution', action: 'status' }),
    
    pulse: () =>
      this.invoke({ module: 'evolution', action: 'pulse' }),
    
    scan: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) =>
      this.invoke({ module: 'evolution', action: 'scan', payload: options }),
    
    jobs: (limit?: number) =>
      this.invoke({ module: 'evolution', action: 'jobs', payload: { limit } }),
    
    job: (job_id: string) =>
      this.invoke({ module: 'evolution', action: 'job', payload: { job_id } }),
    
    quota: () =>
      this.invoke({ module: 'evolution', action: 'quota' }),
    
    analyze: (module?: string) =>
      this.invoke({ module: 'evolution', action: 'analyze', payload: { module } }),
    
    export: (job_id: string) =>
      this.invoke({ module: 'evolution', action: 'export', payload: { job_id } }),
    
    propose: (options?: { scope?: string; notes?: string; max_changes?: number }) =>
      this.invoke({ module: 'evolution', action: 'propose', payload: options }),
    
    plans: () =>
      this.invoke({ module: 'evolution', action: 'plans' }),
    
    review: (plan_id: string) =>
      this.invoke({ module: 'evolution', action: 'review', payload: { plan_id } }),
    
    apply: (plan_id: string) =>
      this.invoke({ module: 'evolution', action: 'apply', payload: { plan_id } }),
    
    rollback: (plan_id: string) =>
      this.invoke({ module: 'evolution', action: 'rollback', payload: { plan_id } }),
    
    delete: (plan_id: string, reason?: string) =>
      this.invoke({ module: 'evolution', action: 'delete', payload: { plan_id, reason } }),
    
    archived: () =>
      this.invoke({ module: 'evolution', action: 'archived' }),
    
    implement: (archived_function: string, target_action: string) =>
      this.invoke({ module: 'evolution', action: 'implement_archived', payload: { archived_function, target_action } }),
  };

  /** @deprecated Use evolution — MODERNIZER was absorbed by EVOLUTION */
  get modernizer() { return this.evolution; }
}

// Export for module usage
export default SubstrateClient;
