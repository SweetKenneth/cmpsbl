<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>FAQ — CMPSBL®</title>
<style>
@page { size: letter; margin: 0.8in; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; max-width: 7in; margin: auto; }
h1 { font-size: 20pt; border-bottom: 2px solid #1a1a1a; padding-bottom: 4pt; }
h2 { font-size: 14pt; margin-top: 18pt; }
h3 { font-size: 12pt; }
table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
th, td { border: 1px solid #ccc; padding: 5pt 8pt; text-align: left; }
th { background: #f5f5f5; font-weight: bold; }
.card { border: 1px solid #e0e0e0; border-radius: 4pt; padding: 10pt 14pt; margin: 10pt 0; break-inside: avoid; }
</style>
</head>
<body>

<h1>Frequently Asked Questions</h1>
<p><strong>Common Questions About CMPSBL®</strong></p>

<h2>General</h2>

<div class="card">
<h3>What is CMPSBL?</h3>
<p>CMPSBL® (Composable) is a cognitive infrastructure layer for AI applications. It provides memory, learning, multi-provider AI routing, security, and self-evolution capabilities. Think of it as the "operating system" for AI.</p>
</div>

<div class="card">
<h3>How is this different from OpenAI or Anthropic?</h3>
<p>We don't compete with AI model providers — we make them more valuable. CMPSBL sits between your application and AI providers, adding memory, learning, security, and routing. You can use any AI provider (or multiple) through CMPSBL.</p>
</div>

<div class="card">
<h3>Do I need to use a specific AI provider?</h3>
<p>No. CMPSBL is model-agnostic and provider-agnostic. You can use OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination.</p>
</div>

<div class="card">
<h3>Can the system really improve itself?</h3>
<p>Yes. The MODERNIZER module proposes code improvements, which go through confidence gating and (for significant changes) human approval before being applied.</p>
</div>

<h2>Technical</h2>

<div class="card">
<h3>What technology stack does CMPSBL use?</h3>
<ul>
<li><strong>Frontend:</strong> React + TypeScript + Vite + Tailwind</li>
<li><strong>Backend:</strong> PostgreSQL + Edge Functions</li>
<li><strong>AI:</strong> Model-agnostic, connects to any provider</li>
<li><strong>Infrastructure:</strong> Runs on any cloud or on-premise</li>
</ul>
</div>

<div class="card">
<h3>How does memory work?</h3>
<p>Memory is stored in a four-tier system: Hot (127 records, 7 days), Warm (2,000 records, 30 days), Cold (200 records, forever), Legacy (unlimited, forever). The system automatically demotes, compresses, and optimizes memory over time. Protected memory types are locked at 1.0 value with zero decay.</p>
</div>

<h2>Business</h2>

<div class="card">
<h3>How much does it cost?</h3>
<table>
<tr><th>Tier</th><th>Price</th><th>What You Get</th></tr>
<tr><td><strong>Free</strong></td><td>$0</td><td>Artifact Store, Persistent Memory, Composition</td></tr>
<tr><td><strong>Creator</strong></td><td>$9/mo</td><td>Expanded store, executable capabilities, synergy pipelines</td></tr>
<tr><td><strong>Architect</strong></td><td>$19/mo</td><td>Cross-module orchestration, larger memory</td></tr>
<tr><td><strong>Enterprise</strong></td><td>$99/mo</td><td>Organization workspaces, governance, SLA</td></tr>
</table>
<p>Plus standalone: Composable Cognitives ($39 each), Template Generator ($29 one-time).</p>
</div>

<h2>Comparison</h2>

<div class="card">
<h3>How is this different from LangChain?</h3>
<table>
<tr><th>Aspect</th><th>LangChain</th><th>CMPSBL</th></tr>
<tr><td>Type</td><td>Library</td><td>Infrastructure</td></tr>
<tr><td>Memory</td><td>You build it</td><td>Built-in, multi-tier</td></tr>
<tr><td>Learning</td><td>None</td><td>Autonomous</td></tr>
<tr><td>Security</td><td>You build it</td><td>Built-in</td></tr>
<tr><td>Evolution</td><td>None</td><td>Self-improving</td></tr>
</table>
</div>

<h2>Security</h2>

<div class="card">
<h3>Is CMPSBL secure for enterprise use?</h3>
<p>Yes. Security is built into the core: rate limiting, bot detection, input sanitization, passwordless WebAuthn authentication, complete audit logging, compliance-ready patterns (SOC 2, GDPR).</p>
</div>

<h2>Contact</h2>
<table>
<tr><th>Question Type</th><th>Contact</th></tr>
<tr><td><strong>General</strong></td><td>PromptFluid@gmail.com</td></tr>
<tr><td><strong>Web</strong></td><td>https://cmpsbl.com</td></tr>
</table>

<p><em>CMPSBL® — Questions? We Have Answers.</em></p>

</body>
</html>
