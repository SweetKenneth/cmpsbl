/**
 * System Integrity — 40-Primitive / 12-Sector Topology
 * Read-only dashboard: health %, breaker state, zone isolation
 */

import { memo } from 'react';
import { Shield, Activity, Cpu, Layers, Network, Lock, Unlock, AlertTriangle, Globe, Zap, Brain, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { getAllBreakerStates, getBreaker, getCircuitBreakerSummary } from '@/lib/substrate/circuit-breaker';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LayerDef {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  members: { key: string; label: string }[];
}

const LAYERS: LayerDef[] = [
  {
    id: 'organs',
    label: 'Organs (12)',
    description: 'Internal infrastructure sustaining the substrate',
    icon: Cpu,
    color: 'amber',
    members: [
      { key: 'core', label: 'CORE' },
      { key: 'system', label: 'SYSTEM' },
      { key: 'nerve', label: 'NERVE' },
      { key: 'ripple', label: 'RIPPLE' },
      { key: 'relay', label: 'RELAY' },
      { key: 'identity', label: 'IDENTITY' },
      { key: 'access', label: 'ACCESS' },
      { key: 'nexus', label: 'NEXUS' },
      { key: 'audit', label: 'AUDIT' },
      { key: 'integration', label: 'INTEGRATION' },
      { key: 'brain', label: 'BRAIN' },
      { key: 'memory', label: 'MEMORY' },
    ],
  },
  {
    id: 'layers',
    label: 'Layers (8)',
    description: 'Ambient overlays that protect and govern',
    icon: Layers,
    color: 'cyan',
    members: [
      { key: 'defense', label: 'DEFENSE' },
      { key: 'immunity', label: 'IMMUNITY' },
      { key: 'governance', label: 'GOVERNANCE' },
      { key: 'intent', label: 'INTENT' },
      { key: 'evolution', label: 'EVOLUTION' },
      { key: 'inclusive', label: 'INCLUSIVE' },
      { key: 'conscience', label: 'CONSCIENCE' },
      { key: 'treaty', label: 'TREATY' },
    ],
  },
  {
    id: 'engines',
    label: 'Engines (10)',
    description: 'Invoked processing powerhouses',
    icon: Zap,
    color: 'emerald',
    members: [
      { key: 'dream', label: 'DREAM' },
      { key: 'cortex', label: 'CORTEX' },
      { key: 'oracle', label: 'ORACLE' },
      { key: 'forge', label: 'FORGE' },
      { key: 'compass', label: 'COMPASS' },
      { key: 'atlas', label: 'ATLAS' },
      { key: 'economy', label: 'ECONOMY' },
      { key: 'sandbox', label: 'SANDBOX' },
      { key: 'medic', label: 'MEDIC' },
      { key: 'reflex', label: 'REFLEX' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents (10)',
    description: 'Autonomous actors that decide and act',
    icon: Brain,
    color: 'violet',
    members: [
      { key: 'encode', label: 'ENCODE' },
      { key: 'decode', label: 'DECODE' },
      { key: 'vision', label: 'VISION' },
      { key: 'phantom', label: 'PHANTOM' },
      { key: 'lingua', label: 'LINGUA' },
      { key: 'echo', label: 'ECHO' },
      { key: 'harvest', label: 'HARVEST' },
      { key: 'sovereign', label: 'SOVEREIGN' },
      { key: 'engineer', label: 'ENGINEER' },
      { key: 'oracle', label: 'ORACLE' },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; progress: string }> = {
  cyan: { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30', text: 'text-neon-cyan', progress: '[&>div]:bg-neon-cyan' },
  violet: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', text: 'text-neon-purple', progress: '[&>div]:bg-neon-purple' },
  blue: { bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', text: 'text-neon-blue', progress: '[&>div]:bg-neon-blue' },
  emerald: { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green', progress: '[&>div]:bg-neon-green' },
  amber: { bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', text: 'text-neon-amber', progress: '[&>div]:bg-neon-amber' },
  red: { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', progress: '[&>div]:bg-destructive' },
};

function ZoneRow({ moduleKey, label, modules }: { moduleKey: string; label: string; modules: Record<string, number> }) {
  const breaker = getBreaker(moduleKey);
  const isHealthy = (modules[moduleKey] ?? 100) >= 50;
  const stateLabel = breaker.state === 'closed' ? 'Closed' : breaker.state === 'open' ? 'Open' : 'Half-Open';

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/10 border border-border/10">
      <div className={cn(
        "w-2 h-2 rounded-full shrink-0",
        isHealthy ? "bg-neon-green" : "bg-destructive",
        isHealthy && "animate-pulse"
      )} />
      <span className="text-xs font-mono font-medium text-foreground flex-1">{label}</span>
      <Badge variant="outline" className={cn(
        "text-[9px] h-5 gap-1",
        breaker.state === 'closed' 
          ? "border-neon-green/30 text-neon-green bg-neon-green/10"
          : breaker.state === 'open'
          ? "border-destructive/30 text-destructive bg-destructive/10"
          : "border-neon-amber/30 text-neon-amber bg-neon-amber/10"
      )}>
        {breaker.state === 'closed' ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
        {stateLabel}
      </Badge>
      {breaker.failures > 0 && (
        <span className="text-[9px] text-destructive font-mono">{breaker.failures}f</span>
      )}
      <span className={cn(
        "text-[10px] font-mono font-semibold w-10 text-right",
        isHealthy ? "text-neon-green" : "text-destructive"
      )}>
        {isHealthy ? '100%' : '0%'}
      </span>
    </div>
  );
}

const LayerCard = memo(function LayerCard({ 
  layer, health, modules 
}: { 
  layer: LayerDef; 
  health: number; 
  modules: Record<string, number>;
}) {
  const colors = colorMap[layer.color] || colorMap.cyan;
  const Icon = layer.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/20 bg-card/50 backdrop-blur-sm glass-edge card-lift transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg border flex items-center justify-center",
                colors.bg, colors.border
              )}>
                <Icon className={cn("w-4 h-4", colors.text)} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">{layer.label}</CardTitle>
                <p className="text-[10px] text-muted-foreground/60 font-mono">{layer.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-xl font-black font-mono",
                health >= 80 ? "text-neon-green" : health >= 40 ? "text-neon-amber" : "text-destructive"
              )}>
                {health}%
              </div>
              <div className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">Health</div>
            </div>
          </div>
          <Progress value={health} className={cn("h-1 mt-3 bg-muted/20", colors.progress)} />
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {layer.members.map(m => (
            <ZoneRow key={m.key} moduleKey={m.key} label={m.label} modules={modules} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default function SystemIntegrity() {
  const health = useSubstrateHealthScore();
  const breakerSummary = getCircuitBreakerSummary();

  const layerHealthMap: Record<string, number> = {
    kernel: health.layers?.core ?? 100,
    ccr: health.layers?.ccr ?? 100,
    ocg: health.layers?.ocg ?? 100,
    execution: health.layers?.surfaces ?? 100,
    esz: health.layers?.expansion ?? 100,
    epz: health.layers?.mesh ?? 100,
    emz: 100,
    csz: 100,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="System Integrity — CMPSBL Substrate"
        description="Real-time integrity map showing health, safety switch states, and zone isolation across all 40 primitives and 4 categories of the CMPSBL substrate."
        noindex
      />

      <PublicNav />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-5xl space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">System Integrity</h1>
              <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">
                40 Primitives · 4 Categories · {breakerSummary.totalTrips} total trips
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Real-time structural health of the CMPSBL substrate. Each node reports availability, correctness, and performance 
            through the 3-lane integrity model. Safety switches protect against cascade failures.
          </p>
        </motion.div>

        {/* Global Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Total Primitives', value: '40', color: 'cyan' },
            { label: 'Categories', value: '4', color: 'violet' },
            { label: 'Breakers Open', value: String(breakerSummary.open), color: breakerSummary.open > 0 ? 'red' : 'emerald' },
            { label: 'Integrity', value: `${health.isDown ? '0' : '100'}%`, color: health.isDown ? 'red' : 'emerald' },
          ].map(item => {
            const colors = colorMap[item.color] || colorMap.cyan;
            return (
              <div key={item.label} className={cn(
                "rounded-xl border px-4 py-3 text-center",
                colors.bg, colors.border
              )}>
                <div className={cn("text-lg font-black font-mono", colors.text)}>{item.value}</div>
                <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">{item.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Critical Warning */}
        {(health.isDown || breakerSummary.open > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Integrity Degraded</p>
              <p className="text-xs text-muted-foreground">
                {breakerSummary.open} safety switch{breakerSummary.open !== 1 ? 'es' : ''} open
                {breakerSummary.unhealthy.length > 0 && ` · Affected: ${breakerSummary.unhealthy.join(', ')}`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Layer Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={layer.id === 'csz' ? 'md:col-span-2' : ''}
            >
              <LayerCard
                layer={layer}
                health={layerHealthMap[layer.id] ?? 100}
                modules={health.modules}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[9px] text-muted-foreground/30 font-mono uppercase tracking-widest pb-8">
          System Integrity Map · 40 Primitives · 4 Categories · Read-Only · No Mutation Endpoints
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
