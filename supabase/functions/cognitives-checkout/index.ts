/**
 * Cognitives Checkout — Create Stripe checkout session for paid cognitives
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATALOG: Record<string, { name: string; priceCents: number; lookupKey: string }> = {
  research: { name: 'CMPSBL Research Cognitive', priceCents: 3900, lookupKey: 'cmpsbl_cognitive_research_3900' },
  coding: { name: 'CMPSBL Coding Agent', priceCents: 3900, lookupKey: 'cmpsbl_cognitive_coding_3900' },
  analyst: { name: 'CMPSBL Analyst Cognitive', priceCents: 3900, lookupKey: 'cmpsbl_cognitive_analyst_3900' },
  ops: { name: 'CMPSBL Ops Cognitive', priceCents: 3900, lookupKey: 'cmpsbl_cognitive_ops_3900' },
  writer: { name: 'CMPSBL Cognitive Writer', priceCents: 3900, lookupKey: 'cmpsbl_cognitive_writer_3900' },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const userEmail = authData.user.email;
    const userId = authData.user.id;

    const body = await req.json();
    const { sku, chosenName } = body;

    if (sku === 'hybrid') {
      // Free download — redirect directly
      const origin = req.headers.get("origin") || "https://cmpsbl.com";
      return new Response(
        JSON.stringify({ free: true, redirect: `${origin}/composable-cognitives/download?sku=hybrid&name=${encodeURIComponent(chosenName || 'Hybrid-Agent')}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const item = CATALOG[sku];
    if (!item) throw new Error("Unknown SKU: " + sku);

    // Find or create Stripe price using lookup key
    let priceId: string | undefined;
    const prices = await stripe.prices.list({ lookup_keys: [item.lookupKey], limit: 1 });
    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Create product + price idempotently
      const product = await stripe.products.create({ name: item.name, metadata: { sku } });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: item.priceCents,
        currency: 'usd',
        lookup_key: item.lookupKey,
      });
      priceId = price.id;

      // Save mapping to DB
      const svcSupabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await svcSupabase.from('cognitive_stripe_map').upsert({
        sku,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        price_cents: item.priceCents,
        currency: 'usd',
      });
    }

    // Check for existing customer
    let customerId: string | undefined;
    const email = userEmail || body.customer_email;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${origin}/composable-cognitives/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/composable-cognitives?canceled=1`,
      metadata: {
        sku,
        chosen_name: chosenName || '',
        user_id: userId || '',
      },
    });

    // Record order
    const svcSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    await svcSupabase.from('cognitive_orders').insert({
      user_id: userId || null,
      sku,
      chosen_name: chosenName || null,
      stripe_session_id: session.id,
      payment_status: 'created',
    });

    console.log(`Cognitive checkout created: ${session.id}, sku: ${sku}`);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Cognitives checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
