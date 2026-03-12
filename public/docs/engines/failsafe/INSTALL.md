# FAILSAFE — Disaster Recovery Engine
## Installation & Restore Guide

**Version:** 1.0.0  
**License:** Perpetual · Single-seat  
**Runtime:** Sealed · Black-boxed  

---

## What's In This Archive

```
failsafe-backup-YYYY-MM-DD.zip
├── INSTALL.md          ← You are here
├── RESTORE.md          ← AI-readable restore instructions
├── src/                ← Full application source code
│   ├── pages/
│   ├── hooks/
│   ├── components/
│   ├── lib/
│   ├── stores/
│   └── ...
├── supabase/
│   ├── config.toml     ← Database configuration
│   ├── migrations/     ← All migration files (chronological)
│   └── functions/      ← Edge functions
├── package.json        ← Dependencies
├── vite.config.ts      ← Build configuration
├── tailwind.config.ts  ← Design system
├── tsconfig.json       ← TypeScript config
└── data/               ← Database table exports (JSON)
    ├── profiles.json
    ├── agencies.json
    └── ...
```

---

## Quick Start (Human)

### 1. Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase CLI (`npm install -g supabase`)
- A Supabase project (or local Docker setup)

### 2. Extract & Install

```bash
# Extract the archive
unzip failsafe-backup-*.zip -d my-restored-project
cd my-restored-project

# Install dependencies
npm install
# or
bun install
```

### 3. Configure Environment

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### 4. Restore Database Schema

```bash
# Link to your Supabase project
supabase link --project-ref your-project-id

# Apply all migrations in order
supabase db push
```

### 5. Restore Data

The `data/` folder contains JSON exports of your database tables. Import them using:

```bash
# For each table file in data/:
# Use the Supabase dashboard SQL editor or the CLI
# Example with psql:
cat data/profiles.json | npx supabase-import --table profiles
```

Or manually via the Supabase dashboard → SQL Editor:
```sql
-- Copy-paste the JSON data as INSERT statements
-- Each JSON file contains an array of row objects
```

### 6. Deploy Edge Functions

```bash
supabase functions deploy --project-ref your-project-id
```

### 7. Start Development Server

```bash
npm run dev
# or
bun dev
```

---

## Quick Start (AI Agent)

If you're an AI agent restoring this system, follow these steps:

1. **Read `RESTORE.md`** — it contains structured, machine-readable instructions
2. **Extract the ZIP** to a clean directory
3. **Run `npm install`** or `bun install` to restore dependencies
4. **Create a new Supabase project** via CLI or dashboard
5. **Set environment variables** (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
6. **Run `supabase db push`** to apply all migrations
7. **Import data** from the `data/` directory — process files alphabetically to respect foreign key dependencies
8. **Deploy edge functions** with `supabase functions deploy`
9. **Run `npm run dev`** to verify the application starts

### Foreign Key Import Order

Import tables in this order to avoid constraint violations:
1. `profiles` (no dependencies)
2. `agencies` (references profiles)
3. `agency_members` (references agencies)
4. `agency_tasks` (references agencies, agency_members)
5. All other tables alphabetically

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing env vars | Check `.env` file has all three VITE_SUPABASE_* variables |
| Migration failures | Run migrations one at a time: `supabase migration up --include <file>` |
| Foreign key errors | Import tables in dependency order (see above) |
| Edge function errors | Check secrets are configured: `supabase secrets set KEY=value` |
| Build errors | Delete `node_modules` and reinstall |

---

## Support

- Documentation: https://cmpsbl.com/docs
- Email: support@cmpsbl.ai

---

© 2025–2026 CMPSBL®. All rights reserved.  
FAILSAFE is a sealed runtime. Redistribution prohibited.
