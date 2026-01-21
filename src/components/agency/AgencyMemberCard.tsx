/**
 * Agency Member Card — Displays a cognitive member in the agency
 */

import { X, Crown, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS, type AgencyMember } from '@/lib/agency/agencyTypes';

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
        <div className="space-y-3 pt-2 border-t border-border/20">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Skill Weights</span>
          </div>
          
          {(['research', 'analysis', 'execution'] as const).map((skill) => (
            <div key={skill} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground capitalize">{skill}</span>
                <span className="text-foreground">{Math.round(member.skillWeights[skill] * 100)}%</span>
              </div>
              <Slider
                value={[member.skillWeights[skill] * 100]}
                onValueChange={([val]) => onUpdateSkills({
                  ...member.skillWeights,
                  [skill]: val / 100
                })}
                max={100}
                step={5}
                className="h-1"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
