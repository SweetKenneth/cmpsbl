/**
 * Tier Checkout — Studio $29/mo | Creator $49/mo | Architect $79/mo
 * Aligned with engine-stripe-products.ts and licensing-products.ts
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Aligned with ENGINE_SUBSCRIPTION_PRODUCTS in engine-stripe-products.ts
const TIER_PRICES: Record<string, Record<string, { price_id: string; product_id: string; amount: number }>> = {
  creator: {
    monthly: { price_id: 'price_1T5VsXQ7FtTiAL4aj5FIIVCu', product_id: 'prod_U3d8z2sorSG4sI', amount: 2900 },
    annual:  { price_id: 'price_1T5VsgQ7FtTiAL4ahx89OgVH', product_id: 'prod_U3d84gNyBRQgeu', amount: 27600 },
  },
  studio: {
    monthly: { price_id: 'price_1T6lnoQ7FtTiAL4aOoMJtK9z', product_id: 'prod_U4vfFrx4XIT6Ah', amount: 4900 },
    annual:  { price_id: 'price_1T6lnxQ7FtTiAL4a3N9AvKcG', product_id: 'prod_U4vfNOl4dHkmld', amount: 47040 },
  },
  architect: {
    monthly: { price_id: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3', product_id: 'prod_U3d8XbUwCGrcfO', amount: 7900 },
    annual:  { price_id: 'price_1T5VshQ7FtTiAL4a2cWVOSVU', product_id: 'prod_U3d8M0yNFGpGTw', amount: 75600 },
  },
  // Legacy aliases
  builder: {
    monthly: { price_id: 'price_1T5VsXQ7FtTiAL4aj5FIIVCu', product_id: 'prod_U3d8z2sorSG4sI', amount: 2900 },
    annual:  { price_id: 'price_1T5VsgQ7FtTiAL4ahx89OgVH', product_id: 'prod_U3d84gNyBRQgeu', amount: 27600 },
  },
  pro: {
    monthly: { price_id: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3', product_id: 'prod_U3d8XbUwCGrcfO', amount: 7900 },
    annual:  { price_id: 'price_1T5VshQ7FtTiAL4a2cWVOSVU', product_id: 'prod_U3d8M0yNFGpGTw', amount: 75600 },
  },
  enterprise: {
    monthly: { price_id: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3', product_id: 'prod_U3d8XbUwCGrcfO', amount: 7900 },
    annual:  { price_id: 'price_1T5VshQ7FtTiAL4a2cWVOSVU', product_id: 'prod_U3d8M0yNFGpGTw', amount: 75600 },
  },
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[TIER-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to subscribe", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const authToken = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabase.auth.getUser(authToken);
    if (!authData.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to subscribe", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const userEmail = authData.user.email;
    const userId = authData.user.id;

    const body = await req.json();
    const { tier, interval = 'monthly' } = body;

    if (!tier || !TIER_PRICES[tier]) {
      return new Response(
        JSON.stringify({ error: `Invalid tier: ${tier}. Valid: creator, studio, architect` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const priceConfig = TIER_PRICES[tier][interval] || TIER_PRICES[tier].monthly;
    logStep('Tier resolved', { tier, interval, priceId: priceConfig.price_id });

    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const displayTier = tier === 'builder' ? 'creator' : tier === 'pro' || tier === 'enterprise' ? 'architect' : tier;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail || undefined,
      line_items: [{ price: priceConfig.price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}&tier=${displayTier}&success=true`,
      cancel_url: `${origin}/store?tab=plans&canceled=true&tier=${displayTier}`,
      metadata: {
        user_id: userId || '',
        tier: displayTier,
        interval,
        product_type: 'tier_subscription',
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId || '',
          tier: displayTier,
          interval,
        },
      },
    });

    logStep('Checkout created', { sessionId: session.id, tier: displayTier });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep('ERROR', { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
