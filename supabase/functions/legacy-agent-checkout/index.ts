/**
 * Legacy Agent Checkout — 20 Original Standalone Agents
 * Free (4), Engineering $19 (4), Defense $39 (4), Intelligence $59 (4), Growth $79 (4)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_AGENTS = new Set(["hybrid", "educator", "writer", "translator"]);

// Slug → Stripe price ID (tier-level pricing)
const AGENT_PRICE_MAP: Record<string, string> = {
  // Engineering $19
  coder:          "price_1TG98sQ7FtTiAL4aJ3XGYZ29",
  designer:       "price_1TG98sQ7FtTiAL4aJ3XGYZ29",
  devops:         "price_1TG98sQ7FtTiAL4aJ3XGYZ29",
  "data-engineer": "price_1TG98sQ7FtTiAL4aJ3XGYZ29",
  // Defense $39
  guardian:       "price_1TG98tQ7FtTiAL4aA0hsvJN4",
  security:       "price_1TG98tQ7FtTiAL4aA0hsvJN4",
  support:        "price_1TG98tQ7FtTiAL4aA0hsvJN4",
  legal:          "price_1TG98tQ7FtTiAL4aA0hsvJN4",
  // Intelligence $59
  memory:         "price_1TG98uQ7FtTiAL4a8uaNOAnY",
  analyst:        "price_1TG98uQ7FtTiAL4a8uaNOAnY",
  researcher:     "price_1TG98uQ7FtTiAL4a8uaNOAnY",
  strategist:     "price_1TG98uQ7FtTiAL4a8uaNOAnY",
  // Growth $79
  sales:          "price_1TG98vQ7FtTiAL4a1F4X7jNC",
  marketer:       "price_1TG98vQ7FtTiAL4a1F4X7jNC",
  recruiter:      "price_1TG98vQ7FtTiAL4a1F4X7jNC",
  finance:        "price_1TG98vQ7FtTiAL4a1F4X7jNC",
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
    const { agent_slug } = body;
    if (!agent_slug) throw new Error("Missing agent_slug");

    // Free agents — instant activation
    if (FREE_AGENTS.has(agent_slug)) {
      const mintId = `LAGT-${agent_slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      return new Response(JSON.stringify({ free: true, mint_id: mintId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const priceId = AGENT_PRICE_MAP[agent_slug];
    if (!priceId) throw new Error(`Unknown agent: ${agent_slug}`);

    // Require auth for paid checkout
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

    const customers = await stripe.customers.list({ email: data.user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;
    const origin = req.headers.get("origin") || "https://cmpsbl.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : data.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/agents?purchased=${agent_slug}`,
      cancel_url: `${origin}/agents?canceled=1`,
      metadata: {
        product_type: "legacy-agent",
        agent_slug,
        user_id: data.user.id,
        license_type: "perpetual",
      },
    });

    console.log(`[LEGACY-AGENT-CHECKOUT] ${agent_slug}, price: ${priceId}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[LEGACY-AGENT-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
