import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SubscriptionSchema = z.object({
  action: z.enum(['get', 'change', 'cancel']),
  planId: z.string().uuid().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const result = SubscriptionSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: result.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, planId } = result.data;

    if (action === 'get') {
      // Get current subscription
      const { data: subscription } = await supabaseClient
        .from('core_subscriptions')
        .select('*, core_plans(*)')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

      return new Response(
        JSON.stringify({ success: true, subscription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'change' && planId) {
      // Change subscription plan
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: "2025-08-27.basil" as any });

      // Get plan details
      const { data: plan } = await supabaseClient
        .from('core_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) {
        throw new Error('Plan not found');
      }

      // Validate plan features structure
      const validatePlanFeatures = (features: any): boolean => {
        if (!features || typeof features !== 'object') return false;
        if (Array.isArray(features)) {
          return features.every(f => typeof f === 'string' || (typeof f === 'object' && f !== null));
        }
        return true;
      };

      if (!validatePlanFeatures(plan.features)) {
        throw new Error('Invalid plan features configuration');
      }

      // Sanitize plan name
      const sanitizeName = (name: string): string => {
        return name.replace(/[<>\"']/g, '').trim();
      };

      // Get or create Stripe customer
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const customers = await stripe.customers.list({
        email: profile?.email,
        limit: 1
      });

      let customerId = customers.data[0]?.id;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email || user.email,
          metadata: { user_id: user.id }
        });
        customerId = customer.id;
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PromptFluid ${sanitizeName(plan.name)}`,
              description: JSON.stringify(plan.features),
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/dashboard`,
        subscription_data: {
          trial_period_days: 3,
        },
      });

      console.log(`Checkout session created for user ${user.id}, plan ${planId}`);

      return new Response(
        JSON.stringify({ success: true, checkout_url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'cancel') {
      // Cancel subscription
      await supabaseClient
        .from('core_subscriptions')
        .update({ status: 'canceled', auto_renew: false })
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

      // Create audit log
      await supabaseClient.from('audit_logs').insert({
        entity: 'subscription',
        entity_id: user.id,
        action: 'cancel',
        performed_by: user.id
      });

      console.log(`Subscription canceled for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in pf-core-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
