/**
 * Engines Tab
 * Interactive Engine & Meta-Engine execution interface
 * 
 * Provides a visual interface for:
 * - Browsing 62 engines across 18 categories
 * - Executing engines with input parameters
 * - Browsing 20 meta-engines with compound synergies
 * - Viewing execution history and results
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Zap, Play, ChevronRight, Search, Filter, Layers,
  Activity, Shield, Brain, Sparkles, Eye, Clock, CheckCircle2,
  AlertCircle, Loader2, BarChart3, RefreshCw, Workflow
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEngines } from '@/lib/substrate/engines/useEngines';
import { useMetaEngines } from '@/lib/substrate/engines/meta/useMetaEngines';
import type { EngineDefinition, EngineCategory, EngineExecutionResult } from '@/lib/substrate/engines/types';
import type { MetaEngineDefinition, MetaEngineExecutionResult } from '@/lib/substrate/engines/meta/types';

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  cognitive: { icon: Brain, color: 'text-neon-purple', bgColor: 'bg-neon-purple/20 border-neon-purple/40' },
  operational: { icon: Cpu, color: 'text-neon-blue', bgColor: 'bg-neon-blue/20 border-neon-blue/40' },
  intelligence: { icon: Sparkles, color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20 border-neon-cyan/40' },
  governance: { icon: Shield, color: 'text-neon-amber', bgColor: 'bg-neon-amber/20 border-neon-amber/40' },
  security: { icon: Shield, color: 'text-destructive', bgColor: 'bg-destructive/20 border-destructive/40' },
  evolution: { icon: RefreshCw, color: 'text-neon-magenta', bgColor: 'bg-neon-magenta/20 border-neon-magenta/40' },
  communication: { icon: Activity, color: 'text-neon-green', bgColor: 'bg-neon-green/20 border-neon-green/40' },
  integration: { icon: Workflow, color: 'text-neon-amber', bgColor: 'bg-neon-amber/20 border-neon-amber/40' },
  analytics: { icon: BarChart3, color: 'text-primary', bgColor: 'bg-primary/20 border-primary/40' },
  experience: { icon: Eye, color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20 border-neon-cyan/40' },
  knowledge: { icon: Brain, color: 'text-neon-purple', bgColor: 'bg-neon-purple/20 border-neon-purple/40' },
  autonomy: { icon: Zap, color: 'text-neon-amber', bgColor: 'bg-neon-amber/20 border-neon-amber/40' },
  creativity: { icon: Sparkles, color: 'text-neon-magenta', bgColor: 'bg-neon-magenta/20 border-neon-magenta/40' },
  perception: { icon: Eye, color: 'text-sky-400', bgColor: 'bg-sky-500/20 border-sky-500/40' },
  resource: { icon: BarChart3, color: 'text-lime-400', bgColor: 'bg-lime-500/20 border-lime-500/40' },
  workflow: { icon: Workflow, color: 'text-neon-magenta', bgColor: 'bg-neon-magenta/20 border-neon-magenta/40' },
  enhancement: { icon: Zap, color: 'text-neon-green', bgColor: 'bg-neon-green/20 border-neon-green/40' },
  orchestration: { icon: Layers, color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20 border-neon-cyan/40' },
};

// Engine Card Component
function EngineCard({ 
  engine, 
  onExecute, 
  isExecuting 
}: { 
  engine: EngineDefinition; 
  onExecute: (engine: EngineDefinition) => void;
  isExecuting: boolean;
}) {
  const config = CATEGORY_CONFIG[engine.category] || CATEGORY_CONFIG.cognitive;
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={cn(
        "border transition-all cursor-pointer hover:shadow-lg",
        "bg-muted/10 backdrop-blur-xl hover:bg-muted/20",
        config.bgColor.replace('bg-', 'hover:border-').replace('/20', '/60')
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center", config.bgColor)}>
              <Icon className={cn("w-4 h-4", config.color)} />
            </div>
            <Badge variant="outline" className={cn("text-[10px]", config.color)}>
              {engine.synergyMultiplier}x
            </Badge>
          </div>
          
          <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {engine.name}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
            {engine.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-mono">{engine.capabilities.length} caps</span>
              <span>•</span>
              <span className="font-mono">{engine.averageLatencyMs}ms</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onExecute(engine);
              }}
              disabled={isExecuting}
              className={cn(
                "h-7 px-2 text-xs gap-1",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                config.color
              )}
            >
              {isExecuting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Run
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Meta-Engine Card Component
function MetaEngineCard({ 
  metaEngine, 
  onExecute, 
  isExecuting 
}: { 
  metaEngine: MetaEngineDefinition; 
  onExecute: (me: MetaEngineDefinition) => void;
  isExecuting: boolean;
}) {
  const config = CATEGORY_CONFIG[metaEngine.category] || CATEGORY_CONFIG.cognitive;
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={cn(
        "border transition-all cursor-pointer hover:shadow-lg",
        "bg-gradient-to-br from-muted/20 via-muted/10 to-transparent backdrop-blur-xl",
        "hover:from-muted/30 hover:via-muted/20",
        config.bgColor.replace('bg-', 'border-').replace('/20', '/40')
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", config.bgColor)}>
              <Layers className={cn("w-5 h-5", config.color)} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={cn("text-[10px] font-bold", config.color)}>
                {metaEngine.compoundSynergyMultiplier}x synergy
              </Badge>
              <Badge variant="outline" className="text-[9px] text-muted-foreground">
                {metaEngine.engines.length} engines
              </Badge>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-foreground mb-1">
            {metaEngine.name}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
            {metaEngine.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {metaEngine.engines.slice(0, 3).map(engineId => (
              <Badge key={engineId} variant="secondary" className="text-[9px] h-5">
                {engineId.replace(/_engine$/, '')}
              </Badge>
            ))}
            {metaEngine.engines.length > 3 && (
              <Badge variant="secondary" className="text-[9px] h-5">
                +{metaEngine.engines.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-mono">{metaEngine.totalCapabilities} caps</span>
              <span>•</span>
              <Badge variant="outline" className="text-[9px] h-4">
                {metaEngine.enterpriseValue}
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExecute(metaEngine);
              }}
              disabled={isExecuting}
              className={cn(
                "h-7 px-3 text-xs gap-1",
                "bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90"
              )}
            >
              {isExecuting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Execution Result Display
function ExecutionResultCard({ 
  result, 
  type 
}: { 
  result: EngineExecutionResult | MetaEngineExecutionResult; 
  type: 'engine' | 'meta' 
}) {
  const isSuccess = result.success;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-xl border p-4",
        isSuccess 
          ? "bg-neon-green/10 border-neon-green/30" 
          : "bg-destructive/10 border-destructive/30"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-neon-green" />
        ) : (
          <AlertCircle className="w-5 h-5 text-destructive" />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {type === 'meta' 
              ? (result as MetaEngineExecutionResult).metaEngineId 
              : (result as EngineExecutionResult).engineId}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {new Date(result.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/20 p-2">
          <p className="text-muted-foreground">Duration</p>
          <p className="font-mono text-foreground">
            {type === 'meta' 
              ? (result as MetaEngineExecutionResult).totalDurationMs 
              : (result as EngineExecutionResult).totalDurationMs}ms
          </p>
        </div>
        <div className="rounded-lg bg-muted/20 p-2">
          <p className="text-muted-foreground">Synergy</p>
          <p className="font-mono text-foreground">
            {type === 'meta' 
              ? (result as MetaEngineExecutionResult).compoundSynergyGain 
              : (result as EngineExecutionResult).synergyGain}x
          </p>
        </div>
        {type === 'meta' && (
          <>
            <div className="rounded-lg bg-muted/20 p-2">
              <p className="text-muted-foreground">Engines</p>
              <p className="font-mono text-foreground">
                {(result as MetaEngineExecutionResult).enginesExecuted}
              </p>
            </div>
            <div className="rounded-lg bg-muted/20 p-2">
              <p className="text-muted-foreground">Capabilities</p>
              <p className="font-mono text-foreground">
                {(result as MetaEngineExecutionResult).capabilitiesOrchestrated}
              </p>
            </div>
          </>
        )}
      </div>
      
      {result.error && (
        <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive font-mono">{result.error}</p>
        </div>
      )}
    </motion.div>
  );
}

// Main Engines Tab Component
export function EnginesTab({ enabled = true }: { enabled?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'engines' | 'meta'>('engines');
  const [selectedEngine, setSelectedEngine] = useState<EngineDefinition | null>(null);
  const [selectedMetaEngine, setSelectedMetaEngine] = useState<MetaEngineDefinition | null>(null);
  const [inputJson, setInputJson] = useState('{}');
  
  const { 
    engines, 
    summary: engineSummary, 
    execute: executeEngine, 
    isExecuting: engineExecuting,
    executionHistory: engineHistory 
  } = useEngines();
  
  const { 
    metaEngines, 
    summary: metaSummary, 
    execute: executeMetaEngine, 
    isExecuting: metaExecuting,
    executionHistory: metaHistory 
  } = useMetaEngines();
  
  // Get unique categories
  const engineCategories = useMemo(() => {
    const cats = new Set(engines.map(e => e.category));
    return ['all', ...Array.from(cats)];
  }, [engines]);
  
  const metaCategories = useMemo(() => {
    const cats = new Set(metaEngines.map(e => e.category));
    return ['all', ...Array.from(cats)];
  }, [metaEngines]);
  
  // Filter engines
  const filteredEngines = useMemo(() => {
    return engines.filter(engine => {
      const matchesSearch = searchQuery === '' || 
        engine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engine.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || engine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [engines, searchQuery, selectedCategory]);
  
  // Filter meta-engines
  const filteredMetaEngines = useMemo(() => {
    return metaEngines.filter(me => {
      const matchesSearch = searchQuery === '' || 
        me.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        me.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || me.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [metaEngines, searchQuery, selectedCategory]);
  
  // Execute engine
  const handleExecuteEngine = async (engine: EngineDefinition) => {
    setSelectedEngine(engine);
    try {
      const input = JSON.parse(inputJson);
      const result = await executeEngine(engine.id, input);
      if (result.success) {
        toast.success(`${engine.name} executed successfully`, {
          description: `Synergy: ${result.synergyGain}x • Duration: ${result.totalDurationMs}ms`
        });
      } else {
        toast.error(`${engine.name} failed`, { description: result.error });
      }
    } catch (err) {
      toast.error('Invalid JSON input');
    }
  };
  
  // Execute meta-engine
  const handleExecuteMetaEngine = async (metaEngine: MetaEngineDefinition) => {
    setSelectedMetaEngine(metaEngine);
    try {
      const input = JSON.parse(inputJson);
      const result = await executeMetaEngine(metaEngine.id, input);
      if (result.success) {
        toast.success(`${metaEngine.name} executed successfully`, {
          description: `Compound Synergy: ${result.compoundSynergyGain}x • ${result.enginesExecuted} engines`
        });
      } else {
        toast.error(`${metaEngine.name} failed`, { description: result.error });
      }
    } catch (err) {
      toast.error('Invalid JSON input');
    }
  };
  
  const isExecuting = engineExecuting || metaExecuting;
  const categories = activeSubTab === 'engines' ? engineCategories : metaCategories;
  const history = activeSubTab === 'engines' ? engineHistory : metaHistory;

  return (
    <motion.main
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/40 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Cognitive Engines</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {engineSummary.totalEngines} engines • {metaSummary.totalMetaEngines} meta-engines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10">
            {engineSummary.totalCapabilitiesOrchestrated} capabilities
          </Badge>
          <Badge variant="outline" className="text-[10px] border-neon-magenta/40 text-neon-magenta bg-neon-magenta/10">
            {metaSummary.averageCompoundSynergy.toFixed(1)}x avg synergy
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-muted/30 border border-border/30 w-fit mb-6">
        <button
          onClick={() => { setActiveSubTab('engines'); setSelectedCategory('all'); }}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeSubTab === 'engines'
              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Cpu className="w-4 h-4" />
          Engines ({engines.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('meta'); setSelectedCategory('all'); }}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeSubTab === 'meta'
              ? "bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Layers className="w-4 h-4" />
          Meta-Engines ({metaEngines.length})
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Panel - Browse */}
        <div className="lg:col-span-3 space-y-4 order-1 min-w-0">
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeSubTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/10 border-border/50"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 pb-2 w-max">
              {categories.map(cat => {
                const config = CATEGORY_CONFIG[cat] || { color: 'text-muted-foreground' };
                return (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "text-xs capitalize whitespace-nowrap",
                      selectedCategory === cat && cat !== 'all' && config.color
                    )}
                  >
                    {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Engine/Meta-Engine Grid */}
          <ScrollArea className="h-[400px] sm:h-[600px]">
            <AnimatePresence mode="wait">
              {activeSubTab === 'engines' ? (
                <motion.div
                  key="engines"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pr-4"
                >
                  {filteredEngines.map(engine => (
                    <EngineCard
                      key={engine.id}
                      engine={engine}
                      onExecute={handleExecuteEngine}
                      isExecuting={isExecuting && selectedEngine?.id === engine.id}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="meta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pr-4"
                >
                  {filteredMetaEngines.map(me => (
                    <MetaEngineCard
                      key={me.id}
                      metaEngine={me}
                      onExecute={handleExecuteMetaEngine}
                      isExecuting={isExecuting && selectedMetaEngine?.id === me.id}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        {/* Right Panel - Execution & History */}
        <div className="space-y-4 order-2">
          {/* Input Panel */}
          <Card className="border border-border/50 bg-muted/10 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-amber" />
                Execution Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder='{"key": "value"}'
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="font-mono text-xs h-24 bg-muted/20 border-border/50"
              />
              <p className="text-[10px] text-muted-foreground">
                JSON input passed to engine execution context
              </p>
            </CardContent>
          </Card>
          
          {/* Execution History */}
          <Card className="border border-border/50 bg-muted/10 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-cyan" />
                Recent Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-2">
                  {history.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No executions yet</p>
                      <p className="text-[10px] text-muted-foreground/70">Run an engine to see results</p>
                    </div>
                  ) : (
                    history.slice().reverse().map((result, idx) => (
                      <ExecutionResultCard 
                        key={idx} 
                        result={result} 
                        type={activeSubTab === 'engines' ? 'engine' : 'meta'} 
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Stats */}
          <Card className="border border-border/50 bg-muted/10 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-lg font-bold text-foreground">
                    {activeSubTab === 'engines' ? engineSummary.totalEngines : metaSummary.totalMetaEngines}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeSubTab === 'engines' ? 'Engines' : 'Meta-Engines'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-lg font-bold text-foreground">
                    {activeSubTab === 'engines' 
                      ? `${engineSummary.averageSynergyMultiplier?.toFixed(1) || '2.5'}x`
                      : `${metaSummary.averageCompoundSynergy.toFixed(1)}x`
                    }
                  </p>
                  <p className="text-[10px] text-muted-foreground">Avg Synergy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.main>
  );
}

export default EnginesTab;
