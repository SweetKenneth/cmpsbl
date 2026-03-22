/**
 * MemoriesExplorer — Composable Capabilities-style memory browser
 * Horizontal scroll carousels by category, search, mobile-friendly
 */

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Layers, Play, RefreshCw, ArrowRight, Bookmark,
  ChevronLeft, ChevronRight, Brain, Shield, Zap, Eye,
  Network, Settings, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { MeshSavedPipeline } from '@/lib/substrate/intent-mesh/pipelines';

// Category config matching the Composable Capabilities page style
const PIPELINE_CATEGORIES = [
  { id: 'security', label: 'Security', icon: Shield, text: 'text-neon-magenta', bg: 'bg-neon-magenta/10', border: 'border-neon-magenta/30' },
  { id: 'identity', label: 'Identity', icon: Eye, text: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30' },
  { id: 'intelligence', label: 'Intelligence', icon: Brain, text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/30' },
  { id: 'orchestration', label: 'Orchestration', icon: Network, text: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/30' },
  { id: 'enrichment', label: 'Enrichment', icon: Sparkles, text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' },
  { id: 'automation', label: 'Automation', icon: Settings, text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30' },
  { id: 'other', label: 'Other', icon: Layers, text: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-border/50' },
] as const;

function categorizePipeline(pipeline: MeshSavedPipeline): string {
  const domains = (pipeline.domains || []).map(d => d.toLowerCase());
  const intent = (pipeline.intent_type || '').toLowerCase();
  const name = (pipeline.name || '').toLowerCase();
  const all = [...domains, intent, name].join(' ');

  if (all.includes('security') || all.includes('defense') || all.includes('threat')) return 'security';
  if (all.includes('identity') || all.includes('actor') || all.includes('session') || all.includes('relay')) return 'identity';
  if (all.includes('brain') || all.includes('cortex') || all.includes('cognitive') || all.includes('learn') || all.includes('dream')) return 'intelligence';
  if (all.includes('nexus') || all.includes('orchestrat') || all.includes('mesh') || all.includes('federation')) return 'orchestration';
  if (all.includes('enrich') || all.includes('decode') || all.includes('vision') || all.includes('data')) return 'enrichment';
  if (all.includes('automat') || all.includes('modern') || all.includes('system') || all.includes('integration')) return 'automation';
  return 'other';
}

function HorizontalCarousel({ children, label, icon: Icon, catConfig }: {
  children: React.ReactNode[];
  label: string;
  icon: React.ElementType;
  catConfig: typeof PIPELINE_CATEGORIES[number];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (children.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', catConfig.bg, catConfig.border, 'border')}>
            <Icon className={cn('w-4 h-4', catConfig.text)} />
          </div>
          <h3 className="text-sm font-semibold">{label}</h3>
          <Badge variant="secondary" className="text-[10px]">{children.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => scroll('left')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => scroll('right')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {children}
      </div>
    </div>
  );
}

interface PipelinesExplorerProps {
  pipelines: MeshSavedPipeline[];
  enabled: boolean;
  onRunPipeline: (pipeline: MeshSavedPipeline) => void;
  runningPipeline: string | null;
}

export function PipelinesExplorer({ pipelines, enabled, onRunPipeline, runningPipeline }: PipelinesExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return pipelines.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.source_module || '').toLowerCase().includes(q) ||
        (p.intent_type || '').toLowerCase().includes(q) ||
        (p.resolver_chain || []).some(r => r.toLowerCase().includes(q)) ||
        (p.domains || []).some(d => d.toLowerCase().includes(q));
      const matchesCat = !selectedCategory || categorizePipeline(p) === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [pipelines, search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, MeshSavedPipeline[]> = {};
    filtered.forEach(p => {
      const cat = categorizePipeline(p);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filtered]);

  const activeCats = PIPELINE_CATEGORIES.filter(c => grouped[c.id]?.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-neon-cyan/20 bg-neon-cyan/5">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Layers className="w-5 h-5 text-neon-cyan shrink-0" />
              <div>
                <p className="text-sm font-medium">Crystallized Memories</p>
                <p className="text-xs text-muted-foreground">
                  {pipelines.length} saved resolver chains • Searchable by module, domain, or intent
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs self-start sm:self-center">
              {filtered.length} of {pipelines.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search + category filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search memories by name, module, domain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All ({pipelines.length})
          </Button>
          {PIPELINE_CATEGORIES.map(cat => {
            const count = pipelines.filter(p => categorizePipeline(p) === cat.id).length;
            if (count === 0) return null;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className="text-xs gap-1.5"
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card className="border border-border/30 bg-muted/10">
          <CardContent className="py-12 text-center">
            <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {pipelines.length === 0
                ? 'No saved memories yet. Approve proposals or save receipts from the Live view.'
                : 'No memories match your search.'}
            </p>
            {search && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSearch('')}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category carousels */}
      {selectedCategory ? (
        // When a category is selected, show as a grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((pipeline, i) => (
              <PipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                enabled={enabled}
                onRun={onRunPipeline}
                running={runningPipeline === pipeline.id}
                index={i}
                category={categorizePipeline(pipeline)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // When no category is selected, show horizontal carousels per category
        <div className="space-y-8">
          {activeCats.map(cat => (
            <HorizontalCarousel key={cat.id} label={cat.label} icon={cat.icon} catConfig={cat}>
              {(grouped[cat.id] || []).map((pipeline, i) => (
                <div key={pipeline.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                  <PipelineCard
                    pipeline={pipeline}
                    enabled={enabled}
                    onRun={onRunPipeline}
                    running={runningPipeline === pipeline.id}
                    index={i}
                    category={cat.id}
                  />
                </div>
              ))}
            </HorizontalCarousel>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineCard({ pipeline, enabled, onRun, running, index, category }: {
  pipeline: MeshSavedPipeline;
  enabled: boolean;
  onRun: (p: MeshSavedPipeline) => void;
  running: boolean;
  index: number;
  category: string;
}) {
  const catConfig = PIPELINE_CATEGORIES.find(c => c.id === category) || PIPELINE_CATEGORIES[PIPELINE_CATEGORIES.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={cn(
        "border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all h-full",
        catConfig.border,
      )}>
        <CardContent className="p-4 space-y-3 flex flex-col h-full">
          {/* Category + status */}
          <div className="flex items-center justify-between gap-2">
            <Badge className={cn('text-[10px] border', catConfig.bg, catConfig.text, catConfig.border)}>
              <catConfig.icon className="w-3 h-3 mr-1" />
              {catConfig.label}
            </Badge>
            <Badge variant={pipeline.is_active ? 'default' : 'secondary'} className="text-[9px]">
              {pipeline.is_active ? 'active' : 'inactive'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold leading-tight line-clamp-2">{pipeline.name}</h3>

          {/* Description */}
          {pipeline.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{pipeline.description}</p>
          )}

          {/* Resolver chain */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[9px] font-bold">{pipeline.source_module}</Badge>
            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
            {(pipeline.resolver_chain || []).slice(0, 3).map((r: string) => (
              <Badge key={r} variant="secondary" className="text-[9px] truncate max-w-[100px]">{r.split('.').pop()}</Badge>
            ))}
            {(pipeline.resolver_chain || []).length > 3 && (
              <Badge variant="secondary" className="text-[9px]">+{(pipeline.resolver_chain || []).length - 3}</Badge>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/20">
            <span className="capitalize">{pipeline.governance_mode} • {pipeline.intent_type}</span>
            <span>{pipeline.run_count || 0} runs</span>
          </div>

          {/* Run button */}
          <Button
            size="sm"
            className="w-full gap-2 mt-auto"
            onClick={() => onRun(pipeline)}
            disabled={running || !enabled}
          >
            {running ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Replay Memory
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
