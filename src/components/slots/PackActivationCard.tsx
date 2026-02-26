/**
 * PackActivationCard — Pack card with activate/deactivate toggle
 * Shows real-time slot feedback. Smooth animations via framer-motion.
 */
import { useState } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ArtifactPack } from '@/lib/quarry/types';
import type { SlotState } from '@/hooks/useArtifactSlots';

interface PackActivationCardProps {
  pack: ArtifactPack;
  slotState: SlotState;
  onActivate: (packId: string) => Promise<void>;
  onDeactivate: (packId: string) => Promise<void>;
  onSlotPressure: (packName: string) => void;
  className?: string;
}

export function PackActivationCard({
  pack,
  slotState,
  onActivate,
  onDeactivate,
  onSlotPressure,
  className,
}: PackActivationCardProps) {
  const [loading, setLoading] = useState(false);
  const isActive = slotState.isPackActive(pack.id);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        if (slotState.atCapacity) {
          onSlotPressure(pack.name);
          return;
        }
        await onActivate(pack.id);
      } else {
        await onDeactivate(pack.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card
        className={cn(
          'h-full transition-all duration-300',
          isActive
            ? 'border-primary/40 ring-1 ring-primary/10 bg-primary/[0.02]'
            : 'border-border/50 hover:border-border',
        )}
      >
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm truncate">{pack.name}</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">{pack.version}</Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggle}
                  aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${pack.name}`}
                />
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {pack.description}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground/70 italic line-clamp-1">{pack.useCase}</p>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5',
                isActive ? 'text-primary border-primary/30' : 'text-muted-foreground',
              )}
            >
              <Package className="w-3 h-3 mr-1" />
              {isActive ? 'Active' : '1 slot'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
