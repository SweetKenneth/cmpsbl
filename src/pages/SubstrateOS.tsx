/**
 * CMPSBL® substrate — OS Surface v10.5.0 ARCHITECT Epoch
 * TIER-GATED EDITION — FREE / CREATOR / ARCHITECT / CMPSBL
 * 
 * All tabs visible to all users with tier badges.
 * Locked tabs show upgrade prompts to drive conversion.
 */

import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Loader2, Lock, Terminal, AlertTriangle, RefreshCw, FileText,
  Settings, Zap, LayoutDashboard, Activity, Bot, Users, Sparkles,
  Building2, ExternalLink, HardDrive, Wand2, Cpu, Radio, Key, Dna,
  ChevronRight, Menu, Shield, Layers, Gauge, ArrowUpRight, Eye,
  LogOut, Home, ToggleRight, Network, Crown, Star, Rocket, MessageSquare
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
import { AtlasTab } from '@/components/substrate-os/AtlasTab';
import { EnginesTab } from '@/components/substrate-os/EnginesTab';
import { PublicMetricsTab } from '@/components/substrate-os/PublicMetricsTab';
import { PatchAuthoringTab } from '@/components/substrate-os/PatchAuthoringTab';
import { DashboardMetricsHero, QuickActionsPanel, ModuleControlsGrid, CapacityMonitor } from '@/components/substrate-os/dashboard';
import { MeshActivityTab } from '@/components/substrate-os/MeshActivityTab';
import { AnalyticsTab } from '@/components/substrate-os/AnalyticsTab';
import { GovernorSection } from '@/components/substrate-os/GovernorSection';
import { AuditTab } from '@/components/substrate-os/AuditTab';
import { SoundingBoard } from '@/components/governance/SoundingBoard';
import { cn } from '@/lib/utils';

// ============================================
// Tier System
// ============================================
type SubstrateTier = 'free' | 'creator' | 'architect' | 'cmpsbl';

const TIER_CONFIG: Record<SubstrateTier, {
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  price?: string;
}> = {
  free: {
    label: 'FREE',
    color: 'emerald',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    icon: Eye,
  },
  creator: {
    label: 'CREATOR',
    color: 'cyan',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    icon: Star,
    price: '$9/mo',
  },
  architect: {
    label: 'ARCHITECT',
    color: 'fuchsia',
    borderColor: 'border-fuchsia-500/40',
    bgColor: 'bg-fuchsia-500/10',
    textColor: 'text-fuchsia-400',
    icon: Rocket,
    price: '$19/mo',
  },
  cmpsbl: {
    label: 'CMPSBL',
    color: 'amber',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    icon: Crown,
  },
};

// ============================================
// Tab Groups Configuration — Tier-Gated
// ============================================
interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  tier: SubstrateTier;
}

interface TabGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tier: SubstrateTier;
  tabs: TabConfig[];
}

function getTabGroups(hasAgency: boolean): TabGroup[] {
  return [
    {
      id: 'free',
      label: 'Free',
      icon: Eye,
      tier: 'free',
      tabs: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan', description: 'System overview & health', tier: 'free' },
        { id: 'health', label: 'Health', icon: Activity, color: 'emerald', description: 'System health monitor', tier: 'free' },
      ],
    },
    {
      id: 'creator',
      label: 'Creator',
      icon: Star,
      tier: 'creator',
      tabs: [
        { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'emerald', description: 'Command interface', tier: 'creator' },
        { id: 'analytics', label: 'Analytics', icon: Activity, color: 'cyan', description: 'Traffic & usage analytics', tier: 'creator' },
        { id: 'events', label: 'Events', icon: Activity, color: 'amber', description: 'Live activity feed', tier: 'creator' },
        { id: 'engines', label: 'Engines', icon: Layers, color: 'fuchsia', description: 'Execute & manage engines', tier: 'creator' },
      ],
    },
    {
      id: 'architect',
      label: 'Architect',
      icon: Rocket,
      tier: 'architect',
      tabs: [
        { id: 'nexus', label: 'Nexus', icon: Zap, color: 'cyan', description: 'AI routing & orchestration', tier: 'architect' },
        { id: 'codeagent', label: 'ENCODE', icon: Bot, color: 'fuchsia', description: 'DECODE → ENCODE pipeline', tier: 'architect' },
        { id: 'modules', label: 'Modules', icon: Cpu, color: 'orange', description: 'Core · Ripple · Access', tier: 'architect' },
        { id: 'cortex', label: 'Cortex', icon: Wand2, color: 'violet', description: 'Cognitive orchestrator', tier: 'architect' },
        { id: 'atlas', label: 'Atlas', icon: Gauge, color: 'cyan', description: 'Control plane', tier: 'architect' },
        { id: 'modernizer', label: 'Modernizer', icon: Wand2, color: 'fuchsia', description: 'Self-upgrade engine', tier: 'architect' },
        { id: 'inclusive', label: 'Inclusive', icon: Users, color: 'teal', description: 'Accessibility engine', tier: 'architect' },
        { id: 'backups', label: 'Backups', icon: HardDrive, color: 'blue', description: 'Backup & restore', tier: 'architect' },
      ],
    },
    {
      id: 'cmpsbl',
      label: 'CMPSBL',
      icon: Crown,
      tier: 'cmpsbl',
      tabs: [
        { id: 'mesh', label: 'Intent Mesh', icon: Network, color: 'amber', description: 'Autonomous capability mesh', tier: 'cmpsbl' },
        { id: 'evolution', label: 'Evolution', icon: Dna, color: 'purple', description: 'Architecture mutation', tier: 'cmpsbl' },
        { id: 'patches', label: 'Patches', icon: Shield, color: 'blue', description: 'Author LNCHBL patches', tier: 'cmpsbl' },
        { id: 'metrics', label: 'Metrics', icon: Gauge, color: 'cyan', description: 'Public metrics control', tier: 'cmpsbl' },
        { id: 'cognitives', label: 'Cognitives', icon: Bot, color: 'fuchsia', description: 'Bot registry & management', tier: 'cmpsbl' },
        { id: 'mint', label: 'Mint', icon: Sparkles, color: 'purple', description: 'Forge cognitives & agencies', tier: 'cmpsbl' },
        ...(hasAgency ? [{ id: 'agency', label: 'Agency', icon: Building2, color: 'blue', description: 'Agency command center', tier: 'cmpsbl' as SubstrateTier }] : []),
        { id: 'sounding', label: 'Sounding Board', icon: MessageSquare, color: 'indigo', description: 'Module advisory feed', tier: 'cmpsbl' },
        { id: 'governor', label: 'Governor', icon: AlertTriangle, color: 'red', description: 'Administrative controls', tier: 'cmpsbl' },
        { id: 'audit', label: 'Audit', icon: Shield, color: 'cyan', description: 'Production readiness gate', tier: 'cmpsbl' },
      ],
    },
  ];
}

// Map substrate role to tier access
function getRoleTier(role: string, isGovernor: boolean): SubstrateTier {
  if (isGovernor) return 'cmpsbl';
  if (role === 'operator') return 'architect';
  return 'free'; // observers get free tier
}

function canAccessTier(userTier: SubstrateTier, requiredTier: SubstrateTier): boolean {
  const tierOrder: SubstrateTier[] = ['free', 'creator', 'architect', 'cmpsbl'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}

// ============================================
// Tier Badge Component
// ============================================
function TierBadge({ tier, size = 'sm' }: { tier: SubstrateTier; size?: 'sm' | 'xs' }) {
  const config = TIER_CONFIG[tier];
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.borderColor, config.textColor, config.bgColor,
        size === 'xs' ? 'text-[8px] h-3.5 px-1' : 'text-[9px] h-4 px-1.5'
      )}
    >
      {config.label}
    </Badge>
  );
}

// ============================================
// Upgrade Prompt Component
// ============================================
function UpgradePrompt({ requiredTier }: { requiredTier: SubstrateTier }) {
  const config = TIER_CONFIG[requiredTier];
  return (
    <motion.div 
      className="container mx-auto px-4 py-6 max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={cn(
        "rounded-2xl border-2 border-dashed p-12 text-center space-y-6",
        config.borderColor, config.bgColor
      )}>
        <div className={cn(
          "w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto",
          config.borderColor, config.bgColor
        )}>
          <Lock className={cn("w-8 h-8", config.textColor)} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {config.label} Tier Required
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This feature is available on the <span className={cn("font-semibold", config.textColor)}>{config.label}</span> tier
            {config.price && <span> ({config.price})</span>}.
            Upgrade to unlock this capability.
          </p>
        </div>
        <Button 
          className={cn("gap-2", config.bgColor, config.textColor, "hover:opacity-80 border", config.borderColor)}
          variant="outline"
          asChild
        >
          <Link to="/pricing">
            <Rocket className="w-4 h-4" />
            View Plans
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================
// Enhanced Sidebar Navigation — Tier-Labeled
// ============================================
interface SidebarNavProps {
  groups: TabGroup[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  userTier: SubstrateTier;
}

function SidebarNav({ groups, activeTab, onTabChange, collapsed = false, onClose, onLogout, userTier }: SidebarNavProps) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border",
      collapsed ? "w-16" : "w-64"
    )}>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {groups.map((group, groupIdx) => {
            const tierConfig = TIER_CONFIG[group.tier];
            const hasAccess = canAccessTier(userTier, group.tier);
            
            return (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
              >
                {!collapsed && (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <group.icon className={cn("w-3.5 h-3.5", hasAccess ? tierConfig.textColor : "text-muted-foreground/50")} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.2em]",
                      hasAccess ? tierConfig.textColor : "text-muted-foreground/50"
                    )}>
                      {group.label}
                    </span>
                    <TierBadge tier={group.tier} size="xs" />
                  </div>
                )}
                <div className="space-y-1">
                  {group.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const tabAccessible = canAccessTier(userTier, tab.tier);
                    
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
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : tabAccessible
                              ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                              : "text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/30"
                        )}
                        whileHover={{ x: collapsed ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <tab.icon className={cn(
                          "w-4 h-4 shrink-0", 
                          isActive ? "text-primary" : !tabAccessible ? "opacity-40" : ""
                        )} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{tab.label}</span>
                            {!tabAccessible && <Lock className="w-3 h-3 opacity-40" />}
                            {isActive && tabAccessible && <ChevronRight className="w-3 h-3 opacity-60" />}
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-3")}>
        <div className={cn("flex gap-2", collapsed ? "flex-col" : "")}>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "text-muted-foreground hover:text-foreground",
              collapsed ? "w-full justify-center px-2" : "flex-1"
            )}
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Home</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={cn(
              "text-muted-foreground hover:text-destructive",
              collapsed ? "w-full justify-center px-2" : "flex-1"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>CMPSBL v10.5.0</span>
            </div>
            <TierBadge tier={userTier} size="xs" />
          </div>
        )}
      </div>
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
  tier: SubstrateTier;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

function TabHeader({ icon: Icon, title, subtitle, color, tier, badge, action }: TabHeaderProps) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-400',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
    orange: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
    red: 'bg-red-500/20 border-red-500/40 text-red-400',
    violet: 'bg-violet-500/20 border-violet-500/40 text-violet-400',
    teal: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
  };
  
  return (
    <motion.div 
      className="flex items-center justify-between mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", colorMap[color] || colorMap.cyan)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <TierBadge tier={tier} />
          </div>
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

// GovernorPanel removed — now uses the full GovernorSection component

// ============================================
// Merged Modules Tab (Core + Ripple + Access)
// ============================================
function MergedModulesTab({ enabled }: { enabled: boolean }) {
  const [activeModule, setActiveModule] = useState<'core' | 'ripple' | 'access'>('core');
  
  return (
    <motion.main 
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <TabHeader 
        icon={Cpu}
        title="Substrate Modules"
        subtitle="core kernel · ripple bus · access identity"
        color="orange"
        tier="architect"
      />
      
      <div className="flex gap-2 p-1.5 rounded-xl bg-muted/30 border border-border/30 w-fit mb-6">
        {[
          { id: 'core' as const, label: 'Core Kernel', icon: Cpu },
          { id: 'ripple' as const, label: 'Ripple Bus', icon: Radio },
          { id: 'access' as const, label: 'Access Identity', icon: Key },
        ].map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeModule === mod.id
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <mod.icon className="w-4 h-4" />
            {mod.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {activeModule === 'core' && <CoreKernelTab key="core" enabled={enabled} />}
        {activeModule === 'ripple' && <RippleMessageBusTab key="ripple" enabled={enabled} />}
        {activeModule === 'access' && <AccessIdentityTab key="access" enabled={enabled} />}
      </AnimatePresence>
    </motion.main>
  );
}

// ============================================
// Main Component
// ============================================
export default function SubstrateOS() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const { data: userAgency, isLoading: agencyLoading } = useUserAgency();
  const healthScore = useSubstrateHealthScore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mintSubTab, setMintSubTab] = useState<'forge' | 'agency'>('agency');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const userTier = getRoleTier(role, isGovernor);
  const isCritical = healthScore.healthScore < 40;
  const tabGroups = getTabGroups(!!userAgency);

  // Find current tab config
  const allTabs = tabGroups.flatMap(g => g.tabs);
  const currentTabConfig = allTabs.find(t => t.id === activeTab);
  const hasAccessToCurrentTab = currentTabConfig ? canAccessTier(userTier, currentTabConfig.tier) : true;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
            <p className="text-base font-semibold font-mono text-cyan-400">clockless cognitive reality</p>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">initializing cognitive substrate...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <SEO
           title="Clockless Cognitive Reality — CMPSBL Substrate | CMPSBL®"
        description="Explore the CMPSBL Substrate: 21 runtime modules, real-time telemetry, and autonomous orchestration powering cognitive workloads."
        canonical="https://cmpsbl.com/os"
        keywords={['Clockless', 'Cognitive Reality', 'CMPSBL Substrate', 'AI runtime', 'cognitive orchestration', 'module telemetry', 'AI workload management']}
      />

      {/* Background Effects — Cinematic ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/[0.03] rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[200px]" />
      </div>

      <OSHeader userEmail={user?.email} role={role} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav 
            groups={tabGroups} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onLogout={handleLogout} 
            userTier={userTier}
          />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-pb">
          <div className="grid grid-cols-5 px-2 py-2">
            {allTabs.slice(0, 4).map((tab) => {
              const isActive = activeTab === tab.id;
              const accessible = canAccessTier(userTier, tab.tier);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : accessible
                        ? "text-muted-foreground active:bg-muted/50"
                        : "text-muted-foreground/30"
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
            <SidebarNav 
              groups={tabGroups} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onClose={() => setSidebarOpen(false)} 
              onLogout={handleLogout}
              userTier={userTier}
            />
          </SheetContent>
        </Sheet>

        {/* Content Area */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-0">
          <AnimatePresence mode="wait">
            {/* If user doesn't have access, show upgrade prompt */}
            {!hasAccessToCurrentTab && currentTabConfig && (
              <UpgradePrompt key="upgrade" requiredTier={currentTabConfig.tier} />
            )}

            {/* ═══ FREE TIER ═══ */}
            {activeTab === 'dashboard' && hasAccessToCurrentTab && (
              <motion.main 
                key="dashboard"
                className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {canAccessTier(userTier, 'architect') && <EmergencyRecoveryPanel showAlways={false} isCritical={isCritical} />}
                <DashboardMetricsHero />
                {canAccessTier(userTier, 'creator') && <CapacityMonitor />}
                {canAccessTier(userTier, 'creator') && <QuickActionsPanel enabled={isOperator} onOpenTerminal={() => setActiveTab('terminal')} />}
                {canAccessTier(userTier, 'creator') && <ModuleControlsGrid enabled={isOperator} />}
                {canAccessTier(userTier, 'architect') && <BrainIntelligencePanel enabled={isOperator} />}
                <SystemHealthPanel enabled={canAccessTier(userTier, 'creator')} />
                {canAccessTier(userTier, 'creator') && <EventStream />}
                
                {/* Upgrade CTA for free users */}
                {userTier === 'free' && (
                  <motion.div 
                    className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-background to-fuchsia-500/5 p-8 text-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <TierBadge tier="creator" />
                      <span className="text-muted-foreground">•</span>
                      <TierBadge tier="architect" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Unlock the full substrate</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Upgrade to Creator for terminal access, cognitives, and engines. 
                      Or go Architect for the Intent Mesh, Cortex, and full module control.
                    </p>
                    <Button variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20" asChild>
                      <Link to="/pricing">
                        <Rocket className="w-4 h-4 mr-2" />
                        View Plans
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </motion.main>
            )}

            {activeTab === 'health' && hasAccessToCurrentTab && (
              <motion.main 
                key="health"
                className="container mx-auto px-4 py-6 max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader icon={Activity} title="System Health" subtitle="real-time health monitoring" color="emerald" tier="free" />
                <SystemHealthPanel enabled={true} />
              </motion.main>
            )}

            {/* ═══ CREATOR TIER ═══ */}
            {activeTab === 'terminal' && hasAccessToCurrentTab && (
              <motion.div 
                key="terminal"
                className="container mx-auto px-4 py-6 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-12rem)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TabHeader 
                  icon={Terminal} title="Substrate Terminal" subtitle="cognitive command interface" color="emerald" tier="creator"
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

            {activeTab === 'analytics' && hasAccessToCurrentTab && (
              <motion.main key="analytics" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyticsTab />
              </motion.main>
            )}

            {activeTab === 'cognitives' && hasAccessToCurrentTab && (
              <motion.main key="cognitives" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TabHeader icon={Bot} title="Cognitive Registry" subtitle="minted cognitives • CMPSBL admin only" color="fuchsia" tier="cmpsbl" />
                <CognitivesPanel />
              </motion.main>
            )}

            {activeTab === 'events' && hasAccessToCurrentTab && (
              <motion.main key="events" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TabHeader icon={Activity} title="Event Stream" subtitle="real-time substrate activity" color="amber" tier="creator" />
                <EventStream />
              </motion.main>
            )}

            {activeTab === 'engines' && hasAccessToCurrentTab && <EnginesTab enabled={isOperator} />}

            {activeTab === 'agency' && hasAccessToCurrentTab && userAgency && (
              <motion.main key="agency" className="container mx-auto px-4 py-6 max-w-6xl space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">{userAgency.name}</h2>
                        <TierBadge tier="creator" />
                      </div>
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

            {/* ═══ ARCHITECT TIER ═══ */}
            {activeTab === 'mesh' && hasAccessToCurrentTab && <MeshActivityTab />}
            {activeTab === 'nexus' && hasAccessToCurrentTab && <NexusTab />}
            {activeTab === 'codeagent' && hasAccessToCurrentTab && <CodeAgentTab enabled={isOperator} />}
            {activeTab === 'modules' && hasAccessToCurrentTab && <MergedModulesTab enabled={isOperator} />}
            {activeTab === 'cortex' && hasAccessToCurrentTab && <CortexTab enabled={isOperator} />}
            {activeTab === 'atlas' && hasAccessToCurrentTab && (
              <motion.main key="atlas" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AtlasTab />
              </motion.main>
            )}
            {activeTab === 'modernizer' && hasAccessToCurrentTab && <ModernizerTab enabled={isOperator} />}
            {activeTab === 'inclusive' && hasAccessToCurrentTab && <InclusiveTab enabled={isOperator} />}
            {activeTab === 'backups' && hasAccessToCurrentTab && (
              <motion.main key="backups" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BackupRestorePanel enabled={isOperator} />
              </motion.main>
            )}

            {/* ═══ CMPSBL TIER ═══ */}
            {activeTab === 'evolution' && hasAccessToCurrentTab && (
              <motion.main key="evolution" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EvolutionTab />
              </motion.main>
            )}
            {activeTab === 'metrics' && hasAccessToCurrentTab && <PublicMetricsTab />}
            {activeTab === 'patches' && hasAccessToCurrentTab && <PatchAuthoringTab />}
            
            {activeTab === 'mint' && hasAccessToCurrentTab && (
              <motion.main key="mint" className="container mx-auto px-4 py-6 max-w-6xl space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TabHeader icon={Sparkles} title="Cognitive Mint" subtitle="forge cognitives • assemble agencies" color="purple" tier="cmpsbl" />
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
                    <Users className="w-4 h-4" />Agency Mint
                  </button>
                  <a href="/forge" className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Bot className="w-4 h-4" />Cognitive Forge<ArrowUpRight className="w-3 h-3" />
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

            {activeTab === 'sounding' && hasAccessToCurrentTab && (
              <motion.main key="sounding" className="container mx-auto px-4 py-6 max-w-5xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SoundingBoard />
              </motion.main>
            )}

            {activeTab === 'governor' && hasAccessToCurrentTab && (
              <motion.main key="governor" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GovernorSection enabled={isGovernor} />
              </motion.main>
            )}

            {activeTab === 'audit' && hasAccessToCurrentTab && (
              <motion.main key="audit" className="container mx-auto px-4 py-6 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AuditTab />
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
              <span>CMPSBL® cognitive reality</span>
            </div>
            <span>•</span>
            <span>v10.5.0</span>
            <span>•</span>
            <TierBadge tier={userTier} size="xs" />
          </div>
          <div className="flex items-center gap-4">
            <a href="/changelog" className="hover:text-cyan-400 transition-colors">evolution</a>
            <a href="/documentation" className="hover:text-cyan-400 transition-colors">docs</a>
            <a href="/pricing" className="hover:text-fuchsia-400 transition-colors">upgrade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
