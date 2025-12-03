import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notification_type, user_id, scan_id, data } = await req.json();

    // Get user notification preferences
    const { data: prefs } = await supabase
      .from('pf_clarity_notifications')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Check if notification type is enabled
    const typeEnabled = prefs?.[notification_type] ?? true;
    if (!typeEnabled) {
      return new Response(
        JSON.stringify({ message: 'Notification type disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const email = prefs?.email || data.email;
    if (!email) {
      throw new Error('No email address found');
    }

    let subject = '';
    let html = '';

    switch (notification_type) {
      case 'scan_complete':
        subject = `✅ Clarity Scan Complete - ${data.site_url}`;
        html = `
          <h2>Your accessibility scan is complete!</h2>
          <p><strong>Site:</strong> ${data.site_url}</p>
          <p><strong>Compliance Score:</strong> ${data.compliance_score}%</p>
          <p><strong>Issues Found:</strong> ${data.issues_found}</p>
          <p><strong>Critical Issues:</strong> ${data.critical_issues}</p>
          <a href="${data.dashboard_url}" style="display:inline-block;padding:10px 20px;background:#7A5FFF;color:white;text-decoration:none;border-radius:5px;">View Results</a>
        `;
        break;

      case 'critical_issues':
        subject = `⚠️ Critical Accessibility Issues Detected - ${data.site_url}`;
        html = `
          <h2>Critical accessibility issues require attention</h2>
          <p><strong>Site:</strong> ${data.site_url}</p>
          <p><strong>Critical Issues:</strong> ${data.critical_issues}</p>
          <p>These issues may prevent users with disabilities from accessing your site.</p>
          <a href="${data.dashboard_url}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:white;text-decoration:none;border-radius:5px;">Fix Issues Now</a>
        `;
        break;

      case 'auto_fix_applied':
        subject = `🔧 Auto-Fix Applied - ${data.site_url}`;
        html = `
          <h2>Accessibility issues have been automatically fixed</h2>
          <p><strong>Site:</strong> ${data.site_url}</p>
          <p><strong>Issues Fixed:</strong> ${data.fixed_count}</p>
          <p><strong>New Compliance Score:</strong> ${data.compliance_score}%</p>
          <a href="${data.dashboard_url}" style="display:inline-block;padding:10px 20px;background:#10b981;color:white;text-decoration:none;border-radius:5px;">View Changes</a>
        `;
        break;

      case 'weekly_summary':
        subject = `📊 Weekly Accessibility Summary`;
        html = `
          <h2>Your weekly accessibility report</h2>
          <p><strong>Scans Completed:</strong> ${data.scans_count}</p>
          <p><strong>Average Compliance:</strong> ${data.avg_compliance}%</p>
          <p><strong>Issues Fixed:</strong> ${data.issues_fixed}</p>
          <p><strong>Issues Remaining:</strong> ${data.issues_remaining}</p>
          <a href="${data.dashboard_url}" style="display:inline-block;padding:10px 20px;background:#7A5FFF;color:white;text-decoration:none;border-radius:5px;">View Dashboard</a>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PromptFluid Clarity <clarity@promptfluid.com>',
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend API error: ${await res.text()}`);
    }

    // Log notification
    await supabase.from('pf_clarity_notification_log').insert({
      user_id,
      notification_type,
      scan_id,
      status: 'sent',
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Notification error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
