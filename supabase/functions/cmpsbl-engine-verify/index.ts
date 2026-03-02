/**
 * CMPSBL Engine Verify — Verify Stripe session, record license, send thank-you email
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCS_URL = "https://cmpsbl.lovable.app/substrate/docs";

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
      expand: ["subscription", "customer"],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const customer =
      typeof session.customer === "object" ? session.customer : null;
    const customerEmail =
      customer?.email || session.customer_email || session.customer_details?.email;
    const customerName =
      customer?.name || session.customer_details?.name || "Licensee";

    const subscription = session.subscription as Stripe.Subscription | null;

    // Record license
    const licenseData = {
      stripe_session_id: session.id,
      stripe_subscription_id: subscription?.id || null,
      stripe_customer_id:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id,
      license_type: "cmpsbl-engine-annual",
      customer_email: customerEmail,
      customer_name: customerName,
      organization: session.metadata?.organization || null,
      user_id: session.metadata?.user_id || null,
      status: "active",
      activated_at: new Date().toISOString(),
      expires_at: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    };

    const { error: dbError } = await supabase
      .from("substrate_licenses")
      .upsert(licenseData, { onConflict: "stripe_session_id" });

    if (dbError) {
      console.error("Failed to record license:", dbError);
    }

    // Send thank-you email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (RESEND_API_KEY && customerEmail) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "CMPSBL <Dev@CMPSBL.com>",
            to: [customerEmail],
            subject: "Your CMPSBL Engine License is Active 🚀",
            html: buildThankYouEmail(customerName, licenseData.expires_at),
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log(`Thank-you email sent to ${customerEmail}`);
        } else {
          const errText = await emailRes.text();
          console.error(`Resend error: ${emailRes.status} - ${errText}`);
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    console.log(
      `CMPSBL Engine license verified: ${session.id}, email: ${customerEmail}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        license: {
          type: "cmpsbl-engine-annual",
          email: customerEmail,
          name: customerName,
          status: "active",
          expires_at: licenseData.expires_at,
          subscription_id: subscription?.id,
          docs_url: DOCS_URL,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("CMPSBL Engine verify error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function buildThankYouEmail(name: string, expiresAt: string | null): string {
  const expiryLine = expiresAt
    ? `<p style="color:#888;font-size:13px;">Your license renews on <strong>${new Date(expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>.</p>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="padding:48px 40px 24px;text-align:center;">
          <div style="display:inline-block;padding:6px 16px;border:1px solid #333;border-radius:100px;font-size:11px;letter-spacing:2px;color:#888;margin-bottom:24px;">
            SEALED RUNTIME · LICENSED
          </div>
          <h1 style="color:#fff;font-size:32px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;">
            Welcome to the Engine.
          </h1>
          <p style="color:#aaa;font-size:16px;margin:0;line-height:1.6;">
            ${name}, your CMPSBL Engine license is now active.
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;">
          <div style="border-top:1px solid #1a1a1a;"></div>
        </td></tr>

        <!-- What you get -->
        <tr><td style="padding:32px 40px;">
          <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;">What's included:</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;color:#ccc;font-size:14px;">✦ Full CMPSBL Engine sealed runtime</td></tr>
            <tr><td style="padding:8px 0;color:#ccc;font-size:14px;">✦ 8 autonomous capabilities in one import</td></tr>
            <tr><td style="padding:8px 0;color:#ccc;font-size:14px;">✦ Continuous updates for the duration of your license</td></tr>
            <tr><td style="padding:8px 0;color:#ccc;font-size:14px;">✦ Full documentation &amp; integration guides</td></tr>
            <tr><td style="padding:8px 0;color:#ccc;font-size:14px;">✦ Priority support via Dev@CMPSBL.com</td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 40px 32px;text-align:center;">
          <a href="${DOCS_URL}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
            Access Docs &amp; Download →
          </a>
          <p style="color:#666;font-size:12px;margin-top:12px;">
            Your documentation portal includes the engine file, integration guides, and API reference.
          </p>
        </td></tr>

        <!-- License info -->
        <tr><td style="padding:0 40px 32px;">
          <div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:20px;">
            <p style="color:#888;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">License Details</p>
            <p style="color:#fff;font-size:14px;margin:4px 0;">Type: <strong>Annual Engine License</strong></p>
            <p style="color:#fff;font-size:14px;margin:4px 0;">Email: <strong>${"${customerEmail}" || name}</strong></p>
            ${expiryLine}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="color:#555;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} CMPSBL® by PromptFluid® · All rights reserved.
          </p>
          <p style="color:#444;font-size:11px;margin:8px 0 0;">
            Questions? Reply to this email or reach us at Dev@CMPSBL.com
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
