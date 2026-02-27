/**
 * PackDetailModal — Full artifact pack details without any text truncation.
 * Shows skills, capabilities, importance, and use case in a scrollable modal.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Package, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtifactPack } from '@/lib/quarry/types';
import type { SlotState } from '@/hooks/useArtifactSlots';
import { useState } from 'react';

interface PackDetailModalProps {
  pack: ArtifactPack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotState: SlotState;
  onActivate: (packId: string) => Promise<void>;
  onDeactivate: (packId: string) => Promise<void>;
  onSlotPressure: (packName: string) => void;
}

export function PackDetailModal({
  pack,
  open,
  onOpenChange,
  slotState,
  onActivate,
  onDeactivate,
  onSlotPressure,
}: PackDetailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!pack) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isActive ? "bg-primary/10" : "bg-muted"
            )}>
              <Package className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold">{pack.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5">{pack.version}</Badge>
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={cn("text-[10px] px-1.5", isActive && "bg-primary")}
                >
                  {isActive ? 'Active' : '1 slot'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Description — full text, no truncation */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5 text-foreground">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pack.description}
            </p>
          </div>

          {/* Use Case */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5 text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Use Case
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pack.useCase}
            </p>
          </div>

          {/* Skills & Capabilities */}
          {pack.skills && pack.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Skills &amp; Capabilities
              </h4>
              <ul className="space-y-1.5">
                {pack.skills.map((skill, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergence Clause / Why It Matters */}
          {pack.emergenceClause && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <h4 className="text-sm font-semibold mb-1.5 text-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Why This Pack Matters
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pack.emergenceClause}
              </p>
            </div>
          )}

          {/* Activation Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <p className="text-sm font-semibold">{isActive ? 'Pack Active' : 'Activate Pack'}</p>
              <p className="text-xs text-muted-foreground">
                {slotState.remaining} of {slotState.capacity} slots remaining
              </p>
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${pack.name}`}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
