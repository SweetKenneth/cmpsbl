# 14 — Building Agents & Apps

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document provides detailed guidance for building applications, chatbots, copilots, and agents on the CMPSBL cognitive substrate.

---

## 1. Application Patterns

### Chat Application

A conversational interface with persistent memory and contextual reasoning.

```
User Message
    → Memory Recall (semantic search)
    → Context Assembly
    → BRAIN Reasoning
    → Response Generation
    → Memory Storage
    → Contradiction Check
```

### Agent

An autonomous system that executes multi-step tasks with tool access and state management.

```
Task Assignment
    → Context Loading
    → Tool Chain Selection
    → Step-by-Step Execution
    → Failure Recovery (if needed)
    → Result Aggregation
    → Memory Update
    → Confidence Score
```

### Copilot

A human-in-the-loop assistant that suggests actions, provides analysis, and learns from feedback.

```
User Activity
    → Context Recognition
    → Suggestion Generation
    → Confidence Signaling
    → User Decision
    → Outcome Recording
    → Proficiency Update
```

### Workflow Automation

A multi-step process orchestrated across substrate primitives.

```
Trigger Event
    → Intent Broadcast
    → CORTEX Orchestration
    → Parallel Resolver Execution
    → Response Aggregation
    → Conditional Branching
    → Outcome Recording
```

---

## 2. Building a Chatbot

### Minimal Example

```typescript
const API = 'https://api.cmpsbl.com/v1/substrate';

async function chat(userMessage: string, sessionId: string) {
  // Recall relevant memories
  const context = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      module: 'memory',
      action: 'semantic_search',
      input: { query: userMessage, limit: 5 },
    }),
  }).then(r => r.json());

  // Generate response with context
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      module: 'brain',
      action: 'query',
      input: {
        prompt: userMessage,
        context: context.data,
        sessionId,
      },
    }),
  }).then(r => r.json());

  // Store the interaction
  await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      module: 'memory',
      action: 'store',
      input: {
        content: `User: ${userMessage}\nAssistant: ${response.data.reply}`,
        tags: ['conversation', sessionId],
        importance: 0.7,
      },
    }),
  });

  return response.data.reply;
}
```

### Adding Personality

Use prompt scaffolding to give your chatbot a consistent personality:

```typescript
const response = await fetch(API, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    module: 'brain',
    action: 'query',
    input: {
      prompt: userMessage,
      systemPrompt: 'You are a technical writing assistant. Be precise, concise, and helpful.',
      context: context.data,
    },
  }),
}).then(r => r.json());
```

---

## 3. Building an Agent

### Defining Tool Chains

```typescript
// Register a research agent tool chain
const chain = {
  mindId: 'research-agent',
  steps: [
    { tool: 'memory.semantic_search', input: { query: '{{topic}}' } },
    { tool: 'brain.query', input: { prompt: 'Analyze: {{topic}}', context: '{{step_0}}' } },
    { tool: 'memory.store', input: { content: '{{step_1}}', tags: ['research'] } },
  ],
};
```

### Failure Recovery

Define recovery playbooks for known failure modes:

```typescript
// If a step fails, the system classifies the failure and runs recovery
// Categories: network_error, timeout, invalid_input, permission_denied, etc.
// Each category has a defined playbook with retry, fallback, or escalation actions
```

### Session Management

Use context windowing to manage agent memory within sessions:

- **Priority scoring** — Important context entries are retained longer
- **Pinning** — Critical context can be pinned to prevent eviction
- **Window stats** — Monitor context utilization

---

## 4. Building a Copilot

### Confidence Signaling

Every response includes a calibrated confidence score:

```typescript
const result = await invokeResolver('brain', 'query', {
  prompt: 'Should we refactor this module?',
  context: codeAnalysis,
});

// result.confidence → 0.87 (high confidence)
// Use this to decide whether to auto-apply or ask the user
```

### Proficiency Gating

Capabilities can be gated by demonstrated competency:

| Tier | Access Level |
|---|---|
| Novice | Basic queries and lookups |
| Competent | Data modification and analysis |
| Proficient | Multi-step orchestration |
| Expert | System mutation proposals |

---

## 5. Using Engines

For specialized capabilities, use the engine API:

```typescript
// FAILSAFE — standalone utility (copy-paste, zero dependencies)
// S-tier engines — hosted, accessed via engine gateway

const result = await fetch('https://api.cmpsbl.com/v1/engine', {
  method: 'POST',
  headers: { 'X-Engine-Key': ENGINE_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    engine: 'PANDORA',
    action: 'invoke',
    input: { prompt: 'Generate creative solutions for...' },
  }),
}).then(r => r.json());
```

---

## 6. Deployment Options

| Option | Description | Best For |
|---|---|---|
| **API Integration** | Call substrate from your existing app | Adding AI capabilities to existing software |
| **Substrate Native** | Build entirely on the platform | New AI-native applications |
| **Hybrid** | Mix substrate capabilities with your stack | Selective enhancement |
| **Export** | Discover, crystallize, and embed capabilities | Independence from the substrate |

---

## Related Documents

- [Substrate Development](13-substrate-development.md)
- [Developer Guide](03-developer-guide.md)
- [API Reference](15-api-reference.md)
- [Use Cases](10-use-cases.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
