/**
 * Trial Nudge Email — Re-engagement email for free-tier users
 * Triggered by cron job targeting users who haven't mined in 3+ days
 * Highlights what they're missing + upgrade path
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[TRIAL-NUDGE] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      logStep('No RESEND_API_KEY, skipping');
      return new Response(JSON.stringify({ sent: 0, reason: 'no_resend_key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users who signed up 3+ days ago but haven't had activity in last 3 days
    // and haven't been nudged yet (check analytics_events for nudge_sent)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get users who signed up between 3-7 days ago
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 50,
    });

    if (usersError) {
      logStep('Error listing users', { error: usersError.message });
      throw usersError;
    }

    // Filter to users created 3-7 days ago
    const eligibleUsers = (users?.users ?? []).filter(u => {
      const created = new Date(u.created_at);
      return created < new Date(threeDaysAgo) && created > new Date(sevenDaysAgo) && u.email;
    });

    logStep('Eligible users found', { count: eligibleUsers.length });

    // Check which of these users have already been nudged
    const emails = eligibleUsers.map(u => u.email!);
    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_eligible_users' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Check analytics_events for already-nudged users
    const { data: nudgedEvents } = await supabaseAdmin
      .from('analytics_events')
      .select('label')
      .eq('event_type', 'nudge_email_sent')
      .in('label', emails);

    const alreadyNudged = new Set((nudgedEvents ?? []).map((e: any) => e.label));

    const toNudge = eligibleUsers.filter(u => !alreadyNudged.has(u.email!));
    logStep('Users to nudge', { count: toNudge.length });

    let sentCount = 0;

    for (const user of toNudge) {
      const email = user.email!;
      const displayName = user.user_metadata?.display_name || email.split('@')[0];
      const siteUrl = 'https://cmpsbl.com';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:60px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#000;max-width:600px;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 40px;">
          <div style="display:inline-block;padding:5px 14px;border:1px solid #1a1a1a;border-radius:100px;font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;">
            CMPSBL® · YOUR STREAM IS WAITING
          </div>
        </td></tr>

        <!-- Hero -->
        <tr><td style="text-align:center;padding:0 24px 40px;">
          <h1 style="color:#fff;font-size:36px;font-weight:800;margin:0 0 16px;letter-spacing:-1.5px;line-height:1.1;">
            ${displayName}, your stream<br/>kept running.
          </h1>
          <p style="color:#666;font-size:15px;margin:0;line-height:1.6;max-width:420px;display:inline-block;">
            While you were away, the Memory Stream generated new discoveries. You still have 3 free crystallizations per day waiting to be claimed.
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,transparent);"></div>
        </td></tr>

        <!-- What you missed -->
        <tr><td style="padding:40px;">
          <p style="color:#555;font-size:11px;letter-spacing:3px;margin:0 0 20px;text-transform:uppercase;">WHAT'S WAITING FOR YOU</p>
          
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="font-size:20px;">⚡</div>
              <div>
                <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">3 Daily Crystallizations</p>
                <p style="color:#666;font-size:12px;margin:0;">Mine patterns from the live discovery stream — free, every day.</p>
              </div>
            </div>
          </div>

          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="font-size:20px;">🔬</div>
              <div>
                <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">Fresh Discoveries</p>
                <p style="color:#666;font-size:12px;margin:0;">New patterns scored by quality, novelty, and utility — ready to claim.</p>
              </div>
            </div>
          </div>

          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="font-size:20px;">💎</div>
              <div>
                <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">Upgrade for More</p>
                <p style="color:#666;font-size:12px;margin:0;">Creator tier unlocks 9 daily pulls + 75 vault slots for $29/mo.</p>
              </div>
            </div>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 40px 56px;text-align:center;">
          <a href="${siteUrl}/foundry" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 30px rgba(59,130,246,0.3);">
            Open Memory Stream →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 40px;text-align:center;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:24px;"></div>
          <p style="color:#333;font-size:11px;margin:0 0 4px;letter-spacing:1px;">CMPSBL® · Cognitive Infrastructure</p>
          <p style="color:#2a2a2a;font-size:11px;margin:0;">Reply to this email or reach us at Dev@CMPSBL.com</p>
          <p style="color:#222;font-size:10px;margin:8px 0 0;">
            <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#333;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'CMPSBL <Dev@CMPSBL.com>',
            to: [email],
            subject: `${displayName}, your Memory Stream kept running ⚡`,
            html,
          }),
        });

        if (res.ok) {
          sentCount++;
          // Record that we nudged this user
          await supabaseAdmin.from('analytics_events').insert({
            event_type: 'nudge_email_sent',
            category: 'conversion',
            label: email,
            user_id: user.id,
          });
          logStep('Sent nudge', { email });
        } else {
          const errText = await res.text();
          logStep('Send failed', { email, status: res.status, error: errText });
        }
      } catch (e) {
        logStep('Send error', { email, error: String(e) });
      }

      // Rate limit: small delay between sends
      await new Promise(r => setTimeout(r, 200));
    }

    logStep('Complete', { sent: sentCount, total: toNudge.length });

    return new Response(JSON.stringify({ sent: sentCount, total: toNudge.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
