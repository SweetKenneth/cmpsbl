/**
 * Rate Limit Feedback UI — Gap #24
 * Visual feedback when API rate limits are hit
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateLimitEvent {
  endpoint: string;
  retryAfter?: number;
}

// Global event bus for rate limit events
const listeners = new Set<(evt: RateLimitEvent) => void>();

export function emitRateLimitEvent(evt: RateLimitEvent) {
  listeners.forEach(fn => fn(evt));
}

export function RateLimitFeedback() {
  const [event, setEvent] = useState<RateLimitEvent | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const handler = (evt: RateLimitEvent) => {
      setEvent(evt);
      setCountdown(evt.retryAfter || 30);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      if (event) setEvent(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, event]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-card border border-destructive/30 rounded-xl shadow-xl p-4 flex items-center gap-3 max-w-md"
        >
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Rate limit reached</p>
            <p className="text-xs text-muted-foreground truncate">
              Too many requests to {event.endpoint}
            </p>
          </div>
          {countdown > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {countdown}s
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
