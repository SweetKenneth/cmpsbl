/**
 * Ascension V2 PRO-Tier Stress Harness
 *
 * Mirrors stress2-run.ts (Free/Builder) but exercises the system as a Pro user:
 *   • All 20 launch layers should be unlocked (3 Free + 17 Pro)
 *   • Smart recs should surface advanced layers (Self-Healing, Anomaly, etc.)
 *     with NO upgradeRequired locks
 *   • Governance modes SOFT + ENFORCE must be allowed
 *   • Same 27-file polyglot corpus → gate / fingerprint / dedup sanity
 *
 * Output: /mnt/documents/ascension-v2-pro-tier-stress.json
 */
import * as fs from 'fs';
import * as path from 'path';
import { runPreAscensionGate, formatGateError } from '../../src/lib/ascension-v2/pre-ascension-gate';
import { computeMultiFileFingerprint } from '../../src/lib/ascension-v2/fingerprint-gate';
import { deduplicateCapabilities } from '../../src/lib/ascension-v2/dedup';
import { recommendLayers, summarizeStoreBundle, isStoreLayer } from '../../src/lib/factory/smart-recommendations';
import { TIER_LAYERS, TIER_META } from '../../src/lib/ascension-v2/tier-layers';
import { LAYERS as LAUNCH_LAYERS } from '../../src/components/ascension-v2/V2LaunchLayers';
import { isModeAllowed, GOVERNANCE_MODES } from '../../src/lib/ascension-v2/governance-mode';

// ─── 27-file polyglot corpus (regenerated inline, no fs dependency) ──────────
const CORPUS: Array<{ file: string; lang: string; intent: string; content: string }> = [
  // TypeScript / JavaScript — generics, arrows, classes
  { file: 'ts-generics.ts', lang: 'typescript', intent: 'complex generics + arrows',
    content: `export const map = <T, U>(xs: T[], f: (x: T) => U): U[] => xs.map(f);\nexport class Box<T> { constructor(public v: T) {} get(): T { return this.v; } }\nexport function pipe<A,B,C>(f:(a:A)=>B,g:(b:B)=>C){ return (a:A)=>g(f(a)); }\n` },
  { file: 'ts-react.tsx', lang: 'typescript', intent: 'react component',
    content: `import * as React from 'react';\nexport const Btn: React.FC<{onClick:()=>void;label:string}> = ({onClick,label}) => <button onClick={onClick}>{label}</button>;\nexport function useToggle(init=false){ const [v,setV]=React.useState(init); return [v,()=>setV(x=>!x)] as const; }\n` },
  { file: 'js-class.js', lang: 'javascript', intent: 'es6 class methods',
    content: `class User { constructor(name){ this.name = name; } greet(){ return 'hi '+this.name; } static of(n){ return new User(n); } }\nfunction add(a,b){ return a+b; }\nconst sub = (a,b) => a-b;\nmodule.exports = { User, add, sub };\n` },
  // Python — comprehensions, decorators, async
  { file: 'py-comprehension.py', lang: 'python', intent: 'list/dict comprehensions',
    content: `def squares(n):\n    return [x*x for x in range(n) if x % 2 == 0]\n\ndef pairs(xs, ys):\n    return {(a,b): a+b for a in xs for b in ys}\n\nasync def fetch(url):\n    return url\n` },
  { file: 'py-decorator.py', lang: 'python', intent: 'decorators',
    content: `from functools import wraps\ndef trace(fn):\n    @wraps(fn)\n    def inner(*a, **kw):\n        return fn(*a, **kw)\n    return inner\n\n@trace\ndef compute(x): return x * 2\n` },
  { file: 'py-class.py', lang: 'python', intent: 'class with methods',
    content: `class Account:\n    def __init__(self, balance=0):\n        self.balance = balance\n    def deposit(self, amt):\n        self.balance += amt\n        return self.balance\n    def withdraw(self, amt):\n        if amt > self.balance: raise ValueError('insufficient')\n        self.balance -= amt\n` },
  // Java
  { file: 'Java-Service.java', lang: 'java', intent: 'class with methods',
    content: `public class Service {\n  public String greet(String n) { return "hi " + n; }\n  public int add(int a, int b) { return a + b; }\n  private void log(String m) { System.out.println(m); }\n}\n` },
  // Kotlin
  { file: 'Kt-Repo.kt', lang: 'kotlin', intent: 'kotlin class + funs',
    content: `class Repo(val name: String) {\n  fun load(id: Int): String = "item-$id"\n  fun save(s: String) { println(s) }\n}\nfun topLevel(x: Int) = x * 2\n` },
  // C#
  { file: 'Cs-Handler.cs', lang: 'csharp', intent: 'C# class methods',
    content: `public class Handler {\n  public string Process(string input) { return input.ToUpper(); }\n  public int Count(int[] xs) { return xs.Length; }\n}\n` },
  // Swift
  { file: 'Sw-Vm.swift', lang: 'swift', intent: 'swift class methods',
    content: `class ViewModel {\n  var count: Int = 0\n  func increment() { count += 1 }\n  func reset() { count = 0 }\n}\nfunc helper(_ x: Int) -> Int { return x + 1 }\n` },
  // Go
  { file: 'go-server.go', lang: 'go', intent: 'go funcs',
    content: `package main\nimport "fmt"\nfunc Greet(n string) string { return fmt.Sprintf("hi %s", n) }\nfunc Add(a, b int) int { return a + b }\nfunc main() { fmt.Println(Greet("world")) }\n` },
  // Rust
  { file: 'rs-lib.rs', lang: 'rust', intent: 'rust funcs',
    content: `pub fn greet(n: &str) -> String { format!("hi {}", n) }\npub fn add(a: i32, b: i32) -> i32 { a + b }\nfn private_helper(x: u8) -> u8 { x.wrapping_add(1) }\n` },
  // Ruby
  { file: 'rb-app.rb', lang: 'ruby', intent: 'ruby methods',
    content: `class App\n  def greet(n); "hi #{n}"; end\n  def add(a,b); a+b; end\nend\ndef top_level(x); x*2; end\n` },
  // PHP
  { file: 'php-svc.php', lang: 'php', intent: 'php class',
    content: `<?php\nclass Svc {\n  public function greet($n) { return "hi $n"; }\n  public function add($a, $b) { return $a + $b; }\n}\nfunction topLevel($x) { return $x * 2; }\n` },
  // C / C++
  { file: 'c-utils.c', lang: 'c', intent: 'c funcs',
    content: `#include <stdio.h>\nint add(int a, int b) { return a + b; }\nvoid greet(const char* n) { printf("hi %s\\n", n); }\n` },
  { file: 'cpp-svc.cpp', lang: 'cpp', intent: 'c++ class',
    content: `class Svc {\npublic:\n  int add(int a, int b) { return a + b; }\n  void greet(const char* n) {}\n};\nint main() { return 0; }\n` },
  // Shell / Bash
  { file: 'sh-deploy.sh', lang: 'shell', intent: 'bash funcs',
    content: `#!/bin/bash\ngreet() { echo "hi $1"; }\nadd() { echo $(($1 + $2)); }\ngreet world\n` },
  // SQL
  { file: 'sql-procs.sql', lang: 'sql', intent: 'sql functions',
    content: `CREATE OR REPLACE FUNCTION greet(n text) RETURNS text AS $$ SELECT 'hi ' || n; $$ LANGUAGE sql;\nCREATE OR REPLACE FUNCTION add_ints(a int, b int) RETURNS int AS $$ SELECT a + b; $$ LANGUAGE sql;\n` },
  // YAML / JSON / TOML — config-only (gate should still pass if syntactically valid)
  { file: 'cfg-pkg.json', lang: 'json', intent: 'json config',
    content: `{\n  "name": "demo",\n  "version": "1.0.0",\n  "scripts": { "start": "node index.js" }\n}\n` },
  { file: 'cfg-app.yaml', lang: 'yaml', intent: 'yaml config',
    content: `name: demo\nversion: 1.0.0\nscripts:\n  start: node index.js\n` },
  // Edge cases — empty / tiny / unicode / minified
  { file: 'edge-empty.ts', lang: 'typescript', intent: 'empty file',
    content: `` },
  { file: 'edge-tiny.py', lang: 'python', intent: 'single statement',
    content: `x = 1\n` },
  { file: 'edge-unicode.ts', lang: 'typescript', intent: 'unicode identifiers',
    content: `export function 你好(名字: string) { return '你好 ' + 名字; }\nexport const π = 3.14159;\n` },
  { file: 'edge-minified.js', lang: 'javascript', intent: 'minified single line',
    content: `function a(b){return b+1}function c(d,e){return d*e}var f=(g)=>g-1;module.exports={a:a,c:c,f:f};\n` },
  // Hostile-ish inputs
  { file: 'edge-nested.ts', lang: 'typescript', intent: 'deeply nested generics',
    content: `export type Deep<T> = { v: Array<Map<string, Set<Promise<T | null>>>> };\nexport function unwrap<T>(d: Deep<T>): T | null { return null; }\n` },
  { file: 'edge-comments.py', lang: 'python', intent: 'mostly comments',
    content: `# This file is mostly comments\n# def fake_func(): pass  <- this is in a comment\n# class FakeCls: pass\ndef real_func(x):\n    return x  # trailing\n` },
  { file: 'edge-strings.js', lang: 'javascript', intent: 'function-like strings',
    content: `const s1 = "function notReal() { return 1; }";\nconst s2 = 'class AlsoNotReal {}';\nfunction realOne() { return s1.length + s2.length; }\n` },
];

// ─── Run gate + fingerprint per file ────────────────────────────────────────
const results: any[] = [];
for (const m of CORPUS) {
  const notes: string[] = [];
  const gate = runPreAscensionGate([{ name: m.file, content: m.content }], m.lang);
  let fp: any = null;
  if (gate.ok) {
    try {
      const f = computeMultiFileFingerprint([{ name: m.file, content: m.content }], m.lang);
      fp = { hash: f.hash, functionCount: f.functionCount, totalChars: f.totalChars };
      if (f.functionCount === 0 && m.content.trim().length > 0 && !['json','yaml'].includes(m.lang)) {
        notes.push('FP: 0 functions despite non-empty source');
      }
    } catch (e) { notes.push(`FP error: ${(e as Error).message}`); }
  }
  results.push({
    file: m.file, lang: m.lang, intent: m.intent, bytes: Buffer.byteLength(m.content),
    gateOk: gate.ok, gateErrors: gate.errors.map(formatGateError),
    fingerprint: fp, notes,
  });
}

// ─── Smart recs as a PRO user ───────────────────────────────────────────────
const recs = recommendLayers({ coveredPrimitives: [], selectedLayerIds: [], limit: 8, userTier: 'pro' });
const tierRecs = recs.filter((r) => !isStoreLayer(r.layer.id));
const storeRecs = recs.filter((r) => isStoreLayer(r.layer.id));
const attachableNow = recs.filter((r) => !(r as any).upgradeRequired);
const lockedSuggestions = recs.filter((r) => (r as any).upgradeRequired);
const bundle = summarizeStoreBundle(storeRecs.map((r) => r.layer));

// ─── Layer unlock audit ────────────────────────────────────────────────────
const FREE_RANKS = new Set(TIER_LAYERS.builder.map((l) => l.rank));
const PRO_RANKS = new Set(TIER_LAYERS.pro.map((l) => l.rank));
const ALL_UNLOCKED_FOR_PRO = LAUNCH_LAYERS.filter((l) => FREE_RANKS.has(l.rank) || PRO_RANKS.has(l.rank));
const STILL_LOCKED_FOR_PRO = LAUNCH_LAYERS.filter((l) => !FREE_RANKS.has(l.rank) && !PRO_RANKS.has(l.rank));

// ─── Governance mode gating ────────────────────────────────────────────────
const modeMatrix = GOVERNANCE_MODES.map((m) => ({
  mode: m.id,
  free:  isModeAllowed(m.id, 'builder', false),
  pro:   isModeAllowed(m.id, 'pro', false),
  governor: isModeAllowed(m.id, 'builder', true),
}));

// ─── Dedup sanity (same synthetic discovery set as Free harness) ───────────
const synth = Array.from({ length: 12 }, (_, i) => ({
  name: i % 3 === 0 ? `Self-Healing v${i}` : i % 3 === 1 ? `Auto Recovery ${i}` : `Telemetry ${i}`,
  cjpiScore: 50 + (i * 7) % 50, tier: 'platinum', description: '',
  chain: ['CANDIDATE', 'IMMUNITY'], chainDepth: 2,
}));
const dedup = deduplicateCapabilities(synth);

// ─── Aggregate ─────────────────────────────────────────────────────────────
const total = results.length;
const gatePassed = results.filter((r) => r.gateOk).length;
const byLang: Record<string, { files: number; ok: number; zeroFn: number }> = {};
for (const r of results) {
  byLang[r.lang] ??= { files: 0, ok: 0, zeroFn: 0 };
  byLang[r.lang].files++;
  if (r.gateOk) byLang[r.lang].ok++;
  if (r.fingerprint?.functionCount === 0) byLang[r.lang].zeroFn++;
}

const out = {
  tier: 'pro',
  summary: { total, gatePassed, gateFailed: total - gatePassed },
  byLanguage: byLang,
  smartRecsProUser: {
    totalRecs: recs.length, tierIncluded: tierRecs.length, store: storeRecs.length,
    attachableNow: attachableNow.length, lockedSuggestions: lockedSuggestions.length,
    bundleEligible: storeRecs.length >= 3 && bundle.discountPercent > 0,
    bundleDiscountPct: bundle.discountPercent, bundleSavingsCents: bundle.savingsCents,
    items: recs.map((r: any) => `${r.layer.name} [${isStoreLayer(r.layer.id) ? 'STORE $' + (r.layer.priceCents/100).toFixed(2) : (r.upgradeRequired ? 'LOCKED→' + r.upgradeRequired : 'ATTACH-NOW')}] ← ${r.driverPrimitive}`),
  },
  proUserTierAudit: {
    totalLaunchLayers: LAUNCH_LAYERS.length,
    unlockedForPro: ALL_UNLOCKED_FOR_PRO.length,
    stillLocked: STILL_LOCKED_FOR_PRO.length,
    sampleProLayers: ALL_UNLOCKED_FOR_PRO
      .filter((l) => !FREE_RANKS.has(l.rank))
      .slice(0, 6)
      .map((l) => `#${l.rank} ${l.name} (${l.pillar})`),
    tierPricing: Object.values(TIER_META).map((t) => `${t.glyph} ${t.name}: ${t.priceLabel} — ${t.tagline}`),
  },
  governanceModeGating: modeMatrix,
  dedupSanity: {
    raw: dedup.rawCount, groups: dedup.groupCount, final: dedup.capabilities.length,
    inRange: dedup.capabilities.length >= 4 && dedup.capabilities.length <= 7,
  },
  files: results,
};

const OUT = '/mnt/documents/ascension-v2-pro-tier-stress.json';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

// ─── Console report ────────────────────────────────────────────────────────
console.log('═══ V2 PRO-Tier Stress ═══');
console.log('SUMMARY:', JSON.stringify(out.summary));
console.log('\nPER-LANGUAGE:');
for (const [k, v] of Object.entries(byLang)) console.log(`  ${k.padEnd(12)} ok=${v.ok}/${v.files} zeroFn=${v.zeroFn}`);
console.log('\nPRO TIER AUDIT:');
console.log(`  Pro unlocks: ${ALL_UNLOCKED_FOR_PRO.length}/${LAUNCH_LAYERS.length} launch layers (Free 3 + Pro 17)`);
console.log(`  Still locked: ${STILL_LOCKED_FOR_PRO.length} (should be 0)`);
console.log('  Sample Pro-only marquee layers:');
out.proUserTierAudit.sampleProLayers.forEach((s) => console.log(`    ✓ ${s}`));
console.log('  Tier ladder:');
Object.values(TIER_META).forEach((t) => console.log(`    ${t.glyph} ${t.name.padEnd(12)} ${(t.priceLabel || '').padEnd(8)} ${t.tagline}`));
console.log('\nSMART RECS (Pro user, pre-run):');
console.log(`  Total=${recs.length} AttachNow=${attachableNow.length} Locked=${lockedSuggestions.length} Store=${storeRecs.length} BundleCTA=${out.smartRecsProUser.bundleEligible}`);
out.smartRecsProUser.items.forEach((s) => console.log(`    • ${s}`));
console.log('\nGOVERNANCE MODE GATING:');
modeMatrix.forEach((m) => console.log(`  ${m.mode.padEnd(8)} free=${m.free}  pro=${m.pro}  governor=${m.governor}`));
console.log('\nDEDUP:', JSON.stringify(out.dedupSanity));
console.log('\nFILE ISSUES:');
const issues = results.filter((r) => !r.gateOk || r.notes.length > 0);
if (!issues.length) console.log('  (none)');
for (const r of issues) {
  console.log(`  ${r.file.padEnd(28)} [${r.lang}] ${r.intent}`);
  r.gateErrors.forEach((e: string) => console.log(`     ✗ ${e}`));
  r.notes.forEach((n: string) => console.log(`     ⚠ ${n}`));
}
console.log(`\n→ ${OUT}`);
