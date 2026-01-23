/**
 * promptfluid® substrate — OS Surface v4.0.0
 * REDESIGNED EDITION — Sidebar navigation, grouped tabs, maximum efficiency
 */

import { Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Loader2, Lock, Terminal, AlertTriangle, Database, RefreshCw, 
  Settings, FileText, Zap, LayoutDashboard, Activity, Bot, Users, Sparkles,
  Building2, ExternalLink, HardDrive, Wand2, Cpu, Radio, Key, Dna,
  ChevronRight, Menu, X, Shield, Layers, Gauge
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ============================================
// Tab Groups Configuration
// ============================================
interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  minRole?: 'observer' | 'operator' | 'governor';
}

interface TabGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tabs: TabConfig[];
}

function getTabGroups(isOperator: boolean, isGovernor: boolean, hasAgency: boolean): TabGroup[] {
  const observeTabs: TabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan' },
    { id: 'events', label: 'Events', icon: Activity, color: 'amber' },
    { id: 'cognitives', label: 'Cognitives', icon: Bot, color: 'fuchsia' },
  ];

  const operateTabs: TabConfig[] = [
    { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'emerald' },
    ...(isOperator ? [
      { id: 'core', label: 'Core', icon: Cpu, color: 'orange', minRole: 'operator' as const },
      { id: 'ripple', label: 'Ripple', icon: Radio, color: 'cyan', minRole: 'operator' as const },
      { id: 'access', label: 'Access', icon: Key, color: 'amber', minRole: 'operator' as const },
    ] : []),
  ];

  const evolveTabs: TabConfig[] = [
    ...(isOperator ? [
      { id: 'modernizer', label: 'Modernizer', icon: Wand2, color: 'fuchsia', minRole: 'operator' as const },
    ] : []),
    ...(isGovernor ? [
      { id: 'evolution', label: 'Evolution', icon: Dna, color: 'purple', minRole: 'governor' as const },
    ] : []),
    ...(isOperator ? [
      { id: 'backups', label: 'Backups', icon: HardDrive, color: 'blue', minRole: 'operator' as const },
    ] : []),
  ];

  const createTabs: TabConfig[] = [
    ...(isGovernor ? [
      { id: 'mint', label: 'Mint', icon: Sparkles, color: 'purple', minRole: 'governor' as const },
    ] : []),
    ...(hasAgency ? [
      { id: 'agency', label: 'My Agency', icon: Building2, color: 'blue' },
    ] : []),
  ];

  const groups: TabGroup[] = [
    { id: 'observe', label: 'Observe', icon: Gauge, tabs: observeTabs },
    { id: 'operate', label: 'Operate', icon: Terminal, tabs: operateTabs },
  ];

  if (evolveTabs.length > 0) {
    groups.push({ id: 'evolve', label: 'Evolve', icon: Dna, tabs: evolveTabs });
  }
  if (createTabs.length > 0) {
    groups.push({ id: 'create', label: 'Create', icon: Sparkles, tabs: createTabs });
  }

  return groups;
}

// ============================================
// Sidebar Navigation
// ============================================
interface SidebarNavProps {
  groups: TabGroup[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onClose?: () => void;
}

function SidebarNav({ groups, activeTab, onTabChange, collapsed = false, onClose }: SidebarNavProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-white/10", collapsed ? "w-16" : "w-56")}>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {groups.map((group) => (
            <div key={group.id}>
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <group.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const colorClasses = {
                    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40',
                    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
                    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/40',
                    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
                    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/40',
                    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/40',
                    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
                  };
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        onClose?.();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? cn("border", colorClasses[tab.color as keyof typeof colorClasses])
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <tab.icon className={cn("w-4 h-4", isActive && `text-${tab.color}-400`)} />
                      {!collapsed && <span>{tab.label}</span>}
                      {isActive && !collapsed && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

// ============================================
// Governor Panel (preserved)
// ============================================
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
          <p className="text-sm text-muted-foreground italic">Governor controls restricted to administrators</p>
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
        <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 bg-red-500/10">ADMIN</Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Audit Log</span>
          </div>
          {systemAudit.isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}</div>
          ) : auditData?.entries && auditData.entries.length > 0 ? (
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {auditData.entries.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs">
                    <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30">{entry.action}</Badge>
                    <span className="text-muted-foreground truncate">{entry.entity}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">Audit trail clean</p>
          )}
        </div>
        
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
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">Configuration not exposed</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export default function SubstrateOS() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const { data: userAgency, isLoading: agencyLoading } = useUserAgency();
  const healthScore = useSubstrateHealthScore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mintSubTab, setMintSubTab] = useState<'forge' | 'agency'>('agency');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isCritical = healthScore.healthScore < 40;
  const tabGroups = getTabGroups(isOperator, isGovernor, !!userAgency);

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

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
            <p className="text-xs text-muted-foreground font-mono animate-pulse">initializing cognitive substrate...</p>
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

      {/* OS Header */}
      <OSHeader userEmail={user?.email} role={role} />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav groups={tabGroups} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-56">
            <SidebarNav groups={tabGroups} activeTab={activeTab} onTabChange={setActiveTab} onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
              <EmergencyRecoveryPanel showAlways={false} isCritical={isCritical} />
              {isOperator && (
                <HealButton 
                  variant="prominent" 
                  healthScore={healthScore.healthScore}
                  onHealComplete={() => { healthScore.refetch(); toast.success('Dashboard refreshed'); }}
                />
              )}
              <ModuleStatusBar />
              <MetricsGrid />
              <BrainIntelligencePanel enabled={isOperator} />
              <SystemHealthPanel enabled={isOperator} />
              <GovernorPanel enabled={isGovernor} />
            </main>
          )}

          {/* Terminal */}
          {activeTab === 'terminal' && (
            <div className="container mx-auto px-4 py-6 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-12rem)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Substrate Terminal</h2>
                    <p className="text-xs text-muted-foreground font-mono">cognitive command interface</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  isOperator ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                )}>
                  {isOperator ? 'OPERATOR MODE' : 'READ-ONLY'}
                </Badge>
              </div>
              <div className="flex-1 min-h-[500px]">
                <EnhancedTerminal enabled={isOperator} fullHeight className="h-full" />
              </div>
            </div>
          )}

          {/* Cognitives */}
          {activeTab === 'cognitives' && (
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Cognitive Registry</h2>
                  <p className="text-xs text-muted-foreground font-mono">minted cognitives • operator console</p>
                </div>
              </div>
              <CognitivesPanel />
            </main>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Event Stream</h2>
                  <p className="text-xs text-muted-foreground font-mono">real-time substrate activity</p>
                </div>
              </div>
              <EventStream />
            </main>
          )}

          {/* Core Kernel */}
          {activeTab === 'core' && isOperator && <CoreKernelTab enabled={isOperator} />}

          {/* Ripple Message Bus */}
          {activeTab === 'ripple' && isOperator && <RippleMessageBusTab enabled={isOperator} />}

          {/* Access Identity */}
          {activeTab === 'access' && isOperator && <AccessIdentityTab enabled={isOperator} />}

          {/* Backups */}
          {activeTab === 'backups' && isOperator && (
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <BackupRestorePanel enabled={isOperator} />
            </main>
          )}

          {/* Modernizer */}
          {activeTab === 'modernizer' && isOperator && <ModernizerTab enabled={isOperator} />}

          {/* Evolution */}
          {activeTab === 'evolution' && isGovernor && (
            <main className="container mx-auto px-4 py-6 max-w-7xl">
              <EvolutionTab />
            </main>
          )}

          {/* Mint */}
          {activeTab === 'mint' && isGovernor && (
            <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Cognitive Mint</h2>
                    <p className="text-xs text-muted-foreground font-mono">forge cognitives • assemble agencies</p>
                  </div>
                </div>
              </div>

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
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  <Bot className="w-4 h-4" />
                  Cognitive Forge
                </a>
              </div>

              {mintSubTab === 'agency' && (
                <Tabs defaultValue="create" className="space-y-4">
                  <TabsList className="bg-black/40 border border-border/30">
                    <TabsTrigger value="create" className="gap-2 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-400">
                      <Sparkles className="w-4 h-4" />Create Agency
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                      <Users className="w-4 h-4" />Gallery
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="create"><AgencyMintWizard onComplete={() => {}} /></TabsContent>
                  <TabsContent value="gallery"><AgencyGallery /></TabsContent>
                </Tabs>
              )}
            </main>
          )}

          {/* Agency */}
          {activeTab === 'agency' && userAgency && (
            <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{userAgency.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{userAgency.status === 'deployed' ? 'deployed • active' : userAgency.status || 'pending'}</p>
                  </div>
                </div>
                <Link
                  to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                  <span className="text-sm font-medium">Open Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <Card className="border border-blue-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />Agency Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userAgency.description && <p className="text-sm text-muted-foreground">{userAgency.description}</p>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge variant="outline" className={cn("text-[10px]",
                        userAgency.status === 'deployed' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      )}>
                        {userAgency.status || 'pending'}
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Portal</p>
                      <p className="text-sm font-mono text-foreground truncate">{userAgency.slug ? `/a/${userAgency.slug}` : 'Not deployed'}</p>
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
          )}
        </div>
      </div>

      {/* Footer Status */}
      <footer className="border-t border-border/30 bg-black/40 backdrop-blur-sm px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>promptfluid® substrate os</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">v4.0.0</span>
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
