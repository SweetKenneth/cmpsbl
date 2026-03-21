# @cmpsbl/failsafe

CMPSBL® FAILSAFE — Disaster Recovery & Platform Migration Engine.

## Install

```bash
npm install @cmpsbl/failsafe
```

## Usage

```typescript
import { createBackup, restore, migrate } from '@cmpsbl/failsafe';

// Backup
const backup = await createBackup({
  supabaseUrl: 'https://xxx.supabase.co',
  supabaseKey: 'your-service-role-key',
});

// Restore
const result = await restore({
  targetUrl: 'https://yyy.supabase.co',
  targetKey: 'target-service-role-key',
  backupData: myBackupData,
  cleanRestore: true,
});

// Full migration
const migration = await migrate({
  source: { supabaseUrl: '...', supabaseKey: '...' },
  target: { targetUrl: '...', targetKey: '...' },
  options: { cleanRestore: true, validateIntegrity: true },
});
```

## License

Apache-2.0 © Kenneth E Sweet Jr
