/**
 * System Intelligence Feed — Observer Mode
 * Immersive Observer Mode experience
 *
 * A unique, cinematic view into the substrate's autonomous learning.
 * Observers witness CLM in action without any interaction.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Cpu, 
  Shield, 
  Network, 
  Eye, 
  Zap, 
  Lock, 
  Accessibility,
  RefreshCw,
  Settings,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Activity,
  Clock,
  FileText,
  LogIn,
  Sparkles,
  Radio,
  Orbit,
  Waves,
  Moon,
  Plug,
} from 'lucide-react';
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';
import { type ModuleName, type ModuleSelfAnalysis } from '@/lib/substrate/module-clm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { EncodedLearningCard } from '@/components/substrate-os/EncodedLearningCard';
import { ModuleLearningFeed } from '@/components/substrate-os/ModuleLearningFeed';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_ICONS: Record<ModuleName, React.ElementType> = {
  core: Cpu, brain: Brain, cortex: Cpu, defense: Shield, nexus: Network,
  vision: Eye, ripple: Zap, access: Lock, inclusive: Accessibility,
  system: Settings, decode: FileText, dream: Moon,
  integration: Plug, encode: FileText, memory: FileText, relay: FileText,
  audit: FileText, identity: FileText, economy: FileText, sandbox: FileText,
  nerve: Zap, medic: FileText, sovereign: Shield, oracle: Eye,
  conscience: FileText, treaty: FileText, compass: Network, echo: RefreshCw,
  reflex: Zap, forge: Cpu, lingua: FileText, harvest: FileText,
  phantom: Moon, evolution: RefreshCw, shadow: Moon, immunity: Shield,
  intent: Brain, governance: Lock, engineer: Settings,
};

const MODULE_COLORS: Record<ModuleName, string> = {
  core: 'from-slate-500/20 to-slate-600/5 border-slate-500/30',
  brain: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  cortex: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  defense: 'from-red-500/20 to-red-600/5 border-red-500/30',
  nexus: 'from-green-500/20 to-green-600/5 border-green-500/30',
  vision: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  ripple: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
  access: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
  inclusive: 'from-pink-500/20 to-pink-600/5 border-pink-500/30',
  
  system: 'from-gray-500/20 to-gray-600/5 border-gray-500/30',
  decode: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30',
  dream: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
  integration: 'from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/30',
  encode: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
  memory: 'from-sky-500/20 to-sky-600/5 border-sky-500/30',
  relay: 'from-lime-500/20 to-lime-600/5 border-lime-500/30',
  audit: 'from-stone-500/20 to-stone-600/5 border-stone-500/30',
  identity: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
  economy: 'from-amber-600/20 to-amber-700/5 border-amber-600/30',
  sandbox: 'from-teal-500/20 to-teal-600/5 border-teal-500/30',
  nerve: 'from-cyan-600/20 to-cyan-700/5 border-cyan-600/30',
  medic: 'from-red-400/20 to-red-500/5 border-red-400/30',
  sovereign: 'from-yellow-600/20 to-yellow-700/5 border-yellow-600/30',
  oracle: 'from-purple-600/20 to-purple-700/5 border-purple-600/30',
  conscience: 'from-pink-600/20 to-pink-700/5 border-pink-600/30',
  treaty: 'from-orange-600/20 to-orange-700/5 border-orange-600/30',
  compass: 'from-green-600/20 to-green-700/5 border-green-600/30',
  echo: 'from-blue-600/20 to-blue-700/5 border-blue-600/30',
  reflex: 'from-red-600/20 to-red-700/5 border-red-600/30',
  forge: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  lingua: 'from-indigo-600/20 to-indigo-700/5 border-indigo-600/30',
  harvest: 'from-lime-600/20 to-lime-700/5 border-lime-600/30',
  phantom: 'from-gray-600/20 to-gray-700/5 border-gray-600/30',
  evolution: 'from-emerald-600/20 to-emerald-700/5 border-emerald-600/30',
  shadow: 'from-slate-600/20 to-slate-700/5 border-slate-600/30',
  immunity: 'from-rose-600/20 to-rose-700/5 border-rose-600/30',
  intent: 'from-violet-600/20 to-violet-700/5 border-violet-600/30',
  governance: 'from-stone-600/20 to-stone-700/5 border-stone-600/30',
  engineer: 'from-sky-600/20 to-sky-700/5 border-sky-600/30',
};

const MODULE_TEXT_COLORS: Record<ModuleName, string> = {
  core: 'text-slate-400', brain: 'text-purple-400', cortex: 'text-blue-400',
  defense: 'text-red-400', nexus: 'text-green-400', vision: 'text-amber-400',
  ripple: 'text-cyan-400', access: 'text-orange-400', inclusive: 'text-pink-400',
  system: 'text-gray-400', decode: 'text-indigo-400',
  dream: 'text-violet-400', integration: 'text-fuchsia-400', encode: 'text-yellow-400',
  memory: 'text-sky-400', relay: 'text-lime-400', audit: 'text-stone-400',
  identity: 'text-rose-400', economy: 'text-amber-500', sandbox: 'text-teal-400',
  nerve: 'text-cyan-500', medic: 'text-red-300', sovereign: 'text-yellow-500',
  oracle: 'text-purple-500', conscience: 'text-pink-500', treaty: 'text-orange-500',
  compass: 'text-green-500', echo: 'text-blue-500', reflex: 'text-red-500',
  forge: 'text-amber-400', lingua: 'text-indigo-500', harvest: 'text-lime-500',
  phantom: 'text-gray-500', evolution: 'text-emerald-500', shadow: 'text-slate-500',
  immunity: 'text-rose-500', intent: 'text-violet-500', governance: 'text-stone-500',
  engineer: 'text-sky-500',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

function ObserverBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scan lines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLM STATUS BEACON
// ═══════════════════════════════════════════════════════════════════════════════

function CLMStatusBeacon() {
  return (
    <div className="relative">
      {/* Pulsing rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-green-500/50"
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-green-500/50"
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
      />
      
      {/* Core beacon */}
      <div className="relative w-4 h-4 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS STREAM ITEM
// ═══════════════════════════════════════════════════════════════════════════════

interface StreamItemProps {
  analysis: ModuleSelfAnalysis;
  index: number;
}

function StreamItem({ analysis, index }: StreamItemProps) {
  const ModuleIcon = MODULE_ICONS[analysis.moduleId] || Brain;
  const gradientClass = MODULE_COLORS[analysis.moduleId];
  const textColor = MODULE_TEXT_COLORS[analysis.moduleId];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "relative p-4 rounded-xl border bg-gradient-to-r backdrop-blur-sm",
        gradientClass
      )}
    >
      {/* Connection line */}
      <div className="absolute left-0 top-1/2 -translate-x-full w-8 h-px bg-gradient-to-r from-transparent to-primary/30" />
      
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50", textColor)}>
          <ModuleIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-mono text-xs font-bold", textColor)}>
              {analysis.moduleId.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground capitalize">
              {analysis.analysisType}
            </span>
          </div>
          
          <p className="text-sm text-foreground/90 line-clamp-2">
            {analysis.title}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(analysis.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {(analysis.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE ORBIT DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

function ModuleOrbit({ activeModules }: { activeModules: ModuleName[] }) {
  const allModules = Object.keys(MODULE_ICONS) as ModuleName[];
  
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto">
      {/* Central brain */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
        </motion.div>
      </div>
      
      {/* Orbiting modules - use percentage-based positioning */}
      {allModules.map((moduleId, i) => {
        const Icon = MODULE_ICONS[moduleId];
        const angle = (i / allModules.length) * 2 * Math.PI;
        const isActive = activeModules.includes(moduleId);
        const textColor = MODULE_TEXT_COLORS[moduleId];
        
        // Calculate position as percentage from center (40% radius)
        const x = 50 + 38 * Math.cos(angle - Math.PI / 2);
        const y = 50 + 38 * Math.sin(angle - Math.PI / 2);
        
        return (
          <motion.div
            key={moduleId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              opacity: isActive ? 1 : 0.3,
              scale: isActive ? 1.15 : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <div className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-background/80 border flex items-center justify-center",
              isActive ? "border-primary/50" : "border-border/50",
              textColor
            )}>
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </div>
          </motion.div>
        );
      })}
      
      {/* Orbit ring - contained within parent */}
      <div className="absolute inset-[10%] rounded-full border border-dashed border-border/30" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH REQUIRED - OBSERVER GATE
// ═══════════════════════════════════════════════════════════════════════════════

function ObserverGate() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <PublicNav />
      <ObserverBackground />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg"
        >
          {/* Observer Mode badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">OBSERVER MODE</span>
          </motion.div>
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
              Witness the Substrate
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Enter as an observer to watch autonomous intelligence evolve in real-time
          </p>
          
          {/* CLM Status */}
          <div className="flex items-center justify-center gap-3 mb-8 p-4 rounded-xl bg-card/50 border border-border/50">
            <CLMStatusBeacon />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Constant Learning Mode</p>
              <p className="text-xs text-green-400">Running 24/7 • Autonomous</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Radio, label: "Live Feed", desc: "Real-time intelligence" },
              { icon: Orbit, label: "Node Orbit", desc: "14 learning nodes" },
              { icon: Waves, label: "Analysis Stream", desc: "Self-improvement cycles" },
            ].map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-4 rounded-xl bg-card/30 border border-border/30"
              >
                <feat.icon className="w-6 h-6 text-primary mb-2 mx-auto" />
                <p className="text-sm font-medium">{feat.label}</p>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
          
          {/* CTA */}
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              <LogIn className="w-4 h-4" />
              Enter Observer Mode
            </Link>
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Read-only access • No interaction required
          </p>
        </motion.div>
      </div>
      <EnhancedFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OBSERVER MODE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SystemIntelligenceFeed() {
  const { user, loading: authLoading } = useAuth();
  const { feed, loading, error, refreshFeed } = useModuleCLM();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auth gate
  if (!authLoading && !user) {
    return <ObserverGate />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Orbit className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const activeModules = [...new Set(feed.map(f => f.moduleId))];
  const recentFeed = feed.slice(0, 8);

  return (
    <>
      <Helmet>
        <title>Observer Mode — System Intelligence Feed | CMPSBL</title>
        <meta name="description" content="Observer Mode — Watch the CMPSBL Substrate's autonomous learning and Clockless Cognitive Reality engine in real-time." />
      </Helmet>

      <div className="min-h-screen bg-background relative flex flex-col">
        <PublicNav />
        <ObserverBackground />
        
        <div className="relative z-10 flex-1">
          {/* Header Bar */}
          <header className="border-b border-border/30 bg-background/50 backdrop-blur-xl sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">OBSERVER MODE</span>
                  </div>
                  <Badge variant="outline" className="hidden sm:flex gap-1.5 border-green-500/30 text-green-400">
                    <CLMStatusBeacon />
                    <span>CLM Active</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">System Time</p>
                    <p className="font-mono text-sm">{currentTime.toLocaleTimeString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshFeed}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {/* Observer Mode Hero */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Witnessing Autonomous Intelligence</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Constant Learning Mode
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The substrate continuously analyzes its own performance, generates improvement 
                requests, and evolves without human intervention. You are observing this process in real-time.
              </p>
            </motion.section>

            {/* Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: "Learning Cycles", value: feed.length, icon: Activity },
                { label: "Active Modules", value: activeModules.length, icon: Cpu },
                { label: "Mode", value: "24/7", icon: Radio },
                { label: "Status", value: "LIVE", icon: Zap },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-card/50 border border-border/50 text-center"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Encoded Learning - Full Width Priority */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <EncodedLearningCard />
            </motion.section>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Module Orbit - Left */}
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Orbit className="w-5 h-5 text-primary" />
                    Module Network
                  </h2>
                  <ModuleOrbit activeModules={activeModules} />
                  
                  <div className="mt-8 p-4 rounded-xl bg-card/30 border border-border/30">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Observer Mode Info
                    </h3>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        View-only access to intelligence feed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        CLM runs continuously via backend
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        Encoded learns code patterns 24/7
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        <Link to="/os" className="text-primary hover:underline">
                          Visit /os dashboard for system overview
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Learning Feed - Right */}
              <div className="lg:col-span-3 space-y-8">
                {/* Module Learning Activity */}
                <ModuleLearningFeed />

                {/* Module CLM Analysis Stream */}
                <div>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Waves className="w-5 h-5 text-primary" />
                    Module Self-Analysis
                    <Badge variant="secondary" className="ml-2">{feed.length}</Badge>
                  </h2>
                  
                  {loading && feed.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : feed.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Waiting for learning cycles...</p>
                      <p className="text-xs mt-2">CLM runs hourly via backend scheduler</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {recentFeed.map((analysis, i) => (
                          <StreamItem key={analysis.id} analysis={analysis} index={i} />
                        ))}
                      </AnimatePresence>
                      
                      {feed.length > 8 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          + {feed.length - 8} more analyses in stream
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
        <EnhancedFooter />
      </div>
    </>
  );
}
