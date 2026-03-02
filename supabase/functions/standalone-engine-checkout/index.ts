/**
 * Standalone Engine Checkout — One-time $199 Sealed Runtime purchase
 * Supports guest checkout. Sends price_id + engine_slug from frontend.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json();
    const { price_id, engine_slug } = body;

    if (!price_id || !engine_slug) {
      throw new Error("Missing price_id or engine_slug");
    }

    // Try to get authenticated user (supports guest checkout)
    let customerEmail: string | undefined;
    let customerId: string | undefined;
    let userId: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        customerEmail = data.user.email;
        userId = data.user.id;
        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail || undefined,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/engines/${engine_slug}?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/engines/${engine_slug}`,
      metadata: {
        product: "composable-engine",
        engine_slug,
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId || "",
      },
    });

    console.log(`[STANDALONE-ENGINE-CHECKOUT] Session created for ${engine_slug}, price: ${price_id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[STANDALONE-ENGINE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
