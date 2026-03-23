# Deployment & Infrastructure Manual

## 1. Purpose

This manual defines the hosting topology, deployment procedures, and operational infrastructure for the CMPSBL substrate.

## 2. Hosting Topology

```
Client (Browser / PWA)
    │ HTTPS
Edge Functions (Deno Runtime)
    │ SQL / REST
PostgreSQL Database (RLS, Real-time)
    │ HTTPS
AI Providers (External, NEXUS-routed)
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL 15+ with pgvector | Persistent storage, RLS, real-time subscriptions, 60+ tables |
| Edge Runtime | Deno | Module logic, API handlers, NEXUS router, agency executor, disaster recovery |
| Client | TypeScript / React / Vite | Terminal UI, admin dashboard (ATLAS), PWA support |
| AI Providers | NEXUS-routed (BYOK) | LLM inference via consensus routing (OpenAI, Anthropic, Google, Mistral) |
| 3D Visualization | Three.js / React Three Fiber | Topology visualization, namespace explorer |

## 3. Edge Function Fleet

| Function | Purpose | Status |
|----------|---------|--------|
| `nexus-router` | AI provider routing, consensus mode, cost ledger | Active |
| `agency-task-executor` | Agency task execution memory chain | Active |
| `autoblog-generate` | AutoBlog content generation with quality memory chain | Active |
| `scanner-orchestrate` | Security/accessibility scan orchestration | Active |
| `send-agency-email` | Agency email dispatch | Active |
| `stripe-webhook` | Payment processing | Active |
| `create-checkout` | Stripe checkout session creation | Active |
| `full-backup` | One-click disaster recovery backup archive generation | Active |

## 4. CI/CD Flow

```
Code Change → PR Review → Automated Tests → Build → Staging Deploy → Smoke Tests → Production Deploy → Health Check → Ironclad Monitor
```

| Stage | Gate | Failure Action |
|-------|------|---------------|
| PR Review | Manual approval | Block merge |
| Automated Tests | All tests pass (Vitest) | Block merge |
| Build | Clean compile (Vite) | Block deploy |
| Staging Deploy | Successful deployment | Block production |
| Smoke Tests | Critical paths verified | Block production |
| Production Deploy | Zero-downtime deploy | Rollback |
| Health Check | Integrity seals pass (40-primitive) | Rollback |
| Ironclad Monitor | Rate limits, bulkheads, auto-restore | Alert |

## 5. Environment Separation

| Environment | Purpose | Data | Access |
|------------|---------|------|--------|
| Development | Local feature development | Mock/seed data | Developer |
| Staging | Pre-production validation | Anonymized production copy | Team |
| Production | Live system | Real data | Operator |

- No production credentials exist in development or staging.
- Staging mirrors production infrastructure configuration.
- Environment is determined by infrastructure, not code flags.

## 6. Zero-Downtime Strategy

- Database migrations use zero-lock techniques (add column with default, backfill, then constrain).
- Edge function deployments use rolling updates.
- Client deployments use atomic swap with cache invalidation.
- Health checks must pass before traffic is routed to new instances.
- PWA service worker updates use stale-while-revalidate strategy.

## 7. Rollback Procedure

1. Identify the failing deployment via health check, alert, or Evolution Control Center.
2. Initiate rollback via SYSTEM control plane or one-click rollback in Evolution CC.
3. Restore previous edge function version.
4. Apply database rollback migration if schema changed.
5. Verify integrity seals post-rollback (40-primitive weighted sum = 1.000).
6. Document incident in AUDIT.
7. Scanner Orchestrator adds regression test for the failure.

## 8. Secrets Rotation

| Secret Type | Rotation Frequency | Procedure |
|------------|-------------------|-----------|
| AI Provider Keys | 90 days | Update vault, verify NEXUS connectivity, remove old key |
| Database Credentials | 90 days | Rotate via infrastructure provider |
| Admin Credentials | 60 days | Manual rotation with MFA re-enrollment |
| Session Signing Keys | 30 days | Automated rotation with grace period |
| Stripe Keys | 90 days | Update vault, verify webhook signature |
| Agent JWT Secrets | 90 days | Rotate per-agent scoped keys |

## 9. Disaster Recovery

| Scenario | RPO | RTO | Procedure |
|----------|-----|-----|-----------|
| Database corruption | < 1 minute | < 30 minutes | Point-in-time recovery |
| Edge function failure | 0 | < 5 minutes | Rollback to previous version |
| Full infrastructure loss | < 1 hour | < 2 hours | **One-click full backup restore** |
| Provider outage | N/A | < 1 minute | NEXUS automatic provider failover |
| Control plane corruption | < 1 revision | < 10 minutes | WAL replay + snapshot restore |

### One-Click Disaster Recovery Backup

The substrate includes a comprehensive disaster recovery system:

1. **Trigger**: Admin dashboard button initiates the `full-backup` edge function.
2. **Data Capture**: All 60+ database tables exported as paginated JSON (1,000-row batches via service role).
3. **Schema Capture**: OpenAPI spec captured for column types, relationships, and constraints.
4. **Storage Manifest**: All storage buckets inventoried with file metadata.
5. **Restoration Guide**: AI-ready `RESTORE.md` included with step-by-step SQL and JavaScript instructions.
6. **Archive Format**: Single ZIP file named `cmpsbl-full-backup-YYYY-MM-DD-HH-MM-SS.zip`.
7. **Restoration**: Any coding agent can follow the included guide to reconstruct the full system from scratch.

## 10. PWA & Offline Support

The substrate client supports Progressive Web App deployment:

- **Service Worker**: Caches critical assets, enables offline access to cached pages.
- **Manifest**: Configurable app name, icons, theme colors, display mode.
- **Offline Mode**: Read-only access to cached terminal history and documentation.
- **Update Strategy**: Stale-while-revalidate with user notification for new versions.

## 11. SLA Targets

| Metric | Target |
|--------|--------|
| Availability | 99.9% (43.8 min downtime/month) |
| API Response Time (p95) | < 2 seconds |
| Database Query Time (p95) | < 100ms |
| NEXUS Routing Decision | < 50ms |
| Incident Response Time | < 15 minutes (Critical), < 1 hour (High) |
| Recovery Time | < 30 minutes (Critical), < 4 hours (High) |
| Ironclad Auto-Restore | < 30 seconds per cycle |
| Full Backup Generation | < 5 minutes |

## 12. Monitoring Stack

| System | Monitored By | Frequency |
|--------|-------------|-----------|
| 40-primitive health matrix | CORE integrity seal | Continuous |
| Circuit breaker states | Ironclad fabric | Every 30s |
| NEXUS provider health | NEXUS cost ledger | Per-request |
| Database performance | Analytics snapshots | Every 5 min |
| Edge function latency | AUDIT telemetry | Per-request |
| CLM throughput | ENGINEER node | Hourly |
| AutoBlog quality | Confidence/contradiction engines | Per-post |
| Memory tier capacity | MEMORY node | Every 15 min |
| Visitor analytics | DECODE analytics layer | Real-time |
| Developer API usage | ACCESS quotas | Per-request |

## 13. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated to 40-primitive topology, added full-backup edge function, disaster recovery backup documentation, memory/visitor/developer monitoring, 60+ tables |
| 2026-03-03 | System | Added edge function fleet, PWA support, Ironclad monitoring, Evolution CC rollback, Scanner integration, CLM/ENGINEER monitoring |
| 2026-03-03 | System | Verified deployment topology for v13.1.0 |
| 2026-03-01 | System | Initial canonical deployment manual |

---

© 2025–2026 PromptFluid®. All rights reserved.
