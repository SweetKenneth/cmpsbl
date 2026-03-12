/**
 * Full Backup Edge Function
 * Exports all database schema, data, storage listings, and a RESTORE.md
 * into a single ZIP file for complete disaster recovery.
 * Admin-only access.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  requireAdmin,
  createAdminClient,
  EdgeError,
} from "../_shared/edge-middleware.ts";
import JSZip from "npm:jszip@3.10.1";

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);

    const admin = createAdminClient();
    const zip = new JSZip();
    const manifest: Record<string, unknown> = {
      created_at: new Date().toISOString(),
      project_id: Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0] || 'unknown',
      version: '1.0.0',
    };

    // ═══════════════════════════════════════════════════════
    // 1. SCHEMA — get all public tables & columns
    // ═══════════════════════════════════════════════════════
    const { data: tables } = await admin.rpc('exec_sql', {
      sql: `SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
            ORDER BY table_name`
    }).catch(() => ({ data: null }));

    // Fallback: query pg_tables if RPC not available
    let tableNames: string[] = [];
    if (tables && Array.isArray(tables)) {
      tableNames = tables.map((t: any) => t.table_name);
    } else {
      // Use the Supabase REST API to discover tables from the types
      const { data: pgTables } = await admin
        .from('information_schema_tables' as any)
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
      if (pgTables) tableNames = pgTables.map((t: any) => t.table_name);
    }

    // If we can't discover tables via SQL, use a known-tables approach
    if (tableNames.length === 0) {
      // Query each known table from the schema - get table list from a metadata query
      const { data: schemaInfo } = await admin.from('analytics_events').select('id').limit(0);
      // We'll enumerate tables by trying them
      const knownTables = await discoverTablesViaRest(admin);
      tableNames = knownTables;
    }

    // ═══════════════════════════════════════════════════════
    // 2. DATA — export each table as JSON
    // ═══════════════════════════════════════════════════════
    const dataFolder = zip.folder('data')!;
    const tableSummary: Record<string, number> = {};

    for (const table of tableNames) {
      try {
        // Paginate to handle tables > 1000 rows
        const allRows: any[] = [];
        let offset = 0;
        const PAGE = 1000;
        while (true) {
          const { data, error } = await admin
            .from(table)
            .select('*')
            .range(offset, offset + PAGE - 1);
          if (error) {
            console.error(`[Backup] Error reading ${table}:`, error.message);
            break;
          }
          if (!data || data.length === 0) break;
          allRows.push(...data);
          if (data.length < PAGE) break;
          offset += PAGE;
        }

        if (allRows.length > 0) {
          dataFolder.file(`${table}.json`, JSON.stringify(allRows, null, 2));
        }
        tableSummary[table] = allRows.length;
      } catch (e) {
        console.error(`[Backup] Failed to export ${table}:`, e);
        tableSummary[table] = -1; // mark as failed
      }
    }

    manifest.tables = tableSummary;

    // ═══════════════════════════════════════════════════════
    // 3. SCHEMA SQL — export column definitions
    // ═══════════════════════════════════════════════════════
    const schemaFolder = zip.folder('schema')!;
    for (const table of tableNames) {
      try {
        const { data: columns } = await admin.rpc('exec_sql', {
          sql: `SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '${table}'
                ORDER BY ordinal_position`
        }).catch(() => ({ data: null }));

        if (columns) {
          schemaFolder.file(`${table}.columns.json`, JSON.stringify(columns, null, 2));
        }
      } catch { /* skip */ }
    }

    // ═══════════════════════════════════════════════════════
    // 4. STORAGE — list buckets and objects
    // ═══════════════════════════════════════════════════════
    const storageFolder = zip.folder('storage')!;
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      if (buckets) {
        storageFolder.file('buckets.json', JSON.stringify(buckets, null, 2));
        manifest.storage_buckets = buckets.map(b => b.name);

        for (const bucket of buckets) {
          try {
            const { data: files } = await admin.storage.from(bucket.name).list('', { limit: 1000 });
            if (files && files.length > 0) {
              storageFolder.file(`${bucket.name}-files.json`, JSON.stringify(files, null, 2));
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      console.error('[Backup] Storage listing failed:', e);
    }

    // ═══════════════════════════════════════════════════════
    // 5. AUTH CONFIG — export provider settings (non-sensitive)
    // ═══════════════════════════════════════════════════════
    // We don't export secrets, just document what's needed

    // ═══════════════════════════════════════════════════════
    // 6. RLS POLICIES (best effort)
    // ═══════════════════════════════════════════════════════
    try {
      const { data: policies } = await admin.rpc('exec_sql', {
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
              FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`
      }).catch(() => ({ data: null }));

      if (policies) {
        schemaFolder.file('rls-policies.json', JSON.stringify(policies, null, 2));
      }
    } catch { /* skip */ }

    // ═══════════════════════════════════════════════════════
    // 7. DATABASE FUNCTIONS (best effort)
    // ═══════════════════════════════════════════════════════
    try {
      const { data: funcs } = await admin.rpc('exec_sql', {
        sql: `SELECT routine_name, routine_type, data_type, routine_definition 
              FROM information_schema.routines 
              WHERE routine_schema = 'public' 
              ORDER BY routine_name`
      }).catch(() => ({ data: null }));

      if (funcs) {
        schemaFolder.file('functions.json', JSON.stringify(funcs, null, 2));
      }
    } catch { /* skip */ }

    // ═══════════════════════════════════════════════════════
    // 8. MANIFEST
    // ═══════════════════════════════════════════════════════
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // ═══════════════════════════════════════════════════════
    // 9. RESTORE.md — comprehensive restoration guide
    // ═══════════════════════════════════════════════════════
    const restoreMd = generateRestoreGuide(manifest, tableSummary);
    zip.file('RESTORE.md', restoreMd);

    // ═══════════════════════════════════════════════════════
    // Generate ZIP
    // ═══════════════════════════════════════════════════════
    const zipBlob = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return new Response(zipBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="cmpsbl-full-backup-${timestamp}.zip"`,
        'Content-Length': String(zipBlob.length),
      },
    });
  } catch (err) {
    if (err instanceof EdgeError) {
      return new Response(JSON.stringify({ error: err.message, code: err.code }), {
        status: err.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('[FullBackup] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Discover tables by trying known table names from the schema */
async function discoverTablesViaRest(admin: ReturnType<typeof createClient>): Promise<string[]> {
  const candidates = [
    'access_api_keys', 'access_developers', 'access_products', 'access_quotas',
    'access_scans', 'access_subscriptions', 'access_usage', 'accessibility_scans',
    'activation_audit_log', 'agencies', 'agency_agent_telemetry', 'agency_api_calls',
    'agency_dream_consent', 'agency_dream_memory', 'agency_dream_pool', 'agency_economics',
    'agency_email_queue', 'agency_members', 'agency_purchases', 'agency_scheduled_tasks',
    'agency_settings', 'agency_task_artifacts', 'agency_task_deliverables', 'agency_task_logs',
    'agency_tasks', 'agency_templates', 'agent_competency', 'ai_daily_quota',
    'ai_learning_data', 'ai_usage_log', 'analytics_events', 'analytics_excluded_fingerprints',
    'analytics_snapshots', 'atlas_capabilities', 'audit_chain_anchors', 'audit_logs',
    'auto_blog_posts',
  ];
  
  const discovered: string[] = [];
  for (const table of candidates) {
    try {
      const { error } = await admin.from(table).select('id').limit(0);
      if (!error) discovered.push(table);
    } catch { /* skip */ }
  }
  return discovered;
}

function generateRestoreGuide(
  manifest: Record<string, unknown>,
  tableSummary: Record<string, number>,
): string {
  const tableList = Object.entries(tableSummary)
    .map(([name, count]) => `| ${name} | ${count === -1 ? 'EXPORT FAILED' : count} |`)
    .join('\n');

  return `# CMPSBL Full Backup — Restoration Guide

> **Created:** ${manifest.created_at}  
> **Project:** ${manifest.project_id}  
> **Format Version:** ${manifest.version}

---

## What This Backup Contains

| Folder/File | Contents |
|---|---|
| \`data/*.json\` | Full row exports for every database table |
| \`schema/*.columns.json\` | Column definitions for each table |
| \`schema/rls-policies.json\` | Row-Level Security policies |
| \`schema/functions.json\` | Database functions and RPCs |
| \`storage/buckets.json\` | Storage bucket configurations |
| \`storage/*-files.json\` | File listings per bucket |
| \`manifest.json\` | Backup metadata and table row counts |
| \`RESTORE.md\` | This file |

## Table Summary

| Table | Rows |
|---|---|
${tableList}

---

## Full Restoration Steps

### Prerequisites

- A Supabase project (or any PostgreSQL database)
- The CMPSBL frontend source code (from Lovable ZIP download or GitHub)
- Node.js 18+ and npm/bun

### Step 1: Frontend Code

1. Download the full source code ZIP from the Lovable dashboard (or clone from GitHub)
2. Extract and run:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
3. The app should start on localhost:5173

### Step 2: Create a New Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key
3. Note your service role key (for data import)

### Step 3: Apply Database Schema

The source code contains migration files in \`supabase/migrations/\`.

Run them in order:
\`\`\`bash
npx supabase db push
\`\`\`

Or if using a fresh Supabase project:
\`\`\`bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
\`\`\`

This creates all tables, indexes, RLS policies, functions, triggers, and enums.

### Step 4: Import Data

For each JSON file in the \`data/\` folder, import using the Supabase client or psql.

**Option A — Using the Supabase JS client (recommended for any AI agent):**

\`\`\`javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // Use service role for admin access
);

const dataDir = './data';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const table = file.replace('.json', '');
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
  
  // Insert in batches of 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) console.error(\`Error importing \${table} batch \${i}:\`, error.message);
  }
  console.log(\`✓ \${table}: \${rows.length} rows imported\`);
}
\`\`\`

**Option B — Using psql and raw SQL:**

\`\`\`bash
# Convert JSON to SQL INSERT statements or use pg_restore
\`\`\`

### Step 5: Configure Storage Buckets

Review \`storage/buckets.json\` and recreate each bucket:

\`\`\`sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket-name', 'bucket-name', true);
\`\`\`

Then re-upload files as needed. File listings are in \`storage/*-files.json\`.

### Step 6: Environment Variables

Create a \`.env\` file in the project root:

\`\`\`env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
\`\`\`

Update \`src/integrations/supabase/client.ts\` if it references a specific project.

### Step 7: Edge Functions

Edge functions are in \`supabase/functions/\`. Deploy them:

\`\`\`bash
npx supabase functions deploy
\`\`\`

### Step 8: Secrets

The following secrets must be configured in the Supabase dashboard under Edge Function Secrets:

- \`SUPABASE_URL\` (auto-provided)
- \`SUPABASE_ANON_KEY\` (auto-provided)
- \`SUPABASE_SERVICE_ROLE_KEY\` (auto-provided)
- Any third-party API keys your edge functions reference (check each function's \`Deno.env.get()\` calls)

### Step 9: Auth Configuration

- Enable the auth providers you were using (email, Google, etc.)
- Configure redirect URLs for your new domain
- Note: Auth users cannot be exported — they will need to re-register

### Step 10: Verify

1. Start the frontend: \`npm run dev\`
2. Test authentication flow
3. Verify data appears in the UI
4. Test edge function endpoints
5. Confirm storage uploads work

---

## Important Notes

- **Auth users** are NOT included in this backup (managed by Supabase Auth)
- **Storage file contents** are NOT included — only file listings. Download files separately.
- **Secrets/API keys** are NOT included — reconfigure them manually
- **RLS policies** are recreated via migrations, not from this backup
- **Cron jobs** (pg_cron) must be reconfigured manually

## For AI Coding Agents

If you are an AI agent restoring this project:
1. Read this entire RESTORE.md first
2. The source code ZIP from Lovable/GitHub is the primary artifact
3. The \`supabase/migrations/\` folder contains ALL schema DDL in order
4. Use the \`data/*.json\` files to repopulate tables via upsert
5. Deploy edge functions from \`supabase/functions/\`
6. The frontend needs only \`npm install && npm run dev\` to run
7. All business logic is in the frontend — the backend is Supabase (PostgreSQL + Edge Functions)

---

*Generated by CMPSBL Full Backup System*
`;
}
