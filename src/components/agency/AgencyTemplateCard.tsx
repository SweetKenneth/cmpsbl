/**
 * Agency Template Card — Template selector for agency mint
 */

import { Rocket, TrendingUp, Settings, Lightbulb, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgencyTemplate } from '@/lib/agency/agencyTypes';

const ICONS: Record<string, React.ElementType> = {
  Rocket,
  TrendingUp,
  Settings,
  Lightbulb,
  Shield,
  Users,
};

interface AgencyTemplateCardProps {
  template: AgencyTemplate;
  selected: boolean;
  onSelect: () => void;
}

export function AgencyTemplateCard({ template, selected, onSelect }: AgencyTemplateCardProps) {
  const Icon = ICONS[template.icon] || Users;
  const memberCount = template.defaultMembers.length;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all duration-300 rounded-xl p-4",
        "backdrop-blur-xl bg-muted/50 dark:bg-white/[0.03]",
        "border hover:shadow-lg",
        selected
          ? "border-neon-magenta/60 shadow-neon-magenta/20 bg-neon-magenta/10"
          : "border-border/30 hover:border-neon-magenta/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          "border",
          selected
            ? "bg-neon-magenta/30 border-neon-magenta/50"
            : "bg-neon-magenta/10 border-neon-magenta/30"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            selected ? "text-neon-magenta" : "text-neon-magenta"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm text-foreground">{template.name}</h3>
            {template.isFeatured && (
              <Badge variant="outline" className="text-[9px] h-4 border-neon-amber/50 text-neon-amber">
                Featured
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] h-5 bg-background/50">
              {memberCount} agents
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 border-neon-cyan/30 text-neon-cyan">
              {template.dreamPoolMode.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
