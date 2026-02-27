#!/usr/bin/env node
/**
 * Strip Version & Epoch References from JSDoc Comments
 * 
 * Removes hardcoded version numbers (v9.x, v10.x, v11.x) and epoch names
 * (SPARTA, ARCHITECT) from JSDoc comment headers across all src/ files.
 * 
 * Patterns removed:
 *   " * SPARTA Epoch — ..." → " * ..."  (strip "SPARTA Epoch — " prefix)
 *   " * v10.5.4 ARCHITECT — ..." → " * ..."
 *   " * v11.3.0 — ..." → " * ..."
 *   Lines that are ONLY " * SPARTA Epoch" → removed entirely
 * 
 * Usage: node scripts/strip-epoch-from-comments.mjs
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const TARGET_DIR = 'src';
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to clean from comment lines
const COMMENT_CLEANERS = [
  // Lines that are ONLY epoch/version markers → remove entire line
  { find: /^ \* (?:SPARTA|ARCHITECT|CONTRACT) Epoch\s*$/gm, replace: '' },
  { find: /^ \* v\d+\.\d+\.\d+\s*$/gm, replace: '' },
  
  // " * SPARTA Epoch — Description" → " * Description"
  { find: /^( \* )(?:SPARTA|ARCHITECT|CONTRACT) Epoch — /gm, replace: '$1' },
  
  // " * v11.3.0 SPARTA — Description" → " * Description"
  { find: /^( \* )v\d+\.\d+\.\d+\s+(?:SPARTA|ARCHITECT|CONTRACT)\s*—?\s*/gm, replace: '$1' },
  
  // " * v10.5.4 ARCHITECT Epoch — Description" → " * Description"
  { find: /^( \* )v\d+\.\d+\.\d+\s+(?:SPARTA|ARCHITECT|CONTRACT)\s+Epoch\s*—?\s*/gm, replace: '$1' },
  
  // " * v10.5.4 — Description" → " * Description"
  { find: /^( \* )v\d+\.\d+\.\d+\s*—\s*/gm, replace: '$1' },
  
  // " * Module Name — v10.5.4 ARCHITECT Epoch" → " * Module Name"
  { find: /^( \* .+?)(?:\s*—\s*v\d+\.\d+\.\d+(?:\s+(?:SPARTA|ARCHITECT|CONTRACT))?(?:\s+Epoch)?)\s*$/gm, replace: '$1' },
  
  // " * Module Name — SPARTA Epoch" → " * Module Name"
  { find: /^( \* .+?)(?:\s*—\s*(?:SPARTA|ARCHITECT|CONTRACT)\s*(?:Epoch)?)\s*$/gm, replace: '$1' },
  
  // Standalone " * SPARTA Epoch v11.5 — Description" → " * Description"
  { find: /^( \* )(?:SPARTA|ARCHITECT|CONTRACT)\s+Epoch\s+v\d+\.\d+(?:\.\d+)?\s*—?\s*/gm, replace: '$1' },
  
  // " — SPARTA Epoch" suffix at end of comment line
  { find: /\s*—\s*(?:SPARTA|ARCHITECT|CONTRACT)\s*Epoch\s*$/gm, replace: '' },
  
  // Clean up resulting empty comment lines (multiple " *" with just whitespace)
  { find: /^( \*)\s+$/gm, replace: '$1' },
  
  // Clean up double blank comment lines
  { find: /^( \*)\n\1\n/gm, replace: '$1\n' },
];

let totalFiles = 0;
let updatedFiles = 0;
let totalReplacements = 0;

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
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

  for (const { find, replace } of COMMENT_CLEANERS) {
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
    console.log(\`  ✓ \${filePath} (\${fileReplacements} replacements)\`);
  }
}

async function main() {
  console.log(\`\\n🧹 Stripping epoch/version from JSDoc comments...\\n\`);

  for await (const filePath of walkDir(TARGET_DIR)) {
    await processFile(filePath);
  }

  console.log(\`\\n✅ Complete!\`);
  console.log(\`   Files scanned: \${totalFiles}\`);
  console.log(\`   Files updated: \${updatedFiles}\`);
  console.log(\`   Total replacements: \${totalReplacements}\\n\`);
}

main().catch(console.error);
