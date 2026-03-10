/**
 * S-Tier 096 — Webhook Reliability Engine
 * ID: S-114 | CJPI: 90 | Module: INTEGRATION
 * 
 * Reliable webhook delivery with retry, dead-letter, and idempotency guarantees.
 */

export interface WebhookEvent {
  id: string;
  url: string;
  payload: unknown;
  headers?: Record<string, string>;
  createdAt: string;
  idempotencyKey: string;
}

export interface DeliveryAttempt {
  eventId: string;
  attemptNumber: number;
  statusCode: number | null;
  error: string | null;
  durationMs: number;
  timestamp: string;
}

export interface WebhookConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
  deadLetterAfterRetries: number;
}

const DEFAULT_CONFIG: WebhookConfig = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  timeoutMs: 10000,
  deadLetterAfterRetries: 5,
};

export class WebhookReliabilityEngine {
  private config: WebhookConfig;
  private deliveryLog: DeliveryAttempt[] = [];
  private deadLetter: WebhookEvent[] = [];
  private processedKeys = new Set<string>();

  constructor(config: Partial<WebhookConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  calculateBackoff(attempt: number): number {
    const delay = this.config.baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * this.config.baseDelayMs;
    return Math.min(delay + jitter, this.config.maxDelayMs);
  }

  isDuplicate(event: WebhookEvent): boolean {
    return this.processedKeys.has(event.idempotencyKey);
  }

  recordDelivery(eventId: string, attempt: number, statusCode: number | null, error: string | null, durationMs: number): DeliveryAttempt {
    const record: DeliveryAttempt = {
      eventId,
      attemptNumber: attempt,
      statusCode,
      error,
      durationMs,
      timestamp: new Date().toISOString(),
    };
    this.deliveryLog.push(record);
    return record;
  }

  shouldRetry(statusCode: number | null, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) return false;
    if (statusCode === null) return true; // Network error
    if (statusCode >= 500) return true;
    if (statusCode === 429) return true;
    return false;
  }

  moveToDeadLetter(event: WebhookEvent): void {
    this.deadLetter.push(event);
    this.processedKeys.add(event.idempotencyKey);
  }

  markDelivered(event: WebhookEvent): void {
    this.processedKeys.add(event.idempotencyKey);
  }

  getDeadLetterQueue(): WebhookEvent[] { return [...this.deadLetter]; }
  getDeliveryHistory(eventId: string): DeliveryAttempt[] {
    return this.deliveryLog.filter(d => d.eventId === eventId);
  }

  getStats() {
    const total = this.deliveryLog.length;
    const successful = this.deliveryLog.filter(d => d.statusCode && d.statusCode >= 200 && d.statusCode < 300).length;
    return {
      totalAttempts: total,
      successRate: total > 0 ? successful / total : 0,
      deadLetterCount: this.deadLetter.length,
      processedCount: this.processedKeys.size,
    };
  }
}
