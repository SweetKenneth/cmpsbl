/**
 * Standalone Engine Checkout — All Engines with canonical Stripe Price IDs
 * Covers CORE ($199), ELITE ($399), APEX ($599/$999), and META ($1,999) tiers.
 * Free engines (FAILSAFE, BEACON, BASTION, CIPHER) are handled client-side.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Canonical engine_slug → Stripe price mapping (server-side, ignores client price_id)
const ENGINE_PRICE_IDS: Record<string, string> = {
  // CORE tier ($199)
  automaton:  "price_1T6MgjQ7FtTiAL4aO0YcTEEh",
  catalyst:   "price_1T6MgkQ7FtTiAL4a80YXxyvP",
  meridian:   "price_1T6MgpQ7FtTiAL4a1Yr5YhrH",
  aegis:      "price_1T6MgRQ7FtTiAL4af82LmdJR",

  // ELITE tier ($399)
  cortex:     "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  forge:      "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  oracle:     "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  vanguard:   "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  conductor:  "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  arbiter:    "price_1T6OBKQ7FtTiAL4aZpSs8MYy",
  mirage:     "price_1T6OBKQ7FtTiAL4aZpSs8MYy",

  // APEX tier ($599)
  sentinel:   "price_1T6OBJQ7FtTiAL4ar4khmX2R",
  phantom:    "price_1T6OBJQ7FtTiAL4ar4khmX2R",
  nexus:      "price_1T6OBJQ7FtTiAL4ar4khmX2R",
  prism:      "price_1T6OBJQ7FtTiAL4ar4khmX2R",
  genesis:    "price_1T6OBJQ7FtTiAL4ar4khmX2R",

  // S-TIER Wave 1 ($999)
  sovereign:    "price_1T9hKAQ7FtTiAL4alDEWJ33m",
  colossus:     "price_1T9hKBQ7FtTiAL4acMRKaevN",
  harbinger:    "price_1T9hKCQ7FtTiAL4ayFJF9hFf",
  prometheus:   "price_1T9hKDQ7FtTiAL4aHCOIjgFV",
  omniscient:   "price_1T9hKEQ7FtTiAL4a86g6KJ3l",
  leviathan:    "price_1T9hKFQ7FtTiAL4aZXdi4Vht",
  chimera:      "price_1T9hKGQ7FtTiAL4as5wD8Wc4",
  titan:        "price_1T9hKHQ7FtTiAL4aAVewzBn8",
  wraith:       "price_1T9hKIQ7FtTiAL4a0cEFeE0z",
  "apex-one":   "price_1T9hKJQ7FtTiAL4aVQ6tTM0e",

  // S-TIER Wave 2 ($599)
  pandora:      "price_1T9pJJQ7FtTiAL4a2P5ElTqA",
  hydra:        "price_1T9pJKQ7FtTiAL4aOX2OTNf4",
  specter:      "price_1T9pJNQ7FtTiAL4aSdufCEAw",
  "atlas-engine": "price_1T9pJOQ7FtTiAL4a92Iskknt",
  cerberus:     "price_1T9pJQQ7FtTiAL4aGlT27WMR",
  obelisk:      "price_1T9pJSQ7FtTiAL4azzcKbzJD",
  phoenix:      "price_1T9pJTQ7FtTiAL4acUqX4DpU",
  "nexus-prime": "price_1T9pJVQ7FtTiAL4aKAkLF5Hd",
  chronos:      "price_1T9pJXQ7FtTiAL4aOrmIKGiO",
  golem:        "price_1T9pJZQ7FtTiAL4amRr9MTaO",

  // S-TIER Wave 3 ($599)
  axiom:        "price_1T9pfxQ7FtTiAL4asMjMPQyZ",
  dynamo:       "price_1T9pfyQ7FtTiAL4aD66RUINW",
  warden:       "price_1T9pg1Q7FtTiAL4aptWtuKbb",
  synapse:      "price_1T9pg2Q7FtTiAL4aCQUugB6R",
  crucible:     "price_1T9pg3Q7FtTiAL4aEfrpVOBp",
  echo:         "price_1T9pg4Q7FtTiAL4aHcRgDqUp",
  vortex:       "price_1T9pg6Q7FtTiAL4aYGXjxjV0",
  monolith:     "price_1T9pg7Q7FtTiAL4aKtOXPqwo",
  seraph:       "price_1T9pg9Q7FtTiAL4aRQET40Yo",
  progenitor:   "price_1T9pgAQ7FtTiAL4a9MJczerR",

  // META-ENGINES ($1,999)
  godmind:      "price_1T9pgGQ7FtTiAL4a58HQ3Dvw",
  fortress:     "price_1T9pgHQ7FtTiAL4aEuknUub0",
  singularity:  "price_1T9pgJQ7FtTiAL4aBNJOYxud",
  eternus:      "price_1T9pgKQ7FtTiAL4aJfC6B3ev",
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
      success_url: `${origin}/engines/${engine_slug}?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/engines/${engine_slug}?canceled=1`,
      metadata: {
        engine_slug,
        user_id: userId,
        product_type: "engine",
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
