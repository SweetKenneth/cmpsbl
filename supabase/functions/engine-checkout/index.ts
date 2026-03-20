/**
 * Engine Subscription Checkout
 * Creates Stripe checkout sessions for subscription tiers
 * Tiers: creator ($29/mo), architect ($79/mo)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Current price IDs — Creator ($29/mo) and Architect ($79/mo)
// Aligned with ENGINE_SUBSCRIPTION_PRODUCTS in engine-stripe-products.ts
const PRICE_MAP: Record<string, Record<string, string>> = {
  creator: {
    monthly: 'price_1T5VsXQ7FtTiAL4aj5FIIVCu',
    annual: 'price_1T5VsgQ7FtTiAL4ahx89OgVH',
  },
  studio: {
    monthly: 'price_1T6lnoQ7FtTiAL4aOoMJtK9z',
    annual: 'price_1T6lnxQ7FtTiAL4a3N9AvKcG',
  },
  architect: {
    monthly: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3',
    annual: 'price_1T5VshQ7FtTiAL4a2cWVOSVU',
  },
  // Legacy aliases
  builder: {
    monthly: 'price_1T5VsXQ7FtTiAL4aj5FIIVCu',
    annual: 'price_1T5VsgQ7FtTiAL4ahx89OgVH',
  },
  pro: {
    monthly: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3',
    annual: 'price_1T5VshQ7FtTiAL4a2cWVOSVU',
  },
  enterprise: {
    monthly: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3',
    annual: 'price_1T5VshQ7FtTiAL4a2cWVOSVU',
  },
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[ENGINE-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    // Parse request body
    const { tier, interval = 'monthly' } = await req.json();
    
    if (!tier || !PRICE_MAP[tier]) {
      throw new Error(`Invalid tier: ${tier}. Valid tiers: creator, studio, architect`);
    }
    
    const priceId = PRICE_MAP[tier][interval];
    if (!priceId) {
      throw new Error(`Invalid interval: ${interval}. Valid intervals: monthly, annual`);
    }
    logStep('Request parsed', { tier, interval, priceId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' as any });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Found existing customer', { customerId });
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'https://cmpsbl.com';
    
    // Resolve the display tier name for success page
    const displayTier = tier === 'enterprise' || tier === 'pro' ? 'architect' : 
                        tier === 'builder' ? 'creator' : tier;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          tier: displayTier,
          interval,
        },
      },
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}&tier=${displayTier}&success=true`,
      cancel_url: `${origin}/store?tab=plans&canceled=true&tier=${displayTier}`,
      metadata: {
        user_id: user.id,
        tier: displayTier,
        interval,
        product_type: 'substrate_subscription',
      },
    });

    logStep('Checkout session created', { sessionId: session.id, tier: displayTier, interval });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
