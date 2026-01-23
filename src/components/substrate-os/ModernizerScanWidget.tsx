/**
 * Modernizer Scan Widget
 * Quick scan and archived function discovery for the dashboard
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, Loader2, RefreshCw, Archive, ChevronRight,
  CheckCircle, AlertTriangle, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScanResult {
  success: boolean;
  proposals: Array<{
    area: string;
    priority: string;
    description: string;
    action: string;
  }>;
  analysis: {
    orchestrator: { health: number; phase: string; cycles: number };
    performance: { success_rate: string };
    data_density: Record<string, number>;
  };
  message: string;
}

interface ArchivedOpportunity {
  archived_function: string;
  repurpose_for: string;
  description: string;
  value: string;
  complexity: string;
}

interface ModernizerScanWidgetProps {
  enabled: boolean;
}

export function ModernizerScanWidget({ enabled }: ModernizerScanWidgetProps) {
  const [showArchived, setShowArchived] = useState(false);

  // Quick status check
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['modernizer-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'status' }
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
    enabled,
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'scan' }
      });
      if (error) throw error;
      return data as ScanResult;
    },
    onSuccess: (data) => {
      if (data.proposals?.length > 0) {
        toast.info(`Found ${data.proposals.length} improvement areas`);
      } else {
        toast.success('Substrate is healthy - no issues found');
      }
    },
    onError: (error) => {
      toast.error('Scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Archived functions query
  const { data: archived, isLoading: archivedLoading } = useQuery({
    queryKey: ['modernizer-archived'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'archived' }
      });
      if (error) throw error;
      return data.repurposing_opportunities as ArchivedOpportunity[];
    },
    enabled: enabled && showArchived,
  });

  if (!enabled) return null;

  const healthScore = status?.health?.score ?? 100;
  const isHealthy = healthScore >= 80;
  const proposalCount = scanMutation.data?.proposals?.length ?? 0;

  return (
    <Card className="border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            </div>
            <span>Modernizer</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px]",
                isHealthy 
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : "border-amber-500/50 text-amber-400 bg-amber-500/10"
              )}
            >
              {isHealthy ? 'HEALTHY' : 'NEEDS ATTENTION'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        {statusLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-foreground">{healthScore}%</p>
              <p className="text-[10px] text-muted-foreground">Health</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-foreground">
                {status?.substrate_metrics?.orchestrator_health ? '✓' : '?'}
              </p>
              <p className="text-[10px] text-muted-foreground">Orchestrator</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-foreground">{proposalCount}</p>
              <p className="text-[10px] text-muted-foreground">Issues</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="flex-1 gap-1 border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10"
          >
            {scanMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                Quick Scan
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "flex-1 gap-1 border-white/10",
              showArchived && "bg-white/10"
            )}
          >
            <Archive className="w-3 h-3" />
            Archived
            <ChevronRight className={cn(
              "w-3 h-3 transition-transform",
              showArchived && "rotate-90"
            )} />
          </Button>
        </div>

        {/* Scan Results */}
        {scanMutation.data && scanMutation.data.proposals?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Improvement Areas:</p>
            <div className="space-y-1">
              {scanMutation.data.proposals.slice(0, 3).map((proposal, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/5 text-xs"
                >
                  {proposal.priority === 'critical' ? (
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                  ) : proposal.priority === 'high' ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-muted-foreground">{proposal.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Functions */}
        {showArchived && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="text-xs font-medium text-muted-foreground">
              Archived Functions to Repurpose:
            </p>
            {archivedLoading ? (
              <div className="space-y-1">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : archived && archived.length > 0 ? (
              <ScrollArea className="h-[120px]">
                <div className="space-y-1">
                  {archived.map((opp, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] h-4",
                            opp.value === 'high' 
                              ? "border-emerald-500/50 text-emerald-400"
                              : "border-white/20"
                          )}
                        >
                          {opp.value}
                        </Badge>
                        <span className="font-mono text-muted-foreground truncate max-w-[120px]">
                          {opp.archived_function}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-400">{opp.repurpose_for}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground/70 text-center py-2">
                No archived functions available
              </p>
            )}
          </div>
        )}

        {/* All healthy message */}
        {scanMutation.data && scanMutation.data.proposals?.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">
              Substrate is healthy — no improvements needed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
