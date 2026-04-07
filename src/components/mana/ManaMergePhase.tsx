/**
 * ManaMergePhase — Select substrate capabilities or upload open-source software
 * to embed into the Mana Layer 2 before it wraps the host.
 * 
 * This proves Mana can carry additional software that gets deployed
 * alongside the silent attachment — building ON the layer, not just wrapping.
 */

import { useState, useCallback, useRef } from 'react';
import { Plus, Upload, Cpu, CheckCircle2, X, FileCode2, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/** A capability from the substrate primitives catalog */
interface PrimitiveCapability {
  id: string;
  name: string;
  module: string;
  description: string;
  category: 'engine' | 'agent' | 'organ' | 'layer';
  tier: 'free' | 'creator' | 'architect';
}

/** A user-uploaded software payload to merge into Layer 2 */
export interface MergedSoftware {
  name: string;
  content: string;
  language: string;
  source: 'upload' | 'paste';
}

export interface ManaMergeResult {
  selectedCapabilities: PrimitiveCapability[];
  mergedSoftware: MergedSoftware[];
  totalMergedItems: number;
}

/**
 * Curated catalog of substrate primitives available for Layer 2 merge.
 * These represent real capabilities from the 40-Primitive architecture.
 */
const PRIMITIVE_CATALOG: PrimitiveCapability[] = [
  // Engines
  { id: 'failsafe', name: 'FAILSAFE', module: 'FAILSAFE', description: 'Automatic error recovery and fault tolerance at function boundaries.', category: 'engine', tier: 'free' },
  { id: 'beacon', name: 'BEACON', module: 'BEACON', description: 'Real-time health telemetry and observability signals.', category: 'engine', tier: 'free' },
  { id: 'automaton', name: 'AUTOMATON', module: 'AUTOMATON', description: 'Task automation pipelines that run within the Layer 2 wrap.', category: 'engine', tier: 'creator' },
  { id: 'cortex', name: 'CORTEX', module: 'CORTEX', description: 'Pattern recognition and anomaly detection on function behavior.', category: 'engine', tier: 'creator' },
  { id: 'nexus', name: 'NEXUS', module: 'NEXUS', description: 'AI routing and inference orchestration via the substrate.', category: 'engine', tier: 'creator' },
  { id: 'architect', name: 'ARCHITECT', module: 'ARCHITECT', description: 'Structural analysis and code classification engine.', category: 'engine', tier: 'architect' },

  // Agents
  { id: 'primitive-agent', name: 'PRIMITIVE', module: 'PRIMITIVE', description: 'Lightweight autonomous agent for basic function monitoring.', category: 'agent', tier: 'free' },
  { id: 'wraith', name: 'WRAITH', module: 'WRAITH', description: 'Silent background operations — the invisible worker.', category: 'agent', tier: 'creator' },
  { id: 'obsidian', name: 'OBSIDIAN', module: 'OBSIDIAN', description: 'Deep behavioral analysis and forensic-grade logging.', category: 'agent', tier: 'creator' },
  { id: 'raptor', name: 'RAPTOR', module: 'RAPTOR', description: 'High-speed scanning and rapid capability deployment.', category: 'agent', tier: 'architect' },

  // Organs
  { id: 'core', name: 'CORE', module: 'CORE', description: 'Central state management and lifecycle coordination.', category: 'organ', tier: 'free' },
  { id: 'defense', name: 'DEFENSE', module: 'DEFENSE', description: 'Input validation, exploit blocking, and security hardening.', category: 'organ', tier: 'free' },
  { id: 'brain', name: 'BRAIN', module: 'BRAIN', description: 'Decision-making and cognitive inference pipeline.', category: 'organ', tier: 'creator' },
  { id: 'dream', name: 'DREAM', module: 'DREAM', description: 'Sub-threshold synthesis — pure algorithmic pattern emergence.', category: 'organ', tier: 'architect' },

  // Layers
  { id: 'governance', name: 'GOVERNANCE', module: 'GOVERNANCE', description: 'Policy enforcement and compliance verification.', category: 'layer', tier: 'free' },
  { id: 'encode', name: 'ENCODE', module: 'ENCODE', description: 'Data transformation and encoding pipeline.', category: 'layer', tier: 'free' },
  { id: 'decode', name: 'DECODE', module: 'DECODE', description: 'Data extraction and parsing pipeline.', category: 'layer', tier: 'free' },
  { id: 'evolution', name: 'EVOLUTION', module: 'EVOLUTION', description: 'Self-patching and runtime evolution capabilities.', category: 'layer', tier: 'creator' },
];

const CATEGORY_COLORS: Record<string, string> = {
  engine: 'bg-primary/10 text-primary border-primary/20',
  agent: 'bg-[hsl(var(--neon-purple,270_100%_70%)/0.1)] text-[hsl(var(--neon-purple,270_100%_70%))] border-[hsl(var(--neon-purple,270_100%_70%)/0.2)]',
  organ: 'bg-[hsl(var(--neon-cyan,190_100%_60%)/0.1)] text-[hsl(var(--neon-cyan,190_100%_60%))] border-[hsl(var(--neon-cyan,190_100%_60%)/0.2)]',
  layer: 'bg-[hsl(var(--neon-amber,40_100%_60%)/0.1)] text-[hsl(var(--neon-amber,40_100%_60%))] border-[hsl(var(--neon-amber,40_100%_60%)/0.2)]',
};

const TIER_BADGE: Record<string, string> = {
  free: 'bg-green-500/10 text-green-500 border-green-500/20',
  creator: 'bg-primary/10 text-primary border-primary/20',
  architect: 'bg-[hsl(var(--neon-amber,40_100%_60%)/0.1)] text-[hsl(var(--neon-amber,40_100%_60%))] border-[hsl(var(--neon-amber,40_100%_60%)/0.2)]',
};

interface Props {
  hostName: string;
  onComplete: (result: ManaMergeResult) => void;
}

export function ManaMergePhase({ hostName, onComplete }: Props) {
  const [inputMode, setInputMode] = useState<'primitives' | 'upload'>('primitives');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergedSoftware, setMergedSoftware] = useState<MergedSoftware[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [pasteCode, setPasteCode] = useState('');
  const [pasteName, setPasteName] = useState('');
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCatalog = categoryFilter
    ? PRIMITIVE_CATALOG.filter(c => c.category === categoryFilter)
    : PRIMITIVE_CATALOG;

  const toggleCapability = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUploadFiles = useCallback(async () => {
    if (uploadFiles.length === 0) return;
    setParsing(true);
    try {
      const results: MergedSoftware[] = [];
      for (const file of uploadFiles) {
        const content = await file.text();
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const langMap: Record<string, string> = { ts: 'TypeScript', js: 'JavaScript', py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby', c: 'C', cpp: 'C++', cs: 'C#' };
        results.push({
          name: file.name,
          content,
          language: langMap[ext] || ext.toUpperCase(),
          source: 'upload',
        });
      }
      setMergedSoftware(prev => [...prev, ...results]);
      setUploadFiles([]);
    } finally {
      setParsing(false);
    }
  }, [uploadFiles]);

  const handlePasteAdd = () => {
    if (pasteCode.trim().length < 10) return;
    setMergedSoftware(prev => [...prev, {
      name: pasteName || 'pasted-code.ts',
      content: pasteCode,
      language: 'TypeScript',
      source: 'paste',
    }]);
    setPasteCode('');
    setPasteName('');
  };

  const removeMergedSoftware = (index: number) => {
    setMergedSoftware(prev => prev.filter((_, i) => i !== index));
  };

  const totalItems = selectedIds.size + mergedSoftware.length;
  const selectedCapabilities = PRIMITIVE_CATALOG.filter(c => selectedIds.has(c.id));

  const handleComplete = () => {
    onComplete({
      selectedCapabilities,
      mergedSoftware,
      totalMergedItems: totalItems,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Merge Software into Layer 2</h3>
        <p className="text-sm text-muted-foreground">
          Select substrate capabilities or upload open-source software to embed into Mana's Layer 2.
          {' '}This software ships <span className="font-semibold text-foreground">inside</span> the wrap around{' '}
          <span className="font-semibold text-foreground">{hostName}</span>.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Primitives', value: selectedIds.size },
          { label: 'Uploaded', value: mergedSoftware.length },
          { label: 'Total merged', value: totalItems },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'primitives' | 'upload')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primitives" className="gap-1.5 text-xs">
            <Cpu className="w-3.5 h-3.5" /> From Primitives
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload Software
          </TabsTrigger>
        </TabsList>

        {/* Primitives catalog */}
        <TabsContent value="primitives" className="mt-4 space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'engine', 'agent', 'organ', 'layer'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === 'all' ? null : cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all",
                  (cat === 'all' && !categoryFilter) || categoryFilter === cat
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-card/30 text-muted-foreground border-border/20 hover:border-border/40"
                )}
              >
                {cat === 'all' ? 'All' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Capability cards */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredCatalog.map(cap => {
                const isSelected = selectedIds.has(cap.id);
                return (
                  <motion.div
                    key={cap.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        "transition-all cursor-pointer",
                        isSelected
                          ? "border-primary/30 bg-primary/[0.03] shadow-sm"
                          : "border-border/20 bg-card/30 hover:border-border/40"
                      )}
                      onClick={() => toggleCapability(cap.id)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black",
                          isSelected ? "bg-primary/15 text-primary" : "bg-muted/15 text-muted-foreground"
                        )}>
                          {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">{cap.name}</p>
                            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", CATEGORY_COLORS[cap.category])}>
                              {cap.category}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", TIER_BADGE[cap.tier])}>
                              {cap.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{cap.description}</p>
                        </div>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleCapability(cap.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Upload software */}
        <TabsContent value="upload" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Upload open-source libraries, utilities, or custom code to merge into Layer 2.
            This software will be embedded inside the Mana wrap and deployed alongside the attachment.
          </p>

          {/* File upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
              uploadFiles.length > 0
                ? "border-primary/40 bg-primary/[0.03]"
                : "border-border/40 hover:border-border/60"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => e.target.files && setUploadFiles(Array.from(e.target.files))}
              className="hidden"
            />
            {uploadFiles.length > 0 ? (
              <>
                <FileCode2 className="w-7 h-7 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">{uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} ready</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadFiles.map(f => f.name).slice(0, 3).join(', ')}
                </p>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop open-source software here</p>
                <p className="text-xs text-muted-foreground mt-1">Libraries, utilities, SDKs — any language</p>
              </>
            )}
          </div>

          {uploadFiles.length > 0 && (
            <Button onClick={handleUploadFiles} disabled={parsing} className="w-full gap-2" variant="outline">
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {parsing ? 'Processing...' : `Add ${uploadFiles.length} file(s) to Layer 2`}
            </Button>
          )}

          {/* Paste code */}
          <div className="space-y-2 pt-2 border-t border-border/20">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Or paste code directly</p>
            <Input
              placeholder="filename.ts (optional)"
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Paste open-source code to merge into Layer 2..."
              value={pasteCode}
              onChange={(e) => setPasteCode(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            <Button
              onClick={handlePasteAdd}
              disabled={pasteCode.trim().length < 10}
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              Add to Layer 2
            </Button>
          </div>

          {/* Merged software list */}
          {mergedSoftware.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Merged software ({mergedSoftware.length})
              </p>
              {mergedSoftware.map((sw, i) => (
                <div
                  key={`${sw.name}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/[0.03] border border-primary/20"
                >
                  <FileCode2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sw.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {sw.language} · {(sw.content.length / 1024).toFixed(1)}KB · {sw.source}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMergedSoftware(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected capabilities summary */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCapabilities.map(cap => (
            <Badge
              key={cap.id}
              variant="outline"
              className={cn("gap-1 cursor-pointer hover:opacity-70", CATEGORY_COLORS[cap.category])}
              onClick={() => toggleCapability(cap.id)}
            >
              {cap.name}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      <Button
        onClick={handleComplete}
        className="w-full gap-2"
        size="lg"
      >
        <Package className="w-4 h-4" />
        {totalItems === 0
          ? 'Skip — Proceed Without Merge'
          : `Proceed with ${totalItems} merged item${totalItems > 1 ? 's' : ''}`
        }
      </Button>
    </div>
  );
}
