/**
 * Marketplace Fulfill — Generate license key after successful payment
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate license key
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 5;
  
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(segment);
  }
  
  return `PF-${parts.join('-')}`;
}

// Hash for storage
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Missing session_id");
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const { product_type, product_id, template_name, purchaser_email } = session.metadata || {};
    
    // Check if license already exists for this session
    const { data: existingLicense } = await supabase
      .from('marketplace_licenses')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single();
      
    if (existingLicense) {
      // Return existing license (already fulfilled)
      return new Response(
        JSON.stringify({
          success: true,
          already_fulfilled: true,
          license: {
            prefix: existingLicense.license_key_prefix,
            product_type: existingLicense.product_type,
          },
          message: "License was already generated. Check your email for the full license key.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate new license
    const plainKey = generateLicenseKey();
    const keyHash = await hashKey(plainKey);
    const keyPrefix = plainKey.substring(0, 8);

    // Store license
    const { data: license, error } = await supabase
      .from('marketplace_licenses')
      .insert({
        license_key_hash: keyHash,
        license_key_prefix: keyPrefix,
        product_type: product_type || 'template',
        product_id: product_id || '',
        template_name: template_name || '',
        purchaser_email: purchaser_email || session.customer_email,
        stripe_session_id: session_id,
        stripe_customer_id: session.customer as string,
        amount_paid: session.amount_total,
        activated: false,
      })
      .select()
      .single();

    if (error) {
      console.error("License creation error:", error);
      throw new Error("Failed to create license");
    }

    // Deliver license key via email using the agency email queue
    const recipientEmail = purchaser_email || session.customer_email;
    if (recipientEmail) {
      try {
        await supabase.from('agency_email_queue').insert({
          agency_id: '00000000-0000-0000-0000-000000000000',
          email_type: 'license_delivery',
          recipient_email: recipientEmail,
          recipient_name: session.customer_details?.name || null,
          subject: product_type === 'os'
            ? 'Your CMPSBL Substrate OS License Key'
            : `Your ${template_name || 'Template'} License Key`,
          body_html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#0f172a;">Your License Key</h2>
              <p>Thank you for your purchase! Here is your license key:</p>
              <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
                <code style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#0f172a;">${plainKey}</code>
              </div>
              <p style="color:#64748b;font-size:14px;">Save this key securely — it cannot be recovered once this email is closed.</p>
              <p style="color:#64748b;font-size:14px;">Product: ${product_type === 'os' ? 'Substrate OS' : (template_name || 'Template')}</p>
            </div>
          `,
          body_text: `Your license key: ${plainKey}\n\nSave this key securely. Product: ${product_type === 'os' ? 'Substrate OS' : (template_name || 'Template')}`,
          status: 'pending',
          metadata: { license_id: license.id, product_type, stripe_session_id: session_id },
        });
        console.log(`License delivery email queued for ${recipientEmail}`);
      } catch (emailErr) {
        console.error("Failed to queue license email (non-fatal):", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        license_key: plainKey,
        product_type,
        template_name,
        message: product_type === 'os' 
          ? "Your Substrate OS license is ready! Save this key - it can only be used for one installation."
          : `Your ${template_name || 'template'} license is ready!`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Fulfill error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
