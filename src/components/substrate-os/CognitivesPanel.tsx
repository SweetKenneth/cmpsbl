/**
 * Cognitives Panel — Operator Console for Cognitive Registry
 * v8.0.0 SYNERGY+ Epoch — Displays minted cognitives with status, metrics, and controls
 * Integrated with the 6-layer, 21-module architecture
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bot, Play, Pause, Trash2, Download, ExternalLink,
  RefreshCw, AlertTriangle, CheckCircle, Clock, Zap,
  Search, Code, BarChart3, Workflow, PenLine, Layers,
  MoreHorizontal, Activity, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { createExportBundle, downloadBundle, ExportConfig } from '@/lib/forge/botExporter';
import { Json } from '@/integrations/supabase/types';

interface Cognitive {
  id: string;
  name: string;
  class: string;
  version: string;
  memory_mode: string;
  learning_mode: string[] | null;
  dream_enabled: boolean | null;
  graph_enabled: boolean | null;
  capabilities: Json;
  providers: Json;
  status: string;
  error_count: number | null;
  last_run_at: string | null;
  created_at: string;
}

const CLASS_ICONS: Record<string, React.ElementType> = {
  Research: Search,
  Coding: Code,
  Analyst: BarChart3,
  Ops: Workflow,
  Writing: PenLine,
  Hybrid: Layers,
};

const CLASS_COLORS: Record<string, string> = {
  Research: 'cyan',
  Coding: 'emerald',
  Analyst: 'violet',
  Ops: 'amber',
  Writing: 'rose',
  Hybrid: 'fuchsia',
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  active: { color: 'emerald', icon: CheckCircle },
  suspended: { color: 'amber', icon: Pause },
  deprecated: { color: 'red', icon: AlertTriangle },
  pending: { color: 'blue', icon: Clock },
};

export function CognitivesPanel() {
  const queryClient = useQueryClient();
  const [selectedCognitive, setSelectedCognitive] = useState<Cognitive | null>(null);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'deprecate' | 'delete' | null>(null);

  const { data: cognitives, isLoading } = useQuery({
    queryKey: ['cognitive-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cognitive_registry')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Cognitive[];
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('cognitive_registry')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cognitive-registry'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cognitive_registry')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cognitive-registry'] });
      toast.success('Cognitive deleted');
    },
    onError: () => {
      toast.error('Failed to delete cognitive');
    },
  });

  const handleExport = async (cognitive: Cognitive) => {
    try {
      const config: ExportConfig = {
        id: cognitive.id,
        name: cognitive.name,
        class: cognitive.class,
        version: cognitive.version,
        memoryMode: cognitive.memory_mode,
        learningModes: cognitive.learning_mode || ['task'],
        capabilities: Array.isArray(cognitive.capabilities) ? cognitive.capabilities as string[] : [],
        providers: Array.isArray(cognitive.providers) ? cognitive.providers as string[] : [],
        dreamEnabled: cognitive.dream_enabled || false,
        graphEnabled: cognitive.graph_enabled || false,
      };
      
      const bundle = await createExportBundle(config);
      downloadBundle(bundle);
      toast.success('Export bundle downloaded');
    } catch (err) {
      toast.error('Failed to export cognitive');
    }
  };

  const handleAction = () => {
    if (!selectedCognitive || !confirmAction) return;
    
    switch (confirmAction) {
      case 'suspend':
        updateStatusMutation.mutate({ id: selectedCognitive.id, status: 'suspended' });
        break;
      case 'deprecate':
        updateStatusMutation.mutate({ id: selectedCognitive.id, status: 'deprecated' });
        break;
      case 'delete':
        deleteMutation.mutate(selectedCognitive.id);
        break;
    }
    
    setConfirmAction(null);
    setSelectedCognitive(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-fuchsia-400" />
          </div>
          <span className="text-sm font-medium">Cognitives</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Cognitive Registry</h3>
                <p className="text-[10px] text-muted-foreground font-mono">operator console</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-500/10">
              {cognitives?.length || 0} minted
            </Badge>
          </div>
        </div>
        <div className="p-4">
          {!cognitives?.length ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Bot className="w-16 h-16 text-muted-foreground/30" />
                <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-xl" />
              </div>
              <p className="text-sm text-muted-foreground">No cognitives minted yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Use the Forge to create your first cognitive
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] -mx-2 px-2">
              <div className="space-y-3">
                {cognitives.map((cognitive) => {
                  const ClassIcon = CLASS_ICONS[cognitive.class] || Bot;
                  const classColor = CLASS_COLORS[cognitive.class] || 'gray';
                  const statusConfig = STATUS_CONFIG[cognitive.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  
                  const colorBorderMap: Record<string, string> = {
                    cyan: 'border-cyan-500/20 hover:border-cyan-500/40',
                    emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
                    violet: 'border-violet-500/20 hover:border-violet-500/40',
                    amber: 'border-amber-500/20 hover:border-amber-500/40',
                    rose: 'border-rose-500/20 hover:border-rose-500/40',
                    fuchsia: 'border-fuchsia-500/20 hover:border-fuchsia-500/40',
                  };
                  const colorIconBgMap: Record<string, string> = {
                    cyan: 'bg-cyan-500/20 border-cyan-500/40',
                    emerald: 'bg-emerald-500/20 border-emerald-500/40',
                    violet: 'bg-violet-500/20 border-violet-500/40',
                    amber: 'bg-amber-500/20 border-amber-500/40',
                    rose: 'bg-rose-500/20 border-rose-500/40',
                    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/40',
                  };
                  const colorTextMap: Record<string, string> = {
                    cyan: 'text-cyan-400',
                    emerald: 'text-emerald-400',
                    violet: 'text-violet-400',
                    amber: 'text-amber-400',
                    rose: 'text-rose-400',
                    fuchsia: 'text-fuchsia-400',
                  };
                  
                  return (
                    <div 
                      key={cognitive.id}
                      className={cn(
                        "p-4 rounded-xl border bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm transition-all duration-300",
                        "hover:bg-white/10 hover:shadow-lg",
                        colorBorderMap[classColor] || colorBorderMap.cyan
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                          colorIconBgMap[classColor] || colorIconBgMap.cyan
                        )}>
                          <ClassIcon className={cn("w-5 h-5", colorTextMap[classColor] || colorTextMap.cyan)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{cognitive.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[9px] h-4",
                                `border-${statusConfig.color}-500/50 text-${statusConfig.color}-400`
                              )}
                            >
                              <StatusIcon className="w-2.5 h-2.5 mr-1" />
                              {cognitive.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className={cn(`text-${classColor}-400`)}>{cognitive.class}</span>
                            <span>•</span>
                            <span>v{cognitive.version}</span>
                            <span>•</span>
                            <span>{cognitive.memory_mode}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2 text-[10px]">
                            {cognitive.dream_enabled && (
                              <span className="flex items-center gap-1 text-fuchsia-400">
                                <Brain className="w-3 h-3" />
                                Dream
                              </span>
                            )}
                            {cognitive.graph_enabled && (
                              <span className="flex items-center gap-1 text-cyan-400">
                                <Activity className="w-3 h-3" />
                                Graph
                              </span>
                            )}
                            {cognitive.last_run_at && (
                              <span className="text-muted-foreground">
                                Last run: {formatDistanceToNow(new Date(cognitive.last_run_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleExport(cognitive)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export Bundle
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Repo
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <Play className="w-4 h-4 mr-2" />
                              Test Runtime
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {cognitive.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedCognitive(cognitive);
                                  setConfirmAction('suspend');
                                }}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {cognitive.status === 'suspended' && (
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: cognitive.id, status: 'active' })}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedCognitive(cognitive);
                                setConfirmAction('deprecate');
                              }}
                              className="text-amber-400"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Deprecate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedCognitive(cognitive);
                                setConfirmAction('delete');
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'delete' ? 'Delete Cognitive?' : 
               confirmAction === 'suspend' ? 'Suspend Cognitive?' : 
               'Deprecate Cognitive?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'delete' 
                ? 'This will permanently remove the cognitive from the registry.'
                : confirmAction === 'suspend'
                ? 'The cognitive will be paused and unable to process requests.'
                : 'The cognitive will be marked as deprecated and should be replaced.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={confirmAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
