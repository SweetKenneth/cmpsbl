/**
 * Full Backup Edge Function — Disaster Recovery ZIP
 * Exports ALL database data, storage listings, and a complete RESTORE.md.
 * Admin-only. Uses the PostgREST OpenAPI spec to discover every table.
 * 
 * Memory-optimized: processes tables sequentially, streams JSON strings
 * directly into ZIP to minimize peak memory usage.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  requireAdmin,
  createAdminClient,
  EdgeError,
} from "../_shared/edge-middleware.ts";

/** Max wall-clock time budget (ms). Edge functions timeout at ~150s; we stop at 130s. */
const TIME_BUDGET_MS = 130_000;
/** Page size for table exports */
const PAGE_SIZE = 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createAdminClient();
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown';

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `cmpsbl-full-backup-${ts}.zip`;

    const { readable, writable } = new TransformStream<Uint8Array>();
    const backupStart = Date.now();

    (async () => {
      const writer = writable.getWriter();
      const zip = new ZipStreamWriter(writer);

      try {
        const errors: string[] = [];
        const manifest: Record<string, unknown> = {
          created_at: new Date().toISOString(),
          project_ref: projectRef,
          format_version: '2.3.0',
          backup_type: 'full',
          packaging: 'streaming-zip',
          chunked_table_exports: true,
        };

        console.log('[FullBackup] Starting backup...');

        // ═══════════════════════════════════════════════════════
        // 1. DISCOVER ALL TABLES via PostgREST OpenAPI spec
        // ═══════════════════════════════════════════════════════
        let tableNames: string[] = [];
        try {
          const openApiRes = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          });

          if (openApiRes.ok) {
            const specText = await openApiRes.text();
            await zip.addTextFile('schema/openapi-spec.json', specText);

            const spec = JSON.parse(specText);
            if (spec.paths) {
              tableNames = Object.keys(spec.paths)
                .map((p) => p.replace(/^\//, ''))
                .filter((n) => n && !n.includes('/') && !n.startsWith('rpc/'));
            }
          } else {
            errors.push(`OpenAPI discovery failed: HTTP ${openApiRes.status}`);
            await openApiRes.text();
          }
        } catch (e) {
          errors.push(`OpenAPI discovery error: ${String(e)}`);
        }

        console.log(`[FullBackup] Discovered ${tableNames.length} tables`);

        // ═══════════════════════════════════════════════════════
        // 2. EXPORT TABLE DATA — CHUNKED + STREAMED TO ZIP
        //    Each page is written as its own file to avoid huge in-memory strings.
        // ═══════════════════════════════════════════════════════
        const tableSummary: Record<string, number> = {};
        const tableParts: Record<string, number> = {};
        let totalRows = 0;
        let timedOut = false;
        let tablesExported = 0;

        for (const table of tableNames) {
          if (Date.now() - backupStart > TIME_BUDGET_MS) {
            timedOut = true;
            for (let j = tableNames.indexOf(table); j < tableNames.length; j++) {
              tableSummary[tableNames[j]] = -2;
              tableParts[tableNames[j]] = 0;
            }
            errors.push(`Time budget exceeded after ${tablesExported} tables. Skipped ${tableNames.length - tablesExported} tables.`);
            break;
          }

          try {
            let rowCount = 0;
            let offset = 0;
            let partCount = 0;

            while (true) {
              if (Date.now() - backupStart > TIME_BUDGET_MS) {
                timedOut = true;
                break;
              }

              const { data, error } = await admin
                .from(table)
                .select('*')
                .range(offset, offset + PAGE_SIZE - 1);

              if (error) {
                errors.push(`${table}: ${error.message}`);
                break;
              }

              if (!data || data.length === 0) break;

              partCount += 1;
              const partName = `data/${table}/part-${String(partCount).padStart(5, '0')}.json`;
              await zip.addTextFile(partName, JSON.stringify(data));

              rowCount += data.length;
              if (data.length < PAGE_SIZE) break;
              offset += PAGE_SIZE;
            }

            tableSummary[table] = rowCount;
            tableParts[table] = partCount;
            totalRows += rowCount;
            tablesExported += 1;
          } catch (e) {
            errors.push(`${table}: ${String(e)}`);
            tableSummary[table] = -1;
            tableParts[table] = 0;
            tablesExported += 1;
          }
        }

        manifest.tables = tableSummary;
        manifest.table_parts = tableParts;
        manifest.table_count = tableNames.length;
        manifest.tables_exported = tablesExported;
        manifest.total_rows = totalRows;
        manifest.timed_out = timedOut;
        console.log(`[FullBackup] Exported ${totalRows} rows across ${tablesExported}/${tableNames.length} tables`);

        // ═══════════════════════════════════════════════════════
        // 3. STORAGE — list buckets and files (skip if timed out)
        // ═══════════════════════════════════════════════════════
        const storageSummary: Record<string, number> = {};
        if (!timedOut) {
          try {
            const { data: buckets } = await admin.storage.listBuckets();
            if (buckets && buckets.length > 0) {
              await zip.addTextFile('storage/buckets.json', JSON.stringify(buckets, null, 2));
              manifest.storage_buckets = buckets.map((b) => ({ name: b.name, public: b.public }));

              for (const bucket of buckets) {
                if (Date.now() - backupStart > TIME_BUDGET_MS) break;

                try {
                  const allFiles = await listAllStorageFiles(admin, bucket.name);
                  if (allFiles.length > 0) {
                    await zip.addTextFile(`storage/${bucket.name}-files.json`, JSON.stringify(allFiles, null, 2));
                  }
                  storageSummary[bucket.name] = allFiles.length;
                } catch (e) {
                  errors.push(`storage/${bucket.name}: ${String(e)}`);
                  storageSummary[bucket.name] = -1;
                }
              }
            }
          } catch (e) {
            errors.push(`Storage listing: ${String(e)}`);
          }
        }
        manifest.storage_files = storageSummary;

        // ═══════════════════════════════════════════════════════
        // 4. EDGE FUNCTIONS NOTE
        // ═══════════════════════════════════════════════════════
        await zip.addTextFile(
          'edge-functions-note.txt',
          'Edge functions are deployed from supabase/functions/ in the source code.\nRedeploy with: npx supabase functions deploy\n',
        );

        // ═══════════════════════════════════════════════════════
        // 5. ERRORS LOG
        // ═══════════════════════════════════════════════════════
        if (errors.length > 0) {
          await zip.addTextFile('ERRORS.log', errors.join('\n'));
          manifest.errors = errors.length;
        }

        // ═══════════════════════════════════════════════════════
        // 6. MANIFEST + RESTORE.md
        // ═══════════════════════════════════════════════════════
        manifest.duration_ms = Date.now() - backupStart;
        await zip.addTextFile('manifest.json', JSON.stringify(manifest, null, 2));
        await zip.addTextFile('RESTORE.md', generateRestoreGuide(manifest, tableSummary, storageSummary, errors));

        await zip.close();
        console.log(`[FullBackup] Complete. ${filename} in ${Date.now() - backupStart}ms`);
      } catch (streamErr) {
        console.error('[FullBackup] Stream generation error:', streamErr);
        await zip.abort(streamErr);
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof EdgeError) {
      return new Response(JSON.stringify({ error: err.message, code: err.code }), {
        status: err.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('[FullBackup] Fatal error:', err);
    return new Response(JSON.stringify({ error: 'Backup failed: ' + String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const UTF8 = new TextEncoder();

interface ZipEntry {
  nameBytes: Uint8Array;
  crc32: number;
  size: number;
  localHeaderOffset: number;
  dosTime: number;
  dosDate: number;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date = new Date()): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, Math.min(2107, date.getUTCFullYear()));
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = Math.floor(date.getUTCSeconds() / 2);

  const dosTime = ((hours & 0x1f) << 11) | ((minutes & 0x3f) << 5) | (seconds & 0x1f);
  const dosDate = (((year - 1980) & 0x7f) << 9) | ((month & 0x0f) << 5) | (day & 0x1f);

  return { dosTime, dosDate };
}

class ZipStreamWriter {
  private readonly writer: WritableStreamDefaultWriter<Uint8Array>;
  private readonly entries: ZipEntry[] = [];
  private offset = 0;

  constructor(writer: WritableStreamDefaultWriter<Uint8Array>) {
    this.writer = writer;
  }

  async addTextFile(path: string, content: string): Promise<void> {
    await this.addBytesFile(path, UTF8.encode(content));
  }

  async addBytesFile(path: string, bytes: Uint8Array): Promise<void> {
    const nameBytes = UTF8.encode(path);
    const { dosTime, dosDate } = toDosDateTime();
    const fileCrc32 = crc32(bytes);
    const localHeaderOffset = this.offset;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localHeaderView = new DataView(localHeader.buffer);

    localHeaderView.setUint32(0, 0x04034b50, true); // Local file header signature
    localHeaderView.setUint16(4, 20, true); // Version needed
    localHeaderView.setUint16(6, 0, true); // Flags
    localHeaderView.setUint16(8, 0, true); // Compression method (store)
    localHeaderView.setUint16(10, dosTime, true);
    localHeaderView.setUint16(12, dosDate, true);
    localHeaderView.setUint32(14, fileCrc32, true);
    localHeaderView.setUint32(18, bytes.length, true); // Compressed size
    localHeaderView.setUint32(22, bytes.length, true); // Uncompressed size
    localHeaderView.setUint16(26, nameBytes.length, true);
    localHeaderView.setUint16(28, 0, true); // Extra length
    localHeader.set(nameBytes, 30);

    await this.writer.write(localHeader);
    this.offset += localHeader.length;

    if (bytes.length > 0) {
      await this.writer.write(bytes);
      this.offset += bytes.length;
    }

    this.entries.push({
      nameBytes,
      crc32: fileCrc32,
      size: bytes.length,
      localHeaderOffset,
      dosTime,
      dosDate,
    });
  }

  async close(): Promise<void> {
    if (this.entries.length > 65535) {
      throw new Error('ZIP entry limit exceeded (ZIP64 not supported).');
    }

    const centralDirectoryOffset = this.offset;

    for (const entry of this.entries) {
      const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
      const centralHeaderView = new DataView(centralHeader.buffer);

      centralHeaderView.setUint32(0, 0x02014b50, true); // Central directory signature
      centralHeaderView.setUint16(4, 20, true); // Version made by
      centralHeaderView.setUint16(6, 20, true); // Version needed
      centralHeaderView.setUint16(8, 0, true); // Flags
      centralHeaderView.setUint16(10, 0, true); // Compression method (store)
      centralHeaderView.setUint16(12, entry.dosTime, true);
      centralHeaderView.setUint16(14, entry.dosDate, true);
      centralHeaderView.setUint32(16, entry.crc32, true);
      centralHeaderView.setUint32(20, entry.size, true);
      centralHeaderView.setUint32(24, entry.size, true);
      centralHeaderView.setUint16(28, entry.nameBytes.length, true);
      centralHeaderView.setUint16(30, 0, true); // Extra length
      centralHeaderView.setUint16(32, 0, true); // Comment length
      centralHeaderView.setUint16(34, 0, true); // Disk number start
      centralHeaderView.setUint16(36, 0, true); // Internal attrs
      centralHeaderView.setUint32(38, 0, true); // External attrs
      centralHeaderView.setUint32(42, entry.localHeaderOffset, true);
      centralHeader.set(entry.nameBytes, 46);

      await this.writer.write(centralHeader);
      this.offset += centralHeader.length;
    }

    const centralDirectorySize = this.offset - centralDirectoryOffset;
    const endOfCentralDirectory = new Uint8Array(22);
    const eocdView = new DataView(endOfCentralDirectory.buffer);

    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
    eocdView.setUint16(4, 0, true); // Disk number
    eocdView.setUint16(6, 0, true); // Disk with central directory
    eocdView.setUint16(8, this.entries.length, true);
    eocdView.setUint16(10, this.entries.length, true);
    eocdView.setUint32(12, centralDirectorySize, true);
    eocdView.setUint32(16, centralDirectoryOffset, true);
    eocdView.setUint16(20, 0, true); // Comment length

    await this.writer.write(endOfCentralDirectory);
    await this.writer.close();
  }

  async abort(reason: unknown): Promise<void> {
    await this.writer.abort(reason);
  }
}

async function listAllStorageFiles(
  admin: ReturnType<typeof createClient>,
  bucketName: string,
  prefix = '',
): Promise<unknown[]> {
  const allFiles: unknown[] = [];
  const { data } = await admin.storage.from(bucketName).list(prefix, { limit: 1000 });
  if (!data) return allFiles;

  for (const item of data) {
    if (item.id === null && item.name) {
      const subPath = prefix ? `${prefix}/${item.name}` : item.name;
      const subFiles = await listAllStorageFiles(admin, bucketName, subPath);
      allFiles.push(...subFiles);
    } else {
      allFiles.push({ ...item, full_path: prefix ? `${prefix}/${item.name}` : item.name });
    }
  }
  return allFiles;
}

function generateRestoreGuide(
  manifest: Record<string, unknown>,
  tableSummary: Record<string, number>,
  storageSummary: Record<string, number>,
  errors: string[],
): string {
  const tableRows = Object.entries(tableSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => {
      const status = count === -1 ? '❌ FAILED' : count === -2 ? '⏭️ SKIPPED (timeout)' : count.toLocaleString();
      return `| \`${name}\` | ${status} |`;
    })
    .join('\n');

  const storageRows = Object.entries(storageSummary)
    .map(([name, count]) => `| \`${name}\` | ${count === -1 ? '❌ FAILED' : count} |`)
    .join('\n');

  const errorSection = errors.length > 0
    ? `\n## ⚠️ Export Errors\n\n${errors.map(e => `- ${e}`).join('\n')}\n`
    : '';

  const timeoutNote = manifest.timed_out
    ? `\n> ⚠️ **Partial backup**: Time budget was exceeded. ${manifest.tables_exported}/${manifest.table_count} tables were exported. Run the backup again or export missing tables individually.\n`
    : '';

  return `# CMPSBL Full Backup — Complete Restoration Guide

> **Created:** ${manifest.created_at}  
> **Project Ref:** ${manifest.project_ref}  
> **Tables:** ${manifest.tables_exported}/${manifest.table_count}  
> **Total Rows:** ${(manifest.total_rows as number).toLocaleString()}  
> **Duration:** ${manifest.duration_ms}ms  
> **Format:** v${manifest.format_version}
${timeoutNote}
---

## 📦 What This Backup Contains

| Path | Description |
|---|---|
| \`data/<table>/part-*.json\` | Table data exported in paginated chunks (complete dataset across all parts) |
| \`schema/openapi-spec.json\` | Full PostgREST OpenAPI spec (all column types, relationships) |
| \`storage/buckets.json\` | Storage bucket configurations |
| \`storage/*-files.json\` | File listings per bucket (metadata, not file contents) |
| \`manifest.json\` | Backup metadata, row counts, timing |
| \`ERRORS.log\` | Any errors during export (if applicable) |
| \`RESTORE.md\` | This file |

## What You Also Need (Not In This ZIP)

| Item | Where To Get It |
|---|---|
| **Source code** | Lovable dashboard → Download ZIP, or GitHub repo |
| **Storage file contents** | Download from storage buckets before wipe |
| **Auth users** | Cannot be exported — users re-register |
| **Edge function secrets** | Keep your own record of API keys |

---

## 📋 Table Inventory

| Table | Rows |
|---|---|
${tableRows}

## 🗄️ Storage Buckets

| Bucket | Files |
|---|---|
${storageRows || '| *(none)* | — |'}
${errorSection}
---

## 🔧 Full Restoration Steps

### Step 1: Get the Source Code

Download the source code from Lovable (Dashboard → Settings → Download ZIP) or clone from GitHub.

\`\`\`bash
unzip cmpsbl-source.zip
cd cmpsbl
npm install
\`\`\`

### Step 2: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Save these values:
   - **Project URL** (e.g., \`https://abcdefg.supabase.co\`)
   - **Anon/public key**
   - **Service role key** (for data import)
   - **Project ref** (e.g., \`abcdefg\`)

### Step 3: Apply Database Schema

\`\`\`bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
\`\`\`

### Step 4: Import All Data

\`\`\`javascript
// restore-data.mjs — Run with: node restore-data.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const dataDir = './data';

const tableDirs = fs.readdirSync(dataDir)
  .filter(name => fs.statSync(path.join(dataDir, name)).isDirectory())
  .sort();

for (const table of tableDirs) {
  const tableDir = path.join(dataDir, table);
  const partFiles = fs.readdirSync(tableDir)
    .filter(f => f.startsWith('part-') && f.endsWith('.json'))
    .sort();

  if (partFiles.length === 0) {
    console.log(\`⏭️  \${table}: no data parts\`);
    continue;
  }

  let imported = 0;
  let failed = 0;

  for (const partFile of partFiles) {
    const rows = JSON.parse(fs.readFileSync(path.join(tableDir, partFile), 'utf-8'));
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const { error } = await supabase
      .from(table)
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error(\`  ❌ \${table} \${partFile}: \${error.message}\`);
      failed += rows.length;
    } else {
      imported += rows.length;
    }
  }

  console.log(\`✅ \${table}: \${imported} imported\${failed ? \`, \${failed} failed\` : ''}\`);
}

console.log('\\n🎉 Data import complete!');
\`\`\`

### Step 5: Recreate Storage Buckets

\`\`\`sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket-name', 'bucket-name', true)
ON CONFLICT (id) DO NOTHING;
\`\`\`

### Step 6: Configure Environment

\`\`\`env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
\`\`\`

### Step 7: Deploy Edge Functions & Secrets

\`\`\`bash
npx supabase functions deploy
\`\`\`

### Step 8: Verify

\`\`\`bash
npm run dev
\`\`\`

---

## 🤖 For AI Coding Agents

1. Read this entire RESTORE.md first
2. Source code ZIP from Lovable/GitHub is the PRIMARY artifact
3. Run \`supabase db push\` to create schema from \`supabase/migrations/\`
4. Use \`restore-data.mjs\` to import data from \`data/*.json\`
5. Deploy edge functions with \`supabase functions deploy\`
6. Frontend: \`npm install && npm run dev\`

---

© 2025–2026 CMPSBL® / PromptFluid®. Confidential.
`;
