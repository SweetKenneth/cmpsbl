# @cmpsbl/react

> CMPSBL® React Hooks — `useIntent`, `useMesh`, `useRuntime`, `useFirstContact` for React apps.

[![npm](https://img.shields.io/npm/v/@cmpsbl/react)](https://www.npmjs.com/package/@cmpsbl/react)

## Install

> ⚠️ **Install peer dependencies first:**

```bash
# Step 1: Install peer deps (Tier 1 packages)
npm install react @cmpsbl/intent @cmpsbl/mesh @cmpsbl/runtime

# Step 2: Install react hooks
npm install @cmpsbl/react
```

## Dependency Tier

```
Tier 1 (install first)          Tier 2 (install after Tier 1)
├── @cmpsbl/intent       ──→
├── @cmpsbl/mesh         ──→    @cmpsbl/react  ← YOU ARE HERE
├── @cmpsbl/runtime      ──→
└── react                ──→
```

## Hooks

| Hook | Description |
|------|-------------|
| `useIntent()` | Broadcast intents and track resolutions |
| `useResolver()` | Register a resolver from a component |
| `useMesh()` | Subscribe to mesh telemetry events |
| `useRuntime()` | Access the full Mini-Runtime |
| `useCJPI()` | Compute CJPI scores reactively |
| `useFirstContact()` | Memory Stream discovery hooks |

## Usage

```tsx
import { useIntent, useMesh } from '@cmpsbl/react';

function App() {
  const { broadcast, isProcessing } = useIntent();
  const { events } = useMesh({ source: 'BRAIN' });

  return <button onClick={() => broadcast({
    intentType: 'analysis', sourceModule: 'BRAIN', input: {}
  })}>Analyze</button>;
}
```

## License

Apache-2.0 — © CMPSBL®
