# promptfluid® Substrate — Glossary

**v2026.01 — Terminology and Definitions**

---

## Core Concepts

### Substrate
The foundational execution layer for cognitive AI operations. Unlike platforms or frameworks, a substrate provides infrastructure primitives that applications build upon.

### Module
A functional unit within the substrate that handles a specific domain (e.g., Brain for memory, Defense for security). Modules expose actions via the unified API.

### Action
A specific operation within a module. Actions are invoked via the substrate gateway with module + action names.

### Payload
The input parameters sent with an action request. Payloads are JSON objects with action-specific fields.

### Envelope
The standardized response format wrapping all substrate responses. Contains success flag, data, timestamp, and metadata.

---

## Modules

### Brain
The cognitive memory system. Handles storage, retrieval, learning, reflection, and knowledge graph operations.

### Decode
The human interface layer. Translates natural language to substrate operations. Explicitly NOT a chatbot, persona, or agent.

### Defense
The security layer. Handles bot detection, threat analysis, rate limiting, IP reputation, and anomaly detection.

### Nexus
The AI routing layer. Routes requests to the best available AI provider with automatic failover.

### Vision
The observability layer. Provides health monitoring, metrics, tracing, alerting, and introspection.

### Dream
The autonomous cognition layer. Handles dream processing, mutation cycles, and synthesis operations.

### System
The administration layer. Provides configuration, backup/restore, audit logging, and system control.

---

## Brain Module Terms

### Memory
A stored piece of information in the brain module. Has content, type, confidence, source, and metadata.

### Hot Memory
Recently accessed or high-priority memories kept in fast-access storage (`brain_memory_hot`).

### Cold Memory
Archived or infrequently accessed memories in compressed storage (`brain_memory_cold`).

### Knowledge Graph
Network of connections between memories. Stored as edges with source, target, relation, and weight.

### Reflection
A periodic synthesis process where the brain analyzes recent activity and generates insights.

### Reinforcement
Boosting or weakening memory confidence based on usage patterns and feedback.

### Coherence
Consistency and integrity of memories across storage tiers. Validated via coherence checks.

### Compression
Process of moving memories from hot to cold storage with summarization.

---

## Decode Module Terms

### Epistemic Layer
Decode's understanding layer. Methods: describe, interpret, reflect, pattern, project.

### Conversational Layer
Decode's output formatting layer. Enforces constraints: no imperatives, no identity claims, no agency claims, no synthetic emotion.

### Authority Layer
Decode's routing layer. Can route to other modules but has NO execution authority.

### Intent
The structured interpretation of user input. Extracted via `decode/intent`.

---

## Defense Module Terms

### Bot Detection
Analysis of request patterns to identify automated/malicious traffic.

### Fingerprint
Browser/device characteristics used for identification. Includes canvas, WebGL, audio, fonts.

### IP Reputation
Score (0-100) assigned to IP addresses based on historical behavior.

### Risk Score
Threat assessment (0-100) for a specific request. Higher = more suspicious.

### Rate Limit
Maximum requests allowed per time window. Prevents abuse and ensures fair usage.

### Anomaly
Statistical deviation from normal patterns. Detected via z-score analysis.

### Posture
Overall security status of the substrate. Aggregates multiple security signals.

---

## Nexus Module Terms

### Provider
An AI service (Groq, OpenAI, Cerebras, etc.) that Nexus can route requests to.

### Routing
Selection of the best provider for a given request based on availability, latency, and cost.

### Fallback
Automatic switching to alternative provider when primary is unavailable.

### Provider Matrix
Status of all configured providers showing availability and latency.

---

## Vision Module Terms

### Health
Operational status of system components. Values: healthy, degraded, unhealthy.

### Pulse
Ultra-lightweight heartbeat check that doesn't query the database.

### Metrics
Quantitative measurements of system behavior (request counts, latencies, error rates).

### Trace
Distributed tracing record following a request through multiple components.

### Introspection
Deep self-analysis of substrate state, dependencies, and configuration.

### Dashboard
Aggregated view of system status, metrics, and alerts.

### Quota
Tracking of resource usage against allocated limits (e.g., AI tokens).

---

## Dream Module Terms

### Dream-Eater
The autonomous cognitive entity that processes dreams. Has mood, mutation level, and consumption counters.

### Dream Feed
External submission of dream content for processing.

### Dream Cycle
A complete processing iteration: consumption, digestion, synthesis.

### Mutation
Evolution of the Dream-Eater's state based on processed content.

### Synthesis
Generation of new content or insights from processed dreams.

### Mood
Current emotional/operational state of the Dream-Eater.

---

## System Module Terms

### Audit Log
Record of significant actions taken in the system. Used for compliance and debugging.

### Backup
Point-in-time snapshot of system state for recovery purposes.

### Restore
Recovery of system state from a backup.

### Heal
Self-repair operation that attempts to fix detected issues.

### Configuration
System settings that control behavior. Stored in `core_settings`.

---

## Technical Terms

### Edge Function
Server-side code running in Deno runtime at the edge. Hosts substrate logic.

### RLS (Row-Level Security)
PostgreSQL feature restricting data access at the row level based on user identity.

### JWT (JSON Web Token)
Token format used for authentication. Contains user identity and claims.

### Supabase
Backend-as-a-service platform providing database, auth, storage, and edge functions.

### SDK
Software Development Kit. TypeScript library for interacting with the substrate.

---

## Response Codes

### Success (2xx)
- **200** — OK, request succeeded

### Client Errors (4xx)
- **400** — Bad Request, invalid module/action
- **401** — Unauthorized, missing/invalid token
- **403** — Forbidden, access denied
- **404** — Not Found, unknown resource
- **422** — Unprocessable, validation failed
- **429** — Too Many Requests, rate limited

### Server Errors (5xx)
- **500** — Internal Server Error
- **502** — Bad Gateway
- **503** — Service Unavailable
- **504** — Gateway Timeout

---

## Licensing Terms

### Apache 2.0
Permissive open source license allowing commercial use, modification, and distribution.

### GPL-2.0
Copyleft license requiring derivative works to be open source. Used for WordPress plugins.

### Trademark
Protected brand identifier. promptfluid® is a registered trademark.

### Assignment
Legal transfer of ownership rights from one party to another.

---

## Abbreviations

| Abbrev. | Full Term |
|---------|-----------|
| API | Application Programming Interface |
| BYOK | Bring Your Own Key |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| DNS | Domain Name System |
| JWT | JSON Web Token |
| RLS | Row-Level Security |
| SDK | Software Development Kit |
| SSL | Secure Sockets Layer |
| TLS | Transport Layer Security |
| UUID | Universally Unique Identifier |

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
