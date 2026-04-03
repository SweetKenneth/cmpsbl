#!/usr/bin/env node
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
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® Substrate Restore Kit v1.0.0                       ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node restore.mjs <backup.zip> <SUPABASE_URL> <SERVICE_ROLE_KEY> [flags]

Flags:
  --dry-run          Validate backup without writing data
  --skip=t1,t2       Skip specific tables during restore

Example:
  node restore.mjs full-backup-2026-04-03.zip \\
    https://abcdefgh.supabase.co \\
    eyJhbGciOiJI...

The restore kit reads a full-backup ZIP, validates its structure,
and upserts all table data into the target Supabase project via
the PostgREST API. It handles pagination, conflict resolution,
and produces a detailed report upon completion.
`);
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
    throw new Error(`Invalid local header for ${entry.name}`);
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
    throw new Error(`Unsupported compression method ${entry.method} for ${entry.name}`);
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
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Prefer': `resolution=merge-duplicates,return=minimal`,
        },
        body: JSON.stringify(batch),
      });

      if (res.ok) {
        inserted += batch.length;
      } else {
        const errText = await res.text();
        // If merge-duplicates fails (no PK), try plain insert with ignore
        if (res.status === 400 || res.status === 409) {
          const retryRes = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey,
              'Prefer': 'resolution=ignore-duplicates,return=minimal',
            },
            body: JSON.stringify(batch),
          });
          if (retryRes.ok) {
            inserted += batch.length;
          } else {
            console.error(`  ✗ ${table} batch ${Math.floor(i/BATCH)+1}: ${await retryRes.text()}`);
            errors += batch.length;
          }
        } else {
          console.error(`  ✗ ${table} batch ${Math.floor(i/BATCH)+1}: ${errText}`);
          errors += batch.length;
        }
      }
    } catch (e) {
      console.error(`  ✗ ${table} batch ${Math.floor(i/BATCH)+1}: ${e.message}`);
      errors += batch.length;
    }
  }

  return { inserted, errors };
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® Substrate Restore Kit v1.0.0                       ║
║  ${DRY_RUN ? '🔍 DRY RUN MODE — no data will be written' : '⚡ LIVE MODE — data will be written to target'}             ║
╚══════════════════════════════════════════════════════════════╝
`);

  // 1. Read and parse ZIP
  console.log(`📦 Reading backup: ${basename(zipPath)}`);
  if (!existsSync(zipPath)) {
    console.error(`❌ File not found: ${zipPath}`);
    process.exit(1);
  }

  const zipBuffer = new Uint8Array(readFileSync(zipPath));
  console.log(`   Size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Validate ZIP signature
  if (zipBuffer[0] !== 0x50 || zipBuffer[1] !== 0x4B) {
    console.error('❌ Invalid ZIP file — missing PK signature');
    process.exit(1);
  }

  const entries = readZipEntries(zipBuffer);
  console.log(`   Entries: ${entries.length}`);

  // 2. Extract and parse manifest
  const manifestEntry = entries.find(e => e.name === 'manifest.json');
  if (!manifestEntry) {
    console.error('❌ No manifest.json found in backup — invalid backup format');
    process.exit(1);
  }

  const manifestBytes = await extractEntry(zipBuffer, manifestEntry);
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
  console.log(`\n📋 Manifest:`);
  console.log(`   Created: ${manifest.created_at}`);
  console.log(`   Format:  v${manifest.format_version}`);
  console.log(`   Tables:  ${manifest.tables_exported}/${manifest.table_count}`);
  console.log(`   Rows:    ${manifest.total_rows?.toLocaleString()}`);
  if (manifest.timed_out) {
    console.log(`   ⚠️  Backup was time-limited — some tables may be incomplete`);
  }

  // 3. Verify target Supabase is reachable
  console.log(`\n🔗 Verifying target: ${supabaseUrl}`);
  try {
    const healthRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!healthRes.ok) throw new Error(`HTTP ${healthRes.status}`);
    console.log(`   ✓ PostgREST is reachable`);
  } catch (e) {
    console.error(`   ❌ Cannot reach target: ${e.message}`);
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

  console.log(`\n📊 Found ${tableMap.size} tables to restore`);
  if (SKIP_TABLES.size > 0) {
    console.log(`   Skipping: ${[...SKIP_TABLES].join(', ')}`);
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
      console.log(`   ⏭  ${tableName} (skipped)`);
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

    process.stdout.write(`   ↻ ${tableName} (${totalRows} rows)... `);

    const result = await upsertRows(tableName, allRows);
    
    if (result.errors > 0) {
      console.log(`⚠️  ${result.inserted} ok, ${result.errors} errors`);
    } else {
      console.log(`✓ ${result.inserted} rows`);
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
    console.log(`\n📐 OpenAPI schema included — can be used to verify table structure`);
  }

  // 7. Storage inventory
  const storageEntries = entries.filter(e => e.name.startsWith('storage/') && e.name.endsWith('.json'));
  if (storageEntries.length > 0) {
    console.log(`\n🗄️  Storage inventory: ${storageEntries.length} bucket listing(s) included`);
    console.log(`   Note: File contents are NOT stored in the backup.`);
    console.log(`   Use the bucket listings to verify storage state.`);
  }

  // 8. RESTORE.md
  const restoreEntry = entries.find(e => e.name === 'RESTORE.md');
  if (restoreEntry) {
    console.log(`\n📖 RESTORE.md guide included in backup`);
  }

  // 9. Final report
  report.completed_at = new Date().toISOString();
  report.duration_ms = Date.now() - new Date(report.started_at).getTime();

  const reportPath = `restore-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  RESTORE ${DRY_RUN ? 'VALIDATION' : 'COMPLETE'}                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Tables restored: ${String(sortedTables.length - report.total_skipped).padEnd(40)}║
║  Rows inserted:   ${String(report.total_inserted.toLocaleString()).padEnd(40)}║
║  Errors:          ${String(report.total_errors).padEnd(40)}║
║  Skipped tables:  ${String(report.total_skipped).padEnd(40)}║
║  Duration:        ${String(report.duration_ms + 'ms').padEnd(40)}║
║  Report:          ${reportPath.padEnd(40)}║
╚══════════════════════════════════════════════════════════════╝

${report.total_errors > 0 ? '⚠️  Some rows failed — check the report for details.' : '✅ All data restored successfully.'}
${DRY_RUN ? '\n🔍 This was a dry run. No data was written. Run without --dry-run to apply.' : ''}
`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
