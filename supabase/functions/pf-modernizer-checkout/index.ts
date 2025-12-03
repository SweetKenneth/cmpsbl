/**
 * PromptFluid Modernizer Checkout
 * Creates Stripe checkout session for upgrades
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLANS = {
  starter: { price: 19, jobs: 10, priceId: 'price_starter' },
  pro: { price: 49, jobs: 50, priceId: 'price_pro' },
  studio: { price: 99, jobs: 999, priceId: 'price_studio' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { plan } = await req.json();
    
    if (!PLANS[plan as keyof typeof PLANS]) {
      throw new Error('Invalid plan');
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    // Get or create customer
    const { data: limits } = await supabase
      .from('modernizer_user_limits')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = limits?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;

      await supabase
        .from('modernizer_user_limits')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `PromptFluid Modernizer ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
            description: `${planConfig.jobs} modernizations per month`
          },
          recurring: { interval: 'month' },
          unit_amount: planConfig.price * 100
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/modernizer?success=true`,
      cancel_url: `${req.headers.get('origin')}/modernizer?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan
      }
    });

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Checkout failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
