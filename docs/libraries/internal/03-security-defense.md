# 03 — Security & Defense

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Threat Model

The substrate operates under a **zero trust** model. No component is implicitly trusted. Threats originate from:

- **External attackers**: Bots, credential stuffing, injection attempts
- **Malicious API consumers**: Data exfiltration, cost inflation via legitimate access
- **Compromised providers**: AI provider outages or manipulated responses
- **Internal drift**: Config errors, unvalidated promotions, governance gaps
- **Agent runtime escape**: Cognitive agents attempting to breach sealed isolation
- **Evolution poisoning**: Malicious proposals designed to weaken system integrity
- **Backup interception**: Unauthorized access to disaster recovery archives

---

## 2. Trust Zones

```
UNTRUSTED:     Client/Browser, External APIs
    ↓
DMZ:           DEFENSE Shell, NEXUS Gateway
    ↓
TRUSTED:       OCG Grid (ACCESS, IDENTITY, AUDIT, NERVE, RELAY, RIPPLE)
               CCR Cognitive (BRAIN, MEMORY, DREAM)
               CORE Kernel
    ↓
COVERT:        CSZ (EVOLUTION, SHADOW, PHANTOM)
    ↓
META:          ATLAS (Governance Hub), ENGINEER (Maintenance)
    ↓
RESTRICTED:    GOVERNANCE Plane, INTEL Aggregation, Secrets Vault
```

---

## 3. Authentication Methods

| Method | Use Case | Token Lifetime |
|--------|----------|---------------|
| API Key | Developer/programmatic access | Until revoked |
| Session Token | Browser/interactive access | 1 hour (refresh available) |
| Admin Credential | Governor access | 30 minutes (no refresh) |
| Agent JWT | Cognitive agent sessions | Per-session, scoped |
| Developer Portal Key | External developer API | Until revoked, scoped per module |

---

## 4. Authorization (RBAC Matrix)

| Role | DECODE | ENCODE | VISION | CORTEX | NEXUS | MEMORY | BRAIN | ADMIN | GOVERNANCE |
|------|--------|--------|--------|--------|-------|--------|-------|-------|-----------|
| Free | Read | Read | — | — | Read | — | — | — | — |
| Pro | RW | RW | Read | Read | RW | Read | — | — | — |
| Enterprise | RW | RW | RW | RW | RW | RW | Read | — | — |
| Admin | Full | Full | Full | Full | Full | Full | Full | Full | Read |
| **Governor** | **Full** | **Full** | **Full** | **Full** | **Full** | **Full** | **Full** | **Full** | **Full** |

**Crown Jewel Capabilities**: 54 capabilities classified as Crown Jewels — excluded from all external tiers, not visible in API catalogs, governor-only.

---

## 5. Rate Limiting (Ironclad Fabric)

| Tier | Req/Minute | Req/Day | Burst |
|------|-----------|---------|-------|
| Builder | 10 | 100 | 2x for 10s |
| Studio | 30 | 2,000 | 2x for 15s |
| Creator | 60 | 5,000 | 3x for 30s |
| Architect | 120 | 15,000 | 4x for 45s |
| Enterprise | 300 | 50,000 | 5x for 60s |
| Governor (role) | 600 | Unlimited | No limit |

Module-specific: REFLEX 500/s, NEXUS 200/s, DECODE 100/s, EVOLUTION 5/s, GOVERNANCE 10/s.

---

## 6. Data Encryption

| State | Method | Key Management |
|-------|--------|---------------|
| At Rest | AES-256 | Infrastructure-managed |
| In Transit | TLS 1.3 | Certificate rotation |
| Secrets Vault | AES-GCM | Per-module scoping |
| Backup Archives | Encrypted snapshots | Session-scoped access |
| Agent State | Encrypted namespace | Sealed runtime keys |

---

## 7. Tenant Isolation

- **Database**: Row-Level Security per user
- **Runtime**: Scoped context per request
- **Storage**: Namespaced by tenant ID
- **Secrets**: Per-module scoping
- **Audit**: Tenant-scoped trails
- **Agents**: Memory-isolated per agency
- **DREAM Pool**: Consent-gated sharing
- **Backups**: Authenticated admin session required

---

## 8. Incident Response Workflow

```
1. Detection     → DEFENSE identifies threat / Scanner flags regression
2. Containment   → Ironclad rate limit + IP block, circuit breaker, bulkhead isolation
3. Assessment    → AUDIT record created, severity classified, IntelCard generated
4. Response      → Pattern stored in BRAIN, alert to ATLAS Node Inbox
5. Recovery      → Credential rotation, integrity verification, Ironclad auto-restore (30s cycle)
6. Post-Incident → Root cause analysis, IMMUNITY adapts, EVOLUTION hardens, regression test added
```

---

## 9. Attack Surface

| Surface | Exposure | Controls |
|---------|----------|----------|
| NEXUS API Gateway | Public | DEFENSE screening, Ironclad, auth required |
| Database | Internal only | RLS, encrypted connections, no direct access |
| Edge Functions | Public (via NEXUS) | Validation, timeout, memory limits |
| AI Providers | Outbound only | Sanitization, validation, consensus routing |
| Admin Interface (ATLAS) | Authenticated | MFA, session limits, IP allowlisting |
| Agent Runtimes | Isolated | Sealed, source-blocked, memory-isolated |
| Evolution Pipeline | Internal | 7-gate SEBA, TSAC verification |
| Backup Endpoint | Admin-only | Session auth, no anonymous access |

---

## 10. Risk Classification

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| CORE failure | Critical | Low | Redundant boot, snapshot recovery |
| Cascade chain | High | Medium | RIPPLE detection, Ironclad bulkheads |
| Data breach | Critical | Low | RLS, encryption, DEFENSE |
| Governance bypass | Critical | Very Low | Immutable logic, audit trail |
| Provider outage | Medium | Medium | NEXUS multi-provider failover |
| Agent runtime escape | High | Very Low | Sealed runtime, memory isolation |
| Full infrastructure loss | Critical | Very Low | One-click disaster recovery backup |

---

## 11. Ascension Observatory — Active Sentinel Layer

**Status:** PRODUCTION · All capabilities enabled by default after initial governor activation.

The Ascension Observatory extends DEFENSE with 10 autonomous sentinel capabilities discovered through the Ascension Transplant Engine. These capabilities run continuously inside the substrate, providing cognitive security, accessibility enforcement, privacy preservation, and self-healing infrastructure.

### 11.1 Active Capabilities

| ID | Capability | CJPI | Tier | Chain Length | Protects |
|----|-----------|------|------|-------------|----------|
| ctp-004 | Cognitive Threat Profiler | 97 | Apex | 8 | DEFENSE · IMMUNITY · ENCODE |
| gme-001 | Generative Mutation Engine | 87 | Mythic | 7 | EVOLUTION · GOVERNANCE · DREAM |
| ara-002 | Accessibility Reasoning Advisor | 92 | Apex | 7 | INCLUSIVE · SHADOW · SYSTEM |
| cen-003 | Consensus Event Network | 87 | Mythic | 8 | GOVERNANCE · NERVE · CONSCIENCE |
| zkr-005 | Zero Knowledge Reasoner | 96 | Apex | 8 | IMMUNITY · TREATY · PHANTOM |
| cpm-006 | Capability Performance Map | 90 | Mythic | 8 | SYSTEM · SHADOW · ENGINEER |
| gme-007 | Generative Mutation Engine (Consensus) | 89 | Mythic | 8 | EVOLUTION · CONSCIENCE · SOVEREIGN |
| zkr-008 | Zero Knowledge Reasoner (Consensus) | 89 | Mythic | 7 | DEFENSE · TREATY · PHANTOM |
| sdr-009 | Sovereign Data Reasoner | 89 | Mythic | 8 | IDENTITY · GOVERNANCE · NERVE |
| cao-010 | Context-Aware Orchestrator | 91 | Mythic | 8 | CORTEX · MEMORY · INTEGRATION |

**Average CJPI:** 91 · **Pack fingerprint:** FEDAC39F87A1

### 11.2 Governance Gates

Every capability is wrapped by a governance layer enforcing:

| Gate | Threshold | Behavior |
|------|----------|----------|
| **Feature flag** | Enabled/Disabled | Disabled by default. Governor must explicitly enable. |
| **Circuit breaker** | 5 consecutive failures | Auto-opens, blocks execution until manual reset. |
| **Rate limiter** | 120 executions/minute | Sliding window. Excess calls return `rate_limited`. |
| **Audit chain** | 1,000-entry ring buffer | SHA-256 integrity hashing. Each entry chains to previous hash. |

### 11.3 Self-Healing Consensus Meta-Engine

The Meta-Engine orchestrates 6 Crown Jewel primitives into an autonomous Byzantine fault tolerance loop:

```
detect drift → reach consensus → reconstruct state → verify quorum → reintegrate
```

| Primitive | Crown Jewel # | Role |
|-----------|--------------|------|
| Consensus Heartbeat Protocol | #005 | Drift detection via EMA scoring |
| Consensus Engine | #018 | Multi-source voting (majority/supermajority/unanimity) |
| Distributed Consensus Mesh | #039 | Leader election, term management |
| Quorum Negotiator | #083 | Quorum verification before reintegration |
| State Synchronization | #103 | Vector clock merging, CRDT state reconstruction |
| Self-Repair Engine | #160 | Damage assessment, repair action execution |

**Kill switch:** Immediate halt via Observatory dashboard. All nodes freeze, no further ticks execute.

### 11.4 Operational Guidance

- **Leave enabled.** All capabilities are production-hardened with circuit breakers and rate limits.
- **Monitor via** `/admin/ascension-observatory` for real-time status, audit trail, and Meta-Engine node health.
- **Kill switch** is for emergency only — stops the Meta-Engine tick loop instantly.
- **Rollback** any individual capability via `rollbackCapability(id)` or `rollbackAll()` to restore disabled state.
- **Circuit resets** are manual — if a circuit opens, investigate the failure pattern in the audit chain before resetting.

### 11.5 Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Capability produces false positives | Low | Circuit breaker auto-trips after 5 failures |
| Rate limit exhaustion under load | Medium | Configurable `MAX_RATE_PER_MIN` (default 120) |
| Meta-Engine node drift cascade | Low | Byzantine detection isolates before spread |
| Audit buffer overflow | None | Ring buffer evicts oldest entries, integrity hash preserved |

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
