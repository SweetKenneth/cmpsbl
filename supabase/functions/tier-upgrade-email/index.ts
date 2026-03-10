/**
 * Tier Upgrade Email — Epic dark cinematic email sent when user upgrades tier
 * Triggered after successful tier-checkout verification
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, withMiddleware, jsonResponse } from "../_shared/edge-middleware.ts";

const TIER_DATA: Record<string, { name: string; pulls: number; vault: string; color: string; price: string }> = {
  creator: { name: 'CREATOR', pulls: 9, vault: '75', color: '#3b82f6', price: '$9/mo' },
  architect: { name: 'ARCHITECT', pulls: 12, vault: 'Unlimited', color: '#8b5cf6', price: '$19/mo' },
  enterprise: { name: 'ENTERPRISE', pulls: 50, vault: 'Unlimited', color: '#f59e0b', price: '$99/mo' },
  studio: { name: 'STUDIO', pulls: 6, vault: '25', color: '#06b6d4', price: '$29/mo' },
};

serve(withMiddleware(async (req) => {
  const { email, name, tier, previous_tier } = await req.json();
  if (!email || !tier) return jsonResponse({ error: 'Missing email or tier' }, 400);

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("[TIER-UPGRADE-EMAIL] No RESEND_API_KEY");
    return jsonResponse({ sent: false, reason: 'no_resend_key' });
  }

  const displayName = name || email.split('@')[0];
  const tierInfo = TIER_DATA[tier] || TIER_DATA.creator;
  const prevTier = previous_tier ? (TIER_DATA[previous_tier]?.name || 'BUILDER') : 'BUILDER';
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
        <tr><td style="text-align:center;padding:0 0 40px;">
          <!-- Tier glow ring -->
          <div style="width:100px;height:100px;margin:0 auto 28px;border-radius:50%;background:radial-gradient(circle,${tierInfo.color}33 0%,${tierInfo.color}11 50%,transparent 70%);display:flex;align-items:center;justify-content:center;">
            <div style="width:64px;height:64px;border-radius:50%;border:2px solid ${tierInfo.color};display:flex;align-items:center;justify-content:center;">
              <div style="font-size:28px;color:${tierInfo.color};">▲</div>
            </div>
          </div>
          <div style="display:inline-block;padding:5px 14px;border:1px solid ${tierInfo.color}44;border-radius:100px;font-size:10px;letter-spacing:3px;color:${tierInfo.color};text-transform:uppercase;margin-bottom:8px;">
            TIER UPGRADED
          </div>
        </td></tr>

        <!-- ═══ HERO ═══ -->
        <tr><td style="text-align:center;padding:0 24px 48px;">
          <h1 style="color:#fff;font-size:44px;font-weight:800;margin:0 0 16px;letter-spacing:-1.5px;line-height:1.05;">
            You're now<br/><span style="color:${tierInfo.color};">${tierInfo.name}.</span>
          </h1>
          <p style="color:#666;font-size:16px;margin:0;line-height:1.6;max-width:420px;display:inline-block;">
            ${displayName}, your substrate just got more powerful.<br/>Everything below is now active.
          </p>
        </td></tr>

        <!-- ═══ TIER TRANSITION ═══ -->
        <tr><td style="padding:0 40px 48px;">
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:28px 24px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40%;text-align:center;vertical-align:middle;">
                  <p style="color:#444;font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">PREVIOUS</p>
                  <p style="color:#555;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">${prevTier}</p>
                </td>
                <td style="width:20%;text-align:center;vertical-align:middle;">
                  <div style="display:inline-block;width:40px;height:40px;border-radius:50%;background:${tierInfo.color}22;line-height:40px;font-size:18px;color:${tierInfo.color};">→</div>
                </td>
                <td style="width:40%;text-align:center;vertical-align:middle;">
                  <p style="color:${tierInfo.color};font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">ACTIVE</p>
                  <p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">${tierInfo.name}</p>
                  <p style="color:#555;font-size:12px;margin:4px 0 0;">${tierInfo.price}</p>
                </td>
              </tr>
            </table>
          </div>
        </td></tr>

        <!-- ═══ GRADIENT DIVIDER ═══ -->
        <tr><td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,${tierInfo.color},transparent);"></div>
        </td></tr>

        <!-- ═══ WHAT'S UNLOCKED ═══ -->
        <tr><td style="padding:48px 40px;">
          <p style="color:#555;font-size:11px;letter-spacing:3px;margin:0 0 24px;text-transform:uppercase;">WHAT'S NOW ACTIVE</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <!-- Pulls -->
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #111;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:36px;height:36px;border-radius:10px;background:${tierInfo.color}15;text-align:center;line-height:36px;font-size:16px;">⚡</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Memory Stream Pulls</p>
                      <p style="color:#555;font-size:12px;margin:0;">${tierInfo.pulls} pulls per day — mine more intelligence</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <span style="color:${tierInfo.color};font-size:20px;font-weight:800;">${tierInfo.pulls}</span>
                      <span style="color:#444;font-size:12px;">/day</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Vault -->
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #111;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:36px;height:36px;border-radius:10px;background:${tierInfo.color}15;text-align:center;line-height:36px;font-size:16px;">🔒</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Vault Storage</p>
                      <p style="color:#555;font-size:12px;margin:0;">${tierInfo.vault} crystallized pipelines in your vault</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <span style="color:${tierInfo.color};font-size:20px;font-weight:800;">${tierInfo.vault === 'Unlimited' ? '∞' : tierInfo.vault}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Exports -->
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #111;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:36px;height:36px;border-radius:10px;background:${tierInfo.color}15;text-align:center;line-height:36px;font-size:16px;">📦</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Artifact Exports</p>
                      <p style="color:#555;font-size:12px;margin:0;">Export crystallized pipelines as deployable artifacts</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <span style="color:#22c55e;font-size:13px;font-weight:600;">UNLOCKED</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Pipeline Slots -->
            <tr>
              <td style="padding:16px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:36px;height:36px;border-radius:10px;background:${tierInfo.color}15;text-align:center;line-height:36px;font-size:16px;">🔧</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Active Runtime Slots</p>
                      <p style="color:#555;font-size:12px;margin:0;">Equip pipelines to active runtime for live execution</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <span style="color:${tierInfo.color};font-size:20px;font-weight:800;">${tierInfo.pulls}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ═══ CTA ═══ -->
        <tr><td style="padding:8px 40px 56px;text-align:center;">
          <a href="${siteUrl}/os" style="display:inline-block;background:linear-gradient(135deg,${tierInfo.color},${tierInfo.color}cc);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 30px ${tierInfo.color}44;">
            Open Substrate OS →
          </a>
          <p style="color:#444;font-size:12px;margin-top:16px;">
            Your new limits are already active. Start mining.
          </p>
        </td></tr>

        <!-- ═══ FOOTER ═══ -->
        <tr><td style="padding:32px 40px;text-align:center;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:24px;"></div>
          <p style="color:#333;font-size:11px;margin:0 0 4px;letter-spacing:1px;">
            CMPSBL® · Cognitive Infrastructure
          </p>
          <p style="color:#2a2a2a;font-size:11px;margin:0;">
            Manage subscription at <a href="${siteUrl}/pricing" style="color:#444;text-decoration:underline;">cmpsbl.com/pricing</a>
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
        subject: `You're now ${tierInfo.name} — Substrate Upgraded`,
        html,
      }),
    });

    const ok = res.ok;
    if (!ok) {
      const errText = await res.text();
      console.error(`[TIER-UPGRADE-EMAIL] Resend error: ${res.status} - ${errText}`);
    } else {
      console.log(`[TIER-UPGRADE-EMAIL] Sent to ${email} for tier ${tier}`);
    }

    // Notify owner
    const { notifyOwnerPurchase } = await import('../_shared/purchase-alert.ts');
    await notifyOwnerPurchase({
      product: `Tier Upgrade → ${tierInfo.name}`,
      customerEmail: email,
      amount: tierInfo.price,
      resendKey: RESEND_API_KEY,
    });

    return jsonResponse({ sent: ok, tier: tierInfo.name });
  } catch (e) {
    console.error('[TIER-UPGRADE-EMAIL] Error:', e);
    return jsonResponse({ sent: false, error: String(e) }, 500);
  }
}));
