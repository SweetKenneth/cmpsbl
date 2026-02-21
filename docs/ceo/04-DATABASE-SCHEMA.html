<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CEO Reconstruction — Database Schema</title>
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

<h1>🔐 04 — Database Schema</h1>
<p><strong>Complete Schema for Reconstruction</strong></p>
<hr />

<h2>Required Extensions</h2>
<div class="card">
<pre>CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS vector;      -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- Crypto functions</pre>
</div>

<h2>Table Organization by Module</h2>
<table>
<tr><th>Prefix</th><th>Module</th><th>Key Tables</th></tr>
<tr><td><code>access_</code></td><td>ACCESS</td><td>api_keys, developers, subscriptions, usage, quotas, products, scans</td></tr>
<tr><td><code>agency_</code></td><td>CORTEX</td><td>agencies, members, tasks, task_logs, task_artifacts, task_deliverables, dream_memory, dream_pool, dream_consent, economics, settings, email_queue, scheduled_tasks, purchases, templates, api_calls, agent_telemetry</td></tr>
<tr><td><code>ai_</code></td><td>NEXUS</td><td>usage_log, learning_data, daily_quota</td></tr>
<tr><td><code>audit_</code></td><td>AUDIT</td><td>audit_logs</td></tr>
<tr><td><code>atlas_</code></td><td>SYSTEM</td><td>atlas_capabilities</td></tr>
<tr><td><code>brain_</code></td><td>BRAIN</td><td>memory_hot, memory_warm, memory_cold, memory_archive, memory_meta, memory_contradictions, events, user_fingerprints, graph_edges</td></tr>
<tr><td><code>cognitive_</code></td><td>BRAIN</td><td>cognitive_registry</td></tr>
<tr><td><code>accessibility_</code></td><td>INCLUSIVE</td><td>accessibility_scans</td></tr>
<tr><td><code>auto_blog_</code> / <code>autoblog_</code></td><td>DREAM</td><td>posts, schedule, queue, drafts, runs, settings</td></tr>
<tr><td><code>agent_</code></td><td>CORTEX</td><td>agent_competency</td></tr>
<tr><td><code>evolution_</code></td><td>MODERNIZER</td><td>evolution_runs</td></tr>
<tr><td><code>substrate_</code></td><td>SYSTEM</td><td>substrate_upgrade_plans</td></tr>
<tr><td><code>defense_</code></td><td>DEFENSE</td><td>defense_events</td></tr>
<tr><td><code>edge_</code></td><td>Infrastructure</td><td>edge_rate_limits</td></tr>
<tr><td><code>ip_</code></td><td>DEFENSE</td><td>ip_reputation</td></tr>
<tr><td><code>passkey_</code></td><td>IDENTITY</td><td>passkey_challenges, passkey_credentials</td></tr>
<tr><td><code>pf_</code></td><td>Various</td><td>pf_clarity_api_keys, pf_vault</td></tr>
<tr><td><code>lovable_</code></td><td>Platform</td><td>lovable_ai_usage</td></tr>
<tr><td><code>dream_</code></td><td>DREAM</td><td>dream_rate_limits, dream_learning_metrics</td></tr>
<tr><td><code>user_</code></td><td>AUTH</td><td>user_roles</td></tr>
<tr><td><code>marketplace_</code></td><td>ECONOMY</td><td>marketplace_template_stats, marketplace_user_interests</td></tr>
<tr><td><code>security_</code></td><td>DEFENSE</td><td>security_audit_log</td></tr>
</table>

<h2>Critical Database Functions</h2>

<h3>Memory System</h3>
<ul>
<li><code>calculate_memory_value()</code> — Memory value scoring with recency decay</li>
<li><code>calculate_memory_salience()</code> — Database-side salience calculation</li>
<li><code>run_memory_tiering()</code> — Hot→Warm→Cold demotion/promotion</li>
<li><code>sm2_update_memory()</code> — SM-2 spaced repetition updates</li>
<li><code>detect_memory_contradictions()</code> — Trigram-based contradiction detection</li>
<li><code>apply_confidence_decay()</code> — Age-based confidence reduction</li>
<li><code>compress_warm_memories()</code> — Warm tier text compression</li>
<li><code>vector_memory_search()</code> — Cross-tier vector similarity search</li>
<li><code>get_adaptive_memory_limits()</code> — Dynamic tier capacity</li>
<li><code>track_memory_recall()</code> — Recall hit/miss tracking</li>
<li><code>run_metacognitive_assessment()</code> — Strategy tuning</li>
<li><code>update_user_fingerprint()</code> — User behavior fingerprinting</li>
</ul>

<h3>Evolution System</h3>
<ul>
<li><code>validate_evolution_phase_transition()</code> — Trigger: enforces ordered phase transitions</li>
<li><code>check_single_active_evolution()</code> — Trigger: only one active run at a time</li>
<li><code>resolve_evolution_run()</code> — UUID/prefix lookup</li>
<li><code>resolve_upgrade_plan_id()</code> — Plan ID resolution</li>
</ul>

<h3>Security & Rate Limiting</h3>
<ul>
<li><code>update_ip_reputation()</code> — Server-side IP risk scoring (ignores client input)</li>
<li><code>cleanup_old_rate_limits()</code> — Prune expired rate limit records</li>
<li><code>cleanup_expired_challenges()</code> — Clear WebAuthn challenges</li>
</ul>

<h3>Commerce & Telemetry</h3>
<ul>
<li><code>generate_clarity_api_key()</code> — Secure API key generation with salted hash</li>
<li><code>validate_clarity_api_key()</code> — Key validation and rotation</li>
<li><code>increment_lovable_ai_usage()</code> — AI usage metering</li>
<li><code>increment_agent_telemetry()</code> — Agent performance tracking</li>
<li><code>upsert_dream_learning_metrics()</code> — Dream cycle metrics</li>
<li><code>track_template_interaction()</code> — Marketplace analytics</li>
<li><code>update_agency_economics()</code> — Trigger: auto-update economics on task completion</li>
</ul>

<h3>Auth & Roles</h3>
<ul>
<li><code>has_role(user_id, role)</code> — Role-based access check</li>
<li><code>has_role(role_name)</code> — Current user role check</li>
<li><code>update_agent_skill_level()</code> — Trigger: auto-calculate skill tiers</li>
</ul>

<h2>RLS Policy Pattern</h2>
<div class="card">
<pre>-- Standard user-scoped pattern
CREATE POLICY "select_own" ON table FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON table FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agency-scoped pattern (membership lookup)
CREATE POLICY "select_agency" ON agency_tasks FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM agency_members WHERE ...
  ));

-- Public read, admin write
CREATE POLICY "public_read" ON table FOR SELECT USING (true);
CREATE POLICY "admin_write" ON table FOR ALL
  USING (has_role(auth.uid(), 'admin'));</pre>
</div>

<h2>Intentional Public Access</h2>
<p>These tables have public read access by design (showcase cognitive features):</p>
<ul>
<li><code>brain_memory_hot</code> — Public read for cognitive showcase</li>
<li><code>brain_events</code> — Public read for event stream</li>
<li><code>atlas_capabilities</code> — Public read for capability discovery</li>
</ul>
<p>Telemetry/admin tables (audit_logs, defense_events, etc.) are admin-only.</p>

<hr />
<p><em>CMPSBL OS Substrate v10.9.7 — CEO RECONSTRUCTION GUIDE</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
