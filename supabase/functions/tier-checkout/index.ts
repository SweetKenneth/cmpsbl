/**
 * Tier Checkout — Create Stripe checkout session for Builder/Pro tiers
 * Builder: $49/mo | Pro: $149/mo
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_PRICES: Record<string, { price_id: string; product_id: string; amount: number }> = {
  builder: {
    price_id: 'price_1T0Ro7Q7FtTiAL4as3eV39L9',
    product_id: 'prod_TyObH8wzkQ9myM',
    amount: 4900,
  },
  pro: {
    price_id: 'price_1T0Ro9Q7FtTiAL4aOxvDTMGc',
    product_id: 'prod_TyObyIgiIa28nD',
    amount: 14900,
  },
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

    // Get user if authenticated
    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userEmail = data.user?.email;
      userId = data.user?.id;
    }

    const body = await req.json();
    const { tier } = body;

    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}. Must be 'builder' or 'pro'.`);
    }

    const priceConfig = TIER_PRICES[tier];
    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    // Check if customer exists
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail || undefined,
      line_items: [
        {
          price: priceConfig.price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${origin}/substrate/licensing?canceled=true`,
      metadata: {
        tier,
        product_id: priceConfig.product_id,
        user_id: userId || '',
      },
      subscription_data: {
        metadata: {
          tier,
          user_id: userId || '',
        },
      },
    });

    console.log(`Tier checkout created: ${tier}, session: ${session.id}, email: ${userEmail}`);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Tier checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
