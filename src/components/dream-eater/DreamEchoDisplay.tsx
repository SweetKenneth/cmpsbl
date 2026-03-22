/**
 * Dream Echo Display
 * 
 * Shows cryptic echo response after dream submission.
 * Non-replayable, appears once.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DreamEchoDisplayProps {
  echo: string | null;
  mood: string;
  onDismiss?: () => void;
}

export const DreamEchoDisplay = ({ echo, mood, onDismiss }: DreamEchoDisplayProps) => {
  if (!echo) return null;

  const getMoodGradient = () => {
    switch (mood) {
      case 'calm': return 'from-neon-green/20 to-neon-cyan/10';
      case 'curious': return 'from-neon-purple/20 to-primary/10';
      case 'agitated': return 'from-neon-amber/20 to-neon-amber/10';
      case 'fractured': return 'from-destructive/20 to-neon-purple/10';
      case 'feral': return 'from-neon-magenta/20 to-destructive/10';
      case 'dormant': return 'from-gray-500/20 to-slate-500/10';
      default: return 'from-neon-purple/20 to-primary/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          "relative rounded-xl p-6 border border-border/30",
          "bg-gradient-to-br backdrop-blur-sm",
          getMoodGradient()
        )}
        onClick={onDismiss}
        role="alert"
        aria-live="polite"
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-muted-foreground/30" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-muted-foreground/30" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-muted-foreground/30" />

        {/* Echo text */}
        <motion.p
          className="text-center text-lg md:text-xl font-serif italic text-foreground/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          "{echo}"
        </motion.p>

        {/* Subtle attribution */}
        <motion.div
          className="mt-4 text-center text-xs text-muted-foreground/50 font-mono uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          — The Dream-Eater
        </motion.div>

        {/* Dismiss hint */}
        {onDismiss && (
          <motion.div
            className="absolute bottom-1 right-3 text-[10px] text-muted-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            tap to dismiss
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamEchoDisplay;
