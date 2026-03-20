/**
 * Standalone Engine Checkout — 6 Engines with canonical Stripe Price IDs
 * FAILSAFE (Free), BEACON (Free), AUTOMATON ($79), CORTEX ($129), NEXUS ($159), ARCHITECT ($249)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Canonical engine_slug → Stripe price mapping
const ENGINE_PRICE_IDS: Record<string, string> = {
  automaton: "price_1TCnaPQ7FtTiAL4avt8AojWy",
  cortex:    "price_1TCnaRQ7FtTiAL4aGwku1UJg",
  nexus:     "price_1TCnaSQ7FtTiAL4a8d2rv10j",
  architect: "price_1TCnaUQ7FtTiAL4aBmctc286",
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
    const { engine_slug } = body;

    if (!engine_slug) {
      return new Response(JSON.stringify({ error: "Missing engine_slug" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    // Resolve price from server-side map (ignores any client-provided price_id)
    const priceId = ENGINE_PRICE_IDS[engine_slug];
    if (!priceId) throw new Error(`Unknown or free engine: ${engine_slug}`);

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    if (!data.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const customerEmail = data.user.email;
    const userId = data.user.id;

    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/store?licensed=${engine_slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?canceled=1`,
      metadata: {
        product: "composable-engine",
        engine_slug,
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId,
      },
    });

    console.log(`[ENGINE-CHECKOUT] Session for ${engine_slug}, price: ${priceId}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ENGINE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
