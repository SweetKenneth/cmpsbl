/**
 * Governor Downloads Panel — Downloadable ZIPs of every product
 * Governor-only: inspect bundles, customer service, giveaways.
 */

import { useState } from 'react';
import { Download, Package, Cpu, Bot, Loader2, CheckCircle2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ENGINES } from '@/lib/engines/catalog';
import { STORE_AGENTS } from '@/lib/store/catalog';
import { generateCmpsblManifest, serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadableProduct {
  id: string;
  kind: 'engine' | 'agent';
  name: string;
  subtitle: string;
  price: string;
  tier: string;
  slug: string;
  version: string;
}

function buildProductList(): DownloadableProduct[] {
  const engines: DownloadableProduct[] = ENGINES.map(e => ({
    id: `engine-${e.slug}`,
    kind: 'engine',
    name: e.codename,
    subtitle: e.tagline,
    price: e.priceDisplay,
    tier: e.tier,
    slug: e.slug,
    version: e.version || '1.0.0',
  }));

  const agents: DownloadableProduct[] = STORE_AGENTS.map(a => ({
    id: a.id,
    kind: 'agent',
    name: a.name,
    subtitle: a.subtitle,
    price: a.priceDisplay,
    tier: a.tier,
    slug: a.id.replace('agent-', ''),
    version: '1.0.0',
  }));

  return [...engines, ...agents];
}

function generateEngineReadme(product: DownloadableProduct): string {
  return `# ${product.name} — CMPSBL® Sealed Runtime

## ${product.subtitle}

**Tier:** ${product.tier.toUpperCase()}
**Price:** ${product.price}
**Type:** ${product.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent'}

---

## Installation

\`\`\`bash
# Copy the contents of src/ into your project
cp -r src/* ./your-project/
\`\`\`

## Usage

\`\`\`typescript
import { ${product.name.toLowerCase()} } from './${product.slug}';

// Initialize the ${product.kind}
const instance = ${product.name.toLowerCase()}.init();
\`\`\`

## License

CMPSBL® Proprietary License — Single-seat perpetual license.
This software is a sealed runtime. Source inspection, decompilation,
redistribution, and reverse engineering are prohibited.

---

© 2025–2026 PromptFluid®. All rights reserved.
CMPSBL® is a registered trademark of PromptFluid.
`;
}

function generateLicense(): string {
  return `CMPSBL® PROPRIETARY SOFTWARE LICENSE
=====================================

Version 1.0 — Effective ${new Date().toISOString().slice(0, 10)}

This software is provided as a Sealed Runtime™ artifact by PromptFluid®.

GRANT OF LICENSE:
You are granted a non-exclusive, non-transferable, perpetual license to
use this software in your own projects and products.

RESTRICTIONS:
- You may NOT redistribute this software as a standalone product.
- You may NOT reverse engineer, decompile, or inspect internal algorithms.
- You may NOT sublicense or transfer your license to a third party.
- You may NOT remove or alter any proprietary notices.

WARRANTY DISCLAIMER:
This software is provided "AS IS" without warranty of any kind.

© 2025–2026 PromptFluid®. All rights reserved.
`;
}

async function generateProductZip(product: DownloadableProduct): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `cmpsbl-${product.kind}-${product.slug}`;
  const folder = zip.folder(folderName)!;

  // Manifest
  folder.file('manifest.json', serializeCmpsblManifest({
    name: product.name,
    version: product.version,
    cjpi: product.tier === 'apex' ? 95 : product.tier === 'elite' ? 80 : product.tier === 'pro' ? 65 : product.tier === 'starter' ? 45 : 30,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT', product.name],
    targets: ['typescript'],
    category: product.kind,
    source: 'governor-download',
  }));

  // README
  folder.file('README.md', generateEngineReadme(product));

  // License
  folder.file('LICENSE', generateLicense());

  // Stub src
  const src = folder.folder('src')!;
  src.file(`${product.slug}.ts`, `/**\n * ${product.name} — CMPSBL® Sealed Runtime\n * ${product.subtitle}\n *\n * This is the sealed runtime entry point.\n * Internal implementation is protected.\n */\n\nexport const ${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_VERSION = '1.0.0';\nexport const ${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_TIER = '${product.tier}';\n\nexport function init(config?: Record<string, unknown>) {\n  return {\n    name: '${product.name}',\n    tier: '${product.tier}',\n    ready: true,\n    config,\n  };\n}\n`);

  // Runtime stub
  const runtime = folder.folder('_runtime')!;
  runtime.file('standalone-runtime.ts', `/**\n * CMPSBL® Mini-Runtime™ Engine\n * Provides CJPI scoring, auto-tiering, and pipeline orchestration.\n */\n\nexport const RUNTIME_VERSION = '1.0.0';\n\nexport function computeCJPI(metrics: { novelty: number; utility: number; complexity: number; composability: number }): number {\n  return Math.round((metrics.novelty * 0.3 + metrics.utility * 0.3 + metrics.complexity * 0.2 + metrics.composability * 0.2) * 100);\n}\n\nexport function autoTier(cjpi: number): string {\n  if (cjpi >= 90) return 'Apex';\n  if (cjpi >= 75) return 'Enterprise';\n  if (cjpi >= 55) return 'Architect';\n  if (cjpi >= 35) return 'Creator';\n  return 'Raw';\n}\n`);

  // Test stub
  const test = folder.folder('test')!;
  test.file(`${product.slug}.test.ts`, `import { init } from '../src/${product.slug}';\n\ndescribe('${product.name}', () => {\n  it('initializes correctly', () => {\n    const instance = init();\n    expect(instance.name).toBe('${product.name}');\n    expect(instance.ready).toBe(true);\n  });\n});\n`);

  return zip.generateAsync({ type: 'blob' });
}

export function GovernorDownloadsPanel() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const products = buildProductList();
  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.subtitle.toLowerCase().includes(search.toLowerCase()))
    : products;

  const engines = filtered.filter(p => p.kind === 'engine');
  const agents = filtered.filter(p => p.kind === 'agent');

  const handleDownload = async (product: DownloadableProduct) => {
    setDownloading(product.id);
    try {
      const blob = await generateProductZip(product);
      saveAs(blob, `cmpsbl-${product.kind}-${product.slug}.zip`);
      setDownloaded(prev => new Set([...prev, product.id]));
      toast.success(`${product.name} ZIP downloaded`);
    } catch (e: any) {
      toast.error(`Failed to generate ZIP: ${e?.message || 'Unknown error'}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading('all');
    try {
      const masterZip = new JSZip();
      for (const product of products) {
        const blob = await generateProductZip(product);
        masterZip.file(`cmpsbl-${product.kind}-${product.slug}.zip`, blob);
      }
      const masterBlob = await masterZip.generateAsync({ type: 'blob' });
      saveAs(masterBlob, `cmpsbl-all-products-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success(`All ${products.length} products downloaded`);
    } catch (e: any) {
      toast.error(`Failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setDownloading(null);
    }
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'APEX': case 'apex': return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20';
      case 'ELITE': case 'elite': return 'bg-violet-500/15 text-violet-400 border-violet-500/20';
      case 'CORE': case 'pro': return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
      case 'META': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'starter': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'free': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border/20';
    }
  };

  const ProductRow = ({ product }: { product: DownloadableProduct }) => {
    const isDownloading = downloading === product.id;
    const isDone = downloaded.has(product.id);

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15 transition-all duration-300 hover:border-primary/15 hover:bg-muted/15 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", product.kind === 'engine' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-violet-500/10 border border-violet-500/20')}>
            {product.kind === 'engine' ? <Cpu className="w-4 h-4 text-cyan-400" /> : <Bot className="w-4 h-4 text-violet-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{product.name}</p>
            <p className="text-[10px] text-muted-foreground/50 truncate">{product.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground/60">v{product.version}</span>
          <Badge className={cn("text-[9px] px-1.5", tierColor(product.tier))}>{product.tier.toUpperCase()}</Badge>
          <span className="text-xs font-mono font-bold w-16 text-right">{product.price}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] gap-1 px-2"
            disabled={isDownloading || downloading === 'all'}
            onClick={() => handleDownload(product)}
          >
            {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
            {isDownloading ? 'Building…' : isDone ? 'Done' : 'ZIP'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary shrink-0" />
                Product Downloads
              </CardTitle>
              <CardDescription className="text-[11px]">
                {products.length} products — inspect ZIPs, customer service, or giveaways
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 shrink-0"
              disabled={downloading !== null}
              onClick={handleDownloadAll}
            >
              {downloading === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloading === 'all' ? 'Building all…' : 'Download All'}
            </Button>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-9 bg-muted/10 border-border/15"
            />
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 space-y-4">
          {/* Engines */}
          {engines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">Engines ({engines.length})</span>
              </div>
              <div className="space-y-1.5">
                {engines.map(p => <ProductRow key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* Agents */}
          {agents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">Meta-Agents ({agents.length})</span>
              </div>
              <div className="space-y-1.5">
                {agents.map(p => <ProductRow key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground/40 text-center py-8">No products match "{search}"</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
