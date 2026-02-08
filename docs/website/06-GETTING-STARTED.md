# Getting Started

**Quick Start Guide for CMPSBL® v8.0.0**

---

## Choose Your Path

| Goal | Time | Recommended Path |
|------|------|------------------|
| **Add memory to existing agent** | < 1 hour | [Persistent Memory Quickstart](/docs/persistent-memory) |
| **Explore capabilities** | Free | [Capability Depot](/capabilities) |
| **Build from templates** | Free | [Template Alley](/marketplace) |
| **Test orchestration patterns** | Free | [Synergy Pipelines](/synergies) |
| **Deploy production engines** | Subscription | [Engine Marketplace](/engines) |

---

## Path 1: Persistent Memory (Recommended)

Add persistent memory to any existing agent or React app in under an hour. No rewrites. No new framework.

### Step 1: Install

```bash
npm install @cmpsbl/memory
```

### Step 2: Wrap Your Agent

```typescript
import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-support-agent',
  scope: 'project'  // or 'session'
});
```

### Step 3: Use Memory-Aware Responses

```typescript
// Get context for any input
const context = await agent.getContext(userMessage);

// Use context in your LLM prompt
const prompt = userMessage + context.contextString;
```

### React Hook

```typescript
import { usePersistentAgent } from '@cmpsbl/memory';

function ChatComponent() {
  const { respond, remember, isLoading } = usePersistentAgent('my-agent');
  
  const handleSend = async (message: string) => {
    const context = await respond(message);
    // Use context.contextString in your LLM call
  };
}
```

[Full Persistent Memory Docs →](/docs/persistent-memory)

---

## Path 2: Full SDK Installation

For production deployments using the complete substrate.

### Prerequisites

- Node.js 18+ 
- API keys for at least one AI provider (OpenAI, Anthropic, etc.)
- CMPSBL license (Developer tier or higher)

### Installation

```bash
npm install @cmpsbl/sdk
```

### Initialize the Client

```typescript
import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({
  apiKey: process.env.CMPSBL_API_KEY,
  providers: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  }
});
```

### Store Your First Memory

```typescript
await substrate.brain.remember({
  content: 'User prefers dark mode',
  category: 'preference',
  confidence: 0.95
});

const memories = await substrate.brain.recall('user preferences');
```

### Route an AI Request

```typescript
const response = await substrate.nexus.route({
  prompt: 'Summarize this document',
  context: await substrate.brain.recall('document context'),
  optimization: 'quality'
});
```

---

## Free Exploration Layers

### Capability Depot (FREE)

Atomic, stateless building blocks for exploration:

```typescript
// Capabilities are free, non-governed, non-persistent
const capability = await depot.load('semantic-analysis');
const result = await capability.execute(input);
// Results are ephemeral - nothing is saved
```

[Explore Capabilities →](/capabilities)

### Template Alley (FREE)

Starting points for learning and remixing:

```typescript
// Templates are free, for learning only
const template = await templates.preview('customer-support');
// Fork, modify, experiment - nothing is canonized
```

[Browse Templates →](/marketplace)

### Synergy Pipelines (FREE)

Exploratory orchestration patterns:

```typescript
// Execute synergy pipelines ephemerally
const result = await cortex.synergy.execute('smart-recall', {
  query: 'user preferences'
});
// Inspection and execution only - no save, no versioning
```

[Try Synergies →](/synergies)

---

## Production Engines

When you need governed, reliable orchestration, upgrade to Engines:

| Feature | Free Layers | Engines |
|---------|-------------|---------|
| Execution | ✓ | ✓ |
| Inspection | ✓ | ✓ |
| Persistence | ✗ | ✓ |
| Versioning | ✗ | ✓ |
| Governance | ✗ | ✓ |
| SLA Guarantees | ✗ | ✓ |

[Engine Marketplace →](/engines)

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

```bash
# Remember something
curl -X POST https://api.cmpsbl.com/v1/brain/remember \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers dark mode", "category": "preference"}'

# Route a request
curl -X POST https://api.cmpsbl.com/v1/nexus/route \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

---

## Configuration

### Environment Variables

```env
# Required for SDK
CMPSBL_API_KEY=your_license_key

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_KEY=...

# Optional
CMPSBL_LOG_LEVEL=info
CMPSBL_MEMORY_TIER=hot
```

---

## Next Steps

| Goal | Resource |
|------|----------|
| Add memory to existing agent | [Persistent Memory](/docs/persistent-memory) |
| Explore capabilities | [Capability Depot](/capabilities) |
| Understand architecture | [Architecture](./05-ARCHITECTURE.md) |
| See real examples | [Use Cases](./04-USE-CASES.md) |
| Choose a plan | [Licensing](./07-LICENSING.md) |

---

## Support

- **Documentation:** https://cmpsbl.com/docs
- **Email:** PromptFluid@gmail.com

---

*CMPSBL® — Start Building Smarter AI*
