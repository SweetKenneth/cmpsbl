<div align="center">

# 🗄️ Database Schema Reference

### CONFIDENTIAL — Trade Secret

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Schema Overview

The substrate database consists of **50+ tables** organized by domain.

---

## Table Groups

### ACCESS Domain

| Table | Purpose | RLS |
|-------|---------|-----|
| `access_developers` | Developer accounts | ✅ Owner-only |
| `access_api_keys` | API key hashes and metadata | ✅ Owner-only |
| `access_subscriptions` | Tier subscriptions | ✅ Owner-only |
| `access_usage` | Per-request usage logs | ✅ Owner-only |
| `access_quotas` | Daily quota tracking | ✅ Owner-only |
| `access_products` | Product catalog | ✅ Read-all, Write-admin |
| `access_scans` | Accessibility scan results | ✅ Owner-only |

### Agency Domain

| Table | Purpose | RLS |
|-------|---------|-----|
| `agencies` | Agency definitions | ✅ Owner-only |
| `agency_members` | Agent roster per agency | ✅ Agency-scoped |
| `agency_tasks` | Task queue | ✅ Agency-scoped |
| `agency_task_logs` | Execution logs | ✅ Agency-scoped |
| `agency_task_artifacts` | Output files | ✅ Agency-scoped |
| `agency_task_deliverables` | Deliverable packages | ✅ Agency-scoped |
| `agency_email_queue` | Outbound emails | ✅ Agency-scoped |
| `agency_dream_memory` | Dream synthesis results | ✅ Agency-scoped |
| `agency_dream_pool` | Shared dream content | ✅ Consent-gated |
| `agency_dream_consent` | Privacy preferences | ✅ Agency-scoped |
| `agency_economics` | Cost/value tracking | ✅ Agency-scoped |
| `agency_agent_telemetry` | Per-agent metrics | ✅ Agency-scoped |
| `agency_api_calls` | External API call log | ✅ Agency-scoped |
| `agency_scheduled_tasks` | Scheduled/recurring tasks | ✅ Agency-scoped |
| `agency_settings` | Agency configuration | ✅ Agency-scoped |
| `agency_templates` | Pre-built agency types | ✅ Read-all |
| `agency_purchases` | Purchase records | ✅ Owner-only |

### AI Operations

| Table | Purpose | RLS |
|-------|---------|-----|
| `ai_daily_quota` | Provider quota tracking | ✅ System-only |
| `ai_learning_data` | Training/learning data | ✅ System-only |
| `ai_usage_log` | AI call telemetry | ✅ System-only |

### Cognitive Domain

| Table | Purpose | RLS |
|-------|---------|-----|
| `cognitive_registry` | Cognitive entity definitions | ✅ Owner-only |
| `agent_competency` | Agent skill tracking | ✅ Agency-scoped |

### Content Domain

| Table | Purpose | RLS |
|-------|---------|-----|
| `auto_blog_posts` | Generated blog content | ✅ System + Admin |
| `auto_blog_schedule` | Content schedule | ✅ System-only |
| `autoblog_queue` | Content generation queue | ✅ System-only |
| `autoblog_drafts` | Draft content | ✅ System-only |
| `autoblog_runs` | Generation run logs | ✅ System-only |

### System Domain

| Table | Purpose | RLS |
|-------|---------|-----|
| `atlas_capabilities` | Capability registry | ✅ Read-all, Write-admin |
| `audit_logs` | System audit trail | ✅ Admin-only |
| `accessibility_scans` | WCAG scan results | ✅ Owner-only |

---

## Key Relationships

```
access_developers ─┬── access_api_keys ──── access_quotas
                   ├── access_subscriptions
                   └── access_usage

agencies ─┬── agency_members ──── agent_competency
          ├── agency_tasks ─┬── agency_task_logs
          │                 ├── agency_task_artifacts
          │                 └── agency_task_deliverables
          ├── agency_dream_memory
          ├── agency_dream_pool
          ├── agency_dream_consent
          ├── agency_economics
          ├── agency_settings
          └── agency_purchases
```

---

## RLS Policy Patterns

### Owner-Only Pattern

```sql
CREATE POLICY "owner_access" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

### Agency-Scoped Pattern

```sql
CREATE POLICY "agency_member_access" ON table_name
  FOR ALL USING (
    agency_id IN (
      SELECT a.id FROM agencies a WHERE a.owner_id = auth.uid()
    )
  );
```

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
