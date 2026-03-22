# @cmpsbl/cli

CMPSBL® CLI — Local dev tools with live Memory Stream integration.

## First Contact

```bash
npx @cmpsbl/cli init
```

The CLI automatically:
1. Initializes a cognitive environment
2. Connects to the Memory Stream
3. Binds user memory
4. Starts live discovery

## Commands

```bash
cmpsbl init                         # Initialize project with memory binding
cmpsbl discover "your input"        # Start live discovery
cmpsbl stream                       # View Memory Stream
cmpsbl score 80 90 70 85            # Score with CJPI
cmpsbl validate manifest.json       # Validate manifest
```

## Environment Variables

```bash
CMPSBL_API_KEY=your-key             # API key for persistent Memory Stream
CMPSBL_ENDPOINT=https://...         # Custom endpoint (optional)
```

## License

Apache-2.0 © Kenneth E Sweet Jr
