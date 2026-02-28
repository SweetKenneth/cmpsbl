/**
 * Scan Webhook Notifications
 * Item #18: Fire webhooks on scan completion
 */

import { supabase } from '@/integrations/supabase/client';

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
}

/**
 * Get all active webhooks for the current user.
 */
export async function getUserWebhooks(): Promise<WebhookConfig[]> {
  const { data, error } = await supabase
    .from('scan_webhooks')
    .select('id, url, events, is_active')
    .eq('is_active', true);

  if (error) return [];
  return (data ?? []) as WebhookConfig[];
}

/**
 * Register a new webhook URL.
 */
export async function registerWebhook(params: {
  url: string;
  events?: string[];
}): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('scan_webhooks')
    .insert({
      user_id: userData.user.id,
      url: params.url,
      events: params.events ?? ['scan.completed'],
    })
    .select('id')
    .single();

  if (error) return null;
  return data?.id ?? null;
}

/**
 * Fire webhooks for a scan event (client-side — for edge function delegation).
 * In production, this should be called from an edge function with proper HMAC signing.
 */
export async function fireWebhooks(event: string, payload: unknown): Promise<void> {
  const webhooks = await getUserWebhooks();
  const matching = webhooks.filter(w => w.events.includes(event));

  // Queue webhook deliveries (in production, delegate to edge function)
  for (const webhook of matching) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString(),
          webhook_id: webhook.id,
        }),
      });
    } catch (err) {
      console.error(`[webhook] Failed to fire ${event} to ${webhook.url}:`, err);
      // Update failure count
      await supabase
        .from('scan_webhooks')
        .update({ failure_count: (webhook as any).failure_count + 1 })
        .eq('id', webhook.id);
    }
  }
}
