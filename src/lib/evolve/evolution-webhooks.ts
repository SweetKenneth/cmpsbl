/**
 * Evolution Webhook Notification Engine
 * Delivers real-time notifications to subscribers on evolution events.
 * Supports configurable endpoints, retry logic, and event filtering.
 */

export type WebhookEventType =
  | 'evolution.exported'
  | 'evolution.applied'
  | 'evolution.failed'
  | 'evolution.restored'
  | 'scan.completed'
  | 'circuit.tripped'
  | 'circuit.recovered'
  | 'entropy.warning'
  | 'entropy.blocked'
  | 'regression.detected'
  | 'snapshot.created'
  | 'snapshot.deleted';

export interface WebhookConfig {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  retryCount: number;
  timeoutMs: number;
  createdAt: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  lastAttemptAt: number | null;
  responseStatus: number | null;
  error: string | null;
  createdAt: number;
}

export interface WebhookStats {
  tenantId: string;
  totalDeliveries: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  avgResponseTime: number;
}

const webhooks = new Map<string, WebhookConfig>();
const deliveryLog: WebhookDelivery[] = [];

export function registerWebhook(
  tenantId: string,
  url: string,
  events: WebhookEventType[],
  secret: string,
  opts?: { retryCount?: number; timeoutMs?: number },
): WebhookConfig {
  const config: WebhookConfig = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId,
    url,
    secret,
    events,
    active: true,
    retryCount: opts?.retryCount ?? 3,
    timeoutMs: opts?.timeoutMs ?? 10_000,
    createdAt: Date.now(),
  };
  webhooks.set(config.id, config);
  return config;
}

export function updateWebhook(id: string, updates: Partial<Pick<WebhookConfig, 'url' | 'events' | 'active' | 'retryCount'>>): boolean {
  const wh = webhooks.get(id);
  if (!wh) return false;
  Object.assign(wh, updates);
  return true;
}

export function removeWebhook(id: string): boolean {
  return webhooks.delete(id);
}

async function signPayload(payload: string, secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'unsigned';
}

export async function dispatchEvent(
  tenantId: string,
  event: WebhookEventType,
  data: Record<string, unknown>,
): Promise<WebhookDelivery[]> {
  const matching = Array.from(webhooks.values()).filter(
    wh => wh.tenantId === tenantId && wh.active && wh.events.includes(event),
  );

  const deliveries: WebhookDelivery[] = [];

  for (const wh of matching) {
    const payload = {
      event,
      tenant_id: tenantId,
      timestamp: new Date().toISOString(),
      data,
    };

    const delivery: WebhookDelivery = {
      id: `del-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      webhookId: wh.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      responseStatus: null,
      error: null,
      createdAt: Date.now(),
    };

    const body = JSON.stringify(payload);
    const signature = await signPayload(body, wh.secret);

    for (let attempt = 0; attempt <= wh.retryCount; attempt++) {
      delivery.attempts = attempt + 1;
      delivery.lastAttemptAt = Date.now();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), wh.timeoutMs);

        const response = await fetch(wh.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            'X-Webhook-Tenant': tenantId,
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        delivery.responseStatus = response.status;

        if (response.ok) {
          delivery.status = 'delivered';
          break;
        } else {
          delivery.error = `HTTP ${response.status}`;
          delivery.status = attempt < wh.retryCount ? 'retrying' : 'failed';
        }
      } catch (err: any) {
        delivery.error = err?.message ?? 'Unknown error';
        delivery.status = attempt < wh.retryCount ? 'retrying' : 'failed';
      }

      // Exponential backoff between retries
      if (attempt < wh.retryCount) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }

    deliveryLog.push(delivery);
    deliveries.push(delivery);
  }

  return deliveries;
}

export function getWebhooks(tenantId: string): WebhookConfig[] {
  return Array.from(webhooks.values()).filter(wh => wh.tenantId === tenantId);
}

export function getDeliveryLog(tenantId: string, limit = 50): WebhookDelivery[] {
  const tenantWebhookIds = new Set(
    Array.from(webhooks.values())
      .filter(wh => wh.tenantId === tenantId)
      .map(wh => wh.id),
  );
  return deliveryLog
    .filter(d => tenantWebhookIds.has(d.webhookId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getWebhookStats(tenantId: string): WebhookStats {
  const tenantWebhookIds = new Set(
    Array.from(webhooks.values())
      .filter(wh => wh.tenantId === tenantId)
      .map(wh => wh.id),
  );
  const relevant = deliveryLog.filter(d => tenantWebhookIds.has(d.webhookId));
  return {
    tenantId,
    totalDeliveries: relevant.length,
    successCount: relevant.filter(d => d.status === 'delivered').length,
    failureCount: relevant.filter(d => d.status === 'failed').length,
    pendingCount: relevant.filter(d => d.status === 'pending' || d.status === 'retrying').length,
    avgResponseTime: 0,
  };
}
