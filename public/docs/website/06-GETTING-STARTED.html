<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Getting Started — CMPSBL®</title>
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
pre { background: #f8f8f8; padding: 8pt; font-size: 9pt; border-radius: 3pt; overflow-x: auto; }
code { font-family: 'Courier New', monospace; font-size: 9pt; }
blockquote { border-left: 3pt solid #ccc; margin-left: 0; padding-left: 12pt; color: #555; }
</style>
</head>
<body>

<h1>Getting Started</h1>
<p><strong>Quick Start Guide for CMPSBL®</strong></p>

<h2>Choose Your Path</h2>
<table>
<tr><th>Goal</th><th>Time</th><th>Recommended Path</th></tr>
<tr><td><strong>Add memory to existing agent</strong></td><td>&lt; 1 hour</td><td><a href="/docs/persistent-memory">Persistent Memory Quickstart</a></td></tr>
<tr><td><strong>Explore artifacts</strong></td><td>Free</td><td><a href="/store">Composable Artifacts Store</a></td></tr>
<tr><td><strong>Get an AI agent</strong></td><td>$39</td><td><a href="/composable-cognitives">Composable Cognitives</a></td></tr>
<tr><td><strong>Test orchestration patterns</strong></td><td>Free</td><td><a href="/synergies">Synergy Pipelines</a></td></tr>
<tr><td><strong>Unlock all engines</strong></td><td>Subscription</td><td><a href="/pricing">Pricing</a></td></tr>
</table>

<h2>Path 1: Persistent Memory (Recommended)</h2>
<p>Add persistent memory to any existing agent or React app in under an hour. No rewrites. No new framework.</p>

<h3>Step 1: Import the SDK</h3>
<pre><code>import { withPersistentMemory } from '@cmpsbl/memory';</code></pre>

<h3>Step 2: Wrap Your Agent</h3>
<pre><code>const agent = withPersistentMemory({
  agentId: 'my-support-agent',
  scope: 'project'  // or 'session'
});</code></pre>

<h3>Step 3: Use Memory-Aware Responses</h3>
<pre><code>// Get context for any input
const context = await agent.getContext(userMessage);

// Use context in your LLM prompt
const prompt = userMessage + context.contextString;</code></pre>

<h3>React Hook</h3>
<pre><code>import { usePersistentAgent } from '@cmpsbl/memory';

function ChatComponent() {
  const { respond, remember, isLoading } = usePersistentAgent('my-agent');
  
  const handleSend = async (message: string) =&gt; {
    const context = await respond(message);
    // Use context.contextString in your LLM call
  };
}</code></pre>

<h2>Path 2: Full SDK Installation</h2>
<p>For production deployments using the complete substrate.</p>

<h3>Prerequisites</h3>
<ul>
<li>Node.js 18+</li>
<li>API keys for at least one AI provider (OpenAI, Anthropic, etc.)</li>
<li>CMPSBL license (Creator tier or higher)</li>
</ul>

<h3>Initialize the Client</h3>
<pre><code>import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({
  apiKey: process.env.CMPSBL_API_KEY,
  providers: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  }
});</code></pre>

<h3>Store Your First Memory</h3>
<pre><code>await substrate.brain.remember({
  content: 'User prefers dark mode',
  category: 'preference',
  confidence: 0.95
});

const memories = await substrate.brain.recall('user preferences');</code></pre>

<h3>Route an AI Request</h3>
<pre><code>const response = await substrate.nexus.route({
  prompt: 'Summarize this document',
  context: await substrate.brain.recall('document context'),
  optimization: 'quality'
});</code></pre>

<h2>Subscription Tiers</h2>
<table>
<tr><th>Feature</th><th>Free</th><th>Creator ($9/mo)</th><th>Architect ($19/mo)</th><th>Enterprise ($99/mo)</th></tr>
<tr><td>Artifact Store</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Persistent Memory</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Executable Capabilities</td><td>✗</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Cross-Module Orchestration</td><td>✗</td><td>✗</td><td>✓</td><td>✓</td></tr>
<tr><td>Organization Workspaces</td><td>✗</td><td>✗</td><td>✗</td><td>✓</td></tr>
</table>

<h2>API Reference</h2>
<h3>BRAIN Module</h3>
<table>
<tr><th>Method</th><th>Description</th></tr>
<tr><td><code>remember(content)</code></td><td>Store a memory</td></tr>
<tr><td><code>recall(query)</code></td><td>Retrieve relevant memories</td></tr>
<tr><td><code>forget(id)</code></td><td>Remove a memory</td></tr>
<tr><td><code>compress()</code></td><td>Trigger memory compression</td></tr>
</table>

<h3>NEXUS Module</h3>
<table>
<tr><th>Method</th><th>Description</th></tr>
<tr><td><code>route(prompt)</code></td><td>Route to best AI provider</td></tr>
<tr><td><code>providers()</code></td><td>List configured providers</td></tr>
<tr><td><code>status()</code></td><td>Check provider availability</td></tr>
</table>

<h3>VISION Module</h3>
<table>
<tr><th>Method</th><th>Description</th></tr>
<tr><td><code>health()</code></td><td>System health status</td></tr>
<tr><td><code>metrics()</code></td><td>Performance metrics</td></tr>
<tr><td><code>logs(filter)</code></td><td>Filtered log access</td></tr>
</table>

<h2>REST API</h2>
<pre><code># Remember something
curl -X POST https://api.cmpsbl.com/v1/brain/remember \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers dark mode", "category": "preference"}'

# Route a request
curl -X POST https://api.cmpsbl.com/v1/nexus/route \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'</code></pre>

<h2>Support</h2>
<ul>
<li><strong>Documentation:</strong> https://cmpsbl.com/docs</li>
<li><strong>Email:</strong> Dev@CMPSBL.com</li>
<li><strong>Phone:</strong> (760) FLUID-AI</li>
</ul>

<p><em>CMPSBL® — Start Building Smarter AI</em></p>

</body>
</html>
