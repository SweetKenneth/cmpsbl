/**
 * Check Engine Subscription Status
 * Returns the user's current engine subscription tier
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map product IDs to tiers
const PRODUCT_TO_TIER: Record<string, string> = {
  // Creator ($29/mo)
  'prod_U3d8z2sorSG4sI': 'creator',
  'prod_U3d84gNyBRQgeu': 'creator',
  // Studio ($49/mo)
  'prod_U4vfFrx4XIT6Ah': 'studio',
  'prod_U4vfNOl4dHkmld': 'studio',
  // Architect ($79/mo)
  'prod_U3d8XbUwCGrcfO': 'architect',
  'prod_U3d8M0yNFGpGTw': 'architect',
  // Legacy product IDs — map to new tiers
  'prod_TzwJfkmkooYhwU': 'creator',
  'prod_TzwJtYd5I4rH7j': 'architect',
  'prod_TzwJm6Ji4E3Vca': 'architect',
  'prod_TwE1Eqx3bpZsSy': 'creator',
  'prod_TwE1VkEdBVaiuR': 'creator',
  'prod_TwE1R8rSXH8Hku': 'architect',
  'prod_TwE1RRfo82Y15Z': 'architect',
  'prod_TwE1Ft7HTEDerh': 'architect',
  'prod_TwE1AiW91BGmM3': 'architect',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CHECK-ENGINE-SUB] ${step}`, details ? JSON.stringify(details) : '');
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
    if (!authHeader) {
      // Return default starter tier for unauthenticated users
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'starter',
          subscription_end: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logStep('No valid user, returning starter tier');
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'starter',
          subscription_end: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const user = userData.user;
    logStep('User authenticated', { userId: user.id, email: user.email });

    // ═══ GOD MODE: Governor override for system owner ═══
    const GOD_MODE_EMAILS = ['kennethsweet214@gmail.com'];
    if (GOD_MODE_EMAILS.includes(user.email!)) {
      logStep('GOD MODE activated', { email: user.email });
      return new Response(
        JSON.stringify({
          subscribed: true,
          tier: 'governor',
          subscription_end: null,
          god_mode: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' as any });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep('No Stripe customer, returning starter tier');
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'starter',
          subscription_end: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep('Found customer', { customerId });

    // Check for active subscriptions with engine products
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    // Find highest tier subscription
    let highestTier = 'starter';
    let subscriptionEnd: string | null = null;

    const tierPriority: Record<string, number> = {
      starter: 0,
      free: 0,
      builder: 1,
      creator: 1,
      studio: 2,
      pro: 3,
      architect: 3,
      enterprise: 4,
    };

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const productId = typeof item.price.product === 'string' 
          ? item.price.product 
          : item.price.product.id;
        
        const tier = PRODUCT_TO_TIER[productId];
        
        if (tier && tierPriority[tier] > tierPriority[highestTier]) {
          highestTier = tier;
          subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
          logStep('Found subscription', { tier, productId, subscriptionEnd });
        }
      }
    }

    logStep('Returning tier', { tier: highestTier, subscribed: highestTier !== 'starter' });

    return new Response(
      JSON.stringify({ 
        subscribed: highestTier !== 'starter',
        tier: highestTier,
        subscription_end: subscriptionEnd 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
