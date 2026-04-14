# @cmpsbl/discovery
> **CMPSBL®** — Governed Cognitive Infrastructure · [cmpsbl.com](https://cmpsbl.com)
> Protected under U.S. Patent App. No. 64/029,678 & 64/031,637 · PromptFluid™


> CMPSBL® Pipeline Discovery Engine — CJPI scoring, crystallization, and foundry pipeline management.

[![npm](https://img.shields.io/npm/v/@cmpsbl/discovery)](https://www.npmjs.com/package/@cmpsbl/discovery)

## Install

```bash
npm install @cmpsbl/discovery
```

**Zero dependencies.** CJPI scoring is inlined. Builds standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Usage

```typescript
import { crystallize } from '@cmpsbl/discovery';

const result = crystallize({
  modules: ['BRAIN', 'MEMORY', 'CORTEX'],
  category: 'cognitive',
  description: 'Multi-stage reasoning pipeline',
  scores: { novelty: 85, utility: 90, complexity: 75, composability: 80 },
});

console.log(result.pipeline.tier); // 'Mythic'
```

## License

Apache-2.0 — © CMPSBL®

---

<p align="center">
  <strong>CMPSBL®</strong> · Governed Cognitive Infrastructure<br>
  U.S. Patent App. No. 64/029,678 (Ascension™) · 64/031,637 (Mana™)<br>
  <a href="https://cmpsbl.com">cmpsbl.com</a> · <code>npm i @cmpsbl/cli</code><br>
  © 2025–2026 CMPSBL® · PromptFluid™
</p>
