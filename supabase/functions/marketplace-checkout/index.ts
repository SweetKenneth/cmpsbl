/**
 * Marketplace Checkout — Create Stripe checkout session for templates/OS
 * Supports both authenticated users and guest checkout (Stripe collects email)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Require authentication for checkout
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const userEmail = authData.user.email;

    const body = await req.json();
    const {
      product_type, // 'os' | 'template' | 'bundle' | 'stack' | 'agency' | 'studio' | 'capability' | 'stier' | 'recursive'
      price_id,
      product_id,
      template_name,
      capability_id, // For capability purchases
      customer_email,
      // NEW: authoritative display price sent by the UI (normalized tiers only)
      unit_amount_usd,
      // NEW: optional name to show in checkout when we use price_data
      item_name,
    } = body;

    if (!product_type) {
      throw new Error('Missing required field: product_type');
    }

    // Determine checkout mode - agency and studio are subscriptions, everything else is one-time
    const isSubscription = product_type === 'agency' || product_type === 'studio';
    const isCapability = ['capability', 'stier', 'recursive', 'premium', 'ultra', 'expansion', 'core'].includes(product_type);
    const isRecursive = product_type === 'recursive';
    const checkoutMode = isSubscription ? 'subscription' : 'payment';

    // In payment mode, we can use a normalized tiered amount (this is what the cards advertise)
    // These are the public price tiers — any amount gets normalized to the nearest tier
    const TIER_AMOUNTS = [19, 49, 99, 149, 199, 299];

    const parseUnitAmountUsd = (v: unknown): number | null => {
      if (typeof v !== 'number' || !Number.isFinite(v)) return null;
      const int = Math.round(v);
      return int;
    };

    // Normalize any USD amount to the nearest public tier (always <= $299)
    const normalizePriceUsd = (priceUsd: number): number => {
      if (priceUsd <= 19) return 19;
      if (priceUsd <= 49) return 49;
      if (priceUsd <= 99) return 99;
      if (priceUsd <= 149) return 149;
      if (priceUsd <= 199) return 199;
      return 299;
    };

    const requestedUsd = parseUnitAmountUsd(unit_amount_usd);

    // If we are not in subscription mode, allow checkout to proceed with either:
    // 1) a unit_amount_usd value (will be normalized to nearest tier), or
    // 2) a Stripe price_id (legacy callers — price will be fetched and normalized)
    if (!isSubscription) {
      if (requestedUsd === null && !price_id) {
        throw new Error('Missing required fields: price_id (or unit_amount_usd for payment mode)');
      }
    } else {
      // Subscription mode always uses real Stripe price IDs
      if (!price_id) {
        throw new Error('Missing required field: price_id (subscription mode)');
      }
    }

    // Normalize the requested amount if provided (ensures we charge the correct tier)
    const normalizedUsd = requestedUsd !== null ? normalizePriceUsd(requestedUsd) : null;

    // Use email if available; otherwise Stripe will collect it in checkout
    const email = userEmail || customer_email;

    const origin = req.headers.get('origin') || 'https://promptfluid.com';

    // Check if customer exists (only if we have an email)
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Build line item
    let lineItem: any;

    if (isSubscription) {
      // Subscriptions must reference a Stripe price
      lineItem = { price: price_id, quantity: 1 };
    } else if (normalizedUsd !== null) {
      // Preferred: charge the normalized tier amount (ensures consistent pricing)
      const unitAmount = normalizedUsd * 100;
      // Real Stripe product IDs are formatted like 'prod_ABC123' (alphanumeric after prod_)
      // Placeholder IDs like 'prod_premium_cot' contain underscores/letters after prod_
      const isRealStripeProduct = typeof product_id === 'string' && /^prod_[A-Za-z0-9]{10,}$/.test(product_id);

      lineItem = {
        price_data: {
          currency: 'usd',
          unit_amount: unitAmount,
          ...(isRealStripeProduct
            ? { product: product_id }
            : {
                product_data: {
                  name: item_name || template_name || capability_id || product_id || 'PromptFluid Item',
                },
              }),
        },
        quantity: 1,
      };
    } else {
      // Legacy fallback: normalize the *actual* Stripe price down to the public tier ceiling
      const price = await stripe.prices.retrieve(price_id);
      const rawUsd = Math.round((price.unit_amount ?? 0) / 100);
      const normalizedUsd = normalizePriceUsd(rawUsd);

      if (normalizedUsd * 100 === price.unit_amount) {
        lineItem = { price: price_id, quantity: 1 };
      } else {
        const product = typeof price.product === 'string' ? price.product : undefined;
        lineItem = {
          price_data: {
            currency: price.currency || 'usd',
            unit_amount: normalizedUsd * 100,
            ...(product
              ? { product }
              : {
                  product_data: {
                    name: item_name || template_name || capability_id || product_id || 'PromptFluid Item',
                  },
                }),
          },
          quantity: 1,
        };
      }
    }

    // Build checkout session config
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [lineItem],
      mode: checkoutMode,
      success_url: isCapability
        ? `${origin}/capabilities/success?session_id={CHECKOUT_SESSION_ID}&capability=${capability_id || product_id}&tier=${isRecursive ? 'recursive' : product_type}`
        : `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}&type=${product_type}`,
      cancel_url: isCapability ? `${origin}/capabilities?canceled=true` : `${origin}/marketplace?canceled=true`,
      metadata: {
        product_type,
        product_id: product_id || '',
        template_name: template_name || '',
        capability_id: capability_id || '',
        is_stier: product_type === 'stier' ? 'true' : 'false',
        is_recursive: product_type === 'recursive' ? 'true' : 'false',
        tier: isRecursive ? 'apex' : product_type === 'stier' ? 'crown' : product_type,
        // Helpful audit fields
        requested_unit_amount_usd: requestedUsd !== null ? String(requestedUsd) : '',
        normalized_unit_amount_usd: normalizedUsd !== null ? String(normalizedUsd) : '',
        legacy_price_id: price_id || '',
      },
    };

    // customer_creation only available in payment mode
    if (!isSubscription && !customerId) {
      sessionConfig.customer_creation = 'always';
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Checkout session created: ${session.id}, type: ${product_type}, capability: ${capability_id || 'none'}, email: ${email || 'guest'}`);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
