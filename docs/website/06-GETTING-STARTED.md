# Getting Started

**Quick Start Guide for promptfluid®**

---

## Prerequisites

- Node.js 18+ 
- API keys for at least one AI provider (OpenAI, Anthropic, etc.)
- promptfluid license (Developer tier or higher)

---

## Installation

### Option 1: SDK (Recommended)

```bash
npm install @promptfluid/sdk
```

### Option 2: Direct API

No installation needed — use REST API directly.

---

## Quick Setup

### 1. Initialize the Client

```typescript
import { Substrate } from '@promptfluid/sdk';

const substrate = new Substrate({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  providers: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  }
});
```

### 2. Store Your First Memory

```typescript
// Remember something
await substrate.brain.remember({
  content: 'User prefers dark mode',
  category: 'preference',
  confidence: 0.95
});

// Recall later
const memories = await substrate.brain.recall('user preferences');
// Returns: [{ content: 'User prefers dark mode', ... }]
```

### 3. Route an AI Request

```typescript
// Route to best available provider
const response = await substrate.nexus.route({
  prompt: 'Summarize this document',
  context: await substrate.brain.recall('document context'),
  optimization: 'quality' // or 'speed' or 'cost'
});
```

### 4. Check System Health

```typescript
const health = await substrate.vision.health();
// Returns: { status: 'healthy', uptime: '99.9%', ... }
```

---

## Core Patterns

### Memory Pattern

```typescript
// Store memories with categories
await substrate.brain.remember({
  content: 'Customer Alex prefers email communication',
  category: 'customer_preference',
  tags: ['customer:alex', 'channel:email']
});

// Semantic recall
const preferences = await substrate.brain.recall('how does Alex prefer to be contacted?');
```

### Routing Pattern

```typescript
// Simple routing
const response = await substrate.nexus.route('Hello, how are you?');

// Advanced routing with context
const response = await substrate.nexus.route({
  prompt: 'Analyze this quarterly report',
  context: memories,
  model: 'gpt-4', // optional: force specific model
  fallback: ['claude-3', 'gemini-pro'] // fallback chain
});
```

### Learning Pattern

```typescript
// Record an interaction outcome
await substrate.dream.feedback({
  interactionId: '123',
  outcome: 'success',
  notes: 'Customer was satisfied with response'
});

// Learning happens automatically during dream cycles
```

---

## API Reference

### Brain Module

| Method | Description |
|--------|-------------|
| `remember(content)` | Store a memory |
| `recall(query)` | Retrieve relevant memories |
| `forget(id)` | Remove a memory |
| `compress()` | Trigger memory compression |

### Nexus Module

| Method | Description |
|--------|-------------|
| `route(prompt)` | Route to best AI provider |
| `providers()` | List configured providers |
| `status()` | Check provider availability |

### Vision Module

| Method | Description |
|--------|-------------|
| `health()` | System health status |
| `metrics()` | Performance metrics |
| `logs(filter)` | Filtered log access |

---

## REST API

If you prefer direct API access:

```bash
# Remember something
curl -X POST https://api.promptfluid.com/v1/brain/remember \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers dark mode", "category": "preference"}'

# Route a request
curl -X POST https://api.promptfluid.com/v1/nexus/route \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

---

## Configuration

### Environment Variables

```env
# Required
PROMPTFLUID_API_KEY=your_license_key

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_KEY=...

# Optional
PROMPTFLUID_LOG_LEVEL=info
PROMPTFLUID_MEMORY_TIER=hot
```

### Advanced Configuration

```typescript
const substrate = new Substrate({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  
  // Memory settings
  memory: {
    hotRetention: '7d',
    compressionThreshold: 0.8,
  },
  
  // Routing preferences
  routing: {
    defaultOptimization: 'balanced',
    cacheTTL: '1h',
  },
  
  // Security settings
  security: {
    rateLimit: 1000, // per minute
    auditLog: true,
  }
});
```

---

## Next Steps

| Goal | Resource |
|------|----------|
| Understand capabilities | [Key Capabilities](./03-KEY-CAPABILITIES.md) |
| See real examples | [Use Cases](./04-USE-CASES.md) |
| Deep technical dive | [Architecture](./05-ARCHITECTURE.md) |
| Choose a plan | [Licensing](./07-LICENSING.md) |

---

## Support

- **Documentation:** https://promptfluid.com/docs
- **Email:** support@promptfluid.com
- **Enterprise:** enterprise@promptfluid.com

---

*promptfluid® — Start Building Smarter AI*
