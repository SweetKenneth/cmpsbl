# promptfluid substrate — Deployment Guide

## v2026.01 — Cognitive Orchestration Substrate for AI Systems

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-DEPLOY-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Overview

This guide covers the deployment of the promptfluid substrate, including infrastructure requirements, environment configuration, and operational procedures.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Edge                              │
│              (Cloudflare / Vercel Edge)                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│              (React SPA on Vercel/Netlify)                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Edge Functions Layer                        │
│              (Supabase Edge Functions)                       │
│                    268+ Functions                            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│              (Supabase PostgreSQL)                           │
│                    75+ Tables                                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                External Services                             │
│    (AI Providers, Email, Storage, Analytics)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Requirements

### Supabase Project

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Plan | Pro | Team/Enterprise |
| Database Size | 8 GB | 32 GB+ |
| Bandwidth | 50 GB/month | 250 GB/month |
| Edge Function Invocations | 2M/month | 10M/month |
| Realtime Connections | 500 | 5000 |
| Storage | 100 GB | 1 TB |

### Frontend Hosting

| Platform | Tier | Features Required |
|----------|------|-------------------|
| Vercel | Pro | Edge Functions, Analytics |
| Netlify | Pro | Edge Functions, Forms |
| Cloudflare Pages | Pro | Workers, KV Storage |

### External Services

| Service | Purpose | Required |
|---------|---------|----------|
| Resend | Email delivery | Yes |
| Groq | Primary AI (fast) | Yes |
| OpenAI | Fallback AI | Yes |
| Anthropic | Fallback AI | Optional |
| Perplexity | Research | Optional |
| Fal.ai | Image generation | Optional |
| Replicate | Image/Video | Optional |

---

## Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...

# Optional AI Providers
PERPLEXITY_API_KEY=pplx-...
FAL_KEY=...
REPLICATE_API_TOKEN=r8_...

# Application
SITE_URL=https://yourdomain.com
FOUNDER_EMAIL=promptfluid@gmail.com
```

### Frontend Environment

```bash
# .env (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Secret Management

Secrets are stored in Supabase Vault:

```sql
-- Add secret
SELECT vault.create_secret('GROQ_API_KEY', 'gsk_...');

-- Retrieve secret (in Edge Function)
const apiKey = Deno.env.get('GROQ_API_KEY');
```

---

## Database Setup

### Initial Migration

```bash
# Apply all migrations
supabase db push

# Or run specific migration
supabase migration up
```

### Required Tables

Core tables that must exist:

```
brain_memories
brain_memory_hot
brain_memory_cold
brain_graph_edges
brain_reflections
brain_feedback
brain_orchestrator_state
defense_events
defense_rules
ip_reputation
ai_usage_log
ai_daily_quota
cascade_dreams
cascade_conversations
ecosystem_memory
evolution_proposals
audit_logs
```

### Enable Realtime

```sql
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE brain_memories;
ALTER PUBLICATION supabase_realtime ADD TABLE defense_events;
ALTER PUBLICATION supabase_realtime ADD TABLE cascade_dreams;
ALTER PUBLICATION supabase_realtime ADD TABLE ecosystem_memory;
```

### Schedule Cron Jobs

```sql
-- Continuous learning (every 10 minutes)
SELECT cron.schedule(
  'cascade-continuous-learn',
  '*/10 * * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/pf-brain-continuous-learn',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  )$$
);

-- Operative mode (every 15 minutes)
SELECT cron.schedule(
  'cascade-operative-mode',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/pf-cascade-operative',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  )$$
);

-- Dream cycles (every 2 hours)
SELECT cron.schedule(
  'cascade-dream-cycles',
  '0 */2 * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/pf-brain-dream',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  )$$
);

-- Daily reflection (3 AM CST)
SELECT cron.schedule(
  'brain-reflection',
  '0 9 * * *',  -- 9 AM UTC = 3 AM CST
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/pf-brain-reflect',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  )$$
);
```

---

## Edge Function Deployment

### Deploy All Functions

```bash
# Deploy all edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy pf-brain

# Deploy with custom config
supabase functions deploy --project-ref your-project
```

### Function Configuration

```toml
# supabase/config.toml
[functions.pf-brain]
verify_jwt = false

[functions.pf-cascade-operative]
verify_jwt = false

[functions.pf-bot-detection]
verify_jwt = false
```

### Health Check

```bash
# Verify function deployment
curl https://your-project.supabase.co/functions/v1/pf-brain-status

# Expected response
{
  "status": "healthy",
  "metrics": {...}
}
```

---

## Frontend Deployment

### Build Configuration

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
});
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## WordPress Plugin Deployment

### Bot Sniper Plugin

```bash
# Package plugin
cd wordpress-plugins/promptfluid-reflex-bot-sniper
zip -r promptfluid-reflex-bot-sniper.zip .

# Upload to WordPress.org
# Follow SVN commit process
```

### Configuration

```php
// wp-config.php additions
define('PROMPTFLUID_API_URL', 'https://your-project.supabase.co/functions/v1');
define('PROMPTFLUID_API_KEY', 'your-api-key');
```

---

## Monitoring Setup

### Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/pf-brain-status` | Brain health | `{ status: "healthy" }` |
| `/pf-vision-health` | System health | `{ status: "healthy" }` |
| `/pf-defense-status` | Defense health | `{ status: "active" }` |

### Alerting Configuration

```typescript
// Configure alerts
const ALERT_CONFIG = {
  email: 'promptfluid@gmail.com',
  thresholds: {
    error_rate: 0.05,      // 5% error rate
    latency_ms: 5000,      // 5 second latency
    memory_usage: 0.9,     // 90% memory
    quota_usage: 0.8       // 80% quota
  }
};
```

### Log Aggregation

```sql
-- Query recent errors
SELECT * FROM audit_logs
WHERE action LIKE 'error%'
ORDER BY created_at DESC
LIMIT 100;

-- Query function invocations
SELECT 
  function_name,
  COUNT(*) as invocations,
  AVG(response_time_ms) as avg_latency
FROM function_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY function_name;
```

---

## Scaling Considerations

### Database Scaling

| Load Level | Configuration |
|------------|---------------|
| Low (<1K daily users) | Pro plan, single replica |
| Medium (1K-10K) | Pro plan, read replicas |
| High (10K-100K) | Team plan, connection pooling |
| Enterprise (100K+) | Enterprise, dedicated compute |

### Edge Function Scaling

Edge functions scale automatically, but consider:

- **Cold starts**: Keep functions warm with scheduled pings
- **Memory limits**: 256 MB per function
- **Timeout**: 150 seconds max

### Caching Strategy

```typescript
// Implement caching for expensive operations
const CACHE_CONFIG = {
  brain_queries: { ttl: 300 },      // 5 minutes
  defense_rules: { ttl: 60 },       // 1 minute
  ai_responses: { ttl: 3600 },      // 1 hour (if deterministic)
  static_config: { ttl: 86400 }     // 24 hours
};
```

---

## Backup & Recovery

### Database Backups

Supabase provides:
- Point-in-time recovery (PITR)
- Daily automated backups
- Manual backup triggers

```sql
-- Create manual backup point
SELECT pg_create_restore_point('pre_migration_backup');
```

### Configuration Backup

```bash
# Export function definitions
supabase functions list > functions_backup.json

# Export database schema
pg_dump --schema-only > schema_backup.sql

# Export secrets (encrypted)
supabase secrets list > secrets_backup.enc
```

### Recovery Procedures

1. **Database Recovery**
   - Access Supabase Dashboard → Database → Backups
   - Select restore point
   - Initiate recovery

2. **Function Recovery**
   - Redeploy from git repository
   - `supabase functions deploy`

3. **Configuration Recovery**
   - Restore secrets from backup
   - Verify environment variables
   - Test health endpoints

---

## Security Checklist

### Pre-Deployment

- [ ] All RLS policies enabled
- [ ] Service role key secured
- [ ] API keys in Vault
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation implemented

### Post-Deployment

- [ ] Health endpoints responding
- [ ] Cron jobs scheduled
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup verified
- [ ] SSL certificates valid

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Function timeout | Long-running operation | Optimize or use background job |
| Database connection | Pool exhaustion | Enable connection pooling |
| Auth failures | Invalid JWT | Check token expiration |
| CORS errors | Missing headers | Update function CORS config |
| Rate limiting | Quota exceeded | Upgrade plan or optimize |

### Debug Commands

```bash
# Check function logs
supabase functions logs pf-brain

# Check database logs
supabase db logs

# Test function locally
supabase functions serve pf-brain
```

---

## Ownership & Licensing

promptfluid® is a registered trademark. For ownership inquiries, licensing arrangements, or enterprise partnerships:

| Contact | Details |
|---------|---------|
| **Founder** | Kenneth E Sweet Jr |
| **Email** | promptfluid@gmail.com |
| **Phone** | (760) FLUID-AI |
| **Web** | https://promptfluid.com |

---

**Last Updated:** January 13, 2026  
**Document Status:** STABLE
