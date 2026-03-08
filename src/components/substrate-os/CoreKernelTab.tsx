/**
 * CORE Kernel Tab — Job Scheduler, System State, Lifecycle
 * 38-node / 12-sector field-based topology
 */

import { useState } from 'react';
import { Cpu, Play, Pause, RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CoreJob {
  id: string;
  module: string;
  action: string;
  status: string;
  priority: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface CoreState {
  id: string;
  state: string;
  modules_status: Record<string, unknown> | null;
  last_heartbeat: string | null;
}

export function CoreKernelTab({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<CoreJob | null>(null);

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['core-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as CoreJob[];
    },
    refetchInterval: 5000,
  });

  // Fetch state
  const { data: state } = useQuery({
    queryKey: ['core-state'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_state')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as CoreState | null;
    },
    refetchInterval: 3000,
  });

  // Schedule job mutation
  const scheduleJob = useMutation({
    mutationFn: async (params: { module: string; action: string }) => {
      const { data, error } = await supabase
        .from('core_jobs')
        .insert({
          module: params.module,
          action: params.action,
          status: 'queued',
          priority: 5,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-jobs'] });
      toast.success('Job scheduled');
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'failed': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'running': return <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />;
      case 'queued': return <Clock className="w-3 h-3 text-amber-400" />;
      default: return <AlertTriangle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const stateColor = (s: string) => {
    switch (s) {
      case 'running': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'degraded': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'maintenance': return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'shutdown': return 'text-red-400 border-red-500/40 bg-red-500/10';
      default: return 'text-muted-foreground border-white/20';
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">CORE Kernel</h2>
            <p className="text-xs text-muted-foreground font-mono">
              job scheduler • lifecycle • state machine
            </p>
          </div>
        </div>
        
        {state && (
          <Badge variant="outline" className={cn("uppercase text-[10px]", stateColor(state.state))}>
            {state.state}
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job Queue */}
        <Card className="lg:col-span-2 border-orange-500/20 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Job Queue
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {jobs?.filter(j => j.status === 'queued').length || 0} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {jobsLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300",
                        "bg-white/5 hover:bg-white/10 border border-transparent hover:border-primary/15",
                        selectedJob?.id === job.id && "border-orange-500/40 bg-orange-500/10"
                      )}
                    >
                      {statusIcon(job.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">{job.module}</span>
                          <span className="text-muted-foreground text-[10px]">→</span>
                          <span className="font-mono text-xs text-muted-foreground">{job.action}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 truncate">
                          {job.id.slice(0, 8)}... • P{job.priority}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/70 text-sm italic">
                  No jobs in queue
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System State + Quick Actions */}
        <div className="space-y-4">
          <Card className="border-orange-500/20 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-400" />
                System State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-xs text-muted-foreground">Kernel</span>
                <Badge variant="outline" className={cn("text-[10px]", stateColor(state?.state || 'unknown'))}>
                  {state?.state || 'unknown'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-xs text-muted-foreground">Last Heartbeat</span>
                <span className="font-mono text-[10px] text-foreground">
                  {state?.last_heartbeat 
                    ? new Date(state.last_heartbeat).toLocaleTimeString() 
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {enabled && (
            <Card className="border-orange-500/20 bg-white/5 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => scheduleJob.mutate({ module: 'brain', action: 'reflect' })}
                  disabled={scheduleJob.isPending}
                >
                  <Play className="w-3 h-3" /> brain.reflect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => scheduleJob.mutate({ module: 'dream', action: 'cycle' })}
                  disabled={scheduleJob.isPending}
                >
                  <Play className="w-3 h-3" /> dream.cycle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => scheduleJob.mutate({ module: 'vision', action: 'snapshot' })}
                  disabled={scheduleJob.isPending}
                >
                  <Play className="w-3 h-3" /> vision.snapshot
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
