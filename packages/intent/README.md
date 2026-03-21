# @cmpsbl/intent

CMPSBL® Intent Router — Bring substrate-style intent dispatch to any app.

```bash
npm install @cmpsbl/intent
```

```typescript
import { broadcastIntent, registerResolver } from '@cmpsbl/intent';

registerResolver('analysis', (input) => ({
  resolverId: 'brain.analyze', node: 'BRAIN', success: true,
  output: { result: 'analyzed' }, confidence: 0.95, durationMs: 12,
}));

const resolution = await broadcastIntent({
  sourceModule: 'BRAIN', intentType: 'analysis', input: { query: 'test' },
});
```

## License

Apache-2.0 © Kenneth E Sweet Jr
