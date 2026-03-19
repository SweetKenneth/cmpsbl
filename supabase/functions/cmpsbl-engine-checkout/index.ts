import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_ID = "price_1T6KAuQ7FtTiAL4aA6ziEyyh"; // $999/year subscription

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    let customerEmail: string | undefined;
    let customerId: string | undefined;
    let userId: string | undefined;

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    if (!data.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    customerEmail = data.user.email;
    userId = data.user.id;
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Parse optional body
    let bodyEmail: string | undefined;
    try {
      const body = await req.json();
      bodyEmail = body?.email;
    } catch { /* no body */ }

    const email = customerEmail || bodyEmail;
    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/cmpsbl-engine?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cmpsbl-engine`,
      metadata: {
        product: "cmpsbl-engine",
        artifact_type: "sealed-runtime",
        license_type: "annual",
        user_id: userId || "",
      },
      subscription_data: {
        metadata: {
          product: "cmpsbl-engine",
          license_type: "annual",
          user_id: userId || "",
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CMPSBL-ENGINE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
