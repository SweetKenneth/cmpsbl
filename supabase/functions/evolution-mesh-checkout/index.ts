import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICES: Record<string, { price_id: string; mode: string }> = {
  pro: { price_id: "price_1T3kFQQ7FtTiAL4ayKv1251c", mode: "subscription" },
  team: { price_id: "price_1T3kFRQ7FtTiAL4aJ11S85t2", mode: "subscription" },
  standalone: { price_id: "price_1T3kMBQ7FtTiAL4a4f2LZKXv", mode: "payment" },
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[EVOLUTION-MESH-CHECKOUT] ${step}${d}`);
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
    logStep("Function started");

    const { tier, framework } = await req.json();
    if (!tier || !PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}. Must be 'pro', 'team', or 'standalone'.`);
    }
    logStep("Tier selected", { tier, framework });

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let customerId: string | undefined;

    if (authHeader && authHeader !== "Bearer null") {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userEmail = data.user?.email ?? undefined;
      logStep("User authenticated", { email: userEmail });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://cmpsbl.com";
    const priceConfig = PRICES[tier];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceConfig.price_id, quantity: 1 }],
      mode: priceConfig.mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: `${origin}/evolution-mesh?checkout=success&tier=${tier}`,
      cancel_url: `${origin}/evolution-mesh?checkout=canceled`,
      metadata: {
        product: "evolution-mesh",
        tier,
        framework: framework || "universal",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, mode: priceConfig.mode });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
