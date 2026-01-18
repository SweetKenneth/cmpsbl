# promptfluid® Substrate SDK

## v2026.02 — BYOK Cognitive Orchestration

A TypeScript client SDK for the promptfluid® Substrate — a unified API gateway for cognitive AI operations with **Bring Your Own Keys (BYOK)** architecture.

> **BYOK Architecture**: Developers bring their own AI provider API keys and pay their own compute costs directly to providers. Zero LLM costs for substrate operators.

---

## Overview

This SDK provides a client for interacting with the promptfluid® Substrate. It is a **BYOK (Bring Your Own Keys)** system:

- **You** provide your own Supabase project
- **You** deploy the substrate edge functions
- **You** register your own AI provider API keys
- **You** pay your AI costs directly to providers

---

## Installation

```bash
# Copy the SDK file to your project
cp public/sdk/substrate-client.ts src/lib/

# Install dependencies
npm install @supabase/supabase-js
```

---

## Quick Start

```typescript
import SubstrateClient from './lib/substrate-client';

// Initialize client
const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
  developerId: 'your-developer-uuid',
  appId: 'your-app-uuid'
});

// Register your API keys (BYOK)
await substrate.keys.register('openai', 'sk-...');
await substrate.keys.register('anthropic', 'sk-ant-...');

// Use AI with YOUR keys (you pay the provider directly)
const response = await substrate.ai.chat(
  [{ role: 'user', content: 'Hello!' }],
  { provider: 'openai', model: 'gpt-4o' }
);

// Use substrate modules
await substrate.brain.query('search memories', 10);
await substrate.dream.feed('I dreamed of flying...');
```

---

## BYOK Modules

### Keys — API Key Management

```typescript
// Register a provider API key
await substrate.keys.register('openai', 'sk-...', { rateLimitRpm: 60 });

// List registered keys (masked)
await substrate.keys.list();

// Rotate a key
await substrate.keys.rotate('openai', 'sk-new-...');

// Revoke a key
await substrate.keys.revoke('openai');

// Get usage statistics
await substrate.keys.usage('openai', 30); // last 30 days
```

### AI — BYOK AI Calls

```typescript
// Chat completion
await substrate.ai.chat(
  [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Explain quantum computing.' }
  ],
  { 
    provider: 'anthropic', 
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    temperature: 0.7
  }
);

// Simple prompt
await substrate.ai.prompt('Write a haiku about AI', {
  provider: 'groq',
  model: 'llama-3.3-70b-versatile'
});

// Get supported providers
substrate.ai.providers();
```

**Supported Providers:**
- `openai` — GPT-4o, GPT-4o-mini, GPT-4-turbo
- `anthropic` — Claude 3.5 Sonnet, Claude 3 Haiku
- `groq` — Llama 3.3 70B, Mixtral 8x7B
- `together` — Llama 3 70B
- `deepseek` — DeepSeek Chat, DeepSeek Coder
- `mistral` — Mistral Large, Mistral Medium
- `cohere` — Command R+, Command R
- `fireworks` — Llama 3.1 70B
- `hyperbolic` — Llama 3.2 3B
- `cerebras` — Llama 3.1 8B/70B

---

## Extensions Module

```typescript
// Register an extension
await substrate.extensions.register({
  name: 'my-brain-hook',
  version: '1.0.0',
  description: 'Enhances memory queries',
  extension_type: 'brain_hook',
  hook_point: 'pre_query',
  endpoint_url: 'https://my-api.com/hook',
  config: { threshold: 0.8 }
});

// List extensions
await substrate.extensions.list({ type: 'brain_hook', is_enabled: true });

// Enable/disable
await substrate.extensions.enable('extension-uuid');
await substrate.extensions.disable('extension-uuid');

// Invoke an extension
await substrate.extensions.invoke('extension-uuid', { query: 'test' });

// Get hooks by type
await substrate.extensions.hooks('defense_hook');
```

**Extension Types:**
- `brain_hook` — Memory/learning extensions
- `nexus_hook` — AI routing extensions  
- `defense_hook` — Security extensions
- `dream_hook` — Dream processing extensions
- `vision_hook` — Observability extensions
- `custom` — Custom extensions

---

## Integrations Module

```typescript
// Connect an integration
await substrate.integrations.connect({
  name: 'My Stripe',
  integration_type: 'stripe',
  config: { mode: 'live' },
  credentials: { api_key: 'sk_live_...' }
});

// List integrations
await substrate.integrations.list({ type: 'webhook', is_active: true });

// Call integration API
await substrate.integrations.call('integration-uuid', 'customers.list', { limit: 10 });

// Handle webhook
await substrate.integrations.webhook('integration-uuid', webhookPayload);

// Disconnect
await substrate.integrations.disconnect('integration-uuid');
```

**Integration Types:**
- `stripe` — Payments
- `twilio` — SMS/Voice
- `shopify` — E-commerce
- `n8n` — Workflow automation
- `webhook` — Custom webhooks
- `custom` — Custom integrations

---

## Agents Module

```typescript
// Create an agent
await substrate.agents.create({
  name: 'ResearchAgent',
  description: 'Researches topics thoroughly',
  system_prompt: 'You are a research specialist...',
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  tools: ['web_search', 'memory_query'],
  temperature: 0.3
});

// List agents
await substrate.agents.list({ is_active: true });

// Run agents with coordination pattern
await substrate.agents.run(
  ['agent-1-uuid', 'agent-2-uuid'],
  'Research quantum computing advances',
  { 
    pattern: 'debate',  // chain | parallel | supervisor | debate | swarm
    context: { depth: 'comprehensive' }
  }
);

// Get agent events
await substrate.agents.events('agent-uuid', 100);
```

**Coordination Patterns:**
- `chain` — Sequential execution
- `parallel` — Concurrent execution
- `supervisor` — One agent manages others
- `debate` — Agents discuss/argue
- `swarm` — Collaborative swarm intelligence

---

## Apps Module

```typescript
// Register an app
await substrate.apps.register('My App', 'Production app for AI chat');

// List apps
await substrate.apps.list();

// Get app metrics
await substrate.apps.metrics('app-uuid', 30); // last 30 days

// Update app
await substrate.apps.update('app-uuid', { is_active: false });
```

---

## Core Modules

### Brain — Memory & Learning

```typescript
// DEPLOYED ACTIONS
await substrate.brain.query('search term', 10);       // ✅ Search memories
await substrate.brain.remember('content', 'type', 0.9); // ✅ Store memory
await substrate.brain.reflect();                       // ✅ Trigger reflection
await substrate.brain.reinforce('memory_id', 0.1);    // ✅ Boost confidence
await substrate.brain.status();                        // ✅ Module health
await substrate.brain.graphSummary();                  // ✅ Knowledge graph stats
await substrate.brain.sessionReflection(24);          // ✅ Cross-module reflection
```

### Decode — Intent & Chat

```typescript
// DEPLOYED ACTIONS
await substrate.decode.chat('Hello!', 'session-123'); // ✅ Process message
await substrate.decode.intent('What is the weather?'); // ✅ Extract intent
await substrate.decode.dream();                        // ✅ Initiate dream
await substrate.decode.learn('content', 'source');    // ✅ Learn from interaction
await substrate.decode.status();                       // ✅ Module health
```

### Defense — Security

```typescript
// DEPLOYED ACTIONS
await substrate.defense.analyze({ fingerprint: '...' }, '1.2.3.4'); // ✅ Analyze request
await substrate.defense.reputation('1.2.3.4');                      // ✅ IP reputation
await substrate.defense.anomaly('1h');                              // ✅ Detect anomalies
await substrate.defense.anomalyProbe(24);                           // ✅ Z-score detection
await substrate.defense.limits();                                   // ✅ Rate limit status
await substrate.defense.posture();                                  // ✅ Security posture
await substrate.defense.status();                                   // ✅ Module health
```

### Nexus — AI Routing

```typescript
// DEPLOYED ACTIONS
await substrate.nexus.route('Complex task description'); // ✅ Route to best provider
await substrate.nexus.providers();                       // ✅ Available providers
await substrate.nexus.routeStats();                      // ✅ Routing analytics
await substrate.nexus.status();                          // ✅ Module health
// Note: text, image, video available via standalone functions (pf-nexus-text, etc.)
```

### Vision — Observability

```typescript
// DEPLOYED ACTIONS
await substrate.vision.health();         // ✅ System health
await substrate.vision.healthSnapshot(); // ✅ Quick health check
await substrate.vision.metrics();        // ✅ System metrics
await substrate.vision.logs('brain', 50); // ✅ Recent logs
await substrate.vision.dashboard();      // ✅ Dashboard data
await substrate.vision.trace('traceId'); // ✅ Distributed tracing
await substrate.vision.introspection();  // ✅ Deep analysis
await substrate.vision.pulse();          // ✅ Lightweight heartbeat
await substrate.vision.quota();          // ✅ AI usage quota
await substrate.vision.status();         // ✅ Module health
```

### Dream — Dream-Eater

```typescript
// DEPLOYED ACTIONS
await substrate.dream.feed('I dreamed of flying...', 'lucid'); // ✅ Submit dream
await substrate.dream.cycle(true);                              // ✅ Execute dream cycle
await substrate.dream.awaken();                                 // ✅ Awaken Dream-Eater
// Note: interpret, mutate, status planned but not yet in substrate
```

### System — Administration

```typescript
// DEPLOYED ACTIONS
await substrate.system.status();                      // ✅ System status
await substrate.system.health();                      // ✅ Full health check
await substrate.system.diagnostics();                 // ✅ Comprehensive diagnostics
await substrate.system.heal('brain', true);           // ✅ Heal system
await substrate.system.backup({ include_data: true }); // ✅ Create backup
await substrate.system.restore('backup_id');          // ✅ Restore from backup
await substrate.system.version();                     // ✅ Get version
await substrate.system.restart('service');            // ✅ Restart services
```

---

## Response Format

All methods return a consistent response:

```typescript
interface SubstrateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  module?: string;
  action?: string;
  timestamp: string;
}
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| Per IP | 100 req/min |
| Per Authenticated User | 500 req/min |
| Daily per App | 50,000 calls |

---

## Security

- API keys are encrypted at rest using XOR encryption with unique salts
- All requests require developer ID and app ID headers
- RLS policies protect multi-tenant data isolation
- Usage is metered per developer/app/provider

---

## Deployment

1. Deploy the edge functions:
   - `byok-proxy` — BYOK AI routing
   - `extension-registry` — Extension management
   - `integration-bus` — External integrations
   - `agent-mesh` — Multi-agent orchestration
   - `pf-substrate` — Core substrate

2. Set environment variables:
   - `BYOK_ENCRYPTION_SALT` — For key encryption

3. Configure RLS policies (included in migrations)

---

## Documentation

- [Extension Guide](../docs/_archived/osf/09-EXTENSION-GUIDE.md)

---

## License

**promptfluid® — Cognitive Orchestration Substrate**  
Copyright © 2025-2026 promptfluid. All rights reserved.

Contact: promptfluid@gmail.com | (760) FLUID-AI | https://promptfluid.com
