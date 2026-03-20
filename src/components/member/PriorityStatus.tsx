/**
 * Priority Status — Visual indicator of NEXUS routing priority per tier
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap, Shield, Activity, Gauge, Signal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PRIORITY_CONFIG: Record<string, {
  level: string;
  label: string;
  color: string;
  barWidth: string;
  features: string[];
}> = {
  free: {
    level: 'Standard', label: 'Shared Queue', color: 'text-muted-foreground',
    barWidth: 'w-1/4',
    features: ['Shared routing pool', 'Standard latency', 'Best-effort execution'],
  },
  builder: {
    level: 'Standard', label: 'Shared Queue', color: 'text-muted-foreground',
    barWidth: 'w-1/4',
    features: ['Shared routing pool', 'Standard latency', 'Best-effort execution'],
  },
  creator: {
    level: 'Priority', label: 'Priority Lane', color: 'text-violet-400',
    barWidth: 'w-2/4',
    features: ['Dedicated priority lane', '3× faster routing', 'Queue jump on contention', 'Email support channel'],
  },
  studio: {
    level: 'High Priority', label: 'Express Lane', color: 'text-sky-400',
    barWidth: 'w-3/4',
    features: ['Express routing lane', '5× faster routing', 'Dedicated memory partitions', 'Priority email support'],
  },
  architect: {
    level: 'Maximum', label: 'Dedicated Infrastructure', color: 'text-amber-400',
    barWidth: 'w-full',
    features: ['Dedicated infrastructure', 'Lowest latency guaranteed', 'Isolated memory partitions', 'Full governance controls', 'Dedicated Slack channel'],
  },
  governor: {
    level: 'God Mode', label: 'Zero Limits', color: 'text-primary',
    barWidth: 'w-full',
    features: ['Zero limits', 'Instant routing', 'Full system access', 'All governance controls'],
  },
};

export function PriorityStatus({ tier }: { tier: string }) {
  const config = PRIORITY_CONFIG[tier] || PRIORITY_CONFIG.free;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Routing Priority</h2>
      </div>

      {/* Priority Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/40 bg-card/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">Current Level</span>
          </div>
          <span className={cn("text-lg font-black", config.color)}>{config.level}</span>
        </div>

        {/* Priority bar */}
        <div className="w-full h-3 rounded-full bg-muted/50 border border-border/30 overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn("h-full rounded-full bg-gradient-to-r from-primary/60 to-primary", config.barWidth)}
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>Standard</span>
          <span>Priority</span>
          <span>Express</span>
          <span>Dedicated</span>
        </div>
      </motion.div>

      {/* Current benefits */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Signal className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold">{config.label}</span>
        </div>
        <ul className="space-y-2.5">
          {config.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Live status indicators */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Queue Position', value: tier === 'architect' ? '#1' : tier === 'studio' ? '#2-3' : tier === 'creator' ? '#4-8' : '#9+', icon: Activity },
          { label: 'Avg Latency', value: tier === 'architect' ? '<50ms' : tier === 'studio' ? '<100ms' : tier === 'creator' ? '<200ms' : '<500ms', icon: Gauge },
          { label: 'Uptime SLA', value: tier === 'architect' ? '99.9%' : tier === 'studio' ? '99.7%' : tier === 'creator' ? '99.5%' : 'Best effort', icon: Shield },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="rounded-xl border border-border/40 bg-card/50 p-4 text-center"
          >
            <s.icon className="w-4 h-4 text-primary mx-auto mb-2" />
            <div className="text-lg font-black font-mono">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {tier === 'free' || tier === 'builder' ? (
        <div className="text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/store?tab=plans">
              Upgrade for Priority Routing <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
