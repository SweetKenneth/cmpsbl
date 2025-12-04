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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Canceling subscription for ${email}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" as any });

    // Find customer by email
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("No customer found with this email");
    }

    const customerId = customers.data[0].id;

    // Find active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    // Cancel all active subscriptions (set to cancel at period end)
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      console.log(`Subscription ${subscription.id} set to cancel at period end`);
    }

    // Update customer website record
    const { error: updateError } = await supabaseClient
      .from('customer_websites')
      .update({ 
        tier: 'lite',
        subscription_status: 'canceling'
      })
      .eq('contact_email', email);

    if (updateError) {
      console.error("Failed to update website record:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be canceled at the end of the billing period"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
