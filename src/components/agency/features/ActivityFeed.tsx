/**
 * ActivityFeed — Real-time activity timeline showing agent actions
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentAvatar } from './AgentAvatar';
import { getPersonality, getRandomPhrase } from '@/lib/agency/agentPersonalities';
import { Specialization } from '@/lib/agency/agencyTypes';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, FileText, BarChart3, Shield, Zap, CheckCircle, 
  XCircle, Clock, MessageSquare, Lightbulb 
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
export interface ActivityEvent {
  id: string;
  type: 'task_started' | 'task_completed' | 'task_failed' | 'insight' | 'collaboration' | 'learning' | 'message';
  agentSpec: Specialization;
  agentName?: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  showTimestamps?: boolean;
  className?: string;
}

// ============================================================================
// ACTIVITY ICON MAP
// ============================================================================
const getEventIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'task_started': return <Clock className="w-4 h-4" />;
    case 'task_completed': return <CheckCircle className="w-4 h-4 text-neon-green" />;
    case 'task_failed': return <XCircle className="w-4 h-4 text-destructive" />;
    case 'insight': return <Lightbulb className="w-4 h-4 text-neon-amber" />;
    case 'collaboration': return <Zap className="w-4 h-4 text-neon-purple" />;
    case 'learning': return <Search className="w-4 h-4 text-neon-blue" />;
    case 'message': return <MessageSquare className="w-4 h-4 text-neon-cyan" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getEventColor = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'task_started': return 'border-l-neon-amber';
    case 'task_completed': return 'border-l-neon-green';
    case 'task_failed': return 'border-l-destructive';
    case 'insight': return 'border-l-neon-amber';
    case 'collaboration': return 'border-l-neon-purple';
    case 'learning': return 'border-l-neon-blue';
    case 'message': return 'border-l-neon-cyan';
    default: return 'border-l-muted';
  }
};

// ============================================================================
// ACTIVITY ITEM
// ============================================================================
interface ActivityItemProps {
  event: ActivityEvent;
  showTimestamp: boolean;
  isNew?: boolean;
}

function ActivityItem({ event, showTimestamp, isNew }: ActivityItemProps) {
  const personality = getPersonality(event.agentSpec);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'flex gap-3 p-3 rounded-lg border-l-2',
        'bg-card/50 backdrop-blur-sm',
        getEventColor(event.type),
        isNew && 'ring-2 ring-primary/20'
      )}
    >
      {/* Agent Avatar */}
      <AgentAvatar
        specialization={event.agentSpec}
        size="sm"
        state={event.type === 'task_started' ? 'working' : 'idle'}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getEventIcon(event.type)}
            <span className="font-medium text-sm truncate">
              {event.agentName || personality.name}
            </span>
          </div>
          
          {showTimestamp && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
            </span>
          )}
        </div>
        
        <p className="text-sm mt-0.5">{event.title}</p>
        
        {event.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
        
        {/* Metadata badges */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(event.metadata).slice(0, 3).map(([key, value]) => (
              <span
                key={key}
                className="text-xs px-1.5 py-0.5 rounded-md bg-muted"
              >
                {key}: {String(value).slice(0, 20)}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ActivityFeed({
  events,
  maxItems = 20,
  showTimestamps = true,
  className,
}: ActivityFeedProps) {
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const previousEventsRef = useRef<string[]>([]);
  
  // Track new events for highlighting
  useEffect(() => {
    const currentIds = events.map(e => e.id);
    const newIds = currentIds.filter(id => !previousEventsRef.current.includes(id));
    
    if (newIds.length > 0) {
      setNewEventIds(new Set(newIds));
      
      // Clear highlight after animation
      const timer = setTimeout(() => {
        setNewEventIds(new Set());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    previousEventsRef.current = currentIds;
  }, [events]);
  
  const displayEvents = events.slice(0, maxItems);
  
  if (displayEvents.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start a task to see the feed come alive
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode="popLayout">
        {displayEvents.map((event) => (
          <ActivityItem
            key={event.id}
            event={event}
            showTimestamp={showTimestamps}
            isNew={newEventIds.has(event.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LIVE ACTIVITY DOT
// ============================================================================
interface LiveDotProps {
  active: boolean;
  className?: string;
}

export function LiveActivityDot({ active, className }: LiveDotProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <motion.div
        className={cn(
          'w-2 h-2 rounded-full',
          active ? 'bg-neon-green' : 'bg-muted'
        )}
        animate={active ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <span className="text-xs text-muted-foreground">
        {active ? 'Live' : 'Idle'}
      </span>
    </div>
  );
}

// ============================================================================
// COMPACT ACTIVITY LINE
// ============================================================================
interface ActivityLineProps {
  event: ActivityEvent;
  className?: string;
}

export function ActivityLine({ event, className }: ActivityLineProps) {
  const personality = getPersonality(event.agentSpec);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-2 text-xs text-muted-foreground',
        className
      )}
    >
      <span>{personality.avatar}</span>
      <span className="truncate">{event.title}</span>
      <span className="text-muted-foreground/50">
        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
      </span>
    </motion.div>
  );
}
