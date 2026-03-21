# @cmpsbl/sdk

CMPSBL® Engine SDK — Authenticated client for all 54 hosted engines.

```bash
npm install @cmpsbl/sdk
```

```typescript
import { Engine } from '@cmpsbl/sdk';

const engine = new Engine('your-api-key');

// Universal call
const result = await engine.call('godmind', 'reason', 'Analyze market trends for Q3');

// Typed proxy
const analysis = await engine.godmind.analyze('Security audit of this codebase');

// Browse catalog
console.log(Engine.catalog);
```

## License

Apache-2.0 © Kenneth E Sweet Jr
