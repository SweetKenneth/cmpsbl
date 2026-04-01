# Agent Installation Guide

---

## Overview

Every CMPSBL® export — Agent, Engine, or Ascension bundle — is a self-contained package designed to drop into **any** client stack. This guide covers every supported installation method.

---

## What Ships in Every Export

```
your-export/
├── manifest.json          # Metadata, tier, CJPI score, primitives
├── quickstart.ts          # Run to verify in 10 seconds
├── package.json           # Node.js dependency manifest
├── .env.example           # Required environment variables
├── src/                   # Capabilities and entry points
├── _runtime/              # Sealed CMPSBL Runtime™
├── test/                  # Verification harness
├── docs/
│   ├── guides/            # Markdown integration guides
│   └── html/              # Styled HTML docs + Install Wizard
└── original/              # Your original source (untouched)
```

---

## Three Ways to Install

### 1. Web Install Wizard (Recommended for First-Time)

Open `docs/html/install-wizard.html` in any browser. No server required — it runs entirely offline.

The wizard walks through:
1. **Choose your client** — Node.js, React, Python, or REST
2. **Install** — Copy commands tailored to your environment
3. **Configure** — Environment variables with descriptions
4. **Verify** — Run the quickstart to confirm

### 2. CLI Install Wizard

```bash
# If you have @cmpsbl/cli installed:
cmpsbl install ./path-to-export

# Or from inside the export directory:
cmpsbl install
```

The CLI wizard detects your manifest, asks which client you're targeting, and copies files + runtime into your project automatically.

### 3. Manual Installation

Copy the export into your project and configure environment variables. See the per-client instructions below.

---

## Per-Client Instructions

### Node.js / Bun / Deno

```bash
# Option A: npm install from local path
npm install ./your-export

# Option B: Copy directly
cp -r ./your-export/src ./your-project/lib/agent-name
cp -r ./your-export/_runtime ./your-project/lib/agent-name/_runtime

# Set environment
cp ./your-export/.env.example .env
# Edit .env → add your CMPSBL_API_KEY

# Verify
npx tsx ./your-export/quickstart.ts
```

**Usage:**
```typescript
import { runtime } from './lib/agent-name/src';

const result = await runtime.invoke({ input: 'Hello' });
console.log(result);
```

### React / Next.js / Vite

```bash
# Copy into your source tree
cp -r ./your-export/src ./src/lib/agent-name
cp -r ./your-export/_runtime ./src/lib/agent-name/_runtime

# Add env vars to .env.local
echo "VITE_CMPSBL_API_KEY=pf_live_xxx" >> .env.local
```

**Usage:**
```tsx
import { usePersistentAgent } from './lib/agent-name/src';

function MyComponent() {
  const { respond, isLoading } = usePersistentAgent('my-agent');

  const handleSubmit = async (input: string) => {
    const context = await respond(input);
    // Use context.memories, context.confidence, etc.
  };

  return <div>{/* your UI */}</div>;
}
```

### Python (Bridge Mode)

```bash
# Install the CMPSBL bridge
pip install cmpsbl-bridge

# Copy source files
cp -r ./your-export/src ./your_project/agent_name

# Set environment variable
export CMPSBL_API_KEY=pf_live_xxx
```

**Usage:**
```python
from cmpsbl_bridge import Runtime

runtime = Runtime.from_manifest('./agent_name/manifest.json')
result = runtime.invoke({"input": "Hello"})
print(result)
```

### REST API (Any Language)

Any language that can make HTTP requests can use a CMPSBL export. Deploy the export as a microservice or call the substrate directly.

```bash
# Health check
curl -X POST https://api.cmpsbl.ai/api/v1/substrate \
  -H "Authorization: Bearer pf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"module": "brain", "action": "query", "payload": {"input": "Hello"}}'
```

**Go example:**
```go
resp, err := http.Post("https://api.cmpsbl.ai/api/v1/substrate",
    "application/json",
    strings.NewReader(`{"module":"brain","action":"query","payload":{"input":"Hello"}}`))
```

**Java example:**
```java
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.cmpsbl.ai/api/v1/substrate"))
    .header("Authorization", "Bearer " + apiKey)
    .POST(HttpRequest.BodyPublishers.ofString(payload))
    .build();
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CMPSBL_API_KEY` | ✓ | — | Your API key from cmpsbl.com/api-access |
| `CMPSBL_ENDPOINT` | — | Production | Custom substrate endpoint |
| `CMPSBL_MEMORY_TTL_DAYS` | — | `90` | Memory retention period in days |
| `CMPSBL_MEMORY_DIR` | — | `~/.cmpsbl/memory` | Custom memory storage path |
| `CMPSBL_DREAM_MODE` | — | `passive` | DREAM synthesis: `active` or `passive` |

---

## Memory Tiers (Automatic)

The bundled Persistent Memory Adapter manages data across four tiers:

| Tier | Age | Storage | Notes |
|------|-----|---------|-------|
| **HOT** | < 24h | Cache + disk | Fastest recall |
| **WARM** | 1–7 days | Disk | Standard recall |
| **COLD** | 7–90 days | Gzip compressed | Slower, space-efficient |
| **PURGE** | > 90 days | Deleted | Configurable via `CMPSBL_MEMORY_TTL_DAYS` |

---

## Shared Memory (Multi-Agent)

If you're running multiple agents, enable shared memory:

```typescript
import { withPersistentMemory } from './agent-name/src';

const agent = withPersistentMemory({
  agentId: 'support-bot',
  scope: 'project',  // Shared across agents in the same project
});
```

Each agent gets isolated memory by default. Set `scope: 'project'` for cross-agent recall.

---

## Verification Checklist

After installation, verify:

- [ ] `quickstart.ts` runs without errors
- [ ] `CMPSBL_API_KEY` is set and valid
- [ ] Memory writes persist between restarts
- [ ] Manifest matches expected tier and CJPI score

```bash
# Quick verification (Node.js)
npx tsx quickstart.ts

# Or via CLI
cmpsbl health
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `manifest.json not found` | Run from inside the export directory |
| `CMPSBL_API_KEY not set` | Add to `.env` or `export CMPSBL_API_KEY=...` |
| `Memory directory not writable` | Check permissions on `~/.cmpsbl/memory/` |
| `Bridge import error (Python)` | Run `pip install cmpsbl-bridge` |
| `CORS error (browser)` | Use a backend proxy — don't call substrate from client-side |

---

## Support

- **Email:** support@cmpsbl.com
- **CLI:** `cmpsbl help install`
- **Web:** Open `docs/html/install-wizard.html` from your export

---

© 2025–2026 CMPSBL®. All rights reserved.
