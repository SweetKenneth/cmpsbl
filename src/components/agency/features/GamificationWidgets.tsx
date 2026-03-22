/**
 * GamificationWidgets — XP bars, level badges, achievements, and leaderboards
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  getLevelFromXP, 
  getXPProgress, 
  AGENT_LEVELS, 
  Achievement,
  ACHIEVEMENTS,
  getUnlockedAchievements,
  getNextAchievements,
  getReputationTier,
  REPUTATION_TIERS,
} from '@/lib/agency/gamification';
import { Trophy, Star, Flame, Zap, Award, TrendingUp } from 'lucide-react';

// ============================================================================
// XP BAR
// ============================================================================
interface XPBarProps {
  xp: number;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function XPBar({ xp, showLevel = true, size = 'md', animated = true, className }: XPBarProps) {
  const level = getLevelFromXP(xp);
  const progress = getXPProgress(xp);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  return (
    <div className={cn('space-y-1', className)}>
      {showLevel && (
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{level.badge}</span>
            <span className="font-medium">{level.title}</span>
            <span className="text-muted-foreground">Lv.{level.level}</span>
          </div>
          <span className="text-muted-foreground">
            {progress.current.toLocaleString()} / {progress.required === Infinity ? '∞' : progress.required.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className={cn(
        'relative rounded-full bg-muted overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon-amber via-neon-amber to-neon-amber"
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${Math.min(progress.percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// LEVEL BADGE
// ============================================================================
interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

export function LevelBadge({ level: levelNum, size = 'md', showTitle = false, className }: LevelBadgeProps) {
  const level = AGENT_LEVELS.find(l => l.level === levelNum) || AGENT_LEVELS[0];
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-gradient-to-br from-neon-amber to-orange-600',
          'shadow-lg shadow-neon-amber/30',
          sizeClasses[size]
        )}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <span className="drop-shadow-md">{level.badge}</span>
      </motion.div>
      
      {showTitle && (
        <div>
          <p className="font-semibold">{level.title}</p>
          <p className="text-xs text-muted-foreground">Level {level.level}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================
interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  unlocked = false,
  showDetails = false,
  size = 'md',
  onClick,
  className,
}: AchievementBadgeProps) {
  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    uncommon: 'from-neon-green to-neon-green',
    rare: 'from-neon-blue to-primary',
    epic: 'from-neon-purple to-neon-purple',
    legendary: 'from-neon-amber to-orange-600',
  };
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };
  
  return (
    <motion.div
      className={cn(
        'relative group cursor-pointer',
        !unlocked && 'opacity-50 grayscale',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          'bg-gradient-to-br shadow-lg',
          rarityColors[achievement.rarity],
          sizeClasses[size]
        )}
      >
        <span className="drop-shadow-md">{achievement.icon}</span>
        
        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
            <span className="text-white/80">🔒</span>
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <Star className="w-3 h-3 text-neon-amber" />
              <span>{achievement.xpReward} XP</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// ACHIEVEMENT GRID
// ============================================================================
interface AchievementGridProps {
  metrics: Record<string, number>;
  maxDisplay?: number;
  showLocked?: boolean;
  className?: string;
}

export function AchievementGrid({
  metrics,
  maxDisplay = 12,
  showLocked = true,
  className,
}: AchievementGridProps) {
  const unlocked = getUnlockedAchievements(metrics);
  const unlockedIds = new Set(unlocked.map(a => a.id));
  
  const displayAchievements = showLocked
    ? ACHIEVEMENTS.slice(0, maxDisplay)
    : unlocked.slice(0, maxDisplay);
  
  return (
    <div className={cn('grid grid-cols-4 gap-3', className)}>
      {displayAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={unlockedIds.has(achievement.id)}
          showDetails
          size="md"
        />
      ))}
    </div>
  );
}

// ============================================================================
// STREAK COUNTER
// ============================================================================
interface StreakCounterProps {
  streak: number;
  showFlame?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakCounter({ streak, showFlame = true, size = 'md', className }: StreakCounterProps) {
  const isHot = streak >= 3;
  const isOnFire = streak >= 7;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'bg-gradient-to-r',
        isOnFire 
          ? 'from-neon-amber to-destructive text-white' 
          : isHot 
            ? 'from-neon-amber to-neon-amber text-white'
            : 'from-muted to-muted text-muted-foreground',
        sizeClasses[size],
        className
      )}
      animate={isHot ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      {showFlame && (
        <motion.span
          animate={isOnFire ? { rotate: [-5, 5, -5] } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
        >
          {isOnFire ? '🔥' : isHot ? '⚡' : '✨'}
        </motion.span>
      )}
      <span className="font-bold">{streak}</span>
      <span className="text-sm opacity-80">streak</span>
    </motion.div>
  );
}

// ============================================================================
// REPUTATION BADGE
// ============================================================================
interface ReputationBadgeProps {
  score: number;
  showProgress?: boolean;
  className?: string;
}

export function ReputationBadge({ score, showProgress = true, className }: ReputationBadgeProps) {
  const tier = getReputationTier(score);
  const tierConfig = REPUTATION_TIERS[tier];
  const tiers = Object.entries(REPUTATION_TIERS).sort((a, b) => b[1].minScore - a[1].minScore);
  const nextTier = tiers.find(([, config]) => config.minScore > score);
  const progress = nextTier 
    ? ((score - tierConfig.minScore) / (nextTier[1].minScore - tierConfig.minScore)) * 100
    : 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierConfig.badge}</span>
          <div>
            <p className="font-semibold capitalize">{tier}</p>
            <p className="text-xs text-muted-foreground">{score} reputation</p>
          </div>
        </div>
        
        {nextTier && (
          <div className="text-right text-xs text-muted-foreground">
            <p>Next: {nextTier[0]}</p>
            <p>{nextTier[1].minScore - score} to go</p>
          </div>
        )}
      </div>
      
      {showProgress && nextTier && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              `bg-${tierConfig.color}-500`
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// XP GAIN POPUP
// ============================================================================
interface XPGainPopupProps {
  amount: number;
  reason?: string;
  onComplete?: () => void;
  className?: string;
}

export function XPGainPopup({ amount, reason, onComplete, className }: XPGainPopupProps) {
  return (
    <motion.div
      className={cn(
        'fixed top-20 right-4 z-50',
        'flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-gradient-to-r from-neon-amber to-neon-amber text-white',
        'shadow-lg shadow-neon-amber/30',
        className
      )}
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      onAnimationComplete={() => {
        setTimeout(() => onComplete?.(), 2000);
      }}
    >
      <Star className="w-5 h-5" />
      <span className="font-bold">+{amount} XP</span>
      {reason && <span className="text-sm opacity-80">• {reason}</span>}
    </motion.div>
  );
}

// ============================================================================
// NEXT ACHIEVEMENTS WIDGET
// ============================================================================
interface NextAchievementsProps {
  metrics: Record<string, number>;
  limit?: number;
  className?: string;
}

export function NextAchievements({ metrics, limit = 3, className }: NextAchievementsProps) {
  const nextAchievements = getNextAchievements(metrics, limit);
  
  if (nextAchievements.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Next Achievements
      </h4>
      
      <div className="space-y-2">
        {nextAchievements.map((achievement) => {
          const currentValue = metrics[achievement.requirement.metric] || 0;
          const progress = (currentValue / achievement.requirement.threshold) * 100;
          
          return (
            <div key={achievement.id} className="flex items-center gap-3">
              <span className="text-xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{achievement.name}</p>
                <div className="h-1.5 rounded-full bg-muted mt-1">
                  <div
                    className="h-full rounded-full bg-primary/50"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
