# @cmpsbl — Package Ecosystem

> 13 packages. Self-contained builds. One substrate.

## Dependency Graph & Install Order

All Tier 1 packages are **zero-dependency** and can be installed/published in any order.
Tier 2 packages require their Tier 1 peer dependencies to be installed first.

```
┌─────────────────────────────────────────────────────┐
│                   TIER 1 — Standalone                │
│              (no @cmpsbl deps, any order)             │
│                                                       │
│  @cmpsbl/types      Core type definitions             │
│  @cmpsbl/runtime    CJPI, manifests, pipelines        │
│  @cmpsbl/intent     Intent router + resolver dispatch │
│  @cmpsbl/mesh       Mesh telemetry events             │
│  @cmpsbl/bridge     Polyglot bridge adapters          │
│  @cmpsbl/discovery  Pipeline crystallization          │
│  @cmpsbl/failsafe   Disaster recovery & migration     │
│  @cmpsbl/sdk        Engine SDK (self-contained)       │
│  @cmpsbl/shield     LLM prompt defense + governance   │
│  @cmpsbl/mana       Silent software symbiosis engine  │
└──────────────┬──────────────────────┬────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌─────────────────────────┐
│     TIER 2           │  │       TIER 2             │
│                      │  │                          │
│  @cmpsbl/cli         │  │  @cmpsbl/test-harness    │
│  needs: runtime      │  │  needs: runtime, bridge  │
│                      │  │                          │
│  @cmpsbl/react       │  └─────────────────────────┘
│  needs: intent,      │
│    mesh, runtime,    │
│    react             │
└──────────────────────┘
```

## Publish Order (for maintainers)

```bash
# Tier 1 — publish in any order (all standalone)
for pkg in types runtime sdk intent mesh bridge discovery failsafe shield mana; do
  cd packages/$pkg && npm run build && npm publish --access public && cd ../..
done

# Tier 2 — publish after Tier 1 is on npm
for pkg in cli test-harness react; do
  cd packages/$pkg && npm run build && npm publish --access public && cd ../..
done
```

## Quick Install (for consumers)

### Just the SDK
```bash
npm install @cmpsbl/sdk
```

### Full substrate toolkit
```bash
npm install @cmpsbl/types @cmpsbl/runtime @cmpsbl/intent @cmpsbl/mesh @cmpsbl/bridge @cmpsbl/discovery @cmpsbl/sdk @cmpsbl/shield @cmpsbl/mana
```

### React app
```bash
npm install @cmpsbl/intent @cmpsbl/mesh @cmpsbl/runtime @cmpsbl/react
```

### CLI
```bash
npm install @cmpsbl/runtime
npm install -g @cmpsbl/cli
```

### Mana (Layer 2 attachment)
```bash
npm install -g @cmpsbl/mana
```

## Package Versions

| Package | Version | Tier | Dependencies |
|---------|---------|------|-------------|
| `@cmpsbl/types` | 3.1.0 | 1 | None |
| `@cmpsbl/runtime` | 4.1.0 | 1 | None |
| `@cmpsbl/sdk` | 4.1.0 | 1 | None |
| `@cmpsbl/intent` | 3.1.0 | 1 | None |
| `@cmpsbl/mesh` | 3.1.0 | 1 | None |
| `@cmpsbl/bridge` | 3.1.0 | 1 | None |
| `@cmpsbl/discovery` | 3.1.0 | 1 | None |
| `@cmpsbl/failsafe` | 5.1.0 | 1 | None |
| `@cmpsbl/shield` | 3.1.0 | 1 | None |
| `@cmpsbl/mana` | 3.1.0 | 1 | None |
| `@cmpsbl/cli` | 4.1.0 | 2 | runtime (bundled) |
| `@cmpsbl/test-harness` | 3.1.0 | 2 | runtime, bridge |
| `@cmpsbl/react` | 3.1.0 | 2 | intent, mesh, runtime, react |

## License

Apache-2.0 — © CMPSBL®