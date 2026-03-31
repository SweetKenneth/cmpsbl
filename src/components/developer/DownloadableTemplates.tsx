/**
 * Downloadable Starter Templates
 * Generate ZIP packages for common frameworks
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle2, FileCode, Package } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { generateIntegrationGuide } from '@/lib/export/integration-guide-generator';
import { generateExportArtifacts } from '@/lib/export/export-artifacts-generator';

interface Template {
  id: string;
  name: string;
  description: string;
  framework: string;
  color: string;
  files: Record<string, string>;
}

const templates: Template[] = [
  {
    id: 'nextjs-substrate',
    name: 'Next.js + Substrate API',
    description: 'Full-stack template with persistent memory',
    framework: 'Next.js 14',
    color: 'bg-foreground/10 text-foreground border-foreground/20',
    files: {
      'package.json': JSON.stringify({
        name: 'nextjs-substrate-starter',
        version: '1.0.0',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
      }, null, 2),
      'src/lib/substrate.ts': `const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';

// Store a memory via the Substrate API
export async function storeMemory(apiKey: string, content: string) {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      module: 'MEMORY',
      action: 'store',
      payload: { content },
    }),
  });
  return res.json();
}

// Recall memories via the Substrate API
export async function recallMemories(apiKey: string, query: string) {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      module: 'MEMORY',
      action: 'recall',
      payload: { query },
    }),
  });
  return res.json();
}
`,
      'src/app/page.tsx': `import { recallMemories } from '@/lib/substrate';

export default async function Home() {
  // Example: recall recent context
  const context = await recallMemories(
    process.env.CMPSBL_API_KEY!,
    'user preferences'
  );
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Substrate-Enabled App</h1>
      <p>Context: {JSON.stringify(context)}</p>
    </main>
  );
}
`,
      '.env.example': `# Get your API key at https://cmpsbl.com/devtools
CMPSBL_API_KEY=cmpsbl_your_api_key_here
`,
      'README.md': `# Next.js + CMPSBL Substrate Starter

## Quick Start

1. Install dependencies:
   \\\`\\\`\\\`bash
   npm install
   \\\`\\\`\\\`

2. Copy \\\`.env.example\\\` to \\\`.env.local\\\` and add your API key:
   \\\`\\\`\\\`bash
   cp .env.example .env.local
   \\\`\\\`\\\`

3. Run the development server:
   \\\`\\\`\\\`bash
   npm run dev
   \\\`\\\`\\\`

## Get Your API Key

Visit https://cmpsbl.com/devtools to get your free API key.

## Documentation

Full documentation: https://cmpsbl.com/docs/persistent-memory
`,
    },
  },
  {
    id: 'express-agent',
    name: 'Express.js Agent',
    description: 'Backend agent with Substrate API integration',
    framework: 'Express 4',
    color: 'bg-neon-green/10 text-neon-green border-neon-green/20',
    files: {
      'package.json': JSON.stringify({
        name: 'express-substrate-agent',
        version: '1.0.0',
        type: 'module',
        scripts: {
          start: 'node index.js',
          dev: 'node --watch index.js',
        },
        dependencies: {
          express: '^4.18.0',
          dotenv: '^16.0.0',
        },
      }, null, 2),
      'index.js': `import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const API_KEY = process.env.CMPSBL_API_KEY;

async function callSubstrate(module, action, payload) {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': \\\`Bearer \\\${API_KEY}\\\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ module, action, payload }),
  });
  return res.json();
}

// Store memory endpoint
app.post('/memory', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await callSubstrate('MEMORY', 'store', { content });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recall memories endpoint
app.get('/memory', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await callSubstrate('MEMORY', 'recall', { query });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\\\`Agent running on port \\\${PORT}\\\`);
});
`,
      '.env.example': `CMPSBL_API_KEY=cmpsbl_your_api_key_here
PORT=3000
`,
      'README.md': `# Express.js Substrate Agent

## Quick Start

1. Install dependencies:
   \\\`\\\`\\\`bash
   npm install
   \\\`\\\`\\\`

2. Copy \\\`.env.example\\\` to \\\`.env\\\` and add your API key

3. Start the server:
   \\\`\\\`\\\`bash
   npm start
   \\\`\\\`\\\`

## API Endpoints

- POST /memory - Store a memory
- GET /memory?query=xxx - Recall memories
`,
    },
  },
  {
    id: 'python-agent',
    name: 'Python Agent',
    description: 'FastAPI agent with Substrate integration',
    framework: 'Python 3.11',
    color: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
    files: {
      'requirements.txt': `python-dotenv>=1.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
httpx>=0.25.0
`,
      'main.py': `from fastapi import FastAPI
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

app = FastAPI()

GATEWAY = "https://api.cmpsbl.com/v1/substrate"
API_KEY = os.getenv("CMPSBL_API_KEY")

async def call_substrate(module: str, action: str, payload: dict):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GATEWAY,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={"module": module, "action": action, "payload": payload},
        )
        return resp.json()

@app.post("/memory")
async def store_memory(content: str):
    """Store a new memory"""
    return await call_substrate("MEMORY", "store", {"content": content})

@app.get("/memory")
async def recall_memories(query: str):
    """Recall memories by query"""
    return await call_substrate("MEMORY", "recall", {"query": query})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`,
      '.env.example': `CMPSBL_API_KEY=cmpsbl_your_api_key_here
`,
      'README.md': `# Python Substrate Agent

## Quick Start

1. Create a virtual environment:
   \\\`\\\`\\\`bash
   python -m venv venv
   source venv/bin/activate
   \\\`\\\`\\\`

2. Install dependencies:
   \\\`\\\`\\\`bash
   pip install -r requirements.txt
   \\\`\\\`\\\`

3. Copy \\\`.env.example\\\` to \\\`.env\\\` and add your API key

4. Run the server:
   \\\`\\\`\\\`bash
   python main.py
   \\\`\\\`\\\`
`,
    },
  },
];

export function DownloadableTemplates({ className }: { className?: string }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const downloadTemplate = async (template: Template) => {
    setDownloading(template.id);
    
    try {
      const { serializeCmpsblManifest } = await import('@/lib/export/cmpsbl-manifest');
      const zip = new JSZip();
      
      // Add all files to the ZIP
      Object.entries(template.files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      // Add CMPSBL manifest
      zip.file('manifest.json', serializeCmpsblManifest({
        name: template.id,
        targets: ['typescript'],
        version: '1.0.0',
        source: 'developer-template',
      }));

      // Integration guide
      zip.file('INTEGRATION.md', generateIntegrationGuide({
        kind: 'engine',
        name: template.name,
        slug: template.id,
      }));
      
      // Generate the ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloaded(prev => new Set([...prev, template.id]));
      toast.success(`Downloaded ${template.name}!`);
    } catch (error) {
      toast.error('Failed to generate download');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:border-primary/30 transition-colors">
            <CardContent className="pt-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <Badge variant="outline" className={cn("text-[10px]", template.color)}>
                  {template.framework}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                {template.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <FileCode className="w-3 h-3" />
                {Object.keys(template.files).length} files
              </div>
              
              <Button
                variant={downloaded.has(template.id) ? "secondary" : "default"}
                size="sm"
                onClick={() => downloadTemplate(template)}
                disabled={downloading === template.id}
                className="w-full"
              >
                {downloading === template.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : downloaded.has(template.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download ZIP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
