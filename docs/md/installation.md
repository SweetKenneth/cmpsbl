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
