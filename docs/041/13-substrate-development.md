# 13 — Substrate Development

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document explains how to build software directly on the CMPSBL cognitive substrate — apps, agents, chatbots, copilots, and workflows that use the substrate as their runtime.

---

## 1. Overview

CMPSBL is not only for importing software through Ascension. It is a platform for building software directly on the substrate.

When you build on the substrate, you gain access to:

- 40-primitive cognitive matrix
- 940+ registered capabilities
- Persistent memory with vector search
- Intent-based routing
- Governed mutation pipeline
- Real-time mesh telemetry
- Export system for portability

---

## 2. What You Can Build

| Application Type | Key Substrate Features Used |
|---|---|
| **Web Applications** | Memory APIs, BRAIN reasoning, NEXUS routing |
| **Chatbots** | Persistent memory, context windowing, confidence signaling |
| **Copilots** | Tool chain composition, failure recovery, proficiency gating |
| **Agents** | Multi-step orchestration, CORTEX coordination, telemetry |
| **Workflows** | Intent routing, saga orchestration, governance |
| **Analytics Tools** | HARVEST discovery, OBSERVER monitoring, mesh telemetry |
| **Research Platforms** | Memory Stream, Foundry discovery, CJPI scoring |

---

## 3. Development Model

### API-First

All substrate interaction flows through the unified API gateway:

```
POST https://api.cmpsbl.com/v1/substrate
```

Your application sends intents and receives structured responses. The substrate handles routing, execution, telemetry, and audit.

### Stateless Frontend, Stateful Substrate

Your frontend or client can be stateless. The substrate manages all state through persistent memory, session context, and the intent receipt chain.

### Event-Driven

Mesh communications and telemetry events can trigger webhooks, enabling reactive architectures.

---

## 4. Using Node Capabilities

### Invoking a Resolver

```typescript
async function invokeResolver(module: string, action: string, input: object) {
  const response = await fetch('https://api.cmpsbl.com/v1/substrate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ module, action, input }),
  });
  return response.json();
}

// Example: Use BRAIN for reasoning
const result = await invokeResolver('brain', 'query', {
  prompt: 'Summarize the key risks in this contract',
  context: { document: contractText },
});
```

### Chaining Resolvers

Use intent composition to chain multiple node operations:

```typescript
// 1. Search memory for context
const memories = await invokeResolver('memory', 'semantic_search', {
  query: 'previous contract analyses',
  limit: 5,
});

// 2. Analyze with context
const analysis = await invokeResolver('brain', 'query', {
  prompt: 'Analyze this contract',
  context: { document: contractText, priorAnalyses: memories.data },
});

// 3. Score threats
const threats = await invokeResolver('defense', 'threat_score', {
  content: analysis.data.findings,
});

// 4. Store results
await invokeResolver('memory', 'store', {
  content: JSON.stringify(analysis.data),
  tags: ['contract', 'analysis'],
  importance: 0.9,
});
```

---

## 5. Using Persistent Memory

### Storing Information

```typescript
await invokeResolver('memory', 'store', {
  content: 'User prefers concise, technical responses with code examples',
  tags: ['user-preferences', 'style'],
  importance: 0.85,
});
```

### Searching Memory

```typescript
const results = await invokeResolver('memory', 'semantic_search', {
  query: 'how does the user prefer responses formatted',
  limit: 5,
});
// Returns semantically relevant memories ranked by relevance
```

### Contradiction Detection

The memory system automatically detects contradictions when storing new information that conflicts with existing memories.

### Memory Tiers

Memories are automatically managed across tiers based on their Relevance Priority Score (RPS):

- Frequently accessed, high-importance memories are promoted
- Stale, low-relevance memories are demoted
- Below-threshold memories can be hidden (not deleted)

---

## 6. Using Platform Tools

### CodeLab

Interactive development environment for testing resolver interactions and building prototypes. See [CodeLab](16-codelab.md).

### Signal Forge

Blueprint synthesis engine for generating architecture patterns. See [Signal Forge](18-signal-forge.md).

### Dev Academy

Guided learning environment with exercises and progression tracking. See [Dev Academy](17-dev-academy.md).

---

## 7. Deployment Patterns

### Substrate-Hosted

Build your application's logic entirely on the substrate. The frontend is a thin client that sends intents and renders responses.

### Hybrid

Use the substrate for specific capabilities (memory, reasoning, discovery) while maintaining your own application infrastructure for other functions.

### Export and Embed

Discover capabilities through the Memory Stream, crystallize them, and export them as standalone artifacts to embed in your own stack.

---

## 8. Best Practices

1. **Design around intents** — Express actions as intents, not direct function calls
2. **Use semantic memory** — Store meaningful context, not raw data dumps
3. **Leverage existing primitives** — Check available capabilities before building custom logic
4. **Respect governance** — Design for consent gates in mutation workflows
5. **Monitor telemetry** — Use mesh communications for observability
6. **Handle receipts** — Log and verify operation receipts for audit compliance

---

## Related Documents

- [Developer Guide](03-developer-guide.md)
- [Building Agents & Apps](14-building-agents-and-apps.md)
- [API Reference](15-api-reference.md)
- [SDK & API](09-sdk-and-api.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
