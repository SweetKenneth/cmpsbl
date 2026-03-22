/**
 * ENCODE Learning Card
 * Shows real-time learning activity and topic mastery for the ENCODE code execution module
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Lightbulb,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  encodedLearningEngine, 
  getEncodedCurriculum, 
  ENCODED_CODE_CURRICULUM,
  type EncodedLearningState 
} from '@/lib/substrate/clm';
import { supabase } from '@/integrations/supabase/client';

interface LearningLogEntry {
  id: string;
  content: string;
  source: string;
  success: boolean;
  created_at: string;
  metadata: {
    topic?: string;
    job_id?: string;
    focus?: string;
    patterns_count?: number;
    anti_patterns_count?: number;
    is_code_learning?: boolean;
  };
}

// Tier definitions
const CURRICULUM_TIERS = [
  { name: 'Core Patterns', range: [1, 10], color: 'text-neon-purple', bg: 'bg-neon-purple/20' },
  { name: 'Architecture', range: [11, 20], color: 'text-neon-blue', bg: 'bg-neon-blue/20' },
  { name: 'Advanced Techniques', range: [21, 30], color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' },
  { name: 'Specialization', range: [31, 40], color: 'text-neon-green', bg: 'bg-neon-green/20' },
  { name: 'Mastery', range: [41, 50], color: 'text-neon-amber', bg: 'bg-neon-amber/20' },
];

export function EncodedLearningCard() {
  const [state, setState] = useState<EncodedLearningState | null>(null);
  const [recentLogs, setRecentLogs] = useState<LearningLogEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch state and logs
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get engine state
      const engineState = encodedLearningEngine.getState();
      setState(engineState);

      // Fetch recent code learning logs
      const { data, error } = await supabase
        .from('learning_logs')
        .select('*')
        .eq('source', 'encoded_learning_engine')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentLogs(data as LearningLogEntry[]);
      }
    } catch (err) {
      console.error('Failed to fetch learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Calculate mastery stats
  const curriculum = getEncodedCurriculum();
  const masteryScores = state?.masteryScores || {};
  const overallMastery = encodedLearningEngine.getOverallMastery() * 100;
  
  // Group topics by tier
  const tierProgress = CURRICULUM_TIERS.map(tier => {
    const tierTopics = ENCODED_CODE_CURRICULUM.filter(
      t => t.priority >= tier.range[0] && t.priority <= tier.range[1]
    );
    const avgMastery = tierTopics.reduce((sum, t) => {
      return sum + (masteryScores[t.id] || 0);
    }, 0) / tierTopics.length;
    return {
      ...tier,
      topicsCount: tierTopics.length,
      mastery: avgMastery * 100,
    };
  });

  // Get time since last job
  const getTimeSince = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Extract topic name from log content
  const extractTopicName = (content: string): string => {
    const match = content.match(/\[Encoded Code Learning: ([^\]]+)\]/);
    return match ? match[1] : 'Code Learning';
  };

  return (
    <Card className="border-neon-magenta/30 bg-gradient-to-br from-neon-magenta/10 to-neon-magenta/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-neon-magenta">
            <Code className="w-5 h-5" />
            ENCODE Learning
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </Button>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                state?.enabled 
                  ? "border-neon-green/50 text-neon-green" 
                  : "border-muted text-muted-foreground"
              )}
            >
              {state?.enabled ? '24/7 Active' : 'Paused'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-background/50">
            <div className="text-lg font-bold text-foreground">{state?.totalJobsCompleted || 0}</div>
            <div className="text-xs text-muted-foreground">Topics Studied</div>
          </div>
          <div className="p-2 rounded-lg bg-background/50">
            <div className="text-lg font-bold text-neon-magenta">{overallMastery.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Overall Mastery</div>
          </div>
          <div className="p-2 rounded-lg bg-background/50">
            <div className="text-lg font-bold text-foreground">{curriculum.length}</div>
            <div className="text-xs text-muted-foreground">Curriculum Size</div>
          </div>
        </div>

        {/* Current Focus */}
        {state?.currentFocus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30"
          >
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-neon-magenta animate-pulse" />
              <span className="text-muted-foreground">Currently studying:</span>
              <span className="font-medium text-foreground">{state.currentFocus}</span>
            </div>
          </motion.div>
        )}

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          Last learning: {getTimeSince(state?.lastJobAt || null)}
          {state?.isRunning && (
            <span className="flex items-center gap-1 text-neon-green ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Running
            </span>
          )}
        </div>

        {/* Tier Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Curriculum Tiers</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-6 text-xs px-2"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'Details'}
            </Button>
          </div>
          
          {tierProgress.map((tier, i) => (
            <div key={tier.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", tier.color)}>{tier.name}</span>
                <span className="text-muted-foreground">
                  {tier.mastery.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={tier.mastery} 
                className="h-1.5 bg-muted/30"
              />
            </div>
          ))}
        </div>

        {/* Expanded: Recent Learning Activity */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="w-4 h-4 text-primary" />
                Recent Learning Activity
              </div>
              
              <ScrollArea className="h-64 rounded-lg border border-border/50 bg-background/50">
                {recentLogs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No code learning sessions recorded yet.
                    <br />
                    <span className="text-xs">Learning runs every 15 minutes.</span>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {recentLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg bg-card/50 border border-border/30 hover:border-neon-magenta/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {log.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shrink-0" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-neon-amber shrink-0" />
                            )}
                            <span className="text-sm font-medium text-foreground line-clamp-1">
                              {extractTopicName(log.content)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {getTimeSince(log.created_at)}
                          </span>
                        </div>
                        
                        {log.metadata && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {log.metadata.focus && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {log.metadata.focus}
                              </Badge>
                            )}
                            {log.metadata.patterns_count !== undefined && log.metadata.patterns_count > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-neon-green/30 text-neon-green">
                                <Lightbulb className="w-2.5 h-2.5 mr-0.5" />
                                {log.metadata.patterns_count} patterns
                              </Badge>
                            )}
                            {log.metadata.anti_patterns_count !== undefined && log.metadata.anti_patterns_count > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-neon-amber/30 text-neon-amber">
                                <Target className="w-2.5 h-2.5 mr-0.5" />
                                {log.metadata.anti_patterns_count} anti-patterns
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Improvement Tips */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  How to Improve ENCODE
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Focus on low-mastery tiers first (see progress bars above)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Core Patterns (Tier 1) are highest priority for code quality
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Learning happens every 15 minutes automatically
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Check Brain memories for stored patterns and anti-patterns
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
