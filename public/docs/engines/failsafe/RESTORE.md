# RESTORE.md — AI-Agent Restore Protocol
## FAILSAFE Disaster Recovery Engine · Machine-Readable Instructions

**Format:** Structured restore protocol for autonomous AI agents  
**Version:** 1.0.0  
**Runtime:** Sealed · Black-boxed  

---

## CONTEXT

You are restoring a CMPSBL cognitive operating system from a disaster recovery archive. This archive contains everything needed to reconstruct the full environment: source code, database schema, edge functions, design tokens, and table data.

**System type:** React + Vite + TypeScript + Tailwind CSS + Supabase  
**Architecture:** 40-node cognitive substrate with intent routing, resolver mesh, and telemetry  

---

## PRE-FLIGHT CHECKLIST

Before starting, confirm the following are available:

```
[ ] Node.js 18+ or Bun 1.0+ installed
[ ] Supabase CLI installed (`npm install -g supabase`)
[ ] A target Supabase project created (note the project ref, URL, and anon key)
[ ] Write access to the filesystem
[ ] The extracted archive directory as your working directory
```

---

## RESTORE SEQUENCE

Execute these steps **in exact order**. Do not skip or reorder.

### STEP 1 — Extract Archive

```bash
unzip failsafe-backup-*.zip -d restored-project
cd restored-project
```

**Verify:** Confirm `package.json`, `src/`, `supabase/`, and `data/` directories exist.

### STEP 2 — Install Dependencies

```bash
npm install
# or: bun install
```

**Verify:** `node_modules/` directory created without errors.

### STEP 3 — Configure Environment

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY>
VITE_SUPABASE_PROJECT_ID=<PROJECT_REF>
```

**Critical:** These three variables are required. The app will not start without them.

### STEP 4 — Link Supabase Project

```bash
supabase link --project-ref <PROJECT_REF>
```

**Verify:** CLI confirms successful link.

### STEP 5 — Apply Database Migrations

```bash
supabase db push
```

This applies all migrations from `supabase/migrations/` in chronological order.

**If migration fails:**
1. Identify the failing migration file from the error output
2. Run migrations individually: `supabase migration up --include <filename>`
3. Fix any conflicts before proceeding
4. Common cause: table already exists → safe to skip that migration

**Verify:** All migrations applied. Run `supabase db diff` — output should be empty.

### STEP 6 — Restore Table Data

The `data/` directory contains JSON files, one per table. Each file is an array of row objects.

**CRITICAL — Import in dependency order to avoid foreign key violations:**

```
PHASE 1 (no dependencies):
  profiles
  user_roles
  system_flags
  access_products
  agency_templates
  cognitive_registry

PHASE 2 (references Phase 1):
  agencies
  access_developers
  access_api_keys

PHASE 3 (references Phase 2):
  agency_members
  access_subscriptions
  access_quotas

PHASE 4 (references Phase 3):
  agency_tasks
  agency_task_logs
  agency_task_artifacts
  agency_task_deliverables
  agency_scheduled_tasks
  agency_email_queue

PHASE 5 (all remaining tables — alphabetical):
  Import all remaining data/*.json files alphabetically
```

**Import method — use the Supabase client or psql:**

```javascript
// Node.js restore script pattern:
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function importTable(tableName) {
  const filePath = path.join('data', `${tableName}.json`);
  if (!fs.existsSync(filePath)) return;
  const rows = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (rows.length === 0) return;
  
  // Batch insert in chunks of 500
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id' });
    if (error) console.error(`[${tableName}] chunk ${i}: ${error.message}`);
  }
  console.log(`✓ ${tableName}: ${rows.length} rows imported`);
}
```

**Note:** Use the `service_role` key (not the anon key) for data import to bypass RLS.

### STEP 7 — Deploy Edge Functions

```bash
supabase functions deploy --project-ref <PROJECT_REF>
```

**If edge functions require secrets**, configure them:

```bash
supabase secrets set SECRET_NAME=secret_value
```

Check `supabase/config.toml` for function definitions and required secrets.

**Verify:** `supabase functions list` shows all functions as ACTIVE.

### STEP 8 — Build & Verify

```bash
npm run build
```

**Verify:** Build completes with zero errors. Warnings are acceptable.

### STEP 9 — Start Development Server

```bash
npm run dev
```

**Verify:**
1. Application loads at `http://localhost:5173`
2. No console errors related to missing env vars or failed Supabase connections
3. Authentication flow works (sign up / sign in)
4. Navigate to `/os` — substrate dashboard loads

---

## POST-RESTORE VALIDATION

Run these checks to confirm full restoration:

```
[ ] Homepage loads without errors
[ ] Authentication works (sign in / sign up)
[ ] Database tables accessible (check /os dashboard)
[ ] Edge functions respond (test via supabase functions invoke)
[ ] Build succeeds (npm run build)
[ ] No TypeScript compilation errors
```

---

## ERROR RECOVERY

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `relation does not exist` | Migrations not fully applied | Re-run `supabase db push` |
| `violates foreign key constraint` | Wrong import order | Follow Phase 1–5 order above |
| `JWT expired` or `invalid token` | Wrong anon key in .env | Regenerate from Supabase dashboard |
| `function not found` | Edge functions not deployed | Run `supabase functions deploy` |
| `VITE_SUPABASE_URL is undefined` | Missing .env file | Create .env per Step 3 |
| `permission denied` | RLS blocking service role | Use service_role key for imports |
| Build fails with missing module | Incomplete `npm install` | Delete `node_modules`, reinstall |

---

## ARCHITECTURE NOTES FOR AI AGENTS

This system is a **cognitive operating system**, not a standard web app. Key concepts:

- **40 nodes** form the substrate (BRAIN, MEMORY, DEFENSE, CORTEX, etc.)
- **Resolvers** are the execution surface: `node.resolver_name`
- **Intent routing** via `broadcastIntent()` coordinates all actions
- **Mesh communications** power real-time telemetry dashboards
- **Memory Stream** is the discovery engine generating new software pipelines

Do not restructure the architecture. Preserve node ownership, resolver naming, and intent routing patterns.

---

## SECRETS REFERENCE

These secrets may need configuration depending on your deployment:

| Secret | Required | Purpose |
|--------|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | For data import | Bypasses RLS during restore |
| `STRIPE_SECRET_KEY` | If payments enabled | Stripe integration |
| `RESEND_API_KEY` | If email enabled | Transactional emails |

---

© 2025–2026 CMPSBL®. All rights reserved.  
FAILSAFE is a sealed runtime. Redistribution prohibited.
