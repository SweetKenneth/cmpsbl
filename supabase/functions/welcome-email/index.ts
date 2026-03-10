/**
 * Welcome Email — Epic dark cinematic onboarding email
 * Sent to new users on signup via magic link
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:60px 20px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#000;max-width:640px;">

        <!-- ═══ CINEMATIC HEADER ═══ -->
        <tr><td style="text-align:center;padding:0 0 48px;">
          <!-- Glow effect -->
          <div style="width:80px;height:80px;margin:0 auto 32px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.3) 0%,rgba(139,92,246,0.15) 40%,transparent 70%);display:flex;align-items:center;justify-content:center;">
            <div style="width:48px;height:48px;border-radius:50%;border:2px solid rgba(59,130,246,0.6);display:flex;align-items:center;justify-content:center;font-size:20px;">◆</div>
          </div>
          <div style="display:inline-block;padding:5px 14px;border:1px solid #1a1a1a;border-radius:100px;font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;margin-bottom:24px;">
            CMPSBL® · SUBSTRATE ACCESS GRANTED
          </div>
        </td></tr>

        <!-- ═══ HERO ═══ -->
        <tr><td style="text-align:center;padding:0 24px 48px;">
          <h1 style="color:#fff;font-size:42px;font-weight:800;margin:0 0 16px;letter-spacing:-1.5px;line-height:1.1;">
            Welcome to the<br/>Substrate, ${displayName}.
          </h1>
          <p style="color:#666;font-size:16px;margin:0;line-height:1.6;max-width:400px;display:inline-block;">
            You've entered a system that learns, adapts, and evolves.<br/>Here's what's waiting for you.
          </p>
        </td></tr>

        <!-- ═══ GRADIENT DIVIDER ═══ -->
        <tr><td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,#06b6d4,transparent);"></div>
        </td></tr>

        <!-- ═══ THE MEMORY STREAM ═══ -->
        <tr><td style="padding:48px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:4px;background:linear-gradient(180deg,#3b82f6,#8b5cf6);border-radius:4px;"></td>
              <td style="padding:0 0 0 24px;">
                <p style="color:#3b82f6;font-size:11px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">YOUR FIRST STOP</p>
                <h2 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-0.5px;">The Memory Stream</h2>
                <p style="color:#888;font-size:14px;line-height:1.7;margin:0;">
                  A live river of AI-generated patterns flowing through the substrate. Every pattern is scored by quality, novelty, and utility — ready for you to crystallize into reusable pipelines.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ═══ CAPABILITIES GRID ═══ -->
        <tr><td style="padding:0 40px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <!-- Row 1 -->
            <tr>
              <td style="width:50%;padding:0 8px 16px 0;vertical-align:top;">
                <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
                  <div style="font-size:20px;margin-bottom:8px;">🔬</div>
                  <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Browse & Score</p>
                  <p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Patterns ranked by CJPI — quality, novelty, and market signal.</p>
                </div>
              </td>
              <td style="width:50%;padding:0 0 16px 8px;vertical-align:top;">
                <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
                  <div style="font-size:20px;margin-bottom:8px;">⚡</div>
                  <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Crystallize</p>
                  <p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Lock a pattern into a permanent, reusable pipeline.</p>
                </div>
              </td>
            </tr>
            <!-- Row 2 -->
            <tr>
              <td style="width:50%;padding:0 8px 0 0;vertical-align:top;">
                <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
                  <div style="font-size:20px;margin-bottom:8px;">🧠</div>
                  <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Memory Persists</p>
                  <p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Your crystallized work stays with you across sessions.</p>
                </div>
              </td>
              <td style="width:50%;padding:0 0 0 8px;vertical-align:top;">
                <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
                  <div style="font-size:20px;margin-bottom:8px;">🛡️</div>
                  <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">3 Free Pulls / Day</p>
                  <p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Start mining immediately. No credit card required.</p>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ═══ GRADIENT DIVIDER ═══ -->
        <tr><td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);"></div>
        </td></tr>

        <!-- ═══ WHERE TO START ═══ -->
        <tr><td style="padding:48px 40px;">
          <p style="color:#555;font-size:11px;letter-spacing:3px;margin:0 0 20px;text-transform:uppercase;">WHERE TO START</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #111;">
                <a href="${siteUrl}/start-here" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">
                  Start Here <span style="color:#3b82f6;margin-left:4px;">→</span>
                </a>
                <p style="color:#555;font-size:12px;margin:4px 0 0;">Guided walkthrough of the substrate</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #111;">
                <a href="${siteUrl}/foundry" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">
                  Memory Stream <span style="color:#8b5cf6;margin-left:4px;">→</span>
                </a>
                <p style="color:#555;font-size:12px;margin:4px 0 0;">Browse and crystallize live patterns</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <a href="${siteUrl}/os" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">
                  Substrate OS <span style="color:#06b6d4;margin-left:4px;">→</span>
                </a>
                <p style="color:#555;font-size:12px;margin:4px 0 0;">Your command center — dashboard, terminal, all nodes</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ═══ CTA ═══ -->
        <tr><td style="padding:8px 40px 56px;text-align:center;">
          <a href="${siteUrl}/foundry" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 30px rgba(59,130,246,0.3);">
            Open Memory Stream →
          </a>
        </td></tr>

        <!-- ═══ FOOTER ═══ -->
        <tr><td style="padding:32px 40px;text-align:center;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:24px;"></div>
          <p style="color:#333;font-size:11px;margin:0 0 4px;letter-spacing:1px;">
            CMPSBL® · Cognitive Infrastructure
          </p>
          <p style="color:#2a2a2a;font-size:11px;margin:0;">
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
        Authorization: \`Bearer \${RESEND_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CMPSBL <Dev@CMPSBL.com>',
        to: [email],
        subject: 'You\\'re in — Welcome to the Substrate',
        html,
      }),
    });

    const ok = res.ok;
    if (!ok) {
      const errText = await res.text();
      console.error(\`[WELCOME-EMAIL] Resend error: \${res.status} - \${errText}\`);
    } else {
      console.log(\`[WELCOME-EMAIL] Sent to \${email}\`);
    }

    // Notify owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${RESEND_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CMPSBL <Dev@CMPSBL.com>',
        to: ['kennethsweet214@gmail.com'],
        subject: \`🆕 New Signup: \${email}\`,
        html: \`
          <div style="font-family:monospace;background:#0a0a0a;color:#e5e5e5;padding:24px;max-width:400px;">
            <div style="border:1px solid #22c55e;border-radius:8px;padding:4px 12px;display:inline-block;font-size:11px;color:#22c55e;letter-spacing:2px;margin-bottom:16px;">NEW USER</div>
            <p style="font-size:14px;margin:8px 0;"><strong style="color:#fff;">\${email}</strong></p>
            <p style="font-size:12px;color:#888;margin:4px 0;">Name: \${displayName}</p>
            <p style="font-size:12px;color:#888;margin:4px 0;">Time: \${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
          </div>
        \`,
      }),
    }).catch(e => console.error('[WELCOME-EMAIL] Owner notify failed:', e));

    return jsonResponse({ sent: ok });
  } catch (e) {
    console.error('[WELCOME-EMAIL] Error:', e);
    return jsonResponse({ sent: false, error: String(e) }, 500);
  }
}));
