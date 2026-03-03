#!/usr/bin/env node
/**
 * Batch Version Update Script
 * Replaces all v9.x.x references with v10.5.4 across the src/ directory
 * 
 * Usage: node scripts/batch-version-update.mjs
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const NEW_VERSION = '13.1.0';
const TARGET_DIR = 'src';
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to replace
const REPLACEMENTS = [
  // v9.x.x / v10.x.x / v11.x.x → v12.0.0
  { find: /v(?:9|10|11)\.\d+\.\d+/g, replace: `v${NEW_VERSION}` },
  // Bare version in version contexts
  { find: /(?<=Version\s|version[:\s='"]+)(?:9|10|11)\.\d+\.\d+/g, replace: NEW_VERSION },
  // Epoch rename: SPARTA → CONTRACT, ARCHITECT → CONTRACT
  { find: /\bSPARTA\b/g, replace: 'CONTRACT' },
  { find: /\bARCHITECT\b/g, replace: 'CONTRACT' },
];

let totalFiles = 0;
let updatedFiles = 0;
let totalReplacements = 0;

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .git, dist
      if (['node_modules', '.git', 'dist', '.next'].includes(entry.name)) continue;
      yield* walkDir(fullPath);
    } else if (VALID_EXTENSIONS.includes(extname(entry.name))) {
      yield fullPath;
    }
  }
}

async function processFile(filePath) {
  totalFiles++;
  let content = await readFile(filePath, 'utf-8');
  let modified = false;
  let fileReplacements = 0;

  for (const { find, replace } of REPLACEMENTS) {
    const matches = content.match(find);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(find, replace);
      modified = true;
    }
  }

  if (modified) {
    await writeFile(filePath, content, 'utf-8');
    updatedFiles++;
    totalReplacements += fileReplacements;
    console.log(`  ✓ ${filePath} (${fileReplacements} replacements)`);
  }
}

async function main() {
  console.log(`\n🔄 Batch Version Update: v9.x.x → v${NEW_VERSION}`);
  console.log(`   Target: ${TARGET_DIR}/\n`);

  for await (const filePath of walkDir(TARGET_DIR)) {
    await processFile(filePath);
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Total replacements: ${totalReplacements}\n`);
}

main().catch(console.error);
