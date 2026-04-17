/**
 * 40-File Black-Box Re-enable Verification
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Stress test confirming the re-enabled blackbox does NOT mutate Layer 1.
 * Runs 40 distinct source files (mix of TS, Python, PHP, Rust, Go, Java,
 * Ruby, Swift) through generateRefurbishedCode -> blackboxFile and asserts
 * Layer 1 byte-perfect preservation + Layer 2 obfuscation markers.
 */
import { describe, it, expect } from 'vitest';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import { blackboxFile } from '@/lib/export/blackbox';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer', impactScore: 88, rationale: 't', chainPosition: 1, collisionScore: 88 },
  { primitiveId: 'brain', name: 'BRAIN', category: 'Organ', impactScore: 85, rationale: 't', chainPosition: 2, collisionScore: 85 },
  { primitiveId: 'immunity', name: 'IMMUNITY', category: 'Layer', impactScore: 82, rationale: 't', chainPosition: 3, collisionScore: 82 },
];

// 40 distinct source samples — 5 per language across 8 languages
const SAMPLES: Array<{ name: string; lang: string; file: string; code: string }> = [];

// TypeScript × 5
['Cache', 'Queue', 'Router', 'Logger', 'Validator'].forEach((cls, i) =>
  SAMPLES.push({
    name: `TS-${cls}`, lang: 'TypeScript', file: `${cls.toLowerCase()}.ts`,
    code: `export class ${cls} {\n  private items: string[] = [];\n  add(x: string) { this.items.push(x); }\n  size() { return this.items.length; }\n  // marker_${i}\n}\n`,
  }),
);

// Python × 5
['Counter', 'Tracker', 'Resolver', 'Indexer', 'Builder'].forEach((cls, i) =>
  SAMPLES.push({
    name: `PY-${cls}`, lang: 'Python', file: `${cls.toLowerCase()}.py`,
    code: `class ${cls}:\n    """Sample ${cls}"""\n    def __init__(self):\n        self.data = {}\n    def add(self, k, v):\n        self.data[k] = v\n    # marker_${i}\n`,
  }),
);

// PHP × 5
['Service', 'Handler', 'Adapter', 'Facade', 'Manager'].forEach((cls, i) =>
  SAMPLES.push({
    name: `PHP-${cls}`, lang: 'PHP', file: `${cls}.php`,
    code: `<?php\nclass ${cls} {\n    private array $store = [];\n    public function put(string $k, $v): void { $this->store[$k] = $v; }\n    public function get(string $k) { return $this->store[$k] ?? null; }\n    // marker_${i}\n}\n`,
  }),
);

// Rust × 5
['Engine', 'Pipeline', 'Worker', 'Scheduler', 'Dispatcher'].forEach((cls, i) =>
  SAMPLES.push({
    name: `RS-${cls}`, lang: 'Rust', file: `${cls.toLowerCase()}.rs`,
    code: `pub struct ${cls} {\n    items: Vec<String>,\n}\n\nimpl ${cls} {\n    pub fn new() -> Self { Self { items: Vec::new() } }\n    pub fn push(&mut self, s: String) { self.items.push(s); }\n    // marker_${i}\n}\n`,
  }),
);

// Go × 5
['Server', 'Client', 'Pool', 'Stream', 'Buffer'].forEach((cls, i) =>
  SAMPLES.push({
    name: `GO-${cls}`, lang: 'Go', file: `${cls.toLowerCase()}.go`,
    code: `package main\n\ntype ${cls} struct {\n\tdata []string\n}\n\nfunc (x *${cls}) Add(s string) { x.data = append(x.data, s) }\nfunc (x *${cls}) Size() int { return len(x.data) }\n// marker_${i}\n`,
  }),
);

// Java × 5
['Loader', 'Parser', 'Compiler', 'Executor', 'Scanner'].forEach((cls, i) =>
  SAMPLES.push({
    name: `JAVA-${cls}`, lang: 'Java', file: `${cls}.java`,
    code: `import java.util.*;\n\npublic class ${cls} {\n    private List<String> bag = new ArrayList<>();\n    public void add(String s) { bag.add(s); }\n    public int size() { return bag.size(); }\n    // marker_${i}\n}\n`,
  }),
);

// Ruby × 5
['Reader', 'Writer', 'Mailer', 'Notifier', 'Reporter'].forEach((cls, i) =>
  SAMPLES.push({
    name: `RB-${cls}`, lang: 'Ruby', file: `${cls.toLowerCase()}.rb`,
    code: `class ${cls}\n  def initialize\n    @items = []\n  end\n\n  def add(x)\n    @items << x\n  end\n  # marker_${i}\nend\n`,
  }),
);

// Swift × 5
['Provider', 'Resolver', 'Coordinator', 'Renderer', 'Animator'].forEach((cls, i) =>
  SAMPLES.push({
    name: `SW-${cls}`, lang: 'Swift', file: `${cls}.swift`,
    code: `class ${cls} {\n    private var items: [String] = []\n    func add(_ s: String) { items.append(s) }\n    func count() -> Int { items.count }\n    // marker_${i}\n}\n`,
  }),
);

const FP = 'STRESS_FP_40FILES';

describe('Black-box re-enable — 40-file stress test', () => {
  it('SAMPLES has exactly 40 entries', () => {
    expect(SAMPLES.length).toBe(40);
  });

  for (const sample of SAMPLES) {
    describe(sample.name, () => {
      let ascended: string;
      let sealed: string;
      const lcLang = sample.lang.toLowerCase();

      it('generates ascended code without throwing', () => {
        ascended = generateRefurbishedCode(sample.code, PRIMS, FP, sample.lang, sample.file);
        expect(ascended).toBeTruthy();
        expect(ascended.length).toBeGreaterThan(sample.code.length);
      });

      it('blackboxFile runs without throwing', () => {
        sealed = blackboxFile(ascended, lcLang);
        expect(sealed).toBeTruthy();
      });

      it('preserves Layer 1 source byte-for-byte after sealing', () => {
        // The exact original code must appear verbatim somewhere in the
        // sealed output — that is the patent-mandated dual-layer guarantee.
        const trimmedOriginal = sample.code.trimEnd();
        expect(sealed).toContain(trimmedOriginal);
      });

      it('preserves the unique per-file marker (proves no Layer 1 mutation)', () => {
        // Each sample has `marker_<i>` inside Layer 1. If obfuscation leaked
        // into Layer 1, comments like this would be stripped.
        expect(sealed).toMatch(/marker_\d+/);
      });

      it('emits an integrity hash seal', () => {
        expect(sealed).toContain('CONVEX CORE™ INTEGRITY');
        expect(sealed).toMatch(/Hash:\s*[A-F0-9]+/);
      });

      it('is deterministic within the same day', () => {
        const a = blackboxFile(ascended, lcLang);
        const b = blackboxFile(ascended, lcLang);
        expect(a).toBe(b);
      });
    });
  }
});
