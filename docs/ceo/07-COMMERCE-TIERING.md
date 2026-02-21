<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CEO Reconstruction — Commerce & Tiering</title>
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

<h1>🔐 07 — Commerce & Tiering</h1>
<p><strong>Pricing, Tier Gates, Monetization Logic</strong></p>
<hr />

<h2>Subscription Plans</h2>
<table>
<tr><th>Plan</th><th>Monthly</th><th>Yearly</th><th>Engines</th><th>Meta-Engines</th><th>Executions/mo</th></tr>
<tr><td><strong>Free</strong></td><td>$0</td><td>$0</td><td>30</td><td>1</td><td>100</td></tr>
<tr><td><strong>Creator</strong></td><td>$9</td><td>$108</td><td>80</td><td>8</td><td>2,000</td></tr>
<tr><td><strong>Architect</strong></td><td>$19</td><td>$228</td><td>80</td><td>18</td><td>10,000</td></tr>
<tr><td><strong>Enterprise</strong></td><td>$99</td><td>$1,188</td><td>80</td><td>26</td><td>Custom</td></tr>
</table>

<h2>Engine Visibility Tiers</h2>
<table>
<tr><th>Tier</th><th>Required Plan</th><th>Label</th><th>Color</th></tr>
<tr><td>free</td><td>Free</td><td>Free</td><td>emerald-400</td></tr>
<tr><td>standard</td><td>Creator</td><td>Creator</td><td>cyan-400</td></tr>
<tr><td>advanced</td><td>Architect</td><td>Architect</td><td>amber-400</td></tr>
<tr><td>meta</td><td>Architect</td><td>Architect</td><td>primary</td></tr>
<tr><td>internal</td><td>N/A</td><td>Platform</td><td>violet-400</td></tr>
<tr><td>enterprise</td><td>Enterprise</td><td>Enterprise</td><td>rose-400</td></tr>
</table>

<h2>Internal Engines (Not Purchasable)</h2>
<h3>Internal Engines</h3>
<div class="card">
<pre>INTERNAL_ENGINE_IDS = [
  'evolution_engine',
  'modernization_engine',
  'metacognition_engine',
  'self_healing_engine',
  'self_documentation_engine',
  'governor_engine',   // Platform governance
  'immune_engine',     // ENCODE immune system
]</pre>
</div>

<h3>Internal Meta-Engines</h3>
<div class="card">
<pre>INTERNAL_META_ENGINE_IDS = [
  'autonomous_operator',
  'self_governance',
  'world_first_cognitive',
  'world_first_operational',
  'world_first_intelligence',
  'world_first_governance',
  'immune_autonomy_mesh',
  'memory_intelligence_fabric',
]</pre>
</div>

<h2>Free Tier Engines (30)</h2>
<div class="card">
<pre>FREE_ENGINE_IDS = [
  'memory_engine', 'context_engine', 'event_engine', 'learning_engine',
  'resilience_engine', 'optimization_engine', 'orchestration_engine',
  'scheduling_engine', 'adaptation_engine', 'insight_engine',
  'prediction_engine', 'compliance_engine', 'quality_engine',
  'audit_engine', 'defense_engine', 'trust_engine', 'broadcast_engine',
  'routing_engine', 'transformation_engine', 'monitoring_engine',
  'capacity_engine', 'accessibility_engine', 'personalization_engine',
  'graph_engine', 'imagination_engine', 'innovation_engine',
  'dream_engine', 'intent_engine', 'pipeline_engine',
  'coordination_engine', 'salience_engine',
]

FREE_META_ENGINE_IDS = ['cognitive_mesh']</pre>
</div>

<h2>Advanced Tier Engines (Require Architect)</h2>
<div class="card">
<pre>ADVANCED_ENGINE_IDS = [
  'reasoning_engine', 'foresight_engine', 'synthesis_engine',
  'threat_engine', 'attack_surface_engine', 'emotion_engine',
  'multimodal_engine', 'budget_engine', 'quota_engine',
  'entitlement_engine', 'delegation_engine', 'temporal_engine',
]</pre>
</div>

<h2>Monetization Logic</h2>
<div class="card">
<pre>getEngineMonetization(engineId):
  if INTERNAL → { internal, enterprise, isInternal: true }
  if FREE → { free, free, isInternal: false }
  if ADVANCED → { advanced, architect, isInternal: false }
  if includes('enhancement'|'world_first') → { enterprise, enterprise }
  default → { standard, creator }  // Creator tier

getMetaEngineMonetization(metaEngineId):
  if INTERNAL → { internal, enterprise, isInternal: true }
  if FREE → { free, free }
  default → { meta, architect }  // All others = Architect</pre>
</div>

<h2>Key Source File</h2>
<p><code>src/lib/commerce/enginePricing.ts</code> — Complete pricing configuration</p>

<hr />
<p><em>CMPSBL OS Substrate v10.9.7 — CEO RECONSTRUCTION GUIDE</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
