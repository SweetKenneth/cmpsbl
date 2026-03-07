/**
 * Agent Verify — Confirms payment, mints version, sends license email via Resend
 * For Sealed Runtime Agent purchases ($129 / $159)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { notifyOwnerPurchase } from "../_shared/purchase-alert.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { session_id, agent_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const customerEmail = session.customer_details?.email || session.customer_email || "";
    const customerName = session.customer_details?.name || "Agent Owner";
    const agentName = (session.metadata?.agent_name || agent_id || "UNKNOWN").toUpperCase();
    const chosenName = session.metadata?.chosen_name || "";
    const pricePaid = session.amount_total ? `$${(session.amount_total / 100).toFixed(0)}` : "$129";

    // Mint unique version ID
    const mintHash = crypto.randomUUID().slice(0, 8);
    const mintId = `AGT-${agentName}-v1.0.0-${mintHash}`;
    const docsUrl = `https://cmpsbl.com/docs/agents/${(agent_id || agentName).toLowerCase()}`;

    // Send license email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey && customerEmail) {
      const emailHtml = `
        <div style="font-family:'SF Mono',SFMono-Regular,Menlo,monospace;background:#0a0a0a;color:#e5e5e5;padding:40px 24px;max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;padding:8px 20px;border:1px solid #333;border-radius:8px;font-size:11px;color:#888;letter-spacing:3px;">
              CMPSBL — SEALED AGENT PROGRAM
            </div>
          </div>
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:28px;font-weight:700;margin:0 0 8px 0;color:#fff;">
              ${agentName} AGENT
            </h1>
            ${chosenName ? `<p style="font-size:16px;color:#60a5fa;margin:0 0 4px 0;">"${chosenName}"</p>` : ""}
            <p style="font-size:14px;color:#888;margin:0;">Version Minted & License Activated</p>
          </div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 16px 0;font-size:14px;">${customerName},</p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#ccc;">
              Your <strong style="color:#fff;">${agentName}</strong> agent has been minted as a unique sealed runtime.
              This version captures all learned knowledge, CLM training progress, and skill weights at the point of mint.
              It is yours forever — perpetual license, no subscriptions.
            </p>
            <div style="background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:16px;margin:16px 0;font-size:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">MINT ID</span>
                <span style="color:#fff;font-family:monospace;">${mintId}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">TYPE</span>
                <span style="color:#fff;">Sealed Runtime Agent / Perpetual</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">PRICE</span>
                <span style="color:#fff;">${pricePaid} USD</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">INCLUDES</span>
                <span style="color:#fff;">Auto-Tiering Memory · RIPPLE · CLM · DECODE</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#666;">OWNER</span>
                <span style="color:#fff;">${customerEmail}</span>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${docsUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              Access Documentation & Download
            </a>
          </div>
          <div style="text-align:center;border-top:1px solid #222;padding-top:20px;">
            <p style="font-size:11px;color:#555;margin:0;">
              CMPSBL — Sealed Agent Program<br/>
              This email serves as your Ownership Certificate and Mint Receipt.
            </p>
          </div>
        </div>
      `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Dev@CMPSBL.com",
            to: [customerEmail],
            subject: `${agentName} Agent — Version Minted | ${mintId}`,
            html: emailHtml,
          }),
        });
        emailSent = emailRes.ok;
        console.log(`[AGENT-VERIFY] Email ${emailRes.ok ? "sent" : "failed"} to ${customerEmail} for ${agentName}`);
      } catch (e) {
        console.error("[AGENT-VERIFY] Email error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: agentName,
        mint_id: mintId,
        chosen_name: chosenName,
        email: customerEmail,
        email_sent: emailSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-VERIFY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
