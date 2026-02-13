/**
 * INTEGRATION Module — Webhook Management
 * v9.1.0 ARCHITECT — Inbound/outbound webhooks, signatures, and retry logic
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface Webhook {
  id: string;
  name: string;
  direction: 'inbound' | 'outbound';
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  headers: Record<string, string>;
  retry_config: RetryConfig;
  created_at: string;
  updated_at: string;
}

export interface RetryConfig {
  max_attempts: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  last_attempt_at?: string;
  next_retry_at?: string;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  created_at: string;
}

export interface InboundEvent {
  id: string;
  webhook_id: string;
  source_ip: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  signature_valid: boolean;
  processed: boolean;
  processed_at?: string;
  result?: Record<string, unknown>;
  created_at: string;
}

export interface WebhookStats {
  webhook_id: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  avg_response_time_ms: number;
  last_delivery_at?: string;
  success_rate: number;
}

// ============ State ============

const webhooks: Map<string, Webhook> = new Map();
const deliveries: Map<string, WebhookDelivery> = new Map();
const inboundEvents: Map<string, InboundEvent> = new Map();

// Default retry config
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  max_attempts: 5,
  initial_delay_ms: 1000,
  max_delay_ms: 60000,
  backoff_multiplier: 2,
};

// ============ Webhook CRUD ============

/**
 * Register a new webhook
 */
export function registerWebhook(config: {
  name: string;
  direction: Webhook['direction'];
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retry_config?: Partial<RetryConfig>;
}): Webhook {
  const webhook: Webhook = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    direction: config.direction,
    url: config.url,
    events: config.events,
    secret: config.secret,
    enabled: true,
    headers: config.headers || {},
    retry_config: { ...DEFAULT_RETRY_CONFIG, ...config.retry_config },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  webhooks.set(webhook.id, webhook);
  
  return webhook;
}

/**
 * Get webhook by ID
 */
export function getWebhook(id: string): Webhook | null {
  return webhooks.get(id) || null;
}

/**
 * List webhooks
 */
export function listWebhooks(filter?: {
  direction?: Webhook['direction'];
  enabled?: boolean;
  event?: string;
}): Webhook[] {
  let result = Array.from(webhooks.values());
  
  if (filter?.direction) {
    result = result.filter(w => w.direction === filter.direction);
  }
  
  if (filter?.enabled !== undefined) {
    result = result.filter(w => w.enabled === filter.enabled);
  }
  
  if (filter?.event) {
    result = result.filter(w => w.events.includes(filter.event!));
  }
  
  return result;
}

/**
 * Update webhook
 */
export function updateWebhook(id: string, updates: Partial<Omit<Webhook, 'id' | 'created_at'>>): Webhook | null {
  const webhook = webhooks.get(id);
  if (!webhook) return null;
  
  const updated: Webhook = {
    ...webhook,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  webhooks.set(id, updated);
  return updated;
}

/**
 * Delete webhook
 */
export function deleteWebhook(id: string): boolean {
  return webhooks.delete(id);
}

/**
 * Toggle webhook enabled state
 */
export function toggleWebhook(id: string): boolean {
  const webhook = webhooks.get(id);
  if (!webhook) return false;
  
  webhook.enabled = !webhook.enabled;
  webhook.updated_at = new Date().toISOString();
  webhooks.set(id, webhook);
  
  return webhook.enabled;
}

// ============ Outbound Delivery ============

/**
 * Trigger webhook delivery
 */
export async function triggerWebhook(
  eventType: string,
  payload: Record<string, unknown>
): Promise<WebhookDelivery[]> {
  const deliveryResults: WebhookDelivery[] = [];
  
  // Find all webhooks subscribed to this event
  const subscribedWebhooks = listWebhooks({ enabled: true, event: eventType });
  
  for (const webhook of subscribedWebhooks) {
    if (webhook.direction !== 'outbound') continue;
    
    const delivery = await createDelivery(webhook, eventType, payload);
    deliveryResults.push(delivery);
    
    // Execute delivery asynchronously
    executeDelivery(delivery.id).catch(console.error);
  }
  
  return deliveryResults;
}

/**
 * Create delivery record
 */
async function createDelivery(
  webhook: Webhook,
  eventType: string,
  payload: Record<string, unknown>
): Promise<WebhookDelivery> {
  const delivery: WebhookDelivery = {
    id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    webhook_id: webhook.id,
    event_type: eventType,
    payload,
    status: 'pending',
    attempts: 0,
    created_at: new Date().toISOString(),
  };
  
  deliveries.set(delivery.id, delivery);
  
  return delivery;
}

/**
 * Execute webhook delivery with retry
 */
async function executeDelivery(deliveryId: string): Promise<void> {
  const delivery = deliveries.get(deliveryId);
  if (!delivery) return;
  
  const webhook = webhooks.get(delivery.webhook_id);
  if (!webhook) {
    delivery.status = 'failed';
    delivery.error_message = 'Webhook not found';
    deliveries.set(deliveryId, delivery);
    return;
  }
  
  while (delivery.attempts < webhook.retry_config.max_attempts) {
    delivery.attempts++;
    delivery.last_attempt_at = new Date().toISOString();
    delivery.status = 'retrying';
    deliveries.set(deliveryId, delivery);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...webhook.headers,
      };
      
      // Add signature if secret is configured
      if (webhook.secret) {
        headers['X-Webhook-Signature'] = generateSignature(delivery.payload, webhook.secret);
      }
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: delivery.event_type,
          payload: delivery.payload,
          timestamp: new Date().toISOString(),
          delivery_id: deliveryId,
        }),
      });
      
      delivery.response_status = response.status;
      
      if (response.ok) {
        delivery.status = 'success';
        delivery.response_body = await response.text();
        deliveries.set(deliveryId, delivery);
        return;
      } else {
        delivery.response_body = await response.text();
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      delivery.error_message = String(error);
      
      if (delivery.attempts >= webhook.retry_config.max_attempts) {
        delivery.status = 'failed';
      } else {
        // Calculate next retry time with exponential backoff
        const delay = Math.min(
          webhook.retry_config.initial_delay_ms * Math.pow(webhook.retry_config.backoff_multiplier, delivery.attempts - 1),
          webhook.retry_config.max_delay_ms
        );
        delivery.next_retry_at = new Date(Date.now() + delay).toISOString();
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      deliveries.set(deliveryId, delivery);
    }
  }
}

/**
 * Get delivery by ID
 */
export function getDelivery(id: string): WebhookDelivery | null {
  return deliveries.get(id) || null;
}

/**
 * List deliveries for a webhook
 */
export function listDeliveries(webhookId: string, limit: number = 50): WebhookDelivery[] {
  return Array.from(deliveries.values())
    .filter(d => d.webhook_id === webhookId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/**
 * Retry a failed delivery
 */
export async function retryDelivery(deliveryId: string): Promise<boolean> {
  const delivery = deliveries.get(deliveryId);
  if (!delivery || delivery.status !== 'failed') return false;
  
  delivery.attempts = 0;
  delivery.status = 'pending';
  delivery.error_message = undefined;
  deliveries.set(deliveryId, delivery);
  
  executeDelivery(deliveryId).catch(console.error);
  return true;
}

// ============ Inbound Processing ============

/**
 * Process inbound webhook
 */
export async function processInboundWebhook(
  webhookId: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
  sourceIp: string
): Promise<{ success: boolean; event_id?: string; error?: string }> {
  const webhook = webhooks.get(webhookId);
  if (!webhook || webhook.direction !== 'inbound') {
    return { success: false, error: 'Webhook not found or not inbound' };
  }
  
  if (!webhook.enabled) {
    return { success: false, error: 'Webhook is disabled' };
  }
  
  // Verify signature if secret is configured
  let signatureValid = true;
  if (webhook.secret) {
    const providedSignature = headers['x-webhook-signature'] || headers['X-Webhook-Signature'];
    const expectedSignature = generateSignature(payload, webhook.secret);
    signatureValid = providedSignature === expectedSignature;
  }
  
  const event: InboundEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    webhook_id: webhookId,
    source_ip: sourceIp,
    headers,
    payload,
    signature_valid: signatureValid,
    processed: false,
    created_at: new Date().toISOString(),
  };
  
  inboundEvents.set(event.id, event);
  
  if (!signatureValid) {
    return { success: false, event_id: event.id, error: 'Invalid signature' };
  }
  
  // Log to database
  try {
    await supabase.from('brain_events').insert([{
      module: 'integration',
      event_type: 'webhook_received',
      data: { webhook_id: webhookId, event_id: event.id } as Record<string, string>,
      outcome: 'logged',
    }]);
  } catch (error) {
    console.error('Failed to log inbound webhook:', error);
  }
  
  return { success: true, event_id: event.id };
}

/**
 * Mark inbound event as processed
 */
export function markEventProcessed(eventId: string, result?: Record<string, unknown>): boolean {
  const event = inboundEvents.get(eventId);
  if (!event) return false;
  
  event.processed = true;
  event.processed_at = new Date().toISOString();
  event.result = result;
  inboundEvents.set(eventId, event);
  
  return true;
}

/**
 * Get inbound event by ID
 */
export function getInboundEvent(id: string): InboundEvent | null {
  return inboundEvents.get(id) || null;
}

/**
 * List inbound events for a webhook
 */
export function listInboundEvents(webhookId: string, limit: number = 50): InboundEvent[] {
  return Array.from(inboundEvents.values())
    .filter(e => e.webhook_id === webhookId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ============ Statistics ============

/**
 * Get webhook statistics
 */
export function getWebhookStats(webhookId: string): WebhookStats {
  const webhookDeliveries = Array.from(deliveries.values())
    .filter(d => d.webhook_id === webhookId);
  
  const successful = webhookDeliveries.filter(d => d.status === 'success');
  const failed = webhookDeliveries.filter(d => d.status === 'failed');
  
  const lastDelivery = webhookDeliveries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  
  return {
    webhook_id: webhookId,
    total_deliveries: webhookDeliveries.length,
    successful_deliveries: successful.length,
    failed_deliveries: failed.length,
    avg_response_time_ms: 0, // Would calculate from actual response times
    last_delivery_at: lastDelivery?.created_at,
    success_rate: webhookDeliveries.length > 0 
      ? (successful.length / webhookDeliveries.length) * 100 
      : 0,
  };
}

// ============ Helpers ============

function generateSignature(payload: Record<string, unknown>, secret: string): string {
  // Simple signature (in production, use HMAC-SHA256)
  const payloadString = JSON.stringify(payload);
  let hash = 0;
  const combined = payloadString + secret;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `sha256=${Math.abs(hash).toString(16)}`;
}
