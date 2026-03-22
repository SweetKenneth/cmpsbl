import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  Play, 
  Moon, 
  Zap, 
  RefreshCw, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OperativeStatus {
  mode: string;
  last_cycle: string | null;
  cycles_completed: number;
  health_score: number;
  last_email: string | null;
}

export function DecodeOperativeControls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  // Fetch operative status
  const { data: status, isLoading } = useQuery({
    queryKey: ['decode-operative-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_orchestrator_state')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) throw error;
      
      const metadata = data?.metadata as Record<string, unknown> | null;
      
      return {
        mode: (metadata?.mode as string) || 'OPERATIVE',
        last_cycle: data?.last_cycle_at,
        cycles_completed: data?.cycles_completed || 0,
        health_score: data?.health_score || 0,
        last_email: data?.last_email_at
      } as OperativeStatus;
    },
    refetchInterval: 30000
  });

  // Fetch recent events
  const { data: recentEvents } = useQuery({
    queryKey: ['decode-recent-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('brain_events')
        .select('*')
        .eq('module', 'decode')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    refetchInterval: 30000
  });

  // Trigger learning cycle via substrate unified endpoint
  const triggerLearning = async () => {
    setIsTriggering('learning');
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'brain', action: 'cognitive_cycle' }
      });
      
      if (error) throw error;
      
      toast({
        title: '🜂 Learning Cycle Triggered',
        description: data?.success ? 'Cognitive cycle completed' : 'Cycle initiated',
      });
      
      queryClient.invalidateQueries({ queryKey: ['decode-operative-status'] });
      queryClient.invalidateQueries({ queryKey: ['decode-recent-events'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger learning',
        variant: 'destructive'
      });
    } finally {
      setIsTriggering(null);
    }
  };

  // Trigger dream cycle
  const triggerDream = async () => {
    setIsTriggering('dream');
    try {
      const { data, error } = await supabase.functions.invoke('pf-dream-eater-cycle');
      
      if (error) throw error;
      
      toast({
        title: '🌙 Dream Cycle Triggered',
        description: `Dream: ${data?.mood || 'unknown'} mood. Email sent: ${data?.email_sent ? 'Yes' : 'No'}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['decode-operative-status'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger dream',
        variant: 'destructive'
      });
    } finally {
      setIsTriggering(null);
    }
  };

  // Trigger continuous learning (calls operative function)
  const triggerContinuousLearning = async () => {
    setIsTriggering('continuous');
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-continuous-learn');
      
      if (error) throw error;
      
      toast({
        title: '📚 Continuous Learning Activated',
        description: `Made ${data?.learning?.calls_made || 0} doctrine-aligned learning calls.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['decode-operative-status'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start continuous learning',
        variant: 'destructive'
      });
    } finally {
      setIsTriggering(null);
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
  };

  return (
    <Card className="glass-card border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Decode Operative Controls</CardTitle>
          </div>
          <Badge variant={status?.mode === 'OPERATIVE' ? 'default' : 'secondary'}>
            {status?.mode || 'LOADING'}
          </Badge>
        </div>
        <CardDescription>
          24/7 Learning, Reporting, and Dream Cycles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-neon-green" />
            <div className="text-lg font-bold">{status?.cycles_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Cycles</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-neon-amber" />
            <div className="text-lg font-bold">{Math.round((status?.health_score || 0) * 100)}%</div>
            <div className="text-xs text-muted-foreground">Health</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-neon-blue" />
            <div className="text-xs font-medium">{formatTime(status?.last_cycle)}</div>
            <div className="text-xs text-muted-foreground">Last Cycle</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-neon-purple" />
            <div className="text-xs font-medium">{formatTime(status?.last_email)}</div>
            <div className="text-xs text-muted-foreground">Last Email</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={triggerLearning}
            disabled={isTriggering !== null}
            className="w-full"
            variant="default"
          >
            {isTriggering === 'learning' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Trigger Operative Cycle
          </Button>
          
          <Button 
            onClick={triggerContinuousLearning}
            disabled={isTriggering !== null}
            className="w-full"
            variant="secondary"
          >
            {isTriggering === 'continuous' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Continuous Learning
          </Button>
          
          <Button 
            onClick={triggerDream}
            disabled={isTriggering !== null}
            className="w-full"
            variant="outline"
          >
            {isTriggering === 'dream' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Moon className="w-4 h-4 mr-2" />
            )}
            Trigger Dream
          </Button>
        </div>

        {/* Recent Events */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentEvents?.map((event: any) => (
              <div 
                key={event.id} 
                className="bg-background/30 rounded p-2 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {event.outcome === 'dispatched' ? (
                    <CheckCircle className="w-3 h-3 text-neon-green" />
                  ) : event.outcome === 'failed' ? (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  ) : (
                    <Activity className="w-3 h-3 text-neon-blue" />
                  )}
                  <span className="font-medium">{event.event_type}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {(!recentEvents || recentEvents.length === 0) && (
              <div className="text-center text-muted-foreground py-4">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">MODE: OPERATIVE</strong> — All signals dispatch immediately to 
            <span className="text-primary"> kennethsweet214@gmail.com</span>. 
            Dream probability is higher at night CST (40% from 10 PM - 2 AM, 30% from 2 AM - 6 AM).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
