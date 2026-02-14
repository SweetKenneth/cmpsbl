# Frequently Asked Questions

**Common Questions About CMPSBL®**

---

## General

### What is CMPSBL?

CMPSBL® (Composable) is a cognitive infrastructure layer for AI applications. It provides memory, learning, multi-provider AI routing, security, and self-evolution capabilities that your AI applications can use. Think of it as the "operating system" for AI.

### How is this different from OpenAI or Anthropic?

We don't compete with AI model providers — we make them more valuable. CMPSBL sits between your application and AI providers, adding memory, learning, security, and routing. You can use any AI provider (or multiple) through CMPSBL.

### Do I need to use a specific AI provider?

No. CMPSBL is model-agnostic and provider-agnostic. You can use OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination. We handle routing between them.

### Can the system really improve itself?

Yes. The MODERNIZER module proposes code improvements, which go through confidence gating and (for significant changes) human approval before being applied. The system literally upgrades its own code over time.

---

## Technical

### What technology stack does CMPSBL use?

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** PostgreSQL + Edge Functions (Lovable Cloud)
- **AI:** Model-agnostic, connects to any provider
- **Infrastructure:** Runs on any cloud or on-premise

### Can I self-host CMPSBL?

Yes, with an Enterprise license. Enterprise tier includes source code access and self-hosted deployment rights. Subscription tiers (Creator/Architect) use our secure hosted infrastructure.

### How does memory work?

Memory is stored in a four-tier system:
- **Hot memory:** Recent context, fast access, 127 records, 7-day retention
- **Warm memory:** Frequently accessed, intermediate recall, 2,000 records, 30-day retention
- **Cold memory:** Compressed patterns, long-term storage, 200 records, forever retention
- **Legacy memory:** Archived, rarely accessed, unlimited capacity, forever retention

The system automatically demotes, compresses, and optimizes memory over time. Protected memory types (core identity, principles, safety laws) are locked at 1.0 value with zero decay.

### What about data privacy?

Your data stays on your infrastructure. We never see your memories, prompts, or responses. The substrate runs entirely in your environment.

---

## Business

### How much does it cost?

CMPSBL uses a unified tiered pricing model:

| Tier | Price | What You Get |
|------|-------|--------------|
| **Free** | $0 | Artifact Store, Persistent Memory, Executors, Composition |
| **Creator** | $49/mo | Self-improving apps, 7 Experience Jewels, SDK/API access |
| **Architect** | $149/mo | CLM, cross-project learning, all 28 Experience Jewels |
| **Enterprise** | Custom | Source code, self-hosted, compliance, SLA |

Plus standalone purchases:
- **Composable Cognitives:** $39 each (no account required)
- **Template Generator:** $29 one-time

Plus your own AI provider costs (you pay OpenAI, Anthropic, etc. directly).

### What's included in the license?

All 21 modules (including IDENTITY for passwordless WebAuthn), full documentation, version updates, and support appropriate to your tier. You bring your own AI provider keys and infrastructure.

### Can I use this for commercial products?

Yes. All license tiers allow commercial use. Enterprise tier includes additional features for production deployments.

### Do you offer trials?

The Free tier gives you full access to the Artifact Store, Persistent Memory, and Composition — no credit card required. Enterprise evaluations are available upon request.

---

## Comparison

### How is this different from LangChain?

LangChain is a library — you still build everything yourself. CMPSBL is a complete system. It's the difference between buying lumber vs. buying a pre-built house.

| Aspect | LangChain | CMPSBL |
|--------|-----------|--------|
| Type | Library | Infrastructure |
| Memory | You build it | Built-in, multi-tier |
| Learning | None | Autonomous |
| Security | You build it | Built-in |
| Evolution | None | Self-improving |

### How is this different from Mem0?

Mem0 is focused specifically on memory. CMPSBL includes memory (BRAIN module) plus 20 other integrated modules for routing, security, learning, observability, identity, and more.

### Why haven't others built this?

They have, partially. There are memory solutions, routing solutions, security solutions. No one has integrated them into a coherent cognitive system that self-improves. Integration is hard.

---

## Security

### Is CMPSBL secure for enterprise use?

Yes. Security is built into the core with:
- Rate limiting and bot detection
- Input sanitization
- Access control
- Passwordless WebAuthn authentication (IDENTITY module)
- Complete audit logging
- Compliance-ready patterns (SOC 2, GDPR)

### Where does my data live?

**Subscription tiers (Free/Creator/Architect):** Your data is processed on our secure hosted infrastructure. We follow strict data isolation and never share or use your data for training.

**Enterprise tier:** Full self-hosted deployment — your data stays entirely on your infrastructure.

### How do you handle API keys?

**Subscription tiers:** You provide your AI provider keys via secure environment configuration. Keys are encrypted and never logged.

**Enterprise tier:** Keys are stored in your own environment (environment variables or secrets manager). We never see them.

---

## Getting Started

### How quickly can I get started?

The Free tier requires no signup — start exploring the Artifact Store immediately. Creator and Architect tiers have automated checkout via Stripe.

### What support is available?

- **Free:** Community support, documentation
- **Creator:** Email support, documentation
- **Architect:** Priority email, quarterly technical calls
- **Enterprise:** Dedicated support channel, custom integration help

### Do you offer consulting or custom development?

Yes. Professional services are available for custom integrations, specialized modules, or accelerated implementation.

---

## Contact

| Question Type | Contact |
|---------------|---------|
| **General** | PromptFluid@gmail.com |
| **Web** | https://cmpsbl.com |

---

*CMPSBL® — Questions? We Have Answers.*
