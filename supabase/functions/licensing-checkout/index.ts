/**
 * Licensing Checkout — Create Stripe checkout session for Developer License
 * Only Developer License is available for automated checkout
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Developer License configuration
const DEV_LICENSE = {
  price_id: 'price_1Su1eoQ7FtTiAL4aqoXJj48x',
  product_id: 'prod_TrlBfjavZnDpP0',
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
    const { license_type, customer_email, customer_name, organization } = body;

    // Only developer license is available for checkout
    if (license_type !== 'developer') {
      throw new Error("Only Developer License is available for online checkout. Contact us for Research/Enterprise/Strategic licenses.");
    }

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
    // Stripe will collect email if not provided
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: [
        {
          price: DEV_LICENSE.price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/substrate/licensing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/substrate/licensing?canceled=true`,
      metadata: {
        license_type: 'developer',
        product_id: DEV_LICENSE.product_id,
        user_id: userId || '',
        organization: organization || '',
        customer_name: customer_name || '',
      },
      subscription_data: {
        metadata: {
          license_type: 'developer',
          user_id: userId || '',
        },
      },
    });

    console.log(`Developer License checkout created: ${session.id}, email: ${email}`);

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
