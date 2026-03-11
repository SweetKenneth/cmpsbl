/**
 * INTENT Mesh Communications Feed — v2.0
 * Live node-to-node dialogue with per-node personality indicators
 * Shows what nodes are actually saying in their unique INTENT-voice
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pause, Play, Trash2, ArrowRight, Filter } from 'lucide-react';
import {
  generateLiveCommEvent,
  getNodePersonality,
  type MeshCommEvent,
  type SignalCategory,
} from '@/lib/substrate/intent-mesh/intent-voice';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_EVENTS = 50;
const EMIT_INTERVAL_MS = 2400;

const CATEGORY_COLORS: Record<SignalCategory, { border: string; badge: string }> = {
  acknowledgement: { border: 'border-l-primary/50',       badge: 'bg-primary/10 text-primary border-primary/20' },
  approval:        { border: 'border-l-emerald-500/60',    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  confirmation:    { border: 'border-l-sky-500/50',        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  denial:          { border: 'border-l-destructive/60',    badge: 'bg-destructive/10 text-destructive border-destructive/20' },
  processing:      { border: 'border-l-amber-500/50',      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completion:      { border: 'border-l-emerald-500/60',    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  warning:         { border: 'border-l-orange-500/60',     badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  escalation:      { border: 'border-l-rose-500/60',       badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  discovery:       { border: 'border-l-violet-500/50',     badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  heartbeat:       { border: 'border-l-muted-foreground/30', badge: 'bg-muted text-muted-foreground border-border' },
};

const CATEGORY_LABELS: Record<SignalCategory, string> = {
  acknowledgement: 'ACK',
  approval: 'APPROVED',
  confirmation: 'CONFIRMED',
  denial: 'DENIED',
  processing: 'ACTIVE',
  completion: 'COMPLETE',
  warning: 'WARN',
  escalation: 'ESCALATE',
  discovery: 'DISCOVER',
  heartbeat: 'PULSE',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function NodeIcon({ module }: { module: string }) {
  const p = getNodePersonality(module);
  if (!p) return null;
  return (
    <span className="text-sm leading-none select-none" title={p.trait}>
      {p.icon}
    </span>
  );
}

export function IntentMeshCommsFeed() {
  const [events, setEvents] = useState<MeshCommEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const addEvent = useCallback(() => {
    setEvents(prev => [generateLiveCommEvent(), ...prev].slice(0, MAX_EVENTS));
  }, []);

  useEffect(() => {
    if (paused) return;
    const seed = Array.from({ length: 6 }, () => generateLiveCommEvent());
    setEvents(prev => [...seed, ...prev].slice(0, MAX_EVENTS));
    const interval = setInterval(addEvent, EMIT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paused, addEvent]);

  // Count by category for mini-stats
  const categoryCounts = events.reduce<Partial<Record<SignalCategory, number>>>((acc, ev) => {
    acc[ev.category] = (acc[ev.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="hover:border-primary/15 transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary shrink-0" />
              Mesh Communications
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Real-time node dialogue — each node speaks with its own personality
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowRaw(!showRaw)}
              title={showRaw ? 'Hide raw signals' : 'Show raw signals'}
            >
              <Filter className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPaused(!paused)}
              title={paused ? 'Resume feed' : 'Pause feed'}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEvents([])}
              title="Clear feed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Mini category bar */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {Object.entries(categoryCounts)
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            .slice(0, 6)
            .map(([cat, count]) => (
              <Badge
                key={cat}
                variant="outline"
                className={`text-[10px] px-1.5 py-0 border ${CATEGORY_COLORS[cat as SignalCategory]?.badge}`}
              >
                {CATEGORY_LABELS[cat as SignalCategory]} {count}
              </Badge>
            ))}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 tabular-nums">
            {events.length} total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-0.5">
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const colors = CATEGORY_COLORS[ev.category];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div
                    className={`
                      border-l-2 ${colors.border}
                      py-2 px-2.5 rounded-r-md
                      bg-muted/15 hover:bg-muted/35
                      transition-colors duration-150 group
                    `}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs">
                        <NodeIcon module={ev.sourceModule} />
                        <span className="font-mono font-semibold text-foreground truncate">
                          {ev.sourceModule}
                        </span>
                        {ev.targetModule && (
                          <>
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <NodeIcon module={ev.targetModule} />
                            <span className="font-mono font-semibold text-foreground truncate">
                              {ev.targetModule}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1 py-0 border leading-tight ${colors.badge}`}
                        >
                          {CATEGORY_LABELS[ev.category]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/70 tabular-nums font-mono">
                          {formatTime(ev.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Personality trait */}
                    {ev.personality && (
                      <p className="text-[10px] text-muted-foreground/60 italic mb-0.5">
                        {ev.personality.trait}
                      </p>
                    )}

                    {/* Translated voice — the main content */}
                    <p className="text-[13px] text-foreground/90 leading-snug">
                      {ev.translatedVoice}
                    </p>

                    {/* Raw signal + resolver (toggleable or on hover) */}
                    {(showRaw || false) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/50">
                        <code className="font-mono">⟨{ev.rawSignal}⟩</code>
                        {ev.resolverId && (
                          <code className="font-mono">via {ev.resolverId}</code>
                        )}
                      </div>
                    )}
                    {!showRaw && (
                      <div className="flex items-center gap-2 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground/40">
                        <code className="font-mono">⟨{ev.rawSignal}⟩</code>
                        {ev.resolverId && (
                          <code className="font-mono">via {ev.resolverId}</code>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {events.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              The mesh is silent. No communications to display.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
