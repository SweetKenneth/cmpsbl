/**
 * pf-agency-send-email v1.0.0
 * 
 * Process email queue and send via Resend:
 * - Task completion notifications
 * - Daily/weekly briefs
 * - Deliverable delivery
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_TEMPLATES = {
  task_complete: {
    subject: (data: any) => `✅ Task Complete: ${data.title}`,
    html: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
    .insights { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .insight-item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .insight-item:last-child { border-bottom: none; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
    .footer { text-align: center; padding: 16px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Task Completed</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">${data.title}</p>
    </div>
    <div class="content">
      <p>Your ${data.taskType} task has been completed successfully.</p>
      
      ${data.insights?.length > 0 ? `
      <div class="insights">
        <h3 style="margin: 0 0 12px;">Key Insights</h3>
        ${data.insights.map((i: string) => `<div class="insight-item">• ${i}</div>`).join('')}
      </div>
      ` : ''}
      
      <p><strong>Execution Time:</strong> ${data.executionTime || 'N/A'}</p>
      <p><strong>Provider:</strong> ${data.provider || 'N/A'}</p>
      
      ${data.viewUrl ? `<a href="${data.viewUrl}" class="btn">View Full Report</a>` : ''}
    </div>
    <div class="footer">
      <p>Powered by Agency AI</p>
    </div>
  </div>
</body>
</html>`,
  },
  daily_brief: {
    subject: () => `📋 Your Daily Agency Brief`,
    html: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0; }
    .stat-box { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .task-list { margin: 16px 0; }
    .task-item { padding: 12px; background: #f8f9fa; margin-bottom: 8px; border-radius: 8px; border-left: 4px solid #667eea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📋 Daily Brief</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${data.tasksCompleted || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.tasksInProgress || 0}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.tasksQueued || 0}</div>
          <div class="stat-label">Queued</div>
        </div>
      </div>
      
      ${data.recentTasks?.length > 0 ? `
      <h3>Recent Completions</h3>
      <div class="task-list">
        ${data.recentTasks.map((t: any) => `
        <div class="task-item">
          <strong>${t.title}</strong>
          <div style="font-size: 14px; color: #666;">${t.task_type} • ${new Date(t.completed_at).toLocaleTimeString()}</div>
        </div>
        `).join('')}
      </div>
      ` : '<p>No tasks completed today.</p>'}
    </div>
  </div>
</body>
</html>`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email send');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pending emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('agency_email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`📧 Processing ${pendingEmails?.length || 0} pending emails`);

    const results = [];

    for (const email of pendingEmails || []) {
      try {
        // Build email content
        let html = email.body_html;
        let subject = email.subject;

        // If using a template
        if (!html && EMAIL_TEMPLATES[email.email_type as keyof typeof EMAIL_TEMPLATES]) {
          const template = EMAIL_TEMPLATES[email.email_type as keyof typeof EMAIL_TEMPLATES];
          subject = template.subject(email.metadata || {});
          html = template.html(email.metadata || {});
        }

        // Send via Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Agency AI <notifications@cmpsbl.com>',
            to: [email.recipient_email],
            subject,
            html: html || email.body_text,
            text: email.body_text,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Resend error: ${response.status} - ${errorData}`);
        }

        const sendResult = await response.json();

        // Mark as sent
        await supabase
          .from('agency_email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: { ...email.metadata, resend_id: sendResult.id },
          })
          .eq('id', email.id);

        results.push({
          id: email.id,
          success: true,
          resendId: sendResult.id,
        });

        console.log(`✅ Email sent to ${email.recipient_email}`);

      } catch (err) {
        console.error(`❌ Failed to send email ${email.id}:`, err);

        // Update retry count
        await supabase
          .from('agency_email_queue')
          .update({
            retry_count: (email.retry_count || 0) + 1,
            error_message: err instanceof Error ? err.message : 'Unknown error',
            status: (email.retry_count || 0) >= 2 ? 'failed' : 'pending',
          })
          .eq('id', email.id);

        results.push({
          id: email.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Email service error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
