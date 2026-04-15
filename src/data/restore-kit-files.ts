/**
 * Embedded restore kit files — served only behind PinGate.
 * DO NOT move these to public/ — they contain sensitive recovery tooling.
 */

export const FILES: Record<string, string> = {
  'restore.mjs': `#!/usr/bin/env node
/**
 * CMPSBL® Standalone Substrate Restore Kit v1.0.0
 * ─────────────────────────────────────────────────
 * Restores a full-backup ZIP into ANY Supabase project.
 * Zero dependency on Lovable — works from any machine.
 *
 * Prerequisites:
 *   - Node.js 18+ (ships with native fetch & fs/promises)
 *   - A full-backup ZIP from the FAILSAFE backup system
 *   - Target Supabase project URL + service_role key
 *
 * Usage:
 *   node restore.mjs <backup.zip> <SUPABASE_URL> <SERVICE_ROLE_KEY> [--dry-run] [--skip=table1,table2]
 *
 * © 2025–2026 CMPSBL® / PromptFluid™. All rights reserved.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';

// ─── Argument parsing ────────────────────────────────────────
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const DRY_RUN = flags.includes('--dry-run');
const SKIP_TABLES = new Set(
  flags.find(f => f.startsWith('--skip='))?.replace('--skip=', '').split(',').filter(Boolean) || []
);

if (positional.length < 3) {
  console.log(\`
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® Substrate Restore Kit v1.0.0                       ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node restore.mjs <backup.zip> <SUPABASE_URL> <SERVICE_ROLE_KEY> [flags]

Flags:
  --dry-run          Validate backup without writing data
  --skip=t1,t2       Skip specific tables during restore

Example:
  node restore.mjs full-backup-2026-04-03.zip \\\\
    https://abcdefgh.supabase.co \\\\
    eyJhbGciOiJI...

The restore kit reads a full-backup ZIP, validates its structure,
and upserts all table data into the target Supabase project via
the PostgREST API. It handles pagination, conflict resolution,
and produces a detailed report upon completion.
\`);
  process.exit(1);
}

const [zipPath, supabaseUrl, serviceKey] = positional;

// ─── Lightweight ZIP reader (no dependencies) ────────────────
// Reads a ZIP's central directory and extracts entries.
// Supports Store (0) and Deflate (8) via DecompressionStream.

function readZipEntries(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const entries = [];

  // Find End of Central Directory
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid ZIP: no EOCD signature found');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdEntries = view.getUint16(eocdOffset + 10, true);

  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;

    const method = view.getUint16(pos + 10, true);
    const compSize = view.getUint32(pos + 20, true);
    const uncompSize = view.getUint32(pos + 24, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(buffer.subarray(pos + 46, pos + 46 + nameLen));

    entries.push({ name, method, compSize, uncompSize, localOffset });
    pos += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

async function extractEntry(buffer, entry) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const localPos = entry.localOffset;
  
  if (view.getUint32(localPos, true) !== 0x04034b50) {
    throw new Error(\`Invalid local header for \${entry.name}\`);
  }

  const localNameLen = view.getUint16(localPos + 26, true);
  const localExtraLen = view.getUint16(localPos + 28, true);
  const dataStart = localPos + 30 + localNameLen + localExtraLen;
  const compData = buffer.subarray(dataStart, dataStart + entry.compSize);

  if (entry.method === 0) {
    // Stored — no compression
    return compData;
  } else if (entry.method === 8) {
    // Deflate — use DecompressionStream (Node 18+)
    // Wrap in a raw deflate stream
    const ds = new DecompressionStream('raw');
    const writer = ds.writable.getWriter();
    writer.write(compData);
    writer.close();

    const reader = ds.readable.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const total = chunks.reduce((a, c) => a + c.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  } else {
    throw new Error(\`Unsupported compression method \${entry.method} for \${entry.name}\`);
  }
}

// ─── PostgREST upsert helper ─────────────────────────────────
async function upsertRows(table, rows, onConflict = 'id') {
  if (DRY_RUN || rows.length === 0) return { inserted: rows.length, errors: 0 };

  const BATCH = 200;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    try {
      const res = await fetch(\`\${supabaseUrl}/rest/v1/\${table}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${serviceKey}\`,
          'apikey': serviceKey,
          'Prefer': \`resolution=merge-duplicates,return=minimal\`,
        },
        body: JSON.stringify(batch),
      });

      if (res.ok) {
        inserted += batch.length;
      } else {
        const errText = await res.text();
        // If merge-duplicates fails (no PK), try plain insert with ignore
        if (res.status === 400 || res.status === 409) {
          const retryRes = await fetch(\`\${supabaseUrl}/rest/v1/\${table}\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${serviceKey}\`,
              'apikey': serviceKey,
              'Prefer': 'resolution=ignore-duplicates,return=minimal',
            },
            body: JSON.stringify(batch),
          });
          if (retryRes.ok) {
            inserted += batch.length;
          } else {
            console.error(\`  ✗ \${table} batch \${Math.floor(i/BATCH)+1}: \${await retryRes.text()}\`);
            errors += batch.length;
          }
        } else {
          console.error(\`  ✗ \${table} batch \${Math.floor(i/BATCH)+1}: \${errText}\`);
          errors += batch.length;
        }
      }
    } catch (e) {
      console.error(\`  ✗ \${table} batch \${Math.floor(i/BATCH)+1}: \${e.message}\`);
      errors += batch.length;
    }
  }

  return { inserted, errors };
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log(\`
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® Substrate Restore Kit v1.0.0                       ║
║  \${DRY_RUN ? '🔍 DRY RUN MODE — no data will be written' : '⚡ LIVE MODE — data will be written to target'}             ║
╚══════════════════════════════════════════════════════════════╝
\`);

  // 1. Read and parse ZIP
  console.log(\`📦 Reading backup: \${basename(zipPath)}\`);
  if (!existsSync(zipPath)) {
    console.error(\`❌ File not found: \${zipPath}\`);
    process.exit(1);
  }

  const zipBuffer = new Uint8Array(readFileSync(zipPath));
  console.log(\`   Size: \${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB\`);

  // Validate ZIP signature
  if (zipBuffer[0] !== 0x50 || zipBuffer[1] !== 0x4B) {
    console.error('❌ Invalid ZIP file — missing PK signature');
    process.exit(1);
  }

  const entries = readZipEntries(zipBuffer);
  console.log(\`   Entries: \${entries.length}\`);

  // 2. Extract and parse manifest
  const manifestEntry = entries.find(e => e.name === 'manifest.json');
  if (!manifestEntry) {
    console.error('❌ No manifest.json found in backup — invalid backup format');
    process.exit(1);
  }

  const manifestBytes = await extractEntry(zipBuffer, manifestEntry);
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
  console.log(\`\\n📋 Manifest:\`);
  console.log(\`   Created: \${manifest.created_at}\`);
  console.log(\`   Format:  v\${manifest.format_version}\`);
  console.log(\`   Tables:  \${manifest.tables_exported}/\${manifest.table_count}\`);
  console.log(\`   Rows:    \${manifest.total_rows?.toLocaleString()}\`);
  if (manifest.timed_out) {
    console.log(\`   ⚠️  Backup was time-limited — some tables may be incomplete\`);
  }

  // 3. Verify target Supabase is reachable
  console.log(\`\\n🔗 Verifying target: \${supabaseUrl}\`);
  try {
    const healthRes = await fetch(\`\${supabaseUrl}/rest/v1/\`, {
      headers: { apikey: serviceKey, Authorization: \`Bearer \${serviceKey}\` },
    });
    if (!healthRes.ok) throw new Error(\`HTTP \${healthRes.status}\`);
    console.log(\`   ✓ PostgREST is reachable\`);
  } catch (e) {
    console.error(\`   ❌ Cannot reach target: \${e.message}\`);
    process.exit(1);
  }

  // 4. Discover data files grouped by table
  const dataEntries = entries.filter(e => e.name.startsWith('data/') && e.name.endsWith('.json'));
  const tableMap = new Map();

  for (const entry of dataEntries) {
    const parts = entry.name.split('/');
    if (parts.length < 3) continue;
    const tableName = parts[1];
    if (!tableMap.has(tableName)) tableMap.set(tableName, []);
    tableMap.get(tableName).push(entry);
  }

  console.log(\`\\n📊 Found \${tableMap.size} tables to restore\`);
  if (SKIP_TABLES.size > 0) {
    console.log(\`   Skipping: \${[...SKIP_TABLES].join(', ')}\`);
  }

  // 5. Restore each table
  const report = {
    started_at: new Date().toISOString(),
    target: supabaseUrl,
    source_backup: manifest.created_at,
    tables: {},
    total_inserted: 0,
    total_errors: 0,
    total_skipped: 0,
  };

  const sortedTables = [...tableMap.keys()].sort();
  for (const tableName of sortedTables) {
    if (SKIP_TABLES.has(tableName)) {
      console.log(\`   ⏭  \${tableName} (skipped)\`);
      report.tables[tableName] = { status: 'skipped' };
      report.total_skipped++;
      continue;
    }

    const parts = tableMap.get(tableName);
    parts.sort((a, b) => a.name.localeCompare(b.name));

    let totalRows = 0;
    let allRows = [];

    for (const part of parts) {
      const bytes = await extractEntry(zipBuffer, part);
      const rows = JSON.parse(new TextDecoder().decode(bytes));
      allRows = allRows.concat(rows);
      totalRows += rows.length;
    }

    process.stdout.write(\`   ↻ \${tableName} (\${totalRows} rows)... \`);

    const result = await upsertRows(tableName, allRows);
    
    if (result.errors > 0) {
      console.log(\`⚠️  \${result.inserted} ok, \${result.errors} errors\`);
    } else {
      console.log(\`✓ \${result.inserted} rows\`);
    }

    report.tables[tableName] = {
      rows: totalRows,
      inserted: result.inserted,
      errors: result.errors,
      parts: parts.length,
    };
    report.total_inserted += result.inserted;
    report.total_errors += result.errors;
  }

  // 6. Extract schema if present
  const schemaEntry = entries.find(e => e.name === 'schema/openapi-spec.json');
  if (schemaEntry) {
    console.log(\`\\n📐 OpenAPI schema included — can be used to verify table structure\`);
  }

  // 7. Storage inventory
  const storageEntries = entries.filter(e => e.name.startsWith('storage/') && e.name.endsWith('.json'));
  if (storageEntries.length > 0) {
    console.log(\`\\n🗄️  Storage inventory: \${storageEntries.length} bucket listing(s) included\`);
    console.log(\`   Note: File contents are NOT stored in the backup.\`);
    console.log(\`   Use the bucket listings to verify storage state.\`);
  }

  // 8. RESTORE.md
  const restoreEntry = entries.find(e => e.name === 'RESTORE.md');
  if (restoreEntry) {
    console.log(\`\\n📖 RESTORE.md guide included in backup\`);
  }

  // 9. Final report
  report.completed_at = new Date().toISOString();
  report.duration_ms = Date.now() - new Date(report.started_at).getTime();

  const reportPath = \`restore-report-\${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json\`;
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(\`
╔══════════════════════════════════════════════════════════════╗
║  RESTORE \${DRY_RUN ? 'VALIDATION' : 'COMPLETE'}                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Tables restored: \${String(sortedTables.length - report.total_skipped).padEnd(40)}║
║  Rows inserted:   \${String(report.total_inserted.toLocaleString()).padEnd(40)}║
║  Errors:          \${String(report.total_errors).padEnd(40)}║
║  Skipped tables:  \${String(report.total_skipped).padEnd(40)}║
║  Duration:        \${String(report.duration_ms + 'ms').padEnd(40)}║
║  Report:          \${reportPath.padEnd(40)}║
╚══════════════════════════════════════════════════════════════╝

\${report.total_errors > 0 ? '⚠️  Some rows failed — check the report for details.' : '✅ All data restored successfully.'}
\${DRY_RUN ? '\\n🔍 This was a dry run. No data was written. Run without --dry-run to apply.' : ''}
\`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
`,
  'cmpsbl-disaster-recovery.mjs': `#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CMPSBL® Universal Disaster Recovery v1.0.0                        ║
 * ║  Single-file backup + restore for the entire substrate.            ║
 * ║                                                                    ║
 * ║  © 2025–2026 CMPSBL® / PromptFluid™. All rights reserved.         ║
 * ║  U.S. Patent App. No. 64/029,678 & 64/031,637                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * ZERO DEPENDENCIES — runs on Node.js 18+ with nothing else.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MODE 1: DOWNLOAD BACKUP (from live CMPSBL substrate)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   node cmpsbl-disaster-recovery.mjs download \\
 *     --email=admin@example.com \\
 *     --password=yourpass \\
 *     --source=https://bxodolqqczjuahwdrswy.supabase.co
 *
 *   Downloads a full backup ZIP from the live FAILSAFE edge function.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MODE 2: RESTORE (to any Supabase project)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   node cmpsbl-disaster-recovery.mjs restore <backup.zip> \\
 *     --url=https://NEW-PROJECT.supabase.co \\
 *     --key=SERVICE_ROLE_KEY
 *
 *   Restores all table data from the backup ZIP via PostgREST upsert.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MODE 3: FULL RECOVERY (download + restore in one shot)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   node cmpsbl-disaster-recovery.mjs full-recovery \\
 *     --email=admin@example.com \\
 *     --password=yourpass \\
 *     --source=https://bxodolqqczjuahwdrswy.supabase.co \\
 *     --url=https://NEW-PROJECT.supabase.co \\
 *     --key=SERVICE_ROLE_KEY
 *
 *   Downloads from source, then restores to target. One command.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * FLAGS (all modes)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   --dry-run          Validate without writing data
 *   --skip=t1,t2       Skip specific tables
 *   --anon-key=KEY     Override anon key for auth (default: CMPSBL prod key)
 *   --service-key=KEY  Use service role key directly (skips email/password auth)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * GIVING THIS FILE TO AN AI AGENT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Any AI agent (Claude, GPT, Gemini, etc.) can use this file to restore
 * the CMPSBL substrate. Give them this file + a backup ZIP, and instruct:
 *
 *   "Run this Node.js script with the restore command. You need:
 *    1. A Supabase project URL (create one at supabase.com)
 *    2. The service_role key from that project
 *    3. Apply migrations first: npx supabase db push
 *    4. Then: node cmpsbl-disaster-recovery.mjs restore backup.zip --url=... --key=..."
 *
 * If they also have the source repo:
 *   "Clone the repo, run migrations, then restore data with this script."
 *
 * If they DON'T have the repo (schema-from-backup mode):
 *   The script will extract the OpenAPI schema from the backup and provide
 *   SQL DDL hints for table reconstruction. The AI agent can use those
 *   hints to create tables before restoring data.
 *
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const VERSION = '1.0.0';

/** Default CMPSBL production anon key — safe to embed (publishable) */
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTA2MTMsImV4cCI6MjA4MDM2NjYxM30.-YWlnszid8aODq2Zv2EvxWcY2sTsRikPcNsMWpZ7lHc';

/** Default source URL (CMPSBL production) */
const DEFAULT_SOURCE = 'https://bxodolqqczjuahwdrswy.supabase.co';

const BATCH_SIZE = 200;

// ═══════════════════════════════════════════════════════════════
// ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════

const rawArgs = process.argv.slice(2);
const mode = rawArgs[0];

function getFlag(name) {
  const f = rawArgs.find(a => a.startsWith(\`--\${name}=\`));
  return f ? f.split('=').slice(1).join('=') : null;
}

const DRY_RUN = rawArgs.includes('--dry-run');
const SKIP_TABLES = new Set(
  getFlag('skip')?.split(',').filter(Boolean) || []
);

if (!mode || mode === '--help' || mode === '-h') {
  printUsage();
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════════
// USAGE
// ═══════════════════════════════════════════════════════════════

function printUsage() {
  console.log(\`
╔══════════════════════════════════════════════════════════════════════╗
║  CMPSBL® Universal Disaster Recovery v\${VERSION}                        ║
║  Single-file backup + restore for the entire substrate.            ║
╚══════════════════════════════════════════════════════════════════════╝

Commands:

  download    Download a fresh backup ZIP from the live substrate
  restore     Restore a backup ZIP into a target Supabase project
  full-recovery  Download + restore in one command
  inspect     Inspect a backup ZIP without restoring
  schema-sql  Extract SQL DDL hints from a backup's OpenAPI schema

Examples:

  # Download backup (admin login)
  node cmpsbl-disaster-recovery.mjs download \\\\
    --email=you@example.com --password=secret

  # Download backup (service key — no login needed)
  node cmpsbl-disaster-recovery.mjs download \\\\
    --service-key=eyJ...

  # Restore to new project
  node cmpsbl-disaster-recovery.mjs restore backup.zip \\\\
    --url=https://newproject.supabase.co \\\\
    --key=SERVICE_ROLE_KEY

  # Full recovery (one shot)
  node cmpsbl-disaster-recovery.mjs full-recovery \\\\
    --email=you@example.com --password=secret \\\\
    --url=https://newproject.supabase.co \\\\
    --key=SERVICE_ROLE_KEY

  # Inspect a backup
  node cmpsbl-disaster-recovery.mjs inspect backup.zip

  # Generate SQL DDL from backup (no repo needed)
  node cmpsbl-disaster-recovery.mjs schema-sql backup.zip

Flags:
  --dry-run          Validate without writing data
  --skip=t1,t2       Skip specific tables
  --source=URL       Override source Supabase URL (default: CMPSBL prod)
  --anon-key=KEY     Override anon key
  --service-key=KEY  Use service role key directly (no login)
  --email=EMAIL      Admin email for login
  --password=PASS    Admin password for login
  --url=URL          Target Supabase URL (for restore)
  --key=KEY          Target service_role key (for restore)
\`);
}

// ═══════════════════════════════════════════════════════════════
// ZIP READER (zero dependencies)
// ═══════════════════════════════════════════════════════════════

function readZipEntries(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const entries = [];

  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid ZIP: no EOCD signature found');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdEntries = view.getUint16(eocdOffset + 10, true);

  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;
    const method = view.getUint16(pos + 10, true);
    const compSize = view.getUint32(pos + 20, true);
    const uncompSize = view.getUint32(pos + 24, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(buffer.subarray(pos + 46, pos + 46 + nameLen));
    entries.push({ name, method, compSize, uncompSize, localOffset });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function extractEntry(buffer, entry) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const localPos = entry.localOffset;
  if (view.getUint32(localPos, true) !== 0x04034b50) {
    throw new Error(\`Invalid local header for \${entry.name}\`);
  }
  const localNameLen = view.getUint16(localPos + 26, true);
  const localExtraLen = view.getUint16(localPos + 28, true);
  const dataStart = localPos + 30 + localNameLen + localExtraLen;
  const compData = buffer.subarray(dataStart, dataStart + entry.compSize);

  if (entry.method === 0) return compData;

  if (entry.method === 8) {
    const ds = new DecompressionStream('raw');
    const writer = ds.writable.getWriter();
    writer.write(compData);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((a, c) => a + c.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    return result;
  }

  throw new Error(\`Unsupported compression method \${entry.method} for \${entry.name}\`);
}

function extractText(buffer, entry) {
  return extractEntry(buffer, entry).then(b => new TextDecoder().decode(b));
}

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD MODE
// ═══════════════════════════════════════════════════════════════

async function downloadBackup() {
  const sourceUrl = getFlag('source') || DEFAULT_SOURCE;
  const anonKey = getFlag('anon-key') || DEFAULT_ANON_KEY;
  const serviceKey = getFlag('service-key');
  const email = getFlag('email');
  const password = getFlag('password');

  console.log(\`\\n⬇  Downloading backup from \${sourceUrl.split('//')[1]?.split('.')[0] || sourceUrl}\`);

  let bearerToken;

  if (serviceKey) {
    bearerToken = serviceKey;
    console.log('   Auth: service_role key');
  } else if (email && password) {
    console.log(\`   Auth: signing in as \${email}...\`);
    const authRes = await fetch(\`\${sourceUrl}/auth/v1/token?grant_type=password\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authRes.ok) {
      const errBody = await authRes.text();
      console.error(\`   ❌ Login failed: HTTP \${authRes.status}\`);
      console.error(\`      \${errBody}\`);
      process.exit(1);
    }

    const authData = await authRes.json();
    bearerToken = authData.access_token;
    console.log('   ✓ Signed in successfully');
  } else {
    console.error('   ❌ Provide --email + --password, or --service-key');
    process.exit(1);
  }

  console.log('   Requesting full backup (this may take 30–60s)...');

  const backupUrl = \`\${sourceUrl}/functions/v1/full-backup\`;
  const res = await fetch(backupUrl, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${bearerToken}\`,
      'apikey': anonKey,
    },
  });

  const contentType = res.headers.get('Content-Type') || '';
  if (!res.ok || contentType.includes('application/json')) {
    const err = await res.json().catch(() => ({ error: \`HTTP \${res.status}\` }));
    console.error(\`   ❌ Backup failed: \${err.error || JSON.stringify(err)}\`);
    process.exit(1);
  }

  const arrayBuf = await res.arrayBuffer();
  const zipBytes = new Uint8Array(arrayBuf);

  if (zipBytes.length < 100) {
    console.error('   ❌ Response too small — likely an error');
    process.exit(1);
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match?.[1] || \`cmpsbl-full-backup-\${new Date().toISOString().slice(0, 10)}.zip\`;

  writeFileSync(filename, zipBytes);
  console.log(\`   ✓ Saved: \${filename} (\${(zipBytes.length / 1024 / 1024).toFixed(2)} MB)\`);

  return filename;
}

// ═══════════════════════════════════════════════════════════════
// RESTORE MODE
// ═══════════════════════════════════════════════════════════════

async function restoreBackup(zipPath) {
  const targetUrl = getFlag('url');
  const targetKey = getFlag('key');

  if (!targetUrl || !targetKey) {
    console.error('❌ --url and --key are required for restore');
    console.error('   --url=https://YOUR-PROJECT.supabase.co');
    console.error('   --key=YOUR_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(\`
╔══════════════════════════════════════════════════════════════════════╗
║  CMPSBL® Substrate Restore v\${VERSION}                                  ║
║  \${DRY_RUN ? '🔍 DRY RUN — no data will be written                           ' : '⚡ LIVE — data will be written to target                        '}║
╚══════════════════════════════════════════════════════════════════════╝
\`);

  if (!existsSync(zipPath)) {
    console.error(\`❌ File not found: \${zipPath}\`);
    process.exit(1);
  }

  const zipBuffer = new Uint8Array(readFileSync(zipPath));
  console.log(\`📦 Backup: \${basename(zipPath)} (\${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB)\`);

  if (zipBuffer[0] !== 0x50 || zipBuffer[1] !== 0x4B) {
    console.error('❌ Invalid ZIP file — missing PK signature');
    process.exit(1);
  }

  const entries = readZipEntries(zipBuffer);

  // Parse manifest
  const manifestEntry = entries.find(e => e.name === 'manifest.json');
  if (!manifestEntry) {
    console.error('❌ No manifest.json — invalid backup format');
    process.exit(1);
  }

  const manifest = JSON.parse(await extractText(zipBuffer, manifestEntry));
  console.log(\`📋 Created: \${manifest.created_at} | Tables: \${manifest.tables_exported}/\${manifest.table_count} | Rows: \${manifest.total_rows?.toLocaleString()}\`);
  if (manifest.timed_out) console.log('   ⚠️  Partial backup (time-limited)');

  // Verify target
  console.log(\`\\n🔗 Target: \${targetUrl}\`);
  try {
    const healthRes = await fetch(\`\${targetUrl}/rest/v1/\`, {
      headers: { apikey: targetKey, Authorization: \`Bearer \${targetKey}\` },
    });
    if (!healthRes.ok) throw new Error(\`HTTP \${healthRes.status}\`);
    await healthRes.text();
    console.log('   ✓ PostgREST reachable');
  } catch (e) {
    console.error(\`   ❌ Cannot reach target: \${e.message}\`);
    process.exit(1);
  }

  // Discover data files
  const dataEntries = entries.filter(e => e.name.startsWith('data/') && e.name.endsWith('.json'));
  const tableMap = new Map();
  for (const entry of dataEntries) {
    const parts = entry.name.split('/');
    if (parts.length < 3) continue;
    const tableName = parts[1];
    if (!tableMap.has(tableName)) tableMap.set(tableName, []);
    tableMap.get(tableName).push(entry);
  }

  console.log(\`\\n📊 \${tableMap.size} tables to restore\`);
  if (SKIP_TABLES.size > 0) console.log(\`   Skipping: \${[...SKIP_TABLES].join(', ')}\`);

  const report = {
    started_at: new Date().toISOString(),
    target: targetUrl,
    source_backup: manifest.created_at,
    tables: {},
    total_inserted: 0,
    total_errors: 0,
    total_skipped: 0,
  };

  const sorted = [...tableMap.keys()].sort();
  for (const tableName of sorted) {
    if (SKIP_TABLES.has(tableName)) {
      console.log(\`   ⏭  \${tableName} (skipped)\`);
      report.tables[tableName] = { status: 'skipped' };
      report.total_skipped++;
      continue;
    }

    const parts = tableMap.get(tableName);
    parts.sort((a, b) => a.name.localeCompare(b.name));

    let allRows = [];
    for (const part of parts) {
      const bytes = await extractEntry(zipBuffer, part);
      const rows = JSON.parse(new TextDecoder().decode(bytes));
      allRows = allRows.concat(rows);
    }

    process.stdout.write(\`   ↻ \${tableName} (\${allRows.length} rows)... \`);

    const result = await upsertRows(targetUrl, targetKey, tableName, allRows);

    if (result.errors > 0) {
      console.log(\`⚠️  \${result.inserted} ok, \${result.errors} errors\`);
    } else {
      console.log(\`✓ \${result.inserted} rows\`);
    }

    report.tables[tableName] = { rows: allRows.length, inserted: result.inserted, errors: result.errors, parts: parts.length };
    report.total_inserted += result.inserted;
    report.total_errors += result.errors;
  }

  report.completed_at = new Date().toISOString();
  report.duration_ms = Date.now() - new Date(report.started_at).getTime();

  const reportPath = \`restore-report-\${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json\`;
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(\`
╔══════════════════════════════════════════════════════════════════════╗
║  RESTORE \${DRY_RUN ? 'VALIDATION' : 'COMPLETE   '}                                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║  Tables:  \${String(sorted.length - report.total_skipped).padEnd(57)}║
║  Rows:    \${String(report.total_inserted.toLocaleString()).padEnd(57)}║
║  Errors:  \${String(report.total_errors).padEnd(57)}║
║  Skipped: \${String(report.total_skipped).padEnd(57)}║
║  Time:    \${String(report.duration_ms + 'ms').padEnd(57)}║
║  Report:  \${reportPath.padEnd(57)}║
╚══════════════════════════════════════════════════════════════════════╝

\${report.total_errors > 0 ? '⚠️  Some rows failed — check the report.' : '✅ All data restored successfully.'}
\${DRY_RUN ? '🔍 Dry run — no data written. Remove --dry-run to apply.' : ''}
\`);
}

async function upsertRows(url, key, table, rows) {
  if (DRY_RUN || rows.length === 0) return { inserted: rows.length, errors: 0 };

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch(\`\${url}/rest/v1/\${table}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${key}\`,
          'apikey': key,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(batch),
      });

      if (res.ok) {
        inserted += batch.length;
        await res.text();
      } else {
        await res.text();
        // Retry with ignore-duplicates
        const retry = await fetch(\`\${url}/rest/v1/\${table}\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${key}\`,
            'apikey': key,
            'Prefer': 'resolution=ignore-duplicates,return=minimal',
          },
          body: JSON.stringify(batch),
        });
        if (retry.ok) {
          inserted += batch.length;
        } else {
          errors += batch.length;
        }
        await retry.text();
      }
    } catch (e) {
      errors += batch.length;
    }
  }

  return { inserted, errors };
}

// ═══════════════════════════════════════════════════════════════
// INSPECT MODE
// ═══════════════════════════════════════════════════════════════

async function inspectBackup(zipPath) {
  if (!existsSync(zipPath)) {
    console.error(\`❌ File not found: \${zipPath}\`);
    process.exit(1);
  }

  const zipBuffer = new Uint8Array(readFileSync(zipPath));
  const entries = readZipEntries(zipBuffer);

  const manifestEntry = entries.find(e => e.name === 'manifest.json');
  if (!manifestEntry) {
    console.error('❌ No manifest.json found');
    process.exit(1);
  }

  const manifest = JSON.parse(await extractText(zipBuffer, manifestEntry));

  console.log(\`
╔══════════════════════════════════════════════════════════════════════╗
║  CMPSBL® Backup Inspector                                          ║
╚══════════════════════════════════════════════════════════════════════╝

  File:      \${basename(zipPath)}
  Size:      \${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB
  Created:   \${manifest.created_at}
  Format:    v\${manifest.format_version}
  Tables:    \${manifest.tables_exported}/\${manifest.table_count}
  Rows:      \${manifest.total_rows?.toLocaleString()}
  Duration:  \${manifest.duration_ms}ms
  Partial:   \${manifest.timed_out ? 'YES ⚠️' : 'No'}
  Errors:    \${manifest.errors}
  Entries:   \${entries.length} files in ZIP
\`);

  if (manifest.tables) {
    console.log('  Table Inventory:');
    const sorted = Object.entries(manifest.tables).sort(([a], [b]) => a.localeCompare(b));
    for (const [name, count] of sorted) {
      const status = count === -1 ? '❌ FAILED' : count === -2 ? '⏭ TIMEOUT' : count === -3 ? '🔇 SKIPPED' : \`\${count} rows\`;
      console.log(\`    \${name.padEnd(40)} \${status}\`);
    }
  }

  if (manifest.skipped_tables?.length > 0) {
    console.log(\`\\n  Configured skips: \${manifest.skipped_tables.join(', ')}\`);
  }
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA-SQL MODE (no repo needed)
// ═══════════════════════════════════════════════════════════════

async function schemaSql(zipPath) {
  if (!existsSync(zipPath)) {
    console.error(\`❌ File not found: \${zipPath}\`);
    process.exit(1);
  }

  const zipBuffer = new Uint8Array(readFileSync(zipPath));
  const entries = readZipEntries(zipBuffer);

  const schemaEntry = entries.find(e => e.name === 'schema/openapi-spec.json');
  if (!schemaEntry) {
    console.error('❌ No OpenAPI schema in backup — cannot generate DDL');
    process.exit(1);
  }

  const spec = JSON.parse(await extractText(zipBuffer, schemaEntry));
  const definitions = spec.definitions || {};

  console.log('-- ═══════════════════════════════════════════════════════════');
  console.log('-- CMPSBL® Schema DDL (auto-generated from OpenAPI spec)');
  console.log('-- These are HINTS — review column types and constraints.');
  console.log('-- Generated by cmpsbl-disaster-recovery.mjs v' + VERSION);
  console.log('-- ═══════════════════════════════════════════════════════════');
  console.log('');

  const pgTypeMap = {
    'string': 'text',
    'integer': 'integer',
    'number': 'numeric',
    'boolean': 'boolean',
    'object': 'jsonb',
    'array': 'jsonb',
  };

  for (const [tableName, def] of Object.entries(definitions)) {
    if (tableName.startsWith('rpc/')) continue;
    const props = def.properties || {};
    const required = new Set(def.required || []);

    const columns = [];
    for (const [col, colDef] of Object.entries(props)) {
      let pgType = pgTypeMap[colDef.type] || 'text';

      // Detect common patterns
      if (colDef.format === 'uuid') pgType = 'uuid';
      else if (colDef.format === 'timestamp with time zone' || colDef.format === 'timestamptz') pgType = 'timestamptz';
      else if (colDef.format === 'date-time') pgType = 'timestamptz';
      else if (colDef.format === 'bigint') pgType = 'bigint';
      else if (colDef.format === 'double precision') pgType = 'double precision';
      else if (colDef.format === 'real') pgType = 'real';
      else if (colDef.format === 'smallint') pgType = 'smallint';
      else if (colDef.format === 'jsonb') pgType = 'jsonb';
      else if (colDef.format === 'json') pgType = 'json';

      // Detect arrays
      if (colDef.type === 'array' && colDef.items?.type) {
        const itemType = pgTypeMap[colDef.items.type] || 'text';
        pgType = \`\${itemType}[]\`;
      }

      const nullable = !required.has(col) ? '' : ' NOT NULL';
      const defaultVal = col === 'id' && pgType === 'uuid' ? ' DEFAULT gen_random_uuid()' :
                         (col === 'created_at' || col === 'updated_at') && pgType === 'timestamptz' ? ' DEFAULT now()' : '';
      const pk = col === 'id' ? ' PRIMARY KEY' : '';

      columns.push(\`  "\${col}" \${pgType}\${nullable}\${defaultVal}\${pk}\`);
    }

    if (columns.length === 0) continue;

    console.log(\`CREATE TABLE IF NOT EXISTS public."\${tableName}" (\`);
    console.log(columns.join(',\\n'));
    console.log(');');
    console.log(\`ALTER TABLE public."\${tableName}" ENABLE ROW LEVEL SECURITY;\`);
    console.log('');
  }

  console.log('-- ═══════════════════════════════════════════════════════════');
  console.log('-- END OF SCHEMA DDL');
  console.log('-- Review, adjust types/constraints, then run against your DB.');
  console.log('-- After schema is ready, restore data with:');
  console.log(\`-- node cmpsbl-disaster-recovery.mjs restore \${zipPath} --url=... --key=...\`);
  console.log('-- ═══════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════
// MAIN DISPATCH
// ═══════════════════════════════════════════════════════════════

async function main() {
  switch (mode) {
    case 'download': {
      await downloadBackup();
      break;
    }

    case 'restore': {
      const zipPath = rawArgs[1];
      if (!zipPath || zipPath.startsWith('--')) {
        console.error('❌ Usage: restore <backup.zip> --url=... --key=...');
        process.exit(1);
      }
      await restoreBackup(zipPath);
      break;
    }

    case 'full-recovery': {
      const zipFile = await downloadBackup();
      console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
      await restoreBackup(zipFile);
      break;
    }

    case 'inspect': {
      const zipPath = rawArgs[1];
      if (!zipPath || zipPath.startsWith('--')) {
        console.error('❌ Usage: inspect <backup.zip>');
        process.exit(1);
      }
      await inspectBackup(zipPath);
      break;
    }

    case 'schema-sql': {
      const zipPath = rawArgs[1];
      if (!zipPath || zipPath.startsWith('--')) {
        console.error('❌ Usage: schema-sql <backup.zip>');
        process.exit(1);
      }
      await schemaSql(zipPath);
      break;
    }

    default:
      console.error(\`❌ Unknown command: \${mode}\`);
      printUsage();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Fatal:', err.message || err);
  process.exit(1);
});
`,
  'README.md': `# CMPSBL® Substrate Restore Kit v1.0.0

**100% standalone disaster recovery.** This kit restores a CMPSBL full-backup ZIP into any Supabase project — no Lovable account required.

## Prerequisites

- **Node.js 18+** (uses native \`fetch\`, \`DecompressionStream\`, \`fs\`)
- A **full-backup ZIP** from the FAILSAFE backup system
- Target **Supabase project URL** and **service_role key**

## Quick Start

\`\`\`bash
# 1. Download the backup ZIP from your admin panel or storage bucket
# 2. Run the restore:

node restore.mjs full-backup-2026-04-03.zip \\
  https://YOUR-PROJECT.supabase.co \\
  YOUR_SERVICE_ROLE_KEY
\`\`\`

## Flags

| Flag | Description |
|------|-------------|
| \`--dry-run\` | Validate backup structure without writing any data |
| \`--skip=table1,table2\` | Skip specific tables during restore |

## What Gets Restored

| Component | Included | Notes |
|-----------|----------|-------|
| All database tables | ✅ | Paginated JSON, upserted with conflict resolution |
| OpenAPI schema | ✅ | Column types and relationships for verification |
| Storage bucket inventory | ✅ | File listings (not file contents) |
| RESTORE.md guide | ✅ | AI-ready reconstruction instructions |
| Edge functions | ❌ | Redeploy from source: \`npx supabase functions deploy\` |
| Storage file contents | ❌ | Re-upload from your file backups |

## How It Works

1. Reads the ZIP using a zero-dependency ZIP parser (no \`unzip\` or \`jszip\` needed)
2. Validates ZIP structure (magic bytes, EOCD marker, manifest)
3. Connects to target Supabase via PostgREST API
4. Upserts all table data in 200-row batches with automatic conflict resolution
5. Generates a detailed \`restore-report-*.json\` with per-table results

## Recovery Scenarios

### Full restoration to new Supabase project
\`\`\`bash
node restore.mjs backup.zip https://new-project.supabase.co SERVICE_KEY
\`\`\`

### Validate backup integrity without restoring
\`\`\`bash
node restore.mjs backup.zip https://project.supabase.co SERVICE_KEY --dry-run
\`\`\`

### Partial restore (skip large telemetry tables)
\`\`\`bash
node restore.mjs backup.zip https://project.supabase.co SERVICE_KEY \\
  --skip=ai_usage_log,brain_events,analytics_events
\`\`\`

## Important Notes

- **Schema must exist first.** This tool restores *data*, not table schemas. Run your migrations before restoring data.
- **RLS is bypassed** via the service_role key — this is intentional for disaster recovery.
- **Conflict resolution** uses \`merge-duplicates\` (upsert) — existing rows are updated, new rows are inserted.
- **No external dependencies** — the entire restore runs on Node.js built-ins.

## Files

- \`restore.mjs\` — The restore script (single file, ~300 lines)
- \`README.md\` — This file

---

© 2025–2026 CMPSBL® / PromptFluid™. All rights reserved.
`,
};
