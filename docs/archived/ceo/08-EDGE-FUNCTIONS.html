<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CEO Reconstruction — Edge Functions</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}h2{font-size:14pt;margin-top:0.4in}h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}ul,ol{margin-left:0.25in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-family:"Courier New",monospace;font-size:10pt;overflow-x:auto;white-space:pre;margin:0.15in 0}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>🔐 08 — Edge Functions</h1>
<p><strong>Backend Function Layer — Deployment & Security</strong></p>
<hr />

<p><strong>Note:</strong> Per project custom knowledge, many edge functions in this project are archived/legacy and are NOT part of the active substrate. Only functions that have been explicitly repurposed for substrate use are active. Archived functions that have been repurposed can be deleted.</p>

<h2>Edge Function Architecture</h2>
<ul>
<li>Runtime: Deno (Supabase Edge Functions)</li>
<li>Deployed automatically via Lovable Cloud</li>
<li>Secrets accessed via <code>Deno.env.get('KEY_NAME')</code></li>
<li>Service role key available for admin operations</li>
</ul>

<h2>Security Middleware Pattern</h2>
<div class="card">
<pre>// Standard edge function security pattern
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1. CORS preflight
if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

// 2. Rate limiting (check edge_rate_limits table)
// 3. IP reputation check (update_ip_reputation())
// 4. Auth validation (verify JWT or API key)
// 5. Execute business logic
// 6. Audit logging (async, non-blocking)</pre>
</div>

<h2>Key Active Functions</h2>
<p>Functions actively used by the substrate (check <code>supabase/functions/</code> directory for current inventory). Active functions generally handle:</p>
<ul>
<li>AI provider routing (NEXUS)</li>
<li>Webhook processing (RELAY)</li>
<li>Authentication ceremonies (IDENTITY — WebAuthn)</li>
<li>Payment processing (ECONOMY — Stripe)</li>
<li>Email delivery (RELAY — Resend)</li>
<li>Web scraping (Firecrawl integration)</li>
</ul>

<h2>Function Naming Convention</h2>
<div class="card">
<pre>substrate-{module}-{action}  → Active substrate function
{legacy-name}                → Potentially archived, verify before use</pre>
</div>

<h2>Deployment Notes</h2>
<ul>
<li>Edge functions auto-deploy on code push via Lovable Cloud</li>
<li>No manual deployment needed</li>
<li>Shared utilities go in <code>supabase/functions/_shared/</code></li>
<li>Each function is an independent Deno module</li>
</ul>

<hr />
<p><em>CMPSBL OS Substrate v10.9.7 — CEO RECONSTRUCTION GUIDE</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
