/**
 * Cognitives Verify — Verify Stripe checkout and return signed download URL
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { notifyOwnerPurchase } from "../_shared/purchase-alert.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASSET_MAP: Record<string, string> = {
  research: 'cmpsbl-research-cognitive.zip',
  coding: 'cmpsbl-coding-agent.zip',
  analyst: 'cmpsbl-analyst.zip',
  ops: 'cmpsbl-ops.zip',
  writer: 'cmpsbl-writer.zip',
  hybrid: 'cmpsbl-hybrid.zip',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) throw new Error("Missing session_id");

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const sku = session.metadata?.sku;
    if (!sku || !ASSET_MAP[sku]) {
      throw new Error("Unknown SKU in session");
    }

    // Generate signed download URL
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: signedData, error: signError } = await supabase.storage
      .from('cognitives_zips')
      .createSignedUrl(ASSET_MAP[sku], 120); // 2 min expiry

    if (signError) {
      console.error("Signed URL error:", signError);
      throw new Error("Could not generate download link");
    }

    // Update order status
    await supabase.from('cognitive_orders').update({ payment_status: 'paid' })
      .eq('stripe_session_id', sessionId);

    return new Response(
      JSON.stringify({
        ok: true,
        sku,
        name: session.metadata?.chosen_name || '',
        downloadUrl: signedData.signedUrl,
        expiresInSeconds: 120,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Cognitives verify error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
