/**
 * Emergency Recovery Panel
 * Provides emergency rollback capabilities when substrate is in critical state
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, RotateCcw, Shield, RefreshCw, 
  Loader2, CheckCircle, XCircle, Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Backup {
  id: string;
  backup_id: string;
  backup_date: string;
  backup_path: string;
  substrate_version: string;
  restore_point_enabled: boolean;
  status: string;
  created_at: string;
}

interface EmergencyRecoveryPanelProps {
  showAlways?: boolean;
  isCritical?: boolean;
}

export function EmergencyRecoveryPanel({ showAlways = false, isCritical = false }: EmergencyRecoveryPanelProps) {
  const queryClient = useQueryClient();
  const [confirmValue, setConfirmValue] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  // Fetch recent backups
  const { data: backups, isLoading: backupsLoading, error: backupsError } = useQuery({
    queryKey: ['emergency-backups'],
    queryFn: async (): Promise<Backup[]> => {
      const { data, error } = await supabase
        .from('daily_backups')
        .select('*')
        .eq('restore_point_enabled', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as Backup[];
    },
    refetchInterval: 30000,
  });

  // Quick heal mutation
  const healMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'system', action: 'heal', payload: { force: true, test: true } }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Heal failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success('Emergency heal completed', {
        description: `${data.healed_modules?.length || 0} modules restored`,
      });
    },
    onError: (error) => {
      toast.error('Heal failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Restore from backup mutation
  const restoreMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { 
          module: 'system', 
          action: 'restore', 
          payload: { backup_id: backupId }
        }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Restore failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success('Backup restored', {
        description: `Restored ${data.restored_modules?.length || 0} components`,
      });
      setSelectedBackup(null);
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Restore failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Emergency shutdown mutation
  const shutdownMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'system', action: 'shutdown', payload: { confirm: true } }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Emergency shutdown initiated');
    },
    onError: (error) => {
      toast.error('Shutdown failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const hasBackups = backups && backups.length > 0;

  // Only show if critical or showAlways
  if (!showAlways && !isCritical) {
    return null;
  }

  return (
    <Card className={cn(
      "border transition-all",
      isCritical 
        ? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10 animate-pulse-slow" 
        : "border-neon-amber/30 bg-neon-amber/5"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className={cn(
            "w-5 h-5",
            isCritical ? "text-destructive" : "text-neon-amber"
          )} />
          {isCritical ? 'Emergency Recovery' : 'System Recovery Options'}
          {isCritical && (
            <Badge variant="destructive" className="ml-2">CRITICAL</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => healMutation.mutate()}
            disabled={healMutation.isPending}
            className={cn(
              "gap-2",
              isCritical 
                ? "bg-destructive hover:bg-destructive/90 text-white" 
                : "bg-neon-amber/20 hover:bg-neon-amber/30 text-neon-amber border border-neon-amber/30"
            )}
          >
            {healMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Emergency Heal
          </Button>
          
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
            className="gap-2 border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>

        {/* Backup Restore */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            Restore from Backup
          </h4>
          
          {backupsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : backupsError ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Failed to load backups
            </div>
          ) : !hasBackups ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No restore points available
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {backups.map((backup) => (
                <div 
                  key={backup.id}
                  className={cn(
                    "p-2 rounded-lg border cursor-pointer transition-all",
                    "bg-muted/10 border-border/30 hover:border-neon-cyan/30 hover:bg-muted/20",
                    selectedBackup === backup.backup_id && "border-neon-cyan/50 bg-neon-cyan/10"
                  )}
                  onClick={() => setSelectedBackup(
                    selectedBackup === backup.backup_id ? null : backup.backup_id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {backup.backup_id.slice(0, 15)}...
                      </span>
                      <Badge variant="outline" className="text-[9px] h-4">
                        {backup.substrate_version}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(backup.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedBackup === backup.backup_id && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="w-full gap-1 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore This Backup
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <RotateCcw className="w-5 h-5 text-neon-cyan" />
                              Restore from Backup
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will restore the substrate to the state at {new Date(backup.created_at).toLocaleString()}.
                              Type <strong>RESTORE</strong> to proceed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Input
                            value={confirmValue}
                            onChange={(e) => setConfirmValue(e.target.value)}
                            placeholder="Type RESTORE"
                            className="font-mono"
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmValue('')}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={confirmValue !== 'RESTORE' || restoreMutation.isPending}
                              onClick={() => restoreMutation.mutate(backup.backup_id)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              {restoreMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Restoring...
                                </>
                              ) : (
                                'Restore'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
          <span>
            {hasBackups ? `${backups.length} restore points available` : 'No backups'}
          </span>
          <div className="flex items-center gap-1">
            {healMutation.isSuccess && (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            )}
            {healMutation.isError && (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
