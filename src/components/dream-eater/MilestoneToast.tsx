/**
 * Milestone Toast
 * 
 * Animated notification when mutation milestones are reached.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Eye, Layers, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  milestone_level: number;
  milestone_name: string;
  description?: string;
}

interface MilestoneToastProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

const MILESTONE_ICONS: Record<number, React.ElementType> = {
  10: Eye,
  25: Layers,
  50: Sparkles,
  100: Key,
};

const MILESTONE_COLORS: Record<number, string> = {
  10: 'from-neon-purple/30 to-primary/20 border-neon-purple/50',
  25: 'from-neon-green/30 to-neon-cyan/20 border-neon-green/50',
  50: 'from-neon-amber/30 to-neon-amber/20 border-neon-amber/50',
  100: 'from-neon-magenta/30 to-neon-magenta/20 border-neon-magenta/50',
};

export const MilestoneToast = ({ milestone, onDismiss }: MilestoneToastProps) => {
  if (!milestone) return null;

  const Icon = MILESTONE_ICONS[milestone.milestone_level] || Trophy;
  const colorClass = MILESTONE_COLORS[milestone.milestone_level] || 'from-primary/30 to-primary/20 border-primary/50';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
          "rounded-2xl border-2 p-6 backdrop-blur-xl",
          "bg-gradient-to-br",
          colorClass
        )}
        onClick={onDismiss}
        role="alert"
      >
        {/* Burst effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.5)' }}
          animate={{ boxShadow: '0 0 60px 20px rgba(139, 92, 246, 0)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <div className="flex items-center gap-4">
          {/* Icon with animation */}
          <motion.div
            className="w-14 h-14 rounded-full bg-background/50 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Icon className="w-8 h-8 text-foreground" />
          </motion.div>

          <div>
            <motion.div
              className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Milestone Unlocked
            </motion.div>
            <motion.h3
              className="text-xl font-bold text-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {milestone.milestone_name}
            </motion.h3>
            {milestone.description && (
              <motion.p
                className="text-sm text-muted-foreground mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {milestone.description}
              </motion.p>
            )}
          </div>

          {/* Level badge */}
          <motion.div
            className="ml-4 w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            <span className="font-mono font-bold text-foreground">
              {milestone.milestone_level}
            </span>
          </motion.div>
        </div>

        {/* Dismiss hint */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          tap to dismiss
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MilestoneToast;
