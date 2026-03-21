# @cmpsbl/bridge

CMPSBL® Bridge Adapter Framework — Wire any language runtime to the substrate.

```bash
npm install @cmpsbl/bridge
```

```typescript
import { createBridge } from '@cmpsbl/bridge';

const python = createBridge({ language: 'python', endpoint: 'http://localhost:8080' });
const result = await python.executePrimitive('BRAIN', { query: 'analyze' }, 0.9);
```

## License

Apache-2.0 © Kenneth E Sweet Jr
