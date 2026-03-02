/**
 * Agent Checkout — Handles purchases for 20 Sealed Runtime Agents
 * Pricing: Flagship $129, Elite $159, Standard $129, Free = instant redirect
 * Supports guest checkout.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Agent pricing map (cents) — matches crownJewelPowers.ts
const AGENT_PRICES: Record<string, number> = {
  // Flagship — $129
  memory: 12900, guardian: 12900, router: 12900,
  // Elite — $159
  coding: 15900, analyst: 15900, security: 15900,
  // Standard — $129
  sales: 12900, research: 12900, ops: 12900, legal: 12900,
  recruiter: 12900, support: 12900, "data-engineer": 12900,
  marketing: 12900, product: 12900, finance: 12900, designer: 12900,
  // Free
  hybrid: 0, educator: 0, writer: 0,
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
    const { agent_id, agent_name, chosen_name } = body;

    if (!agent_id) throw new Error("Missing agent_id");

    const priceCents = AGENT_PRICES[agent_id];
    if (priceCents === undefined) throw new Error(`Unknown agent: ${agent_id}`);

    // Free agents — instant activation
    if (priceCents === 0) {
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

    // Authenticated user check
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
        if (customers.data.length > 0) customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";
    const displayName = (agent_name || agent_id).toUpperCase();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: `${displayName} Agent — Sealed Runtime`,
            description: `Perpetual license for the ${displayName} sealed runtime agent with auto-tiering memory, RIPPLE orchestrator, and always-on CLM.`,
          },
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/composable-cognitives?licensed=${agent_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/composable-cognitives?canceled=1`,
      metadata: {
        product: "sealed-agent",
        agent_id,
        agent_name: displayName,
        chosen_name: chosen_name || "",
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId || "",
      },
    });

    console.log(`[AGENT-CHECKOUT] Session created for ${agent_id}, price: $${priceCents / 100}`);

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
