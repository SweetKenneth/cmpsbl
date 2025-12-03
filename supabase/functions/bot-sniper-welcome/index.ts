import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    await resend.emails.send({
      from: "PromptFluid <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Bot Sniper - Your Trial Starts Now!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7A5FFF;">Welcome to Bot Sniper, ${name}!</h1>
          <p>Your 3-day free trial has started. Here's what you can do now:</p>
          
          <div style="background: #f6f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Quick Start Guide</h3>
            <ol>
              <li>Create your first API key in the dashboard</li>
              <li>Integrate our detection endpoint into your app</li>
              <li>Monitor threats in real-time analytics</li>
            </ol>
          </div>

          <p><strong>Your API Endpoint:</strong></p>
          <code style="background: #0A0B10; color: #F6F9FF; padding: 10px; display: block; border-radius: 4px;">
            POST https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/bot-sniper-analyze
          </code>

          <p style="margin-top: 30px;">
            <a href="https://www.promptfluid.com/bot-sniper" 
               style="background: #7A5FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>

          <p style="color: #888; font-size: 14px; margin-top: 40px;">
            Questions? Reply to this email or contact support@promptfluid.com
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Email error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
