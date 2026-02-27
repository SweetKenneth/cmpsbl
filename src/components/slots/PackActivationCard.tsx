/**
 * PackActivationCard — Pack card with activate/deactivate toggle
 * No text truncation. Clicking card opens detail modal.
 */
import { useState } from 'react';
import { Package, Loader2, Info } from 'lucide-react';
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
  onViewDetails?: (pack: ArtifactPack) => void;
  className?: string;
}

export function PackActivationCard({
  pack,
  slotState,
  onActivate,
  onDeactivate,
  onSlotPressure,
  onViewDetails,
  className,
}: PackActivationCardProps) {
  const [loading, setLoading] = useState(false);
  const isActive = slotState.isPackActive(pack.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (!isActive) {
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

  const handleSwitchChange = async (checked: boolean) => {
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
          'h-full transition-all duration-300 cursor-pointer group',
          isActive
            ? 'border-primary/40 ring-1 ring-primary/10 bg-primary/[0.02]'
            : 'border-border/50 hover:border-border',
        )}
        onClick={() => onViewDetails?.(pack)}
      >
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm">{pack.name}</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">{pack.version}</Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  checked={isActive}
                  onCheckedChange={handleSwitchChange}
                  aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${pack.name}`}
                />
              )}
            </div>
          </div>

          {/* Short preview — 2 lines max, click for full details */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {pack.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors group-hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onViewDetails?.(pack); }}
            >
              <Info className="w-3 h-3" />
              View full details
            </button>
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
