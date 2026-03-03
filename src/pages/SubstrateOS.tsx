/**
 * CMPSBL Substrate — Command Center
 * Rebuilt for the 38-node matrix, 675+ capabilities, and real operational utility.
 * Enterprise in light mode, Neon Dreams in dark.
 */

import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense, memo, useCallback, useEffect, useMemo } from 'react';
import { ModuleErrorBoundary } from '@/components/system/ModuleErrorBoundary';
import {
  Loader2, Terminal, LayoutDashboard, Activity, Bot, Sparkles,
  Building2, Cpu, Shield, Layers, Eye, LogOut, Home, Network, Zap,
  Menu, X, Brain, Gauge, HardDrive, FileText, Settings,
  GitBranch, Wrench, AlertTriangle, MessageSquare, Dna,
  Users, Wand2, Key, Radio,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserAgency } from '@/hooks/useUserAgency';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { cn } from '@/lib/utils';

// ── Lazy-loaded panels ──
const OverviewPanel = lazy(() => import('@/components/substrate-os/panels/OverviewPanel'));
const EnhancedTerminal = lazy(() => import('@/components/substrate-os/EnhancedTerminal').then(m => ({ default: m.EnhancedTerminal })));
const NexusTab = lazy(() => import('@/components/substrate-os/NexusTab').then(m => ({ default: m.NexusTab })));
const IntentPanel = lazy(() => import('@/components/substrate-os/panels/IntentPanel'));
const CortexTab = lazy(() => import('@/components/substrate-os/CortexTab').then(m => ({ default: m.CortexTab })));
const EnginesTab = lazy(() => import('@/components/substrate-os/EnginesTab').then(m => ({ default: m.EnginesTab })));
const SecurityPanel = lazy(() => import('@/components/substrate-os/panels/SecurityPanel'));
const AnalyticsTab = lazy(() => import('@/components/substrate-os/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const GovernorPanel = lazy(() => import('@/components/substrate-os/panels/GovernorPanel'));
const CodeAgentTab = lazy(() => import('@/components/substrate-os/CodeAgentTab').then(m => ({ default: m.CodeAgentTab })));
const MeshActivityTab = lazy(() => import('@/components/substrate-os/MeshActivityTab').then(m => ({ default: m.MeshActivityTab })));
const AtlasTab = lazy(() => import('@/components/substrate-os/AtlasTab').then(m => ({ default: m.AtlasTab })));
const AgencyMintWizard = lazy(() => import('@/components/agency/AgencyMintWizard').then(m => ({ default: m.AgencyMintWizard })));
const AgencyGallery = lazy(() => import('@/components/agency/AgencyGallery').then(m => ({ default: m.AgencyGallery })));
const CognitivesPanel = lazy(() => import('@/components/substrate-os/CognitivesPanel').then(m => ({ default: m.CognitivesPanel })));

// ── Loading state ──
function PanelLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <motion.div className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative w-10 h-10 mx-auto">
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
}

function getTabDefs(hasAgency: boolean): TabDef[] {
  return [
    // Command — the daily drivers
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Command', description: 'System health & quick actions' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, group: 'Command', description: 'Command interface' },
    { id: 'analytics', label: 'Analytics', icon: Activity, group: 'Command', description: 'Traffic & usage' },

    // Intelligence — orchestration & routing
    { id: 'nexus', label: 'NEXUS', icon: Zap, group: 'Intelligence', description: 'Fleet routing engine' },
    { id: 'intent', label: 'INTENT', icon: Brain, group: 'Intelligence', description: 'Module mesh & governance' },
    { id: 'cortex', label: 'CORTEX', icon: GitBranch, group: 'Intelligence', description: 'Pipeline orchestration' },
    { id: 'atlas', label: 'ATLAS', icon: Gauge, group: 'Intelligence', description: 'Control plane' },

    // Execution — engines, encode, mesh
    { id: 'engines', label: 'Engines', icon: Layers, group: 'Execution', description: 'Execute & manage' },
    { id: 'encode', label: 'ENCODE', icon: Bot, group: 'Execution', description: 'Code pipeline' },
    { id: 'mesh', label: 'Mesh Activity', icon: Network, group: 'Execution', description: 'Capability mesh' },

    // Extend — cognitives, agency
    { id: 'cognitives', label: 'Cognitives', icon: Sparkles, group: 'Extend', description: 'Sealed runtimes' },
    ...(hasAgency ? [{ id: 'agency', label: 'Agency', icon: Building2, group: 'Extend' as string, description: 'Agency command center' }] : []),

    // Govern — security + admin merged
    { id: 'security', label: 'Security', icon: Shield, group: 'Govern', description: 'DEFENSE · Immunity · Audit' },
    { id: 'governor', label: 'Governor', icon: AlertTriangle, group: 'Govern', description: 'Admin controls & kill switches', governorOnly: true },
  ];
}

const GROUP_ORDER = ['Command', 'Intelligence', 'Execution', 'Extend', 'Govern'];

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
}

function DashboardSidebar({ tabs, activeTab, onTabChange, onClose, onLogout, isGovernor, healthScore, collapsed }: SidebarProps) {
  const version = useMetric('version');
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
    <div className={cn(
      "flex flex-col h-full border-r border-border/20 transition-all duration-200",
      "bg-gradient-to-b from-background via-background to-muted/20",
      "dark:from-[hsl(220,25%,5%)] dark:via-[hsl(220,25%,4%)] dark:to-[hsl(220,20%,6%)]",
      collapsed ? "w-[52px]" : "w-56"
    )}>
      {/* Brand */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-3 border-b border-border/15">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground tracking-tight">CMPSBL</div>
              <div className="text-[9px] text-muted-foreground/50 font-mono">substrate v{version}</div>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-0.5 px-1.5">
          {grouped.map((section, gi) => (
            <div key={section.group}>
              {gi > 0 && <div className="h-px bg-border/10 mx-2 my-2" />}
              {!collapsed && (
                <div className="px-2.5 mb-1">
                  <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-[0.15em]">
                    {section.group}
                  </span>
                </div>
              )}
              {section.items.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); onClose?.(); }}
                    title={collapsed ? tab.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg text-[13px] transition-all duration-150",
                      collapsed ? "justify-center px-1 py-2" : "px-2.5 py-[7px]",
                      active
                        ? "bg-primary/8 text-primary font-medium dark:bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors",
                      active ? "bg-primary/15" : "group-hover:bg-muted/50"
                    )}>
                      <tab.icon className={cn("w-3.5 h-3.5", active ? "text-primary" : "")} />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{tab.label}</span>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn("border-t border-border/15", collapsed ? "p-1.5" : "p-3")}>
        <div className={cn("flex gap-1", collapsed ? "flex-col" : "")}>
          <Button variant="ghost" size="sm" asChild className={cn("text-muted-foreground/60 hover:text-foreground h-8", collapsed ? "w-full justify-center px-1" : "flex-1")}>
            <Link to="/"><Home className="w-3.5 h-3.5" />{!collapsed && <span className="ml-1.5 text-xs">Home</span>}</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className={cn("text-muted-foreground/60 hover:text-destructive h-8", collapsed ? "w-full justify-center px-1" : "flex-1")}>
            <LogOut className="w-3.5 h-3.5" />{!collapsed && <span className="ml-1.5 text-xs">Logout</span>}
          </Button>
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/35 font-mono mt-2 pt-2 border-t border-border/10">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                healthScore >= 80 ? "bg-emerald-500" : healthScore >= 50 ? "bg-amber-500" : "bg-red-500"
              )} />
              <span>Health {healthScore}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel Container ──
function PanelContainer({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
  const navigate = useNavigate();

  const tabs = useMemo(() => getTabDefs(!!userAgency), [userAgency]);

  const handleLogout = useCallback(async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error('Logout error:', e); }
  }, [signOut, navigate]);

  // Keyboard shortcuts: Ctrl+1..9
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="text-center space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20" />
            <Cpu className="absolute inset-0 m-auto w-7 h-7 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-2xl border border-primary/25"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-sm font-semibold font-mono text-primary tracking-wide">CMPSBL Substrate</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="CMPSBL Substrate — Command Center"
        description="The CMPSBL Substrate command center: autonomous execution surfaces, zones, and overlays persisting, evolving, and orchestrating intelligence in real-time."
        canonical="https://cmpsbl.com/os"
        keywords={['CMPSBL Substrate', 'Clockless Cognitive Reality', 'persistent intelligence', 'cognitive orchestration']}
      />

      {/* Ambient background — Enterprise clean in light, Neon Dreams in dark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="dark:block hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[hsl(185,100%,50%,0.03)] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[hsl(280,100%,65%,0.03)] rounded-full blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[hsl(210,100%,50%,0.02)] rounded-full blur-[100px]" />
        </div>
      </div>

      <OSHeader userEmail={user?.email} role={role} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            isGovernor={isGovernor}
            healthScore={healthScore.healthScore}
          />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/25 safe-area-pb">
          <div className="grid grid-cols-5 px-0.5 py-1" style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}>
            {['overview', 'terminal', 'nexus', 'security'].map(id => {
              const tab = tabs.find(t => t.id === id)!;
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-lg transition-all touch-manipulation",
                    active ? "text-primary" : "text-muted-foreground/45"
                  )}
                >
                  <tab.icon className={cn("w-[18px] h-[18px]", active && "scale-110")} />
                  <span className="text-[9px] font-medium leading-none">{tab.label}</span>
                  {active && <motion.div className="absolute top-0.5 w-5 h-[2px] rounded-full bg-primary" layoutId="mob-tab" />}
                </button>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-lg text-muted-foreground/45 touch-manipulation"
            >
              <Menu className="w-[18px] h-[18px]" />
              <span className="text-[9px] font-medium leading-none">More</span>
            </button>
          </div>
        </div>

        {/* Mobile Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] bg-background">
            <div className="flex items-center justify-between px-3 py-3 border-b border-border/20">
              <h3 className="font-semibold text-sm">Navigation</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DashboardSidebar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              isGovernor={isGovernor}
              healthScore={healthScore.healthScore}
            />
          </SheetContent>
        </Sheet>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <PanelContainer id="overview">
                <ModuleErrorBoundary moduleName="Overview">
                  <Suspense fallback={<PanelLoader />}>
                    <OverviewPanel
                      isOperator={isOperator}
                      isGovernor={isGovernor}
                      onOpenTerminal={() => setActiveTab('terminal')}
                      onNavigate={setActiveTab}
                    />
                  </Suspense>
                </ModuleErrorBoundary>
              </PanelContainer>
            )}

            {activeTab === 'terminal' && (
              <motion.div key="terminal" className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-12rem)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Suspense fallback={<PanelLoader />}>
                  <EnhancedTerminal enabled={isOperator} fullHeight className="h-full" />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <PanelContainer id="analytics">
                <Suspense fallback={<PanelLoader />}><AnalyticsTab /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'nexus' && (
              <PanelContainer id="nexus">
                <Suspense fallback={<PanelLoader />}><NexusTab /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'intent' && (
              <PanelContainer id="intent">
                <ModuleErrorBoundary moduleName="INTENT">
                  <Suspense fallback={<PanelLoader />}>
                    <IntentPanel />
                  </Suspense>
                </ModuleErrorBoundary>
              </PanelContainer>
            )}

            {activeTab === 'cortex' && (
              <PanelContainer id="cortex">
                <Suspense fallback={<PanelLoader />}><CortexTab enabled={isOperator} /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'atlas' && (
              <PanelContainer id="atlas">
                <Suspense fallback={<PanelLoader />}><AtlasTab /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'engines' && (
              <PanelContainer id="engines">
                <Suspense fallback={<PanelLoader />}><EnginesTab enabled={isOperator} /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'encode' && (
              <PanelContainer id="encode">
                <Suspense fallback={<PanelLoader />}><CodeAgentTab enabled={isOperator} /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'mesh' && (
              <PanelContainer id="mesh">
                <Suspense fallback={<PanelLoader />}><MeshActivityTab /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'cognitives' && (
              <PanelContainer id="cognitives">
                <Suspense fallback={<PanelLoader />}><CognitivesPanel /></Suspense>
              </PanelContainer>
            )}

            {activeTab === 'agency' && (
              <PanelContainer id="agency">
                <Suspense fallback={<PanelLoader />}>
                  <AgencyGallery />
                </Suspense>
              </PanelContainer>
            )}

            {activeTab === 'security' && (
              <PanelContainer id="security">
                <ModuleErrorBoundary moduleName="Security">
                  <Suspense fallback={<PanelLoader />}>
                    <SecurityPanel isGovernor={isGovernor} isOperator={isOperator} />
                  </Suspense>
                </ModuleErrorBoundary>
              </PanelContainer>
            )}

            {activeTab === 'governor' && isGovernor && (
              <PanelContainer id="governor">
                <ModuleErrorBoundary moduleName="Governor">
                  <Suspense fallback={<PanelLoader />}>
                    <GovernorPanel />
                  </Suspense>
                </ModuleErrorBoundary>
              </PanelContainer>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
