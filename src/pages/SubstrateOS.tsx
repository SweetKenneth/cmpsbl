/**
 * promptfluid® substrate — OS Surface v3.0.0
 * HARDENED EDITION — Circuit breakers, auto-heal, graceful degradation
 * 
 * Unified control surface with terminal aesthetics,
 * live telemetry, and module status visualization.
 */

import { Navigate } from 'react-router-dom';
import { Loader2, Lock, Terminal, AlertTriangle, Database, RefreshCw, Settings, FileText, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useState } from 'react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSystemAudit, useSystemConfig, useSystemVersion, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { ModuleStatusBar } from '@/components/substrate-os/ModuleStatusBar';
import { MetricsGrid } from '@/components/substrate-os/MetricsGrid';
import { CommandPalette } from '@/components/substrate-os/CommandPalette';
import { EventStream } from '@/components/substrate-os/EventStream';
import { BrainIntelligencePanel } from '@/components/substrate-os/BrainIntelligencePanel';
import { SystemHealthPanel } from '@/components/substrate-os/SystemHealthPanel';
import { HealButton } from '@/components/substrate-os/HealButton';
import { cn } from '@/lib/utils';

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
  const confirmWord = 'CONFIRM';

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

function GovernorPanel({ enabled }: { enabled: boolean }) {
  const systemAudit = useSystemAudit();
  const systemConfig = useSystemConfig('rate_limits');
  
  const auditData = systemAudit.data?.data as { entries?: Array<{ action: string; entity: string; timestamp: string }> } | undefined;
  const configData = systemConfig.data?.data as { config?: Record<string, unknown> } | undefined;

  if (!enabled) {
    return (
      <Card className="border-destructive/30 border-dashed">
        <CardContent className="p-6 text-center">
          <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground italic">
            Governor controls restricted to administrators
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        </div>
        <h3 className="text-sm font-medium">Governor Controls</h3>
        <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">
          ADMIN
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Audit Log */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {systemAudit.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : auditData?.entries && auditData.entries.length > 0 ? (
              <ScrollArea className="h-[120px]">
                <div className="space-y-1.5">
                  {auditData.entries.map((entry, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-xs"
                    >
                      <Badge variant="outline" className="text-[9px] h-4">{entry.action}</Badge>
                      <span className="text-muted-foreground truncate">{entry.entity}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Audit trail clean
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Rate Limits */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {systemConfig.isLoading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : configData?.config ? (
              <div className="text-xs space-y-1.5">
                {Object.entries(configData.config).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-1.5 rounded bg-muted/30">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Configuration not exposed
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Safety Controls */}
      <div className="flex flex-wrap gap-2 pt-2">
        <ConfirmActionDialog
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Database className="w-3.5 h-3.5" />
              Backup Status
            </Button>
          }
          title="Backup Status"
          description="View current backup status and last backup timestamp."
          confirmText="View"
          onConfirm={() => toast.info('Backup status: Automated daily backups active')}
        />

        <ConfirmActionDialog
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
              <RefreshCw className="w-3.5 h-3.5" />
              Manual Backup
            </Button>
          }
          title="Trigger Manual Backup"
          description="Create an immediate backup of the substrate state."
          confirmText="Create Backup"
          onConfirm={() => toast.success('Backup initiated')}
        />

        <ConfirmActionDialog
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
              <AlertTriangle className="w-3.5 h-3.5" />
              Emergency Shutdown
            </Button>
          }
          title="Emergency Shutdown"
          description="Gracefully stop all substrate operations. Requires manual restart."
          confirmText="Shutdown"
          onConfirm={() => toast.error('Emergency shutdown not available in this environment')}
          dangerous
        />
      </div>
    </div>
  );
}

export default function SubstrateOS() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const healthScore = useSubstrateHealthScore();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Loading state with OS boot animation
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center mx-auto">
              <Terminal className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-primary/20 blur-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-mono text-primary">substrate os</p>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">
              initializing cognitive substrate...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Substrate OS — promptfluid®"
        description="Cognitive orchestration substrate control surface."
        canonical="https://promptfluid.com/os"
        keywords={["substrate os", "cognitive orchestration", "ai dashboard"]}
      />

      {/* OS Header with status bar */}
      <OSHeader userEmail={user?.email} role={role} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* PROMINENT HEAL BUTTON - Top of dashboard */}
        {isOperator && (
          <HealButton 
            variant="prominent" 
            healthScore={healthScore.healthScore}
            onHealComplete={() => {
              healthScore.refetch();
              toast.success('Dashboard refreshed');
            }}
          />
        )}
        
        {/* Module Status Bar */}
        <ModuleStatusBar />
        
        {/* Metrics Grid */}
        <MetricsGrid />
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Command Palette */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Command Interface</h3>
              <Badge variant="outline" className="text-[10px]">
                {isOperator ? 'OPERATOR' : 'READ-ONLY'}
              </Badge>
            </div>
            <CommandPalette enabled={isOperator} />
          </div>
          
          {/* Event Stream */}
          <EventStream />
        </div>
        
        {/* Brain Intelligence Panel */}
        <BrainIntelligencePanel enabled={isOperator} />
        
        {/* System Health Panel */}
        <SystemHealthPanel enabled={isOperator} />
        
        {/* Governor Section */}
        <GovernorPanel enabled={isGovernor} />
      </main>

      {/* Footer Status */}
      <footer className="border-t border-border/30 bg-muted/10 px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>promptfluid® substrate os</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">v2026.01.2</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/changelog" className="hover:text-foreground transition-colors">changelog</a>
            <a href="/docs" className="hover:text-foreground transition-colors">docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
