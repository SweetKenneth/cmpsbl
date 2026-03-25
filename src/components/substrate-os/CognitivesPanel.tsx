/**
 * Cognitives Panel — Operator Console for Cognitive Registry
 * Displays minted cognitives with status, metrics, and controls
 * Integrated with the layered architecture
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
      <div className="rounded-xl border border-neon-magenta/20 bg-muted/50 dark:bg-muted/30 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-magenta/20 border border-neon-magenta/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-neon-magenta" />
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
      <div className="rounded-xl border border-neon-magenta/20 bg-muted/50 dark:bg-muted/30 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-magenta/20 border border-neon-magenta/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-neon-magenta" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Cognitive Registry</h3>
                <p className="text-[10px] text-muted-foreground font-mono">operator console</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-neon-magenta/40 text-neon-magenta bg-neon-magenta/10">
              {cognitives?.length || 0} minted
            </Badge>
          </div>
        </div>
        <div className="p-4">
          {!cognitives?.length ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Bot className="w-16 h-16 text-muted-foreground/30" />
                <div className="absolute inset-0 bg-neon-magenta/20 rounded-full blur-xl" />
              </div>
              <p className="text-sm text-muted-foreground">No cognitives minted yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Use the Forge to create your first cognitive
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-2">
                {cognitives.map((cognitive) => {
                  const ClassIcon = CLASS_ICONS[cognitive.class] || Bot;
                  const classColor = CLASS_COLORS[cognitive.class] || 'gray';
                  const statusConfig = STATUS_CONFIG[cognitive.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  
                  const colorBorderMap: Record<string, string> = {
                    cyan: 'border-neon-cyan/20 hover:border-neon-cyan/40',
                    emerald: 'border-neon-green/20 hover:border-neon-green/40',
                    violet: 'border-neon-purple/20 hover:border-neon-purple/40',
                    amber: 'border-neon-amber/20 hover:border-neon-amber/40',
                    rose: 'border-neon-magenta/20 hover:border-neon-magenta/40',
                    fuchsia: 'border-neon-magenta/20 hover:border-neon-magenta/40',
                  };
                  const colorIconBgMap: Record<string, string> = {
                    cyan: 'bg-neon-cyan/20 border-neon-cyan/40',
                    emerald: 'bg-neon-green/20 border-neon-green/40',
                    violet: 'bg-neon-purple/20 border-neon-purple/40',
                    amber: 'bg-neon-amber/20 border-neon-amber/40',
                    rose: 'bg-neon-magenta/20 border-neon-magenta/40',
                    fuchsia: 'bg-neon-magenta/20 border-neon-magenta/40',
                  };
                  const colorTextMap: Record<string, string> = {
                    cyan: 'text-neon-cyan',
                    emerald: 'text-neon-green',
                    violet: 'text-neon-purple',
                    amber: 'text-neon-amber',
                    rose: 'text-neon-magenta',
                    fuchsia: 'text-neon-magenta',
                  };
                  
                  return (
                    <div 
                      key={cognitive.id}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border bg-muted/50 dark:bg-muted/30 backdrop-blur-sm transition-all duration-300",
                        "hover:bg-muted/70 hover:shadow-lg",
                        "overflow-hidden",
                        colorBorderMap[classColor] || colorBorderMap.cyan
                      )}
                    >
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
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
                              <span className="flex items-center gap-1 text-neon-magenta">
                                <Brain className="w-3 h-3" />
                                Dream
                              </span>
                            )}
                            {cognitive.graph_enabled && (
                              <span className="flex items-center gap-1 text-neon-cyan">
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
                              className="text-neon-amber"
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
