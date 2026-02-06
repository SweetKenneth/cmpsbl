/**
 * Licensing Checkout — Create Stripe checkout session for Developer License
 * Supports monthly ($39/mo) and annual ($299/yr) billing
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Developer License pricing configuration
const DEV_LICENSE_PRICES = {
  monthly: {
    price_id: 'price_1Sx9F1Q7FtTiAL4aPvHMDh9r',
    product_id: 'prod_TuzDdndKiASplG',
    amount: 3900, // $39/month
  },
  annual: {
    price_id: 'price_1Sx9F2Q7FtTiAL4a6vQtPPLe',
    product_id: 'prod_TuzDyllhVhku0B',
    amount: 29900, // $299/year
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
    const { 
      license_type, 
      billing_interval = 'annual', // 'monthly' or 'annual'
      customer_email, 
      customer_name, 
      organization 
    } = body;

    // Only developer license is available for checkout
    if (license_type !== 'developer') {
      throw new Error("Only Developer License is available for online checkout. Contact us for Team/Research/Enterprise/Strategic licenses.");
    }

    // Get the appropriate price based on billing interval
    const priceConfig = billing_interval === 'monthly' 
      ? DEV_LICENSE_PRICES.monthly 
      : DEV_LICENSE_PRICES.annual;

    // Email is optional - Stripe will collect it if not provided
    const email = userEmail || customer_email;

    const origin = req.headers.get("origin") || "https://promptfluid.com";

    // Check if customer exists (only if we have an email)
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create checkout session for Developer License subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: [
        {
          price: priceConfig.price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/substrate/licensing?canceled=true`,
      metadata: {
        license_type: 'developer',
        billing_interval,
        product_id: priceConfig.product_id,
        user_id: userId || '',
        organization: organization || '',
        customer_name: customer_name || '',
      },
      subscription_data: {
        metadata: {
          license_type: 'developer',
          billing_interval,
          user_id: userId || '',
        },
      },
    });

    console.log(`Developer License (${billing_interval}) checkout created: ${session.id}, email: ${email}`);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Licensing checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
