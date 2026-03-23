/**
 * Node Learning Feed
 * Real-time feed of what all primitives are learning about
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FileText,
  BookOpen,
  Lightbulb,
  Clock,
  Code,
  CheckCircle2,
} from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface LearningEntry {
  id: string;
  content: string;
  source: string;
  success: boolean;
  created_at: string;
  metadata: any;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  brain: Brain,
  cortex: Cpu,
  defense: Shield,
  nexus: Network,
  vision: Eye,
  ripple: Zap,
  access: Lock,
  inclusive: Accessibility,
  evolution: RefreshCw,
  system: Settings,
  decode: FileText,
  autoblog: TrendingUp,
  encoded: Code,
  encoded_learning_engine: Code,
  clm: Brain,
  cerebras: Brain,
  openrouter: Network,
};

const MODULE_COLORS: Record<string, string> = {
  brain: 'text-neon-purple border-neon-purple/30',
  cortex: 'text-neon-blue border-neon-blue/30',
  defense: 'text-destructive border-destructive/30',
  nexus: 'text-neon-green border-neon-green/30',
  vision: 'text-neon-amber border-neon-amber/30',
  ripple: 'text-neon-cyan border-neon-cyan/30',
  access: 'text-neon-amber border-neon-amber/30',
  inclusive: 'text-neon-magenta border-neon-magenta/30',
  evolution: 'text-neon-green border-neon-green/30',
  system: 'text-gray-400 border-gray-500/30',
  decode: 'text-primary border-primary/30',
  autoblog: 'text-neon-purple border-neon-purple/30',
  encoded: 'text-neon-magenta border-neon-magenta/30',
  encoded_learning_engine: 'text-neon-magenta border-neon-magenta/30',
  clm: 'text-neon-purple border-neon-purple/30',
  cerebras: 'text-neon-amber border-neon-amber/30',
  openrouter: 'text-neon-green border-neon-green/30',
};

export function ModuleLearningFeed() {
  const [logs, setLogs] = useState<LearningEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch learning logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getModuleInfo = (source: string) => {
    const normalizedSource = source.toLowerCase().replace(/_/g, '');
    const Icon = MODULE_ICONS[source] || MODULE_ICONS[normalizedSource] || Brain;
    const colorClass = MODULE_COLORS[source] || MODULE_COLORS[normalizedSource] || 'text-primary border-primary/30';
    return { Icon, colorClass };
  };

  const extractSummary = (content: string): string => {
    // Try to extract the title or first meaningful line
    const lines = content.split('\n').filter(l => l.trim());
    const firstLine = lines[0] || content;
    
    // Check for bracketed title
    const bracketMatch = firstLine.match(/\[([^\]]+)\]/);
    if (bracketMatch) return bracketMatch[1];
    
    // Check for bold title
    const boldMatch = firstLine.match(/\*\*([^*]+)\*\*/);
    if (boldMatch) return boldMatch[1];
    
    // Return first 100 chars
    return firstLine.slice(0, 100) + (firstLine.length > 100 ? '...' : '');
  };

  const getTopicFromMetadata = (metadata: Record<string, any>): string | null => {
    if (metadata?.topic) return metadata.topic;
    if (metadata?.query) return metadata.query;
    if (metadata?.mode) return `Mode: ${metadata.mode}`;
    return null;
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Module Learning Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No learning activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => {
                  const { Icon, colorClass } = getModuleInfo(log.source);
                  const summary = extractSummary(log.content);
                  const topic = getTopicFromMetadata(log.metadata || {});
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors",
                        colorClass.split(' ')[1] // Get border color
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1.5 rounded-md bg-background/80",
                          colorClass.split(' ')[0] // Get text color
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs font-bold uppercase",
                              colorClass.split(' ')[0]
                            )}>
                              {log.source.replace(/_/g, ' ')}
                            </span>
                            {log.success ? (
                              <CheckCircle2 className="w-3 h-3 text-neon-green" />
                            ) : (
                              <Zap className="w-3 h-3 text-neon-amber" />
                            )}
                          </div>
                          
                          <p className="text-sm text-foreground line-clamp-2 mb-2">
                            {summary}
                          </p>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Lightbulb className="w-2.5 h-2.5 mr-0.5" />
                                {topic.slice(0, 40)}{topic.length > 40 ? '...' : ''}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="w-2.5 h-2.5" />
                              {getTimeSince(log.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
