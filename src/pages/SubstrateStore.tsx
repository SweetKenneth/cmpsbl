/**
 * Substrate Store — Unified FREE Resource Hub
 * Supreme × Canva inspired layout — Category-first, horizontal-scroll mobile UX
 * Combines: Capabilities (400+), Templates (200+), Pipelines (200+)
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useMetric } from '@/stores/publicMetricsStore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  Search, Zap, Brain, Shield, Settings, Layers, Eye,
  TrendingUp, Package, Code, Copy, Check, ArrowRight,
  ChevronRight, ChevronLeft, Cpu, Clock, Terminal,
  Sparkles, Workflow, Network, Accessibility, Filter,
  Unlock, Play, Moon, MessageSquare, X,
} from 'lucide-react';

import {
  filterCapabilities,
  getCategoryStats,
  getTotalCapabilityCount,
  type CapabilityCategory,
  type CapabilityArtifact,
} from '@/lib/capabilities/depot';
import { ALL_TEMPLATES, type Template } from '@/data/templates';
import { SYNERGY_DEFINITIONS } from '@/lib/capabilities/synergies/registry';

// ─── Product Type ───
type ProductType = 'all' | 'capabilities' | 'templates' | 'pipelines';
type UnifiedItem = 
  | { type: 'capability'; data: CapabilityArtifact }
  | { type: 'template'; data: Template }
  | { type: 'pipeline'; data: typeof SYNERGY_DEFINITIONS[0] };

// ─── Category System (unified across all 3 product types) ───
const UNIFIED_CATEGORIES = [
  { id: 'intelligence', label: 'Intelligence', icon: Brain, color: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'security', label: 'Security', icon: Shield, color: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'optimization', label: 'Optimization', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'automation', label: 'Automation', icon: Settings, color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'resilience', label: 'Resilience', icon: Zap, color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'orchestration', label: 'Orchestration', icon: Layers, color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
] as const;

// Map template categories to unified categories
function mapTemplateCat(cat: string): string {
  const map: Record<string, string> = {
    brain: 'intelligence', decode: 'intelligence', dream: 'intelligence',
    defense: 'security', nexus: 'automation', vision: 'optimization',
    system: 'automation', world_engine: 'orchestration',
  };
  return map[cat] || 'automation';
}

// ─── Horizontal Scroll Carousel ───
function ScrollCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.7;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={cn("group relative", className)}>
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div 
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Unified Item Card ───
function ItemCard({ item, onSelect }: { item: UnifiedItem; onSelect: () => void }) {
  const typeLabel = item.type === 'capability' ? 'Capability' : item.type === 'template' ? 'Template' : 'Pipeline';
  const typeColor = item.type === 'capability' 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
    : item.type === 'template' 
    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
    : 'bg-violet-500/10 text-violet-400 border-violet-500/30';
  
  const name = item.type === 'capability' ? item.data.name 
    : item.type === 'template' ? item.data.name 
    : item.data.name;
    
  const desc = item.type === 'capability' ? item.data.description
    : item.type === 'template' ? item.data.description
    : item.data.description;

  return (
    <motion.div
      layout
      className={cn(
        "snap-start shrink-0 w-[280px] min-h-[180px]",
        "rounded-xl border border-border bg-card",
        "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer",
        "flex flex-col overflow-hidden"
      )}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top accent bar */}
      <div className={cn(
        "h-1 w-full",
        item.type === 'capability' ? 'bg-emerald-500' : item.type === 'template' ? 'bg-cyan-500' : 'bg-violet-500'
      )} />
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Type + FREE badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={cn("text-[10px]", typeColor)}>
            {typeLabel}
          </Badge>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
            <Unlock className="w-2.5 h-2.5" /> FREE
          </span>
        </div>
        
        {/* Name */}
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-primary">
          {name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {desc}
        </p>
        
        {/* Footer meta */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          {item.type === 'capability' && (
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {(item.data as CapabilityArtifact).executorType}
            </span>
          )}
          {item.type === 'template' && (
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              {(item.data as Template).difficulty}
            </span>
          )}
          {item.type === 'pipeline' && (
            <span className="flex items-center gap-1">
              <Workflow className="w-3 h-3" />
              {(item.data as typeof SYNERGY_DEFINITIONS[0]).modules.length} modules
            </span>
          )}
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Sheet (Supreme drop-style) ───
function DetailSheet({ item, onClose }: { item: UnifiedItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const name = item.type === 'capability' ? item.data.name : item.type === 'template' ? item.data.name : item.data.name;
  const desc = item.type === 'capability' ? item.data.description : item.type === 'template' ? item.data.description : item.data.description;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className={cn(
                "text-xs mb-2",
                item.type === 'capability' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                item.type === 'template' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                'bg-violet-500/10 text-violet-400 border-violet-500/30'
              )}>
                {item.type === 'capability' ? 'Capability' : item.type === 'template' ? 'Template' : 'Pipeline'}
              </Badge>
              <h2 className="text-2xl font-black">{name}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground">{desc}</p>
        </div>
        
        {/* Content based on type */}
        <div className="px-6 pb-6 space-y-4">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {item.type === 'capability' && (
              <>
                <Badge variant="outline" className="text-xs">
                  <Cpu className="w-3 h-3 mr-1" />
                  {(item.data as CapabilityArtifact).executorType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{(item.data as CapabilityArtifact).version}
                </Badge>
                {(item.data as CapabilityArtifact).requiredModules.map(m => (
                  <Badge key={m} variant="outline" className="text-xs bg-primary/5">
                    {m}
                  </Badge>
                ))}
              </>
            )}
            {item.type === 'template' && (
              <>
                <Badge variant="outline" className="text-xs capitalize">
                  {(item.data as Template).difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {(item.data as Template).estimatedTime}
                </Badge>
                {(item.data as Template).features.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                    {f}
                  </Badge>
                ))}
              </>
            )}
            {item.type === 'pipeline' && (
              <>
                <Badge variant="outline" className="text-xs capitalize">
                  {(item.data as typeof SYNERGY_DEFINITIONS[0]).category}
                </Badge>
                {(item.data as typeof SYNERGY_DEFINITIONS[0]).modules.map(m => (
                  <Badge key={m.name} variant="outline" className={cn("text-xs", m.required ? 'bg-primary/5' : 'opacity-60')}>
                    {m.name} {m.role === 'primary' && <Sparkles className="w-2.5 h-2.5 ml-0.5 inline" />}
                  </Badge>
                ))}
              </>
            )}
          </div>
          
          {/* Code snippet */}
          {item.type === 'template' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-cyan-400" /> Code
                </span>
                <Button variant="secondary" size="sm" className="h-7 text-xs gap-1" onClick={() => copyCode((item.data as Template).code)}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted/80 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto border border-border/50">
                <code>{(item.data as Template).code}</code>
              </pre>
            </div>
          )}
          
          {item.type === 'pipeline' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-violet-400" /> Run
                </span>
                <Button variant="secondary" size="sm" className="h-7 text-xs gap-1" onClick={() => copyCode(`synergy.run ${(item.data as typeof SYNERGY_DEFINITIONS[0]).id} --input '{"query": "your input"}'`)}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted/80 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-border/50">
                <code>synergy.run {(item.data as typeof SYNERGY_DEFINITIONS[0]).id} --input '{`{"query": "your input"}`}'</code>
              </pre>
            </div>
          )}
          
          {item.type === 'capability' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Usage
                </span>
                <Button variant="secondary" size="sm" className="h-7 text-xs gap-1" onClick={() => copyCode(`substrate.run ${(item.data as CapabilityArtifact).id} --input "your input"`)}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted/80 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-border/50">
                <code>{`substrate.run ${(item.data as CapabilityArtifact).id} --input "your input"`}</code>
              </pre>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button size="sm" className="gap-2 flex-1" asChild>
              <Link to="/os">
                <Play className="w-3.5 h-3.5" />
                Try in Terminal
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/codelab">
                <Code className="w-3.5 h-3.5" />
                CodeLab
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Store Page ───
export default function SubstrateStore() {
  const [productType, setProductType] = useState<ProductType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [viewMode, setViewMode] = useState<'browse' | 'grid'>('browse');
  
  const capCount = useMetric('capabilitiesCount');
  const pipeCount = useMetric('synergyPipelinesCount');
  
  // Build unified items list
  const allItems = useMemo((): UnifiedItem[] => {
    const caps: UnifiedItem[] = filterCapabilities({}).map(c => ({ type: 'capability' as const, data: c }));
    const temps: UnifiedItem[] = ALL_TEMPLATES.map(t => ({ type: 'template' as const, data: t }));
    const pipes: UnifiedItem[] = SYNERGY_DEFINITIONS.map(p => ({ type: 'pipeline' as const, data: p }));
    return [...caps, ...temps, ...pipes];
  }, []);
  
  // Filter by product type, category, and search
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Product type
      if (productType === 'capabilities' && item.type !== 'capability') return false;
      if (productType === 'templates' && item.type !== 'template') return false;
      if (productType === 'pipelines' && item.type !== 'pipeline') return false;
      
      // Category
      if (selectedCategory) {
        if (item.type === 'capability' && item.data.category !== selectedCategory) return false;
        if (item.type === 'template' && mapTemplateCat(item.data.category) !== selectedCategory) return false;
        if (item.type === 'pipeline' && item.data.category !== selectedCategory) return false;
      }
      
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = item.type === 'capability' ? item.data.name : item.type === 'template' ? item.data.name : item.data.name;
        const desc = item.type === 'capability' ? item.data.description : item.type === 'template' ? item.data.description : item.data.description;
        if (!name.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) return false;
      }
      
      return true;
    });
  }, [allItems, productType, selectedCategory, searchQuery]);
  
  // Group by category for browse mode
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, UnifiedItem[]> = {};
    filteredItems.forEach(item => {
      let cat = 'automation';
      if (item.type === 'capability') cat = item.data.category;
      else if (item.type === 'template') cat = mapTemplateCat(item.data.category);
      else if (item.type === 'pipeline') cat = item.data.category;
      
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  const totalCount = allItems.length;

  return (
    <>
      <Helmet>
        <title>{`Substrate Store | ${totalCount}+ Free Resources | CMPSBL`}</title>
        <meta name="description" content={`Explore ${totalCount}+ free capabilities, templates, and pipelines. All unlocked. No signup required.`} />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />
        
        {/* ═══ HERO — Supreme drop announcement style ═══ */}
        <section className="relative overflow-hidden border-b border-border/50">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          
          <div className="relative container mx-auto px-4 py-14 md:py-20 text-center">
            {/* Supreme-style stacked type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 mb-6 text-xs font-medium text-muted-foreground">
                <Unlock className="w-3 h-3 text-emerald-400" />
                EVERYTHING FREE — NO SIGNUP
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4">
                <span className="block">SUBSTRATE</span>
                <span className="block bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan))] to-primary bg-clip-text text-transparent">
                  STORE
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                {totalCount}+ capabilities, templates, and pipelines. 
                All free. Copy the code. Build something.
              </p>
              
              {/* Stats pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: 'Capabilities', count: String(capCount), color: 'bg-emerald-500' },
                  { label: 'Templates', count: String(ALL_TEMPLATES.length), color: 'bg-cyan-500' },
                  { label: 'Pipelines', count: String(pipeCount), color: 'bg-violet-500' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    <div className={cn("w-2 h-2 rounded-full", stat.color)} />
                    <span className="font-black text-lg">{stat.count}+</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* ═══ STICKY TOOLBAR ═══ */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search all resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Product type tabs + view toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {([
                  { id: 'all' as const, label: 'All', count: totalCount },
                  { id: 'capabilities' as const, label: 'Capabilities', count: capCount },
                  { id: 'templates' as const, label: 'Templates', count: ALL_TEMPLATES.length },
                  { id: 'pipelines' as const, label: 'Pipelines', count: pipeCount },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProductType(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      productType === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>
              
              {/* View toggle */}
              <div className="hidden md:flex gap-1 shrink-0">
                <button
                  onClick={() => setViewMode('browse')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'browse' ? 'bg-muted' : 'hover:bg-muted/50')}
                  title="Category browse"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50')}
                  title="Grid view"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Category pills — horizontal scroll */}
          <div className="border-t border-border/30">
            <div className="container mx-auto px-4 py-2.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pr-8" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                    !selectedCategory 
                      ? "bg-foreground text-background border-foreground" 
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  All Categories
                </button>
                {UNIFIED_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                        selectedCategory === cat.id
                          ? cn(cat.bg, cat.text, cat.border)
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTENT ═══ */}
        <main className="flex-1">
          {/* Results count */}
          <div className="container mx-auto px-4 pt-6 pb-2">
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} resources
              {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
            </p>
          </div>
          
          {/* Browse Mode: Horizontal carousels per category (mobile-first) */}
          {(viewMode === 'browse' && !searchQuery) ? (
            <div className="pb-12">
              {UNIFIED_CATEGORIES.filter(cat => groupedByCategory[cat.id]?.length).map(cat => {
                const items = groupedByCategory[cat.id] || [];
                const Icon = cat.icon;
                
                return (
                  <section key={cat.id} className="mb-8">
                    {/* Category header */}
                    <div className="container mx-auto px-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.bg)}>
                            <Icon className={cn("w-4 h-4", cat.text)} />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg">{cat.label}</h2>
                            <p className="text-xs text-muted-foreground">{items.length} resources</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedCategory(cat.id); setViewMode('grid'); }}
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Horizontal scroll carousel */}
                    <div className="container mx-auto px-4">
                      <ScrollCarousel>
                        {items.slice(0, 20).map((item, i) => (
                          <ItemCard 
                            key={`${item.type}-${i}`}
                            item={item} 
                            onSelect={() => setSelectedItem(item)} 
                          />
                        ))}
                        {items.length > 20 && (
                          <div 
                            className="snap-start shrink-0 w-[200px] rounded-xl border border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors"
                            onClick={() => { setSelectedCategory(cat.id); setViewMode('grid'); }}
                          >
                            <div className="text-center p-4">
                              <p className="font-bold text-lg text-primary">+{items.length - 20}</p>
                              <p className="text-xs text-muted-foreground">View all</p>
                            </div>
                          </div>
                        )}
                      </ScrollCarousel>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Grid Mode: Dense masonry-style grid */
            <div className="container mx-auto px-4 py-6">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item, i) => (
                    <ItemCard 
                      key={`${item.type}-${i}`}
                      item={item} 
                      onSelect={() => setSelectedItem(item)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setProductType('all'); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Engine CTA */}
          <section className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-4 py-12 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Need Production Power?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Everything here is free. For saved, governed orchestration with persistence and SLAs → Engines.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/engines">
                    <Zap className="w-4 h-4" />
                    Engine Marketplace
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <Link to="/os">
                    <Terminal className="w-4 h-4" />
                    Open Terminal
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        
        <EnhancedFooter />
      </div>
      
      {/* Detail Sheet */}
      <AnimatePresence>
        {selectedItem && (
          <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
