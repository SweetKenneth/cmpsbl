/**
 * Webhook Orchestrator
 * 
 * Manages inbound and outbound webhooks with signature verification,
 * replay protection, at-least-once delivery, and dead letter queue.
 * 
 * @module integration/ultimate/webhookOrchestrator
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface WebhookEndpoint {
  id: string;
  url: string;
  direction: 'inbound' | 'outbound';
  events: string[];
  secretKey: string;
  enabled: boolean;
  createdAt: number;
  healthScore: number;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  payload: unknown;
  status: 'pending' | 'delivered' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: number | null;
  nextRetryAt: number | null;
  responseCode: number | null;
  createdAt: number;
}

export interface InboundValidation {
  valid: boolean;
  reason: string;
  eventType?: string;
}

// ── Constants ──────────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 8;
const RETRY_BASE_MS = 1_000;
const NONCE_WINDOW_MS = 300_000; // 5 minutes

// ── State ──────────────────────────────────────────────────────

const endpoints = new Map<string, WebhookEndpoint>();
const deliveryQueue: WebhookDelivery[] = [];
const deadLetterQueue: WebhookDelivery[] = [];
const seenNonces = new Map<string, number>();
let deliveryCounter = 0;

// ── Inbound ────────────────────────────────────────────────────

/** Validate an inbound webhook (signature + replay protection) */
export function validateInbound(
  endpointId: string,
  signature: string,
  nonce: string,
  timestamp: number,
  _body: string,
): InboundValidation {
  const endpoint = endpoints.get(endpointId);
  if (!endpoint) return { valid: false, reason: 'unknown_endpoint' };
  if (!endpoint.enabled) return { valid: false, reason: 'endpoint_disabled' };

  // Replay protection: nonce check
  if (seenNonces.has(nonce)) return { valid: false, reason: 'replay_detected' };

  // Timestamp window check
  const now = Date.now();
  if (Math.abs(now - timestamp) > NONCE_WINDOW_MS) return { valid: false, reason: 'timestamp_outside_window' };

  // Signature verification (simplified — in production would use HMAC-SHA256)
  const expectedSig = `sha256=${endpoint.secretKey.slice(0, 8)}`;
  if (signature !== expectedSig) return { valid: false, reason: 'invalid_signature' };

  // Record nonce
  seenNonces.set(nonce, now);
  cleanExpiredNonces(now);

  return { valid: true, reason: 'verified' };
}

function cleanExpiredNonces(now: number): void {
  for (const [nonce, ts] of seenNonces) {
    if (now - ts > NONCE_WINDOW_MS * 2) seenNonces.delete(nonce);
  }
}

// ── Outbound ───────────────────────────────────────────────────

/** Register a webhook endpoint */
export function registerEndpoint(endpoint: Omit<WebhookEndpoint, 'createdAt' | 'healthScore'>): WebhookEndpoint {
  const full: WebhookEndpoint = { ...endpoint, createdAt: Date.now(), healthScore: 1.0 };
  endpoints.set(endpoint.id, full);
  return full;
}

/** Enqueue an outbound webhook delivery */
export function enqueueDelivery(endpointId: string, eventType: string, payload: unknown): WebhookDelivery {
  const delivery: WebhookDelivery = {
    id: `whd-${++deliveryCounter}`,
    endpointId, eventType, payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    lastAttemptAt: null,
    nextRetryAt: Date.now(),
    responseCode: null,
    createdAt: Date.now(),
  };
  deliveryQueue.push(delivery);
  return delivery;
}

/** Fan-out: deliver one event to all matching endpoints */
export function fanOut(eventType: string, payload: unknown): WebhookDelivery[] {
  const deliveries: WebhookDelivery[] = [];
  for (const ep of endpoints.values()) {
    if (ep.enabled && ep.direction === 'outbound' && ep.events.includes(eventType)) {
      deliveries.push(enqueueDelivery(ep.id, eventType, payload));
    }
  }
  return deliveries;
}

/** Record delivery result */
export function recordDeliveryResult(deliveryId: string, success: boolean, responseCode: number): void {
  const delivery = deliveryQueue.find(d => d.id === deliveryId);
  if (!delivery) return;

  delivery.attempts++;
  delivery.lastAttemptAt = Date.now();
  delivery.responseCode = responseCode;

  if (success) {
    delivery.status = 'delivered';
    const ep = endpoints.get(delivery.endpointId);
    if (ep) ep.healthScore = Math.min(1.0, ep.healthScore + 0.05);
  } else {
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'dead_letter';
      deadLetterQueue.push(delivery);
      const ep = endpoints.get(delivery.endpointId);
      if (ep) ep.healthScore = Math.max(0, ep.healthScore - 0.2);
    } else {
      delivery.status = 'pending';
      delivery.nextRetryAt = Date.now() + RETRY_BASE_MS * Math.pow(2, delivery.attempts);
    }
  }
}

/** Get pending deliveries ready for retry */
export function getPendingDeliveries(): WebhookDelivery[] {
  const now = Date.now();
  return deliveryQueue.filter(d => d.status === 'pending' && (d.nextRetryAt ?? 0) <= now);
}

export function getDeadLetterQueue(): WebhookDelivery[] { return [...deadLetterQueue]; }

export function getWebhookHealth() {
  return {
    totalEndpoints: endpoints.size,
    activeEndpoints: Array.from(endpoints.values()).filter(e => e.enabled).length,
    pendingDeliveries: deliveryQueue.filter(d => d.status === 'pending').length,
    deliveredTotal: deliveryQueue.filter(d => d.status === 'delivered').length,
    deadLetterCount: deadLetterQueue.length,
    avgHealthScore: endpoints.size > 0 ? Array.from(endpoints.values()).reduce((s, e) => s + e.healthScore, 0) / endpoints.size : 1,
  };
}

export function resetWebhookOrchestrator(): void {
  endpoints.clear();
  deliveryQueue.length = 0;
  deadLetterQueue.length = 0;
  seenNonces.clear();
  deliveryCounter = 0;
}
