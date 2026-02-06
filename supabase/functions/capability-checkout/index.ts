/**
 * Capability Checkout Edge Function
 * Creates Stripe checkout session for capability purchases
 * v1.3.0 — All 86+ capabilities supported
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Complete capability price ID mapping — ALL 86+ capabilities
const CAPABILITY_PRICES: Record<string, string> = {
  // === Core Capabilities ===
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
  
  // === Synergy Pipeline Capabilities ===
  'syn-smart-recall': 'price_1SwBSgQ7FtTiAL4as6Nob9DC',
  'syn-adaptive-routing': 'price_1SwBShQ7FtTiAL4aS2j350wK',
  'syn-graceful-degradation': 'price_1SwBSjQ7FtTiAL4aGALKx0Bu',
  'syn-autonomous-evolution': 'price_1SwBSkQ7FtTiAL4auQ8H724n',
  'syn-cognitive-fusion': 'price_1SwBSmQ7FtTiAL4a2Vcrdxhm',
  'syn-self-healing': 'price_1SwBSnQ7FtTiAL4aokUoXhju',
  'syn-threat-learning': 'price_1SwBSoQ7FtTiAL4aS60aQaSc',
  'syn-end-to-end-reasoning': 'price_1SwBSqQ7FtTiAL4aq47IP62M',

  // === Intelligence Expansion ===
  'cap-semantic-reasoning': 'price_1SwBlwQ7FtTiAL4axAqaaiTg',
  'cap-intent-disambiguation': 'price_1SwBlxQ7FtTiAL4aojDNaJDU',
  'cap-knowledge-distillation': 'price_1SwBlzQ7FtTiAL4agQtOhCXp',
  'cap-temporal-reasoning': 'price_1SwBm1Q7FtTiAL4aFKteQKtG',
  'cap-analogy-engine': 'price_1SwBm2Q7FtTiAL4aDXET9GYH',
  'cap-hypothesis-generator': 'price_1SwBm3Q7FtTiAL4aWyb1S3tw',

  // === Optimization Expansion ===
  'cap-latency-optimizer': 'price_1SwBm5Q7FtTiAL4aZrf4zrxL',
  'cap-token-budgeting': 'price_1SwBm6Q7FtTiAL4aH1qYI1x6',
  'cap-context-compression': 'price_1SwBm7Q7FtTiAL4aEkQMyRSG',
  'cap-batch-orchestrator': 'price_1SwBm9Q7FtTiAL4aqrrJa9El',
  'cap-memory-pooling': 'price_1SwBmCQ7FtTiAL4aXnsUiSvW',
  'cap-query-optimizer': 'price_1SwBmEQ7FtTiAL4aR17K6lqz',

  // === Resilience Expansion ===
  'cap-circuit-breaker-pro': 'price_1SwBmFQ7FtTiAL4aGeDJ49wo',
  'cap-retry-orchestrator': 'price_1SwBmGQ7FtTiAL4aEzdQ1yAo',
  'cap-failover-manager': 'price_1SwBmHQ7FtTiAL4a7w6HiMc6',
  'cap-load-shedding': 'price_1SwBmJQ7FtTiAL4aTilnaSPM',
  'cap-bulkhead-isolation': 'price_1SwBmKQ7FtTiAL4a2GMfg1k9',

  // === Security Expansion ===
  'cap-anomaly-detection': 'price_1SwBmLQ7FtTiAL4ajGBip76w',
  'cap-secret-rotation': 'price_1SwBmNQ7FtTiAL4aeZMBO1mK',
  'cap-rate-limiter-pro': 'price_1SwBmNQ7FtTiAL4aZpKIxPEY',
  'cap-input-sanitization': 'price_1SwBmRQ7FtTiAL4aj5N0S5oe',
  'cap-access-control': 'price_1SwBmSQ7FtTiAL4acUBQEvgv',
  'cap-encryption-toolkit': 'price_1SwBmTQ7FtTiAL4aQMw5mQSo',

  // === Accessibility Expansion ===
  'cap-screen-reader-optimizer': 'price_1SwBmUQ7FtTiAL4aE12zwxSu',
  'cap-color-contrast': 'price_1SwBmVQ7FtTiAL4ac7kvOVbR',
  'cap-keyboard-nav': 'price_1SwBmWQ7FtTiAL4ahM73IRqp',
  'cap-alt-text-generator': 'price_1SwBmXQ7FtTiAL4aOEPYI97x',

  // === Automation Expansion ===
  'cap-workflow-engine': 'price_1SwBmYQ7FtTiAL4ayzfrPMjB',
  'cap-event-sourcing': 'price_1SwBmZQ7FtTiAL4a6kToI2pr',
  'cap-scheduler-pro': 'price_1SwBmaQ7FtTiAL4akhbkVCeo',
  'cap-notification-hub': 'price_1SwBmdQ7FtTiAL4aroaj2Vx8',
  'cap-state-machine': 'price_1SwBmfQ7FtTiAL4aTRIOPWQB',

  // === Flagship Expansion ===
  'cap-enterprise-mesh': 'price_1Sx9kYQ7FtTiAL4a2TQtgVOV',
  'cap-cognitive-platform': 'price_1SwBmhQ7FtTiAL4aU89A5AEH',
  'cap-security-suite': 'price_1SwBmiQ7FtTiAL4aenCVhynX',
  'cap-resilience-platform': 'price_1SwBmjQ7FtTiAL4aU1oKwtPF',

  // === Ultra Expansion (NEW) ===
  'cap-data-pipeline-orchestrator': 'price_1SwBtNQ7FtTiAL4a3VGhbd8A',
  'cap-vector-similarity': 'price_1SwBtNQ7FtTiAL4a2P0fIupg',
  'cap-prompt-engineering': 'price_1SwBtOQ7FtTiAL4abBdbZwYB',
  'cap-multi-modal-fusion': 'price_1SwBtPQ7FtTiAL4azbo2ffUr',
  'cap-agent-collaboration': 'price_1SwBtRQ7FtTiAL4a5AvVYYFU',
  'cap-streaming-response': 'price_1SwBtSQ7FtTiAL4aKnm16SBY',
  'cap-context-window-manager': 'price_1SwBtTQ7FtTiAL4a2s7dIYCQ',
  'cap-embedding-cache': 'price_1SwBtVQ7FtTiAL4a80Abl3hf',
  'cap-function-calling': 'price_1SwBtWQ7FtTiAL4ahG4wAOsj',
  'cap-rag-pipeline-pro': 'price_1SwBtXQ7FtTiAL4a7kK7saus',
  'cap-document-intelligence': 'price_1SwBtaQ7FtTiAL4aNUJGvTsT',
  'cap-structured-output': 'price_1SwBtbQ7FtTiAL4aFGRG80tP',
  'cap-model-fine-tuning': 'price_1SwBtdQ7FtTiAL4aZbEHzQYe',
  'cap-conversation-threading': 'price_1SwBteQ7FtTiAL4aSEuVClZA',
  'cap-semantic-search-platform': 'price_1SwBtfQ7FtTiAL4ad6KCrRWH',
  'cap-language-processing-hub': 'price_1SwBtgQ7FtTiAL4aclzHNIv8',
  'cap-response-quality': 'price_1SwBthQ7FtTiAL4aZi2g2dUK',
  'cap-output-parser-pro': 'price_1SwBtiQ7FtTiAL4amwXjdgsk',
  'cap-workflow-automation': 'price_1SwBtjQ7FtTiAL4aDhfTewRL',
  'cap-advanced-memory': 'price_1SwBtlQ7FtTiAL4a5oH7LP9P',
  'cap-code-generation': 'price_1SwBtoQ7FtTiAL4aVr8rHLUv',
  'cap-sentiment-analysis': 'price_1SwBtpQ7FtTiAL4aCV4ncJT2',
  'cap-entity-extraction': 'price_1SwBtqQ7FtTiAL4aDbplLSoa',
  'cap-text-classification': 'price_1SwBtrQ7FtTiAL4ax6s9J55f',
  'cap-content-moderation': 'price_1SwBtsQ7FtTiAL4amFozzfI3',
  'cap-knowledge-graph-builder': 'price_1SwBttQ7FtTiAL4ajyeEVVy1',
  'cap-question-answering': 'price_1SwBtuQ7FtTiAL4azvmjr3qw',
  'cap-document-summarizer': 'price_1SwBtvQ7FtTiAL4aqlmIpR36',
  'cap-model-evaluation': 'price_1SwBtwQ7FtTiAL4aMnpm3rzf',
  'cap-privacy-protection': 'price_1SwBtxQ7FtTiAL4axNxbuNXI',
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
      // If no price ID found, this is an off-menu item
      throw new Error(`This capability requires a custom license. Please contact PromptFluid@gmail.com for pricing.`);
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
