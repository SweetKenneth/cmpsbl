/**
 * LockedDiscoveryTeaser — Blurred discovery cards shown to free-tier users
 * who've hit their daily pull limit. Drives upgrade conversion.
 */

import { motion } from 'framer-motion';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LockedDiscoveryTeaserProps {
  tier?: string;
  pullsUsed: number;
  pullsMax: number;
  className?: string;
}

const TEASER_DISCOVERIES = [
  { name: 'Recursive Sentiment Cascade', score: 87, rarity: 'Prime', nodes: ['BRAIN', 'ECHO', 'ORACLE'] },
  { name: 'Zero-Shot Classification Router', score: 92, rarity: 'Relic', nodes: ['CORTEX', 'LINGUA', 'INTENT'] },
  { name: 'Autonomous Drift Corrector', score: 95, rarity: 'Mythic', nodes: ['EVOLUTION', 'COMPASS', 'REFLEX'] },
];

const RARITY_COLORS: Record<string, string> = {
  Prime: 'text-neon-blue',
  Relic: 'text-neon-purple',
  Mythic: 'text-neon-amber',
};

export function LockedDiscoveryTeaser({ tier = 'starter', pullsUsed, pullsMax, className = '' }: LockedDiscoveryTeaserProps) {
  const navigate = useNavigate();

  const nextTierName = tier === 'starter' ? 'Creator' : tier === 'creator' ? 'Studio' : 'Architect';
  const nextTierPulls = tier === 'starter' ? 9 : tier === 'creator' ? 6 : 12;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>
            {pullsUsed}/{pullsMax} pulls used today
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary hover:text-primary/80"
          onClick={() => navigate('/store?tab=plans')}
        >
          Unlock more <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Blurred discovery cards */}
      {TEASER_DISCOVERIES.map((discovery, i) => (
        <motion.div
          key={discovery.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative group cursor-pointer"
          onClick={() => navigate('/store?tab=plans')}
        >
          {/* Blurred card */}
          <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 select-none pointer-events-none blur-[3px] opacity-60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{discovery.name}</span>
              <span className={`text-xs font-mono font-bold ${RARITY_COLORS[discovery.rarity] || 'text-muted-foreground'}`}>
                {discovery.rarity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  style={{ width: `${discovery.score}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{discovery.score}</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {discovery.nodes.map(node => (
                <span key={node} className="text-[10px] px-1.5 py-0.5 bg-muted/20 rounded text-muted-foreground font-mono">
                  {labelPrimitive(node)}
                </span>
              ))}
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border/50 rounded-lg shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Upgrade to unlock</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Upgrade nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
      >
        <p className="text-sm font-medium text-foreground mb-1">
          {nextTierName} unlocks {nextTierPulls} daily pulls
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          More pulls = more discoveries = more crystallized intelligence
        </p>
        <Button
          size="sm"
          onClick={() => navigate('/store?tab=plans')}
          className="w-full"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Upgrade to {nextTierName}
        </Button>
      </motion.div>
    </div>
  );
}
