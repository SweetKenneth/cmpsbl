# 03 — Developer Guide

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document provides a quickstart for developers integrating with or building on the CMPSBL cognitive substrate. It covers both development pathways: building natively on the substrate and running Ascension on external software.

---

## 1. Two Development Pathways

CMPSBL supports two primary developer workflows:

### Pathway 1: Build on the Substrate

Build applications, agents, chatbots, or workflows directly on the substrate, using its node capabilities, memory systems, and API endpoints.

### Pathway 2: Ascension

Introduce external software into the substrate as a Candidate Primitive. The system runs discovery cycles against the 40-primitive matrix, and successful interaction chains are crystallized into exportable Ascended Memories.

Both pathways use the same substrate infrastructure. They are complementary, not exclusive.

---

## 2. Getting Started

### Prerequisites

- A CMPSBL account with an active subscription
- A developer API key (generated from the API Access page)

### API Key Generation

1. Navigate to the API Access page (`/api-access`)
2. Complete the developer registration form
3. Copy your generated API key
4. Store it securely — the key is shown only once

### Authentication

All API requests use Bearer token authorization:

```bash
curl -X POST https://api.cmpsbl.com/v1/substrate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "module": "brain", "action": "query", "input": { ... } }'
```

---

## 3. Unified API Gateway

All substrate operations route through a single endpoint:

```
POST https://api.cmpsbl.com/v1/substrate
```

### Request Structure

```json
{
  "module": "brain",
  "action": "query",
  "input": {
    "prompt": "Analyze the architectural patterns in this codebase",
    "context": { ... }
  }
}
```

### Response Structure

```json
{
  "success": true,
  "data": { ... },
  "confidence": 0.92,
  "executionMs": 340,
  "receipt": "receipt_abc123"
}
```

---

## 4. Building on the Substrate

### Using Node Capabilities

Invoke any registered capability through the unified gateway:

```typescript
const response = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    module: 'memory',
    action: 'semantic_search',
    input: {
      query: 'authentication patterns',
      limit: 10,
    },
  }),
});
```

### Using Persistent Memory

Store and recall information with vector search:

```typescript
// Store a memory
await substrate('memory', 'store', {
  content: 'User prefers dark mode and concise responses',
  tags: ['preferences', 'ui'],
  importance: 0.8,
});

// Recall relevant memories
const results = await substrate('memory', 'semantic_search', {
  query: 'user interface preferences',
  limit: 5,
});
```

### Building a Chatbot

```typescript
// Example: Substrate-powered chatbot
async function handleMessage(userMessage: string, sessionId: string) {
  // 1. Recall relevant context
  const context = await substrate('memory', 'semantic_search', {
    query: userMessage,
    limit: 5,
  });

  // 2. Process with reasoning
  const response = await substrate('brain', 'query', {
    prompt: userMessage,
    context: context.data,
    sessionId,
  });

  // 3. Store the interaction
  await substrate('memory', 'store', {
    content: `User: ${userMessage}\nAssistant: ${response.data.reply}`,
    tags: ['conversation', sessionId],
  });

  return response.data.reply;
}
```

---

## 5. Running Ascension

### Lifecycle

```
External Software
    → Ingest into substrate
    → Candidate Primitive
    → Ascension Cycle (discovery against 40-primitive matrix)
    → Capability Discovery (CJPI scoring)
    → Crystallization (score ≥ 68)
    → Ascended Memory
    → Capability Export (with Mini Runtime)
```

### Step 1: Ingest

Upload your software through the Ascension interface (`/x`). Supported inputs include source code files in common programming languages.

Upload limits are tier-gated:

| Plan | Uploads Per Day |
|---|---|
| Builder | 0 (upgrade required) |
| Studio | 3 |
| Creator | 6 |
| Architect | 12 |

### Step 2: Ascension Cycles

Once ingested, your code operates as a Candidate Primitive. The substrate runs discovery cycles, testing interactions between your code and its 40-primitive matrix.

This process is automated and visualized through the Ascension interface's orbital canvas.

### Step 3: Review Discoveries

Discoveries are scored via CJPI. You can review:

- Discovered capability chains
- CJPI scores and tier classifications
- Interaction patterns between your code and substrate primitives

### Step 4: Export

Crystallized discoveries (CJPI ≥ 68) can be exported as standalone Capability Packs. Each export includes the Mini Runtime, documentation, and your choice of target language (gated by score tier).

---

## 6. Subscription Tiers

| Feature | Builder | Studio | Creator | Architect |
|---|---|---|---|---|
| API Access | ✓ | ✓ | ✓ | ✓ |
| Ascension Uploads | — | 3/day | 6/day | 12/day |
| Capability Exports | — | Vault limits | Vault limits | Vault limits |
| Memory Stream Access | Read | Read/Write | Full | Full |

---

## 7. Best Practices

1. **Use semantic memory** — Store meaningful context, not raw data
2. **Leverage discovery** — Let the Memory Stream surface capability patterns
3. **Start with the API** — The unified gateway is the simplest integration path
4. **Check receipts** — Every operation returns an auditable receipt
5. **Respect governance** — Mutations require consent; design for it

---

## Related Documents

- [Substrate Development](13-substrate-development.md)
- [Building Agents & Apps](14-building-agents-and-apps.md)
- [API Reference](15-api-reference.md)
- [Ascension](20-ascension.md)

---

© 2025–2026 CMPSBL®. All rights reserved.
