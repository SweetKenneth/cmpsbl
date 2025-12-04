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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { operation } = body;

    console.log(`[DEFENSE-SUBSCRIPTION] Operation: ${operation}`);

    switch (operation) {
      case 'check':
        return await checkSubscription(req, supabaseClient);
      case 'create_checkout':
        return await createCheckout(req, supabaseClient, body);
      case 'customer_portal':
        return await customerPortal(req, supabaseClient);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error("[DEFENSE-SUBSCRIPTION] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function checkSubscription(req: Request, supabaseClient: any) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const authHeader = req.headers.get("Authorization");
  let userEmail: string | null = null;
  
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (!userError && userData.user?.email) {
      userEmail = userData.user.email;
    }
  }

  const body = await req.json();
  const { email } = body;
  const finalEmail = userEmail || email;

  if (!finalEmail) {
    throw new Error("No email provided");
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });
  const customers = await stripe.customers.list({ email: finalEmail, limit: 1 });
  
  if (customers.data.length === 0) {
    return new Response(JSON.stringify({ 
      subscribed: false,
      tier: 'lite'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const customerId = customers.data[0].id;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  
  const hasActiveSub = subscriptions.data.length > 0;
  let tier = 'lite';
  let productId = null;
  let subscriptionEnd = null;
  let billingInterval = null;
  let trialEnd = null;

  if (hasActiveSub) {
    const subscription = subscriptions.data[0];
    subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    productId = subscription.items.data[0].price.product as string;
    tier = subscription.metadata.tier || 'lite';
    billingInterval = subscription.metadata.billing_interval || 'monthly';
    
    if (subscription.trial_end && subscription.trial_end > Math.floor(Date.now() / 1000)) {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
    }
  }

  return new Response(JSON.stringify({
    subscribed: hasActiveSub,
    tier,
    product_id: productId,
    subscription_end: subscriptionEnd,
    billing_interval: billingInterval,
    trial_end: trialEnd,
    in_trial: !!trialEnd
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function createCheckout(req: Request, supabaseClient: any, body: any) {
  const { tier, billing_interval, email } = body;
  
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });

  const priceMap: Record<string, Record<string, string>> = {
    lite: {
      monthly: Deno.env.get("STRIPE_LITE_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("STRIPE_LITE_YEARLY_PRICE_ID") || "",
    },
    standard: {
      monthly: Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID") || "",
    },
    professional: {
      monthly: Deno.env.get("STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("STRIPE_PROFESSIONAL_YEARLY_PRICE_ID") || "",
    },
  };

  const priceId = priceMap[tier]?.[billing_interval];
  if (!priceId) throw new Error("Invalid tier or billing interval");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${Deno.env.get("FRONTEND_URL")}/defense?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Deno.env.get("FRONTEND_URL")}/defense`,
    customer_email: email,
    subscription_data: {
      metadata: { tier, billing_interval },
      trial_period_days: 3,
    },
  });

  return new Response(
    JSON.stringify({ checkout_url: session.url }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function customerPortal(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Not authenticated");

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !userData.user?.email) {
    throw new Error("Failed to get user");
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });
  const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });

  if (customers.data.length === 0) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${Deno.env.get("FRONTEND_URL")}/defense`,
  });

  return new Response(
    JSON.stringify({ portal_url: session.url }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
