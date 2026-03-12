/**
 * FAILSAFE Engine Checkout
 * $39 one-time — OR free for Creator ($29/mo) and above subscribers.
 * Checks engine subscription tier before charging.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_ID = "price_1TAFfAQ7FtTiAL4acetUfMuY"; // $39 one-time

// Product IDs for Creator ($29/mo) and above tiers
const QUALIFYING_PRODUCT_IDS = new Set([
  // Creator
  "prod_U3d8z2sorSG4sI", "prod_U3d84gNyBRQgeu",
  // Studio
  "prod_U4vfFrx4XIT6Ah", "prod_U4vfNOl4dHkmld",
  // Architect
  "prod_U3d8XbUwCGrcfO", "prod_U3d8M0yNFGpGTw",
]);

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    let customerEmail: string | undefined;
    let customerId: string | undefined;
    let userId: string | undefined;
    let hasQualifyingSubscription = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        customerEmail = data.user.email;
        userId = data.user.id;

        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;

          // Check for active qualifying subscription (Creator+ tier)
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
            limit: 10,
          });

          for (const sub of subscriptions.data) {
            for (const item of sub.items.data) {
              const productId = typeof item.price.product === "string"
                ? item.price.product
                : (item.price.product as any)?.id;
              if (QUALIFYING_PRODUCT_IDS.has(productId)) {
                hasQualifyingSubscription = true;
                break;
              }
            }
            if (hasQualifyingSubscription) break;
          }
        }
      }
    }

    // If subscriber, grant free access (return special response)
    if (hasQualifyingSubscription) {
      console.log(`[FAILSAFE-CHECKOUT] Free access granted for subscriber ${userId}`);
      return new Response(JSON.stringify({
        free_access: true,
        message: "Your subscription includes FAILSAFE. Download is ready.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Otherwise, create a $39 one-time checkout session
    const origin = req.headers.get("origin") || "https://cmpsbl.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail || undefined,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/engines/failsafe?licensed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/engines/failsafe`,
      metadata: {
        product: "failsafe-engine",
        engine_slug: "failsafe",
        artifact_type: "sealed-runtime",
        license_type: "perpetual",
        user_id: userId || "",
      },
    });

    console.log(`[FAILSAFE-CHECKOUT] Session created for user ${userId || "guest"}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[FAILSAFE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
