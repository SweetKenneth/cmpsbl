/**
 * INTENT Mesh Communications Feed
 * Live view of translated node-to-node communications
 * Shows what nodes are actually saying to each other in INTENT-voice
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pause, Play, Trash2, ArrowRight } from 'lucide-react';
import { generateLiveCommEvent, type MeshCommEvent, type SignalCategory } from '@/lib/substrate/intent-mesh/intent-voice';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_EVENTS = 40;
const EMIT_INTERVAL_MS = 2800;

const CATEGORY_STYLES: Record<SignalCategory, { badge: string; glow: string }> = {
  acknowledgement: { badge: 'bg-primary/15 text-primary border-primary/30', glow: 'border-l-primary/60' },
  approval: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', glow: 'border-l-emerald-500/60' },
  confirmation: { badge: 'bg-primary/15 text-primary border-primary/30', glow: 'border-l-primary/60' },
  denial: { badge: 'bg-destructive/15 text-destructive border-destructive/30', glow: 'border-l-destructive/60' },
  processing: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', glow: 'border-l-amber-500/60' },
  completion: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', glow: 'border-l-emerald-500/60' },
  warning: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', glow: 'border-l-amber-500/60' },
  escalation: { badge: 'bg-destructive/15 text-destructive border-destructive/30', glow: 'border-l-destructive/60' },
  discovery: { badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30', glow: 'border-l-violet-500/60' },
  heartbeat: { badge: 'bg-muted text-muted-foreground border-border', glow: 'border-l-muted-foreground/40' },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function IntentMeshCommsFeed() {
  const [events, setEvents] = useState<MeshCommEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback(() => {
    const ev = generateLiveCommEvent();
    setEvents(prev => [ev, ...prev].slice(0, MAX_EVENTS));
  }, []);

  useEffect(() => {
    if (paused) return;
    // Seed a few events immediately
    const seed = Array.from({ length: 5 }, () => generateLiveCommEvent());
    setEvents(prev => [...seed, ...prev].slice(0, MAX_EVENTS));

    const interval = setInterval(addEvent, EMIT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paused, addEvent]);

  const handleClear = () => setEvents([]);

  return (
    <Card className="hover:border-primary/15 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Mesh Communications
          </CardTitle>
          <CardDescription className="mt-1">
            Live node-to-node dialogue — translated into INTENT-voice
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPaused(!paused)}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClear}
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Badge variant="outline" className="text-xs tabular-nums">
            {events.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const style = CATEGORY_STYLES[ev.category];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`
                    border-l-2 ${style.glow}
                    p-2.5 rounded-r-md bg-muted/20 hover:bg-muted/40
                    transition-colors duration-200 group
                  `}
                >
                  {/* Header: Source → Target + Time */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono font-semibold text-foreground">{ev.sourceModule}</span>
                      {ev.targetModule && (
                        <>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono font-semibold text-foreground">{ev.targetModule}</span>
                        </>
                      )}
                      <Badge className={`text-[10px] px-1.5 py-0 border ${style.badge}`}>
                        {ev.category}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                      {formatTime(ev.timestamp)}
                    </span>
                  </div>

                  {/* Translated INTENT voice */}
                  <p className="text-sm text-foreground leading-snug">
                    {ev.translatedVoice}
                  </p>

                  {/* Raw signal + resolver (on hover) */}
                  <div className="flex items-center gap-2 mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <code className="text-[10px] font-mono text-muted-foreground">
                      raw: {ev.rawSignal}
                    </code>
                    {ev.resolverId && (
                      <code className="text-[10px] font-mono text-muted-foreground">
                        via {ev.resolverId}
                      </code>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {events.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No communications yet. The mesh is silent.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
