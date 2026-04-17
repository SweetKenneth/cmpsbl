/**
 * MyWorkbench — User's collection of downloaded and purchased items
 * Persisted to database for cross-device sync
 */

import { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkbenchItems } from '@/hooks/useWorkbenchItems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Package, Wrench, Trash2, Code, ArrowRight,
  Download, Archive, Search, X, Zap,
} from 'lucide-react';
import { buildArchiveCatalog, type ArchiveItem } from '@/lib/junkyard/static-archive';

import imgSecurity from '@/assets/showroom/security-compliance.jpg';
import imgGovernance from '@/assets/showroom/governance-policy.jpg';
import imgMonitoring from '@/assets/showroom/monitoring-visibility.jpg';
import imgPerformance from '@/assets/showroom/performance-optimization.jpg';
import imgResilience from '@/assets/showroom/resilience-recovery.jpg';
import imgDecision from '@/assets/showroom/decision-intelligence.jpg';
import imgBrokenCircuit from '@/assets/junkyard/broken-circuit-salvage.jpg';
import imgDecommServer from '@/assets/junkyard/decommissioned-server.jpg';
import imgCorruptedData from '@/assets/junkyard/corrupted-data-stream.jpg';
import imgBrokenInput from '@/assets/junkyard/broken-input-device.jpg';
import imgCrackedDisplay from '@/assets/junkyard/cracked-display-module.jpg';
import imgSalvageRobot from '@/assets/junkyard/salvage-robotics.jpg';
import imgTangledNetwork from '@/assets/junkyard/tangled-network-salvage.jpg';
import imgLegacyStorage from '@/assets/junkyard/legacy-storage-platters.jpg';

const ALL_ARCHIVE_ITEMS = buildArchiveCatalog({
  security: imgSecurity, governance: imgGovernance, monitoring: imgMonitoring,
  performance: imgPerformance, resilience: imgResilience, decision: imgDecision,
  brokenCircuit: imgBrokenCircuit, decommServer: imgDecommServer, corruptedData: imgCorruptedData,
  brokenInput: imgBrokenInput, crackedDisplay: imgCrackedDisplay, salvageRobot: imgSalvageRobot,
  tangledNetwork: imgTangledNetwork, legacyStorage: imgLegacyStorage,
});

const ITEM_MAP = new Map(ALL_ARCHIVE_ITEMS.map(i => [i.id, i]));

function generateCodeSnippet(item: ArchiveItem): string {
  return `// ${item.name} — CJPI ${item.score}
// Condition: ${item.condition} | Category: ${item.category}
// ${item.description}

import { createCapability } from '@cmpsbl/substrate';

export const ${item.id.replace(/-/g, '_')} = createCapability({
  name: '${item.name}',
  score: ${item.score},
  condition: '${item.condition}',
  
  async execute(input: unknown) {
    // Core logic — ${item.condition === 'broken' ? 'needs restoration' : item.condition === 'salvageable' ? 'partially functional' : 'raw implementation'}
    return { status: 'ready', input };
  },
  
  healthCheck() {
    return { healthy: ${item.condition === 'raw'}, score: ${item.score} };
  },
});`;
}

function WorkbenchCard({ item, onRemove, onViewCode }: { item: ArchiveItem; onRemove: (id: string) => void; onViewCode: (item: ArchiveItem) => void }) {
  const conditionColors = {
    raw: 'border-neon-cyan/30 bg-neon-cyan/5',
    broken: 'border-destructive/30 bg-destructive/5',
    salvageable: 'border-neon-amber/30 bg-neon-amber/5',
  }[item.condition];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className={cn("overflow-hidden transition-all hover:shadow-lg", conditionColors)}>
        <div className="aspect-[16/9] overflow-hidden relative">
          <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge variant="outline" className="absolute bottom-2 left-2 text-xs bg-black/50 text-white border-white/20 backdrop-blur-md font-mono">
            CJPI {item.score}
          </Badge>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-sm mb-1">{item.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.description}</p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs flex-1" onClick={() => onViewCode(item)}>
              <Code className="w-3 h-3" />
              View Code
            </Button>
            {(item.condition === 'broken' || item.condition === 'salvageable') && (
              <Button asChild size="sm" variant="outline" className="gap-1 text-xs border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10 flex-1">
                <Link to="/ascension-v2">
                  <Wrench className="w-3 h-3" />
                  Restore
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => onRemove(item.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function MyWorkbench() {
  const { user, loading: authLoading } = useAuth();
  const { itemIds, loading: workbenchLoading, removeItem } = useWorkbenchItems();
  const [codeItem, setCodeItem] = useState<ArchiveItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const items = useMemo(() => {
    return itemIds
      .map(id => ITEM_MAP.get(id))
      .filter((i): i is ArchiveItem => !!i);
  }, [itemIds]);

  const filtered = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const handleRemove = async (id: string) => {
    await removeItem(id);
    toast.success('Removed from Workbench');
  };

  if (authLoading || workbenchLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Workbench — Your Collection | CMPSBL"
        description="View, manage, and interact with your downloaded discoveries, broken tech, and salvageable parts. Your personal CMPSBL workbench."
        canonical="https://cmpsbl.com/workbench"
      />
      <PublicNav />

      <div className="container mx-auto px-3 sm:px-4 pt-20">
        <PublicBreadcrumb />
      </div>

      <section className="container mx-auto px-3 sm:px-4 pt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">My Workbench</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/foundry">
                <Archive className="w-3.5 h-3.5" />
                Browse Archive
              </Link>
            </Button>
          </div>

          {items.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your collection..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 h-10 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Your Workbench is Empty</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Download items from the Open Archive to start building your collection. Free raw discoveries and restorable tech are waiting.
              </p>
              <Button asChild className="gap-2">
                <Link to="/foundry">
                  <Archive className="w-4 h-4" />
                  Browse the Open Archive
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(item => (
                  <WorkbenchCard key={item.id} item={item} onRemove={handleRemove} onViewCode={setCodeItem} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {filtered.length === 0 && items.length > 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No items match your search</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!codeItem} onOpenChange={open => !open && setCodeItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {codeItem?.name}
            </DialogTitle>
            <DialogDescription>
              CJPI {codeItem?.score} · {codeItem?.condition} · {codeItem?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="bg-muted/80 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-auto">
              {codeItem && generateCodeSnippet(codeItem)}
            </pre>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                if (codeItem) {
                  navigator.clipboard.writeText(generateCodeSnippet(codeItem));
                  toast.success('Code copied to clipboard');
                }
              }}
            >
              <Download className="w-3 h-3" />
              Copy Code
            </Button>
            {codeItem && (codeItem.condition === 'broken' || codeItem.condition === 'salvageable') && (
              <Button asChild size="sm" className="gap-1">
                <Link to="/ascension-v2">
                  <Zap className="w-3 h-3" />
                  Send to Restoration
                </Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
}
