/**
 * Licensing Verify — Verify Stripe checkout session and record license
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const customerEmail = typeof session.customer === 'object' 
      ? session.customer?.email 
      : session.customer_email;

    const subscription = session.subscription as Stripe.Subscription | null;

    // Record license in database
    const licenseData = {
      stripe_session_id: session.id,
      stripe_subscription_id: subscription?.id || null,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      license_type: session.metadata?.license_type || 'developer',
      customer_email: customerEmail,
      customer_name: session.metadata?.customer_name || null,
      organization: session.metadata?.organization || null,
      user_id: session.metadata?.user_id || null,
      status: 'active',
      activated_at: new Date().toISOString(),
      expires_at: subscription?.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    };

    // Insert or update license record
    const { data: license, error } = await supabase
      .from('substrate_licenses')
      .upsert(licenseData, { onConflict: 'stripe_session_id' })
      .select()
      .single();

    if (error) {
      console.error("Failed to record license:", error);
      // Don't fail the request - license is still valid via Stripe
    }

    console.log(`Developer License verified: ${session.id}, email: ${customerEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        license: {
          type: 'developer',
          email: customerEmail,
          status: 'active',
          expires_at: licenseData.expires_at,
          subscription_id: subscription?.id,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Licensing verify error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
