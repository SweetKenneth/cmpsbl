/**
 * INTEGRATION Module Enhancements — v9.1.0 ARCHITECT Epoch
 * AdapterHealthMonitor, WebhookOrchestrator, DataTransformer
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTER HEALTH MONITOR — External integration health tracking
// ═══════════════════════════════════════════════════════════════════════════════

interface AdapterStatus {
  id: string;
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency: number;
  errorRate: number;
  lastCheck: number;
  consecutiveFailures: number;
  metadata?: Record<string, unknown>;
}

interface HealthCheckResult {
  adapterId: string;
  healthy: boolean;
  latencyMs: number;
  statusCode?: number;
  message: string;
}

export class AdapterHealthMonitor {
  private adapters: Map<string, AdapterStatus> = new Map();
  private checkHistory: Map<string, HealthCheckResult[]> = new Map();
  private checkInterval: number = 30000; // 30 seconds

  /** Register an adapter for monitoring */
  registerAdapter(id: string, name: string, endpoint: string): void {
    this.adapters.set(id, {
      id,
      name,
      endpoint,
      status: 'unknown',
      latency: 0,
      errorRate: 0,
      lastCheck: 0,
      consecutiveFailures: 0,
    });
    this.checkHistory.set(id, []);
  }

  /** Record a health check result */
  recordCheck(result: HealthCheckResult): void {
    const adapter = this.adapters.get(result.adapterId);
    if (!adapter) return;

    // Update history
    const history = this.checkHistory.get(result.adapterId) || [];
    history.push(result);
    if (history.length > 100) history.shift();
    this.checkHistory.set(result.adapterId, history);

    // Update adapter status
    adapter.lastCheck = Date.now();
    adapter.latency = adapter.latency * 0.7 + result.latencyMs * 0.3; // EMA

    if (result.healthy) {
      adapter.consecutiveFailures = 0;
    } else {
      adapter.consecutiveFailures++;
    }

    // Calculate error rate from recent history
    const recentChecks = history.slice(-20);
    const failures = recentChecks.filter(c => !c.healthy).length;
    adapter.errorRate = failures / recentChecks.length;

    // Determine status
    if (adapter.errorRate > 0.5 || adapter.consecutiveFailures >= 3) {
      adapter.status = 'unhealthy';
    } else if (adapter.errorRate > 0.2 || adapter.latency > 5000) {
      adapter.status = 'degraded';
    } else {
      adapter.status = 'healthy';
    }
  }

  /** Get all adapter statuses */
  getStatuses(): AdapterStatus[] {
    return Array.from(this.adapters.values());
  }

  /** Get unhealthy adapters */
  getUnhealthy(): AdapterStatus[] {
    return Array.from(this.adapters.values())
      .filter(a => a.status === 'unhealthy' || a.status === 'degraded');
  }

  /** Get adapter health history */
  getHistory(adapterId: string): HealthCheckResult[] {
    return this.checkHistory.get(adapterId) || [];
  }

  /** Get overall health summary */
  getSummary(): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    avgLatency: number;
  } {
    const adapters = Array.from(this.adapters.values());
    const healthy = adapters.filter(a => a.status === 'healthy').length;
    const degraded = adapters.filter(a => a.status === 'degraded').length;
    const unhealthy = adapters.filter(a => a.status === 'unhealthy').length;
    const avgLatency = adapters.length > 0
      ? adapters.reduce((a, b) => a + b.latency, 0) / adapters.length
      : 0;

    return { total: adapters.length, healthy, degraded, unhealthy, avgLatency };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK ORCHESTRATOR — Webhook delivery management with retries
// ═══════════════════════════════════════════════════════════════════════════════

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  retryPolicy: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: unknown;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  createdAt: number;
  deliveredAt?: number;
  lastError?: string;
}

interface DeliveryResult {
  deliveryId: string;
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
}

export class WebhookOrchestrator {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private stats: Map<string, { delivered: number; failed: number }> = new Map();

  /** Register a webhook */
  registerWebhook(config: WebhookConfig): void {
    this.webhooks.set(config.id, config);
    this.stats.set(config.id, { delivered: 0, failed: 0 });
  }

  /** Queue a webhook delivery */
  queue(webhookId: string, event: string, payload: unknown): string | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || !webhook.active || !webhook.events.includes(event)) {
      return null;
    }

    const id = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.deliveries.set(id, {
      id,
      webhookId,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now(),
    });

    return id;
  }

  /** Process a delivery (simulate sending) */
  async deliver(deliveryId: string): Promise<DeliveryResult> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return { deliveryId, success: false, responseTime: 0, error: 'Delivery not found' };
    }

    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      return { deliveryId, success: false, responseTime: 0, error: 'Webhook not found' };
    }

    delivery.attempts++;
    delivery.status = 'retrying';

    const startTime = Date.now();
    
    try {
      // Simulate delivery (in production, make actual HTTP request)
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      // Simulate occasional failures
      if (Math.random() < 0.1) {
        throw new Error('Simulated delivery failure');
      }

      const responseTime = Date.now() - startTime;
      delivery.status = 'delivered';
      delivery.deliveredAt = Date.now();

      const stats = this.stats.get(delivery.webhookId)!;
      stats.delivered++;

      return { deliveryId, success: true, statusCode: 200, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (delivery.attempts >= webhook.retryPolicy.maxRetries) {
        delivery.status = 'failed';
        delivery.lastError = errorMessage;
        const stats = this.stats.get(delivery.webhookId)!;
        stats.failed++;
      } else {
        delivery.status = 'pending'; // Will be retried
        delivery.lastError = errorMessage;
      }

      return { deliveryId, success: false, responseTime, error: errorMessage };
    }
  }

  /** Get pending deliveries for retry */
  getPendingRetries(): WebhookDelivery[] {
    return Array.from(this.deliveries.values())
      .filter(d => d.status === 'pending' && d.attempts > 0);
  }

  /** Get webhook statistics */
  getStats(webhookId: string): { delivered: number; failed: number; successRate: number } | null {
    const stats = this.stats.get(webhookId);
    if (!stats) return null;

    const total = stats.delivered + stats.failed;
    return {
      ...stats,
      successRate: total > 0 ? stats.delivered / total : 1,
    };
  }

  /** Enable/disable a webhook */
  setActive(webhookId: string, active: boolean): boolean {
    const webhook = this.webhooks.get(webhookId);
    if (webhook) {
      webhook.active = active;
      return true;
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA TRANSFORMER — Schema mapping and data transformation
// ═══════════════════════════════════════════════════════════════════════════════

interface TransformRule {
  source: string;
  target: string;
  transform?: (value: unknown) => unknown;
  default?: unknown;
}

interface TransformSchema {
  id: string;
  name: string;
  rules: TransformRule[];
  preProcess?: (data: unknown) => unknown;
  postProcess?: (data: unknown) => unknown;
}

interface TransformResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors: string[];
  transformedFields: number;
}

export class DataTransformer {
  private schemas: Map<string, TransformSchema> = new Map();
  private transformHistory: Array<{ schemaId: string; success: boolean; timestamp: number }> = [];

  /** Register a transform schema */
  registerSchema(schema: TransformSchema): void {
    this.schemas.set(schema.id, schema);
  }

  /** Transform data using a schema */
  transform(schemaId: string, data: unknown): TransformResult {
    const schema = this.schemas.get(schemaId);
    if (!schema) {
      return {
        success: false,
        errors: [`Schema not found: ${schemaId}`],
        transformedFields: 0,
      };
    }

    const errors: string[] = [];
    let transformedFields = 0;

    try {
      // Pre-process
      let processedData = data;
      if (schema.preProcess) {
        processedData = schema.preProcess(data);
      }

      // Apply transform rules
      const result: Record<string, unknown> = {};
      
      for (const rule of schema.rules) {
        try {
          const sourceValue = this.getNestedValue(processedData, rule.source);
          
          let targetValue: unknown;
          if (sourceValue === undefined) {
            targetValue = rule.default;
          } else if (rule.transform) {
            targetValue = rule.transform(sourceValue);
          } else {
            targetValue = sourceValue;
          }

          if (targetValue !== undefined) {
            this.setNestedValue(result, rule.target, targetValue);
            transformedFields++;
          }
        } catch (error) {
          errors.push(`Failed to transform ${rule.source} → ${rule.target}: ${error}`);
        }
      }

      // Post-process
      const finalResult = schema.postProcess 
        ? schema.postProcess(result) as Record<string, unknown>
        : result;

      this.transformHistory.push({ schemaId, success: true, timestamp: Date.now() });
      if (this.transformHistory.length > 1000) this.transformHistory.shift();

      return {
        success: errors.length === 0,
        data: finalResult,
        errors,
        transformedFields,
      };
    } catch (error) {
      this.transformHistory.push({ schemaId, success: false, timestamp: Date.now() });
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Transform failed'],
        transformedFields: 0,
      };
    }
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  /** Get transform statistics */
  getStats(schemaId?: string): { total: number; successful: number; successRate: number } {
    let history = this.transformHistory;
    if (schemaId) {
      history = history.filter(h => h.schemaId === schemaId);
    }

    const successful = history.filter(h => h.success).length;
    return {
      total: history.length,
      successful,
      successRate: history.length > 0 ? successful / history.length : 1,
    };
  }

  /** Create common transforms */
  static commonTransforms = {
    uppercase: (v: unknown) => typeof v === 'string' ? v.toUpperCase() : v,
    lowercase: (v: unknown) => typeof v === 'string' ? v.toLowerCase() : v,
    trim: (v: unknown) => typeof v === 'string' ? v.trim() : v,
    toNumber: (v: unknown) => Number(v),
    toString: (v: unknown) => String(v),
    toBoolean: (v: unknown) => Boolean(v),
    toDate: (v: unknown) => new Date(v as string | number),
    toArray: (v: unknown) => Array.isArray(v) ? v : [v],
    first: (v: unknown) => Array.isArray(v) ? v[0] : v,
    last: (v: unknown) => Array.isArray(v) ? v[v.length - 1] : v,
    join: (separator: string) => (v: unknown) => Array.isArray(v) ? v.join(separator) : v,
    split: (separator: string) => (v: unknown) => typeof v === 'string' ? v.split(separator) : v,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const integrationEnhancements = {
  AdapterHealthMonitor,
  WebhookOrchestrator,
  DataTransformer,
};

export type {
  AdapterStatus,
  HealthCheckResult,
  WebhookConfig,
  WebhookDelivery,
  DeliveryResult,
  TransformRule,
  TransformSchema,
  TransformResult,
};
