/**
 * stripe-price-lookup
 * Internal helper for auditing Stripe price IDs vs configured display amounts.
 *
 * Input:  { price_ids: string[] }
 * Output: { prices: Record<string, { unit_amount: number | null; currency: string | null; type: string | null; recurring_interval: string | null; product: string | null; error?: string }> }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type PriceLookupResult = {
  unit_amount: number | null;
  currency: string | null;
  type: string | null;
  recurring_interval: string | null;
  product: string | null;
  error?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json().catch(() => ({}));
    const priceIds: unknown = body?.price_ids;

    if (!Array.isArray(priceIds) || priceIds.length === 0) {
      throw new Error("Missing required field: price_ids (non-empty array)");
    }

    // Hard cap to avoid abuse
    if (priceIds.length > 200) {
      throw new Error("Too many price_ids (max 200)");
    }

    const unique = Array.from(
      new Set(
        priceIds
          .filter((p) => typeof p === "string")
          .map((p) => p.trim())
          .filter(Boolean),
      ),
    );

    const results: Record<string, PriceLookupResult> = {};

    await Promise.all(
      unique.map(async (id) => {
        try {
          const price = await stripe.prices.retrieve(id);
          results[id] = {
            unit_amount: price.unit_amount ?? null,
            currency: price.currency ?? null,
            type: price.type ?? null,
            recurring_interval: price.recurring?.interval ?? null,
            product: typeof price.product === "string" ? price.product : null,
          };
        } catch (e) {
          results[id] = {
            unit_amount: null,
            currency: null,
            type: null,
            recurring_interval: null,
            product: null,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      }),
    );

    return new Response(JSON.stringify({ prices: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
