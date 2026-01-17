# promptfluid® Substrate — Deployment Guide

**v2026.01 — Setup, Configuration, and Deployment**

---

## Prerequisites

### Required
- Supabase project (or compatible PostgreSQL + Edge Functions)
- Node.js 18+ or Bun runtime
- Git

### Optional (for AI features)
- Groq API key (primary AI provider)
- OpenAI API key (fallback)
- Cerebras API key (fallback)
- Together API key (fallback)
- DeepSeek API key (fallback)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/promptfluid/substrate.git
cd substrate
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Supabase

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push database migrations
supabase db push
```

### 4. Configure Secrets

```bash
# Required for AI features
supabase secrets set GROQ_API_KEY=your_groq_key

# Optional fallback providers
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set CEREBRAS_API_KEY=your_cerebras_key
supabase secrets set TOGETHER_API_KEY=your_together_key
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_key
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy pf-substrate
```

### 6. Verify Deployment

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate \
  -H "Content-Type: application/json" \
  -d '{"module": "vision", "action": "health"}'
```

---

## Environment Configuration

### Frontend Environment Variables

Create `.env` or use your project's environment configuration:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Edge Function Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `GROQ_API_KEY` | Yes* | Primary AI provider |
| `OPENAI_API_KEY` | No | Fallback AI provider |
| `CEREBRAS_API_KEY` | No | Fallback AI provider |
| `TOGETHER_API_KEY` | No | Fallback AI provider |
| `DEEPSEEK_API_KEY` | No | Fallback AI provider |
| `RESEND_API_KEY` | No | Email notifications |
| `ADMIN_EMAIL` | No | Admin notification address |

*Required for AI-powered features. Substrate works without AI keys for non-AI operations.

---

## Database Schema

### Core Tables

The substrate requires these table groups:

**Brain Module:**
- `brain_memories`
- `brain_memory_hot`
- `brain_memory_cold`
- `brain_graph_edges`
- `brain_reflections`
- `brain_forecasts`
- `brain_orchestrator_state`

**Defense Module:**
- `defense_events`
- `defense_rules`
- `ip_reputation`
- `edge_rate_limits`

**Dream Module:**
- `dream_eater_state`
- `dream_feeder_submissions`
- `dream_sessions`
- `dream_log`

**Vision Module:**
- `audit_logs`
- `learning_logs`

**System Module:**
- `core_settings`
- `core_usage`

### Running Migrations

```bash
# Apply all migrations
supabase db push

# Or run specific migration
supabase migration up
```

---

## Edge Functions

### Main Gateway

The `pf-substrate` function is the primary entry point:

```
supabase/functions/pf-substrate/index.ts
```

### Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy pf-substrate

# Deploy with verification
supabase functions deploy pf-substrate --verify-jwt
```

### Function Configuration

Edit `supabase/config.toml` for function settings:

```toml
[functions.pf-substrate]
verify_jwt = false  # Set true for auth-required endpoints
```

---

## Verification Checklist

### Database
- [ ] All migrations applied
- [ ] Tables created with RLS policies
- [ ] Database functions deployed
- [ ] Triggers active

### Edge Functions
- [ ] `pf-substrate` deployed
- [ ] Secrets configured
- [ ] Health check returns OK

### Frontend
- [ ] Environment variables set
- [ ] Supabase client configured
- [ ] SDK imports working

### Security
- [ ] RLS policies enabled
- [ ] Rate limits configured
- [ ] Authentication working

---

## Testing Deployment

### Health Check

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate \
  -H "Content-Type: application/json" \
  -d '{"module": "vision", "action": "health"}'
```

Expected response:
```json
{
  "success": true,
  "module": "vision",
  "action": "health",
  "data": {
    "status": "healthy",
    "modules": { ... }
  }
}
```

### Brain Module

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate \
  -H "Content-Type: application/json" \
  -d '{"module": "brain", "action": "status"}'
```

### With Authentication

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"module": "brain", "action": "query", "payload": {"query_text": "test"}}'
```

---

## Troubleshooting

### Common Issues

**Function not found (404):**
- Verify function is deployed: `supabase functions list`
- Check function name matches exactly

**Authentication errors (401):**
- Verify JWT token is valid
- Check token hasn't expired
- Confirm user has required permissions

**Database errors (500):**
- Check migrations are applied
- Verify RLS policies
- Review function logs: `supabase functions logs pf-substrate`

**Rate limit errors (429):**
- Wait for rate limit window to reset
- Increase limits if needed
- Check if IP is blocked

### Viewing Logs

```bash
# Real-time logs
supabase functions logs pf-substrate --tail

# Historical logs
supabase functions logs pf-substrate --since 1h
```

---

## Upgrading

### Version Upgrade Process

1. **Backup current state:**
   ```bash
   supabase db dump > backup.sql
   ```

2. **Pull latest code:**
   ```bash
   git pull origin main
   ```

3. **Apply migrations:**
   ```bash
   supabase db push
   ```

4. **Redeploy functions:**
   ```bash
   supabase functions deploy pf-substrate
   ```

5. **Verify:**
   ```bash
   curl -X POST .../pf-substrate -d '{"module": "system", "action": "version"}'
   ```

---

## Production Checklist

- [ ] Database backups configured
- [ ] Monitoring/alerting set up
- [ ] Rate limits tuned for expected load
- [ ] JWT verification enabled for sensitive endpoints
- [ ] RLS policies reviewed
- [ ] Secrets rotated from development values
- [ ] Error tracking configured
- [ ] Performance baselines established

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
