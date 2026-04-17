/**
 * Stripe Webhook — Layer Entitlement Fulfillment
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Receives Stripe events (signed with STRIPE_WEBHOOK_SECRET) and, on a
 * successful `checkout.session.completed` for a marketplace `layer` purchase,
 * inserts a row into public.user_layer_entitlements so the buyer immediately
 * sees the layer in the Ascension V2 enhance step.
 *
 * Why this exists:
 *   - marketplace-checkout writes capability_id (= layer.id) and user_id into
 *     session.metadata. Stripe is the source of truth for "did they pay?".
 *   - This webhook is the *only* path that grants real (non-Governor)
 *     entitlements. The Governor path is handled client-side via a synthetic
 *     entitlement set (see useLayerEntitlements.ts).
 *
 * Idempotency: ON CONFLICT (user_id, layer_id) WHERE revoked_at IS NULL DO NOTHING
 * is enforced by the table's partial unique index from the original migration.
 *
 * Auth: verify_jwt = false. We trust the Stripe signature, not the caller.
 * Service role is required to bypass RLS for the insert.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("[stripe-webhook] Missing required env vars", {
      hasStripeSecret: !!stripeSecret,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
    });
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" });

  // Stripe sends raw body — required for signature verification.
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;
  try {
    // Deno requires the async variant.
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response(
      JSON.stringify({
        error: "Invalid signature",
        detail: err instanceof Error ? err.message : "unknown",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Service-role client — webhook runs without a user JWT, but must insert
  // entitlements scoped to the buyer's user_id (carried in session metadata).
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};
      const productType = meta.product_type;
      const layerId = meta.capability_id;
      const userId = meta.user_id;

      // Only marketplace 'layer' purchases grant inventory entitlements.
      if (productType !== "layer") {
        console.log(
          `[stripe-webhook] Ignored event ${event.id} — product_type=${productType}`,
        );
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!layerId || !userId) {
        console.error(
          "[stripe-webhook] layer purchase missing layerId or userId",
          { layerId, userId, session_id: session.id },
        );
        // Return 200 so Stripe doesn't retry forever for a permanent metadata bug.
        return new Response(
          JSON.stringify({ received: true, error: "missing_metadata" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const paymentOk =
        session.payment_status === "paid" || session.status === "complete";
      if (!paymentOk) {
        console.log(
          `[stripe-webhook] Layer session ${session.id} not paid yet (payment_status=${session.payment_status})`,
        );
        return new Response(JSON.stringify({ received: true, pending: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert entitlement. The table's partial unique index on
      // (user_id, layer_id) WHERE revoked_at IS NULL handles idempotency.
      const { error: insertError } = await admin
        .from("user_layer_entitlements")
        .insert({
          user_id: userId,
          layer_id: layerId,
          source: "stripe",
          metadata: {
            stripe_session_id: session.id,
            stripe_event_id: event.id,
            amount_total: session.amount_total,
            currency: session.currency,
            customer: typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null,
          },
        });

      if (insertError) {
        // Duplicate (already entitled) is success — not a failure to retry.
        const isDuplicate =
          insertError.code === "23505" ||
          /duplicate key|already exists/i.test(insertError.message);
        if (!isDuplicate) {
          console.error(
            "[stripe-webhook] Entitlement insert failed:",
            insertError,
          );
          return new Response(
            JSON.stringify({ error: insertError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        console.log(
          `[stripe-webhook] Entitlement already present for user=${userId} layer=${layerId}`,
        );
      } else {
        console.log(
          `[stripe-webhook] Granted layer entitlement: user=${userId} layer=${layerId} session=${session.id}`,
        );
      }
    } else {
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
