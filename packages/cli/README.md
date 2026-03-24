# @cmpsbl/cli

> CMPSBL® CLI — Terminal interface for the substrate with 45+ commands, REPL, and Memory Stream.

[![npm](https://img.shields.io/npm/v/@cmpsbl/cli)](https://www.npmjs.com/package/@cmpsbl/cli)

## Install

> ⚠️ **Install peer dependency first:**

```bash
# Step 1: Install runtime (Tier 1)
npm install @cmpsbl/runtime

# Step 2: Install CLI
npm install -g @cmpsbl/cli
```

## Dependency Tier

```
Tier 1 (install first)          Tier 2 (install after Tier 1)
└── @cmpsbl/runtime      ──→    @cmpsbl/cli  ← YOU ARE HERE
```

## Quick Start

```bash
cmpsbl init                     # First Contact ceremony
cmpsbl discover "your input"    # Start live discovery
cmpsbl stream                   # View Memory Stream
cmpsbl score 80 90 70 85        # Score with CJPI
cmpsbl deps                     # Show ecosystem dependency graph
cmpsbl publish-order             # Show correct publish order
```

## Environment Variables

```bash
CMPSBL_API_KEY=your-key         # API key for persistent Memory Stream
CMPSBL_ENDPOINT=https://...     # Custom endpoint (optional)
```

## License

Apache-2.0 — © CMPSBL®
