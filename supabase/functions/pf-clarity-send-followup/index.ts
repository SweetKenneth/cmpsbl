import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { site_url, user_email, scan_id, compliance_score, total_issues, fixable_issues, critical_issues } = await req.json();

    if (!site_url || !user_email) {
      return new Response(
        JSON.stringify({ error: "site_url and user_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limit: 1 per 24h per domain for 'results' type
    const { data: existingFollow } = await supabase
      .from("pf_clarity_email_follows")
      .select("*")
      .eq("site_url", site_url)
      .eq("sent_type", "results")
      .eq("sent_date", new Date().toISOString().split('T')[0])
      .single();

    if (existingFollow) {
      return new Response(
        JSON.stringify({ success: false, message: "Follow-up already sent for this domain today" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Compose personalized email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .score-badge { background: white; color: #7A5FFF; padding: 10px 20px; border-radius: 24px; display: inline-block; margin-top: 15px; font-size: 24px; font-weight: bold; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .stat-row { display: flex; gap: 15px; margin: 20px 0; }
            .stat { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #7A5FFF; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
            .cta-section { background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
            .cta-button { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin: 8px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Accessibility Scan Results</h1>
            <div class="score-badge">${compliance_score}% Compliant</div>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            <p>We just completed an accessibility scan of <strong>${site_url}</strong> and found some important issues that could impact your users and expose you to legal risk.</p>
            
            <div class="stat-row">
              <div class="stat">
                <div class="stat-number">${total_issues || 0}</div>
                <div class="stat-label">Total Issues</div>
              </div>
              <div class="stat">
                <div class="stat-number">${critical_issues || 0}</div>
                <div class="stat-label">Critical Issues</div>
              </div>
              <div class="stat">
                <div class="stat-number">${fixable_issues || 0}</div>
                <div class="stat-label">Auto-Fixable</div>
              </div>
            </div>

            <p><strong>Good news:</strong> We detected <span class="highlight">${fixable_issues || 0} issues that can be auto-repaired instantly</span> with PromptFluid Clarity.</p>

            <p>Our AI-powered engine fixes accessibility issues in real-time without touching your source code. No developer time required. Fully rollback-safe.</p>

            <div class="cta-section">
              <h3 style="margin-top: 0;">Ready to fix your site?</h3>
              <p style="margin-bottom: 20px;">Choose the plan that works for you:</p>
              <a href="https://www.promptfluid.com/projects/clarity?utm_source=scan&utm_campaign=clarity_followup&tier=continuous" class="cta-button">Start Auto-Fix ($69/mo)</a>
              <a href="https://www.promptfluid.com/projects/clarity?utm_source=scan&utm_campaign=clarity_followup&tier=onetime" class="cta-button" style="background: linear-gradient(135deg, #059669, #10b981);">One-Time Fix ($199)</a>
            </div>

            <p><strong>What you get:</strong></p>
            <ul>
              <li>✅ Auto-fix for 24 types of accessibility issues</li>
              <li>✅ Continuous monitoring & real-time repairs</li>
              <li>✅ 30-day rollback protection</li>
              <li>✅ WCAG 2.2 AA/AAA compliance</li>
              <li>✅ No code changes required</li>
            </ul>

            <p>Questions? Reply to this email or visit <a href="https://www.promptfluid.com/projects/clarity">our Clarity page</a> for more details.</p>

            <p>Thanks,<br><strong>The PromptFluid Team</strong></p>
          </div>

          <div class="footer">
            <p>PromptFluid Clarity – AI That Flows.</p>
            <p>You received this email because you requested an accessibility scan at promptfluid.com</p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "PromptFluid Clarity <clarity@promptfluid.com>",
      to: [user_email],
      subject: `Your site scored ${compliance_score}% — let's fix that.`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error("Failed to send email");
    }

    // Log follow-up in database
    const { error: insertError } = await supabase
      .from("pf_clarity_email_follows")
      .insert({
        site_url,
        user_email,
        scan_id,
        sent_type: "results",
        compliance_score,
        fixable_issues,
        metadata: { total_issues, critical_issues },
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log(`Follow-up email sent to ${user_email} for ${site_url}`);

    return new Response(
      JSON.stringify({ success: true, email_sent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-followup:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
