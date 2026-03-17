/**
 * Agent Checkout — Handles purchases for 5 Fused Meta-Agents
 * Tiered: Free $0, Starter $79, Pro $129, Elite $159, Apex $249
 * 40% bundle discount with CMPSBL Engine
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tiered agent pricing (cents)
const AGENT_PRICES: Record<string, number> = {
  // Free
  hybrid: 0, educator: 0, translator: 0,
  // Starter — $79
  writer: 7900, support: 7900, recruiter: 7900, marketing: 7900, designer: 7900,
  // Professional — $129
  sales: 12900, research: 12900, ops: 12900, legal: 12900,
  "data-engineer": 12900, product: 12900, finance: 12900, devops: 12900, strategist: 12900,
  // Elite — $159
  coding: 15900, analyst: 15900, security: 15900,
};

// Tier labels for checkout display
const AGENT_TIERS: Record<string, string> = {
  hybrid: 'Free', educator: 'Free', translator: 'Free',
  writer: 'Starter', support: 'Starter', recruiter: 'Starter', marketing: 'Starter', designer: 'Starter',
  sales: 'Professional', research: 'Professional', ops: 'Professional', legal: 'Professional',
  "data-engineer": 'Professional', product: 'Professional', finance: 'Professional', devops: 'Professional', strategist: 'Professional',
  coding: 'Elite', analyst: 'Elite', security: 'Elite',
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
    const { agent_id, agent_name, chosen_name, bundle_with_engine } = body;

    if (!agent_id) throw new Error("Missing agent_id");

    const basePriceCents = AGENT_PRICES[agent_id];
    if (basePriceCents === undefined) throw new Error(`Unknown agent: ${agent_id}`);

    // Apply 40% bundle discount if combining with CMPSBL Engine
    const priceCents = bundle_with_engine ? Math.round(basePriceCents * 0.6) : basePriceCents;

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

    const origin = req.headers.get("origin") || "https://cmpsbl.com";
    const displayName = (agent_name || agent_id).toUpperCase();
    const tier = AGENT_TIERS[agent_id] || 'Standard';

    const description = bundle_with_engine
      ? `${tier} Sealed Runtime + CMPSBL Engine Bundle (40% off)`
      : `${tier} Sealed Runtime — perpetual license with DREAM Synthesis, auto-tiering memory, and always-on CLM.`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: `${displayName} Agent — ${tier} Tier`,
            description,
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
        tier,
        bundle: bundle_with_engine ? "true" : "false",
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId || "",
      },
    });

    console.log(`[AGENT-CHECKOUT] Session for ${agent_id} (${tier}), price: $${priceCents / 100}${bundle_with_engine ? ' (bundled)' : ''}`);

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
