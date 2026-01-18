/**
 * Brain Intelligence Panel — Advanced cognitive controls
 * Deep thinking, curiosity engine, learning patterns
 */

import { useState } from 'react';
import { Brain, Sparkles, Network, TrendingUp, Lightbulb, Loader2, CheckCircle2, AlertCircle, Zap, Activity, ChevronDown } from 'lucide-react';
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
import { useBrainOptimize, useBrainDeepThink, useBrainCognitiveCycle, useBrainExplore, useBrainGraphBuild } from '@/hooks/useSubstrateOSEnhanced';

interface BrainIntelligencePanelProps {
  enabled: boolean;
}

// Collapsible Reflection Card Component
function ReflectionCard({ reflection }: { reflection: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const summary = reflection.summary || reflection.insights || 'Reflection processed';
  const fullContent = [
    reflection.summary,
    reflection.insights,
    reflection.recommendations,
    reflection.lessons ? JSON.stringify(reflection.lessons, null, 2) : null
  ].filter(Boolean).join('\n\n');
  
  const date = new Date(reflection.reflection_date || reflection.created_at).toLocaleDateString();
  
  return (
    <div 
      className={cn(
        "rounded-lg bg-muted/20 text-xs transition-all duration-200 cursor-pointer hover:bg-muted/30",
        isExpanded ? "ring-1 ring-primary/30" : ""
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between p-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-muted-foreground transition-all",
            !isExpanded && "line-clamp-2"
          )}>
            {isExpanded ? fullContent : summary}
          </p>
          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
            {date}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground/50 shrink-0 ml-2 transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </div>
      {isExpanded && reflection.top_memories && (
        <div className="px-3 pb-3 pt-0 border-t border-border/30 mt-2">
          <p className="text-[10px] text-muted-foreground/70 font-medium mb-1">Top Memories:</p>
          <div className="text-[10px] text-muted-foreground/60 whitespace-pre-wrap">
            {typeof reflection.top_memories === 'string' 
              ? reflection.top_memories 
              : JSON.stringify(reflection.top_memories, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}


export function BrainIntelligencePanel({ enabled }: BrainIntelligencePanelProps) {
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
              onClick={() => optimizeMutation.mutate()}
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
              onClick={() => cognitiveCycleMutation.mutate()}
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
              onClick={() => graphBuildMutation.mutate()}
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

      {/* Recent Reflections - Collapsible Cards */}
      {reflections.data?.reflections && reflections.data.reflections.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
              <Brain className="w-3.5 h-3.5" />
              Recent Reflections
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {reflections.data.reflections.slice(0, 5).map((r: any, idx: number) => (
                <ReflectionCard key={idx} reflection={r} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
