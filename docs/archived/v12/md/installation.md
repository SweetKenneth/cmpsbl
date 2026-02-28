# Installation

## Prerequisites

- Node.js 18+ or Bun 1.0+
- A Clockless Cloud instance (provides backend automatically)

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd clockless

# Install dependencies
bun install

# Start development server
bun run dev
```

## Environment

The following environment variables are automatically configured by Clockless Cloud:

- `VITE_SUPABASE_URL` — Backend API endpoint
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Public API key
- `VITE_SUPABASE_PROJECT_ID` — Project identifier

No manual configuration is required for standard development.

## Post-Install Lifecycle

After installation the substrate follows a deterministic boot sequence:

1. **Detect** — Component detection scans the DOM for optional modules (terminal, radio, etc.) and caches results
2. **Setup** — Core handlers register, audit checks wire up, boundary scopes are established
3. **Scan** — All 10 audit sources run in priority order using value-scored ranking:
   - Structural integrity (highest)
   - Security (DEFENSE)
   - Production audit (fatals/errors)
   - Technical debt (ENGINEER)
   - Diligence harness
   - Audit gap coverage
   - Accessibility (INCLUSIVE, lowest)
4. **Fix** — High-value findings are surfaced in proposals (max 5 actions, scored by `severity × category multiplier`)
5. **Evolve** — Once stable (no fatal/error findings), the evolution engine activates via external-AI mode

### Conditional Scanning

Optional components are detected at runtime. If a component is not present, its audit checks are skipped entirely:

| Component | Detection Method | Skipped When Absent |
|-----------|-----------------|---------------------|
| Terminal | DOM query + self-registration | Command registration checks |
| Radio | Component mount flag | Playback state checks |

## Build

```bash
# Production build
bun run build

# Preview production build
bun run preview
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Clockless Cloud (managed) |
| AI Routing | NEXUS (multi-provider) |
| Scanning | 10-source unified audit pipeline |
| Evolution | External-AI mode with SEBA stamping |
