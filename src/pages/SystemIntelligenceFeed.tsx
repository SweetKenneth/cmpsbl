/**
 * System Intelligence Feed
 * v6.8.1 — Live feed of module self-analysis and improvement requests
 * 
 * This page shows real-time insights from all substrate modules
 * as they analyze their own performance and request improvements.
 * 
 * REQUIRES AUTHENTICATION — Only logged-in users can view system intelligence.
 * Learning runs 24/7 via backend scheduler (pf-module-clm-scheduler).
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Cpu, 
  Shield, 
  Network, 
  Eye, 
  Zap, 
  Lock, 
  Accessibility,
  RefreshCw,
  Settings,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Activity,
  CheckCircle,
  Clock,
  FileText,
  LogIn,
} from 'lucide-react';
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';
import { type ModuleName, type ModuleSelfAnalysis } from '@/lib/substrate/module-clm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_ICONS: Record<ModuleName, React.ElementType> = {
  brain: Brain,
  cortex: Cpu,
  defense: Shield,
  nexus: Network,
  vision: Eye,
  ripple: Zap,
  access: Lock,
  inclusive: Accessibility,
  modernizer: RefreshCw,
  system: Settings,
  decode: FileText,
  autoblog: TrendingUp,
};

const MODULE_COLORS: Record<ModuleName, string> = {
  brain: 'text-purple-400',
  cortex: 'text-blue-400',
  defense: 'text-red-400',
  nexus: 'text-green-400',
  vision: 'text-amber-400',
  ripple: 'text-cyan-400',
  access: 'text-orange-400',
  inclusive: 'text-pink-400',
  modernizer: 'text-emerald-400',
  system: 'text-gray-400',
  decode: 'text-indigo-400',
  autoblog: 'text-violet-400',
};

const ANALYSIS_TYPE_ICONS: Record<ModuleSelfAnalysis['analysisType'], React.ElementType> = {
  performance: Activity,
  improvement: TrendingUp,
  insight: Lightbulb,
  request: MessageSquare,
};

const PRIORITY_COLORS: Record<ModuleSelfAnalysis['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  critical: 'bg-red-500/20 text-red-400',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FEED ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FeedItemProps {
  analysis: ModuleSelfAnalysis;
  onAcknowledge: (id: string) => void;
}

function FeedItem({ analysis, onAcknowledge }: FeedItemProps) {
  const [expanded, setExpanded] = useState(false);
  const ModuleIcon = MODULE_ICONS[analysis.moduleId] || Brain;
  const TypeIcon = ANALYSIS_TYPE_ICONS[analysis.analysisType];
  const moduleColor = MODULE_COLORS[analysis.moduleId] || 'text-primary';

  const timeAgo = getTimeAgo(analysis.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className={cn(
        "bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300",
        analysis.status === 'acknowledged' && "opacity-60"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-muted/50 shrink-0",
              moduleColor
            )}>
              <ModuleIcon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("font-semibold text-sm", moduleColor)}>
                  {analysis.moduleId.toUpperCase()}
                </span>
                <Badge variant="outline" className="text-xs">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {analysis.analysisType}
                </Badge>
                <Badge className={cn("text-xs", PRIORITY_COLORS[analysis.priority])}>
                  {analysis.priority}
                </Badge>
                {analysis.status === 'acknowledged' && (
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
              
              <h3 className="font-medium text-foreground mt-1 line-clamp-2">
                {analysis.title}
              </h3>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {(analysis.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0"
            >
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                expanded && "rotate-90"
              )} />
            </Button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {analysis.content}
                  </p>

                  {analysis.metadata?.requests && analysis.metadata.requests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-foreground mb-2">
                        Improvement Requests:
                      </h4>
                      <ul className="space-y-1">
                        {analysis.metadata.requests.map((req: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAcknowledge(analysis.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ModuleCardProps {
  moduleId: ModuleName;
  displayName: string;
  state: { improvementScore: number; totalLearnings: number; lastLearnedAt: string | null; isLearning: boolean };
  onTrigger: () => void;
}

function ModuleCard({ moduleId, displayName, state, onTrigger }: ModuleCardProps) {
  const Icon = MODULE_ICONS[moduleId] || Brain;
  const color = MODULE_COLORS[moduleId] || 'text-primary';

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-muted/50", color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{displayName}</h3>
              <p className="text-xs text-muted-foreground">
                {state.totalLearnings} learnings
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {state.improvementScore.toFixed(0)}
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onTrigger}
              disabled={state.isLearning}
              className="text-xs"
            >
              {state.isLearning ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SystemIntelligenceFeed() {
  const {
    feed,
    loading,
    moduleStates,
    runModuleLearning,
    runAllLearning,
    acknowledgeAnalysis,
    refreshFeed,
    getModuleConfig,
  } = useModuleCLM();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [isRunningAll, setIsRunningAll] = useState(false);

  const filteredFeed = selectedType === 'all'
    ? feed
    : feed.filter(item => item.analysisType === selectedType);

  const handleRunAll = async () => {
    setIsRunningAll(true);
    await runAllLearning();
    setIsRunningAll(false);
  };

  const typeStats = {
    all: feed.length,
    performance: feed.filter(f => f.analysisType === 'performance').length,
    improvement: feed.filter(f => f.analysisType === 'improvement').length,
    insight: feed.filter(f => f.analysisType === 'insight').length,
    request: feed.filter(f => f.analysisType === 'request').length,
  };

  return (
    <>
      <Helmet>
        <title>System Intelligence Feed | Substrate OS</title>
        <meta name="description" content="Live feed of module self-analysis and improvement requests from the Substrate cognitive system." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  System Intelligence Feed
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time module self-analysis and improvement requests
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshFeed}
                  disabled={loading}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunAll}
                  disabled={isRunningAll}
                >
                  <Activity className={cn("w-4 h-4 mr-2", isRunningAll && "animate-pulse")} />
                  {isRunningAll ? 'Analyzing...' : 'Run All CLM'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Module States */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Module States</CardTitle>
                  <CardDescription className="text-xs">
                    Trigger individual module learning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScrollArea className="h-[400px] pr-2">
                    <div className="space-y-2">
                      {moduleStates.map(state => {
                        const config = getModuleConfig(state.moduleId);
                        return (
                          <ModuleCard
                            key={state.moduleId}
                            moduleId={state.moduleId}
                            displayName={config?.displayName || state.moduleId.toUpperCase()}
                            state={state}
                            onTrigger={() => runModuleLearning(state.moduleId)}
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Stats Summary */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Feed Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded bg-muted/30">
                      <div className="text-lg font-bold">{feed.length}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10">
                      <div className="text-lg font-bold text-amber-400">
                        {feed.filter(f => f.priority === 'high' || f.priority === 'critical').length}
                      </div>
                      <div className="text-xs text-muted-foreground">High Priority</div>
                    </div>
                    <div className="p-2 rounded bg-green-500/10">
                      <div className="text-lg font-bold text-green-400">
                        {feed.filter(f => f.status === 'acknowledged').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Acknowledged</div>
                    </div>
                    <div className="p-2 rounded bg-blue-500/10">
                      <div className="text-lg font-bold text-blue-400">
                        {feed.filter(f => f.status === 'pending').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="all" onValueChange={setSelectedType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="gap-1">
                    All <Badge variant="secondary" className="ml-1">{typeStats.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-1">
                    <Activity className="w-3 h-3" />
                    Performance <Badge variant="secondary" className="ml-1">{typeStats.performance}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="improvement" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Improvements <Badge variant="secondary" className="ml-1">{typeStats.improvement}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="insight" className="gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Insights <Badge variant="secondary" className="ml-1">{typeStats.insight}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="request" className="gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Requests <Badge variant="secondary" className="ml-1">{typeStats.request}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedType} className="mt-0">
                  {loading && filteredFeed.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredFeed.length === 0 ? (
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="py-12 text-center">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No Intelligence Data Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Run module CLM to generate self-analysis and improvement requests.
                        </p>
                        <Button onClick={handleRunAll} disabled={isRunningAll}>
                          <Activity className="w-4 h-4 mr-2" />
                          Start System Learning
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredFeed.map(analysis => (
                          <FeedItem
                            key={analysis.id}
                            analysis={analysis}
                            onAcknowledge={acknowledgeAnalysis}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
