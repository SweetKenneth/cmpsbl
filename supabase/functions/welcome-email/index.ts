/**
 * Welcome Email — Sent to new users on signup
 * Introduces Memory Stream and getting started
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, withMiddleware, jsonResponse } from "../_shared/edge-middleware.ts";

serve(withMiddleware(async (req) => {
  const { email, name } = await req.json();
  if (!email) return jsonResponse({ error: 'Missing email' }, 400);

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("[WELCOME-EMAIL] No RESEND_API_KEY");
    return jsonResponse({ sent: false, reason: 'no_resend_key' });
  }

  const displayName = name || email.split('@')[0];
  const siteUrl = 'https://cmpsbl.com';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
        
        <!-- Accent bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4);"></td></tr>
        
        <!-- Header -->
        <tr><td style="padding:48px 40px 24px;text-align:center;">
          <div style="display:inline-block;padding:6px 16px;border:1px solid #333;border-radius:100px;font-size:11px;letter-spacing:2px;color:#888;margin-bottom:16px;">
            CMPSBL® · WELCOME
          </div>
          <h1 style="color:#fff;font-size:28px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;">
            Welcome to the Substrate, ${displayName}.
          </h1>
          <p style="color:#aaa;font-size:16px;margin:0;line-height:1.6;">
            You're in. Here's what matters now.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

        <!-- Memory Stream -->
        <tr><td style="padding:32px 40px;">
          <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 12px;">
            ✦ The Memory Stream
          </h2>
          <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 16px;">
            The Memory Stream is a live feed of AI-generated patterns flowing through the substrate.
            Every pattern is scored, verified, and ready to crystallize into a reusable pipeline.
            Think of it as a river of intelligence you can mine — free tier included.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">🔬</td>
              <td style="padding:6px 8px;color:#ccc;font-size:13px;"><strong style="color:#fff;">Browse patterns</strong> — scored by quality, novelty, and utility</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">⚡</td>
              <td style="padding:6px 8px;color:#ccc;font-size:13px;"><strong style="color:#fff;">Crystallize</strong> — lock a pattern into a reusable pipeline</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">🧠</td>
              <td style="padding:6px 8px;color:#ccc;font-size:13px;"><strong style="color:#fff;">Memory persists</strong> — your crystallized work stays with you</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

        <!-- Getting Started -->
        <tr><td style="padding:32px 40px;">
          <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 16px;">
            Where to Start
          </h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;">
                <a href="${siteUrl}/start-here" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:14px;">
                  Start Here →
                </a>
                <p style="color:#888;font-size:12px;margin:4px 0 0;">Guided walkthrough of the substrate</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <a href="${siteUrl}/foundry" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:14px;">
                  Memory Stream →
                </a>
                <p style="color:#888;font-size:12px;margin:4px 0 0;">Browse and crystallize live patterns</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <a href="${siteUrl}/os" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:14px;">
                  Substrate OS →
                </a>
                <p style="color:#888;font-size:12px;margin:4px 0 0;">Your command center — dashboard, terminal, modules</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 40px 32px;text-align:center;">
          <a href="${siteUrl}/foundry" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
            Open Memory Stream →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="color:#555;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} CMPSBL® · Cognitive Infrastructure
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
        subject: 'Welcome to CMPSBL — Your Memory Stream is live',
        html,
      }),
    });

    const ok = res.ok;
    if (!ok) {
      const errText = await res.text();
      console.error(`[WELCOME-EMAIL] Resend error: ${res.status} - ${errText}`);
    } else {
      console.log(`[WELCOME-EMAIL] Sent to ${email}`);
    }

    // Also notify owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CMPSBL <Dev@CMPSBL.com>',
        to: ['kennethsweet214@gmail.com'],
        subject: `🆕 New Signup: ${email}`,
        html: `
          <div style="font-family:monospace;background:#0a0a0a;color:#e5e5e5;padding:24px;max-width:400px;">
            <div style="border:1px solid #22c55e;border-radius:8px;padding:4px 12px;display:inline-block;font-size:11px;color:#22c55e;letter-spacing:2px;margin-bottom:16px;">NEW USER</div>
            <p style="font-size:14px;margin:8px 0;"><strong style="color:#fff;">${email}</strong></p>
            <p style="font-size:12px;color:#888;margin:4px 0;">Name: ${displayName}</p>
            <p style="font-size:12px;color:#888;margin:4px 0;">Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
          </div>
        `,
      }),
    }).catch(e => console.error('[WELCOME-EMAIL] Owner notify failed:', e));

    return jsonResponse({ sent: ok });
  } catch (e) {
    console.error('[WELCOME-EMAIL] Error:', e);
    return jsonResponse({ sent: false, error: String(e) }, 500);
  }
}));
