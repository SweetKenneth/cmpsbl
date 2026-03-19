/**
 * Create Agency Checkout — Stripe Checkout Session
 * Creates a checkout session for purchasing an agency
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENCY_BASE_PRICE_ID = 'price_1SrpC5Q7FtTiAL4ayLRZwAYW';
const COGNITIVE_PRICE_ID = 'price_1SrpCGQ7FtTiAL4ateTDVJ51';

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-AGENCY-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    // Parse request body
    const { agencyId, additionalCognitives = 0, email } = await req.json();
    logStep("Request received", { agencyId, additionalCognitives, email });

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader === "Bearer null") {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const authToken = authHeader.replace("Bearer ", "");
    const { data: authResult } = await supabaseClient.auth.getUser(authToken);
    const user = authResult.user;
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Please sign in to purchase", login_required: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const userEmail = user.email;
    logStep("User context", { userId: user?.id, email: userEmail });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: AGENCY_BASE_PRICE_ID,
        quantity: 1,
      },
    ];

    if (additionalCognitives > 0) {
      lineItems.push({
        price: COGNITIVE_PRICE_ID,
        quantity: additionalCognitives,
      });
    }

    // Generate onboarding token
    const onboardingToken = crypto.randomUUID();

    // Create checkout session
    const origin = req.headers.get("origin") || "https://promptfluid.com";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/agency/onboard?token=${onboardingToken}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/agency?canceled=true`,
      metadata: {
        agencyId: agencyId || '',
        additionalCognitives: additionalCognitives.toString(),
        onboardingToken,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create purchase record using service role for insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const basePriceCents = 39500;
    const additionalPriceCents = additionalCognitives * 9500;
    const totalPriceCents = basePriceCents + additionalPriceCents;

    const { error: purchaseError } = await supabaseAdmin
      .from('agency_purchases')
      .insert({
        user_id: user?.id || null,
        agency_id: agencyId || null,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        base_price_cents: basePriceCents,
        additional_cognitives: additionalCognitives,
        additional_price_cents: additionalPriceCents,
        total_price_cents: totalPriceCents,
        status: 'pending',
        purchase_email: userEmail,
        onboarding_token: onboardingToken,
      });

    if (purchaseError) {
      logStep("Warning: Failed to create purchase record", purchaseError);
    } else {
      logStep("Purchase record created");
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      onboardingToken,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
