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
import { generateProductZip } from '@/lib/export/product-zip';
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

// ZIP generation now uses the shared generateProductZip from lib/export/product-zip.ts

async function generateProductZipForGovernor(product: DownloadableProduct): Promise<Blob> {
  return generateProductZip({
    id: product.id,
    kind: product.kind,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    tier: product.tier,
    slug: product.slug,
    version: product.version,
    capabilities: [
      product.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent',
      `${product.tier.toUpperCase()} Tier`,
      'Sealed Runtime',
      'Mini-Runtime™ Engine',
    ],
  });
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
      const blob = await generateProductZipForGovernor(product);
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
        const blob = await generateProductZipForGovernor(product);
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
