/**
 * SkillTree — Visual representation of agent skill progression
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SKILL_DIMENSIONS, SkillWeights, Specialization } from '@/lib/agency/agencyTypes';
import { getPersonality } from '@/lib/agency/agentPersonalities';

// ============================================================================
// RADAR CHART
// ============================================================================
interface SkillRadarProps {
  skills: SkillWeights;
  previousSkills?: SkillWeights;
  specialization?: Specialization;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
  className?: string;
}

export function SkillRadar({
  skills,
  previousSkills,
  specialization,
  size = 200,
  showLabels = true,
  animated = true,
  className,
}: SkillRadarProps) {
  const personality = specialization ? getPersonality(specialization) : null;
  const dimensions = SKILL_DIMENSIONS;
  const angleStep = (2 * Math.PI) / dimensions.length;
  const center = size / 2;
  const maxRadius = (size / 2) - (showLabels ? 30 : 10);
  
  // Generate polygon points for a skill set
  const getPolygonPoints = (skillSet: SkillWeights): string => {
    return dimensions
      .map((dim, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = skillSet[dim.id as keyof SkillWeights] || 0;
        const radius = value * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };
  
  // Generate grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];
  
  return (
    <div className={cn('relative', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={maxRadius * level}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/30"
          />
        ))}
        
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/30"
            />
          );
        })}
        
        {/* Previous skills (ghost) */}
        {previousSkills && (
          <polygon
            points={getPolygonPoints(previousSkills)}
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-muted-foreground"
          />
        )}
        
        {/* Current skills */}
        <motion.polygon
          points={getPolygonPoints(skills)}
          fill={`url(#skillGradient)`}
          fillOpacity="0.3"
          stroke={personality ? `var(--${personality.color}-500)` : 'currentColor'}
          strokeWidth="2"
          className={!personality ? 'text-primary' : ''}
          initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Skill points */}
        {dimensions.map((dim, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const value = skills[dim.id as keyof SkillWeights] || 0;
          const radius = value * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          
          return (
            <motion.circle
              key={dim.id}
              cx={x}
              cy={y}
              r="4"
              fill={personality ? `var(--${personality.color}-500)` : 'currentColor'}
              className={!personality ? 'text-primary' : ''}
              initial={animated ? { scale: 0 } : undefined}
              animate={animated ? { scale: 1 } : undefined}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            />
          );
        })}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={personality ? `var(--${personality.color}-500)` : 'var(--primary)'} />
            <stop offset="100%" stopColor={personality ? `var(--${personality.color}-600)` : 'var(--primary)'} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Labels */}
      {showLabels && (
        <div className="absolute inset-0">
          {dimensions.map((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = maxRadius + 20;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            const value = Math.round((skills[dim.id as keyof SkillWeights] || 0) * 100);
            
            return (
              <div
                key={dim.id}
                className="absolute text-xs font-medium transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <span className="text-muted-foreground">{dim.name}</span>
                <span className="ml-1 text-foreground">{value}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKILL BARS
// ============================================================================
interface SkillBarsProps {
  skills: SkillWeights;
  previousSkills?: SkillWeights;
  specialization?: Specialization;
  compact?: boolean;
  className?: string;
}

export function SkillBars({
  skills,
  previousSkills,
  specialization,
  compact = false,
  className,
}: SkillBarsProps) {
  const personality = specialization ? getPersonality(specialization) : null;
  
  return (
    <div className={cn('space-y-2', className)}>
      {SKILL_DIMENSIONS.map((dim) => {
        const value = skills[dim.id as keyof SkillWeights] || 0;
        const prevValue = previousSkills?.[dim.id as keyof SkillWeights] || 0;
        const change = value - prevValue;
        const percentage = Math.round(value * 100);
        
        return (
          <div key={dim.id} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={cn(
                'text-muted-foreground',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {dim.name}
              </span>
              <div className="flex items-center gap-1">
                <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
                  {percentage}%
                </span>
                {change !== 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: change > 0 ? 5 : -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'text-xs font-medium',
                      change > 0 ? 'text-neon-green' : 'text-destructive'
                    )}
                  >
                    {change > 0 ? '+' : ''}{Math.round(change * 100)}%
                  </motion.span>
                )}
              </div>
            </div>
            
            <div className={cn(
              'relative rounded-full bg-muted overflow-hidden',
              compact ? 'h-1.5' : 'h-2'
            )}>
              {/* Previous value indicator */}
              {previousSkills && prevValue > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                  style={{ width: `${prevValue * 100}%` }}
                />
              )}
              
              {/* Current value */}
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  personality 
                    ? `bg-gradient-to-r ${personality.gradientFrom} ${personality.gradientTo}`
                    : 'bg-primary'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SKILL GROWTH CHART
// ============================================================================
interface SkillGrowthProps {
  history: { date: string; skills: SkillWeights }[];
  skillId: keyof SkillWeights;
  specialization?: Specialization;
  height?: number;
  className?: string;
}

export function SkillGrowthChart({
  history,
  skillId,
  specialization,
  height = 100,
  className,
}: SkillGrowthProps) {
  const personality = specialization ? getPersonality(specialization) : null;
  const values = history.map(h => h.skills[skillId] || 0);
  const maxValue = Math.max(...values, 1);
  const width = 300;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Generate path
  const points = values.map((v, i) => ({
    x: padding + (i / (values.length - 1)) * chartWidth,
    y: height - padding - (v / maxValue) * chartHeight,
  }));
  
  const pathD = points.reduce((d, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${d} L ${p.x} ${p.y}`;
  }, '');
  
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <line
            key={level}
            x1={padding}
            y1={height - padding - level * chartHeight}
            x2={width - padding}
            y2={height - padding - level * chartHeight}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-border/30"
          />
        ))}
        
        {/* Area fill */}
        <motion.path
          d={areaD}
          fill={`url(#growthGradient)`}
          fillOpacity="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={personality ? `var(--${personality.color}-500)` : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={!personality ? 'text-primary' : ''}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        
        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={personality ? `var(--${personality.color}-500)` : 'currentColor'}
            className={!personality ? 'text-primary' : ''}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
        
        {/* Gradient */}
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={personality ? `var(--${personality.color}-500)` : 'var(--primary)'} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-5">
        <span>{history[0]?.date || ''}</span>
        <span>{history[history.length - 1]?.date || ''}</span>
      </div>
    </div>
  );
}
