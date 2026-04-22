# 10 — Lex governance math

**Source:** `src/lib/mana/lex.ts`
**Audience:** Senior engineer

---

## Rule structure

```typescript
interface LexRule {
  id: string;                 // `lex-${base36(Date.now())}-${base36(counter)}`
  capability: ManaCapability | '*';
  target: string;             // function name or '*'
  verdict: 'allow' | 'deny' | 'observe';
  reason: string;
  createdAt: number;          // Date.now() at registration
  priority: number;           // normalized to [0, 1000], lower = higher
}
```

## Priority normalization

`normalizePriority(n)` — clamps to `[0, 1000]`, default `100`. Negative or NaN → 100. >1000 → 1000.

## Evaluation algorithm

```typescript
function evaluate(capability, target, mode, context = 'runtime') {
  const sorted = Array.from(rules.values()).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt - b.createdAt;            // tiebreak: older wins
  });
  for (const rule of sorted) {
    const capMatch = rule.capability === capability || rule.capability === '*';
    const targetMatch = rule.target === target || rule.target === '*';
    if (capMatch && targetMatch) return { verdict: rule.verdict, rule, context };
  }
  return {
    verdict: mode === 'permissive' ? 'allow' : 'deny',
    rule: null, context,
  };
}
```

## Determinism guarantees

**Theorem (Lex determinism).** Given the same registry state and the same `(capability, target, mode, context)` tuple, `evaluate` returns the same `(verdict, rule.id)` pair across independent runs.

**Proof sketch.** The sort key `(priority, createdAt)` is a strict total order on rules with distinct ids (createdAt collisions are tolerated because `id` then provides uniqueness via the monotonic counter). The first matching rule in the sorted sequence is unique. ∎

## Wildcard semantics

- `capability === '*'` matches any of the 92 capabilities
- `target === '*'` matches any function name
- Both wildcards = catch-all (highest-priority catch-all wins under tie rules)

## Mode semantics

- **permissive** (default): no rule matches → `allow`. Used in development and observability deployments.
- **strict**: no rule matches → `deny`. Used in regulated production. Requires explicit allow-listing of every wrapped function.

## Conflict resolution worked example

Registry:

| id | capability | target | verdict | priority | createdAt |
|---|---|---|---|---|---|
| r1 | `*` | `*` | `allow` | 500 | t=100 |
| r2 | `defense_gate` | `*` | `deny` | 100 | t=200 |
| r3 | `defense_gate` | `transferFunds` | `observe` | 50 | t=300 |
| r4 | `*` | `transferFunds` | `deny` | 50 | t=400 |

Evaluation of `(defense_gate, transferFunds)`:
1. Sort by `(priority asc, createdAt asc)`: r3, r4, r2, r1
2. r3 matches (cap match `defense_gate` = `defense_gate`, target match `transferFunds` = `transferFunds`)
3. Verdict: `observe`

**The customer can always reason about the verdict by sorting the rules.** This is the primary design intent. No "most-specific wins," no "deny trumps allow," no policy DSL — just integer priority + creation-order tiebreak.

## Extended Lex (predicate rules)

`src/lib/mana/lex-extended.ts` — additive layer that supports predicate rules `(ctx) => boolean` for runtime conditions (e.g., "deny if hour ∉ [9,17]"). Evaluated AFTER base Lex returns `allow`. If extended denies, the verdict flips to `deny`.

This is opt-in via `evaluateExtended()`. Base `evaluate()` is unchanged for determinism.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
