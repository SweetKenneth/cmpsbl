# promptfluid® Substrate SDK

**v2026.01 — Cognitive Orchestration Substrate**

## Overview

The promptfluid® Substrate is a unified API gateway for cognitive AI operations. This SDK provides a TypeScript client for integrating with the substrate.

## ⚠️ Important: Bring Your Own Keys (BYOK)

**The substrate is an orchestration layer, not a compute provider.** You must:

1. Deploy your own Supabase project
2. Deploy the `pf-substrate` edge function
3. Provide your own AI provider API keys (Groq, OpenAI, etc.)

The SDK does not include compute resources or API credits.

## Installation

```bash
# Copy the SDK file to your project
cp substrate-client.ts src/lib/

# Install dependencies
npm install @supabase/supabase-js
```

## Quick Start

```typescript
import { SubstrateClient } from './substrate-client';

// Initialize with your Supabase project
const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Set auth token for authenticated operations
substrate.setAuthToken(userJwtToken);

// Use the substrate
const memories = await substrate.brain.query('machine learning', 10);
const reply = await substrate.decode.chat('Hello!', 'session_123');
const response = await substrate.nexus.route('Generate a summary');
```

## Modules

### Brain — Memory & Learning
```typescript
await substrate.brain.learn('New information', 'source');
await substrate.brain.query('search term', 10);
await substrate.brain.remember('content', 'fact', 0.9);
await substrate.brain.reflect();
await substrate.brain.synthesize();
await substrate.brain.graphSummary();
```

### Decode — Chat & Intent
```typescript
await substrate.decode.chat('Hello!', 'session_id');
await substrate.decode.intent('I need help with...');
await substrate.decode.dream();
```

### Defense — Security
```typescript
await substrate.defense.analyze({ fingerprint: {...} }, ip);
await substrate.defense.reputation('192.168.1.1');
await substrate.defense.posture();
await substrate.defense.anomalyProbe(24);
```

### Nexus — AI Routing
```typescript
await substrate.nexus.route('Generate text');
await substrate.nexus.text('Prompt', 'model');
await substrate.nexus.image('Prompt');
await substrate.nexus.providers();
await substrate.nexus.routeStats();
```

### Vision — Observability
```typescript
await substrate.vision.health();
await substrate.vision.healthSnapshot();
await substrate.vision.dashboard();
await substrate.vision.introspection();
await substrate.vision.quota();
```

### Dream — Dream Processing
```typescript
await substrate.dream.feed('Dream content', 'dream');
await substrate.dream.interpret('Dream text');
await substrate.dream.cycle();
await substrate.dream.mutate();
```

### System — Administration
```typescript
await substrate.system.status();
await substrate.system.health();
await substrate.system.heal();
await substrate.system.backup();
```

## Required API Keys

Configure these in your Supabase edge function secrets:

| Key | Provider | Required |
|-----|----------|----------|
| `GROQ_API_KEY` | Groq | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI | Optional |
| `CEREBRAS_API_KEY` | Cerebras | Optional |
| `TOGETHER_API_KEY` | Together | Optional |
| `DEEPSEEK_API_KEY` | DeepSeek | Optional |

## Response Format

All methods return a `SubstrateResponse`:

```typescript
interface SubstrateResponse<T> {
  success: boolean;
  module: string;
  action: string;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Rate Limits

| Scope | Limit |
|-------|-------|
| IP (general) | 100 req / 5 min |
| IP (chat) | 20 req / 5 min |
| Authenticated | 500 req / 5 min |
| Daily | 5000 req / day |

## Deployment

1. Clone the substrate repository
2. Configure your Supabase project
3. Add your API keys to Supabase secrets
4. Deploy edge functions: `supabase functions deploy pf-substrate`
5. Use this SDK to interact with your substrate

## Documentation

- [User Manual](./USER-MANUAL.md)
- [Architecture](./ARCHITECTURE.md)
- [API Reference](./MODULE-ACTIONS-REGISTRY.md)
- [Changelog](./CHANGELOG.md)

## License

promptfluid® — Apache-2.0

## Contact

- **Email**: promptfluid@gmail.com
- **Phone**: (760) FLUID-AI
- **Web**: https://promptfluid.com
