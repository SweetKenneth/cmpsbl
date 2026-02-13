# CMPSBL OS Substrate — Deployment Model

**Document ID:** CMPSBL-ACAD-011  
**Version:** v9.1.0 (ARCHITECT Epoch)

---

## 1. Deployment Overview

The CMPSBL Substrate is designed to run on commodity cloud infrastructure with minimal vendor lock-in. This document describes infrastructure requirements, deployment patterns, and operational considerations.

### 1.1 Deployment Principles

| Principle | Description |
|-----------|-------------|
| **Cloud Agnostic** | Deploy on any major cloud provider |
| **Infrastructure as Code** | Reproducible deployments |
| **Immutable Infrastructure** | Replace, don't modify |
| **Observable by Default** | Built-in monitoring |
| **Secure by Design** | Defense in depth |

### 1.2 Deployment Tiers

| Tier | Use Case | Complexity |
|------|----------|------------|
| Development | Local testing | Minimal |
| Staging | Pre-production | Moderate |
| Production | Live workloads | Full |

---

## 2. Infrastructure Requirements

### 2.1 Compute Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Edge Functions | 256 MB RAM | 512 MB RAM |
| Function Instances | 2 | 10+ (auto-scaling) |
| Cold Start Budget | 500 ms | 200 ms |

### 2.2 Database Requirements

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| PostgreSQL Version | 14 | 15+ |
| vCPUs | 2 | 4+ |
| RAM | 4 GB | 16 GB |
| Storage | 20 GB | 100 GB+ |
| IOPS | 1,000 | 3,000+ |
| Extensions | pgvector, pg_trgm | + pg_stat_statements |

### 2.3 Network Requirements

| Requirement | Specification |
|-------------|---------------|
| Bandwidth | 100 Mbps minimum |
| Latency (internal) | < 10 ms |
| SSL/TLS | Required |
| IPv6 | Recommended |

---

## 3. Component Architecture

### 3.1 Core Components

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                  (SSL Termination)                   │
└─────────────────────────┬───────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Edge Function │ │ Edge Function │ │ Edge Function │
│   Instance    │ │   Instance    │ │   Instance    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL Cluster  │
              │   (Primary + Replica) │
              └───────────────────────┘
```

### 3.2 Supporting Services

| Service | Purpose | Requirement |
|---------|---------|-------------|
| Object Storage | File storage | Required |
| Redis/Valkey | Caching, pub/sub | Recommended |
| Secrets Manager | Credential storage | Required |
| Monitoring | Observability | Required |

---

## 4. Configuration

### 4.1 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `API_SECRET_KEY` | API key encryption key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STORAGE_BUCKET` | Object storage bucket | Yes |
| `REDIS_URL` | Cache connection string | No |
| `LOG_LEVEL` | Logging verbosity | No |

### 4.2 Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `EVOLUTION_ENABLED` | true | Enable self-evolution |
| `AUTONOMY_MODE` | advisory | Default autonomy mode |
| `DREAM_CYCLES_ENABLED` | true | Enable dream cycles |
| `MULTI_PROVIDER` | true | Enable fallback routing |

### 4.3 Resource Limits

| Limit | Default | Configurable |
|-------|---------|--------------|
| Max request size | 10 MB | Yes |
| Request timeout | 30 sec | Yes |
| Max concurrent | 100 | Yes |
| Rate limit (default) | 100/min | Yes |

---

## 5. Deployment Patterns

### 5.1 Single-Region Deployment

```
┌─────────────────────────────────────┐
│           Region A                   │
│                                      │
│  ┌──────────┐    ┌──────────────┐  │
│  │   Edge   │    │   Database   │  │
│  │ Functions│    │   (Primary)  │  │
│  └──────────┘    └──────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

**Use Case:** Development, small deployments

### 5.2 Multi-Region Deployment

```
┌─────────────────┐         ┌─────────────────┐
│    Region A     │         │    Region B     │
│                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │
│  │   Edge    │  │◄───────►│  │   Edge    │  │
│  │ Functions │  │         │  │ Functions │  │
│  └─────┬─────┘  │         │  └─────┬─────┘  │
│        │        │         │        │        │
│  ┌─────▼─────┐  │         │  ┌─────▼─────┐  │
│  │  Primary  │──┼─────────┼─►│  Replica  │  │
│  │    DB     │  │         │  │    DB     │  │
│  └───────────┘  │         │  └───────────┘  │
└─────────────────┘         └─────────────────┘
```

**Use Case:** Production, high availability

### 5.3 Hybrid Deployment

| Component | Location | Reason |
|-----------|----------|--------|
| Edge Functions | Cloud | Scalability |
| Database | Dedicated | Performance |
| Secrets | HSM | Security |

---

## 6. Scaling Guidelines

### 6.1 Horizontal Scaling

| Component | Scaling Trigger | Method |
|-----------|-----------------|--------|
| Edge Functions | CPU > 70% | Auto-scale |
| Database Reads | Query latency > 100ms | Add replica |
| Cache | Hit rate < 80% | Scale up |

### 6.2 Vertical Scaling

| Component | Scaling Trigger | Approach |
|-----------|-----------------|----------|
| Database | CPU > 80% sustained | Upgrade tier |
| Cache | Memory > 90% | Upgrade tier |

### 6.3 Scaling Limits

| Metric | Soft Limit | Hard Limit |
|--------|------------|------------|
| Concurrent functions | 100 | 1000 |
| Database connections | 100 | 500 |
| Request rate | 2000/sec | 10000/sec |

---

## 7. High Availability

### 7.1 Redundancy Requirements

| Component | Redundancy | Recovery Time |
|-----------|------------|---------------|
| Edge Functions | 3+ instances | Immediate |
| Database | Primary + replica | < 30 sec |
| Load Balancer | Active-passive | < 10 sec |

### 7.2 Failover Procedures

| Scenario | Automatic | Manual Action |
|----------|-----------|---------------|
| Function failure | Yes | None |
| Database failover | Yes | Verify |
| Region failure | No | DNS switch |

### 7.3 Backup Strategy

| Data Type | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Continuous + daily | 30 days |
| Object storage | Daily | 90 days |
| Configuration | On change | Indefinite |

---

## 8. Security Configuration

### 8.1 Network Security

| Layer | Protection |
|-------|------------|
| Edge | WAF, DDoS protection |
| Transport | TLS 1.3 |
| Database | Private network, SSL |
| Secrets | Encrypted at rest |

### 8.2 Access Control

| Resource | Authentication | Authorization |
|----------|----------------|---------------|
| API | API Key / JWT | RBAC |
| Database | Service account | RLS policies |
| Admin | MFA required | Role-based |

### 8.3 Compliance Considerations

| Standard | Requirements |
|----------|--------------|
| SOC 2 | Audit logging, access control |
| GDPR | Data encryption, deletion |
| HIPAA | PHI handling (if applicable) |

---

## 9. Monitoring Setup

### 9.1 Required Metrics

| Category | Metrics |
|----------|---------|
| Application | Request rate, latency, errors |
| Database | Connections, query time, replication lag |
| System | CPU, memory, disk, network |
| Business | Evolutions, capabilities invoked |

### 9.2 Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | > 1% | > 5% |
| Latency (p99) | > 500ms | > 2s |
| CPU | > 70% | > 90% |
| Disk | > 80% | > 95% |

### 9.3 Log Aggregation

| Log Type | Destination | Retention |
|----------|-------------|-----------|
| Application | Central logging | 30 days |
| Audit | Secure storage | 2 years |
| Debug | Ephemeral | 7 days |

---

## 10. Disaster Recovery

### 10.1 Recovery Objectives

| Objective | Target |
|-----------|--------|
| RTO (Recovery Time) | < 4 hours |
| RPO (Recovery Point) | < 1 hour |

### 10.2 Recovery Procedures

| Scenario | Procedure |
|----------|-----------|
| Data corruption | Restore from backup |
| Region outage | Failover to secondary |
| Complete loss | Rebuild from IaC + backups |

### 10.3 Testing Schedule

| Test Type | Frequency |
|-----------|-----------|
| Backup restore | Monthly |
| Failover drill | Quarterly |
| Full DR test | Annually |

---

## 11. Upgrade Path

### 11.1 Version Upgrades

| Upgrade Type | Downtime | Procedure |
|--------------|----------|-----------|
| Patch | Zero | Rolling update |
| Minor | Zero | Rolling update + migration |
| Major | Planned | Blue-green deployment |

### 11.2 Database Migrations

| Migration Type | Approach |
|----------------|----------|
| Additive | Online (no downtime) |
| Destructive | Maintenance window |
| Data backfill | Background job |

---

## 12. Cost Estimation

### 12.1 Monthly Cost Ranges

| Tier | Infrastructure | AI Costs | Total |
|------|----------------|----------|-------|
| Small | $50-100 | $100-500 | $150-600 |
| Medium | $200-500 | $500-2000 | $700-2500 |
| Large | $500-2000 | $2000-10000 | $2500-12000 |

### 12.2 Cost Optimization

| Strategy | Savings |
|----------|---------|
| Reserved instances | 30-50% |
| Efficient caching | 20-40% AI costs |
| Right-sizing | 10-20% |

---

*CMPSBL OS Substrate v9.1.0 — Deployment Model*  
*© 2025-2026 PromptFluid®. All rights reserved.*
