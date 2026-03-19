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
  const isForge = location.pathname.startsWith('/forge');
  const isMint = location.pathname === '/agency';

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
            ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Marketplace</span>
        <span className="sm:hidden">Store</span>
      </Link>
      <Link
        to="/forge"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          isForge
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <Hammer className="w-4 h-4" />
        <span className="hidden sm:inline">Cognitive Forge</span>
        <span className="sm:hidden">Forge</span>
      </Link>
    </div>
  );
}
