/**
 * Marketplace Checkout — Create Stripe checkout session for templates/OS
 * Supports both authenticated users and guest checkout (Stripe collects email)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get user if authenticated (optional for purchases)
    let userEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userEmail = data.user?.email;
    }

    const body = await req.json();
    const { 
      product_type, // 'os' | 'template' | 'bundle' | 'stack' | 'agency' | 'studio' | 'capability' | 'stier'
      price_id,
      product_id,
      template_name,
      capability_id, // For capability purchases
      customer_email 
    } = body;

    if (!price_id || !product_type) {
      throw new Error("Missing required fields: price_id, product_type");
    }

    // Use email if available; otherwise Stripe will collect it in checkout
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

    // Determine checkout mode - agency and studio are subscriptions, everything else is one-time
    const isSubscription = product_type === 'agency' || product_type === 'studio';
    const isCapability = product_type === 'capability' || product_type === 'stier';
    const checkoutMode = isSubscription ? 'subscription' : 'payment';

    // Build checkout session config
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: isCapability 
        ? `${origin}/capabilities/success?session_id={CHECKOUT_SESSION_ID}&capability=${capability_id || product_id}`
        : `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}&type=${product_type}`,
      cancel_url: isCapability 
        ? `${origin}/capabilities?canceled=true`
        : `${origin}/marketplace?canceled=true`,
      metadata: {
        product_type,
        product_id: product_id || '',
        template_name: template_name || '',
        capability_id: capability_id || '',
        is_stier: product_type === 'stier' ? 'true' : 'false',
      },
    };

    // customer_creation only available in payment mode
    if (!isSubscription && !customerId) {
      sessionConfig.customer_creation = 'always';
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Checkout session created: ${session.id}, type: ${product_type}, capability: ${capability_id || 'none'}, email: ${email || 'guest'}`);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
