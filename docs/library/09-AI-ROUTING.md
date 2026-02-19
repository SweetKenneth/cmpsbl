<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>AI Routing &amp; Providers — CMPSBL OS Substrate</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}
  h2{font-size:14pt;margin-top:0.4in}
  h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}
  th,td{border:1px solid #ccc;padding:6px 8px}
  th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-size:9pt;overflow-x:auto;border-radius:6px}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>AI Routing &amp; Providers</h1>
<p><strong>Any Model, Any Provider, One Interface</strong></p>
<table>
<tr><td><strong>Document</strong></td><td>09 — AI Routing</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></td></tr>
</table>
<hr />

<h2>The Provider Problem</h2>
<p>Applications built on a single AI provider inherit that provider's constraints: pricing changes, outages, capability gaps, and deprecation schedules. The substrate eliminates this dependency entirely.</p>

<hr />

<h2>How NEXUS Works</h2>
<p>NEXUS is the multi-provider AI routing module. Applications send requests to the substrate; NEXUS determines which provider handles them.</p>

<h3>Routing Decision Factors</h3>
<table>
<tr><th>Factor</th><th>Weight</th><th>Description</th></tr>
<tr><td><strong>Capability match</strong></td><td>Highest</td><td>Does the provider support the requested operation?</td></tr>
<tr><td><strong>Health</strong></td><td>High</td><td>Is the provider currently healthy?</td></tr>
<tr><td><strong>Latency</strong></td><td>Medium</td><td>What's the expected response time?</td></tr>
<tr><td><strong>Cost</strong></td><td>Medium</td><td>What will this request cost?</td></tr>
<tr><td><strong>Load</strong></td><td>Low</td><td>How many active requests does the provider have?</td></tr>
</table>

<h3>Supported Providers</h3>
<table>
<tr><th>Provider</th><th>Models</th><th>Capabilities</th></tr>
<tr><td><strong>OpenAI</strong></td><td>GPT-4, GPT-4o, GPT-3.5</td><td>Text, vision, embeddings, function calling</td></tr>
<tr><td><strong>Anthropic</strong></td><td>Claude 3.5, Claude 3</td><td>Text, vision, long context</td></tr>
<tr><td><strong>Google</strong></td><td>Gemini Pro, Gemini Flash</td><td>Text, vision, multimodal</td></tr>
<tr><td><strong>Mistral</strong></td><td>Mistral Large, Medium, Small</td><td>Text, function calling</td></tr>
<tr><td><strong>Additional</strong></td><td>Extensible</td><td>Any provider with a compatible API</td></tr>
</table>

<h3>Automatic Failover</h3>
<p>If a provider fails, NEXUS automatically marks it as unhealthy, routes to the next best provider, returns the response seamlessly, and monitors for recovery. The user never sees the failover.</p>

<h3>Cost Optimization</h3>
<p>NEXUS tracks per-request costs and can: route to cheaper providers for simple tasks, reserve expensive providers for complex reasoning, alert on budget limits, and generate cost reports by provider, model, and task type.</p>

<hr />

<h2>Provider Abstraction</h2>
<pre>
// The application never knows which provider handles this
const result = await substrate.nexus.route({
  task: "generate",
  prompt: "Summarize this document",
  context: documentText,
});
</pre>
<p>Switching providers requires zero code changes. Add a new API key, and NEXUS includes the new provider in its routing decisions automatically.</p>

<hr />

<p><em>CMPSBL OS Substrate v10.8.0 — Library Documentation</em><br />
<em>Kenneth E Sweet Jr · ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a></em><br />
<em>DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
