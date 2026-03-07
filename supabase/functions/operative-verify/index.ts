import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { notifyOwnerPurchase } from "../_shared/purchase-alert.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPERATIVE_NAMES: Record<string, string> = {
  sentinel: "SENTINEL",
  phantom: "PHANTOM",
  cortex: "CORTEX",
  oracle: "ORACLE",
  vanguard: "VANGUARD",
  conductor: "CONDUCTOR",
  arbiter: "ARBITER",
  automaton: "AUTOMATON",
  catalyst: "CATALYST",
  beacon: "BEACON",
  bastion: "BASTION",
  cipher: "CIPHER",
  meridian: "MERIDIAN",
  architect: "ARCHITECT",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { session_id, operative_slug } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      "";
    const customerName =
      session.customer_details?.name || "Operative Owner";
    const operativeName = OPERATIVE_NAMES[operative_slug] || operative_slug?.toUpperCase() || "UNKNOWN";
    const docsUrl = `https://cmpsbl.com/docs/operatives/${operative_slug}`;
    const editionId = `OP-${operative_slug?.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Send license email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && customerEmail) {
      const emailHtml = `
        <div style="font-family:'SF Mono',SFMono-Regular,Menlo,monospace;background:#0a0a0a;color:#e5e5e5;padding:40px 24px;max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;padding:8px 20px;border:1px solid #333;border-radius:8px;font-size:11px;color:#888;letter-spacing:3px;">
              CMPSBL — SEALED RUNTIME PROGRAM
            </div>
          </div>
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:28px;font-weight:700;margin:0 0 8px 0;color:#fff;">
              ${operativeName} OPERATIVE
            </h1>
            <p style="font-size:14px;color:#888;margin:0;">License Activated</p>
          </div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 16px 0;font-size:14px;">
              ${customerName},
            </p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#ccc;">
              Thank you for acquiring the <strong style="color:#fff;">${operativeName}</strong> Operative.
              Your sealed runtime license is now active. This is a perpetual license — it's yours forever.
            </p>
            <div style="background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:16px;margin:16px 0;font-size:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">LICENSE ID</span>
                <span style="color:#fff;">${editionId}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">TYPE</span>
                <span style="color:#fff;">Perpetual / Sealed Runtime</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#666;">OWNER</span>
                <span style="color:#fff;">${customerEmail}</span>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${docsUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              Access Docs & Download
            </a>
          </div>
          <div style="text-align:center;border-top:1px solid #222;padding-top:20px;">
            <p style="font-size:11px;color:#555;margin:0;">
              CMPSBL — Sealed Runtime Program<br/>
              This email serves as your Ownership Certificate.
            </p>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dev@CMPSBL.com",
          to: [customerEmail],
          subject: `${operativeName} Operative — License Activated | ${editionId}`,
          html: emailHtml,
        }),
      });
      console.log(`[OPERATIVE-VERIFY] Email sent to ${customerEmail} for ${operativeName}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        operative: operativeName,
        edition_id: editionId,
        email: customerEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[OPERATIVE-VERIFY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
