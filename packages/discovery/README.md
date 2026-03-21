# @cmpsbl/discovery

CMPSBL® Pipeline Discovery Engine — Score, crystallize, and manage discovered pipelines.

```bash
npm install @cmpsbl/discovery
```

```typescript
import { crystallize } from '@cmpsbl/discovery';

const result = crystallize({
  modules: ['BRAIN', 'CORTEX', 'ENCODE'],
  category: 'cognitive',
  description: 'AI reasoning pipeline',
  scores: { novelty: 85, utility: 90, complexity: 70, composability: 80 },
});

console.log(result.pipeline.tier); // 'Mythic'
console.log(result.promotable);    // true
```

## License

Apache-2.0 © Kenneth E Sweet Jr
