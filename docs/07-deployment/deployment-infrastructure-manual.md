# Deployment & Infrastructure Manual

## 1. Purpose

This manual defines the hosting topology, deployment procedures, and operational infrastructure for the CMPSBL substrate.

## 2. Hosting Topology

```
Client (Browser)
    │ HTTPS
Edge Functions (Deno Runtime)
    │ SQL / REST
PostgreSQL Database (RLS, Real-time)
    │ HTTPS
AI Providers (External, BYOK)
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL 15+ with pgvector | Persistent storage, RLS, real-time subscriptions |
| Edge Runtime | Deno | Module logic, API handlers |
| Client | TypeScript / React | Terminal UI, admin dashboard |
| AI Providers | BYOK | LLM inference (OpenAI, Anthropic, Google, Mistral) |

## 3. CI/CD Flow

```
Code Change → PR Review → Automated Tests → Build → Staging Deploy → Smoke Tests → Production Deploy → Health Check
```

| Stage | Gate | Failure Action |
|-------|------|---------------|
| PR Review | Manual approval | Block merge |
| Automated Tests | All tests pass | Block merge |
| Build | Clean compile | Block deploy |
| Staging Deploy | Successful deployment | Block production |
| Smoke Tests | Critical paths verified | Block production |
| Production Deploy | Zero-downtime deploy | Rollback |
| Health Check | Integrity seals pass | Rollback |

## 4. Environment Separation

| Environment | Purpose | Data | Access |
|------------|---------|------|--------|
| Development | Local feature development | Mock/seed data | Developer |
| Staging | Pre-production validation | Anonymized production copy | Team |
| Production | Live system | Real data | Operator |

- No production credentials exist in development or staging.
- Staging mirrors production infrastructure configuration.
- Environment is determined by infrastructure, not code flags.

## 5. Zero-Downtime Strategy

- Database migrations use zero-lock techniques (add column with default, backfill, then constrain).
- Edge function deployments use rolling updates.
- Client deployments use atomic swap with cache invalidation.
- Health checks must pass before traffic is routed to new instances.

## 6. Rollback Procedure

1. Identify the failing deployment via health check or alert.
2. Initiate rollback via SYSTEM control plane.
3. Restore previous edge function version.
4. Apply database rollback migration if schema changed.
5. Verify integrity seals post-rollback.
6. Document incident in AUDIT.

## 7. Secrets Rotation

| Secret Type | Rotation Frequency | Procedure |
|------------|-------------------|-----------|
| AI Provider Keys | 90 days | Update vault, verify connectivity, remove old key |
| Database Credentials | 90 days | Rotate via infrastructure provider |
| Admin Credentials | 60 days | Manual rotation with MFA re-enrollment |
| Session Signing Keys | 30 days | Automated rotation with grace period |

## 8. Disaster Recovery

| Scenario | RPO | RTO | Procedure |
|----------|-----|-----|-----------|
| Database corruption | < 1 minute | < 30 minutes | Point-in-time recovery |
| Edge function failure | 0 | < 5 minutes | Rollback to previous version |
| Full infrastructure loss | < 1 hour | < 4 hours | Restore from daily snapshot + WAL |
| Provider outage | N/A | < 1 minute | NEXUS automatic provider failover |

## 9. SLA Targets

| Metric | Target |
|--------|--------|
| Availability | 99.9% (43.8 min downtime/month) |
| API Response Time (p95) | < 2 seconds |
| Database Query Time (p95) | < 100ms |
| Incident Response Time | < 15 minutes (Critical), < 1 hour (High) |
| Recovery Time | < 30 minutes (Critical), < 4 hours (High) |

## 10. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Verified deployment topology for v13.1.0 |
| 2026-03-01 | System | Initial canonical deployment manual |

---

© 2025–2026 PromptFluid®. All rights reserved.
