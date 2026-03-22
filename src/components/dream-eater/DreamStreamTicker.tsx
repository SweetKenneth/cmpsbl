/**
 * Dream Stream Ticker
 * 
 * Live feed of anonymous dream/nightmare consumptions.
 * Shows mood transitions without content.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface StreamItem {
  id: string;
  stream_type: string;
  mood_before: string;
  mood_after: string;
  mutation_delta: number;
  created_at: string;
  opted_in_excerpt?: string | null;
}

interface DreamStreamTickerProps {
  maxItems?: number;
  compact?: boolean;
}

export const DreamStreamTicker = ({ maxItems = 5, compact = false }: DreamStreamTickerProps) => {
  const [items, setItems] = useState<StreamItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchStream = async () => {
      const { data } = await supabase
        .from('dream_stream')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxItems);
      
      if (data) {
        setItems(data as StreamItem[]);
      }
    };

    fetchStream();

    // Real-time subscription
    const channel = supabase
      .channel('dream_stream_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dream_stream',
        },
        (payload) => {
          const newItem = payload.new as StreamItem;
          setItems(prev => [newItem, ...prev.slice(0, maxItems - 1)]);
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [maxItems]);

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'moments ago';
    }
  };

  const getMoodEmoji = (mood: string) => {
    const map: Record<string, string> = {
      calm: '🌿',
      curious: '👁',
      agitated: '⚡',
      fractured: '💔',
      dormant: '💤',
      feral: '🔥',
      dreaming: '🌙',
    };
    return map[mood] || '◈';
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground/60 text-sm py-4">
        The stream is quiet...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <motion.div
          className={cn(
            "w-2 h-2 rounded-full",
            isLive ? "bg-neon-green" : "bg-neon-amber"
          )}
          animate={isLive ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="font-mono uppercase tracking-wide">
          {isLive ? 'Live Stream' : 'Reconnecting...'}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              "rounded-lg border transition-colors",
              item.stream_type === 'nightmare' 
                ? 'bg-rose-950/20 border-neon-magenta/30' 
                : 'bg-neon-purple/20 border-neon-purple/30',
              compact ? 'p-2' : 'p-3'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.stream_type === 'nightmare' ? (
                  <Flame className="w-4 h-4 text-neon-magenta" />
                ) : (
                  <Moon className="w-4 h-4 text-neon-purple" />
                )}
                <span className={cn(
                  "font-medium",
                  compact ? 'text-xs' : 'text-sm',
                  item.stream_type === 'nightmare' ? 'text-neon-magenta' : 'text-neon-purple'
                )}>
                  A {item.stream_type} was consumed
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground/60">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{getTimeAgo(item.created_at)}</span>
              </div>
            </div>

            {!compact && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">
                  {getMoodEmoji(item.mood_before)} {item.mood_before}
                </span>
                <span className="text-muted-foreground/40">→</span>
                <span className="font-mono">
                  {getMoodEmoji(item.mood_after)} {item.mood_after}
                </span>
                {item.mutation_delta > 0 && (
                  <span className="ml-auto text-neon-amber/80 font-mono">
                    +{item.mutation_delta} mutation
                  </span>
                )}
              </div>
            )}

            {/* Opted-in excerpt (rare) */}
            {item.opted_in_excerpt && (
              <div className="mt-2 text-xs text-muted-foreground/50 italic border-l-2 border-muted-foreground/20 pl-2">
                "{item.opted_in_excerpt}"
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DreamStreamTicker;
