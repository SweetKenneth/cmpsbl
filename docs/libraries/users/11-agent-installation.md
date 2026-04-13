# Installation Guide

---

## Install

```bash
npx mana attach
```

The CLI detects your file, confirms the second layer, and walks you through activation.

---

## Activation Levels

| Level | What It Does |
|-------|-------------|
| **Safe** | Minimal protection — basic validation + telemetry |
| **Enhanced** | Adds observability + stability — recommended for most users |
| **Protected** | Full defense + governance — blocks unsafe execution paths |
| **Advanced** | Fine-grained control over capability groups |

Pick a level during install. Change it anytime with `@cmpsbl/config`.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CMPSBL_API_KEY` | ✓ | — | Your API key from cmpsbl.com/api-access |
| `CMPSBL_ENDPOINT` | — | Production | Custom endpoint override |

---

## Production Integration

```typescript
import { init } from '@cmpsbl/runtime';
import * as handlers from './handlers';
import { readFileSync } from 'fs';

const source = readFileSync('./handlers.ts', 'utf-8');
const session = init(handlers, source, { name: 'api-handlers' });

// Drop-in replacement — same signatures, now governed
app.get('/users', session.exports.getUsers);
app.post('/users', session.exports.createUser);

app.get('/health', (_, res) => res.json(session.healthCheck()));
app.get('/status', (_, res) => res.json(session.status()));
```

No code modification. No framework changes. No lock-in.

---

## Verify

```bash
cmpsbl health
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `CMPSBL_API_KEY not set` | Add to `.env` or `export CMPSBL_API_KEY=...` |
| CLI not responding | Run `npx mana attach` again from the project root |
| Level not applying | Run `@cmpsbl/config` to reconfigure |

---

## Support

- **Email:** support@cmpsbl.com
- **CLI:** `cmpsbl help`

---

© 2025–2026 CMPSBL®. All rights reserved.
