/**
 * DECODE Status Bar — Console-style mode/identity/capability display
 * Factory-aligned terminology: primitives, categories, discoveries
 */

import { useDecodeStore, type DecodeMode } from '@/stores/decodeStore';
import { Shield, Terminal, Wrench, HeadphonesIcon } from 'lucide-react';

const MODE_CONFIG: Record<DecodeMode, { icon: typeof Terminal; color: string }> = {
  assistant: { icon: Terminal, color: 'text-primary' },
  support: { icon: HeadphonesIcon, color: 'text-[hsl(var(--neon-cyan))]' },
  builder: { icon: Wrench, color: 'text-[hsl(var(--system-amber))]' },
  governor: { icon: Shield, color: 'text-destructive' },
};

export function DecodeStatusBar() {
  const { mode, identityRole, capabilities } = useDecodeStore();
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  const visibleCaps = capabilities
    .filter(c => !c.governorOnly || mode === 'governor')
    .slice(0, mode === 'governor' ? 7 : 3);

  return (
    <div className="px-4 py-2 border-b border-border/30 bg-muted/30 font-mono text-[10px] leading-tight space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${config.color}`} />
          <span className="font-bold text-foreground tracking-wide">DECODE Agent</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded ${mode === 'governor' ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'} font-semibold uppercase tracking-wider`}>
          {mode}
        </span>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>identity: <span className="text-foreground">{identityRole}</span></span>
        <span className="text-border">|</span>
        <span className="truncate">
          caps: {visibleCaps.map(c => c.label).join(' · ')}
        </span>
      </div>
    </div>
  );
}
