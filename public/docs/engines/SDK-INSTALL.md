# CMPSBL Engine SDK — Universal Installation Guide

**Version:** 1.0.0  
**License:** Per-engine perpetual license  
**Delivery:** Hosted API + Copy-paste SDK  

---

## Quick Start

### 1. Get Your API Key

Go to [cmpsbl.com/api-access](https://cmpsbl.com/api-access), create a developer account, and generate an API key with the `engines` scope.

### 2. Copy the SDK

Copy `cmpsbl-engine-sdk.ts` into your project:

```
your-project/src/lib/cmpsbl-engine-sdk.ts
```

### 3. Use It

```typescript
import { Engine } from './lib/cmpsbl-engine-sdk';

const engine = new Engine('your-api-key');

// Call any engine:
const result = await engine.call('godmind', 'reason', 'Analyze this market opportunity');

// Or use typed helpers for META engines:
const r = await engine.godmind.reason('Strategic implications of vertical AI');

console.log(r.result);      // Final answer
console.log(r.confidence);   // 0-1 score
console.log(r.pipeline);     // Per-stage breakdown
```

### Available Engines

Run `Engine.catalog` for a full list of engines and their actions.

---

## Special Case: FAILSAFE

FAILSAFE is the only **standalone** engine — it deploys directly to your Supabase project as an edge function. No API key or SDK needed. See `public/docs/engines/failsafe/INSTALL.md`.

---

© 2025–2026 CMPSBL®. All rights reserved.
