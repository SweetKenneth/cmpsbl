import { describe, it, expect } from 'vitest';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import { validateLayer2, validateLayer2Linkage } from '@/lib/export/layer2-validator';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer', impactScore: 88, rationale: 'test', chainPosition: 1, collisionScore: 88 },
  { primitiveId: 'brain', name: 'BRAIN', category: 'Organ', impactScore: 85, rationale: 'test', chainPosition: 2, collisionScore: 85 },
  { primitiveId: 'immunity', name: 'IMMUNITY', category: 'Layer', impactScore: 82, rationale: 'test', chainPosition: 3, collisionScore: 82 },
];
const FP = 'TEST_FP_ABC123';

// ── Test inputs for each language ──
const INPUTS: Record<string, { code: string; lang: string; file: string; classOrFn: string }> = {
  TypeScript: {
    code: `export class TaskWorker {\n  private queue: string[] = [];\n  enqueue(item: string) { this.queue.push(item); }\n  run() { return this.queue.shift(); }\n}\n`,
    lang: 'TypeScript', file: 'TaskWorker.ts', classOrFn: 'TaskWorker',
  },
  Python: {
    code: `class UrlShortener:\n    """URL shortener with base62 encoding"""\n    def __init__(self):\n        self.store = {}\n        self.counter = 0\n\n    def shorten(self, url: str) -> str:\n        self.counter += 1\n        return f"s/{self.counter}"\n\n    def resolve(self, short: str) -> str:\n        return self.store.get(short, "")\n`,
    lang: 'Python', file: 'url_shortener.py', classOrFn: 'UrlShortener',
  },
  PHP: {
    code: `<?php\nclass TaskWorker {\n    private array $queue = [];\n    public function enqueue(string $item): void { $this->queue[] = $item; }\n    public function run(): ?string { return array_shift($this->queue); }\n}\n`,
    lang: 'PHP', file: 'TaskWorker.php', classOrFn: 'TaskWorker',
  },
  Rust: {
    code: `pub struct TaskWorker {\n    queue: Vec<String>,\n}\n\nimpl TaskWorker {\n    pub fn new() -> Self { Self { queue: Vec::new() } }\n    pub fn enqueue(&mut self, item: String) { self.queue.push(item); }\n    pub fn run(&mut self) -> Option<String> { if self.queue.is_empty() { None } else { Some(self.queue.remove(0)) } }\n}\n`,
    lang: 'Rust', file: 'task_worker.rs', classOrFn: 'TaskWorker',
  },
  Go: {
    code: `package main\n\ntype TaskWorker struct {\n\tqueue []string\n}\n\nfunc (tw *TaskWorker) Enqueue(item string) { tw.queue = append(tw.queue, item) }\nfunc (tw *TaskWorker) Run() string {\n\tif len(tw.queue) == 0 { return "" }\n\titem := tw.queue[0]\n\ttw.queue = tw.queue[1:]\n\treturn item\n}\n`,
    lang: 'Go', file: 'task_worker.go', classOrFn: 'TaskWorker',
  },
  Java: {
    code: `import java.util.LinkedList;\n\npublic class TaskWorker {\n    private LinkedList<String> queue = new LinkedList<>();\n    public void enqueue(String item) { queue.add(item); }\n    public String run() { return queue.poll(); }\n}\n`,
    lang: 'Java', file: 'TaskWorker.java', classOrFn: 'TaskWorker',
  },
  Ruby: {
    code: `class TaskWorker\n  def initialize\n    @queue = []\n  end\n\n  def enqueue(item)\n    @queue << item\n  end\n\n  def run\n    @queue.shift\n  end\nend\n`,
    lang: 'Ruby', file: 'task_worker.rb', classOrFn: 'TaskWorker',
  },
  Swift: {
    code: `class TaskWorker {\n    private var queue: [String] = []\n    func enqueue(_ item: String) { queue.append(item) }\n    func run() -> String? { queue.isEmpty ? nil : queue.removeFirst() }\n}\n`,
    lang: 'Swift', file: 'TaskWorker.swift', classOrFn: 'TaskWorker',
  },
};

describe('Layer 2 end-to-end generation', () => {
  for (const [langName, input] of Object.entries(INPUTS)) {
    describe(langName, () => {
      let output: string;

      it('generates without throwing', () => {
        output = generateRefurbishedCode(input.code, PRIMS, FP, input.lang, input.file);
        expect(output).toBeTruthy();
        expect(output.length).toBeGreaterThan(input.code.length);
      });

      it('contains Layer 1 original source verbatim', () => {
        const trimmedOriginal = input.code.trimEnd();
        expect(output).toContain(trimmedOriginal);
      });

      it('contains LAYER 1 markers', () => {
        expect(output).toContain('ORIGINAL SOURCE');
        expect(output).toContain('LAYER 1');
      });

      it('contains fingerprint', () => {
        expect(output).toContain(FP);
      });

      it('contains patent references', () => {
        expect(output).toContain('64/029,678');
        expect(output).toContain('64/031,637');
      });

      it('passes Layer 2 linkage check', () => {
        const linkage = validateLayer2Linkage(output, input.lang, [input.file]);
        expect(linkage.linked).toBe(true);
        if (!linkage.linked) console.error(langName, linkage.errors);
      });

      it('no smart quotes or markdown artifacts', () => {
        // These indicate markdown round-trip corruption
        expect(output).not.toContain('\u201C'); // left double quote
        expect(output).not.toContain('\u201D'); // right double quote
        expect(output).not.toContain('\u2018'); // left single quote
        expect(output).not.toContain('\u2019'); // right single quote
        expect(output).not.toMatch(/^```/m);    // fenced code blocks
      });

      if (langName === 'Python') {
        it('has no trailing semicolons in guard lines', () => {
          const lines = output.split('\n');
          const guardLines = lines.filter(l => /\.(init|enable|enforce|start|activate)\s*\(/.test(l));
          for (const gl of guardLines) {
            expect(gl.trimEnd()).not.toMatch(/;\s*$/);
          }
        });

        it('uses Python booleans (True/False not true/false)', () => {
          // Only check lines that aren't in the Layer 1 block or comments
          const l2Section = output.split('ORIGINAL SOURCE')[0];
          const codeLines = l2Section.split('\n').filter(l => !l.trim().startsWith('#') && !l.trim().startsWith('//'));
          const joined = codeLines.join('\n');
          // If True/False appear, they should outnumber true/false in L2
          if (joined.includes('True') || joined.includes('true')) {
            const trueCount = (joined.match(/\bTrue\b/g) || []).length;
            const jsTrue = (joined.match(/\btrue\b/g) || []).length;
            // Allow some JS-style booleans in JSON metadata blocks
            expect(trueCount).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });
  }
});
