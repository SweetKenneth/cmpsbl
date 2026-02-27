#!/usr/bin/env node
/**
 * Version Sync Script
 * 
 * Updates ALL version references across markdown docs and code comments.
 * Run after updating the Zustand store's publicMetricsStore default version.
 * 
 * Usage from terminal: node scripts/sync-versions.mjs 10.1.0
 * Or: In the OS Dashboard → Public Metrics → update version → versions propagate via Zustand for React,
 *     then run this script once for static markdown files.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const NEW_VERSION = process.argv[2];
if (!NEW_VERSION) {
  console.error('Usage: node scripts/sync-versions.mjs <new-version>');
  console.error('Example: node scripts/sync-versions.mjs 10.1.0');
  process.exit(1);
}

// Version patterns to replace (ordered from most specific to least)
const VERSION_PATTERNS = [
  // Explicit version strings like v9.1.0, v10.0.0, v11.3.0
  { regex: /v(9\.\d+\.\d+|10\.\d+\.\d+|11\.\d+\.\d+)/g, replacement: `v${NEW_VERSION}` },
  // Bare version strings like "Version 9.1.0", "version: '11.3.0'"
  { regex: /(?<=Version\s|version[:\s='"]+)(9\.\d+\.\d+|10\.\d+\.\d+|11\.\d+\.\d+)/g, replacement: NEW_VERSION },
  // In code comments like "v11.3.0 SPARTA"
  { regex: /(?<=\*\s*)v(9\.\d+\.\d+|10\.\d+\.\d+|11\.\d+\.\d+)/g, replacement: `v${NEW_VERSION}` },
];

// Directories to scan
const SCAN_DIRS = [
  'public/docs/website',
  'public/docs/library',
  'public/docs/internal',
  'public/docs/versioning',
  'docs/academic',
  'docs/internal',
  'docs/library',
  'docs/modules',
  'docs/website',
];

const EXTENSIONS = ['.md'];

let filesUpdated = 0;
let totalReplacements = 0;

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let replacements = 0;
  
  for (const pattern of VERSION_PATTERNS) {
    const matches = content.match(pattern.regex);
    if (matches) {
      replacements += matches.length;
      content = content.replace(pattern.regex, pattern.replacement);
    }
  }
  
  if (replacements > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${filePath} (${replacements} replacements)`);
    filesUpdated++;
    totalReplacements += replacements;
  }
}

function scanDir(dir) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (EXTENSIONS.includes(extname(entry))) {
        processFile(fullPath);
      }
    }
  } catch (e) {
    // Directory doesn't exist, skip
  }
}

console.log(`\\n🔄 Syncing all docs to v${NEW_VERSION}...\\n`);

for (const dir of SCAN_DIRS) {
  console.log(`Scanning ${dir}/`);
  scanDir(dir);
}

console.log(`\\n✅ Done! Updated ${filesUpdated} files with ${totalReplacements} replacements.`);
console.log(`\\nReminder: React components read from the Zustand store automatically.`);
console.log(`Update the store default in src/stores/publicMetricsStore.ts if not done already.\\n`);
