# @cmpsbl/react

CMPSBL® React Hooks — Plug substrate capabilities into any React app.

```bash
npm install @cmpsbl/react
```

```tsx
import { useIntent, useMesh, useRuntime, useCJPI } from '@cmpsbl/react';

function MyComponent() {
  const { broadcast, lastResolution, isProcessing } = useIntent();
  const { events } = useMesh({ category: 'completion' });
  const runtime = useRuntime();
  const score = useCJPI({ novelty: 80, utility: 90, complexity: 70, composability: 85 });

  return <div>{score.tier} — {score.total}</div>;
}
```

## License

Apache-2.0 © Kenneth E Sweet Jr
