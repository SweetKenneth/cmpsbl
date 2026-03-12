# 42 — Disaster Recovery & FAILSAFE Engine

**Classification:** 🔒 INTERNAL  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document covers the substrate's disaster recovery systems, including the one-click backup system, the FAILSAFE standalone engine (the only standalone engine in the catalog), and restore procedures.

## 2. One-Click Backup System

### 2.1 Access Points

The backup can be triggered from two locations:
1. **Admin → Security** → "Full System Backup" button
2. **OS Dashboard** → "Failsafe Backup" button

### 2.2 Architecture

```
Trigger (UI button)
       ↓
  Edge Function: backup-system
       ↓
  Sequential Table Processing (memory-efficient)
       ↓
  ZipStreamWriter (streaming ZIP output)
       ↓
  Adaptive Page-Sizing + Retry Logic
       ↓
  ZIP Download → Browser
```

### 2.3 What's Included

| Category | Contents |
|----------|---------|
| Source code | All `src/`, `docs/`, `public/` text files |
| Schema definitions | Table DDL, RLS policies, function definitions |
| Table data | Chunked JSON exports (100 rows per page) |
| Restore guide | `RESTORE.md` — AI-ready environment reconstruction instructions |

### 2.4 What's Excluded

| Exclusion | Reason |
|-----------|--------|
| Binary assets (images, fonts) | Managed via Git history |
| High-volume telemetry tables (~40) | Would exceed 120s execution limit |
| `node_modules` | Reproducible from `package.json` |

### 2.5 Skipped Tables (SKIP_TABLE_PATTERNS)

These tables are excluded from backup to ensure completion within the edge function timeout:

- `owner_reports`, `brain_events`, `analytics_events`
- `mesh_comms`, `brain_metrics`, `ai_learning_data`
- `learning_logs`, `nexus_logs`, `ai_usage_log`, `ai_query_log`
- And approximately 30 other high-volume telemetry/log tables

### 2.6 Performance

| Metric | Value |
|--------|-------|
| Execution limit | 120 seconds |
| Processing model | Sequential (memory-efficient) |
| Page size | Adaptive (starts at 100, reduces on timeout) |
| Retry logic | Automatic retry with smaller page sizes |
| Output format | Streaming ZIP |

## 3. FAILSAFE Standalone Engine

### 3.1 Why FAILSAFE Is Special

FAILSAFE is the **only** engine in the 54-engine catalog that is delivered as standalone code. All other engines are hosted and accessed via the Unified API Gateway (see doc 40).

**Rationale:** A disaster recovery engine cannot depend on the infrastructure it's designed to recover. FAILSAFE must work when everything else is down.

### 3.2 Capabilities

| Capability | Description |
|------------|-------------|
| Full system backup | Exports all tables, schema, and source code |
| Health diagnostics | Reports database connectivity, table row counts, storage usage |
| Restore instructions | Generates environment-specific restore procedures |
| Schema export | DDL for all tables, functions, policies, and triggers |

### 3.3 Deployment Options

FAILSAFE can be deployed to:
- Supabase Edge Functions (primary)
- Deno Deploy
- Cloudflare Workers (with adapter)

### 3.4 Configuration

Required environment variables:
```
SUPABASE_URL        — Target database URL
SUPABASE_SERVICE_KEY — Service role key (full access)
```

### 3.5 Invocation

```bash
# Manual trigger
curl -X POST https://{host}/functions/v1/engine-failsafe \
  -H "Authorization: Bearer {service_key}" \
  -H "Content-Type: application/json" \
  -d '{"action": "backup"}'

# Available actions: backup, health, schema
```

## 4. Restore Procedures

### 4.1 From Backup ZIP

The `RESTORE.md` file in every backup ZIP contains:

1. **Environment Setup** — Create new project, configure auth
2. **Schema Restoration** — Execute DDL scripts in dependency order
3. **Data Import** — Load chunked JSON files into tables
4. **Verification** — Row count comparison against backup manifest
5. **DNS/Auth** — Reconfigure custom domains and auth providers

### 4.2 AI-Assisted Restore

The `RESTORE.md` is specifically formatted for AI agent consumption:
- Step-by-step numbered instructions
- Exact SQL commands (copy-paste ready)
- Verification queries after each step
- Rollback instructions for each step

## 5. Automated Backup Scheduling

### 5.1 Recommended Schedule

| Frequency | Scope | Method |
|-----------|-------|--------|
| Daily | Critical tables (vault, config, keys) | Cron-triggered edge function |
| Weekly | Full system backup | Manual or scheduled |
| Pre-evolution | Full system | Automatic before SEBA mutations |

### 5.2 Cron Configuration

```
# Daily critical backup at 3:00 AM UTC
0 3 * * * curl -X POST .../engine-failsafe -d '{"action":"backup","scope":"critical"}'

# Weekly full backup on Sunday at 2:00 AM UTC
0 2 * * 0 curl -X POST .../engine-failsafe -d '{"action":"backup","scope":"full"}'
```

## 6. Security

| Concern | Mitigation |
|---------|-----------|
| Backup contains sensitive data | Service role key required for access |
| Backup ZIP in transit | HTTPS encryption |
| Stored backups | Customer responsibility — recommend encrypted storage |
| Service key exposure | Never included in backup ZIP; must be provided separately |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | Initial Disaster Recovery & FAILSAFE documentation — v14.2.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
