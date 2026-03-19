/**
 * Agent Checkout — 5 Meta-Agents with Stripe Price IDs
 * PRIMITIVE (Free), WRAITH ($79), OBSIDIAN ($129), MONOLITH ($159), RAPTOR ($249)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Canonical agent → Stripe price mapping
const AGENT_PRICE_IDS: Record<string, { price_id: string; tier: string }> = {
  wraith:   { price_id: "price_1TCnaKQ7FtTiAL4alQC6BK8i", tier: "Starter" },
  obsidian: { price_id: "price_1TCnaLQ7FtTiAL4aZBkVYaOJ", tier: "Pro" },
  monolith: { price_id: "price_1TCnaMQ7FtTiAL4anddIc4gG", tier: "Elite" },
  raptor:   { price_id: "price_1TCnaNQ7FtTiAL4aq09tW9PL", tier: "Apex" },
};

const FREE_AGENTS = new Set(["primitive"]);

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
    const { agent_id, agent_name, chosen_name, bundle_with_engine } = body;

    if (!agent_id) throw new Error("Missing agent_id");

    // Free agents — instant activation
    if (FREE_AGENTS.has(agent_id)) {
      const mintId = `AGT-${agent_id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      return new Response(JSON.stringify({
        free: true,
        redirect: `/composable-cognitives?activated=${agent_id}&mint=${mintId}`,
        mint_id: mintId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Paid agent — must have a known price ID
    const agentConfig = AGENT_PRICE_IDS[agent_id];
    if (!agentConfig) throw new Error(`Unknown agent: ${agent_id}`);

    // Require authentication for paid checkout
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    if (!data.user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const customerEmail = data.user.email;
    const userId = data.user.id;

    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://cmpsbl.com";
    const displayName = (agent_name || agent_id).toUpperCase();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [{ price: agentConfig.price_id, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/composable-cognitives?licensed=${agent_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/composable-cognitives?canceled=1`,
      metadata: {
        product: "sealed-agent",
        agent_id,
        agent_name: displayName,
        chosen_name: chosen_name || "",
        tier: agentConfig.tier,
        bundle: bundle_with_engine ? "true" : "false",
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId,
      },
    });

    console.log(`[AGENT-CHECKOUT] Session for ${agent_id} (${agentConfig.tier}), price: ${agentConfig.price_id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
