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
    fuchsia: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400',
    violet: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/40 bg-red-500/10 text-red-400',
    pink: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
    green: 'border-green-500/40 bg-green-500/10 text-green-400',
    blue: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    orange: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    teal: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
    rose: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
    slate: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
    yellow: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    stone: 'border-stone-500/40 bg-stone-500/10 text-stone-400',
    lime: 'border-lime-500/40 bg-lime-500/10 text-lime-400',
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
    purple: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
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
            className="ml-auto hover:text-red-400 transition-colors"
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
            <Badge variant="outline" className="text-[9px] h-4 border-amber-500/50 text-amber-400">
              Leader
            </Badge>
          )}
        </div>
        {onRemove && !isLeader && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-red-400"
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
