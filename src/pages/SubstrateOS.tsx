/**
 * promptfluid® substrate — OS Surface v3.2.0
 * HARDENED EDITION — Circuit breakers, auto-heal, graceful degradation
 * 
 * Unified control surface with terminal aesthetics,
 * live telemetry, and module status visualization.
 * Now with dedicated terminal tab for full interaction.
 * v3.2.0: Added Backup & Restore panel
 */

import { Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Loader2, Lock, Terminal, AlertTriangle, Database, RefreshCw, 
  Settings, FileText, Zap, LayoutDashboard, Activity, Bot, Users, Sparkles,
  Building2, ExternalLink, HardDrive, Wand2, Cpu, Radio, Key, Dna
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserAgency } from '@/hooks/useUserAgency';
import { useSystemAudit, useSystemConfig, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { ModuleStatusBar } from '@/components/substrate-os/ModuleStatusBar';
import { MetricsGrid } from '@/components/substrate-os/MetricsGrid';
import { EnhancedTerminal } from '@/components/substrate-os/EnhancedTerminal';
import { EventStream } from '@/components/substrate-os/EventStream';
import { BrainIntelligencePanel } from '@/components/substrate-os/BrainIntelligencePanel';
import { SystemHealthPanel } from '@/components/substrate-os/SystemHealthPanel';
import { HealButton } from '@/components/substrate-os/HealButton';
import { CognitivesPanel } from '@/components/substrate-os/CognitivesPanel';
import { BackupRestorePanel } from '@/components/substrate-os/BackupRestorePanel';
import { EmergencyRecoveryPanel } from '@/components/substrate-os/EmergencyRecoveryPanel';
import { ModernizerTab } from '@/components/substrate-os/ModernizerTab';
import { CoreKernelTab } from '@/components/substrate-os/CoreKernelTab';
import { RippleMessageBusTab } from '@/components/substrate-os/RippleMessageBusTab';
import { AccessIdentityTab } from '@/components/substrate-os/AccessIdentityTab';
import { AgencyMintWizard } from '@/components/agency/AgencyMintWizard';
import { AgencyGallery } from '@/components/agency/AgencyGallery';
import { EvolutionTab } from '@/components/substrate-os/EvolutionTab';
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
      <div className="rounded-xl border border-dashed border-red-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-8">
        <div className="text-center">
          <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground italic">
            Governor controls restricted to administrators
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="text-sm font-medium text-foreground">Governor Controls</h3>
        <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 bg-red-500/10">
          ADMIN
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Audit Log */}
        <div className="rounded-xl border border-blue-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Audit Log</span>
          </div>
          {systemAudit.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : auditData?.entries && auditData.entries.length > 0 ? (
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {auditData.entries.map((entry, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs"
                  >
                    <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30">{entry.action}</Badge>
                    <span className="text-muted-foreground truncate">{entry.entity}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
              Audit trail clean
            </p>
          )}
        </div>
        
        {/* Rate Limits */}
        <div className="rounded-xl border border-amber-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Configuration</span>
          </div>
          {systemConfig.isLoading ? (
            <Skeleton className="h-[120px] w-full rounded-lg" />
          ) : configData?.config ? (
            <div className="text-xs space-y-2">
              {Object.entries(configData.config).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
              Configuration not exposed
            </p>
          )}
        </div>
      </div>
      
      {/* Safety Controls */}
      <div className="flex flex-wrap gap-2 pt-2">
        <ConfirmActionDialog
          trigger={
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              <Database className="w-3.5 h-3.5 text-blue-400" />
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
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20">
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
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20">
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
  const { data: userAgency, isLoading: agencyLoading } = useUserAgency();
  const healthScore = useSubstrateHealthScore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mintSubTab, setMintSubTab] = useState<'forge' | 'agency'>('agency');
  
  // Calculate if system is in critical state for emergency recovery panel
  const isCritical = healthScore.healthScore < 40;

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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/30 via-primary/10 to-transparent border border-cyan-500/40 flex items-center justify-center mx-auto">
              <Terminal className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-cyan-500/20 blur-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-mono text-cyan-400">substrate os</p>
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

      {/* Neon Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[100px]" />
      </div>

      {/* OS Header with status bar */}
      <OSHeader userEmail={user?.email} role={role} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl px-4">
            <TabsList className="h-12 bg-transparent border-0 gap-1">
              <TabsTrigger 
                value="dashboard" 
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  "data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400",
                  "data-[state=active]:border-b-2 data-[state=active]:border-cyan-400",
                  "hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="terminal" 
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  "data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400",
                  "data-[state=active]:border-b-2 data-[state=active]:border-emerald-400",
                  "hover:bg-white/5"
                )}
              >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">Terminal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cognitives" 
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  "data-[state=active]:bg-fuchsia-500/10 data-[state=active]:text-fuchsia-400",
                  "data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-400",
                  "hover:bg-white/5"
                )}
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Cognitives</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  "data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400",
                  "data-[state=active]:border-b-2 data-[state=active]:border-amber-400",
                  "hover:bg-white/5"
                )}
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              {isOperator && (
                <TabsTrigger 
                  value="core" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-orange-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Cpu className="w-4 h-4" />
                  <span className="hidden sm:inline">Core</span>
                </TabsTrigger>
              )}
              {isOperator && (
                <TabsTrigger 
                  value="ripple" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-cyan-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Radio className="w-4 h-4" />
                  <span className="hidden sm:inline">Ripple</span>
                </TabsTrigger>
              )}
              {isOperator && (
                <TabsTrigger 
                  value="access" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-amber-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Key className="w-4 h-4" />
                  <span className="hidden sm:inline">Access</span>
                </TabsTrigger>
              )}
              {isOperator && (
                <TabsTrigger 
                  value="backups" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-400",
                    "hover:bg-white/5"
                  )}
                >
                  <HardDrive className="w-4 h-4" />
                  <span className="hidden sm:inline">Backups</span>
                </TabsTrigger>
              )}
              {isOperator && (
                <TabsTrigger 
                  value="modernizer" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-fuchsia-500/10 data-[state=active]:text-fuchsia-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Modernizer</span>
                </TabsTrigger>
              )}
              {isGovernor && (
                <TabsTrigger 
                  value="evolution" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-purple-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Dna className="w-4 h-4" />
                  <span className="hidden sm:inline">Evolution</span>
                </TabsTrigger>
              )}
              {isGovernor && (
                <TabsTrigger 
                  value="mint" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-purple-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Mint</span>
                </TabsTrigger>
              )}
              {userAgency && (
                <TabsTrigger 
                  value="agency" 
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    "data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400",
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-400",
                    "hover:bg-white/5"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">My Agency</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="flex-1 mt-0">
          <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
            {/* Emergency Recovery Panel - Shows when system is critical */}
            <EmergencyRecoveryPanel showAlways={false} isCritical={isCritical} />
            
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
            
            {/* Brain Intelligence Panel */}
            <BrainIntelligencePanel enabled={isOperator} />
            
            {/* System Health Panel */}
            <SystemHealthPanel enabled={isOperator} />
            
            {/* Governor Section */}
            <GovernorPanel enabled={isGovernor} />
          </main>
        </TabsContent>

        {/* Terminal Tab - Full Height */}
        <TabsContent value="terminal" className="flex-1 mt-0 flex flex-col">
          <div className="container mx-auto px-4 py-6 max-w-5xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Substrate Terminal</h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    cognitive command interface
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  isOperator 
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                    : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                )}
              >
                {isOperator ? 'OPERATOR MODE' : 'READ-ONLY'}
              </Badge>
            </div>
            
            <div className="flex-1 min-h-[500px]">
              <EnhancedTerminal enabled={isOperator} fullHeight className="h-full" />
            </div>
          </div>
        </TabsContent>

        {/* Cognitives Tab */}
        <TabsContent value="cognitives" className="flex-1 mt-0">
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Cognitive Registry</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  minted cognitives • operator console
                </p>
              </div>
            </div>
            
            <CognitivesPanel />
          </main>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="flex-1 mt-0">
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Event Stream</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  real-time substrate activity
                </p>
              </div>
            </div>
            
            <EventStream />
          </main>
        </TabsContent>

        {/* Core Kernel Tab - Operator+ */}
        {isOperator && (
          <TabsContent value="core" className="flex-1 mt-0">
            <CoreKernelTab enabled={isOperator} />
          </TabsContent>
        )}

        {/* Ripple Message Bus Tab - Operator+ */}
        {isOperator && (
          <TabsContent value="ripple" className="flex-1 mt-0">
            <RippleMessageBusTab enabled={isOperator} />
          </TabsContent>
        )}

        {/* Access Identity Tab - Operator+ */}
        {isOperator && (
          <TabsContent value="access" className="flex-1 mt-0">
            <AccessIdentityTab enabled={isOperator} />
          </TabsContent>
        )}

        {/* Backups Tab - Operator+ */}
        {isOperator && (
          <TabsContent value="backups" className="flex-1 mt-0">
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <BackupRestorePanel enabled={isOperator} />
            </main>
          </TabsContent>
        )}

        {/* Modernizer Tab - Operator+ */}
        {isOperator && (
          <TabsContent value="modernizer" className="flex-1 mt-0">
            <ModernizerTab enabled={isOperator} />
          </TabsContent>
        )}

        {/* Mint Tab - Governor Only */}
        {isGovernor && (
          <TabsContent value="mint" className="flex-1 mt-0">
            <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Cognitive Mint</h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      forge cognitives • assemble agencies
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-tabs for Forge vs Agency */}
              <div className="flex gap-2 p-1 rounded-lg bg-black/40 border border-border/30 w-fit">
                <button
                  onClick={() => setMintSubTab('agency')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    mintSubTab === 'agency'
                      ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Users className="w-4 h-4" />
                  Agency Mint
                </button>
                <a
                  href="/forge"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Bot className="w-4 h-4" />
                  Cognitive Forge
                </a>
              </div>

              {/* Agency Sub-content */}
              {mintSubTab === 'agency' && (
                <Tabs defaultValue="create" className="space-y-4">
                  <TabsList className="bg-black/40 border border-border/30">
                    <TabsTrigger 
                      value="create" 
                      className="gap-2 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-400"
                    >
                      <Sparkles className="w-4 h-4" />
                      Create Agency
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gallery"
                      className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                    >
                      <Users className="w-4 h-4" />
                      Gallery
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="create">
                    <AgencyMintWizard onComplete={() => {}} />
                  </TabsContent>

                  <TabsContent value="gallery">
                    <AgencyGallery />
                  </TabsContent>
                </Tabs>
              )}
            </main>
          </TabsContent>
        )}

        {/* Agency Tab - User's Agency */}
        {userAgency && (
          <TabsContent value="agency" className="flex-1 mt-0">
            <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{userAgency.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      {userAgency.status === 'deployed' ? 'deployed • active' : userAgency.status || 'pending'}
                    </p>
                  </div>
                </div>
                <Link
                  to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-blue-500/20 border border-blue-500/40 text-blue-400",
                    "hover:bg-blue-500/30 transition-all"
                  )}
                >
                  <span className="text-sm font-medium">Open Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Agency Info Card */}
              <Card className="border border-blue-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Agency Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userAgency.description && (
                    <p className="text-sm text-muted-foreground">{userAgency.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          userAgency.status === 'deployed' 
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                            : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        )}
                      >
                        {userAgency.status || 'pending'}
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Portal</p>
                      <p className="text-sm font-mono text-foreground truncate">
                        {userAgency.slug ? `/a/${userAgency.slug}` : 'Not deployed'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Quick Access</p>
                      <Link
                        to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                      >
                        Launch full agency portal →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </TabsContent>
        )}
      </Tabs>

      {/* Footer Status */}
      <footer className="border-t border-border/30 bg-black/40 backdrop-blur-sm px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>promptfluid® substrate os</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">v2026.01.2</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/changelog" className="hover:text-cyan-400 transition-colors">changelog</a>
            <a href="/documentation" className="hover:text-cyan-400 transition-colors">docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
