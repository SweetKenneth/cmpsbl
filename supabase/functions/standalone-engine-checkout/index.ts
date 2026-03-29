/**
 * Standalone Engine Checkout — Legacy pricing ($9–$79)
 * Covers CORE ($9), ELITE ($19), APEX ($39), S-TIER ($49), META ($79).
 * Free engines (FAILSAFE, BEACON, BASTION, CIPHER) are handled client-side.
 * ARCHITECT uses annual subscription ($39/yr).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tier-level Stripe price IDs
const PRICE_CORE   = "price_1TG98nQ7FtTiAL4awr1SS53E";  // $9
const PRICE_ELITE  = "price_1TG98oQ7FtTiAL4aiODC9f4n";  // $19
const PRICE_APEX   = "price_1TG98pQ7FtTiAL4axLVRIMbu";  // $39
const PRICE_STIER  = "price_1TG98qQ7FtTiAL4apDP7ACFa";  // $49
const PRICE_META   = "price_1TG98rQ7FtTiAL4a05GHc6yq";  // $79
const PRICE_ARCH   = "price_1TG98wQ7FtTiAL4auuOYLPPB";  // $39/yr

// Canonical engine_slug → Stripe price mapping
const ENGINE_PRICE_IDS: Record<string, { price_id: string; mode: "payment" | "subscription" }> = {
  // CORE ($9)
  automaton:    { price_id: PRICE_CORE, mode: "payment" },
  catalyst:     { price_id: PRICE_CORE, mode: "payment" },
  meridian:     { price_id: PRICE_CORE, mode: "payment" },
  aegis:        { price_id: PRICE_CORE, mode: "payment" },

  // ELITE ($19)
  cortex:       { price_id: PRICE_ELITE, mode: "payment" },
  forge:        { price_id: PRICE_ELITE, mode: "payment" },
  oracle:       { price_id: PRICE_ELITE, mode: "payment" },
  vanguard:     { price_id: PRICE_ELITE, mode: "payment" },
  conductor:    { price_id: PRICE_ELITE, mode: "payment" },
  arbiter:      { price_id: PRICE_ELITE, mode: "payment" },
  mirage:       { price_id: PRICE_ELITE, mode: "payment" },

  // APEX ($39)
  sentinel:     { price_id: PRICE_APEX, mode: "payment" },
  phantom:      { price_id: PRICE_APEX, mode: "payment" },
  nexus:        { price_id: PRICE_APEX, mode: "payment" },
  prism:        { price_id: PRICE_APEX, mode: "payment" },
  genesis:      { price_id: PRICE_APEX, mode: "payment" },

  // ARCHITECT ($39/yr subscription)
  architect:    { price_id: PRICE_ARCH, mode: "subscription" },

  // S-TIER Wave 1 ($49)
  sovereign:    { price_id: PRICE_STIER, mode: "payment" },
  colossus:     { price_id: PRICE_STIER, mode: "payment" },
  harbinger:    { price_id: PRICE_STIER, mode: "payment" },
  prometheus:   { price_id: PRICE_STIER, mode: "payment" },
  omniscient:   { price_id: PRICE_STIER, mode: "payment" },
  leviathan:    { price_id: PRICE_STIER, mode: "payment" },
  chimera:      { price_id: PRICE_STIER, mode: "payment" },
  titan:        { price_id: PRICE_STIER, mode: "payment" },
  wraith:       { price_id: PRICE_STIER, mode: "payment" },
  "apex-one":   { price_id: PRICE_STIER, mode: "payment" },

  // S-TIER Wave 2 ($49)
  pandora:      { price_id: PRICE_STIER, mode: "payment" },
  hydra:        { price_id: PRICE_STIER, mode: "payment" },
  specter:      { price_id: PRICE_STIER, mode: "payment" },
  "atlas-engine": { price_id: PRICE_STIER, mode: "payment" },
  cerberus:     { price_id: PRICE_STIER, mode: "payment" },
  obelisk:      { price_id: PRICE_STIER, mode: "payment" },
  phoenix:      { price_id: PRICE_STIER, mode: "payment" },
  "nexus-prime": { price_id: PRICE_STIER, mode: "payment" },
  chronos:      { price_id: PRICE_STIER, mode: "payment" },
  golem:        { price_id: PRICE_STIER, mode: "payment" },

  // S-TIER Wave 3 ($49)
  axiom:        { price_id: PRICE_STIER, mode: "payment" },
  dynamo:       { price_id: PRICE_STIER, mode: "payment" },
  warden:       { price_id: PRICE_STIER, mode: "payment" },
  synapse:      { price_id: PRICE_STIER, mode: "payment" },
  crucible:     { price_id: PRICE_STIER, mode: "payment" },
  echo:         { price_id: PRICE_STIER, mode: "payment" },
  vortex:       { price_id: PRICE_STIER, mode: "payment" },
  monolith:     { price_id: PRICE_STIER, mode: "payment" },
  seraph:       { price_id: PRICE_STIER, mode: "payment" },
  progenitor:   { price_id: PRICE_STIER, mode: "payment" },

  // META ($79)
  godmind:      { price_id: PRICE_META, mode: "payment" },
  fortress:     { price_id: PRICE_META, mode: "payment" },
  singularity:  { price_id: PRICE_META, mode: "payment" },
  eternus:      { price_id: PRICE_META, mode: "payment" },
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

    const engineCfg = ENGINE_PRICE_IDS[engine_slug];
    if (!engineCfg) throw new Error(`Unknown or free engine: ${engine_slug}`);

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

    const customers = await stripe.customers.list({ email: data.user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;
    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : data.user.email,
      line_items: [{ price: engineCfg.price_id, quantity: 1 }],
      mode: engineCfg.mode,
      success_url: `${origin}/engines/${engine_slug}?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/engines/${engine_slug}?canceled=1`,
      metadata: {
        engine_slug,
        user_id: data.user.id,
        product_type: "legacy-engine",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
