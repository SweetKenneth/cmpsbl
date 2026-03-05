import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Try to get user from auth header (web app flow)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userEmail = data.user?.email || null;
    }

    // Parse request body
    const body = await req.json();
    const { priceId, tier, billingInterval, email, success_url, cancel_url, metadata } = body;

    // Use email from body if no authenticated user (WordPress plugin flow)
    const finalEmail = userEmail || email;

    if (!priceId || !tier || !finalEmail) {
      throw new Error("Missing required fields: priceId, tier, and email");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" as any });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: finalEmail, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session with 3-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : finalEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          tier: tier,
          billing_interval: billingInterval || 'monthly',
          ...(metadata || {})
        }
      },
      success_url: success_url || `https://cmpsbl.com/products/defense/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `https://cmpsbl.com/products/defense/upgrade`,
      metadata: {
        tier: tier,
        ...(metadata || {})
      }
    });

    console.log(`Checkout session created for ${finalEmail}, tier: ${tier}, trial: 3 days`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
