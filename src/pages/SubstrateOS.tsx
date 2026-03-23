/**
 * CMPSBL Substrate — Command Center
 * Mobile-first, rebuilt for 40-primitive matrix with 675+ capabilities.
 * Enterprise in light mode, Neon Dreams in dark.
 */

import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense, memo, useCallback, useEffect, useMemo } from 'react';
import { ModuleErrorBoundary } from '@/components/system/ModuleErrorBoundary';
import {
  Loader2, Terminal, LayoutDashboard, Activity, Bot, Sparkles,
  Building2, Cpu, Shield, Layers, Eye, LogOut, Home, Network, Zap,
  Menu, X, Brain, Gauge, HardDrive, FileText, Settings, UserCircle,
  GitBranch, Wrench, AlertTriangle, MessageSquare, Dna,
  Users, Wand2, Key, Radio, Hammer, Compass, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserAgency } from '@/hooks/useUserAgency';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { cn } from '@/lib/utils';
import { TierGate, TierLockBadge } from '@/components/substrate-os/TierGate';
import { type SubstrateRole } from '@/hooks/useUserRole';

// ── Lazy-loaded panels ──
const OverviewPanel = lazy(() => import('@/components/substrate-os/panels/OverviewPanel'));
const EnhancedTerminal = lazy(() => import('@/components/substrate-os/EnhancedTerminal').then(m => ({ default: m.EnhancedTerminal })));
const NexusTab = lazy(() => import('@/components/substrate-os/NexusTab').then(m => ({ default: m.NexusTab })));
const IntentPanel = lazy(() => import('@/components/substrate-os/panels/IntentPanel'));
const CortexTab = lazy(() => import('@/components/substrate-os/CortexTab').then(m => ({ default: m.CortexTab })));
const EnginesTab = lazy(() => import('@/components/substrate-os/EnginesTab').then(m => ({ default: m.EnginesTab })));
const MaintenanceTab = lazy(() => import('@/components/substrate-os/MaintenanceTab').then(m => ({ default: m.MaintenanceTab })));
const WebhooksTab = lazy(() => import('@/components/substrate-os/WebhooksTab').then(m => ({ default: m.WebhooksTab })));
const EvolutionTab = lazy(() => import('@/components/substrate-os/EvolutionTab').then(m => ({ default: m.EvolutionTab })));
const ShadowTab = lazy(() => import('@/components/substrate-os/ShadowTab').then(m => ({ default: m.ShadowTab })));
const OracleTab = lazy(() => import('@/components/substrate-os/OracleTab').then(m => ({ default: m.OracleTab })));
const ForgeTab = lazy(() => import('@/components/substrate-os/ForgeTab').then(m => ({ default: m.ForgeTab })));
const CCRTab = lazy(() => import('@/components/substrate-os/CCRTab').then(m => ({ default: m.CCRTab })));
const OperationsTab = lazy(() => import('@/components/substrate-os/OperationsTab').then(m => ({ default: m.OperationsTab })));
const SecurityPanel = lazy(() => import('@/components/substrate-os/panels/SecurityPanel'));
const AnalyticsTab = lazy(() => import('@/components/substrate-os/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const GovernorPanel = lazy(() => import('@/components/substrate-os/panels/GovernorPanel'));
const CodeAgentTab = lazy(() => import('@/components/substrate-os/CodeAgentTab').then(m => ({ default: m.CodeAgentTab })));
const MeshActivityTab = lazy(() => import('@/components/substrate-os/MeshActivityTab').then(m => ({ default: m.MeshActivityTab })));
const AtlasTab = lazy(() => import('@/components/substrate-os/AtlasTab').then(m => ({ default: m.AtlasTab })));
const AgencyMintWizard = lazy(() => import('@/components/agency/AgencyMintWizard').then(m => ({ default: m.AgencyMintWizard })));
const AgencyGallery = lazy(() => import('@/components/agency/AgencyGallery').then(m => ({ default: m.AgencyGallery })));
const CognitivesPanel = lazy(() => import('@/components/substrate-os/CognitivesPanel').then(m => ({ default: m.CognitivesPanel })));
const AccountTab = lazy(() => import('@/components/substrate-os/AccountTab').then(m => ({ default: m.AccountTab })));

// ── Loading state ──
function PanelLoader() {
  return (
    <div className="flex items-center justify-center py-20 sm:py-32">
      <motion.div className="text-center space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 mx-auto">
          <div className="absolute inset-0 rounded-xl bg-primary/5 border border-primary/10" />
          <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-primary/60 animate-spin" />
        </div>
        <p className="text-[10px] text-muted-foreground/50 font-mono tracking-[0.2em] uppercase">Loading</p>
      </motion.div>
    </div>
  );
}

// ── Tab Configuration ──
interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  group: string;
  description: string;
  governorOnly?: boolean;
  minTier?: SubstrateRole;
}

function getTabDefs(hasAgency: boolean, isGovernor: boolean): TabDef[] {
  return [
    // ── Account ──
    { id: 'account', label: 'Account', icon: UserCircle, group: 'You', description: 'Profile & settings' },
    // ── Free ──
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'You', description: 'Health & topology' },
    { id: 'analytics', label: 'Analytics', icon: Activity, group: 'You', description: 'Traffic & telemetry', governorOnly: true, minTier: 'governor' },
    // ── Creator ──
    { id: 'terminal', label: 'Terminal', icon: Terminal, group: 'Build', description: 'Command interface', minTier: 'creator' },
    { id: 'nexus', label: 'NEXUS', icon: Zap, group: 'Build', description: 'Fleet routing', minTier: 'creator' },
    { id: 'webhooks', label: 'Webhooks', icon: Radio, group: 'Build', description: 'Event subscriptions', minTier: 'creator' },
    { id: 'ccr', label: 'CCR', icon: HardDrive, group: 'Memory', description: 'MEMORY · DREAM', minTier: 'creator' },
    { id: 'forge', label: 'FORGE', icon: Hammer, group: 'Create', description: 'Artifacts · LINGUA', minTier: 'creator' },
    // ── Cognitives & Agency ──
    { id: 'cognitives', label: 'Cognitives', icon: Sparkles, group: 'Agents', description: 'Sealed runtimes', governorOnly: !isGovernor && !hasAgency, minTier: hasAgency ? 'creator' as SubstrateRole : 'governor' as SubstrateRole },
    ...((hasAgency || isGovernor) ? [{ id: 'agency', label: 'Agency', icon: Building2, group: 'Agents' as string, description: 'Multi-agent teams', governorOnly: !hasAgency, minTier: (hasAgency ? 'creator' : 'governor') as SubstrateRole }] : []),
    // ── Governor ──
    { id: 'intent', label: 'INTENT', icon: Brain, group: 'Orchestrate', description: 'Intent mesh', governorOnly: true, minTier: 'governor' },
    { id: 'cortex', label: 'CORTEX', icon: GitBranch, group: 'Orchestrate', description: 'Memory orchestration', governorOnly: true, minTier: 'governor' },
    { id: 'atlas', label: 'ATLAS', icon: Gauge, group: 'Orchestrate', description: 'Control plane', governorOnly: true, minTier: 'governor' },
    { id: 'engines', label: 'Maintenance', icon: Wrench, group: 'Operate', description: 'Engine repairs', governorOnly: true, minTier: 'governor' },
    { id: 'encode', label: 'ENCODE', icon: Bot, group: 'Operate', description: 'Code generation', governorOnly: true, minTier: 'governor' },
    { id: 'mesh', label: 'Mesh', icon: Network, group: 'Operate', description: 'Capability mesh', governorOnly: true, minTier: 'governor' },
    { id: 'evolution', label: 'EVOLUTION', icon: Dna, group: 'Evolve', description: 'Self-evolution', governorOnly: true, minTier: 'governor' },
    { id: 'shadow', label: 'SHADOW', icon: Eye, group: 'Evolve', description: 'Adversarial probes', governorOnly: true, minTier: 'governor' },
    { id: 'oracle', label: 'ORACLE', icon: Compass, group: 'Evolve', description: 'Predictions & echo', governorOnly: true, minTier: 'governor' },
    { id: 'security', label: 'Security', icon: Shield, group: 'Govern', description: 'DEFENSE · Immunity', governorOnly: true, minTier: 'governor' },
    { id: 'operations', label: 'Operations', icon: Layers, group: 'Govern', description: 'DECODE · VISION +5', governorOnly: true, minTier: 'governor' },
    { id: 'governor', label: 'Governor', icon: AlertTriangle, group: 'Govern', description: 'Kill switches', governorOnly: true, minTier: 'governor' },
  ];
}

const GROUP_ORDER = ['You', 'Build', 'Memory', 'Create', 'Agents', 'Orchestrate', 'Operate', 'Evolve', 'Govern'];

// ── Sidebar ──
interface SidebarProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onClose?: () => void;
  onLogout: () => void;
  isGovernor: boolean;
  healthScore: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  currentTier: SubstrateRole;
}

function DashboardSidebar({ tabs, activeTab, onTabChange, onClose, onLogout, isGovernor, healthScore, collapsed, onToggleCollapse, currentTier }: SidebarProps) {
  const grouped = useMemo(() => {
    const map: Record<string, TabDef[]> = {};
    tabs.forEach(t => {
      if (t.governorOnly && !isGovernor) return;
      if (!map[t.group]) map[t.group] = [];
      map[t.group].push(t);
    });
    return GROUP_ORDER.filter(g => map[g]?.length).map(g => ({ group: g, items: map[g] }));
  }, [tabs, isGovernor]);

  return (
    <TooltipProvider delayDuration={collapsed ? 100 : 999999}>
      <div className={cn(
        "flex flex-col h-full border-r border-border/15 transition-all duration-200",
        "bg-gradient-to-b from-background to-muted/10",
        collapsed ? "w-[52px]" : "w-52"
      )}>
        {/* Collapse toggle (desktop) */}
        {onToggleCollapse && (
          <div className={cn("flex items-center border-b border-border/10 shrink-0", collapsed ? "justify-center py-2.5" : "justify-between px-3 py-2.5")}>
            {!collapsed && <span className="text-[9px] font-bold text-muted-foreground/40 font-mono uppercase tracking-[0.2em]">Substrate</span>}
            <button onClick={onToggleCollapse} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors">
              {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <ScrollArea className="flex-1 py-1.5">
          <nav className="space-y-0.5 px-1.5">
            {grouped.map((section, gi) => (
              <div key={section.group}>
                {gi > 0 && <div className="h-px bg-border/8 mx-2 my-1.5" />}
                {!collapsed && (
                  <div className="px-2.5 mb-0.5 mt-1">
                    <span className="text-[8px] font-semibold text-muted-foreground/30 uppercase tracking-[0.2em]">{section.group}</span>
                  </div>
                )}
                {section.items.map(tab => {
                  const active = activeTab === tab.id;
                  const btn = (
                    <button
                      key={tab.id}
                      onClick={() => { onTabChange(tab.id); onClose?.(); }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg transition-all duration-150",
                        collapsed ? "justify-center px-1 py-2" : "px-2.5 py-[6px]",
                        active
                          ? "bg-primary/8 text-primary font-medium dark:bg-primary/10"
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors", active && "bg-primary/12")}>
                        <tab.icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
                      </div>
                      {!collapsed && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <span className="text-[12px] block truncate">{tab.label}</span>
                          </div>
                          {tab.minTier && <TierLockBadge requiredTier={tab.minTier} currentTier={currentTier} />}
                          {active && !tab.minTier && <div className="w-1 h-1 rounded-full bg-primary shrink-0" />}
                        </>
                      )}
                    </button>
                  );
                  if (collapsed) {
                    return (
                      <Tooltip key={tab.id}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">{tab.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return btn;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className={cn("border-t border-border/10 shrink-0", collapsed ? "p-1.5" : "p-2.5")}
          style={{ paddingBottom: `max(${collapsed ? '0.375rem' : '0.75rem'}, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))` }}
        >
          <div className={cn("flex gap-1", collapsed ? "flex-col" : "")}>
            <Button variant="ghost" size="sm" asChild className={cn("text-muted-foreground/50 hover:text-foreground min-h-[40px]", collapsed ? "w-full justify-center px-1" : "flex-1")}>
              <Link to="/"><Home className="w-3.5 h-3.5" />{!collapsed && <span className="ml-1.5 text-[11px]">Home</span>}</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className={cn("text-muted-foreground/50 hover:text-destructive min-h-[40px]", collapsed ? "w-full justify-center px-1" : "flex-1")}>
              <LogOut className="w-3.5 h-3.5" />{!collapsed && <span className="ml-1.5 text-[11px]">Logout</span>}
            </Button>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground/25 font-mono mt-2 pt-1.5 border-t border-border/8">
              <div className={cn("w-1.5 h-1.5 rounded-full", healthScore >= 80 ? "bg-neon-green" : healthScore >= 50 ? "bg-neon-amber" : "bg-destructive")} />
              <span>Health {healthScore}%</span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Panel Container ──
function PanelContainer({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      className="w-full max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-6"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ──
export default function SubstrateOS() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const { data: userAgency } = useUserAgency();
  const healthScore = useSubstrateHealthScore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const tabs = useMemo(() => getTabDefs(!!userAgency, isGovernor), [userAgency, isGovernor]);

  const handleLogout = useCallback(async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error('Logout error:', e); }
  }, [signOut, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          const visibleTabs = tabs.filter(t => !t.governorOnly || isGovernor);
          const target = visibleTabs[num - 1];
          if (target) { e.preventDefault(); setActiveTab(target.id); }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, isGovernor]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15" />
            <Cpu className="absolute inset-0 m-auto w-5 h-5 text-primary" />
            <motion.div className="absolute inset-0 rounded-xl border border-primary/20" animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
          <p className="text-xs font-semibold font-mono text-primary tracking-wide">Memory Stream</p>
        </motion.div>
      </div>
    );
  }

  // Active tab label for mobile breadcrumb
  const activeTabDef = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Substrate OS — Live Command Center | CMPSBL"
        description="CMPSBL's live command center: monitor agents, engines, layers, and organs in real time — track Memory Stream crystallization, manage DREAM cycles, view mesh communications, and control governance settings."
        canonical="https://cmpsbl.com/os"
        keywords={['CMPSBL', 'Memory Stream', 'Signal to Silicon', 'cognitive orchestration']}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="dark:block hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-neon-purple/[0.02] rounded-full blur-[100px]" />
        </div>
      </div>

      <OSHeader userEmail={user?.email} role={role} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <DashboardSidebar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            isGovernor={isGovernor}
            healthScore={healthScore.healthScore}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            currentTier={role}
          />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20">
          <div className="grid grid-cols-5 px-1 py-0.5" style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}>
            {(isGovernor ? ['account', 'overview', 'nexus', 'security'] : ['account', 'overview', 'nexus', 'ccr']).map(id => {
              const tab = tabs.find(t => t.id === id)!;
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] rounded-lg transition-all touch-manipulation",
                    active ? "text-primary" : "text-muted-foreground/40"
                  )}
                >
                  <tab.icon className={cn("w-4.5 h-4.5", active && "scale-110")} />
                  <span className="text-[9px] font-medium leading-none">{tab.label}</span>
                  {active && <motion.div className="absolute top-0 w-5 h-[2px] rounded-full bg-primary" layoutId="mob-tab" />}
                </button>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] rounded-lg text-muted-foreground/40 touch-manipulation"
            >
              <Menu className="w-4.5 h-4.5" />
              <span className="text-[9px] font-medium leading-none">More</span>
            </button>
          </div>
        </div>

        {/* Mobile Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/15">
              <h3 className="text-xs font-bold text-foreground tracking-tight">Navigation</h3>
              {activeTabDef && (
                <Badge variant="outline" className="text-[9px] font-mono">{activeTabDef.label}</Badge>
              )}
            </div>
            <DashboardSidebar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              isGovernor={isGovernor}
              healthScore={healthScore.healthScore}
              currentTier={role}
            />
          </SheetContent>
        </Sheet>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          {/* Mobile breadcrumb */}
          {activeTabDef && (
            <div className="lg:hidden px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 font-mono">
                <span>{activeTabDef.group}</span>
                <span>/</span>
                <span className="text-foreground/70 font-medium">{activeTabDef.label}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <PanelContainer id="account"><Suspense fallback={<PanelLoader />}><AccountTab /></Suspense></PanelContainer>
            )}

            {activeTab === 'overview' && (
              <PanelContainer id="overview">
                <ModuleErrorBoundary moduleName="Overview">
                  <Suspense fallback={<PanelLoader />}>
                    <OverviewPanel isOperator={isOperator} isGovernor={isGovernor} onOpenTerminal={() => setActiveTab('terminal')} onNavigate={setActiveTab} />
                  </Suspense>
                </ModuleErrorBoundary>
              </PanelContainer>
            )}

            {activeTab === 'terminal' && (
              <TierGate requiredTier="creator" currentTier={role} tabLabel="Terminal" description="Interactive command interface for executing substrate operations.">
                <motion.div key="terminal" className="mx-auto px-4 sm:px-6 py-4 sm:py-5 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-10rem)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Suspense fallback={<PanelLoader />}><EnhancedTerminal enabled={isOperator} fullHeight className="h-full" /></Suspense>
                </motion.div>
              </TierGate>
            )}

            {activeTab === 'analytics' && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="Analytics" description="Substrate telemetry, traffic intelligence, and cost analytics.">
                <PanelContainer id="analytics"><Suspense fallback={<PanelLoader />}><AnalyticsTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'nexus' && (
              <TierGate requiredTier="creator" currentTier={role} tabLabel="NEXUS" description="Multi-model fleet routing with cost/quality optimization.">
                <PanelContainer id="nexus"><Suspense fallback={<PanelLoader />}><NexusTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'webhooks' && (
              <TierGate requiredTier="creator" currentTier={role} tabLabel="Webhooks" description="Subscribe to real-time substrate events.">
                <PanelContainer id="webhooks"><Suspense fallback={<PanelLoader />}><WebhooksTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'intent' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="INTENT" description="INTENT Layer mesh governance and routing.">
                <PanelContainer id="intent"><ModuleErrorBoundary moduleName="INTENT"><Suspense fallback={<PanelLoader />}><IntentPanel /></Suspense></ModuleErrorBoundary></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'cortex' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="CORTEX" description="CORTEX Engine memory orchestration and multi-step execution tracing.">
                <PanelContainer id="cortex"><Suspense fallback={<PanelLoader />}><CortexTab enabled={isOperator} /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'atlas' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="ATLAS" description="ATLAS Engine control plane configuration and capability toggles.">
                <PanelContainer id="atlas"><Suspense fallback={<PanelLoader />}><AtlasTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'engines' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="Maintenance" description="Engine repair bay and safety switches.">
                <PanelContainer id="engines"><Suspense fallback={<PanelLoader />}><MaintenanceTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'encode' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="ENCODE" description="ENCODE Agent — code generation and memory formation.">
                <PanelContainer id="encode"><Suspense fallback={<PanelLoader />}><CodeAgentTab enabled={isOperator} /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'mesh' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="Mesh" description="Live capability mesh and inter-primitive communication.">
                <PanelContainer id="mesh"><Suspense fallback={<PanelLoader />}><MeshActivityTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'evolution' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="EVOLUTION" description="EVOLUTION Layer — self-evolution with shadow-apply verification.">
                <PanelContainer id="evolution"><Suspense fallback={<PanelLoader />}><EvolutionTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'shadow' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="SHADOW" description="Adversarial probes and TSAC divergence detection.">
                <PanelContainer id="shadow"><Suspense fallback={<PanelLoader />}><ShadowTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'ccr' && (
              <TierGate requiredTier="creator" currentTier={role} tabLabel="CCR" description="Cognitive Core Reality — memory tiers and DREAM Engine synthesis.">
                <PanelContainer id="ccr"><Suspense fallback={<PanelLoader />}><CCRTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'operations' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="Operations" description="System operations center and infrastructure controls.">
                <PanelContainer id="operations"><Suspense fallback={<PanelLoader />}><OperationsTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'oracle' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="ORACLE" description="ORACLE Engine predictive analytics, COMPASS Engine simulation, and ECHO Agent patterns.">
                <PanelContainer id="oracle"><Suspense fallback={<PanelLoader />}><OracleTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'forge' && (
              <TierGate requiredTier="creator" currentTier={role} tabLabel="FORGE" description="Artifact production with LINGUA translation and HARVEST ingestion.">
                <PanelContainer id="forge"><Suspense fallback={<PanelLoader />}><ForgeTab /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'cognitives' && (isGovernor || !!userAgency) && (
              <TierGate requiredTier={userAgency ? 'creator' : 'governor'} currentTier={role} tabLabel="Cognitives" description="Sealed cognitive runtimes and autonomous agent environments.">
                <PanelContainer id="cognitives"><Suspense fallback={<PanelLoader />}><CognitivesPanel /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'agency' && (isGovernor || !!userAgency) && (
              <TierGate requiredTier={userAgency ? 'creator' : 'governor'} currentTier={role} tabLabel="Agency" description="Multi-agent team orchestration and collaborative intelligence.">
                <PanelContainer id="agency"><Suspense fallback={<PanelLoader />}><AgencyGallery /></Suspense></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'security' && isGovernor && (
              <TierGate requiredTier="governor" currentTier={role} tabLabel="Security" description="DEFENSE perimeter, immunity mesh, and audit trail.">
                <PanelContainer id="security"><ModuleErrorBoundary moduleName="Security"><Suspense fallback={<PanelLoader />}><SecurityPanel isGovernor={isGovernor} isOperator={isOperator} /></Suspense></ModuleErrorBoundary></PanelContainer>
              </TierGate>
            )}

            {activeTab === 'governor' && isGovernor && (
              <PanelContainer id="governor"><ModuleErrorBoundary moduleName="Governor"><Suspense fallback={<PanelLoader />}><GovernorPanel /></Suspense></ModuleErrorBoundary></PanelContainer>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
