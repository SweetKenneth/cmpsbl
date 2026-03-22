/**
 * Agency Member Card — Displays a cognitive member in the agency
 * Updated for 8 skill dimensions
 */

import { X, Crown, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS, SKILL_DIMENSIONS, type AgencyMember, type SkillDimension } from '@/lib/agency/agencyTypes';

interface AgencyMemberCardProps {
  member: AgencyMember;
  onRemove?: () => void;
  onUpdateSkills?: (skills: AgencyMember['skillWeights']) => void;
  showSkills?: boolean;
  compact?: boolean;
}

export function AgencyMemberCard({ 
  member, 
  onRemove, 
  onUpdateSkills,
  showSkills = false,
  compact = false 
}: AgencyMemberCardProps) {
  const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
  const isLeader = member.role === 'leader';

  const colorClasses: Record<string, string> = {
    fuchsia: 'border-neon-magenta/40 bg-neon-magenta/10 text-neon-magenta',
    violet: 'border-neon-purple/40 bg-neon-purple/10 text-neon-purple',
    cyan: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan',
    emerald: 'border-neon-green/40 bg-neon-green/10 text-neon-green',
    amber: 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber',
    red: 'border-destructive/40 bg-destructive/10 text-destructive',
    pink: 'border-neon-magenta/40 bg-neon-magenta/10 text-neon-magenta',
    green: 'border-neon-green/40 bg-neon-green/10 text-neon-green',
    blue: 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue',
    orange: 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber',
    teal: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan',
    rose: 'border-neon-magenta/40 bg-neon-magenta/10 text-neon-magenta',
    indigo: 'border-primary/40 bg-primary/10 text-primary',
    slate: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
    yellow: 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber',
    stone: 'border-stone-500/40 bg-stone-500/10 text-stone-400',
    lime: 'border-lime-500/40 bg-lime-500/10 text-lime-400',
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
    purple: 'border-neon-purple/40 bg-neon-purple/10 text-neon-purple',
  };

  const colors = colorClasses[spec?.color || 'fuchsia'];

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg border",
        colors
      )}>
        {isLeader && <Crown className="w-3 h-3" />}
        <span className="text-xs font-medium">{spec?.name || member.specialization}</span>
        {onRemove && !isLeader && (
          <button 
            onClick={onRemove}
            className="ml-auto hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-xl border backdrop-blur-xl",
      "bg-white/5 dark:bg-white/[0.03]",
      "border-border/30"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", colors)}>
            {isLeader && <Crown className="w-3 h-3 mr-1" />}
            {spec?.name || member.specialization}
          </Badge>
          {isLeader && (
            <Badge variant="outline" className="text-[9px] h-4 border-neon-amber/50 text-neon-amber">
              Leader
            </Badge>
          )}
        </div>
        {onRemove && !isLeader && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mb-3">
        {spec?.description}
      </p>

      {showSkills && onUpdateSkills && (
        <div className="space-y-2 pt-2 border-t border-border/20">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Skill Weights (8 dimensions)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {SKILL_DIMENSIONS.map((skill) => {
              const skillValue = member.skillWeights?.[skill.id as SkillDimension] ?? 0.5;
              return (
                <div key={skill.id} className="space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">{skill.name}</span>
                    <span className="text-foreground font-medium">{Math.round(skillValue * 100)}%</span>
                  </div>
                  <Slider
                    value={[skillValue * 100]}
                    onValueChange={([val]) => onUpdateSkills({
                      ...member.skillWeights,
                      [skill.id]: val / 100
                    })}
                    max={100}
                    step={5}
                    className="h-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
