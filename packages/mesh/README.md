# @cmpsbl/mesh

CMPSBL® Mesh Telemetry Client — Node-to-node communication events.

```bash
npm install @cmpsbl/mesh
```

```typescript
import { emit, subscribe, createSignal } from '@cmpsbl/mesh';

subscribe((event) => console.log(event), { category: 'discovery' });

emit(createSignal('BRAIN', 'CORTEX', 'analysis_complete', 'completion'));
```

## License

Apache-2.0 © Kenneth E Sweet Jr
