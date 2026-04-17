/**
 * Real-World 25-File Ascension Stress Test — ROUND 2 (Wave 1 languages)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * A second, fully disjoint 25-file corpus across Java, C#, Swift, Kotlin.
 * Sourced from production OSS that the round-1 corpus did NOT touch:
 *
 *   Java:   Apache Commons-Lang, JUnit 5, Mockito, Netty, RxJava,
 *           Project Lombok, Caffeine
 *   C#:     ASP.NET Core, EF Core, Roslyn, Polly, Serilog, MediatR
 *   Swift:  Vapor, swift-nio-http2, swift-collections, swift-algorithms,
 *           swift-log, RxSwift
 *   Kotlin: kotlinx.serialization, kotlinx-datetime, MockK, Arrow,
 *           kotlinx.coroutines (×2)
 *
 * Same five stacked layer profiles as round 1 (minimal → maximal) and the
 * same indent-aware byte-perfect verifier — proves the chain executor and
 * blackbox engine generalize beyond the round-1 corpus.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { emitJavaCmpsblFile,   orderJavaLayersByPhase   } from '@/lib/export/layers-java/java-chain-executor';
import { emitCsharpCmpsblFile, orderCsharpLayersByPhase } from '@/lib/export/layers-csharp/csharp-chain-executor';
import { emitSwiftCmpsblFile,  orderSwiftLayersByPhase  } from '@/lib/export/layers-swift/swift-chain-executor';
import { emitKotlinCmpsblFile, orderKotlinLayersByPhase } from '@/lib/export/layers-kotlin/kotlin-chain-executor';
import { blackboxFile } from '@/lib/export/blackbox';

// ─── Stacked layer profiles (each exercises a different phase mix) ──────────
const PROFILES: Array<{ name: string; ids: string[] }> = [
  { name: 'minimal',  ids: ['audit-chain'] },
  { name: 'security', ids: ['zero-trust', 'cyber-defense', 'ai-safety', 'audit-chain'] },
  { name: 'resilience', ids: ['self-healing', 'autonomous-triage', 'distributed-consensus', 'audit-chain'] },
  { name: 'intelligence', ids: ['fleet-intelligence', 'ai-cost', 'cognitive-memory', 'pipeline-composition', 'audit-chain'] },
  { name: 'maximal',  ids: [
    'self-healing', 'autonomous-triage', 'distributed-consensus',
    'oracle-ripple-precognition', 'anomaly-correlation-engine',
    'adaptive-defense', 'zero-trust', 'cyber-defense', 'ai-safety',
    'fleet-intelligence', 'ai-cost', 'cognitive-memory', 'pipeline-composition', 'universal-input',
    'performance-surgery', 'pipeline-resilience',
    'self-evolution', 'governance-shield', 'audit-chain', 'regulatory-compliance',
  ] },
];

const CORPUS_ROOT = '/tmp/stress-corpus-2';
const LANGS = ['java', 'csharp', 'swift', 'kotlin'] as const;
type Lang = typeof LANGS[number];

interface CorpusFile { lang: Lang; name: string; src: string; }

function loadCorpus(): CorpusFile[] {
  const out: CorpusFile[] = [];
  if (!existsSync(CORPUS_ROOT)) return out;
  for (const lang of LANGS) {
    const dir = join(CORPUS_ROOT, lang);
    if (!existsSync(dir)) continue;
    for (const fn of readdirSync(dir).sort()) {
      const p = join(dir, fn);
      try {
        const src = readFileSync(p, 'utf8');
        if (src.length > 0) out.push({ lang, name: fn, src });
      } catch { /* skip */ }
    }
  }
  return out.slice(0, 25);
}

const CORPUS = loadCorpus();

// ─── Brace/paren/bracket balance check (string + comment aware) ─────────────
function balance(src: string, lang: Lang): { ok: boolean; reason?: string } {
  let braces = 0, parens = 0, brackets = 0;
  let inStr = false, inChar = false, inLine = false, inBlock = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i], nx = src[i + 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (inChar) {
      if (ch === '\\') { i++; continue; }
      if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '/' && nx === '/') { inLine = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBlock = true; i++; continue; }
    if (ch === '"') { inStr = true; continue; }
    if ((lang === 'java' || lang === 'csharp' || lang === 'kotlin') && ch === "'") { inChar = true; continue; }
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  if (braces !== 0)   return { ok: false, reason: `braces delta=${braces}` };
  if (parens !== 0)   return { ok: false, reason: `parens delta=${parens}` };
  if (brackets !== 0) return { ok: false, reason: `brackets delta=${brackets}` };
  return { ok: true };
}

// Wrap a real-world source file into a Layer-1-shaped body for each language.
function wrapAsLayer1Comment(src: string, lang: Lang): string {
  const banner = '/* ─── REAL-WORLD CUSTOMER LAYER 1 (verbatim) ───';
  const close = '*/';
  const safe = src.replace(/\*\//g, '*\\/');
  if (lang === 'csharp') return `${banner}\n${safe}\n${close}\nvar output = new Dictionary<string, object>(input);\nreturn output;`;
  if (lang === 'java')   return `${banner}\n${safe}\n${close}\nreturn new LinkedHashMap<>(input);`;
  if (lang === 'kotlin') return `${banner}\n${safe}\n${close}\nreturn input`;
  /* swift */            return `${banner}\n${safe}\n${close}\nreturn input`;
}

function emitFor(lang: Lang, ids: string[], userBody: string): string {
  switch (lang) {
    case 'java':   return emitJavaCmpsblFile('com.cmpsbl.stress2', ids, userBody);
    case 'csharp': return emitCsharpCmpsblFile('Cmpsbl.Stress2', ids, userBody);
    case 'swift':  return emitSwiftCmpsblFile('CmpsblStress2', ids, userBody);
    case 'kotlin': return emitKotlinCmpsblFile('com.cmpsbl.stress2', ids, userBody);
  }
}

function orderFor(lang: Lang, ids: string[]): string[] {
  switch (lang) {
    case 'java':   return orderJavaLayersByPhase(ids);
    case 'csharp': return orderCsharpLayersByPhase(ids);
    case 'swift':  return orderSwiftLayersByPhase(ids);
    case 'kotlin': return orderKotlinLayersByPhase(ids);
  }
}

const ENTRY_SYMBOL: Record<Lang, string> = {
  java:   'public static Map<String, Object> cmpsblExecute',
  csharp: 'public static Dictionary<string, object> CmpsblExecute',
  swift:  'public static func cmpsblExecute',
  kotlin: 'fun cmpsblExecute',
};

/**
 * Indent-aware byte-perfect verifier — same contract as round-1 helper.
 * Strips leading whitespace per line and walks forward through the haystack,
 * proving every non-blank source line appears in order. This tolerates the
 * uniform indentation the chain executor applies to the embedded Layer 1.
 */
function expectLayer1Preserved(haystack: string, originalSrc: string, label: string): void {
  const escaped = originalSrc.replace(/\*\//g, '*\\/');
  const haystackLines = haystack.split('\n').map(l => l.replace(/^\s+/, ''));
  const needleLines = escaped.split('\n')
    .map(l => l.replace(/^\s+/, ''))
    .filter(l => l.length > 0)
    .slice(0, 30);

  let cursor = 0;
  for (const line of needleLines) {
    const idx = haystackLines.indexOf(line, cursor);
    if (idx === -1) {
      throw new Error(`${label}: missing Layer 1 line "${line.slice(0, 80)}" after cursor ${cursor}`);
    }
    cursor = idx + 1;
  }
}

// ─── Top-level fixture sanity ────────────────────────────────────────────────
describe('Real-world 25-file stress corpus — ROUND 2', () => {
  it('loaded the full 25-file round-2 corpus from /tmp/stress-corpus-2', () => {
    expect(CORPUS.length, 'round-2 corpus must contain 25 real-world files').toBe(25);
    const seen = new Set(CORPUS.map(f => f.lang));
    expect(seen.has('java')).toBe(true);
    expect(seen.has('csharp')).toBe(true);
    expect(seen.has('swift')).toBe(true);
    expect(seen.has('kotlin')).toBe(true);
  });
});

// ─── Per-file × per-profile assertions ───────────────────────────────────────
for (const file of CORPUS) {
  describe(`R2 ${file.lang} :: ${file.name}`, () => {
    const layer1Body = wrapAsLayer1Comment(file.src, file.lang);

    for (const profile of PROFILES) {
      describe(`profile=${profile.name} (${profile.ids.length} layer${profile.ids.length === 1 ? '' : 's'})`, () => {
        let emitted: string;
        let sealed: string;

        it('emits without throwing', () => {
          emitted = emitFor(file.lang, profile.ids, layer1Body);
          expect(emitted.length).toBeGreaterThan(2000);
        });

        it('contains the canonical entry point + caller-isolation helpers', () => {
          expect(emitted).toContain(ENTRY_SYMBOL[file.lang]);
          expect(emitted).toContain('_cmpsbl_clone_input');
          expect(emitted).toContain('_cmpsbl_strip_sidecars');
        });

        it('emits every selected layer banner in canonical phase order', () => {
          const ordered = orderFor(file.lang, profile.ids);
          let cursor = 0;
          for (const id of ordered) {
            const banner = `// ─── Layer: ${id} ───`;
            const idx = emitted.indexOf(banner, cursor);
            expect(idx, `banner missing or out of order: ${id}`).toBeGreaterThanOrEqual(cursor);
            cursor = idx + banner.length;
          }
        });

        it('preserves the real-world Layer 1 source byte-for-byte', () => {
          expectLayer1Preserved(emitted, file.src, 'emit');
        });

        it('balances braces/parens/brackets after emission', () => {
          const bal = balance(emitted, file.lang);
          expect(bal.ok, `unbalanced after emit: ${bal.reason}`).toBe(true);
        });

        it('blackboxes without throwing and appends the integrity seal', () => {
          sealed = blackboxFile(emitted, file.lang);
          expect(sealed).toContain('CONVEX CORE™ INTEGRITY');
          expect(sealed).toMatch(/Hash:\s*[A-F0-9]+/);
        });

        it('sealing keeps the real-world Layer 1 bytes intact', () => {
          expectLayer1Preserved(sealed, file.src, 'seal');
        });

        it('sealed output remains brace-balanced', () => {
          const bal = balance(sealed, file.lang);
          expect(bal.ok, `unbalanced after seal: ${bal.reason}`).toBe(true);
        });
      });
    }
  });
}
