/**
 * One-time preview sender — sends both epic emails via Resend test domain
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return new Response(JSON.stringify({ error: "no key" }), { status: 500 });

  const siteUrl = 'https://cmpsbl.com';
  const tierColor = '#8b5cf6';

  // Welcome email HTML
  const welcomeHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:60px 20px;"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#000;max-width:640px;">
<tr><td style="text-align:center;padding:0 0 48px;">
<div style="width:80px;height:80px;margin:0 auto 32px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.3) 0%,rgba(139,92,246,0.15) 40%,transparent 70%);"></div>
<div style="display:inline-block;padding:5px 14px;border:1px solid #1a1a1a;border-radius:100px;font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;">CMPSBL® · SUBSTRATE ACCESS GRANTED</div>
</td></tr>
<tr><td style="text-align:center;padding:0 24px 48px;">
<h1 style="color:#fff;font-size:42px;font-weight:800;margin:0 0 16px;letter-spacing:-1.5px;line-height:1.1;">Welcome to the<br/>Substrate, Kenneth.</h1>
<p style="color:#666;font-size:16px;margin:0;line-height:1.6;max-width:400px;display:inline-block;">You've entered a system that learns, adapts, and evolves.<br/>Here's what's waiting for you.</p>
</td></tr>
<tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,#06b6d4,transparent);"></div></td></tr>
<tr><td style="padding:48px 40px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:4px;background:linear-gradient(180deg,#3b82f6,#8b5cf6);border-radius:4px;"></td>
<td style="padding:0 0 0 24px;">
<p style="color:#3b82f6;font-size:11px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">YOUR FIRST STOP</p>
<h2 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-0.5px;">The Memory Stream</h2>
<p style="color:#888;font-size:14px;line-height:1.7;margin:0;">A live river of AI-generated patterns flowing through the substrate. Every pattern is scored by quality, novelty, and utility — ready for you to crystallize into reusable pipelines.</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:0 40px 48px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="width:50%;padding:0 8px 16px 0;vertical-align:top;">
<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
<div style="font-size:20px;margin-bottom:8px;">🔬</div>
<p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Browse & Score</p>
<p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Patterns ranked by CJPI — quality, novelty, and market signal.</p>
</div></td>
<td style="width:50%;padding:0 0 16px 8px;vertical-align:top;">
<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
<div style="font-size:20px;margin-bottom:8px;">⚡</div>
<p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Crystallize</p>
<p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Lock a pattern into a permanent, reusable pipeline.</p>
</div></td></tr>
<tr>
<td style="width:50%;padding:0 8px 0 0;vertical-align:top;">
<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
<div style="font-size:20px;margin-bottom:8px;">🧠</div>
<p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">Memory Persists</p>
<p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Your crystallized work stays with you across sessions.</p>
</div></td>
<td style="width:50%;padding:0 0 0 8px;vertical-align:top;">
<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;">
<div style="font-size:20px;margin-bottom:8px;">🛡️</div>
<p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 4px;">3 Free Pulls / Day</p>
<p style="color:#666;font-size:12px;margin:0;line-height:1.5;">Start mining immediately. No credit card required.</p>
</div></td></tr></table>
</td></tr>
<tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);"></div></td></tr>
<tr><td style="padding:48px 40px;">
<p style="color:#555;font-size:11px;letter-spacing:3px;margin:0 0 20px;text-transform:uppercase;">WHERE TO START</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 0;border-bottom:1px solid #111;"><a href="${siteUrl}/start-here" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Start Here <span style="color:#3b82f6;margin-left:4px;">→</span></a><p style="color:#555;font-size:12px;margin:4px 0 0;">Guided walkthrough of the substrate</p></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #111;"><a href="${siteUrl}/foundry" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Memory Stream <span style="color:#8b5cf6;margin-left:4px;">→</span></a><p style="color:#555;font-size:12px;margin:4px 0 0;">Browse and crystallize live patterns</p></td></tr>
<tr><td style="padding:16px 0;"><a href="${siteUrl}/os" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Substrate OS <span style="color:#06b6d4;margin-left:4px;">→</span></a><p style="color:#555;font-size:12px;margin:4px 0 0;">Your command center — dashboard, terminal, all nodes</p></td></tr>
</table></td></tr>
<tr><td style="padding:8px 40px 56px;text-align:center;">
<a href="${siteUrl}/foundry" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 30px rgba(59,130,246,0.3);">Open Memory Stream →</a>
</td></tr>
<tr><td style="padding:32px 40px;text-align:center;">
<div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:24px;"></div>
<p style="color:#333;font-size:11px;margin:0 0 4px;letter-spacing:1px;">CMPSBL® · Cognitive Infrastructure</p>
<p style="color:#2a2a2a;font-size:11px;margin:0;">Questions? Reply to this email or reach us at Dev@CMPSBL.com</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  // Upgrade email HTML
  const upgradeHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:60px 20px;"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#000;max-width:640px;">
<tr><td style="text-align:center;padding:0 0 40px;">
<div style="width:100px;height:100px;margin:0 auto 28px;border-radius:50%;background:radial-gradient(circle,${tierColor}33 0%,${tierColor}11 50%,transparent 70%);"></div>
<div style="display:inline-block;padding:5px 14px;border:1px solid ${tierColor}44;border-radius:100px;font-size:10px;letter-spacing:3px;color:${tierColor};text-transform:uppercase;">TIER UPGRADED</div>
</td></tr>
<tr><td style="text-align:center;padding:0 24px 48px;">
<h1 style="color:#fff;font-size:44px;font-weight:800;margin:0 0 16px;letter-spacing:-1.5px;line-height:1.05;">You're now<br/><span style="color:${tierColor};">ARCHITECT.</span></h1>
<p style="color:#666;font-size:16px;margin:0;line-height:1.6;max-width:420px;display:inline-block;">Kenneth, your substrate just got more powerful.<br/>Everything below is now active.</p>
</td></tr>
<tr><td style="padding:0 40px 48px;">
<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:28px 24px;text-align:center;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:40%;text-align:center;vertical-align:middle;">
<p style="color:#444;font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">PREVIOUS</p>
<p style="color:#555;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">BUILDER</p>
</td>
<td style="width:20%;text-align:center;vertical-align:middle;">
<div style="display:inline-block;width:40px;height:40px;border-radius:50%;background:${tierColor}22;line-height:40px;font-size:18px;color:${tierColor};">→</div>
</td>
<td style="width:40%;text-align:center;vertical-align:middle;">
<p style="color:${tierColor};font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">ACTIVE</p>
<p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">ARCHITECT</p>
<p style="color:#555;font-size:12px;margin:4px 0 0;">$19/mo</p>
</td></tr></table></div>
</td></tr>
<tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,${tierColor},transparent);"></div></td></tr>
<tr><td style="padding:48px 40px;">
<p style="color:#555;font-size:11px;letter-spacing:3px;margin:0 0 24px;text-transform:uppercase;">WHAT'S NOW ACTIVE</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 0;border-bottom:1px solid #111;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;vertical-align:top;"><div style="width:36px;height:36px;border-radius:10px;background:${tierColor}15;text-align:center;line-height:36px;font-size:16px;">⚡</div></td>
<td style="vertical-align:top;padding-left:12px;"><p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Memory Stream Pulls</p><p style="color:#555;font-size:12px;margin:0;">12 pulls per day — mine more intelligence</p></td>
<td style="text-align:right;vertical-align:middle;"><span style="color:${tierColor};font-size:20px;font-weight:800;">12</span><span style="color:#444;font-size:12px;">/day</span></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #111;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;vertical-align:top;"><div style="width:36px;height:36px;border-radius:10px;background:${tierColor}15;text-align:center;line-height:36px;font-size:16px;">🔒</div></td>
<td style="vertical-align:top;padding-left:12px;"><p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Vault Storage</p><p style="color:#555;font-size:12px;margin:0;">Unlimited crystallized pipelines in your vault</p></td>
<td style="text-align:right;vertical-align:middle;"><span style="color:${tierColor};font-size:20px;font-weight:800;">∞</span></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #111;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;vertical-align:top;"><div style="width:36px;height:36px;border-radius:10px;background:${tierColor}15;text-align:center;line-height:36px;font-size:16px;">📦</div></td>
<td style="vertical-align:top;padding-left:12px;"><p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Artifact Exports</p><p style="color:#555;font-size:12px;margin:0;">Export crystallized pipelines as deployable artifacts</p></td>
<td style="text-align:right;vertical-align:middle;"><span style="color:#22c55e;font-size:13px;font-weight:600;">UNLOCKED</span></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;vertical-align:top;"><div style="width:36px;height:36px;border-radius:10px;background:${tierColor}15;text-align:center;line-height:36px;font-size:16px;">🔧</div></td>
<td style="vertical-align:top;padding-left:12px;"><p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;">Active Runtime Slots</p><p style="color:#555;font-size:12px;margin:0;">Equip pipelines to active runtime for live execution</p></td>
<td style="text-align:right;vertical-align:middle;"><span style="color:${tierColor};font-size:20px;font-weight:800;">12</span></td>
</tr></table></td></tr>
</table></td></tr>
<tr><td style="padding:8px 40px 56px;text-align:center;">
<a href="${siteUrl}/os" style="display:inline-block;background:linear-gradient(135deg,${tierColor},${tierColor}cc);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 30px ${tierColor}44;">Open Substrate OS →</a>
<p style="color:#444;font-size:12px;margin-top:16px;">Your new limits are already active. Start mining.</p>
</td></tr>
<tr><td style="padding:32px 40px;text-align:center;">
<div style="height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:24px;"></div>
<p style="color:#333;font-size:11px;margin:0 0 4px;letter-spacing:1px;">CMPSBL® · Cognitive Infrastructure</p>
<p style="color:#2a2a2a;font-size:11px;margin:0;">Manage subscription at <a href="${siteUrl}/pricing" style="color:#444;text-decoration:underline;">cmpsbl.com/pricing</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  const results: Record<string, boolean> = {};
  const emails = [
    { subject: "[PREVIEW] Epic Welcome Email — New Signup", html: welcomeHtml },
    { subject: "[PREVIEW] Epic Tier Upgrade Email — BUILDER → ARCHITECT", html: upgradeHtml },
  ];

  for (let i = 0; i < emails.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 600));
    const em = emails[i];
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "CMPSBL Preview <onboarding@resend.dev>",
          to: ["kennethsweet214@gmail.com"],
          subject: em.subject,
          html: em.html,
        }),
      });
      if (!res.ok) { const t = await res.text(); console.error("Failed: " + t); }
      results[em.subject] = res.ok;
    } catch { results[em.subject] = false; }
  }

  return new Response(JSON.stringify({ sent: results }), {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
  });
});
