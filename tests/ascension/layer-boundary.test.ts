/**
 * CMPSBL® Layer Boundary Edge Tests
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Validates that Layer 1 (original source) remains byte-identical
 * after Ascension, and that Layer 2 is structurally sound.
 *
 * Covers: set() class, reset(), setState, Python builtins,
 * multi-language edge cases, and L2 validator accuracy.
 */

import { describe, it, expect } from 'vitest';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import { validateLayer2 } from '@/lib/export/layer2-validator';
import { FUNCTIONAL_TRANSFORMS } from '@/lib/export/opacity-engine';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

// ── Test Helpers ──

const FINGERPRINT = 'test_fp_edge_0001';

const PRIMITIVES: PrimitiveRecommendation[] = [
  { primitiveId: 'defense', name: 'DEFENSE', confidence: 0.95, reason: 'test', capabilities: [] },
  { primitiveId: 'governance', name: 'GOVERNANCE', confidence: 0.90, reason: 'test', capabilities: [] },
  { primitiveId: 'beacon', name: 'BEACON', confidence: 0.85, reason: 'test', capabilities: [] },
];

/** Extract the Layer 1 section from the assembled output */
function extractLayer1(output: string): string {
  const lines = output.split('\n');
  
  // Find the L1 marker line
  let markerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ORIGINAL SOURCE (UNMODIFIED — LAYER 1)')) {
      markerIdx = i;
      break;
    }
  }
  if (markerIdx === -1) return '';

  // Skip comment/blank lines after the marker
  let startIdx = markerIdx + 1;
  while (startIdx < lines.length) {
    const t = lines[startIdx].trim();
    if (t === '' || /^(\/\/|#|--|\/\*|\*|""")/.test(t)) {
      startIdx++;
      continue;
    }
    break;
  }

  // Collect until verify/footer
  const l1Lines: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('SELF-VERIFICATION') || line.includes('__cmpsbl_verify__') || line.includes('End of CMPSBL®')) break;
    if (/^(\/\/|#|--)\s*═══/.test(line.trim())) break;
    l1Lines.push(line);
  }
  while (l1Lines.length && l1Lines[l1Lines.length - 1].trim() === '') l1Lines.pop();
  return l1Lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Layer 1 Preservation (the set() class and friends)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Layer 1 Preservation — Python edge cases', () => {
  const pythonCases: Array<{ name: string; code: string }> = [
    {
      name: 'set() builtin',
      code: `my_set = set([1, 2, 3])\nresult = frozenset(my_set)\nprint(result)`,
    },
    {
      name: 'reset() method',
      code: `class Timer:\n    def reset(self):\n        self.elapsed = 0\n\nt = Timer()\nt.reset()`,
    },
    {
      name: '.set() on dict-like objects',
      code: `cache = {}\ncache.set = lambda k, v: cache.__setitem__(k, v)\ncache.set("key", "value")`,
    },
    {
      name: 'setState analogue',
      code: `class Component:\n    def setState(self, new_state):\n        self._state = new_state\n\nc = Component()\nc.setState({"count": 1})`,
    },
    {
      name: 'offset/asset/sunset — words containing "set"',
      code: `offset = 42\nasset_value = 100\nsunset_time = "19:30"\nprint(offset, asset_value, sunset_time)`,
    },
    {
      name: 'set comprehension',
      code: `squares = {x**2 for x in range(10)}\nprint(squares)`,
    },
    {
      name: 'string containing "set"',
      code: `message = "Please reset your password"\nprint(message)`,
    },
    {
      name: 'multiline class with set/get/delete',
      code: `class KeyValueStore:
    def __init__(self):
        self._data = {}

    def set(self, key, value):
        self._data[key] = value

    def get(self, key, default=None):
        return self._data.get(key, default)

    def delete(self, key):
        self._data.pop(key, None)

    def reset(self):
        self._data = {}

store = KeyValueStore()
store.set("name", "test")
store.reset()`,
    },
    {
      name: 'threading Event.set()',
      code: `import threading\nevent = threading.Event()\nevent.set()\nevent.clear()\nevent.is_set()`,
    },
  ];

  for (const tc of pythonCases) {
    it(`preserves "${tc.name}" verbatim`, () => {
      const output = generateRefurbishedCode(tc.code, PRIMITIVES, FINGERPRINT, 'Python', 'test.py');
      const extracted = extractLayer1(output);
      expect(extracted).toBe(tc.code.trimEnd());
    });
  }
});

describe('Layer 1 Preservation — JavaScript/TypeScript edge cases', () => {
  const jsCases: Array<{ name: string; code: string; lang: string; file: string }> = [
    {
      name: 'React setState',
      code: `const [count, setCount] = useState(0);\nsetCount(prev => prev + 1);`,
      lang: 'TypeScript', file: 'test.tsx',
    },
    {
      name: 'Map.set()',
      code: `const map = new Map();\nmap.set("key", "value");\nmap.get("key");`,
      lang: 'JavaScript', file: 'test.js',
    },
    {
      name: 'Set constructor',
      code: `const s = new Set([1, 2, 3]);\ns.add(4);\ns.has(2);`,
      lang: 'JavaScript', file: 'test.js',
    },
    {
      name: 'WeakSet',
      code: `const ws = new WeakSet();\nconst obj = {};\nws.add(obj);`,
      lang: 'JavaScript', file: 'test.js',
    },
    {
      name: 'FormData.set()',
      code: `const fd = new FormData();\nfd.set("name", "value");\nfd.append("other", "data");`,
      lang: 'TypeScript', file: 'test.ts',
    },
    {
      name: 'Proxy with set trap',
      code: `const handler = {\n  set(target, prop, value) {\n    target[prop] = value;\n    return true;\n  }\n};\nconst proxy = new Proxy({}, handler);`,
      lang: 'JavaScript', file: 'test.js',
    },
    {
      name: 'localStorage.setItem',
      code: `localStorage.setItem("key", "value");\nconst v = localStorage.getItem("key");`,
      lang: 'TypeScript', file: 'test.ts',
    },
  ];

  for (const tc of jsCases) {
    it(`preserves "${tc.name}" verbatim`, () => {
      const output = generateRefurbishedCode(tc.code, PRIMITIVES, FINGERPRINT, tc.lang, tc.file);
      const extracted = extractLayer1(output);
      expect(extracted).toBe(tc.code.trimEnd());
    });
  }
});

describe('Layer 1 Preservation — Other languages', () => {
  const cases: Array<{ name: string; code: string; lang: string; file: string }> = [
    {
      name: 'Rust HashSet',
      code: `use std::collections::HashSet;\nlet mut s = HashSet::new();\ns.insert(42);\ns.contains(&42);`,
      lang: 'Rust', file: 'test.rs',
    },
    {
      name: 'Go map assignment',
      code: `package main\nfunc main() {\n\tm := make(map[string]int)\n\tm["key"] = 42\n\tdelete(m, "key")\n}`,
      lang: 'Go', file: 'test.go',
    },
    {
      name: 'Ruby Set',
      code: `require 'set'\ns = Set.new([1, 2, 3])\ns.add(4)\ns.reset`,
      lang: 'Ruby', file: 'test.rb',
    },
  ];

  for (const tc of cases) {
    it(`preserves "${tc.name}" verbatim`, () => {
      const output = generateRefurbishedCode(tc.code, PRIMITIVES, FINGERPRINT, tc.lang, tc.file);
      const extracted = extractLayer1(output);
      expect(extracted).toBe(tc.code.trimEnd());
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — FUNCTIONAL_TRANSFORMS Identity Guarantee
// ═══════════════════════════════════════════════════════════════════════════════

describe('FUNCTIONAL_TRANSFORMS — Identity invariant', () => {
  const dangerousInputs = [
    `my_set = set([1, 2, 3])`,
    `obj.reset()`,
    `setState({ count: 0 })`,
    `document.cookie = "session=abc"`,
    `eval("dangerous()")`,
    `process.env.SECRET_KEY`,
    `import os; os.system("rm -rf /")`,
    `const x = new Set(); x.add(1);`,
  ];

  for (const [name, fn] of Object.entries(FUNCTIONAL_TRANSFORMS)) {
    it(`${name} returns input unchanged for all edge cases`, () => {
      for (const input of dangerousInputs) {
        expect(fn(input)).toBe(input);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Layer 2 Validator Accuracy
// ═══════════════════════════════════════════════════════════════════════════════

describe('Layer 2 Validator — Well-formed code', () => {
  it('passes valid JS Layer 2 code', () => {
    const code = `const arr = [1234, 5678];\nconst resolve = (i) => arr[i % arr.length];\nresolve(0);`;
    const result = validateLayer2(code, 'JavaScript');
    expect(result.valid).toBe(true);
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('passes valid Python Layer 2 code', () => {
    const code = `_CMPSBL_DT = [0x1234, 0x5678]\ndef _cmpsbl_resolve(idx):\n    return _CMPSBL_DT[idx % len(_CMPSBL_DT)]`;
    const result = validateLayer2(code, 'Python');
    expect(result.valid).toBe(true);
  });
});

describe('Layer 2 Validator — Catches real errors', () => {
  it('detects unbalanced braces (as warnings)', () => {
    const code = `function broken() {\n  const x = 1;\n`;
    const result = validateLayer2(code, 'JavaScript');
    // Delimiter checks are advisory (warnings), not hard errors
    expect(result.errors.some(e => e.message.includes('Unclosed'))).toBe(true);
    expect(result.errors.filter(e => e.message.includes('Unclosed')).every(e => e.severity === 'warning')).toBe(true);
  });

  it('detects mismatched delimiters (as warnings)', () => {
    const code = `const arr = [1, 2, 3);`;
    const result = validateLayer2(code, 'JavaScript');
    expect(result.errors.some(e => e.message.includes('Mismatched'))).toBe(true);
    expect(result.errors.filter(e => e.message.includes('Mismatched')).every(e => e.severity === 'warning')).toBe(true);
  });

  it('detects non-numeric dispatch table entries', () => {
    const code = `const _DT = [1234, "bad", 5678];`;
    const result = validateLayer2(code, 'JavaScript');
    expect(result.errors.some(e => e.message.includes('Non-numeric'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Full Pipeline Integration: L2 is validated, L1 is untouched
// ═══════════════════════════════════════════════════════════════════════════════

describe('Full pipeline integration', () => {
  it('produces output with both Layer 1 and Layer 2 markers', () => {
    const code = `def hello():\n    print("world")\n\nhello()`;
    const output = generateRefurbishedCode(code, PRIMITIVES, FINGERPRINT, 'Python', 'test.py');

    expect(output).toContain('ORIGINAL SOURCE (UNMODIFIED — LAYER 1)');
    expect(output).toContain('Convex Core™ Dispatch Matrix');
    expect(output).toContain(FINGERPRINT);
  });

  it('Layer 2 validation runs without blocking export', () => {
    const code = `console.log("test");`;
    // Should not throw even if L2 has warnings
    const output = generateRefurbishedCode(code, PRIMITIVES, FINGERPRINT, 'JavaScript', 'test.js');
    expect(output.length).toBeGreaterThan(code.length);
  });

  it('SHA-256 proof concept: L1 unchanged across multiple runs', () => {
    const code = `import hashlib\nh = hashlib.sha256(b"test").hexdigest()\nprint(h)`;
    const run1 = extractLayer1(generateRefurbishedCode(code, PRIMITIVES, FINGERPRINT, 'Python', 'test.py'));
    const run2 = extractLayer1(generateRefurbishedCode(code, PRIMITIVES, FINGERPRINT, 'Python', 'test.py'));
    expect(run1).toBe(run2);
    expect(run1).toBe(code.trimEnd());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Stress: Large code with many "dangerous" patterns
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stress — Dense pattern code', () => {
  it('preserves Python code dense with set/reset/get/delete patterns', () => {
    const code = Array.from({ length: 50 }, (_, i) => {
      return [
        `class Handler${i}:`,
        `    def set(self, k, v): self._d[k] = v`,
        `    def get(self, k): return self._d.get(k)`,
        `    def reset(self): self._d = {}`,
        `    def offset(self): return len(self._d)`,
        `s${i} = set([${i}, ${i + 1}])`,
      ].join('\n');
    }).join('\n\n');

    const output = generateRefurbishedCode(code, PRIMITIVES, FINGERPRINT, 'Python', 'stress.py');
    const extracted = extractLayer1(output);
    expect(extracted).toBe(code.trimEnd());
  });
});
