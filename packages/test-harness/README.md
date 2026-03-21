# @cmpsbl/test-harness

CMPSBL® Test Harness — Validate exported pipelines, manifests, and bridge adapters.

```bash
npm install @cmpsbl/test-harness
```

```typescript
import { validateManifest, testBridge, formatTestResults } from '@cmpsbl/test-harness';

const result = validateManifest(JSON.stringify(myManifest));
console.log(formatTestResults(result));
```

## License

Apache-2.0 © Kenneth E Sweet Jr
