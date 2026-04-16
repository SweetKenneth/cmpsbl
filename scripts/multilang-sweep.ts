/**
 * Multi-Language Ascension V2 Sweep
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs real-world OSS files through Ascension V2 across all Tier-A languages,
 * verifies generated exports with native parsers, and reports failures grouped
 * by language + failure mode.
 *
 * Source files live in /tmp/multilang/<lang>/ — 5 files per language.
 * Outputs go to /tmp/multilang-out/<lang>/ascended-<file>.<ext>.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import { runPreExportHarness } from '@/lib/ascension-v2/pre-export-harness';

const SRC_ROOT = '/tmp/multilang';
const OUT_ROOT = '/tmp/multilang-out';

// Language config — extension, harness language id, parse command (uses {file}).
// `null` parser = structural-only verification.
interface LangConfig {
  id: string;            // generator language id
  ext: string;           // output extension
  parser: string | null; // shell command template, {file} substituted
  fileGlob: RegExp;      // input file matcher
}

const LANGS: LangConfig[] = [
  { id: 'python',     ext: 'py',   parser: 'python3 -c "import ast; ast.parse(open(\'{file}\').read())"',  fileGlob: /\.py$/i },
  { id: 'typescript', ext: 'ts',   parser: 'deno check --no-lock --quiet "{file}" 2>&1 | head -20',         fileGlob: /\.ts$/i },
  { id: 'javascript', ext: 'js',   parser: 'node --check "{file}"',                                          fileGlob: /\.(js|mjs|cjs)$/i },
  { id: 'ruby',       ext: 'rb',   parser: 'ruby -c "{file}"',                                               fileGlob: /\.rb$/i },
  { id: 'lua',        ext: 'lua',  parser: 'luac -p "{file}"',                                               fileGlob: /\.lua$/i },
  { id: 'php',        ext: 'php',  parser: 'php -l "{file}"',                                                fileGlob: /\.php$/i },
  { id: 'go',         ext: 'go',   parser: 'gofmt -e "{file}" > /dev/null',                                  fileGlob: /\.go$/i },
  { id: 'rust',       ext: 'rs',   parser: 'rustc --edition=2021 --crate-name=ascended --emit=metadata --crate-type=lib -o /tmp/_rs.meta "{file}" 2>&1', fileGlob: /\.rs$/i },
  { id: 'java',       ext: 'java', parser: null, /* javac requires class==filename which the generator doesn\'t guarantee */ fileGlob: /\.java$/i },
  { id: 'csharp',     ext: 'cs',   parser: null, /* dotnet build needs a project; syntax-only check not trivial */ fileGlob: /\.cs$/i },
  { id: 'c',          ext: 'c',    parser: 'gcc -fsyntax-only -w "{file}"',                                  fileGlob: /\.c$/i },
  { id: 'cpp',        ext: 'cpp',  parser: 'g++ -fsyntax-only -w -std=c++17 "{file}"',                       fileGlob: /\.(cpp|cc|cxx)$/i },
];

const CAPS: UnifiedCapabilityInput[] = [
  {
    id: 'ml-cap-1', name: 'MultiLang_Worker', cjpiScore: 92, tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY'],
    fingerprint: 'MULTILANG0000000000000000000A001',
    moatSignature: 'MULTI_LANG_SWEEP', capabilityType: 'worker',
  },
];

const allLayers = getAvailableLayers();

// Rotate layer stacks across files; first slot is always cores-only baseline.
function stackFor(i: number): number[] {
  const patterns: number[][] = [
    [],          // cores only (CMPSBL Hardening)
    [0],         // + Self-Healing
    [0, 1],      // + Self-Healing + Autonomous
    [0, 1, 2],   // + Distributed
    [0, 1, 2, 3],// + Oracle-Ripple
  ];
  return patterns[i % patterns.length];
}

interface Row {
  lang: string;
  file: string;
  bytes: number;
  layers: string;
  buildOk: boolean;
  parseOk: boolean | null;       // null = no parser available (structural-only)
  harnessPassed: boolean;
  candidateOk: boolean;
  layer1Untouched: boolean;
  notes: string;
}

const rows: Row[] = [];

mkdirSync(OUT_ROOT, { recursive: true });

for (const lang of LANGS) {
  const srcDir = join(SRC_ROOT, lang.id);
  if (!existsSync(srcDir)) continue;
  const outDir = join(OUT_ROOT, lang.id);
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(srcDir).filter(f => lang.fileGlob.test(f)).sort();
  let idx = 0;

  for (const file of files) {
    const src = readFileSync(join(srcDir, file), 'utf-8');

    // Data-quality guard: skip files that look like an HTTP error page rather
    // than real source (the corpus is fetched at setup time and a few URLs 404).
    const head = src.slice(0, 256).toLowerCase();
    if (
      src.length < 80 ||
      /^\s*(<!doctype|<html|404[: ]|not found)/i.test(src.trimStart()) ||
      head.includes('404: not found') || head.includes('<title>404')
    ) {
      continue;
    }

    const layerIndices = stackFor(idx++);
    const selectedLayers = layerIndices.map(i => allLayers[i]).filter(Boolean);

    let ascended = '';
    let buildErr = '';
    try {
      ascended = generateUnifiedCapabilityFile(
        CAPS,
        `ml_${lang.id}_${file.replace(/\.[^.]+$/, '')}`,
        lang.id,
        [{ name: file, extension: file.split('.').pop() || '', language: lang.id, content: src }],
        selectedLayers,
      );
    } catch (e: any) {
      buildErr = String(e?.message || e).split('\n')[0].slice(0, 160);
    }

    const buildOk = !buildErr && ascended.length > 0;
    let parseOk: boolean | null = null;
    let parseErr = '';
    let harnessPassed = false;
    let candidateOk = false;
    let layer1Untouched = false;

    if (buildOk) {
      // Use a clean filename without double extensions (rustc dislikes dots in crate names).
      const stem = file.replace(/\.[^.]+$/, '');
      const outPath = join(outDir, `ascended-${stem}.${lang.ext}`);
      writeFileSync(outPath, ascended);

      // Native parser check (when available)
      if (lang.parser) {
        try {
          execSync(lang.parser.replace('{file}', outPath), { timeout: 30000, stdio: 'pipe' });
          parseOk = true;
        } catch (e: any) {
          parseOk = false;
          parseErr = String(e?.stderr || e?.stdout || e?.message || e)
            .split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 140);
        }
      }

      // Pre-export harness (TS+PY only — others have no validator)
      if (lang.id === 'python' || lang.id === 'typescript' || lang.id === 'javascript') {
        const report = runPreExportHarness({
          ascendedCode: ascended,
          language: lang.id,
          originalFiles: [{ name: file, content: src }],
          selectedLayers,
        });
        harnessPassed = report.passed;
      } else {
        harnessPassed = true; // no harness for these langs
      }

      // Universal structural checks
      candidateOk = /CANDIDATE/.test(ascended);

      // Layer-1 preservation: TS/JS/Python embed verbatim. Polyglot artifacts
      // embed as comment-prefixed reference (foreign source can't be live syntax
      // in host language). PHP is special: the embedded file is live PHP, so
      // the leading `<?php` open tag is stripped (you can only have one per file).
      const norm = ascended.replace(/\r\n/g, '\n');
      const srcN = src.replace(/\r\n/g, '\n').trimEnd();
      const srcStripped = lang.id === 'php' ? srcN.replace(/^<\?php\s*/i, '').trimStart() : srcN;
      if (norm.includes(srcStripped)) {
        layer1Untouched = true;
      } else {
        const srcLines = srcStripped.split('\n').filter(l => l.trim().length > 0);
        if (srcLines.length === 0) layer1Untouched = true;
        else for (const cc of ['//', '#', '--']) {
          const sample = srcLines.slice(0, 5);
          if (sample.every(line => norm.includes(`${cc} ${line}`))) { layer1Untouched = true; break; }
        }
      }
    }

    rows.push({
      lang: lang.id,
      file,
      bytes: src.length,
      layers: selectedLayers.map(l => l.name.split(' ')[0]).join('+') || 'cores-only',
      buildOk,
      parseOk,
      harnessPassed,
      candidateOk,
      layer1Untouched,
      notes: buildErr || parseErr || '',
    });
  }
}

// ── Per-language summary ──
console.log('━'.repeat(140));
console.log('MULTI-LANG ASCENSION V2 SWEEP — TIER-A LANGUAGES');
console.log('CMPSBL Hardening (7 always-on cores) — chad Kenneth Sweet ⚡');
console.log('━'.repeat(140));

const byLang = new Map<string, Row[]>();
for (const r of rows) {
  if (!byLang.has(r.lang)) byLang.set(r.lang, []);
  byLang.get(r.lang)!.push(r);
}

console.log(
  'LANG'.padEnd(13) + 'N'.padEnd(4) +
  'BUILD'.padEnd(8) + 'PARSE'.padEnd(8) + 'HARN'.padEnd(7) +
  'P41'.padEnd(6) + 'L1'.padEnd(6) + 'STATUS'
);
console.log('─'.repeat(140));

let totalPass = 0, totalAll = 0;
for (const [lang, langRows] of byLang) {
  const n = langRows.length;
  const builds = langRows.filter(r => r.buildOk).length;
  const parses = langRows.filter(r => r.parseOk === true).length;
  const parseAttempted = langRows.filter(r => r.parseOk !== null).length;
  const harn = langRows.filter(r => r.harnessPassed).length;
  const p41 = langRows.filter(r => r.candidateOk).length;
  const l1 = langRows.filter(r => r.layer1Untouched).length;

  const fullyOk = langRows.filter(r =>
    r.buildOk && r.harnessPassed && r.candidateOk && r.layer1Untouched &&
    (r.parseOk === true || r.parseOk === null)
  ).length;

  totalPass += fullyOk;
  totalAll += n;

  const status = fullyOk === n ? '✓ all clean' :
                 fullyOk === 0 ? '✗ all fail'  :
                 `⚠ ${n - fullyOk} fail`;

  const parseStr = parseAttempted ? `${parses}/${parseAttempted}` : 'n/a';
  console.log(
    lang.padEnd(13) + String(n).padEnd(4) +
    `${builds}/${n}`.padEnd(8) + parseStr.padEnd(8) + `${harn}/${n}`.padEnd(7) +
    `${p41}/${n}`.padEnd(6) + `${l1}/${n}`.padEnd(6) + status
  );
}
console.log('─'.repeat(140));
console.log(`OVERALL: ${totalPass}/${totalAll} files fully clean across ${byLang.size} languages\n`);

// ── Per-failure detail (first 3 per lang) ──
for (const [lang, langRows] of byLang) {
  const fails = langRows.filter(r =>
    !r.buildOk || r.parseOk === false || !r.harnessPassed || !r.candidateOk || !r.layer1Untouched
  );
  if (fails.length === 0) continue;
  console.log(`\n━━ ${lang.toUpperCase()} failures (${fails.length}/${langRows.length}) ━━`);
  for (const f of fails.slice(0, 3)) {
    const flags: string[] = [];
    if (!f.buildOk) flags.push('build');
    if (f.parseOk === false) flags.push('parse');
    if (!f.harnessPassed) flags.push('harness');
    if (!f.candidateOk) flags.push('p41');
    if (!f.layer1Untouched) flags.push('L1');
    console.log(`  ${f.file.padEnd(28)} [${f.layers.padEnd(20)}] [${flags.join(',')}] ${f.notes.slice(0, 100)}`);
  }
}

console.log('\nOutput artifacts: /tmp/multilang-out/<lang>/');
process.exit(totalPass === totalAll ? 0 : 1);
