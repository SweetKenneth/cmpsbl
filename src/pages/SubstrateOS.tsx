/**
 * CMPSBL® substrate — OS Surface v10.9.3 ARCHITECT Epoch
 * TIER-GATED EDITION — FREE / CREATOR / ARCHITECT / CMPSBL
 * 
 * Performance-optimized with lazy-loaded tabs and memoized dashboard.
 */

import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense, memo, useCallback, useEffect } from 'react';
import {
  Loader2, Lock, Terminal, AlertTriangle, RefreshCw, FileText,
  Settings, Zap, LayoutDashboard, Activity, Bot, Users, Sparkles,
  Building2, ExternalLink, HardDrive, Wand2, Cpu, Radio, Key, Dna,
  ChevronRight, Menu, Shield, Layers, Gauge, ArrowUpRight, Eye,
  LogOut, Home, Network, Crown, Star, Rocket, MessageSquare,
  Wrench, GitBranch
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
import { EventStream } from '@/components/substrate-os/EventStream';
import { DashboardMetricsHero, QuickActionsPanel, ModuleControlsGrid, CapacityMonitor } from '@/components/substrate-os/dashboard';
import { cn } from '@/lib/utils';

// ============================================
// Lazy-loaded tab components — only loaded when accessed
// ============================================
const EnhancedTerminal = lazy(() => import('@/components/substrate-os/EnhancedTerminal').then(m => ({ default: m.EnhancedTerminal })));
const BrainIntelligencePanel = lazy(() => import('@/components/substrate-os/BrainIntelligencePanel').then(m => ({ default: m.BrainIntelligencePanel })));
const SystemHealthPanel = lazy(() => import('@/components/substrate-os/SystemHealthPanel').then(m => ({ default: m.SystemHealthPanel })));
const CognitivesPanel = lazy(() => import('@/components/substrate-os/CognitivesPanel').then(m => ({ default: m.CognitivesPanel })));
const BackupRestorePanel = lazy(() => import('@/components/substrate-os/BackupRestorePanel').then(m => ({ default: m.BackupRestorePanel })));
const EmergencyRecoveryPanel = lazy(() => import('@/components/substrate-os/EmergencyRecoveryPanel').then(m => ({ default: m.EmergencyRecoveryPanel })));
const ModernizerTab = lazy(() => import('@/components/substrate-os/ModernizerTab').then(m => ({ default: m.ModernizerTab })));
const CoreKernelTab = lazy(() => import('@/components/substrate-os/CoreKernelTab').then(m => ({ default: m.CoreKernelTab })));
const RippleMessageBusTab = lazy(() => import('@/components/substrate-os/RippleMessageBusTab').then(m => ({ default: m.RippleMessageBusTab })));
const AccessIdentityTab = lazy(() => import('@/components/substrate-os/AccessIdentityTab').then(m => ({ default: m.AccessIdentityTab })));
const AgencyMintWizard = lazy(() => import('@/components/agency/AgencyMintWizard').then(m => ({ default: m.AgencyMintWizard })));
const AgencyGallery = lazy(() => import('@/components/agency/AgencyGallery').then(m => ({ default: m.AgencyGallery })));
const EvolutionTab = lazy(() => import('@/components/substrate-os/EvolutionTab').then(m => ({ default: m.EvolutionTab })));
const CodeAgentTab = lazy(() => import('@/components/substrate-os/CodeAgentTab').then(m => ({ default: m.CodeAgentTab })));
const CortexTab = lazy(() => import('@/components/substrate-os/CortexTab').then(m => ({ default: m.CortexTab })));
const InclusiveTab = lazy(() => import('@/components/substrate-os/InclusiveTab').then(m => ({ default: m.InclusiveTab })));
const NexusTab = lazy(() => import('@/components/substrate-os/NexusTab').then(m => ({ default: m.NexusTab })));
const AtlasTab = lazy(() => import('@/components/substrate-os/AtlasTab').then(m => ({ default: m.AtlasTab })));
const EnginesTab = lazy(() => import('@/components/substrate-os/EnginesTab').then(m => ({ default: m.EnginesTab })));
const PublicMetricsTab = lazy(() => import('@/components/substrate-os/PublicMetricsTab').then(m => ({ default: m.PublicMetricsTab })));
const PatchAuthoringTab = lazy(() => import('@/components/substrate-os/PatchAuthoringTab').then(m => ({ default: m.PatchAuthoringTab })));
const MeshActivityTab = lazy(() => import('@/components/substrate-os/MeshActivityTab').then(m => ({ default: m.MeshActivityTab })));
const AnalyticsTab = lazy(() => import('@/components/substrate-os/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const GovernorSection = lazy(() => import('@/components/substrate-os/GovernorSection').then(m => ({ default: m.GovernorSection })));
const AuditTab = lazy(() => import('@/components/substrate-os/AuditTab').then(m => ({ default: m.AuditTab })));
const SoundingBoard = lazy(() => import('@/components/governance/SoundingBoard').then(m => ({ default: m.SoundingBoard })));
const ShadowMeshToggle = lazy(() => import('@/components/admin/ShadowMeshToggle').then(m => ({ default: m.ShadowMeshToggle })));
const ShadowMeshAnalytics = lazy(() => import('@/components/admin/ShadowMeshAnalytics').then(m => ({ default: m.ShadowMeshAnalytics })));
const DefenseAnalytics = lazy(() => import('@/components/substrate-os/DefenseAnalytics').then(m => ({ default: m.DefenseAnalytics })));

// ============================================
// Tab Loading Fallback
// ============================================
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
        <p className="text-[10px] text-muted-foreground font-mono animate-pulse">Loading module...</p>
      </div>
    </div>
  );
}

// ============================================
// Tab Content Wrapper — consistent container
// ============================================
function TabPane({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.main
      key={id}
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

// ============================================
// Tier System
// ============================================
type SubstrateTier = 'free' | 'creator' | 'architect' | 'cmpsbl';

const TIER_CONFIG: Record<SubstrateTier, {
  label: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  price?: string;
}> = {
  free: {
    label: 'FREE',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    icon: Eye,
  },
  creator: {
    label: 'CREATOR',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    icon: Star,
    price: '$9/mo',
  },
  architect: {
    label: 'ARCHITECT',
    borderColor: 'border-fuchsia-500/40',
    bgColor: 'bg-fuchsia-500/10',
    textColor: 'text-fuchsia-400',
    icon: Rocket,
    price: '$19/mo',
  },
  cmpsbl: {
    label: 'CMPSBL',
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
      id: 'core',
      label: 'Core',
      icon: LayoutDashboard,
      tier: 'free',
      tabs: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan', description: 'Health, metrics & events', tier: 'free' },
      ],
    },
    {
      id: 'operate',
      label: 'Operate',
      icon: Terminal,
      tier: 'creator',
      tabs: [
        { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'emerald', description: 'Command interface', tier: 'creator' },
        { id: 'analytics', label: 'Analytics', icon: Activity, color: 'cyan', description: 'Traffic & usage', tier: 'creator' },
        { id: 'engines', label: 'Engines', icon: Layers, color: 'fuchsia', description: 'Execute & manage', tier: 'creator' },
      ],
    },
    {
      id: 'orchestrate',
      label: 'Orchestrate',
      icon: Zap,
      tier: 'architect',
      tabs: [
        { id: 'nexus', label: 'Nexus', icon: Zap, color: 'cyan', description: 'AI routing', tier: 'architect' },
        { id: 'mesh', label: 'Intent Mesh', icon: Network, color: 'amber', description: 'Capability mesh', tier: 'architect' },
        { id: 'codeagent', label: 'ENCODE', icon: Bot, color: 'fuchsia', description: 'Code pipeline', tier: 'architect' },
        { id: 'cortex', label: 'Cortex', icon: Wand2, color: 'violet', description: 'Orchestrator', tier: 'architect' },
        { id: 'modules', label: 'Modules', icon: Cpu, color: 'orange', description: 'Core · Ripple · Access', tier: 'architect' },
        { id: 'atlas', label: 'Atlas', icon: Gauge, color: 'cyan', description: 'Control plane', tier: 'architect' },
      ],
    },
    {
      id: 'extend',
      label: 'Extend',
      icon: Sparkles,
      tier: 'cmpsbl',
      tabs: [
        { id: 'forge', label: 'Forge', icon: Sparkles, color: 'fuchsia', description: 'Cognitives & mint', tier: 'cmpsbl' },
        ...(hasAgency ? [{ id: 'agency', label: 'Agency', icon: Building2, color: 'blue', description: 'Command center', tier: 'cmpsbl' as SubstrateTier }] : []),
        { id: 'infra', label: 'Infrastructure', icon: Wrench, color: 'purple', description: 'Evolution · Modernizer · Inclusive', tier: 'cmpsbl' },
      ],
    },
    {
      id: 'govern',
      label: 'Govern',
      icon: Shield,
      tier: 'cmpsbl',
      tabs: [
        { id: 'security', label: 'Security', icon: Shield, color: 'amber', description: 'Defense · Audit · Backups', tier: 'cmpsbl' },
        { id: 'patches', label: 'Patches', icon: Shield, color: 'blue', description: 'LNCHBL patches', tier: 'cmpsbl' },
        { id: 'governor', label: 'Governor', icon: AlertTriangle, color: 'red', description: 'Admin & advisory', tier: 'cmpsbl' },
      ],
    },
  ];
}

function getRoleTier(role: string, isGovernor: boolean): SubstrateTier {
  if (isGovernor) return 'cmpsbl';
  if (role === 'operator') return 'architect';
  return 'free';
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
// Sidebar Navigation — Polished
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
      "flex flex-col h-full bg-background/95 backdrop-blur-xl border-r border-border/40",
      collapsed ? "w-16" : "w-60"
    )}>
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {groups.map((group, groupIdx) => {
            const tierConfig = TIER_CONFIG[group.tier];
            const hasAccess = canAccessTier(userTier, group.tier);
            
            return (
              <div key={group.id}>
                {/* Group separator */}
                {groupIdx > 0 && <div className="h-px bg-border/30 mx-3 my-2" />}
                
                {!collapsed && (
                  <div className="flex items-center gap-2 px-3 mb-1 mt-1">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-[0.2em]",
                      hasAccess ? "text-muted-foreground/70" : "text-muted-foreground/30"
                    )}>
                      {group.label}
                    </span>
                    {!hasAccess && <TierBadge tier={group.tier} size="xs" />}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const tabAccessible = canAccessTier(userTier, tab.tier);
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabChange(tab.id);
                          onClose?.();
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                          collapsed ? "justify-center" : "",
                          isActive
                            ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                            : tabAccessible
                              ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              : "text-muted-foreground/30 cursor-default"
                        )}
                      >
                        <tab.icon className={cn(
                          "w-4 h-4 shrink-0", 
                          isActive ? "text-primary" : !tabAccessible ? "opacity-30" : ""
                        )} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left text-[13px] truncate">{tab.label}</span>
                            {!tabAccessible && <Lock className="w-3 h-3 opacity-30" />}
                            {isActive && tabAccessible && <ChevronRight className="w-3 h-3 opacity-50" />}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      <div className={cn("border-t border-border/40", collapsed ? "p-2" : "p-3")}>
        <div className={cn("flex gap-1.5", collapsed ? "flex-col" : "")}>
          <Button variant="ghost" size="sm" asChild className={cn("text-muted-foreground hover:text-foreground", collapsed ? "w-full justify-center px-2" : "flex-1")}>
            <Link to="/"><Home className="w-4 h-4" />{!collapsed && <span className="ml-1.5 text-xs">Home</span>}</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className={cn("text-muted-foreground hover:text-destructive", collapsed ? "w-full justify-center px-2" : "flex-1")}>
            <LogOut className="w-4 h-4" />{!collapsed && <span className="ml-1.5 text-xs">Logout</span>}
          </Button>
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 font-mono mt-2.5 pt-2.5 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>CMPSBL v10.9.3</span>
            </div>
            <TierBadge tier={userTier} size="xs" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Tab Header Component — Tighter
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
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center", colorMap[color] || colorMap.cyan)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <TierBadge tier={tier} size="xs" />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        {action}
      </div>
    </div>
  );
}

// ============================================
// Sub-tab selector component (reusable)
// ============================================
function SubTabBar({ 
  tabs, 
  active, 
  onChange, 
  accentColor 
}: { 
  tabs: { id: string; label: string; icon: React.ElementType }[]; 
  active: string; 
  onChange: (id: string) => void;
  accentColor: string;
}) {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    fuchsia: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    red: 'bg-red-500/20 text-red-400 border-red-500/40',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  };
  const activeClass = colorMap[accentColor] || colorMap.amber;

  return (
    <div className="flex gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/20 w-fit mb-5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            active === tab.id
              ? cn(activeClass, "border shadow-sm")
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <tab.icon className="w-3.5 h-3.5" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Merged Modules Tab (Core + Ripple + Access)
// ============================================
function MergedModulesTab({ enabled }: { enabled: boolean }) {
  const [activeModule, setActiveModule] = useState<'core' | 'ripple' | 'access'>('core');
  
  return (
    <TabPane id="modules">
      <TabHeader icon={Cpu} title="Substrate Modules" subtitle="core kernel · ripple bus · access identity" color="orange" tier="architect" />
      <SubTabBar
        tabs={[
          { id: 'core' as const, label: 'Core Kernel', icon: Cpu },
          { id: 'ripple' as const, label: 'Ripple Bus', icon: Radio },
          { id: 'access' as const, label: 'Access Identity', icon: Key },
        ]}
        active={activeModule}
        onChange={(id) => setActiveModule(id as typeof activeModule)}
        accentColor="orange"
      />
      <Suspense fallback={<TabLoadingFallback />}>
        <AnimatePresence mode="wait">
          {activeModule === 'core' && <CoreKernelTab key="core" enabled={enabled} />}
          {activeModule === 'ripple' && <RippleMessageBusTab key="ripple" enabled={enabled} />}
          {activeModule === 'access' && <AccessIdentityTab key="access" enabled={enabled} />}
        </AnimatePresence>
      </Suspense>
    </TabPane>
  );
}

// ============================================
// Merged Forge Tab (Cognitives + Mint + Public Metrics)
// ============================================
function MergedForgeTab({ enabled, hasAgency }: { enabled: boolean; hasAgency: boolean }) {
  const [activeForge, setActiveForge] = useState<'cognitives' | 'mint' | 'metrics'>('cognitives');

  return (
    <TabPane id="forge">
      <TabHeader icon={Sparkles} title="Forge" subtitle="cognitives · agency mint · public metrics" color="fuchsia" tier="cmpsbl" />
      <div className="flex items-center gap-2 mb-5">
        <SubTabBar
          tabs={[
            { id: 'cognitives' as const, label: 'Cognitives', icon: Bot },
            { id: 'mint' as const, label: 'Agency Mint', icon: Users },
            { id: 'metrics' as const, label: 'Public Metrics', icon: Gauge },
          ]}
          active={activeForge}
          onChange={(id) => setActiveForge(id as typeof activeForge)}
          accentColor="fuchsia"
        />
        <a href="/forge" className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
          <Bot className="w-3.5 h-3.5" />Forge App<ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
      <Suspense fallback={<TabLoadingFallback />}>
        <AnimatePresence mode="wait">
          {activeForge === 'cognitives' && <CognitivesPanel key="cognitives" />}
          {activeForge === 'mint' && (
            <div key="mint">
              <Tabs defaultValue="create" className="space-y-4">
                <TabsList className="bg-muted/30 border border-border/30">
                  <TabsTrigger value="create" className="gap-2 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-400">
                    <Sparkles className="w-4 h-4" />Create
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    <Users className="w-4 h-4" />Gallery
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="create"><AgencyMintWizard onComplete={() => {}} /></TabsContent>
                <TabsContent value="gallery"><AgencyGallery /></TabsContent>
              </Tabs>
            </div>
          )}
          {activeForge === 'metrics' && <PublicMetricsTab key="metrics" />}
        </AnimatePresence>
      </Suspense>
    </TabPane>
  );
}

// ============================================
// Merged Infrastructure Tab (Evolution + Modernizer + Inclusive)
// ============================================
function MergedInfraTab({ enabled }: { enabled: boolean }) {
  const [activeInfra, setActiveInfra] = useState<'evolution' | 'modernizer' | 'inclusive'>('evolution');

  return (
    <TabPane id="infra">
      <TabHeader icon={Wrench} title="Infrastructure" subtitle="evolution · modernizer · inclusive" color="purple" tier="cmpsbl" />
      <SubTabBar
        tabs={[
          { id: 'evolution' as const, label: 'Evolution', icon: Dna },
          { id: 'modernizer' as const, label: 'Modernizer', icon: Wand2 },
          { id: 'inclusive' as const, label: 'Inclusive', icon: Users },
        ]}
        active={activeInfra}
        onChange={(id) => setActiveInfra(id as typeof activeInfra)}
        accentColor="purple"
      />
      <Suspense fallback={<TabLoadingFallback />}>
        <AnimatePresence mode="wait">
          {activeInfra === 'evolution' && <EvolutionTab key="evolution" />}
          {activeInfra === 'modernizer' && <ModernizerTab key="modernizer" enabled={enabled} />}
          {activeInfra === 'inclusive' && <InclusiveTab key="inclusive" enabled={enabled} />}
        </AnimatePresence>
      </Suspense>
    </TabPane>
  );
}

// ============================================
// Merged Security Tab (Defense + Shadow Mesh + Audit + Backups)
// ============================================
function MergedSecurityTab({ isGovernor, isOperator }: { isGovernor: boolean; isOperator: boolean }) {
  const [activeSec, setActiveSec] = useState<'defense' | 'immune' | 'audit' | 'backups'>('defense');

  return (
    <TabPane id="security">
      <TabHeader icon={Shield} title="Security Center" subtitle="defense · immune · audit · backups" color="amber" tier="cmpsbl" />
      <SubTabBar
        tabs={[
          { id: 'defense' as const, label: 'Defense', icon: Shield },
          { id: 'immune' as const, label: 'Shadow Mesh', icon: Network },
          { id: 'audit' as const, label: 'Audit Gate', icon: FileText },
          { id: 'backups' as const, label: 'Backups', icon: HardDrive },
        ]}
        active={activeSec}
        onChange={(id) => setActiveSec(id as typeof activeSec)}
        accentColor="amber"
      />
      <Suspense fallback={<TabLoadingFallback />}>
        <AnimatePresence mode="wait">
          {activeSec === 'defense' && <DefenseAnalytics key="defense" />}
          {activeSec === 'immune' && (
            <div key="immune" className="space-y-6">
              <ShadowMeshToggle />
              <ShadowMeshAnalytics />
            </div>
          )}
          {activeSec === 'audit' && <AuditTab key="audit" />}
          {activeSec === 'backups' && <BackupRestorePanel key="backups" enabled={isOperator} />}
        </AnimatePresence>
      </Suspense>
    </TabPane>
  );
}

// ============================================
// Merged Governor Tab (Governor + Sounding Board)
// ============================================
function MergedGovernorTab({ isGovernor }: { isGovernor: boolean }) {
  const [activeGov, setActiveGov] = useState<'controls' | 'advisory'>('controls');

  return (
    <TabPane id="governor">
      <TabHeader icon={AlertTriangle} title="Governor" subtitle="administrative controls · module advisory" color="red" tier="cmpsbl" />
      <SubTabBar
        tabs={[
          { id: 'controls' as const, label: 'Admin Controls', icon: Settings },
          { id: 'advisory' as const, label: 'Sounding Board', icon: MessageSquare },
        ]}
        active={activeGov}
        onChange={(id) => setActiveGov(id as typeof activeGov)}
        accentColor="red"
      />
      <Suspense fallback={<TabLoadingFallback />}>
        <AnimatePresence mode="wait">
          {activeGov === 'controls' && <GovernorSection key="controls" enabled={isGovernor} />}
          {activeGov === 'advisory' && <SoundingBoard key="advisory" />}
        </AnimatePresence>
      </Suspense>
    </TabPane>
  );
}


const DashboardContent = memo(function DashboardContent({ 
  userTier, isOperator, isCritical, onOpenTerminal 
}: { 
  userTier: SubstrateTier; isOperator: boolean; isCritical: boolean; onOpenTerminal: () => void;
}) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      {/* Left / Main column */}
      <div className="flex-1 min-w-0 space-y-5">
        {canAccessTier(userTier, 'architect') && (
          <Suspense fallback={null}>
            <EmergencyRecoveryPanel showAlways={false} isCritical={isCritical} />
          </Suspense>
        )}
        <DashboardMetricsHero />
        {canAccessTier(userTier, 'creator') && <CapacityMonitor />}
        {canAccessTier(userTier, 'creator') && <QuickActionsPanel enabled={isOperator} onOpenTerminal={onOpenTerminal} />}
        {canAccessTier(userTier, 'creator') && <ModuleControlsGrid enabled={isOperator} />}
        {canAccessTier(userTier, 'architect') && (
          <Suspense fallback={<TabLoadingFallback />}>
            <BrainIntelligencePanel enabled={isOperator} />
          </Suspense>
        )}
        <Suspense fallback={<TabLoadingFallback />}>
          <SystemHealthPanel enabled={canAccessTier(userTier, 'creator')} />
        </Suspense>
      </div>

      {/* Right / Live Sidebar (desktop only) */}
      <div className="hidden xl:flex flex-col gap-4 w-[320px] shrink-0 sticky top-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/30 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[10px] font-semibold text-foreground/80 font-mono uppercase tracking-widest">Cognitive Runtime</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            21 autonomous modules composing, healing, and learning in real-time. 
            Every request is routed, traced, and compounded.
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[
              { label: 'Modules', value: '21' },
              { label: 'Providers', value: '7' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Epoch', value: 'v10.9' },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-muted/20 border border-border/20 px-2.5 py-1.5 text-center">
                <div className="text-sm font-bold font-mono text-foreground">{s.value}</div>
                <div className="text-[8px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {canAccessTier(userTier, 'creator') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <EventStream />
          </motion.div>
        )}

        {!canAccessTier(userTier, 'creator') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent backdrop-blur-xl p-5 space-y-3 text-center"
          >
            <Rocket className="w-5 h-5 text-cyan-400 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">Unlock Live Stream</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Upgrade to Creator for real-time substrate events.
            </p>
            <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 w-full text-xs" asChild>
              <Link to="/pricing">View Plans</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
});

// ============================================
// Main Component
// ============================================
export default function SubstrateOS() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const { data: userAgency, isLoading: agencyLoading } = useUserAgency();
  const healthScore = useSubstrateHealthScore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const userTier = getRoleTier(role, isGovernor);
  const isCritical = healthScore.healthScore < 40;
  const tabGroups = getTabGroups(!!userAgency);

  const allTabs = tabGroups.flatMap(g => g.tabs);
  const currentTabConfig = allTabs.find(t => t.id === activeTab);
  const hasAccessToCurrentTab = currentTabConfig ? canAccessTier(userTier, currentTabConfig.tier) : true;

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate]);

  const handleOpenTerminal = useCallback(() => setActiveTab('terminal'), []);

  // Keyboard shortcuts: Ctrl+1..9 for quick tab access
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          const accessibleTabs = allTabs.filter(t => canAccessTier(userTier, t.tier));
          const target = accessibleTabs[num - 1];
          if (target) {
            e.preventDefault();
            setActiveTab(target.id);
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allTabs, userTier]);

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-primary/10 to-fuchsia-500/15 border border-cyan-500/40 flex items-center justify-center mx-auto">
            <Terminal className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold font-mono text-cyan-400">cognitive substrate</p>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">initializing...</p>
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
        keywords={['Clockless', 'Cognitive Reality', 'CMPSBL Substrate', 'AI runtime', 'cognitive orchestration']}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/[0.02] rounded-full blur-[100px]" />
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 safe-area-pb">
          <div className="grid grid-cols-5 px-2 py-1.5">
            {(() => {
              const priority = ['dashboard', 'analytics', 'terminal', 'engines', 'nexus', 'codeagent', 'security', 'forge'];
              const accessibleTabs = allTabs.filter(t => canAccessTier(userTier, t.tier));
              const mobileTabs = priority
                .map(id => accessibleTabs.find(t => t.id === id))
                .filter(Boolean)
                .slice(0, 4) as TabConfig[];
              while (mobileTabs.length < 4 && accessibleTabs.length > mobileTabs.length) {
                const next = accessibleTabs.find(t => !mobileTabs.some(m => m.id === t.id));
                if (next) mobileTabs.push(next);
                else break;
              }
              return mobileTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-all",
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground active:bg-muted/50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[9px] font-medium">{tab.label}</span>
                  </button>
                );
              });
            })()}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-muted-foreground active:bg-muted/50"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-medium">More</span>
            </button>
          </div>
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-background">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-sm">Navigation</h3>
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
            {!hasAccessToCurrentTab && currentTabConfig && (
              <UpgradePrompt key="upgrade" requiredTier={currentTabConfig.tier} />
            )}

            {/* ═══ FREE TIER ═══ */}
            {activeTab === 'dashboard' && hasAccessToCurrentTab && (
              <TabPane id="dashboard">
                <DashboardContent 
                  userTier={userTier} 
                  isOperator={isOperator} 
                  isCritical={isCritical} 
                  onOpenTerminal={handleOpenTerminal} 
                />

                {/* Mobile: EventStream below */}
                <div className="xl:hidden mt-6">
                  {canAccessTier(userTier, 'creator') && <EventStream />}
                </div>

                {/* Upgrade CTA for free users */}
                {userTier === 'free' && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-background to-fuchsia-500/5 p-8 text-center space-y-3 mt-6">
                    <div className="flex items-center justify-center gap-2">
                      <TierBadge tier="creator" />
                      <span className="text-muted-foreground/40">•</span>
                      <TierBadge tier="architect" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Unlock the full substrate</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Terminal, cognitives, engines, Intent Mesh, Cortex, and full module control.
                    </p>
                    <Button variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20" asChild>
                      <Link to="/pricing">
                        <Rocket className="w-4 h-4 mr-2" />View Plans
                      </Link>
                    </Button>
                  </div>
                )}
              </TabPane>
            )}

            {/* ═══ CREATOR TIER ═══ */}
            {activeTab === 'terminal' && hasAccessToCurrentTab && (
              <motion.div key="terminal" className="container mx-auto px-4 py-6 max-w-5xl flex-1 flex flex-col min-h-[calc(100vh-12rem)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TabHeader 
                  icon={Terminal} title="Substrate Terminal" subtitle="cognitive command interface" color="emerald" tier="creator"
                  badge={
                    <Badge variant="outline" className={cn(
                      isOperator ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                    )}>
                      {isOperator ? 'OPERATOR' : 'READ-ONLY'}
                    </Badge>
                  }
                />
                <Suspense fallback={<TabLoadingFallback />}>
                  <div className="flex-1 min-h-[500px]">
                    <EnhancedTerminal enabled={isOperator} fullHeight className="h-full" />
                  </div>
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'analytics' && hasAccessToCurrentTab && (
              <motion.main key="analytics" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Suspense fallback={<TabLoadingFallback />}><AnalyticsTab /></Suspense>
              </motion.main>
            )}

            {activeTab === 'engines' && hasAccessToCurrentTab && (
              <Suspense fallback={<TabLoadingFallback />}><EnginesTab enabled={isOperator} /></Suspense>
            )}

            {/* ═══ ARCHITECT TIER ═══ */}
            {activeTab === 'mesh' && hasAccessToCurrentTab && (
              <TabPane id="mesh">
                <TabHeader icon={Network} title="Intent Mesh" subtitle="autonomous capability mesh" color="amber" tier="architect" />
                <Suspense fallback={<TabLoadingFallback />}><MeshActivityTab /></Suspense>
              </TabPane>
            )}
            {activeTab === 'nexus' && hasAccessToCurrentTab && (
              <TabPane id="nexus">
                <TabHeader icon={Zap} title="Nexus" subtitle="AI provider routing & orchestration" color="cyan" tier="architect" />
                <Suspense fallback={<TabLoadingFallback />}><NexusTab /></Suspense>
              </TabPane>
            )}
            {activeTab === 'codeagent' && hasAccessToCurrentTab && (
              <TabPane id="codeagent">
                <TabHeader icon={Bot} title="ENCODE" subtitle="DECODE → ENCODE pipeline" color="fuchsia" tier="architect" />
                <Suspense fallback={<TabLoadingFallback />}><CodeAgentTab enabled={isOperator} /></Suspense>
              </TabPane>
            )}
            {activeTab === 'modules' && hasAccessToCurrentTab && <MergedModulesTab enabled={isOperator} />}
            {activeTab === 'cortex' && hasAccessToCurrentTab && (
              <TabPane id="cortex">
                <TabHeader icon={Wand2} title="Cortex" subtitle="cognitive orchestrator" color="violet" tier="architect" />
                <Suspense fallback={<TabLoadingFallback />}><CortexTab enabled={isOperator} /></Suspense>
              </TabPane>
            )}
            {activeTab === 'atlas' && hasAccessToCurrentTab && (
              <TabPane id="atlas">
                <TabHeader icon={Gauge} title="Atlas" subtitle="control plane & capabilities" color="cyan" tier="architect" />
                <Suspense fallback={<TabLoadingFallback />}><AtlasTab /></Suspense>
              </TabPane>
            )}

            {/* ═══ CMPSBL TIER ═══ */}
            {activeTab === 'forge' && hasAccessToCurrentTab && (
              <MergedForgeTab enabled={isOperator} hasAgency={!!userAgency} />
            )}

            {activeTab === 'infra' && hasAccessToCurrentTab && (
              <MergedInfraTab enabled={isOperator} />
            )}

            {activeTab === 'agency' && hasAccessToCurrentTab && userAgency && (
              <TabPane id="agency">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <Building2 className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">{userAgency.name}</h2>
                        <TierBadge tier="cmpsbl" size="xs" />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">{userAgency.status === 'deployed' ? 'deployed • active' : userAgency.status || 'pending'}</p>
                    </div>
                  </div>
                  <Link
                    to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-all text-sm font-medium"
                  >
                    Open Portal
                    <ExternalLink className="w-3.5 h-3.5" />
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-muted/20 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                        <Badge variant="outline" className={cn("text-[10px]",
                          userAgency.status === 'deployed' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        )}>
                          {userAgency.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="rounded-xl bg-muted/20 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Portal</p>
                        <p className="text-xs font-mono text-foreground truncate">{userAgency.slug ? `/a/${userAgency.slug}` : 'Not deployed'}</p>
                      </div>
                      <div className="rounded-xl bg-muted/20 p-3 text-center col-span-2">
                        <p className="text-[10px] text-muted-foreground mb-1">Quick Access</p>
                        <Link
                          to={userAgency.slug ? `/a/${userAgency.slug}` : `/agency/${userAgency.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                        >
                          Launch full agency portal →
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabPane>
            )}

            {activeTab === 'security' && hasAccessToCurrentTab && (
              <MergedSecurityTab isGovernor={isGovernor} isOperator={isOperator} />
            )}

            {activeTab === 'patches' && hasAccessToCurrentTab && (
              <TabPane id="patches">
                <TabHeader icon={Shield} title="Patch Distribution" subtitle="author & distribute LNCHBL patches" color="blue" tier="cmpsbl" />
                <Suspense fallback={<TabLoadingFallback />}><PatchAuthoringTab /></Suspense>
              </TabPane>
            )}

            {activeTab === 'governor' && hasAccessToCurrentTab && (
              <MergedGovernorTab isGovernor={isGovernor} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="hidden lg:block border-t border-border/30 bg-background/80 backdrop-blur-sm px-4 py-1.5">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[9px] font-mono text-muted-foreground/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>CMPSBL®</span>
            </div>
            <span className="text-muted-foreground/30">·</span>
            <span>v10.9.3</span>
            <span className="text-muted-foreground/30">·</span>
            <span>{healthScore.activeCount}/{healthScore.totalModules} modules</span>
            <span className="text-muted-foreground/30">·</span>
            <TierBadge tier={userTier} size="xs" />
          </div>
          <div className="flex items-center gap-3">
            <a href="/changelog" className="hover:text-foreground transition-colors">changelog</a>
            <a href="/documentation" className="hover:text-foreground transition-colors">docs</a>
            <a href="/pricing" className="hover:text-foreground transition-colors">upgrade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
