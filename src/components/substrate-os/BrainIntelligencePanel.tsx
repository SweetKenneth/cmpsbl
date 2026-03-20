/**
 * Brain Intelligence Panel v10.5.4 ARCHITECT — Advanced cognitive controls
 * Deep thinking, curiosity engine, learning patterns
 */

import { useState, memo } from 'react';
import { Brain, Sparkles, Network, TrendingUp, Lightbulb, Loader2, CheckCircle2, AlertCircle, Zap, Activity, ChevronDown, Layers, Trash2, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLiveCuriosityLog, useLiveLearningPatterns, useLiveReflections } from '@/hooks/useSubstrateOSLive';
import { useBrainOptimize, useBrainDeepThink, useBrainCognitiveCycle, useBrainExplore, useBrainGraphBuild, useBrainTiering, useBrainPrune, useBrainBatchTiering } from '@/hooks/useSubstrateOSEnhanced';

interface BrainIntelligencePanelProps {
  enabled: boolean;
}

// Helper to extract clean text from various data formats
function extractReadableText(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  
  // Handle nested objects with common patterns
  if (typeof data === 'object') {
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => extractReadableText(item)).filter(Boolean).join('\n');
    }
    
    // Extract meaningful text from common nested structures
    const textParts: string[] = [];
    
    // Look for insight-like fields
    if (data.action) textParts.push(data.action);
    if (data.finding) textParts.push(`Finding: ${data.finding}`);
    if (data.adjustment) textParts.push(`Adjustment: ${data.adjustment}`);
    if (data.insight) textParts.push(data.insight);
    if (data.recommendation) textParts.push(data.recommendation);
    if (data.content) textParts.push(data.content);
    if (data.text) textParts.push(data.text);
    if (data.description) textParts.push(data.description);
    
    // Handle nested insights array
    if (data.insights && Array.isArray(data.insights)) {
      textParts.push(...data.insights.map((i: any) => extractReadableText(i)));
    }
    
    // Handle metrics object - format nicely
    if (data.metrics) {
      const metricLines: string[] = [];
      Object.entries(data.metrics).forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/avg /gi, '').trim();
        const displayValue = typeof value === 'number' && !isNaN(value) 
          ? `${(value * 100).toFixed(0)}%` 
          : value === 'NaN%' || (typeof value === 'number' && isNaN(value))
            ? 'Not measured'
            : String(value);
        metricLines.push(`• ${label}: ${displayValue}`);
      });
      if (metricLines.length) textParts.push('Metrics:\n' + metricLines.join('\n'));
    }
    
    if (textParts.length > 0) {
      return textParts.filter(Boolean).join('\n\n');
    }
  }
  
  return '';
}

// Helper to render markdown-like text with bold support
function FormattedText({ text, className }: { text: string; className?: string }) {
  // Parse **bold** and ##BOLD## patterns
  const parts = text.split(/(\*\*[^*]+\*\*|##[^#]+##)/g);
  
  return (
    <span className={className}>
      {parts.map((part, idx) => {
        // Match **bold** pattern
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return <strong key={idx} className="font-semibold text-foreground">{boldMatch[1]}</strong>;
        }
        // Match ##BOLD## pattern
        const hashMatch = part.match(/^##(.+)##$/);
        if (hashMatch) {
          return <strong key={idx} className="font-semibold text-foreground">{hashMatch[1]}</strong>;
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

// Parse and format reflection for display
function parseReflectionContent(reflection: any): {
  title: string;
  summary: string;
  insights: string[];
  metrics: { label: string; value: string }[];
  recommendations: string;
} {
  const result = {
    title: '',
    summary: '',
    insights: [] as string[],
    metrics: [] as { label: string; value: string }[],
    recommendations: ''
  };
  
  // Extract title from date
  const date = new Date(reflection.reflection_date || reflection.created_at);
  result.title = `Reflection - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  
  // Parse summary - clean up the groq prefix if present
  let summaryText = reflection.summary || '';
  if (summaryText.includes(':')) {
    // Remove "Reflection generated using X:" prefix
    const colonIndex = summaryText.indexOf(':');
    if (colonIndex < 50) {
      summaryText = summaryText.substring(colonIndex + 1).trim();
    }
  }
  result.summary = summaryText;
  
  // Parse lessons object for insights
  if (reflection.lessons) {
    const lessonsData = typeof reflection.lessons === 'string' 
      ? JSON.parse(reflection.lessons) 
      : reflection.lessons;
    
    // Extract insights from lessons - show full content
    if (lessonsData.insights && Array.isArray(lessonsData.insights)) {
      lessonsData.insights.forEach((insight: any) => {
        if (insight.action && typeof insight.action === 'string') {
          result.insights.push(insight.action.trim());
        } else if (insight.finding && typeof insight.finding === 'string') {
          result.insights.push(insight.finding.trim());
        } else if (typeof insight === 'string') {
          result.insights.push(insight.trim());
        }
      });
    }
    
    // Extract metrics
    if (lessonsData.metrics) {
      Object.entries(lessonsData.metrics).forEach(([key, value]) => {
        const label = key
          .replace(/^avg_/, '')
          .replace(/_/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        let displayValue: string;
        if (typeof value === 'number') {
          if (isNaN(value)) {
            displayValue = 'No data';
          } else if (value <= 1) {
            displayValue = `${Math.round(value * 100)}%`;
          } else {
            displayValue = value.toFixed(2);
          }
        } else if (value === 'NaN%') {
          displayValue = 'No data';
        } else {
          displayValue = String(value);
        }
        
        result.metrics.push({ label, value: displayValue });
      });
    }
  }
  
  // Parse recommendations
  if (reflection.recommendations) {
    result.recommendations = typeof reflection.recommendations === 'string' 
      ? reflection.recommendations 
      : extractReadableText(reflection.recommendations);
  }
  
  // Parse insights field
  if (reflection.insights && typeof reflection.insights === 'string') {
    result.insights.unshift(reflection.insights);
  }
  
  return result;
}

// Collapsible Reflection Card Component with proper expand/scroll
function ReflectionCard({ reflection }: { reflection: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsed = parseReflectionContent(reflection);
  
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <div 
      className={cn(
        "rounded-lg bg-muted/20 text-xs transition-all duration-300 border border-border/30",
        isExpanded ? "ring-1 ring-primary/30 bg-muted/30" : "cursor-pointer hover:bg-muted/30"
      )}
    >
      {/* Header - improved touch targets */}
      <button 
        type="button"
        className="flex items-center justify-between p-3 pb-2 min-h-[48px] cursor-pointer w-full text-left touch-manipulation"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Brain className="w-4 h-4 text-primary/70 shrink-0" />
          <span className="font-medium text-foreground text-sm truncate">{parsed.title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground/50 shrink-0 transition-transform duration-300 ml-2",
            isExpanded && "rotate-180"
          )} 
        />
      </button>
      
      {/* Summary Preview - collapsed shows first 2 lines */}
      {!isExpanded && (
        <button 
          type="button"
          className="px-3 pb-3 w-full text-left touch-manipulation"
          onClick={handleToggle}
        >
          <FormattedText 
            text={parsed.summary || 'Processing reflection data...'} 
            className="text-muted-foreground leading-relaxed text-sm block line-clamp-2"
          />
        </button>
      )}
      
      {/* Expanded content - FULL readable view with proper scrolling */}
      {isExpanded && (
        <div className="border-t border-border/30 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            <div className="px-3 py-4 space-y-4">
              {/* Full Summary if longer */}
              {parsed.summary && parsed.summary.length > 150 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">Full Summary</p>
                  <FormattedText 
                    text={parsed.summary} 
                    className="text-sm text-muted-foreground leading-relaxed block"
                  />
                </div>
              )}
              
              {/* Metrics - displayed as readable list */}
              {parsed.metrics.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">System Metrics</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsed.metrics.map((m, idx) => (
                      <div key={idx} className="bg-background/50 rounded px-3 py-2 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground/70">{m.label}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          m.value === 'No data' ? 'text-muted-foreground/50' : 'text-foreground'
                        )}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Insights - FULL TEXT with bold formatting */}
              {parsed.insights.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">Key Insights</p>
                  <ul className="space-y-3">
                    {parsed.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-amber-500/70 mt-0.5 shrink-0" />
                        <FormattedText 
                          text={insight} 
                          className="text-sm text-muted-foreground leading-relaxed"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Recommendations - FULL TEXT with bold formatting */}
              {parsed.recommendations && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">Recommendations</p>
                  <FormattedText 
                    text={parsed.recommendations} 
                    className="text-sm text-muted-foreground leading-relaxed block"
                  />
                </div>
              )}
              
              {/* Top Memories - readable with better mobile sizing */}
              {reflection.top_memories && Array.isArray(reflection.top_memories) && reflection.top_memories.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">Associated Memories</p>
                  <div className="space-y-2">
                    {reflection.top_memories.map((mem: any, idx: number) => (
                      <div key={idx} className="bg-background/30 rounded px-3 py-2.5 text-sm text-muted-foreground/80">
                        <FormattedText text={typeof mem === 'string' ? mem : extractReadableText(mem)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export const BrainIntelligencePanel = memo(function BrainIntelligencePanel({ enabled }: BrainIntelligencePanelProps) {
  const [deepThinkQuery, setDeepThinkQuery] = useState('');
  const [exploreQuery, setExploreQuery] = useState('');
  
  // Live data hooks
  const curiosityLog = useLiveCuriosityLog();
  const learningPatterns = useLiveLearningPatterns();
  const reflections = useLiveReflections();
  
  // Mutation hooks
  const optimizeMutation = useBrainOptimize();
  const deepThinkMutation = useBrainDeepThink();
  const cognitiveCycleMutation = useBrainCognitiveCycle();
  const exploreMutation = useBrainExplore();
  const graphBuildMutation = useBrainGraphBuild();
  const tieringMutation = useBrainTiering();
  const pruneMutation = useBrainPrune();
  const batchTieringMutation = useBrainBatchTiering();

  const handleDeepThink = async () => {
    if (!deepThinkQuery.trim()) {
      toast.error('Enter a query for deep thinking');
      return;
    }
    try {
      await deepThinkMutation.mutateAsync(deepThinkQuery);
      toast.success('Deep thinking initiated');
      setDeepThinkQuery('');
    } catch {
      toast.error('Deep think failed');
    }
  };

  const handleExplore = async () => {
    if (!exploreQuery.trim()) {
      toast.error('Enter a curiosity query');
      return;
    }
    try {
      await exploreMutation.mutateAsync(exploreQuery);
      toast.success('Exploration started');
      setExploreQuery('');
    } catch {
      toast.error('Exploration failed');
    }
  };

  if (!enabled) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="p-6 text-center">
          <Brain className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground italic">
            Brain intelligence controls require operator access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <h3 className="text-sm font-medium">Brain Intelligence</h3>
        <Badge variant="outline" className="text-[10px] border-cyan-500/50 text-cyan-500">
          COGNITIVE
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={() => {
                toast.info('Optimizing memory...');
                optimizeMutation.mutate();
              }}
              disabled={optimizeMutation.isPending}
            >
              {optimizeMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Optimize Memory</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={() => {
                toast.info('Running cognitive cycle...');
                cognitiveCycleMutation.mutate();
              }}
              disabled={cognitiveCycleMutation.isPending}
            >
              {cognitiveCycleMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Run Cognitive Cycle</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={() => {
                toast.info('Building knowledge graph...');
                graphBuildMutation.mutate();
              }}
              disabled={graphBuildMutation.isPending}
            >
              {graphBuildMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Network className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Build Knowledge Graph</span>
            </Button>
          </CardContent>
        </Card>

        {/* Memory Tiering & Pruning */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              Memory Tiering
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Tiering memories...');
                tieringMutation.mutate(500);
              }}
              disabled={tieringMutation.isPending}
            >
              {tieringMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Tier Memories (Hot↔Warm↔Cold)</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Running batch tiering...');
                batchTieringMutation.mutate({ batch_size: 500, max_batches: 10 });
              }}
              disabled={batchTieringMutation.isPending}
            >
              {batchTieringMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Batch Tiering (Deep)</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 text-amber-600 hover:text-amber-500 border-amber-500/30 hover:border-amber-500/50 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Preview pruning...');
                pruneMutation.mutate({ dry_run: true });
              }}
              disabled={pruneMutation.isPending}
            >
              {pruneMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Preview Prune</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Pruning low-value memories...');
                pruneMutation.mutate({});
              }}
              disabled={pruneMutation.isPending}
            >
              {pruneMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Prune Low-Value Memories</span>
            </Button>
          </CardContent>
        </Card>

        {/* Deep Think Interface */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Deep Think
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Input
              value={deepThinkQuery}
              onChange={(e) => setDeepThinkQuery(e.target.value)}
              placeholder="Complex query..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleDeepThink()}
            />
            <Button
              variant="default"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleDeepThink}
              disabled={deepThinkMutation.isPending || !deepThinkQuery.trim()}
            >
              {deepThinkMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
              ) : null}
              Initiate Deep Thinking
            </Button>
            {deepThinkMutation.isSuccess && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                <span>Thinking complete</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Curiosity Explorer */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Curiosity Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Input
              value={exploreQuery}
              onChange={(e) => setExploreQuery(e.target.value)}
              placeholder="What to explore..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
              onClick={handleExplore}
              disabled={exploreMutation.isPending || !exploreQuery.trim()}
            >
              {exploreMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
              ) : null}
              Explore
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning Patterns & Curiosity Log */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Learning Patterns */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Learning Patterns
              <Badge variant="outline" className="ml-auto text-[9px] h-4">
                {learningPatterns.data?.patterns?.length ?? 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {learningPatterns.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : learningPatterns.data?.patterns && learningPatterns.data.patterns.length > 0 ? (
              <ScrollArea className="h-[140px]">
                <div className="space-y-2">
                  {learningPatterns.data.patterns.slice(0, 5).map((pattern: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-muted/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{pattern.pattern_name}</span>
                        <Badge variant="outline" className="text-[9px] h-4">
                          {Math.round((pattern.confidence ?? 0) * 100)}%
                        </Badge>
                      </div>
                      <Progress value={(pattern.confidence ?? 0) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No patterns detected yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Curiosity Log */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              Curiosity Log
              <Badge variant="outline" className="ml-auto text-[9px] h-4">
                {curiosityLog.data?.queries?.length ?? 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {curiosityLog.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : curiosityLog.data?.queries && curiosityLog.data.queries.length > 0 ? (
              <ScrollArea className="h-[140px]">
                <div className="space-y-1.5">
                  {curiosityLog.data.queries.slice(0, 6).map((q: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-center gap-2 p-1.5 rounded text-xs",
                        q.explored ? "bg-green-500/10 text-green-400" : "bg-muted/30"
                      )}
                    >
                      {q.explored ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
                      )}
                      <span className="truncate">{q.query}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No curiosity queries yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reflections - Collapsible Cards with proper mobile expansion */}
      {reflections.data?.reflections && reflections.data.reflections.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
              <Brain className="w-3.5 h-3.5" />
              Recent Reflections
              <Badge variant="outline" className="ml-auto text-[9px] h-4">
                {reflections.data.reflections.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-4 pb-4">
            <ScrollArea className="h-auto max-h-[60vh] md:max-h-[50vh]">
              <div className="space-y-3 pr-2">
                {reflections.data.reflections.slice(0, 5).map((r: any, idx: number) => (
                  <ReflectionCard key={idx} reflection={r} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
