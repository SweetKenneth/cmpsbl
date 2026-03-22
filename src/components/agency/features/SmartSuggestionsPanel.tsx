/**
 * SmartSuggestionsPanel — AI-powered suggestions and quick replies
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  SmartSuggestion, 
  QuickReply,
  generateSuggestions,
  generateQuickReplies,
  SuggestionContext,
} from '@/lib/agency/smartSuggestions';
import { AgencyTask } from '@/lib/agency/agencyTasks';
import { Specialization } from '@/lib/agency/agencyTypes';
import { 
  Lightbulb, Zap, TrendingUp, Settings, Play, 
  ArrowRight, Sparkles, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// SUGGESTION CARD
// ============================================================================
interface SuggestionCardProps {
  suggestion: SmartSuggestion;
  onAction: (suggestion: SmartSuggestion) => void;
  compact?: boolean;
  className?: string;
}

function SuggestionCard({ suggestion, onAction, compact = false, className }: SuggestionCardProps) {
  const priorityColors = {
    high: 'border-l-neon-amber bg-neon-amber/5',
    medium: 'border-l-neon-blue bg-neon-blue/5',
    low: 'border-l-muted bg-muted/30',
  };
  
  const typeIcons = {
    follow_up: <ArrowRight className="w-4 h-4" />,
    next_action: <Play className="w-4 h-4" />,
    optimization: <TrendingUp className="w-4 h-4" />,
    insight: <Lightbulb className="w-4 h-4" />,
    workflow: <Zap className="w-4 h-4" />,
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-lg border-l-2 p-3 transition-colors hover:bg-accent/50',
        priorityColors[suggestion.priority],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background shadow-sm">
          <span className="text-lg">{suggestion.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {typeIcons[suggestion.type]}
            <h4 className="font-medium text-sm">{suggestion.title}</h4>
          </div>
          
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {suggestion.description}
            </p>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={() => onAction(suggestion)}
        >
          {suggestion.actionLabel}
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUGGESTIONS PANEL
// ============================================================================
interface SuggestionsPanelProps {
  recentTasks: AgencyTask[];
  teamSpecs: Specialization[];
  agencyMetrics?: {
    successRate: number;
    avgTaskTime: number;
    topSkills: string[];
  };
  onAction: (suggestion: SmartSuggestion) => void;
  maxSuggestions?: number;
  className?: string;
}

export function SuggestionsPanel({
  recentTasks,
  teamSpecs,
  agencyMetrics,
  onAction,
  maxSuggestions = 3,
  className,
}: SuggestionsPanelProps) {
  const context: SuggestionContext = {
    recentTasks,
    teamSpecs,
    agencyMetrics,
    currentTime: new Date(),
  };
  
  const suggestions = generateSuggestions(context).slice(0, maxSuggestions);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-neon-amber" />
        <span className="font-medium">Suggested Actions</span>
      </div>
      
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAction={onAction}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// QUICK REPLIES
// ============================================================================
interface QuickRepliesProps {
  lastTask?: AgencyTask;
  lastMessage?: string;
  teamSpecs: Specialization[];
  onSelect: (reply: QuickReply) => void;
  className?: string;
}

export function QuickReplies({
  lastTask,
  lastMessage,
  teamSpecs,
  onSelect,
  className,
}: QuickRepliesProps) {
  const replies = generateQuickReplies({ lastTask, lastMessage, teamSpecs });
  
  if (replies.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {replies.map((reply) => (
        <motion.button
          key={reply.id}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            'text-sm bg-muted hover:bg-accent transition-colors',
            'border border-border/50'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(reply)}
        >
          <span>{reply.icon}</span>
          <span>{reply.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// INLINE SUGGESTION CHIP
// ============================================================================
interface SuggestionChipProps {
  suggestion: SmartSuggestion;
  onClick: () => void;
  className?: string;
}

export function SuggestionChip({ suggestion, onClick, className }: SuggestionChipProps) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        'text-xs bg-primary/10 text-primary hover:bg-primary/20',
        'transition-colors',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <span>{suggestion.icon}</span>
      <span>{suggestion.actionLabel}</span>
    </motion.button>
  );
}

// ============================================================================
// FLOATING SUGGESTION BUBBLE
// ============================================================================
interface FloatingSuggestionProps {
  suggestion: SmartSuggestion;
  onAction: () => void;
  onDismiss: () => void;
  className?: string;
}

export function FloatingSuggestion({
  suggestion,
  onAction,
  onDismiss,
  className,
}: FloatingSuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        'fixed bottom-24 right-4 z-40',
        'max-w-sm p-4 rounded-2xl shadow-xl',
        'bg-card border border-border',
        'backdrop-blur-xl',
        className
      )}
    >
      <button
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs hover:bg-accent"
        onClick={onDismiss}
      >
        ✕
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <span className="text-xl">{suggestion.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-neon-amber" />
            <span className="text-xs text-muted-foreground">Suggestion</span>
          </div>
          
          <h4 className="font-medium text-sm">{suggestion.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {suggestion.description}
          </p>
          
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={onAction}
          >
            {suggestion.actionLabel}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
