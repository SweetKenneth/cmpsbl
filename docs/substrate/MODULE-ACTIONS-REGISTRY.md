# CMPSBL Module Actions Registry

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | CMPSBL-MAR-001 |
| Version | v2026.02 |
| Last Updated | 2026-02-03 |
| Status | ACTIVE |
| Substrate Version | 7.0.0 |
| Type | Cognitive Orchestration Substrate |
| Synergy Pipelines | 120 |
| Synergy Executors | 98 |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |

---

## Overview

This document catalogs all registered module actions across the CMPSBL substrate v7.0.0. Each module exposes a set of actions via the unified `pf-substrate` endpoint or dedicated edge functions. The SEBA Era introduces 120 synergy pipelines and 98 custom executors for cross-module orchestration.

### Invocation Pattern

```typescript
// Via Substrate Client
import { substrate } from '@/lib/substrate';
const result = await substrate.brain.learn('content', 'source');

// Via Direct API
POST /pf-substrate
{
  "module": "brain",
  "action": "learn",
  "payload": { "content": "...", "source": "..." }
}
```

---

## Module: BRAIN

Memory, learning cycles, reflection, and knowledge synthesis.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `query` | Search memories by text | `query_text: string`, `limit?: number` | ✅ DEPLOYED |
| `remember` | Store new memory | `content: string`, `memory_type: string`, `confidence?: number`, `metadata?: object` | ✅ DEPLOYED |
| `reflect` | Trigger daily reflection cycle | — | ✅ DEPLOYED |
| `reinforce` | Boost memory confidence | `memory_id: string`, `boost?: number` | ✅ DEPLOYED |
| `dream` | Autonomous dream processing cycle | — | ✅ DEPLOYED |
| `status` | Get brain module stats | — | ✅ DEPLOYED |
| `learn` | Ingest new knowledge | `content: string`, `source?: string` | ✅ DEPLOYED (via decode) |
| `recall` | Recall memories by query | `query: string`, `limit?: number` | ⚠️ STUB NEEDED |
| `synthesize` | Synthesize insights from memories | — | ⚠️ STUB NEEDED |
| `train` | Active learning cycle | `topic?: string` | ⚠️ STUB NEEDED |
| `optimize` | Memory compression/cleanup | — | ⚠️ STUB NEEDED |
| `deep_think` | Extended reasoning mode | `query: string`, `depth?: number` | ⚠️ STUB NEEDED |
| `hypothesis_test` | Validate predictions | `hypothesis: string` | ⚠️ STUB NEEDED |
| `cognitive_cycle` | Full cognitive loop | — | ⚠️ STUB NEEDED |
| `continuous_learn` | 24/7 learning mode | `enabled: boolean` | ⚠️ STUB NEEDED |
| `forecast` | Generate predictions | `metric: string`, `window?: string` | ⚠️ STUB NEEDED |
| `graph_build` | Build knowledge graph | — | ⚠️ STUB NEEDED |
| `graph_summary` | Knowledge graph structure summary | — | ✅ DEPLOYED (v3.6.0) — read-only, proof-compatible |
| `cold_migrate` | Move old memories to cold storage | — | ✅ DEPLOYED (standalone) |
| `session_reflection` | Cross-module session activity reflection | `hours?: number (1-168)` | ✅ DEPLOYED (v3.5.0) — Observer-eligible |

### Brain Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-brain` | Main orchestration | ✅ DEPLOYED |
| `pf-brain-status` | Health monitoring | ✅ DEPLOYED |
| `pf-brain-learn` | Memory ingestion | ✅ DEPLOYED |
| `pf-brain-reflect` | Daily reflection | ✅ DEPLOYED |
| `pf-brain-dream` | Dream cycles | ✅ DEPLOYED |
| `pf-brain-train` | Active learning | ✅ DEPLOYED |
| `pf-brain-reinforce` | Edge strengthening | ✅ DEPLOYED |
| `pf-brain-optimize` | Memory compression | ✅ DEPLOYED |
| `pf-brain-deep-think` | Extended reasoning | ✅ DEPLOYED |
| `pf-brain-hypothesis-test` | Prediction validation | ✅ DEPLOYED |
| `pf-brain-cognitive-cycle` | Full cognitive loop | ✅ DEPLOYED |
| `pf-brain-continuous-learn` | 24/7 learning | ✅ DEPLOYED |
| `pf-brain-cold-migration` | Memory archival | ✅ DEPLOYED |
| `pf-brain-causal` | Causal reasoning | ✅ DEPLOYED |
| `pf-brain-forecast` | Predictions | ✅ DEPLOYED |

---

## Module: DECODE (Interpreter Primitive)

Intent decoding, cognitive interface, chat. NOT a chatbot or agent.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `chat` | Primary cognitive interpretation | `message: string`, `sessionId?: string`, `conversationHistory?: array` | ✅ DEPLOYED |
| `dream` | Initiate dream cycle | — | ✅ DEPLOYED |
| `propose` | Submit proposal for consideration | `idea: string` | ⚠️ STUB NEEDED |
| `learn` | Learn from interaction | `content: string`, `source?: string` | ✅ DEPLOYED |
| `status` | Get decode module stats | — | ✅ DEPLOYED |
| `intent` | Extract structured intent from message | `message: string` | ✅ DEPLOYED (v3.2.0) |
| `reflect` | Reflection on conversations | — | ⚠️ STUB NEEDED |
| `summary` | Generate conversation summary | `sessionId: string` | ⚠️ STUB NEEDED |

### Decode/Cascade Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-cascade-chat` | Conversational AI (hardened) | ✅ DEPLOYED |
| `pf-cascade-dream` | Dream generation | ✅ DEPLOYED |
| `pf-cascade-learn` | Learning intake | ✅ DEPLOYED |
| `pf-cascade-operative` | Main operative loop | ✅ DEPLOYED |
| `pf-cascade-proposals` | Proposal handling | ✅ DEPLOYED |
| `pf-cascade-summary` | Conversation summary | ✅ DEPLOYED |
| `pf-cascade-router` | Message routing | ✅ DEPLOYED |

---

## Module: DEFENSE

Bot detection, threat analysis, security, IP reputation.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `analyze` | Analyze request for threats | `ip_address: string`, `user_agent?: string`, `page_url?: string` | ✅ DEPLOYED |
| `reputation` | Get IP reputation score | `ip_address: string` | ✅ DEPLOYED |
| `status` | Get defense module stats | — | ✅ DEPLOYED |
| `report` | Get threat report | `threatId: string` | ⚠️ STUB NEEDED |
| `rules` | Get/manage defense rules | `action?: 'list'|'create'|'update'|'delete'` | ⚠️ STUB NEEDED |
| `block` | Block IP/fingerprint | `target: string`, `type: 'ip'|'fingerprint'` | ⚠️ STUB NEEDED |
| `unblock` | Remove block | `target: string` | ⚠️ STUB NEEDED |
| `threat_feed` | External threat intel | — | ⚠️ STUB NEEDED |
| `rate_limit` | Configure rate limiting | `endpoint: string`, `limit: number` | ⚠️ STUB NEEDED |
| `anomaly` | Detect anomalies | `timeWindow?: '1h'|'6h'|'24h'` | ✅ DEPLOYED (v3.1.0) |
| `anomaly_probe` | Statistical z-score anomaly detection | `lookbackHours?: number (1-168)` | ✅ DEPLOYED (v3.4.0) — Observer-eligible |
| `limits` | Unified rate limit status | — | ✅ DEPLOYED (v3.6.0) — read-only, proof-compatible |
| `posture` | Consolidated security posture | — | ✅ DEPLOYED (v3.7.0) — read-only, proof-compatible |

### Defense Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-bot-detection` | Main bot analysis | ✅ DEPLOYED |
| `pf-bot-report` | Bot detection report | ✅ DEPLOYED |
| `pf-defense-event` | Event logging | ✅ DEPLOYED |
| `pf-defense-rules` | Rule management | ✅ DEPLOYED |
| `pf-defense-ip-reputation` | IP scoring | ✅ DEPLOYED |
| `pf-defense-threat-feed` | External intel | ✅ DEPLOYED |
| `pf-defense-rate-limit` | Rate limiting | ✅ DEPLOYED |
| `pf-defense-anomaly-detection` | Anomaly detection | ✅ DEPLOYED |
| `pf-defense-auto-shutdown` | Emergency shutdown | ✅ DEPLOYED |
| `pf-defense-system-health` | System health | ✅ DEPLOYED |
| `pf-behavioral-analysis` | Behavior scoring | ✅ DEPLOYED |
| `pf-sdk-protect` | SDK protection | ✅ DEPLOYED |

---

## Module: NEXUS

Multi-provider AI routing for text, image, video generation.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `route` | Route to best provider | `prompt: string`, `systemPrompt?: string`, `temperature?: number` | ✅ DEPLOYED |
| `status` | Get available providers | — | ✅ DEPLOYED |
| `providers` | Provider availability matrix | — | ✅ DEPLOYED (v3.5.0) — Observer-eligible |
| `route_stats` | AI routing analytics (24h) | — | ✅ DEPLOYED (v3.8.0) — read-only, proof-compatible |
| `text` | Text generation | `prompt: string`, `model?: string` | ⚠️ STUB NEEDED (in substrate) |
| `image` | Image generation | `prompt: string`, `model?: string` | ⚠️ STUB NEEDED (in substrate) |
| `video` | Video generation | `prompt: string`, `model?: string` | ⚠️ STUB NEEDED (in substrate) |
| `embed` | Generate embeddings | `text: string`, `model?: string` | ⚠️ STUB NEEDED |
| `transcribe` | Audio transcription | `audio_url: string` | ⚠️ STUB NEEDED |

### Nexus Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-nexus-router` | Main routing | ✅ DEPLOYED |
| `pf-nexus-text` | Text generation | ✅ DEPLOYED |
| `pf-nexus-image` | Image generation | ✅ DEPLOYED |
| `pf-nexus-video` | Video generation | ✅ DEPLOYED |

---

## Module: VISION

Observability, metrics, health monitoring, alerting, distributed tracing, ecosystem monitoring.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `health` | System health check | — | ✅ DEPLOYED |
| `metrics` | Get system metrics | — | ✅ DEPLOYED |
| `status` | Get vision module status | — | ✅ DEPLOYED |
| `logs` | Get system logs | `module?: string`, `limit?: number` | ✅ DEPLOYED |
| `alert` | Create alert | `severity: string`, `message: string` | ✅ DEPLOYED |
| `dashboard` | Get dashboard data | — | ✅ DEPLOYED (v3.1.0) |
| `trace` | Distributed tracing | `traceId?: string`, `create?: boolean`, `module?: string`, `action?: string`, `duration_ms?: number` | ✅ DEPLOYED (v3.2.0) |
| `audit` | Audit log query | `entity?: string`, `action?: string` | ✅ DEPLOYED |
| `monitor` | Ecosystem health monitoring | — | ✅ DEPLOYED (v3.3.0) |
| `resilience` | Resilience framework probe | — | ✅ DEPLOYED (v3.3.0) |
| `analytics` | Threat analytics (24h) | — | ✅ DEPLOYED (v3.3.0) |
| `health_snapshot` | Quick consolidated health check | — | ✅ DEPLOYED (v3.4.0) — Observer-eligible |
| `introspection` | Deep substrate self-analysis | — | ✅ DEPLOYED (v3.6.0) — read-only, proof-compatible |
| `pulse` | Ultra-lightweight heartbeat (zero DB queries) | — | ✅ DEPLOYED (v3.7.0) — read-only, proof-compatible |
| `quota` | AI usage quota observability | — | ✅ DEPLOYED (v3.8.0) — read-only, proof-compatible |

### Vision Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-health-check` | Health monitoring | ✅ DEPLOYED |
| `pf-system-status` | System status | ✅ DEPLOYED |
| `pf-diagnostics` | Diagnostics | ✅ DEPLOYED |
| `pf-telemetry-log` | Telemetry | ✅ DEPLOYED |
| `pf-brain-monitor` | Ecosystem monitor (source for vision/monitor) | ✅ DEPLOYED |
| `pf-resilience-monitor` | Resilience (source for vision/resilience) | ✅ DEPLOYED |
| `pf-reflex-analytics` | Analytics (source for vision/analytics) | ✅ DEPLOYED |

---

## Module: DREAM

Dream-Eater specific operations for dream processing and transformation.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `cycle` | Execute dream cycle | `force?: boolean`, `send_email?: boolean` | ✅ DEPLOYED |
| `awaken` | Awaken Dream-Eater | `action?: string` | ✅ DEPLOYED |
| `status` | Get dream state | — | ⚠️ STUB NEEDED |
| `feed` | Submit dream for consumption | `dream_content: string`, `dream_type?: string` | ✅ DEPLOYED (dream-feeder-api) |
| `interpret` | Interpret a dream | `dream_text: string` | ⚠️ STUB NEEDED |
| `mutation` | Trigger mutation cycle | — | ⚠️ STUB NEEDED |
| `consume` | Consume and process dream | `dream_id: string` | ⚠️ STUB NEEDED |
| `reflect` | Dream reflection | — | ⚠️ STUB NEEDED |
| `mood` | Get/set Dream-Eater mood | `mood?: string` | ⚠️ STUB NEEDED |

### Dream Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-dream-eater-cycle` | Main dream cycle | ✅ DEPLOYED |
| `pf-dream-eater-awaken` | Awakening/seeding | ✅ DEPLOYED |
| `pf-dream-mode` | Dream mode toggle | ✅ DEPLOYED |
| `dream-feeder-api` | Public dream submission (hardened) | ✅ DEPLOYED |
| `cascade-dream-generator` | Dream generation | ✅ DEPLOYED |

---

## Module: SYSTEM

System-wide operations, administration, configuration.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Global system status | — | ✅ DEPLOYED (via substrate status) |
| `health` | Full system health | — | ✅ DEPLOYED (v3.1.0) |
| `diagnostics` | Comprehensive system diagnostics | — | ✅ DEPLOYED (v3.1.0) |
| `config` | Get/set configuration | `key?: string`, `value?: any` | ⚠️ STUB NEEDED |
| `shutdown` | Emergency shutdown | `confirm: boolean` | ⚠️ STUB NEEDED |
| `restart` | Restart services | `service?: string` | ✅ DEPLOYED |
| `heal` | Full heal system | `target?: string`, `force?: boolean` | ✅ DEPLOYED (v3.1.0 - full restore) |
| `backup` | Create validated backup | `include_data?: boolean`, `tables?: string[]` | ✅ DEPLOYED (v3.2.0 - validated) |
| `restore` | Restore from backup | `backup_id: string`, `validate_only?: boolean` | ✅ DEPLOYED (v3.2.0) |
| `audit` | System audit | — | ✅ DEPLOYED |
| `version` | Get substrate version | — | ✅ DEPLOYED |

### System Dedicated Functions (Standalone)

| Function | Purpose | Status |
|----------|---------|--------|
| `pf-system-status` | System status | ✅ DEPLOYED |
| `pf-system-verify` | System verification | ✅ DEPLOYED |
| `pf-self-heal` | Self-healing | ✅ DEPLOYED |
| `pf-heal` | Healing operations | ✅ DEPLOYED |
| `pf-emergency-shutdown` | Emergency shutdown | ✅ DEPLOYED |
| `pf-admin-control` | Admin control panel | ✅ DEPLOYED |
| `pf-core-status` | Core status | ✅ DEPLOYED |
| `pf-core-settings` | Settings management | ✅ DEPLOYED |

---

---

## Module: CORE (Kernel)

Execution scheduler, lifecycle, routing, state machine.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `boot` | Initialize all modules | — | ✅ DEPLOYED |
| `schedule` | Queue jobs with priority | `module: string`, `action: string`, `delay?: string`, `payload?: object` | ✅ DEPLOYED |
| `authorize` | Check permissions, rate limits | `api_key: string`, `action: string` | ✅ DEPLOYED |
| `route` | Forward requests to module | `module: string`, `action: string`, `payload: object` | ✅ DEPLOYED |
| `meter` | Track usage per API key | `api_key_id: string`, `tokens?: number` | ✅ DEPLOYED |
| `integrate` | Connect external services | `service: string`, `config: object` | ✅ DEPLOYED |
| `config` | Global system configuration | `key?: string`, `value?: any` | ✅ DEPLOYED |
| `shutdown` | Graceful system shutdown | `confirm: boolean` | ✅ DEPLOYED |
| `status` | Get kernel status | — | ✅ DEPLOYED |
| `pulse` | Ultra-lightweight heartbeat | — | ✅ DEPLOYED |

---

## Module: RIPPLE (Message Bus)

Async job queues, pub/sub messaging, event sourcing.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `enqueue` | Add job to queue | `queue: string`, `job_type: string`, `payload: object` | ✅ DEPLOYED |
| `dequeue` | Get next job | `queue: string` | ✅ DEPLOYED |
| `publish` | Publish event to topic | `topic: string`, `event_type: string`, `payload: object` | ✅ DEPLOYED |
| `subscribe` | Subscribe to topic | `topic: string`, `subscriber_module: string`, `subscriber_action: string` | ✅ DEPLOYED |
| `status` | Queue stats | — | ✅ DEPLOYED |
| `retry` | Retry failed job | `job_id: string` | ✅ DEPLOYED |
| `dead_letter` | View failed jobs | `queue?: string`, `limit?: number` | ✅ DEPLOYED |
| `pulse` | Ultra-lightweight heartbeat | — | ✅ DEPLOYED |

---

## Module: ACCESS (Identity & Billing)

API keys, usage metering, quotas, billing integration.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `create_key` | Generate new API key | `name: string`, `scopes?: string[]`, `expires_in_days?: number` | ✅ DEPLOYED |
| `validate_key` | Validate API key | `api_key: string` | ✅ DEPLOYED |
| `revoke_key` | Revoke API key | `key_id: string` | ✅ DEPLOYED |
| `list_keys` | List developer's keys | `developer_id?: string` | ✅ DEPLOYED |
| `get_usage` | Get usage stats | `start_date?: string`, `end_date?: string` | ✅ DEPLOYED |
| `check_quota` | Check remaining quota | `api_key_id: string` | ✅ DEPLOYED |
| `create_checkout` | Stripe checkout | `tier: string` | ✅ DEPLOYED |
| `webhook` | Stripe webhook handler | `event: object` | ✅ DEPLOYED |
| `portal` | Customer portal | `customer_id: string` | ✅ DEPLOYED |
| `pulse` | Ultra-lightweight heartbeat | — | ✅ DEPLOYED |

---

## Module: INTEGRATION (v4.2.0)

Enterprise adapters, auto-discovery, command mapping, LLM governance.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Integration module status | — | ✅ DEPLOYED |
| `pulse` | Lightweight heartbeat | — | ✅ DEPLOYED |
| `adapters` | List available adapters | `category?` | ✅ DEPLOYED |
| `connect` | Connect enterprise adapter | `type`, `name`, `config`, `credentials?` | ✅ DEPLOYED |
| `disconnect` | Disconnect adapter | `adapter_id` | ✅ DEPLOYED |
| `discover` | Auto-discover client systems | `target?`, `depth?` | ✅ DEPLOYED |
| `map_command` | Map function to terminal command | `function`, `command`, `description` | ✅ DEPLOYED |
| `execute` | Execute governed LLM action | `adapter_id`, `action`, `params?` | ✅ DEPLOYED |
| `governance` | Check governance policies | `adapter_id?` | ✅ DEPLOYED |
| `game_discover` | Discover game engine APIs | `engine_type` | ✅ DEPLOYED |
| `enterprise_discover` | Discover enterprise APIs | `system_type` | ✅ DEPLOYED |
| `dev_discover` | Discover dev platform APIs | `platform_type` | ✅ DEPLOYED |

### Available Adapter Categories (35+)

| Category | Adapters |
|----------|----------|
| **ERP** | SAP, Oracle, NetSuite, Dynamics 365 |
| **Payroll** | ADP, Gusto, Workday, BambooHR, Paychex |
| **Gaming** | Unity, Unreal, Godot, Custom |
| **CRM** | Salesforce, Zendesk, Intercom, Freshdesk, HubSpot |
| **DevOps** | GitHub, GitLab, Jira, Linear, Azure DevOps |
| **Payments** | Stripe, Shopify, Square, PayPal |
| **Communication** | Slack, Teams, Discord, Twilio |
| **Analytics** | Mixpanel, Amplitude, Segment |

---

## Summary: Deployed Actions

| Module | Deployed | Planned (Stubs) |
|--------|----------|-----------------|
| **Core** | 10 | 0 |
| **Ripple** | 8 | 0 |
| **Access** | 10 | 0 |
| **Brain** | 10 | 9 |
| **Decode** | 5 | 3 |
| **Defense** | 7 | 7 |
| **Nexus** | 4 | 5 |
| **Vision** | 14 | 0 |
| **Dream** | 3 | 6 |
| **System** | 9 | 2 |
| **Modernizer** | 4 | 2 |
| **Integration** | 12 | 0 |
| **Total** | **96** | **34** |

---

## BYOK Integrations

The substrate supports external integrations via the `integration-bus` edge function:

| Integration | Type | Status |
|-------------|------|--------|
| **Stripe** | Payments | ✅ Available |
| **Twilio** | SMS/Voice | ✅ Available |
| **Shopify** | E-commerce | ✅ Available |
| **n8n** | Automation | ✅ Available |
| **Webhooks** | Custom | ✅ Available |

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
