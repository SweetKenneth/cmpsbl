/**
 * CMPSBL World Engine Status Widget
 * v10.5.4 — ARCHITECT Epoch compact status indicator
 */

import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubstrateContext } from './SubstrateProvider';

interface SubstrateStatusProps {
  compact?: boolean;
}

export function SubstrateStatus({ compact = false }: SubstrateStatusProps) {
  const { initialized, overallHealth, modules } = useSubstrateContext();

  const activeCount = Object.values(modules).filter(m => m.active).length;
  const totalModules = 21; // v10.5.4: All 21 modules
  const isHealthy = overallHealth >= 80;

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={`gap-1.5 ${isHealthy ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}
      >
        <Activity className="h-3 w-3" />
        {activeCount}/{totalModules}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isHealthy ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
      <span className="text-muted-foreground">
        CMPSBL World Engine: {activeCount}/{totalModules} modules
      </span>
      <Badge variant="outline" className="text-xs">
        v10.5.4
      </Badge>
    </div>
  );
}
