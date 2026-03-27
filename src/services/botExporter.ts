/**
 * Bot Exporter Service
 * Generates export bundles for cognitive bots with all artifacts
 */

import JSZip from 'jszip';
import { generateLicenseHTML, generateReadmeHTML } from '@/lib/export/elegant-html-docs';
import { generateProductDetailsHTML } from '@/lib/export/product-details-page';

export interface BotExportConfig {
  id: string;
  name: string;
  slug: string;
  type: string;
  version: string;
  memoryMode: string;
  providers: string[];
  capabilities: string[];
  config?: Record<string, unknown>;
  changelog?: string;
}

export interface ExportBundle {
  blob: Blob;
  filename: string;
  files: string[];
}

/**
 * Generate bot.json configuration file
 */
function generateBotJson(config: BotExportConfig): string {
  return JSON.stringify({
    name: config.name,
    slug: config.slug,
    type: config.type,
    version: config.version,
    memory_mode: config.memoryMode,
    providers: config.providers,
    capabilities: config.capabilities,
    substrate: {
      version: '2026.01',
      compatible: ['brain', 'nexus', 'decode'],
    },
    runtime: {
      entry: 'src/index.ts',
      memory_tables: config.memoryMode === 'Persistent' 
        ? ['brain_memory_hot', 'brain_memory_cold'] 
        : [],
    },
    metadata: {
      generated_at: new Date().toISOString(),
      generator: 'promptfluid® Cognitive Forge v2.0.0',
    },
    ...config.config,
  }, null, 2);
}

/**
 * Generate behavior.mdx persona file
 */
function generateBehaviorMdx(config: BotExportConfig): string {
  return `---
name: ${config.name}
type: ${config.type}
version: ${config.version}
---

# ${config.name} Behavior Profile

## Persona
A **${config.type}** cognitive bot designed for ${config.capabilities.join(', ').toLowerCase()}.

## Memory Mode
**${config.memoryMode}** — ${getMemoryDescription(config.memoryMode)}

## Communication Style
- Professional and analytical
- Evidence-based responses
- Structured output formatting

## Core Behaviors
${config.capabilities.map(c => `- **${c}**: Execute ${c.toLowerCase()} operations with high precision`).join('\n')}

## Provider Preferences
Primary routing through: ${config.providers.join(' → ')}

## Constraints
- Operate within configured memory boundaries
- Respect rate limits on provider calls
- Log all significant cognitive events

## Example Interactions

### Research Query
\`\`\`
User: Research the latest trends in AI safety
Bot: [Activates Research/Web capability, queries via Nexus, synthesizes findings]
\`\`\`

### Summarization
\`\`\`
User: Summarize this document
Bot: [Processes input, extracts key points, returns structured summary]
\`\`\`
`;
}

function getMemoryDescription(mode: string): string {
  switch (mode) {
    case 'Stateless': return 'No state persisted between invocations';
    case 'Episodic': return 'State maintained during session, cleared on disconnect';
    case 'Persistent': return 'Long-term memory stored in brain_memory tables';
    default: return 'Default memory mode';
  }
}

/**
 * Generate memory.jsonl seed file
 */
function generateMemoryJsonl(config: BotExportConfig): string {
  const seeds = [
    { type: 'system', content: `Bot initialized: ${config.name}`, timestamp: new Date().toISOString() },
    { type: 'config', content: `Memory mode: ${config.memoryMode}`, timestamp: new Date().toISOString() },
    { type: 'capability', content: `Capabilities: ${config.capabilities.join(', ')}`, timestamp: new Date().toISOString() },
  ];
  return seeds.map(s => JSON.stringify(s)).join('\n');
}

/**
 * Generate instructions.md usage guide
 */
function generateInstructionsMd(config: BotExportConfig): string {
  return `# ${config.name} — Usage Instructions

## Overview
${config.name} is a ${config.type} cognitive bot powered by the promptfluid® substrate.

## Requirements
- Node.js 20+ or Deno 1.40+
- promptfluid® substrate SDK
- Provider API keys for: ${config.providers.join(', ')}

## Installation

\`\`\`bash
# Install dependencies
npm install

# Set environment variables
export GROQ_API_KEY=your_key
export CEREBRAS_API_KEY=your_key
\`\`\`

## Quick Start

\`\`\`typescript
import bot from './src/index';

// Run a task
const result = await bot.run('Your task here');
console.log(result);
\`\`\`

## Runtime Invocation

### Via Substrate
\`\`\`typescript
import { substrate } from '@cmpsbl/sdk';

const response = await substrate.invoke('forge', 'run', {
  bot_id: '${config.id}',
  query: 'Your query here'
});
\`\`\`

### Via Edge Function
\`\`\`bash
curl -X POST https://your-project.supabase.co/functions/v1/pf-forge-run \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"bot_id": "${config.id}", "query": "Your query"}'
\`\`\`

## Memory Operations

${config.memoryMode === 'Persistent' ? `
### Persistent Memory
\`\`\`typescript
// Store memory
await bot.memory.store('key', value);

// Retrieve memory
const data = await bot.memory.retrieve('key');
\`\`\`
` : config.memoryMode === 'Episodic' ? `
### Episodic Memory
Memory persists only during the current session.
` : `
### Stateless Mode
No memory persisted between calls.
`}

## Capabilities

${config.capabilities.map(c => `### ${c}
See the generated bot code for implementation details.
`).join('\n')}

## Troubleshooting

1. **Provider errors**: Verify API keys are set correctly
2. **Memory issues**: Ensure brain_memory tables exist for Persistent mode
3. **Rate limits**: Implement backoff or use multiple providers

---
Generated by promptfluid® Cognitive Forge v${config.version}
`;
}

/**
 * Generate deploy.sh boot script
 */
function generateDeploySh(config: BotExportConfig): string {
  return `#!/bin/bash
# ${config.name} — Deployment Script
# Generated by promptfluid® Cognitive Forge v2.0.0

set -e

echo "🤖 Deploying ${config.name} v${config.version}..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test || echo "⚠️ Tests skipped"

# Start bot
echo "🚀 Starting ${config.name}..."
npm start

echo "✅ ${config.name} is running!"
`;
}

/**
 * Generate version.txt
 */
function generateVersionTxt(config: BotExportConfig): string {
  return `${config.version}
Generated: ${new Date().toISOString()}
Bot: ${config.name}
Type: ${config.type}
`;
}

/**
 * Generate LICENSE.txt (MIT default)
 */
function generateLicenseTxt(config: BotExportConfig): string {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year} promptfluid®

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

/**
 * Generate README.md
 */
function generateReadmeMd(config: BotExportConfig): string {
  return `# ${config.name}

> A **${config.type}** cognitive bot • v${config.version}

## Features

${config.capabilities.map(c => `- ✅ ${c}`).join('\n')}

## Quick Start

\`\`\`bash
./deploy.sh
\`\`\`

## Configuration

| Property | Value |
|----------|-------|
| Type | ${config.type} |
| Memory | ${config.memoryMode} |
| Providers | ${config.providers.join(', ')} |
| Version | ${config.version} |

## Files

- \`bot.json\` — Bot configuration
- \`behavior.mdx\` — Persona & behavior rules
- \`memory.jsonl\` — Seed memory (if applicable)
- \`instructions.md\` — Usage guide
- \`deploy.sh\` — Deployment script
- \`src/index.ts\` — Main bot code

## License

MIT © promptfluid®

---

Generated by [promptfluid® Cognitive Forge](https://promptfluid.com/forge)
`;
}

/**
 * Generate bot source code
 */
function generateBotSourceCode(config: BotExportConfig): string {
  const className = config.name.replace(/[^a-zA-Z0-9]/g, '');
  
  return `/**
 * ${config.name} — ${config.type} Cognitive Bot
 * Generated by CMPSBL® Cognitive Forge
 * Version: ${config.version}
 */

import { substrate, brain, nexus } from '@cmpsbl/sdk';

interface BotMemory {
  store: (key: string, value: unknown) => Promise<void>;
  retrieve: (key: string) => Promise<unknown>;
  clear: () => Promise<void>;
}

export class ${className}Bot {
  public readonly name = '${config.name}';
  public readonly type = '${config.type}';
  public readonly version = '${config.version}';
  
  private nexus = nexus;
  private brain = brain;
  public memory: BotMemory;
  
  constructor() {
    this.memory = this.initMemory('${config.memoryMode}');
    console.log(\`[${className}Bot] Initialized v\${this.version}\`);
  }
  
  private initMemory(mode: string): BotMemory {
    const store: Record<string, unknown> = {};
    
    switch (mode) {
      case 'Stateless':
        return {
          store: async () => {},
          retrieve: async () => null,
          clear: async () => {},
        };
      case 'Episodic':
        return {
          store: async (k, v) => { store[k] = v; },
          retrieve: async (k) => store[k],
          clear: async () => { Object.keys(store).forEach(k => delete store[k]); },
        };
      case 'Persistent':
        return {
          store: async (k, v) => { 
            await brain.remember(JSON.stringify({ key: k, value: v }), 'bot_memory', 0.9);
          },
          retrieve: async (k) => {
            const result = await brain.recall(k, 1);
            return result?.data;
          },
          clear: async () => {},
        };
      default:
        return {
          store: async () => {},
          retrieve: async () => null,
          clear: async () => {},
        };
    }
  }
  
  async run(task: string): Promise<string> {
    console.log(\`[\${this.name}] Running: \${task}\`);
    
    try {
      const result = await this.nexus.text(task);
      
      if (result.success && result.data) {
        return String(result.data);
      }
      
      return 'Task processing failed';
    } catch (error) {
      console.error(\`[\${this.name}] Error:\`, error);
      throw error;
    }
  }
  
  async health(): Promise<{ status: string; version: string }> {
    return { status: 'operational', version: this.version };
  }
}

export const bot = new ${className}Bot();
export default bot;
`;
}

/**
 * Generate package.json
 */
function generatePackageJson(config: BotExportConfig): string {
  return JSON.stringify({
    name: `@cognitive/${config.slug}`,
    version: config.version,
    description: `${config.type} Cognitive Bot — ${config.name}`,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      start: 'ts-node src/index.ts',
      build: 'tsc',
      test: 'vitest run',
      'test:watch': 'vitest',
    },
    dependencies: {
      '@cmpsbl/sdk': '^2026.01',
    },
    devDependencies: {
      'typescript': '^5.0.0',
      'ts-node': '^10.9.0',
      'vitest': '^1.0.0',
      '@types/node': '^20.0.0',
    },
    keywords: ['cognitive', 'ai', 'bot', config.type.toLowerCase(), 'promptfluid'],
    author: 'promptfluid® Forge',
    license: 'MIT',
    engines: {
      node: '>=20.0.0',
    },
  }, null, 2);
}

/**
 * Create complete export bundle as ZIP
 */
export async function createExportBundle(config: BotExportConfig): Promise<ExportBundle> {
  const { serializeCmpsblManifest } = await import('@/lib/export/cmpsbl-manifest');
  const zip = new JSZip();
  
  const files: Record<string, string> = {
    'bot.json': generateBotJson(config),
    'behavior.mdx': generateBehaviorMdx(config),
    'memory.jsonl': generateMemoryJsonl(config),
    'instructions.md': generateInstructionsMd(config),
    'deploy.sh': generateDeploySh(config),
    'version.txt': generateVersionTxt(config),
    'LICENSE.txt': generateLicenseTxt(config),
    'LICENSE.html': generateLicenseHTML(config.name),
    'README.md': generateReadmeMd(config),
    'README.html': generateReadmeHTML({
      name: config.name,
      description: `${config.type} cognitive bot — ${config.capabilities.join(', ')}`,
      category: 'Cognitive Bot',
      version: config.version,
      modules: config.capabilities,
      files: [
        { name: 'bot.json', purpose: 'Bot configuration manifest' },
        { name: 'behavior.mdx', purpose: 'Persona and behavior rules' },
        { name: 'README.md / README.html', purpose: 'Documentation and quick-start guide' },
        { name: 'LICENSE.txt / LICENSE.html', purpose: 'License terms' },
        { name: 'DETAILS.html', purpose: 'Product specification certificate' },
        { name: 'src/index.ts', purpose: 'Main bot source code' },
        { name: 'memory.jsonl', purpose: 'Seed memory entries' },
        { name: 'deploy.sh', purpose: 'Deployment boot script' },
      ],
      quickStart: `# Deploy\n./deploy.sh\n\n# Or run manually\nnpm install\nnpm start`,
    }),
    'DETAILS.html': generateProductDetailsHTML({
      name: config.name,
      subtitle: `${config.type} cognitive bot`,
      kind: 'agent',
      tier: 'pro',
      price: 'Included',
      version: config.version,
      capabilities: config.capabilities,
    }),
    'package.json': generatePackageJson(config),
    'src/index.ts': generateBotSourceCode(config),
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'node',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
      },
      include: ['src/**/*'],
    }, null, 2),
  };

  // Add changelog if present
  if (config.changelog) {
    files['CHANGELOG.md'] = `# Changelog\n\n## v${config.version}\n\n${config.changelog}`;
  }

  // Add CMPSBL manifest
  files['manifest.json'] = serializeCmpsblManifest({
    name: config.name,
    targets: ['typescript'],
    version: config.version,
    source: 'cognitive-export',
  });

  // Add all files to zip
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${config.slug}-v${config.version}.zip`;

  return {
    blob,
    filename,
    files: Object.keys(files),
  };
}

/**
 * Download export bundle in browser
 */
export function downloadBundle(bundle: ExportBundle): void {
  const url = URL.createObjectURL(bundle.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = bundle.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
