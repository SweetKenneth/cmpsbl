import { runPreAscensionGate, formatGateError } from '../../src/lib/ascension-v2/pre-ascension-gate';
const tests = [
  { f: 'js-class.js', l: 'javascript', c: "class User { constructor(name){ this.name = name; } greet(){ return 'hi '+this.name; } static of(n){ return new User(n); } }\nfunction add(a,b){ return a+b; }\nconst sub = (a,b) => a-b;\nmodule.exports = { User, add, sub };\n" },
  { f: 'rb-app.rb', l: 'ruby', c: "class App\n  def greet(n); \"hi #{n}\"; end\n  def add(a,b); a+b; end\nend\ndef top_level(x); x*2; end\n" },
  { f: 'ts-zod.ts', l: 'typescript', c: "type Result<T> = { ok: true; value: T } | { ok: false; error: string };\nexport function parsePositive(x: unknown): Result<number> {\n  const n = Number(x);\n  if (!Number.isFinite(n) || n <= 0) return { ok: false, error: 'not positive' };\n  return { ok: true, value: n };\n}\n" },
];
for (const t of tests) {
  const g = runPreAscensionGate([{ name: t.f, content: t.c }], t.l);
  console.log(t.f, '→', g.ok ? 'PASS' : 'FAIL: ' + g.errors.map(formatGateError).join(' | '));
}
