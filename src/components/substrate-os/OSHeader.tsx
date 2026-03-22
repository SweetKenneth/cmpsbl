/**
 * OS Header — Compact, single-row status bar with essential telemetry
 * Glassmorphic with live indicators. Uses semantic design tokens for theme cohesion.
 */

import { useState, useEffect, memo } from 'react';
import { Activity, Wifi, WifiOff, Cpu, Clock, Terminal, Sparkles, Shield, Crown, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSystemVersion, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DashboardAudio } from './audio';
import { NotificationCenter } from './NotificationCenter';
import type { SubstrateRole } from '@/hooks/useUserRole';

const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="font-mono text-[10px] tabular-nums tracking-wider text-muted-foreground">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
});

function MiniHealthRing({ score, isHealthy, isDegraded }: { score: number; isHealthy: boolean; isDegraded: boolean }) {
  const c = 2 * Math.PI * 10;
  const p = (score / 100) * c;
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/20" />
        <motion.circle
          cx="12" cy="12" r="10" fill="none" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - p }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={cn(isHealthy ? "stroke-neon-green" : isDegraded ? "stroke-neon-amber" : "stroke-destructive")}
        />
      </svg>
      <span className={cn("absolute text-[7px] font-bold font-mono", isHealthy ? "text-neon-green" : isDegraded ? "text-neon-amber" : "text-destructive")}>
        {score}
      </span>
    </div>
  );
}

const ROLE_CONFIG: Record<SubstrateRole, { label: string; border: string; text: string; icon: typeof Terminal }> = {
  governor: { label: 'GOV', border: 'border-destructive/40', text: 'text-destructive', icon: Crown },
  architect: { label: 'ARC', border: 'border-neon-purple/40', text: 'text-neon-purple', icon: Sparkles },
  studio: { label: 'STD', border: 'border-neon-blue/40', text: 'text-neon-blue', icon: Sparkles },
  creator: { label: 'CRT', border: 'border-neon-amber/40', text: 'text-neon-amber', icon: Palette },
  free: { label: 'BLD', border: 'border-primary/40', text: 'text-primary', icon: Activity },
};

interface OSHeaderProps {
  userEmail?: string;
  role: SubstrateRole;
}

export function OSHeader({ userEmail, role }: OSHeaderProps) {
  const systemVersion = useSystemVersion();
  const healthScore = useSubstrateHealthScore();
  const version = useMetric('version');

  const isOnline = !systemVersion.isError;
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.free;
  const RoleIcon = cfg.icon;

  return (
    <motion.header
      className="border-b border-border/20 bg-background/85 backdrop-blur-xl sticky top-0 z-50"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="h-11 sm:h-12 px-3 sm:px-4 flex items-center gap-3 sm:gap-4">
        {/* Left: Brand + Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Brand mark */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-neon-purple/10 border border-primary/30 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>

          {/* Title - desktop only */}
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold glow-text">Memory Stream</span>
              <span className="text-[9px] font-mono text-muted-foreground/40">v{version}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-border/20" />

          {/* Connection + Health */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-neon-green" />
              ) : (
                <WifiOff className="w-3 h-3 text-destructive" />
              )}
              <span className={cn("text-[9px] font-mono uppercase tracking-wider hidden md:inline", isOnline ? "text-neon-green/70" : "text-destructive/70")}>
                {isOnline ? 'LIVE' : 'OFF'}
              </span>
            </div>

            <MiniHealthRing score={healthScore.healthScore} isHealthy={healthScore.isHealthy} isDegraded={healthScore.isDegraded} />

            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
              <Cpu className="w-3 h-3" />
              <span>{healthScore.activeCount}/{healthScore.totalModules}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <NotificationCenter />
          <DashboardAudio />

          {/* Role badge */}
          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-background/50", cfg.border)}>
            <RoleIcon className={cn("w-3 h-3", cfg.text)} />
            <span className={cn("text-[9px] font-bold font-mono", cfg.text)}>{cfg.label}</span>
          </div>

          {/* Session */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/20 border border-border/20">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[10px] font-mono text-foreground/80 max-w-[80px] truncate">
              {userEmail?.split('@')[0] || 'anon'}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground/40" />
            <LiveClock />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
