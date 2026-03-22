/**
 * AgentAvatar — Animated agent avatar with personality-driven states
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPersonality, AgentMood } from '@/lib/agency/agentPersonalities';
import { Specialization } from '@/lib/agency/agencyTypes';

interface AgentAvatarProps {
  specialization: Specialization;
  state?: 'idle' | 'working' | 'thinking' | 'success' | 'error';
  mood?: AgentMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

export function AgentAvatar({
  specialization,
  state = 'idle',
  mood,
  size = 'md',
  showStatus = false,
  className,
}: AgentAvatarProps) {
  const personality = getPersonality(specialization);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  };
  
  const statusColors = {
    idle: 'bg-slate-400',
    working: 'bg-neon-green',
    thinking: 'bg-neon-amber',
    success: 'bg-neon-green',
    error: 'bg-destructive',
  };
  
  const animationVariants = {
    idle: { scale: 1 },
    working: { 
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    thinking: { 
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 0.8 }
    },
    success: { 
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 }
    },
    error: { 
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.4 }
    },
  };
  
  const glowIntensity = mood?.energy ? Math.min(mood.energy / 100, 1) : 0.5;
  
  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-md opacity-50',
          `bg-gradient-to-br ${personality.gradientFrom} ${personality.gradientTo}`
        )}
        style={{ opacity: glowIntensity * 0.5 }}
      />
      
      {/* Main avatar */}
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-gradient-to-br backdrop-blur-sm',
          personality.gradientFrom,
          personality.gradientTo,
          sizeClasses[size]
        )}
        variants={animationVariants}
        animate={state}
        initial="idle"
      >
        <span className="drop-shadow-lg">{personality.avatar}</span>
        
        {/* Energy ring */}
        {mood && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${mood.energy * 2.83} 283`}
              className="text-white/30"
            />
          </svg>
        )}
      </motion.div>
      
      {/* Status indicator */}
      {showStatus && (
        <motion.div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background',
            statusColors[state],
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
          )}
          animate={state === 'working' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
      
      {/* Streak badge */}
      {mood && mood.streak >= 3 && (
        <motion.div
          className="absolute -top-1 -right-1 bg-neon-amber text-white text-xs font-bold rounded-full px-1.5 py-0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          🔥{mood.streak}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// THINKING INDICATOR
// ============================================================================
interface ThinkingIndicatorProps {
  specialization: Specialization;
  message?: string;
  className?: string;
}

export function ThinkingIndicator({ specialization, message, className }: ThinkingIndicatorProps) {
  const personality = getPersonality(specialization);
  const thinkingPhrase = message || personality.thinkingPhrases[
    Math.floor(Math.random() * personality.thinkingPhrases.length)
  ];
  
  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl',
        'bg-muted/50 backdrop-blur-sm border border-border/50',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <AgentAvatar specialization={specialization} state="thinking" size="sm" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{thinkingPhrase}</p>
        
        {/* Animated dots */}
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                `bg-${personality.color}-500`
              )}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// AGENT CARD PREVIEW
// ============================================================================
interface AgentCardProps {
  specialization: Specialization;
  name?: string;
  level?: number;
  xp?: number;
  status?: 'idle' | 'working' | 'thinking';
  tasksCompleted?: number;
  className?: string;
  onClick?: () => void;
}

export function AgentCard({
  specialization,
  name,
  level = 1,
  xp = 0,
  status = 'idle',
  tasksCompleted = 0,
  className,
  onClick,
}: AgentCardProps) {
  const personality = getPersonality(specialization);
  const levelProgress = xp % 100; // Simplified
  
  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-2xl overflow-hidden cursor-pointer',
        'bg-gradient-to-br from-background to-muted/50',
        'border border-border/50 hover:border-border',
        'transition-all duration-300',
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Gradient accent */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          `bg-gradient-to-r ${personality.gradientFrom} ${personality.gradientTo}`
        )}
      />
      
      <div className="flex items-start gap-3">
        <AgentAvatar
          specialization={specialization}
          state={status}
          size="lg"
          showStatus
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {name || personality.name}
            </h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">
              Lv.{level}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            {specialization}
          </p>
          
          {/* XP Progress */}
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  `bg-gradient-to-r ${personality.gradientFrom} ${personality.gradientTo}`
                )}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>✅ {tasksCompleted} tasks</span>
            {status === 'working' && (
              <motion.span
                className="text-neon-green"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ● Working
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
