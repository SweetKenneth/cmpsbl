# Frequently Asked Questions

**Common Questions About promptfluid®**

---

## General

### What is promptfluid?

promptfluid® is a cognitive infrastructure layer for AI applications. It provides memory, learning, multi-provider AI routing, security, and self-evolution capabilities that your AI applications can use. Think of it as the "operating system" for AI.

### How is this different from OpenAI or Anthropic?

We don't compete with AI model providers — we make them more valuable. promptfluid sits between your application and AI providers, adding memory, learning, security, and routing. You can use any AI provider (or multiple) through promptfluid.

### Do I need to use a specific AI provider?

No. promptfluid is model-agnostic and provider-agnostic. You can use OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination. We handle routing between them.

### Can the system really improve itself?

Yes. The MODERNIZER module proposes code improvements, which go through confidence gating and (for significant changes) human approval before being applied. The system literally upgrades its own code over time.

---

## Technical

### What technology stack does promptfluid use?

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** Model-agnostic, connects to any provider
- **Infrastructure:** Runs on any cloud or on-premise

### Can I self-host promptfluid?

Yes. All license tiers include the ability to deploy on your own infrastructure. You have complete control over where your data lives.

### How does memory work?

Memory is stored in a dual-tier system:
- **Hot memory:** Recent context, fast access, 7-day default retention
- **Cold memory:** Compressed patterns, long-term storage, forever retention

The system automatically compresses and optimizes memory over time.

### What about data privacy?

Your data stays on your infrastructure. We never see your memories, prompts, or responses. The substrate runs entirely in your environment.

---

## Business

### How much does it cost?

Annual licensing:
- **Developer:** $15,000/year
- **Research:** $80,000/year  
- **Enterprise:** $180,000/year
- **Strategic:** Custom

Plus your own AI provider costs (you pay OpenAI, Anthropic, etc. directly).

### What's included in the license?

All 14 modules, full documentation, version updates, and support appropriate to your tier. You bring your own AI provider keys and infrastructure.

### Can I use this for commercial products?

Yes. All license tiers allow commercial use. Enterprise tier includes additional features for production deployments.

### Do you offer trials?

Enterprise evaluations include a 30-day pilot program. Developer licenses have a 30-day money-back guarantee.

---

## Comparison

### How is this different from LangChain?

LangChain is a library — you still build everything yourself. promptfluid is a complete system. It's the difference between buying lumber vs. buying a pre-built house.

| Aspect | LangChain | promptfluid |
|--------|-----------|-------------|
| Type | Library | Infrastructure |
| Memory | You build it | Built-in, multi-tier |
| Learning | None | Autonomous |
| Security | You build it | Built-in |
| Evolution | None | Self-improving |

### How is this different from Mem0?

Mem0 is focused specifically on memory. promptfluid includes memory (BRAIN module) plus 13 other integrated modules for routing, security, learning, observability, and more.

### Why haven't others built this?

They have, partially. There are memory solutions, routing solutions, security solutions. No one has integrated them into a coherent cognitive system that self-improves. Integration is hard.

---

## Security

### Is promptfluid secure for enterprise use?

Yes. Security is built into the core with:
- Rate limiting and bot detection
- Input sanitization
- Access control
- Complete audit logging
- Compliance-ready patterns (SOC 2, GDPR)

### Where does my data live?

On your infrastructure. promptfluid is self-hosted — your data never leaves your control.

### How do you handle API keys?

Your AI provider keys are stored in your own environment (environment variables or secrets manager). We never see them.

---

## Getting Started

### How quickly can I get started?

Developer tier has automated checkout — you can start building within an hour of signing up.

### What support is available?

- **Developer:** Email support, documentation, community forum
- **Research:** Priority email, quarterly technical calls
- **Enterprise:** Dedicated support channel, custom integration help

### Do you offer consulting or custom development?

Yes. Professional services are available for custom integrations, specialized modules, or accelerated implementation.

---

## Contact

| Question Type | Contact |
|---------------|---------|
| General | promptfluid@gmail.com |
| Sales | sales@promptfluid.com |
| Enterprise | enterprise@promptfluid.com |
| Technical | support@promptfluid.com |

---

*promptfluid® — Questions? We Have Answers.*
