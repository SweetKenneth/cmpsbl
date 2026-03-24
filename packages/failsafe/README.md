# @cmpsbl/failsafe

> CMPSBL® FAILSAFE — Zero-dependency disaster recovery & platform migration engine.

[![npm](https://img.shields.io/npm/v/@cmpsbl/failsafe)](https://www.npmjs.com/package/@cmpsbl/failsafe)

## Install

```bash
npm install @cmpsbl/failsafe
```

**Zero dependencies.** Builds standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Usage

```typescript
import { createBackup, restore } from '@cmpsbl/failsafe';

const backup = await createBackup({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-service-role-key',
});
```

## License

Apache-2.0 — © CMPSBL®
