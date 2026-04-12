/**
 * PersistentRadioPlayer — Always-mounted radio widget
 * Lives at App level so it survives all route transitions.
 * Renders a small floating radio toggle + expandable panel.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useClocklessRadio } from '@/hooks/useClocklessRadio';
import { RADIO_TRACKS } from '@/lib/clockless-radio';

export function PersistentRadioPlayer() {
  const radio = useClocklessRadio();
  const [isExpanded, setIsExpanded] = useState(false);

  return createPortal(
    <>
      {/* Floating toggle — bottom-right on mobile, hidden when nav has its own toggle */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={cn(
          "fixed z-[9997] bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center",
          "bg-card border border-border shadow-lg backdrop-blur-xl",
          "hover:scale-105 active:scale-95 transition-all",
          radio.isPlaying && "border-primary/50 shadow-primary/20"
        )}
        aria-label="Toggle Clockless Radio"
      >
        <Radio className={cn("w-5 h-5", radio.isPlaying ? "text-primary animate-pulse" : "text-muted-foreground")} />
        {radio.isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
        )}
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "fixed z-[10000]",
                "inset-4 m-auto sm:inset-auto sm:bottom-36 sm:right-4",
                "w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto",
                "p-4 rounded-xl",
                "bg-card backdrop-blur-xl border border-border/50",
                "shadow-xl shadow-black/20"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-primary/20 to-accent/20",
                  "border border-primary/30"
                )}>
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide">CLOCKLESS RADIO</h4>
                  <p className="text-[10px] text-muted-foreground">
                    {radio.isDJSpeaking ? 'AI DJ Live' : radio.isPlaying ? 'Now Playing' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* DJ Interjection */}
              <AnimatePresence>
                {radio.djContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                      {radio.djContent.type === 'call_in' ? `📞 ${radio.djContent.caller}` : '🎙 AI DJ'}
                    </p>
                    <p className="text-xs text-foreground/80 italic leading-relaxed">
                      "{radio.djContent.text}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Track */}
              {radio.currentTrack && (
                <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-primary truncate">{radio.currentTrack.title}</p>
                  <p className="text-[9px] text-muted-foreground">Clockless Radio • CMPSBL</p>
                </div>
              )}

              {/* Track List */}
              <div className="space-y-1 mb-4 max-h-[200px] overflow-y-auto pr-1">
                {RADIO_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-2.5 p-1.5 rounded-lg transition-all text-xs",
                      radio.currentTrack?.id === track.id
                        ? "bg-primary/15 border border-primary/30 text-primary font-medium"
                        : "border border-transparent opacity-60"
                    )}
                  >
                    {radio.currentTrack?.id === track.id && radio.isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3 w-4 shrink-0">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{
                            height: `${40 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.15}s`,
                          }} />
                        ))}
                      </div>
                    ) : (
                      <Play className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{track.title}</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={radio.toggle} className="h-10 w-10 rounded-full">
                  {radio.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={radio.skip} className="h-8 w-8" disabled={!radio.isPlaying}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[radio.volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => radio.setVolume(v / 100)}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
