# @cmpsbl/sdk

CMPSBL® Engine SDK — Authenticated client for all 54 hosted engines + Memory Stream first-contact.

```bash
npm install @cmpsbl/sdk
```

## First Contact — Memory Stream

```typescript
import { CMPSBL } from '@cmpsbl/sdk';

const cmpsbl = new CMPSBL({ apiKey: 'your-api-key' });

// Discovery starts automatically
const discovery = await cmpsbl.discover({
  input: 'track user behavior across sessions'
});

if (discovery.detected) {
  console.log(discovery.memory);
  // { id: '...', pattern: 'API usage optimization', adoption: 'Cross-engine adoption', status: 'new' }

  // Capture to Memory Stream
  await cmpsbl.capture(discovery.memory.id);

  // Apply to system
  await cmpsbl.apply(discovery.memory.id);

  // Export for distribution
  const exported = await cmpsbl.export(discovery.memory.id);
}

// View live stream
console.log(cmpsbl.stream);
```

## Engine API

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
