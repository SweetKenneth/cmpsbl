# Getting Started

---

## 1. Create an Account

Sign up at [cmpsbl.com](https://cmpsbl.com). Free tier gives you immediate access to the Substrate Terminal and core primitives.

## 2. Get Your API Key

After signup, generate an API key from your [Developer Portal](https://cmpsbl.com/api-access). Keys are prefixed:
- `cmpsbl_gov_` — Governor (full access)
- `cmpsbl_arc_` — Architect tier
- `cmpsbl_cre_` — Creator tier
- `cmpsbl_std_` — Studio tier
- `cmpsbl_bld_` — Builder (free tier)

Or generate one instantly through the CLI:
```bash
npx mana attach
# or
npx @cmpsbl/cli login
```

## 3. Authenticate

Set your key as an environment variable:

```bash
export CMPSBL_API_KEY=your_key_here
```

Or let the CLI store it automatically in `~/.cmpsbl/credentials` (file permissions: 600).

## 4. Your First Interaction

### Option A: Ascension (upload your code)

Visit [cmpsbl.com/explore](https://cmpsbl.com/explore) → Upload code → Ascension scans, classifies, and produces an enhanced capability pack.

### Option B: CLI

```bash
# Install the CLI
npm install -g @cmpsbl/cli

# Run Ascension on a file
cmpsbl ascend your-file.ts

# Or attach Layer 2 governance
npx mana attach
```

### Option C: Substrate Terminal

Log into [cmpsbl.com](https://cmpsbl.com) and use the browser-based Substrate Terminal for ~600 commands across all 40 primitives.

## 5. Access Surfaces

| Surface | Where | Commands | Best For |
|---------|-------|----------|----------|
| **Website** | cmpsbl.com | Full Ascension, export, terminal | Code analysis, export, exploration |
| **CLI** | Your terminal | 66 commands | Local development, automation |
| **Mana** | Your terminal | 7 commands | Layer 2 attachment, configuration |

## 6. Next Steps

- Upload code to [Ascension](https://cmpsbl.com/explore) and get your first capability pack
- Read the [Ascension User Guide](08-ascension-integration.md) to understand what you get
- Install [Mana](11-agent-installation.md) to add Defense and Governance
- Explore the [CLI & SDK](07-cli-and-sdk.md) for local development

---

© 2025–2026 CMPSBL®. All rights reserved.
