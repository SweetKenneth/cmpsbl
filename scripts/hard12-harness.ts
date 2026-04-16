/**
 * Hard-12 Stress Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs each of 12 hard real-world OSS files through:
 *   (a) generateRefurbishedCode  — Layer 1 + Layer 2 ascension
 *   (b) generateUnifiedCapabilityFile — capability pack + CMPSBL Layer merge
 * Then validates structural integrity per-language.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import { validateLayer2Linkage } from '@/lib/export/layer2-validator';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const HARD12 = [
  { file: 'checker.ts',                       lang: 'TypeScript' },
  { file: 'routing.py',                       lang: 'Python'     },
  { file: 'builder.rs',                       lang: 'Rust'       },
  { file: 'scheduler.go',                     lang: 'Go'         },
  { file: 'AbstractApplicationContext.java',  lang: 'Java'       },
  { file: 'base.rb',                          lang: 'Ruby'       },
  { file: 'CommandLine.cpp',                  lang: 'C++'        },
  { file: 'Session.swift',                    lang: 'Swift'      },
  { file: 'Builders.common.kt',               lang: 'Kotlin'     },
  { file: 'Application.php',                  lang: 'PHP'        },
  { file: 'router.ex',                        lang: 'Elixir'     },
  { file: 'GenericWebHostBuilder.cs',         lang: 'C#'         },
];

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense',  name: 'DEFENSE',  category: 'Layer',  impactScore: 95, rationale: 'Hard-12 stress test', chainPosition: 1, collisionScore: 95 },
  { primitiveId: 'brain',    name: 'BRAIN',    category: 'Organ',  impactScore: 90, rationale: 'Hard-12 stress test', chainPosition: 2, collisionScore: 90 },
  { primitiveId: 'immunity', name: 'IMMUNITY', category: 'Layer',  impactScore: 88, rationale: 'Hard-12 stress test', chainPosition: 3, collisionScore: 88 },
  { primitiveId: 'failsafe', name: 'FAILSAFE', category: 'Engine', impactScore: 85, rationale: 'Hard-12 stress test', chainPosition: 4, collisionScore: 85 },
];

const CAPABILITIES: UnifiedCapabilityInput[] = [
  {
    id: 'hard12-cap', name: 'Hardened_Worker', cjpiScore: 92, tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY', 'FAILSAFE'],
    fingerprint: 'HARD12STRESS00000000000000000000',
    moatSignature: 'ENTERPRISE_HARDENED',
  } as any,
];

const FP = 'HARD12STRESSTESTABCDEF1234567890';
const OUT_DIR = '/tmp/hard12-out';
mkdirSync(OUT_DIR, { recursive: true });

const layers = getAvailableLayers();              // Pull all available CMPSBL layers
const selectedLayers = layers.slice(0, 2);        // Merge top 2 (Circuit Breaker + Self-Healing)
console.log(`✦ Merging CMPSBL Layers: ${selectedLayers.map(l => l.name).join(', ')}\n`);

interface Result {
  file: string; lang: string;
  refurbBytes: number; refurbOk: boolean; refurbErr?: string;
  unifiedBytes: number; unifiedOk: boolean; unifiedErr?: string;
  linkOk: boolean; linkErrs: string[];
}

const results: Result[] = [];

for (const { file, lang } of HARD12) {
  const src = readFileSync(join('/tmp/hard12', file), 'utf-8');
  const r: Result = {
    file, lang,
    refurbBytes: 0, refurbOk: false,
    unifiedBytes: 0, unifiedOk: false,
    linkOk: false, linkErrs: [],
  };

  // ── (a) Refurbished (Layer 1 + Layer 2)
  try {
    const out = generateRefurbishedCode(src, PRIMS, FP, lang, file);
    r.refurbBytes = out.length;
    r.refurbOk = true;
    writeFileSync(join(OUT_DIR, `refurb-${file}`), out);

    // Layer-2 linkage check
    const link = validateLayer2Linkage(out, lang, [file]);
    r.linkOk = link.linked;
    r.linkErrs = link.errors || [];
  } catch (e: any) {
    r.refurbErr = String(e?.message || e).split('\n')[0].slice(0, 200);
  }

  // ── (b) Unified capability pack with CMPSBL Layer merged
  const langKey = lang.toLowerCase().replace('++', 'pp').replace('#', 'sharp');
  try {
    const out2 = generateUnifiedCapabilityFile(
      CAPABILITIES, 'hard12_pack', langKey, undefined, selectedLayers,
    );
    r.unifiedBytes = out2.length;
    r.unifiedOk = true;
    writeFileSync(join(OUT_DIR, `unified-${langKey}-${file}`), out2);
  } catch (e: any) {
    r.unifiedErr = String(e?.message || e).split('\n')[0].slice(0, 200);
  }

  results.push(r);
}

// ── Report ──
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('HARD-12 STRESS TEST WITH CMPSBL LAYER MERGE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('LANG'.padEnd(12) + 'FILE'.padEnd(34) + 'REFURB'.padEnd(10) + 'UNIFIED'.padEnd(10) + 'LINK');
console.log('-'.repeat(80));
for (const r of results) {
  const ref = r.refurbOk ? `✓ ${(r.refurbBytes / 1024).toFixed(0)}K`.padEnd(10) : '✗ FAIL'.padEnd(10);
  const uni = r.unifiedOk ? `✓ ${(r.unifiedBytes / 1024).toFixed(0)}K`.padEnd(10) : '✗ FAIL'.padEnd(10);
  const link = r.refurbOk ? (r.linkOk ? '✓' : '✗') : '—';
  console.log(`${r.lang.padEnd(12)}${r.file.padEnd(34)}${ref}${uni}${link}`);
  if (r.refurbErr)  console.log(`   refurb:  ${r.refurbErr}`);
  if (r.unifiedErr) console.log(`   unified: ${r.unifiedErr}`);
  if (!r.linkOk && r.refurbOk && r.linkErrs.length) {
    console.log(`   link:    ${r.linkErrs.slice(0, 2).join(' | ')}`);
  }
}
console.log('-'.repeat(80));
const refOk = results.filter(r => r.refurbOk).length;
const uniOk = results.filter(r => r.unifiedOk).length;
const linkOk = results.filter(r => r.linkOk).length;
console.log(`refurb:  ${refOk}/${results.length}`);
console.log(`unified: ${uniOk}/${results.length}`);
console.log(`linkage: ${linkOk}/${results.length}`);
console.log(`output:  ${OUT_DIR}`);

process.exit((refOk === results.length && uniOk === results.length) ? 0 : 1);
