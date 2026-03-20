# 05 — Memory & Data Architecture

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Data Layer

Built on PostgreSQL with Row-Level Security (RLS). Per-user data isolation, real-time subscriptions, transactional guarantees. **60+ tables** across 11 families.

---

## 2. Memory Tiers

| Tier | Storage | Access Time | Capacity | Use Case |
|------|---------|------------|----------|----------|
| **Hot** | In-memory runtime | < 1ms | 2,000 entries | Active session context, circuit breakers, routing cache |
| **Warm** | PostgreSQL indexed | < 50ms | 5,000 entries | Recent memory, active tasks, CLM active topics |
| **Cold** | PostgreSQL archived | < 500ms | 10,000 entries | Historical analytics, completed tasks, distilled knowledge |
| **Glacier** | PostgreSQL archive | < 2s | 50,000 entries | Long-term retention, deep historical data |

### Tier Transitions
- Hot → Warm: Session end, 15 min inactivity, or capacity exceeded
- Warm → Cold: After retention threshold (>14 days, low value score)
- Cold → Glacier: After extended retention threshold
- Cold → Warm: On-demand retrieval with caching
- **Emergency cascade**: When any tier exceeds 2x capacity, bulk demotion activates

---

## 3. Table Families

| Family | Tables | Purpose |
|--------|--------|---------|
| Access Control | 7 tables | Auth, billing, developer API access |
| Agency Core | 10 tables | Multi-agent orchestration and commerce |
| Agency Extended | 7 tables | DREAM synthesis, automation, telemetry |
| AI Operations | 3 tables | Provider usage, quotas, learning |
| Analytics | 3 tables | System telemetry, visitor analytics |
| Audit | 3 tables | Immutable logging, tamper-evident chains |
| AutoBlog Core | 2 tables | Automated content generation |
| AutoBlog Quality | 10 tables | Quality pipeline, confidence, drift detection |
| Cognitive | 2 tables | Agent identity and skill tracking |
| Capabilities | 1 table | Feature flags and capability registry |
| Scanning | 1 table | Accessibility scanning |

---

## 4. Retention Policy

| Data | Retention | Reason |
|------|-----------|--------|
| Security audit logs | Indefinite | Compliance, forensics |
| Operational audit logs | 90 days | Debugging |
| Usage logs | 12 months | Billing reconciliation |
| Analytics events | 6 months | Performance analysis |
| Analytics snapshots | 24 months | Trend analysis |
| Task logs | 6 months | Agent review |
| Learning data (CLM) | 12 months | Model improvement |
| AutoBlog drafts | 90 days | Editorial review |
| INTEL signals | 30 days | Aggregation throughput |
| Scanner findings | 12 months | Regression baseline |

---

## 5. CLM (Constant Learning Mode) Data

- **Topic sourcing**: 70% ENGINEER findings + INTEL, 30% scheduled curriculum
- **Training records**: `ai_learning_data` with CLM metadata tags
- **Throughput**: Up to 14,400 calls/day (10/min sustained)
- **Distillation**: Mature knowledge compressed → promoted to MEMORY

---

## 6. Backup & Disaster Recovery

| Component | Method | RPO | RTO |
|-----------|--------|-----|-----|
| Database | Point-in-time WAL | < 1 min | < 30 min |
| Snapshots | Daily full snapshot | 24 hours | < 1 hour |
| Configuration | Version-controlled | 0 (git) | < 5 min |
| Secrets | Encrypted export | 7 days | < 15 min |
| **Full System** | **One-click ZIP backup** | **Point-in-time** | **< 2 hours** |

### One-Click Disaster Recovery
- Exports all tables as paginated JSON (handles >1,000 row tables)
- Captures OpenAPI schema for column types and relationships
- Inventories storage buckets and file metadata
- Generates AI-ready `RESTORE.md` with reconstruction instructions
- Timestamped archives for point-in-time identification
- Any coding agent can restore from the archive without external dependencies

---

## 7. Data Integrity Guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| Referential integrity | Foreign key constraints |
| Type safety | Column type enforcement, validation triggers |
| Consistency | Transactional writes, atomic commits |
| Durability | WAL-based persistence, point-in-time recovery |
| Isolation | RLS, per-request scoped context |
| Auditability | Append-only audit log with checksums |
| Tier capacity | Automated enforcement with bulk demotion |

---

## 8. Multi-Tenant Strategy

- Logical isolation via RLS scoped to `auth.uid()`
- No shared state across tenants
- Tenant-scoped indexes for performance
- Per-tenant quota enforcement
- Agent memory isolation per agency
- Tenant deletion cascades through all related tables

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
