/**
 * FAILSAFE Engine Checkout
 * Now FREE for all authenticated users (Builder+ = any account).
 * Returns free_access: true for any logged-in user.
 * Falls back to $39 checkout for unauthenticated visitors.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_ID = "price_1TAFfAQ7FtTiAL4acetUfMuY"; // $39 one-time (fallback for guests)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to continue", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    if (!authData.user) {
      return new Response(JSON.stringify({ error: "Please sign in to continue", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const userId = authData.user.id;
    const customerEmail = authData.user.email ?? undefined;

    // Any authenticated user gets free access (Builder+ = any account)
    if (userId) {
      console.log(`[FAILSAFE-CHECKOUT] Free access granted for authenticated user ${userId}`);
      return new Response(JSON.stringify({
        free_access: true,
        message: "FAILSAFE is free for all authenticated users. Download is ready.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Guest fallback: create a $39 checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || undefined,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/engines/failsafe?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/engines/failsafe`,
      metadata: {
        product: "failsafe-engine",
        engine_slug: "failsafe",
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: "",
      },
    });

    console.log(`[FAILSAFE-CHECKOUT] Guest checkout session created`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[FAILSAFE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
