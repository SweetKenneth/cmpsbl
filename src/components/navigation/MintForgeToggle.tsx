/**
 * Mint ↔ Forge Toggle — Navigation switch between Agency Mint and Cognitive Forge
 */

import { Link, useLocation } from 'react-router-dom';
import { Users, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MintForgeToggleProps {
  className?: string;
}

export function MintForgeToggle({ className }: MintForgeToggleProps) {
  const location = useLocation();
  const isForge = location.pathname.startsWith('/foundry');
  const isMint = location.pathname === '/store';

  return (
    <div className={cn(
      "flex items-center p-1 rounded-lg bg-card border border-border/50",
      className
    )}>
      <Link
        to="/store"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          isMint
            ? "bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Marketplace</span>
        <span className="sm:hidden">Store</span>
      </Link>
      <Link
        to="/foundry"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          isForge
            ? "bg-neon-amber/20 text-neon-amber border border-neon-amber/40"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <Hammer className="w-4 h-4" />
        <span className="hidden sm:inline">Memory Stream</span>
        <span className="sm:hidden">Stream</span>
      </Link>
    </div>
  );
}
