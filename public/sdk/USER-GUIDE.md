# promptfluid® Substrate User Guide

## v2026.02 — Getting Started with Cognitive Orchestration

Welcome to the promptfluid® Substrate — a cognitive orchestration layer that provides memory, learning, defense, routing, and observability for AI systems.

---

## What is the Substrate?

The promptfluid® Substrate is **not** an AI model or chatbot. It is **infrastructure** — a foundational layer that coordinates AI systems, manages memory, defends against attacks, and learns from every interaction.

### Key Concepts

- **BYOK Architecture**: Bring Your Own Keys — you provide API keys for AI providers, you pay compute costs directly
- **7 Core Modules**: Brain, Decode, Defense, Nexus, Vision, Dream, System
- **Model Agnostic**: Works with OpenAI, Anthropic, Groq, and many others
- **Self-Healing**: Autonomous systems maintain and optimize themselves

---

## The 7 Modules Explained

### 🧠 Brain — Memory & Learning
The cognitive core. Stores memories, runs reflection cycles, and builds knowledge graphs.

**What it does:**
- Stores and retrieves memories with semantic search
- Runs daily reflection cycles to synthesize insights
- Builds knowledge graphs connecting related concepts
- Reinforces successful patterns over time

**Use cases:** Knowledge bases, learning systems, context-aware applications

---

### 💬 Decode — Conversation & Intent
The conversation engine. Parses intent and manages multi-turn dialogue.

**What it does:**
- Natural language chat with session memory
- Intent extraction with confidence scoring
- Dream mode for creative conversations
- Learning from every interaction

**Use cases:** Chatbots, virtual assistants, customer support

---

### 🛡️ Defense — Security & Protection
The security layer. Protects endpoints from bots and attacks.

**What it does:**
- Fingerprint-based bot detection
- IP reputation scoring
- Anomaly detection with statistical analysis
- Rate limiting and threat response

**Use cases:** API protection, fraud prevention, bot defense

---

### ⚡ Nexus — AI Routing
The routing mesh. Directs requests to optimal AI providers.

**What it does:**
- Automatic provider selection based on task
- Failover when providers are down
- Cost optimization across models
- Latency-aware routing

**Use cases:** Multi-model applications, cost-optimized AI

---

### 👁️ Vision — Observability
The monitoring layer. Real-time insight into system health.

**What it does:**
- System health checks and scoring
- Distributed tracing across modules
- AI usage and quota monitoring
- Performance analytics

**Use cases:** Dashboards, monitoring, debugging

---

### 🌙 Dream — Creative Processing
The nocturnal engine. Processes dreams and generates insights.

**What it does:**
- Dream ingestion and classification
- Sentiment analysis
- Pattern extraction
- Mutation cycles for evolution

**Use cases:** Creative AI, insight generation, self-improvement

---

### ⚙️ System — Administration
The control layer. Manages, heals, and maintains the substrate.

**What it does:**
- System status and diagnostics
- Self-healing operations
- Backup and restore
- Version management

**Use cases:** Administration, operations, maintenance

---

## Getting Started

### Step 1: Understand Requirements

This is a **BYOK (Bring Your Own Keys)** system:
- You need a Supabase account (free tier works)
- You need at least one AI provider API key (Groq offers free tier)
- You deploy to your own infrastructure

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Step 3: Get AI Provider Keys

At minimum, you need one of these:
- **Groq** (free tier) — [console.groq.com](https://console.groq.com)
- **OpenAI** — [platform.openai.com](https://platform.openai.com)
- **Anthropic** — [console.anthropic.com](https://console.anthropic.com)

### Step 4: Download the SDK

Get the TypeScript SDK from the developer portal:
- `substrate-client.ts` — The SDK client
- `README.md` — Technical API reference (for developers)
- `USER-GUIDE.md` — This document (for understanding concepts)

### Step 5: Deploy & Configure

Follow the setup instructions in the README.md to:
1. Deploy edge functions to Supabase
2. Configure your API keys as secrets
3. Initialize the SDK in your application

---

## Common Use Cases

### Building a Knowledge-Aware Chatbot

Combine **Decode** for conversation with **Brain** for memory:

```
User asks a question
  → Brain.query() finds relevant context
  → Decode.chat() generates response with context
  → Brain.learn() stores the interaction
  → Brain.reflect() synthesizes insights daily
```

### Protecting an API from Bots

Use **Defense** to analyze every request:

```
Request arrives
  → Defense.analyze() checks fingerprint
  → Defense.reputation() checks IP
  → If risk > threshold: block
  → Else: allow and track
```

### Multi-Model AI Application

Use **Nexus** to route to the best provider:

```
User prompt arrives
  → Nexus.route() selects best model
  → If primary fails: auto-failover
  → Cost and latency tracked
  → Usage logged for billing
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                 │
├─────────────────────────────────────────────────────┤
│                   Substrate SDK                     │
├──────┬──────┬──────┬──────┬──────┬──────┬──────────┤
│Brain │Decode│Defense│Nexus│Vision│Dream │ System   │
├──────┴──────┴──────┴──────┴──────┴──────┴──────────┤
│              pf-substrate Edge Function             │
├─────────────────────────────────────────────────────┤
│                     Supabase                        │
│           (Your Project • Your Keys)                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   AI Providers   │
              │ (YOUR API Keys)  │
              │  OpenAI, Groq,   │
              │ Anthropic, etc.  │
              └──────────────────┘
```

---

## FAQ

### Is this a hosted service?

No. You deploy and run your own instance. We provide the code and documentation.

### Do you charge for AI usage?

No. You pay AI providers directly with your own API keys.

### What's the difference between this and LangChain?

The substrate is infrastructure, not a framework. It provides persistent memory, self-healing, defense, and observability — things frameworks don't typically handle.

### Can I use this for production?

Yes. The substrate is designed for production use with proper monitoring, self-healing, and backup/restore capabilities.

---

## Support

- **Documentation**: [promptfluid.com/documentation](/documentation)
- **Developer Portal**: [promptfluid.com/developers](/developers)
- **Contact**: [promptfluid.com/contact](/contact)

---

## License

**promptfluid® — Cognitive Orchestration Substrate**  
Copyright © 2009-2026 promptfluid. All rights reserved.
