# promptfluid® Substrate Architecture

**v2026.01 — Cognitive Orchestration Substrate for AI Systems**

---

## Overview

promptfluid® is a cognitive orchestration substrate that provides:
- **Routing** — Multi-provider AI model selection
- **Memory** — Persistent knowledge storage and retrieval
- **Learning Cycles** — Continuous improvement from interactions
- **Observability** — Real-time metrics and health monitoring
- **Defense** — Bot detection and threat analysis
- **Execution Coordination** — Unified API for all AI operations

**Model-agnostic. Provider-agnostic. Runs on commodity cloud.**

---

## Core Modules

### 1. Brain
Memory, learning, and reflection engine.

| Action | Description |
|--------|-------------|
| `query` | Search memories by text |
| `remember` | Store new memory |
| `reflect` | Generate daily reflection |
| `reinforce` | Boost memory confidence |
| `dream` | Autonomous processing cycle |
| `status` | Module health check |

### 2. Cascade
User-facing conversational interface.

| Action | Description |
|--------|-------------|
| `chat` | Process user message |
| `learn` | Learn from interaction |
| `status` | Module health check |

### 3. Defense
Bot detection and threat analysis.

| Action | Description |
|--------|-------------|
| `analyze` | Analyze request for threats |
| `reputation` | Get IP reputation score |
| `status` | Module health check |

### 4. Nexus
Multi-provider AI routing.

| Action | Description |
|--------|-------------|
| `route` | Route prompt to best provider |
| `status` | Check available providers |

**Provider Priority:**
1. Groq (llama-3.3-70b-versatile)
2. Cerebras (llama-3.3-70b)
3. Together (Llama-3.1-70B-Instruct-Turbo)
4. DeepSeek (deepseek-chat)

### 5. Vision
Observability and metrics.

| Action | Description |
|--------|-------------|
| `health` | Overall system health |
| `metrics` | System-wide metrics |

---

## API Usage

### Single Endpoint
```
POST /functions/v1/pf-substrate
```

### Request Format
```json
{
  "module": "brain" | "cascade" | "defense" | "nexus" | "vision",
  "action": "<action-name>",
  "data": { <action-parameters> }
}
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-13T..."
}
```

---

## Client SDK

### TypeScript/React
```typescript
import { substrate, brain, cascade, defense, nexus, vision } from '@/lib/substrate';

// Direct module access
await brain.learn('New information', 'user_input');
await cascade.chat('Hello!', 'session_123');
await defense.analyze({ fingerprint: {...} });
await nexus.text('Generate a summary');
await vision.health();

// Generic invoke
await substrate.invoke({
  module: 'brain',
  action: 'query',
  payload: { query_text: 'search term' }
});
```

### React Hooks
```typescript
import { useBrainStatus, useCascadeChat, useVisionHealth } from '@/hooks/useSubstrate';

function MyComponent() {
  const { data: health } = useVisionHealth();
  const { messages, sendMessage } = useCascadeChat();
  
  return <div>Health: {health?.healthScore}%</div>;
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   promptfluid® substrate                    │
│                       v2026.01                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Brain  │  │ Cascade │  │ Defense │  │  Nexus  │        │
│  │ Memory  │  │  Chat   │  │  Bots   │  │ Router  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                         │                                   │
│                    ┌────┴────┐                              │
│                    │ Vision  │                              │
│                    │ Observe │                              │
│                    └─────────┘                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL) │ Edge Functions │ Real-time        │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── lib/
│   ├── substrate.ts         # Core substrate client
│   └── initializeSubstrate.ts
├── hooks/
│   └── useSubstrate.ts      # React hooks
├── components/
│   └── substrate/
│       ├── SubstrateProvider.tsx
│       ├── SubstrateStatus.tsx
│       ├── ModuleCard.tsx
│       └── index.ts
└── pages/
    └── SubstrateDashboard.tsx

supabase/functions/
├── pf-substrate/            # Unified endpoint
│   └── index.ts
└── _archived/
    └── README.md            # Legacy function docs
```

---

## Licensing

**promptfluid®** is a registered trademark.

- **Core Substrate**: Apache-2.0
- **WordPress Plugins**: GPL-2.0

### Contact
- **Founder**: Kenneth E Sweet Jr
- **Email**: promptfluid@gmail.com
- **Phone**: (760) FLUID-AI

---

*A cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud.*
