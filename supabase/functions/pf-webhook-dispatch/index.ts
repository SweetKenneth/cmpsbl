/**
 * pf-webhook-dispatch v1.0.0
 * Dispatches signed webhook payloads to subscriber URLs
 * 
 * Called internally when substrate events fire.
 * Supports: memory.chain.discovered, dream.cycle.completed, defense.alert,
 *           brain.learning.complete, nexus.provider.degraded
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_EVENTS = [
  'memory.chain.discovered',
  'dream.cycle.completed',
  'defense.alert',
  'brain.learning.complete',
  'nexus.provider.degraded',
  'system.health.changed',
  'pipeline.crystallized',
  'audit.completed',
] as const;

type EventType = typeof VALID_EVENTS[number];

interface WebhookPayload {
  event: EventType;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

/**
 * HMAC-SHA256 signature for payload verification
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { event, data, user_id } = await req.json();

    if (!event || !VALID_EVENTS.includes(event)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid event type. Valid: ${VALID_EVENTS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build filter: subscriptions matching this event type
    let query = supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('is_active', true)
      .contains('event_types', [event]);

    // If user_id provided, scope to that user
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError);
      throw new Error('Failed to fetch webhook subscriptions');
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, dispatched: 0, message: 'No active subscriptions for this event' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const timestamp = new Date().toISOString();
    const results: Array<{ subscription_id: string; success: boolean; status?: number; latencyMs: number }> = [];

    // Dispatch to all matching subscriptions
    for (const sub of subscriptions) {
      const startMs = Date.now();
      const payload: WebhookPayload = {
        event,
        data: data || {},
        timestamp,
        signature: '',
      };

      // Sign the payload
      const payloadString = JSON.stringify({ event: payload.event, data: payload.data, timestamp: payload.timestamp });
      payload.signature = await signPayload(payloadString, sub.secret);

      let deliverySuccess = false;
      let responseStatus: number | undefined;
      let responseBody = '';

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CMPSBL-Event': event,
            'X-CMPSBL-Signature': payload.signature,
            'X-CMPSBL-Timestamp': timestamp,
            'User-Agent': 'CMPSBL-Webhook/1.0',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        responseStatus = response.status;
        responseBody = await response.text().catch(() => '');
        deliverySuccess = response.ok;
      } catch (fetchErr: any) {
        responseBody = fetchErr.message || 'Connection failed';
      }

      const latencyMs = Date.now() - startMs;

      // Log delivery
      await supabase.from('webhook_delivery_log').insert({
        subscription_id: sub.id,
        event_type: event,
        payload: payload as any,
        response_status: responseStatus || 0,
        response_body: responseBody.substring(0, 1000),
        success: deliverySuccess,
        latency_ms: latencyMs,
      }).catch(() => {});

      // Update subscription failure count
      if (!deliverySuccess) {
        const newFailCount = (sub.failure_count || 0) + 1;
        await supabase.from('webhook_subscriptions').update({
          failure_count: newFailCount,
          // Auto-disable after 10 consecutive failures
          is_active: newFailCount >= 10 ? false : true,
          updated_at: new Date().toISOString(),
        }).eq('id', sub.id).catch(() => {});
      } else {
        // Reset failure count on success
        if (sub.failure_count > 0) {
          await supabase.from('webhook_subscriptions').update({
            failure_count: 0,
            last_triggered_at: timestamp,
            updated_at: new Date().toISOString(),
          }).eq('id', sub.id).catch(() => {});
        } else {
          await supabase.from('webhook_subscriptions').update({
            last_triggered_at: timestamp,
          }).eq('id', sub.id).catch(() => {});
        }
      }

      results.push({
        subscription_id: sub.id,
        success: deliverySuccess,
        status: responseStatus,
        latencyMs,
      });
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📡 Webhook dispatch: ${event} → ${successCount}/${results.length} delivered`);

    return new Response(
      JSON.stringify({
        success: true,
        event,
        dispatched: results.length,
        delivered: successCount,
        failed: results.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Webhook dispatch error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
