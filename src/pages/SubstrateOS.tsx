/**
 * promptfluid® substrate — OS Surface v6.0.0
 * PREMIUM EDITION — 14 modules, 260+ commands, full introspection
 */

import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Loader2, Lock, Terminal, AlertTriangle, RefreshCw, FileText,
  Settings, Zap, LayoutDashboard, Activity, Bot, Users, Sparkles,
  Building2, ExternalLink, HardDrive, Wand2, Cpu, Radio, Key, Dna,
  ChevronRight, Menu, Shield, Layers, Gauge, ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserAgency } from '@/hooks/useUserAgency';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { EnhancedTerminal } from '@/components/substrate-os/EnhancedTerminal';
import { EventStream } from '@/components/substrate-os/EventStream';
import { BrainIntelligencePanel } from '@/components/substrate-os/BrainIntelligencePanel';
import { SystemHealthPanel } from '@/components/substrate-os/SystemHealthPanel';
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
import { CodeAgentTab } from '@/components/substrate-os/CodeAgentTab';
import { CortexTab } from '@/components/substrate-os/CortexTab';
import { InclusiveTab } from '@/components/substrate-os/InclusiveTab';
import { NexusTab } from '@/components/substrate-os/NexusTab';
import { DashboardMetricsHero, QuickActionsPanel, ModuleControlsGrid } from '@/components/substrate-os/dashboard';
import { cn } from '@/lib/utils';

// ============================================
// Tab Groups Configuration
// ============================================
interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan', description: 'System overview' },
    { id: 'events', label: 'Events', icon: Activity, color: 'amber', description: 'Live activity feed' },
    { id: 'cognitives', label: 'Cognitives', icon: Bot, color: 'fuchsia', description: 'Bot registry' },
  ];

  const operateTabs: TabConfig[] = [
    { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'emerald', description: 'Command interface' },
    ...(isOperator ? [
      { id: 'nexus', label: 'Nexus', icon: Zap, color: 'cyan', description: 'AI routing & images', minRole: 'operator' as const },
      { id: 'codeagent', label: 'CodeAgent', icon: Bot, color: 'violet', description: 'AI coding assistant', minRole: 'operator' as const },
      { id: 'core', label: 'Core', icon: Cpu, color: 'orange', description: 'Kernel controls', minRole: 'operator' as const },
      { id: 'ripple', label: 'Ripple', icon: Radio, color: 'cyan', description: 'Message bus', minRole: 'operator' as const },
      { id: 'access', label: 'Access', icon: Key, color: 'amber', description: 'Identity & keys', minRole: 'operator' as const },
      { id: 'cortex', label: 'Cortex', icon: Wand2, color: 'violet', description: 'Orchestrator', minRole: 'operator' as const },
      { id: 'inclusive', label: 'Inclusive', icon: Users, color: 'teal', description: 'Accessibility', minRole: 'operator' as const },
    ] : []),
  ];

  const evolveTabs: TabConfig[] = [
    ...(isOperator ? [
      { id: 'modernizer', label: 'Modernizer', icon: Wand2, color: 'fuchsia', description: 'Self-upgrade', minRole: 'operator' as const },
    ] : []),
    ...(isGovernor ? [
      { id: 'evolution', label: 'Evolution', icon: Dna, color: 'purple', description: 'System evolution', minRole: 'governor' as const },
    ] : []),
    ...(isOperator ? [
      { id: 'backups', label: 'Backups', icon: HardDrive, color: 'blue', description: 'Backup & restore', minRole: 'operator' as const },
    ] : []),
  ];

  const createTabs: TabConfig[] = [
    ...(isGovernor ? [
      { id: 'mint', label: 'Mint', icon: Sparkles, color: 'purple', description: 'Create cognitives', minRole: 'governor' as const },
    ] : []),
    ...(hasAgency ? [
      { id: 'agency', label: 'My Agency', icon: Building2, color: 'blue', description: 'Agency portal' },
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
// Enhanced Sidebar Navigation
// ============================================
interface SidebarNavProps {
  groups: TabGroup[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onClose?: () => void;
}

function SidebarNav({ groups, activeTab, onTabChange, collapsed = false, onClose }: SidebarNavProps) {
  const colorClasses: Record<string, { active: string; icon: string }> = {
    cyan: { active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40', icon: 'text-cyan-400' },
    emerald: { active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40', icon: 'text-emerald-400' },
    fuchsia: { active: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/40', icon: 'text-fuchsia-400' },
    amber: { active: 'bg-amber-500/10 text-amber-400 border-amber-500/40', icon: 'text-amber-400' },
    orange: { active: 'bg-orange-500/10 text-orange-400 border-orange-500/40', icon: 'text-orange-400' },
    purple: { active: 'bg-purple-500/10 text-purple-400 border-purple-500/40', icon: 'text-purple-400' },
    blue: { active: 'bg-blue-500/10 text-blue-400 border-blue-500/40', icon: 'text-blue-400' },
    violet: { active: 'bg-violet-500/10 text-violet-400 border-violet-500/40', icon: 'text-violet-400' },
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl border-r border-border/30",
      collapsed ? "w-16" : "w-60"
    )}>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {groups.map((group, groupIdx) => (
            <motion.div 
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
            >
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <group.icon className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.tabs.map((tab, tabIdx) => {
                  const isActive = activeTab === tab.id;
                  const colors = colorClasses[tab.color] || colorClasses.cyan;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        onClose?.();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? cn("border shadow-sm", colors.active)
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                      whileHover={{ x: collapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className={cn("w-4 h-4 shrink-0", isActive && colors.icon)} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{tab.label}</span>
                          {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CMPSBL v6.0.0</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Tab Header Component
// ============================================
interface TabHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

function TabHeader({ icon: Icon, title, subtitle, color, badge, action }: TabHeaderProps) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-400',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  };
  
  return (
    <motion.div 
      className="flex items-center justify-between mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {badge}
        {action}
      </div>
    </motion.div>
  );
}

// ============================================
// Governor Panel
// ============================================
function GovernorPanel({ enabled }: { enabled: boolean }) {
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; entity_type: string; created_at: string }>>([]);
  const [settings, setSettings] = useState<Array<{ key: string; value: string }>>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!enabled) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load audit logs from audit_logs table
        const { data: auditData } = await import('@/integrations/supabase/client').then(m =>
          m.supabase
            .from('audit_logs')
            .select('id, action, entity_type, created_at')
            .order('created_at', { ascending: false })
            .limit(10)
        );
        
        if (auditData) {
          setAuditLogs(auditData);
        }
        
        // Load settings from system_config table
        const { data: configData } = await import('@/integrations/supabase/client').then(m =>
          m.supabase
            .from('system_config')
            .select('key, value')
            .limit(6)
        );
        
        if (configData) {
          setSettings(configData.map(c => ({ key: c.key, value: String(c.value) })));
        } else {
          // Fallback to default settings
          setSettings([
            { key: 'maintenance_mode', value: 'false' },
            { key: 'api_rate_limit', value: '100/min' },
            { key: 'max_memory_tier_size', value: '10000' },
            { key: 'dream_cycle_interval', value: '24h' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load governor data:', error);
        // Use fallback settings
        setSettings([
          { key: 'maintenance_mode', value: 'false' },
          { key: 'api_rate_limit', value: '100/min' },
          { key: 'max_memory_tier_size', value: '10000' },
          { key: 'dream_cycle_interval', value: '24h' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [enabled]);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-red-500/20 bg-muted/5 backdrop-blur-xl p-8">
        <div className="text-center">
          <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground italic">Governor controls restricted to administrators</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Governor Controls</h3>
          <p className="text-[10px] text-muted-foreground font-mono">administrative operations</p>
        </div>
        <Badge variant="outline" className="ml-auto text-[10px] border-red-500/40 text-red-400 bg-red-500/10">ADMIN</Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-500/20 bg-muted/10 backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Audit Log</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}</div>
          ) : auditLogs.length > 0 ? (
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {auditLogs.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-xs">
                    <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30">{entry.action}</Badge>
                    <span className="text-muted-foreground truncate">{entry.entity_type || 'system'}</span>
                    <span className="text-muted-foreground/50 text-[9px] ml-auto">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground/70 italic">No recent audit events</p>
              <p className="text-[10px] text-muted-foreground/50">System activity is being monitored</p>
            </div>
          )}
        </div>
        
        <div className="rounded-xl border border-amber-500/20 bg-muted/10 backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Configuration</span>
          </div>
          {loading ? (
            <Skeleton className="h-[120px] w-full rounded-lg" />
          ) : (
            <ScrollArea className="h-[120px]">
              <div className="text-xs space-y-2">
                {settings.map((setting, idx) => (
                  <div key={idx} className="flex justify-between p-2 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground capitalize">{setting.key.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-foreground">{setting.value}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </motion.div>
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
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-primary/10 to-fuchsia-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto">
              <Terminal className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-cyan-500/30 blur-2xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold font-mono text-cyan-400">substrate os</p>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">initializing cognitive substrate...</p>
          </div>
        </motion.div>
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

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[100px]" />
      </div>

      <OSHeader userEmail={user?.email} role={role} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav groups={tabGroups} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-pb">
          <div className="grid grid-cols-5 px-2 py-2">
            {tabGroups.flatMap(g => g.tabs).slice(0, 4).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground active:bg-muted/50"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-muted-foreground active:bg-muted/50"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-background">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Navigation</h3>
            </div>
            <SidebarNav groups={tabGroups} activeTab={activeTab} onTabChange={setActiveTab} onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Content Area */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-0">
          <AnimatePresence mode="wait">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.main 
                key="dashboard"
                className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmergencyRecoveryPanel showAlways={false} isCritical={isCritical} />
                <DashboardMetricsHero />
                <QuickActionsPanel enabled={isOperator} onOpenTerminal={() => setActiveTab('terminal')} />
                <ModuleControlsGrid enabled={isOperator} />
                <BrainIntelligencePanel enabled={isOperator} />
                <SystemHealthPanel enabled={isOperator} />
                <GovernorPanel enabled={isGovernor} />
              </motion.main>
            )}

            {/* Terminal */}
            {activeTab === 'terminal' && (
              <motion.div 
                key="terminal"
                className="container mx-auto px-4 py-6 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-12rem)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader 
                  icon={Terminal}
                  title="Substrate Terminal"
                  subtitle="cognitive command interface"
                  color="emerald"
                  badge={
                    <Badge variant="outline" className={cn(
                      isOperator ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                    )}>
                      {isOperator ? 'OPERATOR MODE' : 'READ-ONLY'}
                    </Badge>
                  }
                />
                <div className="flex-1 min-h-[500px]">
                  <EnhancedTerminal enabled={isOperator} fullHeight className="h-full" />
                </div>
              </motion.div>
            )}

            {/* Cognitives */}
            {activeTab === 'cognitives' && (
              <motion.main 
                key="cognitives"
                className="container mx-auto px-4 py-6 max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader 
                  icon={Bot}
                  title="Cognitive Registry"
                  subtitle="minted cognitives • operator console"
                  color="fuchsia"
                />
                <CognitivesPanel />
              </motion.main>
            )}

            {/* Events */}
            {activeTab === 'events' && (
              <motion.main 
                key="events"
                className="container mx-auto px-4 py-6 max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader 
                  icon={Activity}
                  title="Event Stream"
                  subtitle="real-time substrate activity"
                  color="amber"
                />
                <EventStream />
              </motion.main>
            )}

            {/* CodeAgent */}
            {activeTab === 'codeagent' && isOperator && <CodeAgentTab enabled={isOperator} />}

            {/* Core Kernel */}
            {activeTab === 'core' && isOperator && <CoreKernelTab enabled={isOperator} />}

            {/* Ripple Message Bus */}
            {activeTab === 'ripple' && isOperator && <RippleMessageBusTab enabled={isOperator} />}

            {/* Access Identity */}
            {activeTab === 'access' && isOperator && <AccessIdentityTab enabled={isOperator} />}

            {/* Cortex Orchestrator */}
            {activeTab === 'cortex' && isOperator && <CortexTab enabled={isOperator} />}

            {/* Inclusive Accessibility */}
            {activeTab === 'inclusive' && isOperator && <InclusiveTab enabled={isOperator} />}

            {/* Backups */}
            {activeTab === 'backups' && isOperator && (
              <motion.main 
                key="backups"
                className="container mx-auto px-4 py-6 max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BackupRestorePanel enabled={isOperator} />
              </motion.main>
            )}

            {/* Modernizer */}
            {activeTab === 'modernizer' && isOperator && <ModernizerTab enabled={isOperator} />}

            {/* Evolution */}
            {activeTab === 'evolution' && isGovernor && (
              <motion.main 
                key="evolution"
                className="container mx-auto px-4 py-6 max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EvolutionTab />
              </motion.main>
            )}

            {/* Mint */}
            {activeTab === 'mint' && isGovernor && (
              <motion.main 
                key="mint"
                className="container mx-auto px-4 py-6 max-w-6xl space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader 
                  icon={Sparkles}
                  title="Cognitive Mint"
                  subtitle="forge cognitives • assemble agencies"
                  color="purple"
                />

                <div className="flex gap-2 p-1.5 rounded-xl bg-muted/30 border border-border/30 w-fit">
                  <button
                    onClick={() => setMintSubTab('agency')}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                      mintSubTab === 'agency'
                        ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Users className="w-4 h-4" />
                    Agency Mint
                  </button>
                  <a
                    href="/forge"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <Bot className="w-4 h-4" />
                    Cognitive Forge
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {mintSubTab === 'agency' && (
                  <Tabs defaultValue="create" className="space-y-4">
                    <TabsList className="bg-muted/30 border border-border/30">
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
              </motion.main>
            )}

            {/* Agency */}
            {activeTab === 'agency' && userAgency && (
              <motion.main 
                key="agency"
                className="container mx-auto px-4 py-6 max-w-6xl space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{userAgency.name}</h2>
                      <p className="text-xs text-muted-foreground font-mono">{userAgency.status === 'deployed' ? 'deployed • active' : userAgency.status || 'pending'}</p>
                    </div>
                  </div>
                  <Link
                    to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-all font-medium"
                  >
                    <span className="text-sm">Open Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                <Card className="border border-blue-500/20 bg-muted/10 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />Agency Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userAgency.description && <p className="text-sm text-muted-foreground">{userAgency.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-xl bg-muted/20 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge variant="outline" className={cn("text-[10px]",
                          userAgency.status === 'deployed' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        )}>
                          {userAgency.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="rounded-xl bg-muted/20 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Portal</p>
                        <p className="text-sm font-mono text-foreground truncate">{userAgency.slug ? `/a/${userAgency.slug}` : 'Not deployed'}</p>
                      </div>
                      <div className="rounded-xl bg-muted/20 p-4 text-center col-span-2">
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
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Status */}
      <footer className="hidden lg:block border-t border-border/30 bg-gradient-to-r from-background/80 via-muted/30 to-background/80 backdrop-blur-sm px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>promptfluid® substrate os</span>
            </div>
            <span>•</span>
            <span>v6.0.0</span>
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
