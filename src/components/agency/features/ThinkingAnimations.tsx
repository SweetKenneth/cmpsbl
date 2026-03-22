/**
 * ThinkingAnimations — Agent thinking/processing micro-animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPersonality } from '@/lib/agency/agentPersonalities';
import { Specialization } from '@/lib/agency/agencyTypes';
import { Brain, Search, FileText, Zap, Sparkles, Loader2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
export type ThinkingState = 
  | 'idle' 
  | 'thinking' 
  | 'researching' 
  | 'analyzing' 
  | 'writing' 
  | 'processing'
  | 'learning';

interface ThinkingAnimationProps {
  state: ThinkingState;
  specialization?: Specialization;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// THINKING DOTS
// ============================================================================
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// BRAIN PULSE
// ============================================================================
export function BrainPulse({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };
  
  return (
    <div className={cn('relative flex items-center justify-center', sizes[size], className)}>
      {/* Pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: [1, 1.5 + ring * 0.3],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: ring * 0.3,
          }}
        />
      ))}
      
      {/* Core icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Brain className={cn(iconSizes[size], 'text-primary')} />
      </motion.div>
    </div>
  );
}

// ============================================================================
// PROCESSING SPINNER
// ============================================================================
export function ProcessingSpinner({ state, className }: { state: ThinkingState; className?: string }) {
  const stateConfig = {
    idle: { icon: Sparkles, color: 'text-muted-foreground' },
    thinking: { icon: Brain, color: 'text-neon-purple' },
    researching: { icon: Search, color: 'text-neon-blue' },
    analyzing: { icon: Zap, color: 'text-neon-amber' },
    writing: { icon: FileText, color: 'text-neon-green' },
    processing: { icon: Loader2, color: 'text-primary' },
    learning: { icon: Sparkles, color: 'text-neon-magenta' },
  };
  
  const { icon: Icon, color } = stateConfig[state];
  
  return (
    <motion.div
      className={cn('relative w-12 h-12', className)}
      animate={{ rotate: state === 'processing' ? 360 : 0 }}
      transition={{ duration: 1, repeat: state === 'processing' ? Infinity : 0, ease: 'linear' }}
    >
      {/* Background circle */}
      <svg className="w-full h-full" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/30"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={color}
          strokeDasharray="126"
          animate={{
            strokeDashoffset: state === 'idle' ? 126 : [126, 0],
          }}
          transition={{
            duration: 2,
            repeat: state === 'idle' ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={cn('w-5 h-5', color)} />
      </div>
    </motion.div>
  );
}

// ============================================================================
// AGENT THINKING CARD
// ============================================================================
interface AgentThinkingCardProps {
  specialization: Specialization;
  state: ThinkingState;
  currentAction?: string;
  progress?: number;
  className?: string;
}

export function AgentThinkingCard({
  specialization,
  state,
  currentAction,
  progress,
  className,
}: AgentThinkingCardProps) {
  const personality = getPersonality(specialization);
  
  const stateLabels: Record<ThinkingState, string> = {
    idle: 'Ready',
    thinking: 'Thinking...',
    researching: 'Researching...',
    analyzing: 'Analyzing...',
    writing: 'Writing...',
    processing: 'Processing...',
    learning: 'Learning...',
  };
  
  const stateColors: Record<ThinkingState, string> = {
    idle: 'bg-muted/30',
    thinking: 'bg-neon-purple/10 border-neon-purple/30',
    researching: 'bg-neon-blue/10 border-neon-blue/30',
    analyzing: 'bg-neon-amber/10 border-neon-amber/30',
    writing: 'bg-neon-green/10 border-neon-green/30',
    processing: 'bg-primary/10 border-primary/30',
    learning: 'bg-neon-magenta/10 border-neon-magenta/30',
  };
  
  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm transition-colors',
        stateColors[state],
        className
      )}
      animate={state !== 'idle' ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Avatar with animation */}
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
          {personality.avatar}
        </div>
        
        {state !== 'idle' && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <ThinkingDots className="scale-50" />
          </motion.div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{personality.name}</span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            state === 'idle' ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'
          )}>
            {stateLabels[state]}
          </span>
        </div>
        
        {currentAction && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {currentAction}
          </p>
        )}
        
        {/* Progress bar */}
        {progress !== undefined && state !== 'idle' && (
          <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// TYPING INDICATOR
// ============================================================================
export function TypingIndicator({ agentName, className }: { agentName?: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}
    >
      <span>{agentName || 'Agent'} is typing</span>
      <ThinkingDots />
    </motion.div>
  );
}

// ============================================================================
// FLOATING THOUGHT BUBBLE
// ============================================================================
interface ThoughtBubbleProps {
  thought: string;
  specialization?: Specialization;
  onDismiss?: () => void;
  className?: string;
}

export function ThoughtBubble({ thought, specialization, onDismiss, className }: ThoughtBubbleProps) {
  const personality = specialization ? getPersonality(specialization) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className={cn(
        'absolute -top-16 left-1/2 -translate-x-1/2',
        'px-3 py-1.5 rounded-full',
        'bg-card/90 border border-border/50 backdrop-blur-sm shadow-lg',
        'text-xs text-muted-foreground',
        'whitespace-nowrap',
        className
      )}
      onClick={onDismiss}
    >
      {personality && <span className="mr-1">{personality.avatar}</span>}
      "{thought}"
      
      {/* Bubble pointer */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card/90 border-r border-b border-border/50 rotate-45" />
    </motion.div>
  );
}

// ============================================================================
// MAIN THINKING ANIMATION
// ============================================================================
export function ThinkingAnimation({
  state,
  specialization,
  message,
  size = 'md',
  className,
}: ThinkingAnimationProps) {
  if (state === 'idle') return null;
  
  const sizeClasses = {
    sm: 'p-2 gap-2',
    md: 'p-3 gap-3',
    lg: 'p-4 gap-4',
  };
  
  const personality = specialization ? getPersonality(specialization) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm',
        sizeClasses[size],
        className
      )}
    >
      <ProcessingSpinner state={state} className={size === 'sm' ? 'w-8 h-8' : undefined} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {personality && <span className="text-lg">{personality.avatar}</span>}
          <span className="text-sm font-medium capitalize">{state.replace('_', ' ')}</span>
        </div>
        
        {message && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// COLLABORATIVE THINKING
// ============================================================================
interface CollaborativeThinkingProps {
  agents: Array<{ specialization: Specialization; state: ThinkingState }>;
  className?: string;
}

export function CollaborativeThinking({ agents, className }: CollaborativeThinkingProps) {
  const activeAgents = agents.filter(a => a.state !== 'idle');
  
  if (activeAgents.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="flex -space-x-2">
        {activeAgents.slice(0, 3).map((agent, i) => {
          const personality = getPersonality(agent.specialization);
          return (
            <motion.div
              key={agent.specialization}
              className="w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center text-sm"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            >
              {personality.avatar}
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>
          {activeAgents.length === 1 
            ? `${getPersonality(activeAgents[0].specialization).name} is working`
            : `${activeAgents.length} agents collaborating`
          }
        </span>
        <ThinkingDots />
      </div>
    </motion.div>
  );
}
