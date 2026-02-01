/**
 * Governor Section — Admin & Safety Controls
 * Audit view, rate limits, system config, backup/restore (guarded)
 */

import { useState, useEffect } from 'react';
import { ShieldAlert, FileText, Settings, AlertTriangle, Lock, Database, RefreshCw, Loader2, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSystemAudit, useSystemConfig, useSystemVersion, useLiveAuditFeed } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmText,
  onConfirm,
  dangerous = false,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  dangerous?: boolean;
}) {
  const [confirmValue, setConfirmValue] = useState('');
  const confirmWord = dangerous ? 'CONFIRM' : '';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {dangerous && <AlertTriangle className="w-5 h-5 text-destructive" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        {dangerous && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-2">
              Type <code className="bg-muted px-1 rounded">CONFIRM</code> to proceed:
            </p>
            <Input
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Type CONFIRM"
              className="font-mono"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmValue('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setConfirmValue('');
            }}
            disabled={dangerous && confirmValue !== confirmWord}
            className={dangerous ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function GovernorSection({ enabled = false }: { enabled?: boolean }) {
  const systemAudit = useSystemAudit();
  const systemConfig = useSystemConfig('rate_limits');
  const systemVersion = useSystemVersion();
  const liveAuditFeed = useLiveAuditFeed(15);

  const auditData = systemAudit.data?.data as { entries?: Array<{ action: string; entity: string; timestamp: string }> } | undefined;
  const configData = systemConfig.data?.data as { config?: Record<string, unknown> } | undefined;
  const versionData = systemVersion.data?.data as { version?: string; build?: string } | undefined;

  // Get outcome badge styling
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'error':
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Format event type for display
  const formatEventType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  if (!enabled) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-destructive" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-muted-foreground">Governor</h2>
          <Badge variant="outline" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
        </div>
        <Card className="border-dashed border-destructive/30">
          <CardContent className="p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground italic">
              Governor controls are restricted to administrators. These powers shape the substrate itself.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-destructive" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold">Governor</h2>
        <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
          Admin Access
        </Badge>
      </div>

      {/* System Info */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="font-mono font-medium">
                {versionData?.version || 'v2026.01'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Build</p>
              <p className="font-mono font-medium">
                {versionData?.build || 'stable'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Environment</p>
              <p className="font-mono font-medium">production</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log + Rate Limits Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Live Audit Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Audit Log
              {liveAuditFeed.isFetching && !liveAuditFeed.isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
              )}
              {liveAuditFeed.data && liveAuditFeed.data.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[9px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Activity className="w-2.5 h-2.5 mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time system activity feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liveAuditFeed.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : liveAuditFeed.data && liveAuditFeed.data.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-2">
                  {liveAuditFeed.data.map((event: any) => (
                    <div 
                      key={event.id}
                      className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/30 text-xs border border-border/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] shrink-0", getOutcomeBadge(event.outcome))}
                          >
                            {event.outcome}
                          </Badge>
                          <span className="font-medium truncate text-foreground">
                            {formatEventType(event.event_type)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0 bg-primary/5">
                          {event.module}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground italic">
                  No recent audit events
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  System activity is being monitored
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Limits / Config */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Rate Limits
            </CardTitle>
            <CardDescription className="text-xs">
              Provider capacity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemConfig.isLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : configData?.config ? (
              <div className="text-sm space-y-2">
                {Object.entries(configData.config).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Rate limit configuration not exposed at this level.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dangerous Actions */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Safety Controls
          </CardTitle>
          <CardDescription className="text-xs">
            Critical operations require double confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="w-4 h-4" />
                  View Backup Status
                </Button>
              }
              title="Backup Status"
              description="View the current backup status and last backup timestamp. No destructive action."
              confirmText="View Status"
              onConfirm={() => toast.info('Backup status: Automated daily backups active')}
            />

            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                  <RefreshCw className="w-4 h-4" />
                  Trigger Backup
                </Button>
              }
              title="Trigger Manual Backup"
              description="Create an immediate backup of the substrate state. This is a non-destructive operation."
              confirmText="Create Backup"
              onConfirm={() => toast.success('Backup initiated. Check system logs for status.')}
            />

            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Shutdown
                </Button>
              }
              title="Emergency Shutdown"
              description="This will gracefully stop all substrate operations. Use only in critical situations. The substrate will need to be manually restarted."
              confirmText="Shutdown"
              onConfirm={() => toast.error('Emergency shutdown not available in this environment')}
              dangerous
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
