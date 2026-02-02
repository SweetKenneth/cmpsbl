/**
 * Capability Checkout Edge Function
 * Creates Stripe checkout session for capability purchases
 * v1.0.0
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Capability price ID mapping
const CAPABILITY_PRICES: Record<string, string> = {
  // Core capabilities
  'cap-causal-inference': 'price_1SwBSPQ7FtTiAL4aJycn6czm',
  'cap-emergent-pattern': 'price_1SwBSQQ7FtTiAL4aScJzym5y',
  'cap-capacity-forecast': 'price_1SwBSRQ7FtTiAL4a0kpjBPwU',
  'cap-cost-optimizer': 'price_1SwBSTQ7FtTiAL4aFhdkNtR0',
  'cap-predictive-healing': 'price_1SwBSUQ7FtTiAL4ahIE93DAB',
  'cap-chaos-resilience': 'price_1SwBSWQ7FtTiAL4aS3w6OPWD',
  'cap-threat-prediction': 'price_1SwBSXQ7FtTiAL4aqKfXt0h4',
  'cap-compliance-auto': 'price_1SwBSYQ7FtTiAL4aiwr1AAqi',
  'cap-wcag-auditor': 'price_1SwBSZQ7FtTiAL4abm5ZuQqK',
  'cap-sla-guardian': 'price_1SwBSbQ7FtTiAL4aT7rIMXhw',
  'cap-resource-contention': 'price_1SwBScQ7FtTiAL4aImHXOxKy',
  'cap-cognitive-mesh': 'price_1SwBSeQ7FtTiAL4aPMhYfp5b',
  
  // Synergy capabilities
  'syn-smart-recall': 'price_1SwBSgQ7FtTiAL4as6Nob9DC',
  'syn-adaptive-routing': 'price_1SwBShQ7FtTiAL4aS2j350wK',
  'syn-graceful-degradation': 'price_1SwBSjQ7FtTiAL4aGALKx0Bu',
  'syn-autonomous-evolution': 'price_1SwBSkQ7FtTiAL4auQ8H724n',
  'syn-cognitive-fusion': 'price_1SwBSmQ7FtTiAL4a2Vcrdxhm',
  'syn-self-healing': 'price_1SwBSnQ7FtTiAL4aokUoXhju',
  'syn-threat-learning': 'price_1SwBSoQ7FtTiAL4aS60aQaSc',
  'syn-end-to-end-reasoning': 'price_1SwBSqQ7FtTiAL4aq47IP62M',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { capability_id } = await req.json();
    
    if (!capability_id) {
      throw new Error("Capability ID is required");
    }

    const priceId = CAPABILITY_PRICES[capability_id];
    if (!priceId) {
      throw new Error(`Unknown capability: ${capability_id}`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check for authenticated user (optional for capabilities)
    let customerId: string | undefined;
    let customerEmail: string | undefined;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user?.email) {
        customerEmail = user.email;
        
        // Check for existing Stripe customer
        const customers = await stripe.customers.list({ 
          email: user.email, 
          limit: 1 
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    const origin = req.headers.get("origin") || "https://promptfluid-substrate.lovable.app";

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/capabilities?success=true&capability=${capability_id}`,
      cancel_url: `${origin}/capabilities?canceled=true`,
      metadata: {
        capability_id,
        type: 'capability_purchase',
      },
      payment_intent_data: {
        metadata: {
          capability_id,
          type: 'capability_purchase',
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Capability checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
