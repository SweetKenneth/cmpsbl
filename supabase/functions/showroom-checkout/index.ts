/**
 * Showroom Checkout Edge Function
 * Creates Stripe checkout sessions for dynamically-priced Showroom discoveries.
 * Uses price_data with CJPI-graduated pricing — no pre-mapped price IDs needed.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  item_id: z.string().min(1).max(64),
  item_name: z.string().min(1).max(255),
  cjpi_score: z.number().int().min(68).max(100),
});

/** Graduated CJPI pricing — mirrors client-side formula */
function cjpiToUsd(score: number): number {
  if (score === 100) return 1952;
  if (score >= 94) return score * 2;
  if (score >= 90) return Math.round(score * 1.5);
  if (score >= 80) return Math.round(score * 1.25);
  return score; // 68–79
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }
    const { item_id, item_name, cjpi_score } = parsed.data;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe is not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(
        JSON.stringify({ error: "Please sign in to purchase", login_required: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    if (!data.user?.email) {
      return new Response(
        JSON.stringify({ error: "Please sign in to purchase", login_required: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const customerEmail = data.user.email;
    const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customerId = existingCustomers.data.length > 0 ? existingCustomers.data[0].id : undefined;

    const priceUsd = cjpiToUsd(cjpi_score);
    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceUsd * 100,
            product_data: {
              name: item_name,
              description: `CJPI ${cjpi_score} — Certified one-of-a-kind discovery from the CMPSBL Showroom`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/showroom?success=true&item=${item_id}`,
      cancel_url: `${origin}/showroom?canceled=true`,
      metadata: {
        item_id,
        item_name,
        cjpi_score: String(cjpi_score),
        price_usd: String(priceUsd),
        type: "showroom_purchase",
      },
      payment_intent_data: {
        metadata: {
          item_id,
          item_name,
          cjpi_score: String(cjpi_score),
          type: "showroom_purchase",
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Showroom checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
