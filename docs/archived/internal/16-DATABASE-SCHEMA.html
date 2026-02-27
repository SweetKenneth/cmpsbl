<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Database Schema Reference — CMPSBL OS Substrate</title>
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

<h1>🗄️ Database Schema Reference</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Schema Overview</h2>
<p>The substrate database consists of <strong>50+ tables</strong> organized by domain.</p>

<hr />

<h2>Table Groups</h2>

<h3>ACCESS Domain</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>access_developers</code></td><td>Developer accounts</td><td>✅ Owner-only</td></tr>
<tr><td><code>access_api_keys</code></td><td>API key hashes and metadata</td><td>✅ Owner-only</td></tr>
<tr><td><code>access_subscriptions</code></td><td>Tier subscriptions</td><td>✅ Owner-only</td></tr>
<tr><td><code>access_usage</code></td><td>Per-request usage logs</td><td>✅ Owner-only</td></tr>
<tr><td><code>access_quotas</code></td><td>Daily quota tracking</td><td>✅ Owner-only</td></tr>
<tr><td><code>access_products</code></td><td>Product catalog</td><td>✅ Read-all, Write-admin</td></tr>
<tr><td><code>access_scans</code></td><td>Accessibility scan results</td><td>✅ Owner-only</td></tr>
</table>

<h3>Agency Domain</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>agencies</code></td><td>Agency definitions</td><td>✅ Owner-only</td></tr>
<tr><td><code>agency_members</code></td><td>Agent roster per agency</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_tasks</code></td><td>Task queue</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_task_logs</code></td><td>Execution logs</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_task_artifacts</code></td><td>Output files</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_task_deliverables</code></td><td>Deliverable packages</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_email_queue</code></td><td>Outbound emails</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_dream_memory</code></td><td>Dream synthesis results</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_dream_pool</code></td><td>Shared dream content</td><td>✅ Consent-gated</td></tr>
<tr><td><code>agency_dream_consent</code></td><td>Privacy preferences</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_economics</code></td><td>Cost/value tracking</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_agent_telemetry</code></td><td>Per-agent metrics</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_api_calls</code></td><td>External API call log</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_scheduled_tasks</code></td><td>Scheduled/recurring tasks</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_settings</code></td><td>Agency configuration</td><td>✅ Agency-scoped</td></tr>
<tr><td><code>agency_templates</code></td><td>Pre-built agency types</td><td>✅ Read-all</td></tr>
<tr><td><code>agency_purchases</code></td><td>Purchase records</td><td>✅ Owner-only</td></tr>
</table>

<h3>AI Operations</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>ai_daily_quota</code></td><td>Provider quota tracking</td><td>✅ System-only</td></tr>
<tr><td><code>ai_learning_data</code></td><td>Training/learning data</td><td>✅ System-only</td></tr>
<tr><td><code>ai_usage_log</code></td><td>AI call telemetry</td><td>✅ System-only</td></tr>
</table>

<h3>Cognitive Domain</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>cognitive_registry</code></td><td>Cognitive entity definitions</td><td>✅ Owner-only</td></tr>
<tr><td><code>agent_competency</code></td><td>Agent skill tracking</td><td>✅ Agency-scoped</td></tr>
</table>

<h3>Content Domain</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>auto_blog_posts</code></td><td>Generated blog content</td><td>✅ System + Admin</td></tr>
<tr><td><code>auto_blog_schedule</code></td><td>Content schedule</td><td>✅ System-only</td></tr>
<tr><td><code>autoblog_queue</code></td><td>Content generation queue</td><td>✅ System-only</td></tr>
<tr><td><code>autoblog_drafts</code></td><td>Draft content</td><td>✅ System-only</td></tr>
<tr><td><code>autoblog_runs</code></td><td>Generation run logs</td><td>✅ System-only</td></tr>
</table>

<h3>System Domain</h3>
<table>
<tr><th>Table</th><th>Purpose</th><th>RLS</th></tr>
<tr><td><code>atlas_capabilities</code></td><td>Capability registry</td><td>✅ Read-all, Write-admin</td></tr>
<tr><td><code>audit_logs</code></td><td>System audit trail</td><td>✅ Admin-only</td></tr>
<tr><td><code>accessibility_scans</code></td><td>WCAG scan results</td><td>✅ Owner-only</td></tr>
</table>

<hr />

<h2>Key Relationships</h2>
<div class="card">
<pre>access_developers ─┬── access_api_keys ──── access_quotas
                   ├── access_subscriptions
                   └── access_usage

agencies ─┬── agency_members ──── agent_competency
          ├── agency_tasks ─┬── agency_task_logs
          │                 ├── agency_task_artifacts
          │                 └── agency_task_deliverables
          ├── agency_dream_memory
          ├── agency_dream_pool
          ├── agency_dream_consent
          ├── agency_economics
          ├── agency_settings
          └── agency_purchases</pre>
</div>

<hr />

<h2>RLS Policy Patterns</h2>

<h3>Owner-Only Pattern</h3>
<div class="card">
<pre>CREATE POLICY "owner_access" ON table_name
  FOR ALL USING (auth.uid() = user_id);</pre>
</div>

<h3>Agency-Scoped Pattern</h3>
<div class="card">
<pre>CREATE POLICY "agency_member_access" ON table_name
  FOR ALL USING (
    agency_id IN (
      SELECT a.id FROM agencies a WHERE a.owner_id = auth.uid()
    )
  );</pre>
</div>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>