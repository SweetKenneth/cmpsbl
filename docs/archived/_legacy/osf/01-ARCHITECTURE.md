# promptfluid substrate — Architecture Overview

## v2026.01 — Cognitive Orchestration Substrate for AI Systems

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-ARCH-001 |
| Version | 2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Citation | Sweet Jr, K. E. (2026). promptfluid Architecture. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

promptfluid is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

Unlike monolithic AI systems, promptfluid separates concerns into discrete, composable modules that communicate through a unified message bus and shared memory layer.

### 1.1 Design Philosophy

The architecture embodies five core principles:

1. **Cognitive Fluidity** — No rigid structures; every component adapts based on context, load, and learned patterns
2. **Model Agnosticism** — Intelligence layer is decoupled from any specific model or provider
3. **Zero-Friction Orchestration** — Complexity is hidden from consumers while remaining accessible to developers
4. **Perpetual Learning** — Systems observe, adapt, and improve autonomously without human intervention
5. **Substrate Thinking** — Built as a foundation for others to extend, not a closed product

### 1.2 Scope

This document covers:
- High-level system topology
- Module responsibilities and boundaries
- Inter-module communication patterns
- Data flow pipelines
- Deployment topology

---

## 2. System Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VISION (Control Plane)                         │
│                    Unified Dashboard & Real-Time Observability           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                              CORE (Kernel)                               │
│              Gateway, Authentication, Configuration, Health              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼────┐               ┌────▼────┐               ┌─────▼─────┐
    │  BRAIN  │               │ DEFENSE │               │   NEXUS   │
    │(Cascade)│               │ (Shield)│               │ (Gateway) │
    │ Memory  │               │ Threats │               │ Routing   │
    └────┬────┘               └────┬────┘               └─────┬─────┘
         │                         │                          │
         └─────────────────────────┴────────────┬─────────────┘
                                                │
                     ┌──────────────────────────▼──────────────────────────┐
                     │                   RIPPLE (Mesh)                      │
                     │           Queue Management & API Routing             │
                     └──────────────────────────┬──────────────────────────┘
                                                │
              ┌─────────────────────────────────┼─────────────────────────────┐
              │                                 │                             │
         ┌────▼────┐                       ┌───▼───┐                    ┌────▼────┐
         │ STUDIO  │                       │ACCESS │                    │MARKETING│
         │(Builder)│                       │(Auth) │                    │ (Growth)│
         └─────────┘                       └───────┘                    └─────────┘
```

---

## 3. Module Specifications

### 3.1 Vision (Control Plane)

**Purpose:** Unified observability dashboard for system-wide monitoring, analytics, and administrative control.

| Attribute | Value |
|-----------|-------|
| Function Count | 15 |
| Primary Tables | `pf_logs`, `pf_core_health`, `core_usage` |
| Real-time | WebSocket streams for logs and metrics |
| Access Level | Admin only |

**Capabilities:**
- Real-time log streaming across all modules
- Module health monitoring with 60-second intervals
- Cost tracking per AI provider
- Performance analytics and trend visualization
- System-wide configuration management

### 3.2 Core (Kernel)

**Purpose:** Central coordination layer handling routing, authentication, configuration, and system bootstrap.

| Attribute | Value |
|-----------|-------|
| Function Count | 14 |
| Primary Tables | `core_settings`, `core_subscriptions`, `audit_logs` |
| Authentication | Supabase Auth (JWT) |
| Configuration | Environment-based with database overrides |

**Key Endpoints:**
- `pf-core-gateway` — Universal routing to all modules
- `pf-core-admin` — Administrative operations
- `pf-system-status` — Health check aggregation
- `pf-core-keys` — API key generation and validation

### 3.3 Brain (Cascade)

**Purpose:** Persistent memory layer with autonomous learning, reflection cycles, and "dreaming" capabilities.

| Attribute | Value |
|-----------|-------|
| Function Count | 45+ |
| Primary Tables | `brain_memory_hot`, `brain_memory_cold`, `brain_graph_edges`, `cascade_dreams` |
| Memory Tiers | Hot (90-day), Cold (permanent compressed) |
| Learning Mode | Continuous + scheduled deep reflection |

**Unique Capabilities:**
- Autonomous dream cycles during off-peak hours
- Knowledge graph with weighted edges and reinforcement learning
- Cross-instance learning via Shared Dream Protocol
- Self-directed curiosity exploration

**See:** [02-BRAIN-SUBSTRATE.md](./02-BRAIN-SUBSTRATE.md) for complete specification.

### 3.4 Defense (Shield)

**Purpose:** Behavioral bot detection, threat intelligence, and security event processing.

| Attribute | Value |
|-----------|-------|
| Function Count | 35+ |
| Primary Tables | `defense_events`, `ip_reputation`, `defense_rules` |
| Detection Mode | Behavioral analysis (not signature-based) |
| Integrations | WordPress plugins, standalone API |

**Capabilities:**
- Device fingerprinting with multi-factor analysis
- Risk scoring engine (0-100 scale)
- IP reputation tracking with auto-blocklist
- Zero-day bot detection via anomaly learning

**See:** [04-DEFENSE-INTELLIGENCE.md](./04-DEFENSE-INTELLIGENCE.md) for complete specification.

### 3.5 Nexus (Gateway)

**Purpose:** Multi-provider AI routing with intelligent fallback, caching, and cost optimization.

| Attribute | Value |
|-----------|-------|
| Function Count | 4 |
| Primary Tables | `nexus_logs`, `ai_usage_log`, `ai_daily_quota` |
| Providers | Groq, OpenAI, Anthropic, Perplexity, Google, and more |
| Caching | Redis with 90-day TTL |

**Routing Hierarchy:**
1. **Primary:** Fastest available provider for task type
2. **Secondary:** Fallback for general synthesis
3. **Tertiary:** Deep reasoning and ethical evaluation
4. **Research:** Grounding and fact-checking

**See:** [03-NEXUS-ROUTING.md](./03-NEXUS-ROUTING.md) for complete specification.

### 3.6 Ripple (Mesh)

**Purpose:** Async job queue management, rate limit distribution, and service mesh connectivity.

| Attribute | Value |
|-----------|-------|
| Function Count | 4 |
| Primary Tables | `pf_queue_jobs` |
| Queue Types | Immediate, Scheduled, Delayed |
| Retry Logic | Exponential backoff with dead letter queue |

**Capabilities:**
- Background job processing for high-latency operations
- Priority scheduling based on task importance
- Cost-optimized routing across providers
- Webhook routing and event distribution

### 3.7 Studio (Builder)

**Purpose:** AI-powered code generation, project scaffolding, and deployment automation.

| Attribute | Value |
|-----------|-------|
| Function Count | 6 |
| Primary Tables | `studio_connections`, `studio_scans`, `studio_applies` |
| Frameworks | React, Next.js, TypeScript |
| Deployment | E2B sandbox, Vercel, GitHub integration |

### 3.8 Access (Identity)

**Purpose:** Authentication, authorization, API key management, and subscription enforcement.

| Attribute | Value |
|-----------|-------|
| Function Count | 12 |
| Primary Tables | `profiles`, `core_subscriptions`, `bot_sniper_api_keys` |
| OAuth Providers | Google, GitHub, Email |
| Subscription Model | Tiered (Starter, Pro, Studio, Enterprise) |

### 3.9 Marketing (Growth)

**Purpose:** AI-powered content generation, keyword research, and campaign management.

| Attribute | Value |
|-----------|-------|
| Function Count | 20 |
| Primary Tables | `marketing_campaigns`, `auto_blog_posts` |
| Content Types | Blog, Social, Email, Ad, Landing Page |
| Research | AI-powered SEO and competitor analysis |

---

## 4. Inter-Module Communication

### 4.1 Synchronous Patterns

Modules communicate via HTTP REST calls through the Core gateway:

```
Client → Core Gateway → Target Module → Response → Client
```

**Authentication:** All inter-module calls use service role keys for elevated permissions.

### 4.2 Asynchronous Patterns

Long-running operations use the Ripple queue:

```
Client → Ripple Queue → Worker Process → Completion Webhook
```

**Use Cases:**
- Video generation (30-120 second latency)
- Large document processing
- Batch AI operations
- Scheduled tasks (cron-like)

### 4.3 Event-Driven Patterns

Real-time updates flow through Supabase Realtime:

```
Database Change → Supabase Realtime → WebSocket → Vision Dashboard
```

**Realtime Tables:**
- `pf_logs` — System-wide logging
- `pf_core_health` — Module health metrics
- `defense_events` — Security events
- `brain_events` — Learning events

---

## 5. Data Flow Pipelines

### 5.1 Learning Pipeline

```
Input → Ingest → Classify → Store → Index → Connect → Reinforce
                    │                           │
                    └────── Feedback Loop ──────┘
```

### 5.2 Threat Intelligence Pipeline

```
Request → Defense Analysis → Risk Score → Decision (Allow/Challenge/Block)
              ↓
        Brain Feedback → Rule Evolution → Improved Detection
```

### 5.3 Telemetry Pipeline

```
All Modules → pf_logs → Vision Dashboard
                  ↓
           pf_core_health → Health Monitor
                  ↓
           Analytics Aggregation → Reporting
```

---

## 6. Deployment Topology

### 6.1 Infrastructure Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL | Primary data store |
| Edge Functions | Deno | Serverless compute |
| Frontend | React + Vite | User interface |
| Cache | Redis | Response caching |
| CDN | Edge Network | Static asset delivery |
| Secrets | Vault | Secure key storage |

### 6.2 Environment Variables

```bash
# Required for all deployments
SUPABASE_URL=<project_url>
SUPABASE_SERVICE_ROLE_KEY=<service_key>
SUPABASE_PUBLISHABLE_KEY=<anon_key>

# AI Providers (substrate is provider-agnostic)
GROQ_API_KEY=<groq_key>
OPENAI_API_KEY=<openai_key>
ANTHROPIC_API_KEY=<anthropic_key>
PERPLEXITY_API_KEY=<perplexity_key>

# Optional
RESEND_API_KEY=<email_key>
REDIS_URL=<redis_url>
```

---

## 7. Scalability Considerations

### 7.1 Horizontal Scaling

Edge functions scale automatically with serverless infrastructure. No manual scaling required for compute.

### 7.2 Database Scaling

- **Connection Pooling:** PgBouncer enabled by default
- **Read Replicas:** Available for high-read workloads
- **Partitioning:** Recommended for `pf_logs` and `brain_memory_hot` tables

### 7.3 Cache Strategy

- **Hot Data:** Redis with 90-day TTL for AI responses
- **Cold Data:** Compressed storage in `brain_memory_cold`
- **CDN:** Static assets and generated content

---

## 8. Security Architecture

**See:** [14-SECURITY-MODEL.md](./14-SECURITY-MODEL.md) for complete security specification.

### 8.1 Authentication Layers

1. **User Authentication:** JWT-based with OAuth support
2. **API Authentication:** Service role keys for inter-module
3. **External API Keys:** Customer-generated keys with scope limits

### 8.2 Row-Level Security

All tables implement RLS policies:
- **Admin-only:** System configuration, health metrics
- **User-scoped:** Projects, API keys, usage data
- **System-internal:** Logs, telemetry (write-only for services)

---

## 9. Future Architecture Considerations

### 9.1 Multi-Region Deployment

Planned support for edge deployment across multiple regions:
- US-East (Primary)
- EU-West (GDPR compliance)
- APAC (Latency optimization)

### 9.2 Federation Protocol

Research underway for federated Brain instances:
- Cross-organization learning
- Privacy-preserving knowledge sharing
- Decentralized model training

---

## References

1. Supabase Architecture Documentation. https://supabase.com/docs/architecture
2. Deno Deploy Edge Functions. https://deno.com/deploy
3. PostgreSQL Row-Level Security. https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

## Ownership & Licensing

promptfluid® is a registered trademark. For ownership inquiries or licensing:

| Contact | Details |
|---------|---------|
| **Founder** | Kenneth E Sweet Jr |
| **Email** | promptfluid@gmail.com |
| **Phone** | (760) FLUID-AI |

---

**Document Status:** STABLE  
**Next Review:** 2026-07-13
