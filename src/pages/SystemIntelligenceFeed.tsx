/**
 * System Intelligence Feed
 * v6.8.2 — Live feed of module self-analysis and improvement requests
 * 
 * This page shows real-time insights from all substrate modules
 * as they analyze their own performance and request improvements.
 * 
 * REQUIRES AUTHENTICATION — Only logged-in users can view system intelligence.
 * Learning runs 24/7 via backend scheduler (pf-module-clm-scheduler).
 * 
 * OBSERVER MODE: No manual triggers. Feed is read-only.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
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
  Sparkles,
} from 'lucide-react';
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';
import { type ModuleName, type ModuleSelfAnalysis } from '@/lib/substrate/module-clm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEED ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FeedItemProps {
  analysis: ModuleSelfAnalysis;
}

function FeedItem({ analysis }: FeedItemProps) {
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
// MODULE STATE CARD (Read-only)
// ═══════════════════════════════════════════════════════════════════════════════

interface ModuleStateCardProps {
  moduleId: ModuleName;
  displayName: string;
  analysisCount: number;
}

function ModuleStateCard({ moduleId, displayName, analysisCount }: ModuleStateCardProps) {
  const Icon = MODULE_ICONS[moduleId] || Brain;
  const color = MODULE_COLORS[moduleId] || 'text-primary';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className={cn("p-2 rounded-lg bg-muted/50", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{displayName}</h3>
        <p className="text-xs text-muted-foreground">{analysisCount} analyses</p>
      </div>
      {analysisCount > 0 && (
        <Badge variant="secondary" className="text-xs shrink-0">
          Active
        </Badge>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH REQUIRED SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function AuthRequiredScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/50 border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-variant/20 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">System Intelligence Feed</CardTitle>
          <CardDescription className="text-base">
            Sign in to observe the substrate's autonomous learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>Watch modules analyze their own performance in real-time</p>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>See improvement requests generated by autonomous learning</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>Observer access — view-only, no interaction required</p>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full gap-2">
              <Link to="/auth">
                <LogIn className="w-4 h-4" />
                Sign In to Observe
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Learning runs continuously via backend scheduler
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SystemIntelligenceFeed() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    feed,
    loading,
    error,
    refreshFeed,
    getModuleConfig,
  } = useModuleCLM();

  const [selectedType, setSelectedType] = useState<string>('all');

  // Show auth screen if not logged in
  if (!authLoading && !user) {
    return <AuthRequiredScreen />;
  }

  // Show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredFeed = selectedType === 'all'
    ? feed
    : feed.filter(item => item.analysisType === selectedType);

  // Count analyses per module
  const moduleAnalysisCounts = Object.keys(MODULE_ICONS).reduce((acc, moduleId) => {
    acc[moduleId as ModuleName] = feed.filter(f => f.moduleId === moduleId).length;
    return acc;
  }, {} as Record<ModuleName, number>);

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
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Autonomous learning — runs continuously via backend scheduler
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <Activity className="w-3 h-3 text-green-400" />
                  Auto-learning active
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshFeed}
                  disabled={loading}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {error && (
            <Card className="mb-6 bg-destructive/10 border-destructive/30">
              <CardContent className="p-4 text-sm text-destructive">
                Error loading feed: {error}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Module States (Read-only) */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Module Activity</CardTitle>
                  <CardDescription className="text-xs">
                    Learning runs hourly via backend scheduler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px] pr-2">
                    <div className="space-y-2">
                      {(Object.keys(MODULE_ICONS) as ModuleName[]).map(moduleId => {
                        const config = getModuleConfig(moduleId);
                        return (
                          <ModuleStateCard
                            key={moduleId}
                            moduleId={moduleId}
                            displayName={config?.displayName || moduleId.toUpperCase()}
                            analysisCount={moduleAnalysisCounts[moduleId] || 0}
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
                    <div className="p-2 rounded bg-purple-500/10">
                      <div className="text-lg font-bold text-purple-400">
                        {typeStats.improvement}
                      </div>
                      <div className="text-xs text-muted-foreground">Improvements</div>
                    </div>
                    <div className="p-2 rounded bg-blue-500/10">
                      <div className="text-lg font-bold text-blue-400">
                        {typeStats.request}
                      </div>
                      <div className="text-xs text-muted-foreground">Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back to Home */}
              <Button variant="outline" asChild className="w-full">
                <Link to="/">← Back to Home</Link>
              </Button>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="all" onValueChange={setSelectedType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="gap-1">
                    All <Badge variant="secondary" className="ml-1">{typeStats.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-1">
                    Performance <Badge variant="secondary" className="ml-1">{typeStats.performance}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="improvement" className="gap-1">
                    Improvement <Badge variant="secondary" className="ml-1">{typeStats.improvement}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="insight" className="gap-1 hidden sm:flex">
                    Insight <Badge variant="secondary" className="ml-1">{typeStats.insight}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="request" className="gap-1 hidden sm:flex">
                    Request <Badge variant="secondary" className="ml-1">{typeStats.request}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedType} className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">Loading feed...</p>
                    </div>
                  ) : filteredFeed.length === 0 ? (
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="py-12 text-center">
                        <Brain className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Analyses Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          The substrate is learning continuously. New analyses appear here as modules reflect on their performance.
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Learning scheduler runs hourly
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredFeed.map(analysis => (
                        <FeedItem key={analysis.id} analysis={analysis} />
                      ))}
                    </AnimatePresence>
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
