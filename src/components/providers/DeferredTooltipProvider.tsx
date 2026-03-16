/**
 * DeferredTooltipProvider — Renders children immediately, loads Radix TooltipProvider lazily.
 * This prevents the ~40KB radix UI chunk from blocking initial render.
 * Tooltips are hover-only interactions so deferring them has zero UX impact.
 */
import { ReactNode, useEffect, useState, ComponentType } from 'react';

interface Props {
  children: ReactNode;
}

export default function DeferredTooltipProvider({ children }: Props) {
  const [Provider, setProvider] = useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    import('@/components/ui/tooltip').then(m => {
      setProvider(() => m.TooltipProvider as ComponentType<{ children: ReactNode }>);
    });
  }, []);

  if (Provider) {
    return <Provider>{children}</Provider>;
  }

  return <>{children}</>;
}
