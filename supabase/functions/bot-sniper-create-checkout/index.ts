import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Bot Sniper pricing
const BOT_SNIPER_BASE_PRICE = 'price_1SOMBzQ7FtTiAL4aGf0eVISx'; // $9/mo
const FULL_SUITE_PRICE = 'price_1SOM96Q7FtTiAL4aYbLYDXDV'; // $39/mo

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const { tier = 'base' } = await req.json();
    const priceId = tier === 'full' ? FULL_SUITE_PRICE : BOT_SNIPER_BASE_PRICE;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/bot-sniper?success=true`,
      cancel_url: `${req.headers.get('origin')}/bot-sniper?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: tier
      }
    });

    // Create initial subscription record
    const { error: insertError } = await supabase
      .from('bot_sniper_subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId || null,
        product_id: tier === 'full' ? 'prod_TL2DLZvV10hql4' : 'prod_TL2GWmbIXRKePm',
        status: 'pending',
        requests_limit: 10000,
        requests_used: 0
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('Subscription insert error:', insertError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
