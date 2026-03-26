# 03 — Codebase Guide

**Classification:** INTERNAL — Team Members Only

---

## 1. Repository Structure

```
/
├── docs/                          # Documentation libraries
│   └── libraries/
│       ├── public/                # Open — anyone evaluating CMPSBL
│       ├── users/                 # Open — developers building on CMPSBL
│       ├── investors/             # Confidential — investors & advisors
│       ├── internal/              # Governor Eyes Only — system operators
│       └── staff/                 # Internal — team members (YOU ARE HERE)
│
├── packages/                      # Publishable NPM packages
│   ├── types/                     # @cmpsbl/types — shared TypeScript definitions
│   └── runtime/                   # @cmpsbl/runtime — Mini-Runtime™ engine
│
├── src/                           # Application source
│   ├── assets/                    # Static assets (images, logos, team photos)
│   ├── components/                # React components (UI layer)
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── proprietary-evolution/ # Ascension flow UI (upload → export)
│   │   └── ...                    # Feature-specific component directories
│   ├── data/                      # Static data (team.ts, primitives, pricing)
│   ├── hooks/                     # Custom React hooks
│   ├── integrations/              # Auto-generated Supabase client & types
│   │   └── supabase/              # ⚠️ NEVER EDIT — auto-generated
│   ├── lib/                       # Core business logic
│   │   ├── export/                # Ascension export pipeline
│   │   │   ├── blackbox.ts        # IP obfuscation for exports
│   │   │   ├── unified-capability-file.ts  # Single-file generator
│   │   │   └── __tests__/         # Export pipeline tests
│   │   ├── proprietary-evolution/ # Discovery, scoring, packaging
│   │   │   └── zip-generator.ts   # ZIP artifact builder
│   │   └── ...                    # Feature libraries
│   ├── packages/                  # In-app substrate packages
│   │   └── evolution-mesh/        # Evolution mesh runtime
│   ├── pages/                     # Route-level page components
│   └── styles/                    # Global CSS
│
├── supabase/                      # Backend configuration
│   ├── config.toml                # Project config (auto-managed)
│   ├── functions/                 # Edge functions (auto-deployed)
│   └── migrations/                # Database migrations (read-only)
│
└── index.html                     # Entry point
```

---

## 2. Key Files You Must Know

| File | Purpose | Editable? |
|------|---------|-----------|
| `src/data/team.ts` | Team directory, department contacts, blog author pool | ✅ |
| `src/lib/export/blackbox.ts` | IP obfuscation for exported artifacts | ✅ |
| `src/lib/export/unified-capability-file.ts` | 25-language single-file export generator | ✅ |
| `src/lib/proprietary-evolution/zip-generator.ts` | ZIP packaging for Ascension exports | ✅ |
| `src/integrations/supabase/client.ts` | Supabase client | ❌ Auto-generated |
| `src/integrations/supabase/types.ts` | Database types | ❌ Auto-generated |
| `supabase/config.toml` | Backend config | ❌ Auto-managed |
| `.env` | Environment variables | ❌ Auto-managed |

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| 3D | Three.js / React Three Fiber |
| Animation | Framer Motion |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with RLS |
| Edge Functions | Deno runtime (auto-deployed) |
| Testing | Vitest |

---

## 4. Development Conventions

### Naming
- Components: `PascalCase.tsx` (e.g., `ExportPhase.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-auth.ts`)
- Utilities: `kebab-case.ts` (e.g., `zip-generator.ts`)
- Data files: `kebab-case.ts` (e.g., `team.ts`)

### Design System
- **Always use semantic tokens** from `index.css` — never hardcode colors
- All colors must be HSL in the design system
- Use `--primary`, `--foreground`, `--background`, `--muted`, `--accent`, etc.
- Never write `text-white`, `bg-black` directly in components

### Architecture Rules
1. All execution routes through `broadcastIntent()`
2. Primitives interact only through resolvers (`primitive.resolver_name`)
3. Telemetry is always non-blocking
4. Mesh communications reflect real activity (no simulated data in production)
5. Personality dialogue never affects logic

### Files You Must Never Edit
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`
- `supabase/migrations/` (read-only)
- `.gitignore`, `bun.lock`, `package-lock.json`

---

## 5. Testing

```bash
# Run all tests
npx vitest

# Run specific test file
npx vitest src/lib/export/__tests__/e2e-ascension-smoke.test.ts

# Watch mode
npx vitest --watch
```

Key test suites:
- `unified-export-pipeline.test.ts` — Export generation across 5 languages
- `e2e-ascension-smoke.test.ts` — Full upload → discovery → scoring → export flow

---

## 6. Database Access

- PostgreSQL with Row-Level Security (RLS) on all sensitive tables
- Use `src/integrations/supabase/client.ts` for all database access
- Never create alternate clients or bypass the auto-generated types
- 60+ tables — see `src/integrations/supabase/types.ts` for the full schema

---

© 2025–2026 CMPSBL®. Internal Use Only.
