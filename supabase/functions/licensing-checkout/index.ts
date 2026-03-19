/**
 * Licensing Checkout — Create Stripe checkout session for subscription tiers
 * Supports: Creator ($29/mo), Studio ($49/mo), Architect ($79/mo)
 * Aligned with licensing-products.ts UNIFIED_TIERS
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Aligned with src/config/licensing-products.ts UNIFIED_TIERS
const TIER_PRICES: Record<string, { price_id: string; product_id: string; amount: number }> = {
  creator: {
    price_id: 'price_1T1wR7Q7FtTiAL4a63bTsEk7',
    product_id: 'prod_TzwJfkmkooYhwU',
    amount: 2900, // $29/mo
  },
  studio: {
    price_id: 'price_1T6lnoQ7FtTiAL4aOoMJtK9z',
    product_id: 'prod_U4vfFrx4XIT6Ah',
    amount: 4900, // $49/mo
  },
  architect: {
    price_id: 'price_1T1wR9Q7FtTiAL4aRHhQwX0m',
    product_id: 'prod_TzwJm6Ji4E3Vca',
    amount: 7900, // $79/mo
  },
  // Legacy aliases
  developer: {
    price_id: 'price_1T1wR7Q7FtTiAL4a63bTsEk7',
    product_id: 'prod_TzwJfkmkooYhwU',
    amount: 2900,
  },
  builder: {
    price_id: 'price_1T1wR7Q7FtTiAL4a63bTsEk7',
    product_id: 'prod_TzwJfkmkooYhwU',
    amount: 2900,
  },
  pro: {
    price_id: 'price_1T1wR9Q7FtTiAL4aRHhQwX0m',
    product_id: 'prod_TzwJm6Ji4E3Vca',
    amount: 7900,
  },
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[LICENSING-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
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

    // Require authentication
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
    const {
      tier,
      license_type, // Legacy field — maps to tier
      billing_interval = 'monthly',
      customer_email,
      customer_name,
      organization,
    } = body;

    // Resolve tier from either field (backward compat)
    const resolvedTier = tier || license_type || 'creator';
    
    if (!TIER_PRICES[resolvedTier]) {
      return new Response(
        JSON.stringify({ error: `Invalid tier: ${resolvedTier}. Valid tiers: creator, studio, architect` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const priceConfig = TIER_PRICES[resolvedTier];
    logStep('Tier resolved', { resolvedTier, priceId: priceConfig.price_id, amount: priceConfig.amount });

    // Email is optional — Stripe will collect it if not provided
    const email = userEmail || customer_email;
    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    // Check if customer exists
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep('Found existing customer', { customerId });
      }
    }

    // Normalize tier name for display
    const displayTier = resolvedTier === 'developer' || resolvedTier === 'builder' ? 'creator'
      : resolvedTier === 'pro' ? 'architect'
      : resolvedTier;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: [{ price: priceConfig.price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}&tier=${displayTier}&success=true`,
      cancel_url: `${origin}/store?tab=plans&canceled=true`,
      metadata: {
        tier: displayTier,
        billing_interval,
        product_id: priceConfig.product_id,
        user_id: userId || '',
        organization: organization || '',
        customer_name: customer_name || '',
      },
      subscription_data: {
        metadata: {
          tier: displayTier,
          billing_interval,
          user_id: userId || '',
        },
      },
    });

    logStep('Checkout session created', { sessionId: session.id, tier: displayTier });

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
