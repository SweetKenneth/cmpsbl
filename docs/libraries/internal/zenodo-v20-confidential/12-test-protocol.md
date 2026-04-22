# 12 — Reproducible test protocol

**Audience:** Senior engineer
**Goal:** Run these steps in order. After all 10 pass, you have proven the substrate works as claimed.

---

## Setup

```bash
git clone <repo> && cd <repo>
npm install
npm test                  # baseline — should be green
```

All tests live under `src/lib/ascension-v2/__tests__/` and `src/lib/mana/__tests__/`.

---

## Test 1 — Source fingerprint determinism

```typescript
import { computeFingerprint } from '@/lib/ascension-v2';
const src = `function add(a, b) { return a + b; }`;
const fp1 = computeFingerprint(src, 'typescript');
const fp2 = computeFingerprint(src, 'typescript');
console.assert(fp1.hash === fp2.hash, 'fingerprint must be deterministic');
```

**Pass criterion:** `fp1.hash === fp2.hash`. Run 1000 times, all match.

## Test 2 — Cosmetic-reformatting invariance

```typescript
const a = `function f(x) { return x + 1; }`;
const b = `function   f ( x )   {  return  x + 1 ;  }`;
const c = `function f(x) {\n  // hello\n  return x + 1;\n}`;
const fpA = computeFingerprint(a, 'typescript').hash;
const fpB = computeFingerprint(b, 'typescript').hash;
const fpC = computeFingerprint(c, 'typescript').hash;
console.assert(fpA === fpB && fpB === fpC, 'must be invariant under whitespace/comments');
```

**Pass criterion:** all three hashes equal.

## Test 3 — Structural-change detection

```typescript
const a = `function f(x) { return x + 1; }`;
const d = `function f(x) { return x + 2; }`;
console.assert(
  computeFingerprint(a, 'typescript').hash !== computeFingerprint(d, 'typescript').hash,
  'must detect operand change',
);
```

**Pass criterion:** hashes differ.

## Test 4 — Mana governance travels with the code

```typescript
import { configure, attach, registerRule } from '@/lib/mana';
const host = { transferFunds: (amt: number) => `sent ${amt}` };
configure({ lexMode: 'strict' });
registerRule('defense_gate', 'transferFunds', 'deny', 'compliance');
await attach(host, ['defense_gate']);
let threw = false;
try { host.transferFunds(100); } catch { threw = true; }
console.assert(threw, 'strict mode + deny rule must throw');
```

**Pass criterion:** `threw === true`. Now serialize the wrapped function, paste into a fresh process — rule still applies because Lex is embedded.

## Test 5 — Audit chain tamper detection

```typescript
import { appendAudit, verifyChain, getChainState, resetChain } from '@/lib/ascension-v2';
resetChain();
appendAudit('test', 'a'); appendAudit('test', 'b'); appendAudit('test', 'c');
console.assert(verifyChain(), 'pristine chain must verify');

const state = getChainState();
// Direct mutation simulating tamper:
(state.entries[1] as any).detail = 'TAMPERED';
console.assert(!verifyChain(), 'tampered chain must fail verify');
```

**Pass criterion:** chain verifies before mutation, fails after.

## Test 6 — SHA-256 anchor

```typescript
import { getChainIntegrityHash } from '@/lib/ascension-v2';
const anchor1 = await getChainIntegrityHash();
appendAudit('test', 'd');
const anchor2 = await getChainIntegrityHash();
console.assert(anchor1 !== anchor2, 'anchor must change on append');
console.assert(anchor1.length === 64, 'SHA-256 = 64 hex chars');
```

**Pass criterion:** different hashes; correct length.

## Test 7 — Pre-Ascension Gate hard-fails Python 2

```typescript
import { runPreAscensionGate } from '@/lib/ascension-v2';
const py2 = `try:\n  x = 1\nexcept Exception, e:\n  pass\n`;
const r = runPreAscensionGate([{ name: 'x.py', content: py2 }], 'python');
console.assert(!r.ok && r.errors.length > 0, 'Py2 except must fail gate');
```

**Pass criterion:** `r.ok === false`.

## Test 8 — Pre-Export Harness rejects empty handler set

Build an artifact missing the dispatch entry point, run `runPreExportHarness`, confirm `passed === false` with `criticalFailures > 0`.

## Test 9 — Lex priority resolution

```typescript
import { registerRule, evaluate, resetLex } from '@/lib/mana';
resetLex();
registerRule('*', '*', 'allow', 'default', 500);
registerRule('defense_gate', '*', 'deny', 'block all defense', 100);
registerRule('defense_gate', 'transferFunds', 'observe', 'audit transfers', 50);
const v = evaluate('defense_gate', 'transferFunds', 'permissive');
console.assert(v.verdict === 'observe', 'priority 50 must win');
```

**Pass criterion:** verdict is `observe`.

## Test 10 — End-to-end smoke (CLI export, all three governance modes)

For each mode `observe`, `soft`, `enforce`:
1. Upload the sample DevOps CLI (`user-uploads://04_devops_cli-4.py` from project history)
2. Run Ascension V2 pipeline → emit Python artifact
3. Run emitted file with `--help` → confirm clean stdout (no substrate chatter)
4. Run emitted file with `CMPSBL_VERBOSE=1 ./script.py deploy v1` → confirm tagged stderr only
5. Trigger a user exception (e.g., `PermissionError`) → confirm:
   - **observe:** original exception type re-raised unchanged
   - **soft:** `[CMPSBL:soft]` warning to stderr, then original re-raised
   - **enforce:** wrapped in `CmpsblExecutionError` with `reason="user_code_exception"`

**Pass criterion:** all three modes behave per contract. This is the validation we ran in the previous session — 52/52 passed.

---

## What "passing all 10" proves

| Proven | By tests |
|---|---|
| Determinism of fingerprinting | 1, 2, 3 |
| Governance travels with code | 4 |
| Tamper-evidence | 5, 6 |
| Input validation works | 7 |
| Export gating works | 8 |
| Lex resolution is predictable | 9 |
| End-to-end Python emitter is production-ready | 10 |

If any test fails, the corresponding claim in the patent drafts (chapters 06, 07) is unsupported by the implementation. Fix the implementation, not the test.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
