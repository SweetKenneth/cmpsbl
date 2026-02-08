/**
 * Engine Subscription Checkout
 * Creates Stripe checkout sessions for OEM subscription tiers
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Price IDs mapped by tier and interval
const PRICE_MAP: Record<string, Record<string, string>> = {
  builder: {
    monthly: 'price_1SyLZ9Q7FtTiAL4aDqPdcswv',
    annual: 'price_1SyLZAQ7FtTiAL4aaG77BgYO',
  },
  pro: {
    monthly: 'price_1SyLZCQ7FtTiAL4a0k9cnn8H',
    annual: 'price_1SyLZEQ7FtTiAL4aC0CmBb1w',
  },
  enterprise: {
    monthly: 'price_1SyLZFQ7FtTiAL4aN0vumAsj',
    annual: 'price_1SyLZGQ7FtTiAL4aT45BNfAA',
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
      throw new Error(`Invalid tier: ${tier}. Valid tiers: builder, pro, enterprise`);
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
    const origin = req.headers.get('origin') || 'https://promptfluid-substrate.lovable.app';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/engines?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/engines?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
        interval,
        product_type: 'engine_subscription',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
          interval,
        },
      },
    });

    logStep('Checkout session created', { sessionId: session.id, tier, interval });

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
